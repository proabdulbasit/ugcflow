# UGCFlow Backend (Express + MongoDB)

Custom API replacing Supabase for auth, roles, and data.

## Setup

```bash
cd backend
cp .env.example .env
# Set MONGODB_URI, JWT_SECRET (must match frontend JWT_SECRET)
npm install
npm run seed   # seeds pricing packages
npm run dev    # http://localhost:4000
```

## Roles

- **brand** — apply at `/brand-apply`, dashboard at `/dashboard/brand`
- **creator** — apply at `/creator-apply`, dashboard at `/dashboard/creator`
- **admin** — promote via `POST /api/auth/promote-admin` with `x-admin-seed-secret` header

## Frontend integration

The Next.js app proxies `/backend/*` → `http://localhost:4000/api/*` so auth cookies work on the same origin.

Run both:

```bash
npm run dev:backend   # terminal 1
npm run dev           # terminal 2 (from project root)
```

## Key env vars

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Must match root `.env` `JWT_SECRET` |
| `FRONTEND_URL` | CORS origin (default `http://localhost:3000`) |
| `ADMIN_SEED_SECRET` | Secret for promoting admin users |
