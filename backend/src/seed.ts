import 'dotenv/config';
import { connectDb } from './config/db.js';
import { Package } from './models/index.js';

const PACKAGES = [
  {
    name: 'Starter Package',
    description: 'Best for testing creatives',
    price: 267,
    videoCount: 3,
  },
  {
    name: 'Growth Package',
    description: 'Best for consistent ad testing',
    price: 534,
    videoCount: 6,
  },
  {
    name: 'Scale Package',
    description: 'Best for brands ready to scale',
    price: 890,
    videoCount: 10,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI required');

  await connectDb(uri);

  for (const pkg of PACKAGES) {
    await Package.findOneAndUpdate({ name: pkg.name }, pkg, { upsert: true, new: true });
    console.log('Seeded package:', pkg.name);
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
