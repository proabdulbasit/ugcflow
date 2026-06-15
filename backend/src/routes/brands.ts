import { Router } from 'express';
import {
  Brand,
  User,
  Campaign,
  Deliverable,
  Payment,
  CampaignApplication,
  Creator,
} from '../models/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { spendBrandCredits, incrementBrandCredits } from '../services/credits.js';

const router = Router();
const CAMPAIGN_COST = 89;

router.get('/me', requireAuth, requireRole('brand'), async (req, res) => {
  const brand = await Brand.findById(req.user!.userId);
  if (!brand) return res.status(404).json({ error: 'Brand profile not found' });
  return res.json({
    id: brand._id.toString(),
    companyName: brand.companyName,
    websiteUrl: brand.websiteUrl,
    brandGoals: brand.brandGoals,
    status: brand.status,
    credits: brand.credits,
    createdAt: brand.createdAt,
  });
});

router.get('/overview', requireAuth, requireRole('brand'), async (req, res) => {
  const brandId = req.user!.userId;
  const brand = await Brand.findById(brandId);
  const campaigns = await Campaign.find({ brandId }).sort({ createdAt: -1 });
  const campaignIds = campaigns.map((c) => c._id);
  const deliverables = await Deliverable.find({ campaignId: { $in: campaignIds } })
    .sort({ createdAt: -1 })
    .limit(20);

  const pendingDeliverables = deliverables.filter((d) => d.status === 'pending').length;

  const recentDeliverables = await Promise.all(
    deliverables.slice(0, 5).map(async (d) => {
      const campaign = campaigns.find((c) => c._id.toString() === d.campaignId.toString());
      const creator = await User.findById(d.creatorId);
      return {
        id: d._id.toString(),
        status: d.status,
        created_at: d.createdAt,
        campaigns: campaign ? { title: campaign.title } : null,
        creators: creator ? { profiles: { full_name: creator.fullName } } : null,
      };
    })
  );

  return res.json({
    credits: brand?.credits ?? 0,
    activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    pendingDeliverables,
    recentDeliverables,
    campaigns,
  });
});

router.get('/billing', requireAuth, requireRole('brand'), async (req, res) => {
  const brandId = req.user!.userId;
  const brand = await Brand.findById(brandId);
  const payments = await Payment.find({ brandId })
    .populate('packageId')
    .sort({ createdAt: -1 });

  return res.json({
    credits: brand?.credits ?? 0,
    payments: payments.map((p) => ({
      id: p._id.toString(),
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt,
      package: p.packageId,
    })),
  });
});

router.post('/campaigns', requireAuth, requireRole('brand'), async (req, res) => {
  try {
    const brandId = req.user!.userId;
    const {
      title,
      brief,
      referenceVideoUrl,
      productUrl,
      targetPlatform,
      videoFormat,
      talkingPoints,
      dosAndDonts,
    } = req.body as {
      title: string;
      brief?: string;
      referenceVideoUrl?: string;
      productUrl?: string;
      targetPlatform?: string;
      videoFormat?: string;
      talkingPoints?: string;
      dosAndDonts?: string;
    };
    if (!title?.trim()) return res.status(400).json({ error: 'title is required' });
    if (!brief?.trim()) return res.status(400).json({ error: 'brief is required' });

    const spent = await spendBrandCredits(brandId, CAMPAIGN_COST);
    if (!spent) {
      return res.status(400).json({ error: `Not enough credits. You need ${CAMPAIGN_COST} credits.` });
    }

    try {
      const campaign = await Campaign.create({
        brandId,
        title: title.trim(),
        brief: brief.trim(),
        referenceVideoUrl: referenceVideoUrl?.trim() || undefined,
        productUrl: productUrl?.trim() || undefined,
        targetPlatform: targetPlatform?.trim() || undefined,
        videoFormat: videoFormat?.trim() || undefined,
        talkingPoints: talkingPoints?.trim() || undefined,
        dosAndDonts: dosAndDonts?.trim() || undefined,
        status: 'active',
        payoutAmount: 89,
      });

      return res.status(201).json({ campaign });
    } catch (createErr) {
      await incrementBrandCredits(brandId, CAMPAIGN_COST);
      throw createErr;
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/campaigns', requireAuth, requireRole('brand'), async (req, res) => {
  const brandId = req.user!.userId;
  const campaigns = await Campaign.find({ brandId }).sort({ createdAt: -1 });

  const enriched = await Promise.all(
    campaigns.map(async (c) => {
      const applicationCount = await CampaignApplication.countDocuments({ campaignId: c._id });
      const deliverableCount = await Deliverable.countDocuments({ campaignId: c._id });
      return {
        ...c.toObject(),
        id: c._id.toString(),
        applicationCount,
        deliverableCount,
      };
    })
  );

  return res.json({ campaigns: enriched });
});

router.get('/campaigns/:id', requireAuth, requireRole('brand'), async (req, res) => {
  const campaign = await Campaign.findOne({ _id: req.params.id, brandId: req.user!.userId });
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const deliverables = await Deliverable.find({ campaignId: campaign._id }).sort({ createdAt: -1 });
  const enrichedDeliverables = await Promise.all(
    deliverables.map(async (d) => {
      const creator = await User.findById(d.creatorId);
      return {
        id: d._id.toString(),
        status: d.status,
        feedback: d.feedback,
        fileUrl: d.fileUrl,
        created_at: d.createdAt,
        creators: creator ? { profiles: { full_name: creator.fullName, email: creator.email } } : null,
      };
    })
  );

  return res.json({
    campaign: { ...campaign.toObject(), id: campaign._id.toString() },
    deliverables: enrichedDeliverables,
    applications: await enrichApplications(campaign._id),
  });
});

async function enrichApplications(campaignId: import('mongoose').Types.ObjectId) {
  const applications = await CampaignApplication.find({ campaignId }).sort({ createdAt: -1 });
  return Promise.all(
    applications.map(async (app) => {
      const creator = await User.findById(app.creatorId);
      const creatorProfile = await Creator.findById(app.creatorId);
      return {
        id: app._id.toString(),
        status: app.status,
        created_at: app.createdAt,
        creators: creator
          ? {
              id: creator._id.toString(),
              profiles: {
                full_name: creator.fullName,
                email: creator.email,
                portfolio_url: creatorProfile?.portfolioUrl,
                address: creatorProfile?.address,
              },
            }
          : null,
      };
    })
  );
}

// Admin brand routes
router.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const brands = await Brand.find().sort({ createdAt: -1 });
  const enriched = await Promise.all(
    brands.map(async (b) => {
      const profile = await User.findById(b._id);
      return {
        id: b._id.toString(),
        companyName: b.companyName,
        websiteUrl: b.websiteUrl,
        brandGoals: b.brandGoals,
        status: b.status,
        credits: b.credits,
        createdAt: b.createdAt,
        profiles: profile
          ? { fullName: profile.fullName, email: profile.email }
          : null,
      };
    })
  );
  return res.json({ brands: enriched });
});

router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const { status } = req.body as { status: 'approved' | 'rejected' };
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const brand = await Brand.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!brand) return res.status(404).json({ error: 'Brand not found' });
  return res.json({ brand });
});

export default router;
