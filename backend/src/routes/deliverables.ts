import { Router } from 'express';
import {
  Deliverable,
  Campaign,
  User,
  Brand,
  CampaignCreator,
} from '../models/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { onDeliverableApproved } from '../services/earnings.js';
import { notifyDeliverableSubmitted, notifyDeliverableReviewed } from '../services/notifications.js';

const router = Router();

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

async function reviewDeliverable(
  deliverableId: string,
  status: 'approved' | 'rejected',
  feedback: string | undefined,
  reviewerRole: 'brand' | 'admin',
  userId: string
) {
  const deliverable = await Deliverable.findById(deliverableId);
  if (!deliverable) return { error: 'Deliverable not found', status: 404 };

  if (reviewerRole === 'brand') {
    const campaign = await Campaign.findById(deliverable.campaignId);
    if (!campaign || campaign.brandId.toString() !== userId) {
      return { error: 'Forbidden', status: 403 };
    }
  }

  deliverable.status = status;
  if (feedback !== undefined) deliverable.feedback = feedback;
  await deliverable.save();

  if (status === 'approved') {
    await onDeliverableApproved(deliverable._id.toString());
  }

  notifyDeliverableReviewed(
    deliverable.campaignId.toString(),
    deliverable.creatorId.toString(),
    status,
    feedback
  );

  return { deliverable };
}

router.post('/', requireAuth, requireRole('creator'), async (req, res) => {
  try {
    const creatorId = req.user!.userId;
    const { campaignId, fileUrl } = req.body as { campaignId: string; fileUrl: string };

    if (!campaignId?.trim()) return res.status(400).json({ error: 'campaignId is required' });
    if (!fileUrl?.trim()) return res.status(400).json({ error: 'fileUrl is required' });

    const assignment = await CampaignCreator.findOne({ campaignId, creatorId });
    if (!assignment) {
      return res.status(403).json({ error: 'You are not assigned to this campaign' });
    }

    const existing = await Deliverable.findOne({ campaignId, creatorId });

    if (existing) {
      if (existing.status === 'approved') {
        return res.status(400).json({ error: 'This deliverable is already approved' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Your submission is pending review' });
      }

      const campaign = await Campaign.findById(campaignId);
      const maxRevisions = campaign?.revisionRounds ?? 0;
      if ((existing.revisionCount ?? 0) >= maxRevisions) {
        return res.status(400).json({
          error: `Maximum revision rounds (${maxRevisions}) reached for this campaign.`,
        });
      }

      existing.fileUrl = fileUrl.trim();
      existing.status = 'pending';
      existing.feedback = undefined;
      existing.revisionCount = (existing.revisionCount ?? 0) + 1;
      await existing.save();

      notifyDeliverableSubmitted(campaignId, creatorId);

      return res.json({
        deliverable: {
          id: existing._id.toString(),
          status: existing.status,
          fileUrl: existing.fileUrl,
          revisionCount: existing.revisionCount,
        },
      });
    }

    const deliverable = await Deliverable.create({
      campaignId,
      creatorId,
      fileUrl: fileUrl.trim(),
      status: 'pending',
      revisionCount: 0,
    });

    notifyDeliverableSubmitted(campaignId, creatorId);

    return res.status(201).json({
      deliverable: {
        id: deliverable._id.toString(),
        status: deliverable.status,
        fileUrl: deliverable.fileUrl,
        revisionCount: deliverable.revisionCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Submission failed' });
  }
});

router.patch('/:id/review', requireAuth, async (req, res) => {
  const role = req.user!.role;
  if (role !== 'brand' && role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { status, feedback } = req.body as { status: 'approved' | 'rejected'; feedback?: string };
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const result = await reviewDeliverable(
    paramId(req.params.id),
    status,
    feedback,
    role as 'brand' | 'admin',
    req.user!.userId
  );

  if ('error' in result && result.error) {
    return res.status(result.status ?? 400).json({ error: result.error });
  }

  return res.json(result);
});

router.get('/admin', requireAuth, requireRole('admin'), async (req, res) => {
  const statusFilter = req.query.status as string | undefined;
  const query = statusFilter && statusFilter !== 'all' ? { status: statusFilter } : {};

  const deliverables = await Deliverable.find(query).sort({ createdAt: -1 }).limit(200);
  const enriched = await Promise.all(
    deliverables.map(async (d) => {
      const campaign = await Campaign.findById(d.campaignId);
      const brand = campaign ? await Brand.findById(campaign.brandId) : null;
      const creator = await User.findById(d.creatorId);
      return {
        id: d._id.toString(),
        status: d.status,
        feedback: d.feedback,
        fileUrl: d.fileUrl,
        createdAt: d.createdAt,
        campaign_id: d.campaignId.toString(),
        campaigns: campaign
          ? { id: campaign._id.toString(), title: campaign.title, brands: { company_name: brand?.companyName } }
          : null,
        creators: creator
          ? { id: creator._id.toString(), profiles: { full_name: creator.fullName, email: creator.email } }
          : null,
      };
    })
  );

  return res.json({ deliverables: enriched });
});

export default router;
