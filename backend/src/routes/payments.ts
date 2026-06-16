import { Router } from 'express';
import { Payment, Package, Brand } from '../models/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { incrementBrandCredits, creditsForPackage } from '../services/credits.js';
import { higherTier, tierFromPackageName } from '../config/packages.js';

const router = Router();

function requireInternalSecret(req: import('express').Request, res: import('express').Response): boolean {
  const internalSecret = req.headers['x-internal-secret'];
  if (internalSecret !== process.env.JWT_SECRET) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}

router.get('/admin', requireAuth, requireRole('admin'), async (_req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).limit(200);
  const enriched = await Promise.all(
    payments.map(async (p) => {
      const brand = await Brand.findById(p.brandId);
      const pkg = await Package.findById(p.packageId);
      return {
        id: p._id.toString(),
        amount: p.amount,
        status: p.status,
        created_at: p.createdAt,
        stripe_payment_intent_id: p.stripePaymentIntentId,
        brands: brand ? { company_name: brand.companyName } : null,
        packages: pkg ? { name: pkg.name } : null,
      };
    })
  );
  return res.json({ payments: enriched });
});

router.post('/reconcile', async (req, res) => {
  if (!requireInternalSecret(req, res)) return;

  try {
    const { brandId, packageId, paymentIntentId, amount } = req.body as {
      brandId: string;
      packageId: string;
      paymentIntentId: string;
      amount?: number;
    };

    if (!brandId || !packageId || !paymentIntentId) {
      return res.status(400).json({ error: 'brandId, packageId, paymentIntentId required' });
    }

    const existing = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (existing) {
      return res.json({ ok: true, alreadyProcessed: true });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const creditsToAdd = creditsForPackage(pkg.videoCount, pkg.name);
    await incrementBrandCredits(brandId, creditsToAdd);

    const purchasedTier = pkg.tier ?? tierFromPackageName(pkg.name);
    const brand = await Brand.findById(brandId);
    if (brand) {
      brand.packageTier = higherTier(brand.packageTier, purchasedTier);
      await brand.save();
    }

    await Payment.create({
      brandId,
      packageId,
      amount: amount ?? pkg.price,
      stripePaymentIntentId: paymentIntentId,
      status: 'completed',
    });

    return res.json({ ok: true, creditsAdded: creditsToAdd });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/webhook-complete', async (req, res) => {
  if (!requireInternalSecret(req, res)) return;

  try {
    const { brandId, packageId, paymentIntentId } = req.body;
    if (!brandId || !packageId || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const existing = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (existing) return res.json({ ok: true, alreadyProcessed: true });

    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const creditsToAdd = creditsForPackage(pkg.videoCount, pkg.name);
    await incrementBrandCredits(brandId, creditsToAdd);

    const purchasedTier = pkg.tier ?? tierFromPackageName(pkg.name);
    const brand = await Brand.findById(brandId);
    if (brand) {
      brand.packageTier = higherTier(brand.packageTier, purchasedTier);
      await brand.save();
    }

    await Payment.create({
      brandId,
      packageId,
      amount: pkg.price,
      stripePaymentIntentId: paymentIntentId,
      status: 'completed',
    });

    return res.json({ ok: true, creditsAdded: creditsToAdd });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
