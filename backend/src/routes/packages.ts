import { Router } from 'express';
import { Package } from '../models/index.js';

const router = Router();

function serializePackage(p: InstanceType<typeof Package>) {
  return {
    id: p._id.toString(),
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    price: p.price,
    currency: p.currency ?? 'AUD',
    video_count: p.videoCount,
    creator_count: p.creatorCount,
    revision_rounds: p.revisionRounds,
    turnaround_days: p.turnaroundDays,
    matching_tier: p.matchingTier,
    tier: p.tier,
    features: p.features ?? [],
    stripe_price_id: p.stripePriceId,
    created_at: p.createdAt,
  };
}

router.get('/', async (_req, res) => {
  const packages = await Package.find().sort({ price: 1 });
  return res.json({
    packages: packages.map(serializePackage),
  });
});

router.get('/:id', async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });
  return res.json(serializePackage(pkg));
});

export default router;
