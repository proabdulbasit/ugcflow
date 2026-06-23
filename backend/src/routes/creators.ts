import { Router } from 'express';
import {
  Creator,
  User,
  Campaign,
  CampaignApplication,
  CampaignCreator,
  CreatorEarning,
  Deliverable,
  Brand,
} from '../models/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { creatorPrivateProfile } from '../services/creatorVisibility.js';
import { notifyCreatorApproved, notifyCreatorApplied } from '../services/notifications.js';

const router = Router();

router.get('/overview', requireAuth, requireRole('creator'), async (req, res) => {
  const creatorId = req.user!.userId;
  const assignments = await CampaignCreator.countDocuments({ creatorId });
  const earnings = await CreatorEarning.find({ creatorId });
  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const assignmentCampaignIds = (
    await CampaignCreator.find({ creatorId }).select('campaignId')
  ).map((a) => a.campaignId);
  const pendingDeliverables = await Deliverable.countDocuments({
    creatorId,
    status: 'pending',
  });

  return res.json({
    activeAssignments: assignments,
    totalEarnings,
    pendingDeliverables,
  });
});

router.get('/browse', requireAuth, requireRole('creator'), async (req, res) => {
  const creator = await Creator.findById(req.user!.userId);
  if (creator?.status !== 'approved') {
    return res.status(403).json({ error: 'Your creator account must be approved to browse jobs.' });
  }

  const campaigns = await Campaign.find({ status: 'active' }).sort({ createdAt: -1 });
  const applications = await CampaignApplication.find({ creatorId: req.user!.userId });
  const appliedIds = new Set(applications.map((a) => a.campaignId.toString()));

  const enriched = await Promise.all(
    campaigns.map(async (c) => {
      const brand = await Brand.findById(c.brandId);
      return {
        ...c.toObject(),
        id: c._id.toString(),
        hasApplied: appliedIds.has(c._id.toString()),
        brands: brand ? { company_name: brand.companyName } : null,
      };
    })
  );

  return res.json({ campaigns: enriched });
});

router.post('/applications', requireAuth, requireRole('creator'), async (req, res) => {
  try {
    const { campaignId } = req.body as { campaignId: string };
    if (!campaignId) return res.status(400).json({ error: 'campaignId required' });

    const creator = await Creator.findById(req.user!.userId);
    if (creator?.status !== 'approved') {
      return res.status(403).json({ error: 'Creator must be approved to apply' });
    }

    const existing = await CampaignApplication.findOne({
      campaignId,
      creatorId: req.user!.userId,
    });
    if (existing) return res.status(409).json({ error: 'Already applied' });

    const application = await CampaignApplication.create({
      campaignId,
      creatorId: req.user!.userId,
      status: 'pending',
    });

    notifyCreatorApplied(campaignId, req.user!.userId);

    return res.status(201).json({ application });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: 'Already applied' });
    return res.status(500).json({ error: err.message });
  }
});

router.get('/assignments', requireAuth, requireRole('creator'), async (req, res) => {
  const creatorId = req.user!.userId;
  const links = await CampaignCreator.find({ creatorId }).sort({ assignedAt: -1 });
  const enriched = await Promise.all(
    links.map(async (link) => {
      const campaign = await Campaign.findById(link.campaignId);
      const deliverable = await Deliverable.findOne({
        campaignId: link.campaignId,
        creatorId,
      });
      return {
        campaignId: link.campaignId.toString(),
        assignedAt: link.assignedAt,
        campaign,
        deliverable,
      };
    })
  );
  return res.json({ assignments: enriched });
});

router.get('/assignments/:campaignId', requireAuth, requireRole('creator'), async (req, res) => {
  const creatorId = req.user!.userId;
  const link = await CampaignCreator.findOne({
    campaignId: req.params.campaignId,
    creatorId,
  });
  if (!link) return res.status(404).json({ error: 'Assignment not found' });

  const campaign = await Campaign.findById(req.params.campaignId);
  const deliverable = await Deliverable.findOne({
    campaignId: req.params.campaignId,
    creatorId,
  });
  const brand = campaign ? await Brand.findById(campaign.brandId) : null;

  return res.json({
    campaign: campaign
      ? {
          ...campaign.toObject(),
          id: campaign._id.toString(),
          brands: brand ? { company_name: brand.companyName } : null,
        }
      : null,
    deliverable: deliverable
      ? {
          id: deliverable._id.toString(),
          status: deliverable.status,
          fileUrl: deliverable.fileUrl,
          feedback: deliverable.feedback,
          revisionCount: deliverable.revisionCount,
          createdAt: deliverable.createdAt,
        }
      : null,
  });
});

router.get('/earnings', requireAuth, requireRole('creator'), async (req, res) => {
  const earnings = await CreatorEarning.find({ creatorId: req.user!.userId })
    .sort({ createdAt: -1 });
  const enriched = await Promise.all(
    earnings.map(async (e) => {
      const campaign = await Campaign.findById(e.campaignId);
      return {
        id: e._id.toString(),
        amount: e.amount,
        status: e.status,
        createdAt: e.createdAt,
        campaigns: campaign ? { title: campaign.title } : null,
      };
    })
  );
  return res.json({ earnings: enriched });
});

// Admin
router.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const creators = await Creator.find().sort({ createdAt: -1 });
  const enriched = await Promise.all(
    creators.map(async (c) => {
      const profile = await User.findById(c._id);
      return {
        id: c._id.toString(),
        portfolioUrl: c.portfolioUrl,
        profilePictureUrl: c.profilePictureUrl,
        portfolioMedia: c.portfolioMedia ?? [],
        bio: c.bio,
        address: c.address,
        ...creatorPrivateProfile(c),
        status: c.status,
        createdAt: c.createdAt,
        profiles: profile
          ? { fullName: profile.fullName, email: profile.email }
          : null,
      };
    })
  );
  return res.json({ creators: enriched });
});

router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const { status } = req.body as { status: 'approved' | 'rejected' };
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const creator = await Creator.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!creator) return res.status(404).json({ error: 'Creator not found' });
  if (status === 'approved') notifyCreatorApproved(creator._id.toString());
  return res.json({ creator });
});

export default router;
