import { Router } from 'express';
import { User, Brand, Creator } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import {
  normalizePortfolioMedia,
  validatePortfolioMedia,
  type PortfolioMediaItem,
} from '../services/creatorProfile.js';

const router = Router();

function trimOrUndefined(value: unknown) {
  if (value === undefined) return undefined;
  const trimmed = String(value).trim();
  return trimmed || undefined;
}

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const {
      fullName,
      companyName,
      websiteUrl,
      abn,
      portfolioUrl,
      profilePictureUrl,
      portfolioMedia,
      bio,
      address,
      payoutPaypalEmail,
      payoutBankName,
      payoutBankAccountName,
      payoutBankBsb,
      payoutBankAccountNumber,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (fullName !== undefined) user.fullName = String(fullName).trim();
    await user.save();

    if (user.role === 'brand') {
      await Brand.findByIdAndUpdate(userId, {
        ...(companyName !== undefined && { companyName: String(companyName).trim() }),
        ...(websiteUrl !== undefined && { websiteUrl: String(websiteUrl).trim() }),
        ...(abn !== undefined && { abn: trimOrUndefined(abn) }),
      });
    } else if (user.role === 'creator') {
      if (portfolioMedia !== undefined) {
        const portfolioError = validatePortfolioMedia(portfolioMedia);
        if (portfolioError) return res.status(400).json({ error: portfolioError });
      }

      await Creator.findByIdAndUpdate(userId, {
        ...(portfolioUrl !== undefined && { portfolioUrl: String(portfolioUrl).trim() }),
        ...(profilePictureUrl !== undefined && { profilePictureUrl: String(profilePictureUrl).trim() }),
        ...(portfolioMedia !== undefined && {
          portfolioMedia: normalizePortfolioMedia(portfolioMedia as PortfolioMediaItem[]),
        }),
        ...(bio !== undefined && { bio: String(bio).trim() }),
        ...(address !== undefined && { address: String(address).trim() }),
        ...(abn !== undefined && { abn: trimOrUndefined(abn) }),
        ...(payoutPaypalEmail !== undefined && { payoutPaypalEmail: trimOrUndefined(payoutPaypalEmail) }),
        ...(payoutBankName !== undefined && { payoutBankName: trimOrUndefined(payoutBankName) }),
        ...(payoutBankAccountName !== undefined && {
          payoutBankAccountName: trimOrUndefined(payoutBankAccountName),
        }),
        ...(payoutBankBsb !== undefined && { payoutBankBsb: trimOrUndefined(payoutBankBsb) }),
        ...(payoutBankAccountNumber !== undefined && {
          payoutBankAccountNumber: trimOrUndefined(payoutBankAccountNumber),
        }),
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
