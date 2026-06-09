import { Router } from 'express';
import {
  Campaign,
  Brand,
  User,
  CampaignCreator,
  Creator,
  CampaignApplication,
  Deliverable,
} from '../models/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

router.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const campaigns = await Campaign.find().sort({ createdAt: -1 });
  const enriched = await Promise.all(
    campaigns.map(async (c) => {
      const brand = await Brand.findById(c.brandId);
      const brandUser = await User.findById(c.brandId);
      const applicationCount = await CampaignApplication.countDocuments({ campaignId: c._id });
      const assignedCount = await CampaignCreator.countDocuments({ campaignId: c._id });
      return {
        id: c._id.toString(),
        title: c.title,
        brief: c.brief,
        status: c.status,
        payoutAmount: c.payoutAmount,
        createdAt: c.createdAt,
        brandId: c.brandId.toString(),
        applicationCount,
        assignedCount,
        brands: brand
          ? { companyName: brand.companyName, profiles: brandUser ? { email: brandUser.email } : null }
          : null,
      };
    })
  );
  return res.json({ campaigns: enriched });
});

router.get('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const campaign = await Campaign.findById(paramId(req.params.id));
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const brand = await Brand.findById(campaign.brandId);
  const assignedLinks = await CampaignCreator.find({ campaignId: campaign._id });
  const assignedIds = new Set(assignedLinks.map((a) => a.creatorId.toString()));

  const applications = await CampaignApplication.find({ campaignId: campaign._id }).sort({ createdAt: -1 });
  const applicants = await Promise.all(
    applications.map(async (app) => {
      const profile = await User.findById(app.creatorId);
      const creator = await Creator.findById(app.creatorId);
      return {
        id: app.creatorId.toString(),
        applicationId: app._id.toString(),
        applicationStatus: app.status,
        isAssigned: assignedIds.has(app.creatorId.toString()),
        status: creator?.status,
        profiles: profile ? { fullName: profile.fullName, email: profile.email } : null,
      };
    })
  );

  const creators = await Creator.find({ status: 'approved' });
  const availableCreators = await Promise.all(
    creators.map(async (c) => {
      const profile = await User.findById(c._id);
      return {
        id: c._id.toString(),
        status: c.status,
        isApplicant: applicants.some((a) => a.id === c._id.toString()),
        isAssigned: assignedIds.has(c._id.toString()),
        profiles: profile ? { fullName: profile.fullName, email: profile.email } : null,
      };
    })
  );

  const assignedCreators = await Promise.all(
    assignedLinks.map(async (link) => {
      const profile = await User.findById(link.creatorId);
      const deliverable = await Deliverable.findOne({
        campaignId: campaign._id,
        creatorId: link.creatorId,
      });
      return {
        id: link.creatorId.toString(),
        assignedAt: link.assignedAt,
        profiles: profile ? { fullName: profile.fullName, email: profile.email } : null,
        deliverable: deliverable
          ? { id: deliverable._id.toString(), status: deliverable.status, fileUrl: deliverable.fileUrl }
          : null,
      };
    })
  );

  return res.json({
    campaign: { ...campaign.toObject(), id: campaign._id.toString() },
    brand,
    applicants,
    assignedCreators,
    availableCreators,
    assignedCreatorIds: assignedLinks.map((a) => a.creatorId.toString()),
  });
});

router.post('/:id/assign', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const campaignId = paramId(req.params.id);
    const { creatorId } = req.body as { creatorId: string };
    if (!creatorId) return res.status(400).json({ error: 'creatorId required' });

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const creator = await Creator.findById(creatorId);
    if (!creator || creator.status !== 'approved') {
      return res.status(400).json({ error: 'Creator must be approved' });
    }

    await CampaignCreator.findOneAndUpdate(
      { campaignId: campaign._id, creatorId },
      { campaignId: campaign._id, creatorId, assignedAt: new Date() },
      { upsert: true }
    );

    await CampaignApplication.findOneAndUpdate(
      { campaignId: campaign._id, creatorId },
      { status: 'approved' }
    );

    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
