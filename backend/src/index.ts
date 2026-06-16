import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDb } from './config/db.js';
import { corsOptions } from './config/cors.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import brandRoutes from './routes/brands.js';
import creatorRoutes from './routes/creators.js';
import campaignRoutes from './routes/campaigns.js';
import deliverableRoutes from './routes/deliverables.js';
import packageRoutes from './routes/packages.js';
import uploadRoutes from './routes/uploads.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
let dbReady = false;

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  if (!dbReady) {
    return res.status(503).json({ ok: false, db: 'connecting' });
  }
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

async function start() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UGCFlow API listening on 0.0.0.0:${PORT}`);
  });

  if (!MONGODB_URI) {
    console.error('MONGODB_URI is required — set it in Render environment variables');
    return;
  }

  try {
    await connectDb(MONGODB_URI);
    dbReady = true;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
