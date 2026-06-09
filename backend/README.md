# UGCFlow Backend (Express + MongoDB)

Custom API for auth, roles, campaigns, payments, and admin.

## Where backend data lives

| Item | Location |
|------|----------|
| MongoDB connection | `backend/.env` → `MONGODB_URI` |
| All app data (users, brands, campaigns, etc.) | MongoDB Atlas (not in repo) |
| Admin login credentials | `backend/.env` → `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| API code, models, routes | `backend/src/` |
| Seed scripts (packages, admin) | `backend/src/seed.ts`, `seed-admin.ts` |
| API docs | `backend/API.md` |
| Postman collection | `backend/postman/` |

The **root** `.env` is for Next.js only (public URLs, Stripe, shared JWT). Do not put `MONGODB_URI` in the root `.env`.

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, ADMIN_* 
npm install
npm run seed        # pricing packages
npm run seed:admin  # create admin user from ADMIN_EMAIL/PASSWORD
npm run dev         # http://localhost:4000
```

Also set root `.env` from `.env.example` with the **same** `JWT_SECRET` and `ADMIN_SEED_SECRET`.

Run both apps:

```bash
npm run dev:backend   # terminal 1 — backend
npm run dev           # terminal 2 — frontend (project root)
```

## Roles

- **brand** — apply at `/brand-apply`, dashboard at `/dashboard/brand`
- **creator** — apply at `/creator-apply`, dashboard at `/dashboard/creator`
- **admin** — login at `/admin/login` (seed with `npm run seed:admin`)

## Key env vars (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Must match root `.env` `JWT_SECRET` |
| `FRONTEND_URL` | CORS origin (default `http://localhost:3000`) |
| `ADMIN_SEED_SECRET` | Must match root `.env` (admin promote route) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used by `npm run seed:admin` only |

## Deploy on Render

1. Create a **Web Service** linked to this repo.
2. Set **Root Directory** to `backend`.
3. **Build command:** `npm install --include=dev && npm run build`
4. **Start command:** `npm start`
5. Add environment variables in the Render dashboard:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — must match frontend `.env`
   - `FRONTEND_URL` — production frontend URL (CORS)
6. Render sets `PORT` automatically; the API binds to `0.0.0.0`.

Or use the repo `render.yaml` blueprint at the project root.
