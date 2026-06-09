import 'dotenv/config';
import { connectDb } from './config/db.js';
import bcrypt from 'bcryptjs';
import { User } from './models/index.js';

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI required');

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || 'Admin';

  if (!email) throw new Error('ADMIN_EMAIL is required in backend/.env');
  if (!password) throw new Error('ADMIN_PASSWORD is required in backend/.env');
  if (password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters');

  await connectDb(uri);

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    existing.passwordHash = passwordHash;
    existing.fullName = fullName;
    await existing.save();
    console.log('Updated admin user:', email);
  } else {
    await User.create({ email, passwordHash, fullName, role: 'admin' });
    console.log('Created admin user:', email);
  }

  console.log('Login at http://localhost:3000/admin/login');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
