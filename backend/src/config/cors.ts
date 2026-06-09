import type { CorsOptions } from 'cors';

function parseFrontendUrls(): string[] {
  const raw = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000';
  return raw.split(',').map((url) => url.trim()).filter(Boolean);
}

function isAllowedFrontendOrigin(origin: string): boolean {
  const allowed = parseFrontendUrls();
  if (allowed.includes('*') || allowed.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname.endsWith('.vercel.app')) return true;
  } catch {
    return false;
  }

  return false;
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || isAllowedFrontendOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};
