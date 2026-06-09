import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import brandRoutes from './routes/brands.js';
import creatorRoutes from './routes/creators.js';
import campaignRoutes from './routes/campaigns.js';
import deliverableRoutes from './routes/deliverables.js';
import packageRoutes from './routes/packages.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

async function start() {
  await connectDb(MONGODB_URI!);
  app.listen(PORT, () => {
    console.log(`UGCFlow API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
