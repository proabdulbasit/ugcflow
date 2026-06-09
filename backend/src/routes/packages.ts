import { Router } from 'express';
import { Package } from '../models/index.js';

const router = Router();

router.get('/', async (_req, res) => {
  const packages = await Package.find().sort({ price: 1 });
  return res.json({
    packages: packages.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      video_count: p.videoCount,
      stripe_price_id: p.stripePriceId,
      created_at: p.createdAt,
    })),
  });
});

router.get('/:id', async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });
  return res.json({
    id: pkg._id.toString(),
    name: pkg.name,
    description: pkg.description,
    price: pkg.price,
    video_count: pkg.videoCount,
    stripe_price_id: pkg.stripePriceId,
  });
});

export default router;
