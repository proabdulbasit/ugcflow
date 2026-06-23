import { Router } from 'express';
import { Message, User, Campaign, CampaignApplication, CampaignCreator } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { hasCampaignRelationship, notifyNewMessage } from '../services/notifications.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const messages = await Message.find({
    $or: [{ senderId: userId }, { recipientId: userId }],
  })
    .sort({ createdAt: -1 })
    .limit(100);

  const enriched = await Promise.all(
    messages.map(async (m) => {
      const sender = await User.findById(m.senderId);
      const recipient = await User.findById(m.recipientId);
      return {
        id: m._id.toString(),
        subject: m.subject,
        body: m.body,
        createdAt: m.createdAt,
        isMine: m.senderId.toString() === userId,
        sender: sender
          ? { id: sender._id.toString(), fullName: sender.fullName, email: sender.email, role: sender.role }
          : null,
        recipient: recipient
          ? { id: recipient._id.toString(), fullName: recipient.fullName, email: recipient.email, role: recipient.role }
          : null,
      };
    })
  );

  return res.json({ messages: enriched });
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const senderId = req.user!.userId;
    const { recipientId, subject, body } = req.body as {
      recipientId: string;
      subject?: string;
      body: string;
    };

    if (!recipientId?.trim()) return res.status(400).json({ error: 'recipientId required' });
    if (!body?.trim()) return res.status(400).json({ error: 'body required' });

    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    if (req.user!.role !== 'admin') {
      if (sender?.role === 'brand' && recipient.role !== 'creator') {
        return res.status(403).json({ error: 'Brands can only message creators' });
      }
      if (sender?.role === 'creator' && recipient.role !== 'brand') {
        return res.status(403).json({ error: 'Creators can only message brands' });
      }
      const related = await hasCampaignRelationship(senderId, recipientId);
      if (!related) {
        return res.status(403).json({
          error: 'You can only message users connected through a campaign application or assignment.',
        });
      }
    }

    const message = await Message.create({
      senderId,
      recipientId,
      subject: subject?.trim() || undefined,
      body: body.trim(),
    });

    notifyNewMessage(recipientId, senderId, subject?.trim() || '', body.trim());

    return res.status(201).json({
      message: {
        id: message._id.toString(),
        subject: message.subject,
        body: message.body,
        createdAt: message.createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/contacts', requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const role = req.user!.role;

  if (role === 'admin') {
    const users = await User.find({ role: { $in: ['brand', 'creator'] } }).limit(200);
    return res.json({
      contacts: users.map((u) => ({
        id: u._id.toString(),
        fullName: u.fullName,
        email: u.email,
        role: u.role,
      })),
    });
  }

  // Brands see creators who applied to their campaigns; creators see those brands
  const contactIds = new Set<string>();

  if (role === 'brand') {
    const campaigns = await Campaign.find({ brandId: userId }).select('_id');
    const ids = campaigns.map((c) => c._id);
    const apps = await CampaignApplication.find({ campaignId: { $in: ids } });
    const assigned = await CampaignCreator.find({ campaignId: { $in: ids } });
    apps.forEach((a) => contactIds.add(a.creatorId.toString()));
    assigned.forEach((a) => contactIds.add(a.creatorId.toString()));
  } else if (role === 'creator') {
    const apps = await CampaignApplication.find({ creatorId: userId });
    const assigned = await CampaignCreator.find({ creatorId: userId });
    const campaignIds = [...apps.map((a) => a.campaignId), ...assigned.map((a) => a.campaignId)];
    const campaigns = await Campaign.find({ _id: { $in: campaignIds } });
    campaigns.forEach((c) => contactIds.add(c.brandId.toString()));
  }

  const contacts = await User.find({ _id: { $in: [...contactIds] } });
  return res.json({
    contacts: contacts.map((u) => ({
      id: u._id.toString(),
      fullName: u.fullName,
      email: u.email,
      role: u.role,
    })),
  });
});

export default router;
