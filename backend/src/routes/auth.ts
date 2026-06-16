import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  User,
  Brand,
  Creator,
  type UserRole,
} from '../models/index.js';
import {
  publicUser,
  requireAuth,
  requireRole,
  signToken,
} from '../middleware/auth.js';
import {
  normalizePortfolioMedia,
  validatePortfolioMedia,
  type PortfolioMediaItem,
} from '../services/creatorProfile.js';

const router = Router();

function setAuthCookie(res: import('express').Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      role,
      companyName,
      websiteUrl,
      brandGoals,
      portfolioUrl,
      profilePictureUrl,
      portfolioMedia,
      bio,
      address,
      termsAccepted,
    } = req.body as {
      email: string;
      password: string;
      fullName: string;
      role: 'brand' | 'creator';
      companyName?: string;
      websiteUrl?: string;
      brandGoals?: string;
      portfolioUrl?: string;
      profilePictureUrl?: string;
      portfolioMedia?: PortfolioMediaItem[];
      bio?: string;
      address?: string;
      termsAccepted?: boolean;
    };

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, password, and role are required' });
    }
    if (!termsAccepted) {
      return res.status(400).json({ error: 'You must accept the Terms & Conditions to register' });
    }
    if (!['brand', 'creator'].includes(role)) {
      return res.status(400).json({ error: 'role must be brand or creator' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (role === 'creator' && !address?.trim()) {
      return res.status(400).json({ error: 'Mailing address is required for creators' });
    }
    if (role === 'creator') {
      const portfolioError = validatePortfolioMedia(portfolioMedia);
      if (portfolioError) return res.status(400).json({ error: portfolioError });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const termsAcceptedAt = new Date();
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName?.trim() ?? '',
      role: role as UserRole,
    });

    if (role === 'brand') {
      await Brand.create({
        _id: user._id,
        companyName: companyName?.trim(),
        websiteUrl: websiteUrl?.trim(),
        brandGoals: brandGoals?.trim(),
        status: 'pending',
        credits: 0,
        termsAcceptedAt,
      });
    } else {
      await Creator.create({
        _id: user._id,
        portfolioUrl: portfolioUrl?.trim(),
        profilePictureUrl: profilePictureUrl?.trim(),
        portfolioMedia: normalizePortfolioMedia(portfolioMedia ?? []),
        bio: bio?.trim(),
        address: address?.trim(),
        status: 'pending',
        termsAcceptedAt,
      });
    }

    // Application only — no session until admin approves and user logs in.
    return res.status(201).json({
      user: publicUser(user),
      applicationStatus: 'pending',
      message: 'Application submitted. You can log in after an admin approves your account.',
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message ?? 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    if (user.role === 'brand') {
      const brand = await Brand.findById(user._id);
      if (!brand || brand.status === 'pending') {
        return res.status(403).json({
          error: 'Your application is pending admin approval. Please wait until an admin approves your account.',
          applicationStatus: 'pending',
        });
      }
      if (brand.status === 'rejected') {
        return res.status(403).json({
          error: 'Your account was rejected by admin. Please contact support if you believe this is an error.',
          applicationStatus: 'rejected',
        });
      }
    }

    if (user.role === 'creator') {
      const creator = await Creator.findById(user._id);
      if (!creator || creator.status === 'pending') {
        return res.status(403).json({
          error: 'Your application is pending admin approval. Please wait until an admin approves your account.',
          applicationStatus: 'pending',
        });
      }
      if (creator.status === 'rejected') {
        return res.status(403).json({
          error: 'Your account was rejected by admin. Please contact support if you believe this is an error.',
          applicationStatus: 'rejected',
        });
      }
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });
    setAuthCookie(res, token);

    return res.json({ user: publicUser(user), token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Login failed' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token', { path: '/' });
  return res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let roleData: Record<string, unknown> | null = null;
  if (user.role === 'brand') {
    const brand = await Brand.findById(user._id);
    roleData = brand
      ? {
          companyName: brand.companyName,
          websiteUrl: brand.websiteUrl,
          brandGoals: brand.brandGoals,
          status: brand.status,
          credits: brand.credits,
          packageTier: brand.packageTier,
        }
      : null;
  } else if (user.role === 'creator') {
    const creator = await Creator.findById(user._id);
    roleData = creator
      ? {
          portfolioUrl: creator.portfolioUrl,
          profilePictureUrl: creator.profilePictureUrl,
          portfolioMedia: creator.portfolioMedia ?? [],
          bio: creator.bio,
          address: creator.address,
          status: creator.status,
        }
      : null;
  }

  return res.json({ user: publicUser(user), roleData });
});

router.post('/promote-admin', async (req, res) => {
  const secret = req.headers['x-admin-seed-secret'];
  if (!secret || secret !== process.env.ADMIN_SEED_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ error: 'email required' });

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { role: 'admin' },
    { new: true }
  );
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({ user: publicUser(user) });
});

/** Create a new admin account (or reset password / promote existing user). Requires ADMIN_SEED_SECRET. */
router.post('/setup-admin', async (req, res) => {
  const secret = req.headers['x-admin-seed-secret'];
  if (!secret || secret !== process.env.ADMIN_SEED_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { email, password, fullName } = req.body as {
      email: string;
      password: string;
      fullName?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 12);
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      user.role = 'admin';
      user.passwordHash = passwordHash;
      if (fullName?.trim()) user.fullName = fullName.trim();
      await user.save();
    } else {
      user = await User.create({
        email: normalizedEmail,
        passwordHash,
        fullName: fullName?.trim() ?? 'Admin',
        role: 'admin',
      });
    }

    return res.status(201).json({ user: publicUser(user), message: 'Admin account ready' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Setup failed' });
  }
});

export default router;
