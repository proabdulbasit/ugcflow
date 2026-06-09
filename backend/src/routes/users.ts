import { Router } from 'express';
import { User, Brand, Creator } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { fullName, companyName, websiteUrl, portfolioUrl, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (fullName !== undefined) user.fullName = String(fullName).trim();
    await user.save();

    if (user.role === 'brand') {
      await Brand.findByIdAndUpdate(userId, {
        ...(companyName !== undefined && { companyName: String(companyName).trim() }),
        ...(websiteUrl !== undefined && { websiteUrl: String(websiteUrl).trim() }),
      });
    } else if (user.role === 'creator') {
      await Creator.findByIdAndUpdate(userId, {
        ...(portfolioUrl !== undefined && { portfolioUrl: String(portfolioUrl).trim() }),
        ...(bio !== undefined && { bio: String(bio).trim() }),
      });
    }

    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/profiles', requireAuth, async (req, res) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const users = await User.find().sort({ createdAt: -1 }).limit(500);
  return res.json({
    profiles: users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      createdAt: u.createdAt,
    })),
  });
});

export default router;
