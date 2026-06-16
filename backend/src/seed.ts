import 'dotenv/config';
import { connectDb } from './config/db.js';
import { PACKAGE_DEFINITIONS } from './config/packages.js';
import { Package } from './models/index.js';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI required');

  await connectDb(uri);

  for (const pkg of PACKAGE_DEFINITIONS) {
    await Package.findOneAndUpdate(
      { tier: pkg.tier },
      {
        name: pkg.name,
        tagline: pkg.tagline,
        description: pkg.features.join('\n'),
        price: pkg.price,
        currency: pkg.currency,
        videoCount: pkg.videoCount,
        creatorCount: pkg.creatorCount,
        revisionRounds: pkg.revisionRounds,
        turnaroundDays: pkg.turnaroundDays,
        matchingTier: pkg.matchingTier,
        tier: pkg.tier,
        features: pkg.features,
      },
      { upsert: true, new: true }
    );
    console.log('Seeded package:', pkg.name);
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
