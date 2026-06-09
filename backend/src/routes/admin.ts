import { Router } from 'express';
import {
  Creator,
  Brand,
  Campaign,
  Deliverable,
  Payment,
  User,
} from '../models/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/overview', requireAuth, requireRole('admin'), async (_req, res) => {
  const pendingCreators = await Creator.countDocuments({ status: 'pending' });
  const pendingBrands = await Brand.countDocuments({ status: 'pending' });
  const approvedBrands = await Brand.countDocuments({ status: 'approved' });
  const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
  const pendingSubmissions = await Deliverable.countDocuments({ status: 'pending' });
  const approvedSubmissions = await Deliverable.countDocuments({ status: 'approved' });
  const rejectedSubmissions = await Deliverable.countDocuments({ status: 'rejected' });
  const payments = await Payment.find({ status: 'completed' });
  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const recentPayments = await Payment.find()
    .sort({ createdAt: -1 })
    .limit(5);

  const recentEnriched = await Promise.all(
    recentPayments.map(async (p) => {
      const brand = await Brand.findById(p.brandId);
      return {
        id: p._id.toString(),
        amount: p.amount,
        status: p.status,
        created_at: p.createdAt,
        brands: brand ? { company_name: brand.companyName } : null,
      };
    })
  );

  const pendingCreatorList = await Creator.find({ status: 'pending' }).limit(10);
  const pendingEnriched = await Promise.all(
    pendingCreatorList.map(async (c) => {
      const profile = await User.findById(c._id);
      return {
        id: c._id.toString(),
        status: c.status,
        profiles: profile ? { full_name: profile.fullName, email: profile.email } : null,
      };
    })
  );

  const pendingBrandList = await Brand.find({ status: 'pending' }).limit(10);
  const pendingBrandEnriched = await Promise.all(
    pendingBrandList.map(async (b) => {
      const profile = await User.findById(b._id);
      return {
        id: b._id.toString(),
        status: b.status,
        company_name: b.companyName,
        profiles: profile ? { full_name: profile.fullName, email: profile.email } : null,
      };
    })
  );

  return res.json({
    pendingCreators,
    pendingBrands,
    approvedBrands,
    activeCampaigns,
    pendingSubmissions,
    approvedSubmissions,
    rejectedSubmissions,
    revenue,
    recentPayments: recentEnriched,
    pendingCreatorList: pendingEnriched,
    pendingBrandList: pendingBrandEnriched,
  });
});

export default router;
