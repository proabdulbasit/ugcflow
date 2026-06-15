# UGCFlow API Reference

**Base URL:** `http://localhost:4000` (local) or your Render backend URL  
**Auth:** JWT via `Authorization: Bearer <token>` or httpOnly cookie `token`

---

## Import into Postman

1. Open Postman → **Import**
2. Import:
   - `backend/postman/UGCFlow-API.postman_collection.json`
   - `backend/postman/UGCFlow-Local.postman_environment.json` (local)
   - `backend/postman/UGCFlow-Production.postman_environment.json` (production)
3. Select the environment and set `baseUrl`, `jwtSecret`, `adminSeedSecret`
4. Run **Auth → Setup Admin** or **Login** (token auto-saves to `{{token}}`)

---

## Typical flow

1. **Register** brand/creator → `applicationStatus: pending` (no JWT)
2. **Admin** approves via `/api/brands/:id/status` or `/api/creators/:id/status`
3. **Login** → receive JWT
4. Brand buys credits → creates campaigns → admin assigns creators → creator submits deliverable → brand/admin reviews

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | `{ ok: true }` when DB ready; `503` while connecting |

---

## Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register brand or creator (no JWT) |
| POST | `/api/auth/login` | No | Login; blocked if pending/rejected |
| POST | `/api/auth/logout` | No | Clear session cookie |
| GET | `/api/auth/me` | Yes | Current user + role data |
| POST | `/api/auth/setup-admin` | Secret header | Create/reset admin account |
| POST | `/api/auth/promote-admin` | Secret header | Promote user to admin |

### Register Brand
```json
POST /api/auth/register
{
  "email": "brand@example.com",
  "password": "password123",
  "fullName": "Jane Brand",
  "role": "brand",
  "companyName": "Acme Co",
  "websiteUrl": "https://acme.com",
  "brandGoals": "Scale UGC"
}
```
Response: `{ user, applicationStatus: "pending", message }` — **no token**

### Register Creator
```json
POST /api/auth/register
{
  "email": "creator@example.com",
  "password": "password123",
  "fullName": "John Creator",
  "role": "creator",
  "portfolioUrl": "https://tiktok.com/@user",
  "bio": "UGC specialist"
}
```

### Login
```json
POST /api/auth/login
{ "email": "brand@example.com", "password": "password123" }
```
Returns `{ user, token }` or **403** if pending/rejected.

### Setup / Promote Admin
```
Header: x-admin-seed-secret: <ADMIN_SEED_SECRET>
POST /api/auth/setup-admin
{ "email": "admin@example.com", "password": "password123", "fullName": "Admin" }

POST /api/auth/promote-admin
{ "email": "user@example.com" }
```

---

## Users (`/api/users`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| PATCH | `/api/users/profile` | Any | Update profile fields |
| GET | `/api/users/profiles` | Admin | List all users |

---

## Packages (`/api/packages`) — Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/packages` | No | List pricing packages |
| GET | `/api/packages/:id` | No | Get package by ID |

---

## Brand (`/api/brands`) — Role: brand

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/brands/me` | Brand profile + credits |
| GET | `/api/brands/overview` | Dashboard stats |
| GET | `/api/brands/billing` | Credits + payment history |
| GET | `/api/brands/campaigns` | List own campaigns |
| POST | `/api/brands/campaigns` | Create campaign (89 credits) |
| GET | `/api/brands/campaigns/:id` | Campaign + deliverables + applications |

### Create Campaign
```json
POST /api/brands/campaigns
{
  "title": "Summer Skincare UGC",
  "brief": "30s TikTok review of vitamin C serum",
  "referenceVideoUrl": "https://tiktok.com/@example/video/123",
  "productUrl": "https://acme.com/products/serum",
  "targetPlatform": "TikTok",
  "videoFormat": "Vertical 9:16, 30-45 seconds",
  "talkingPoints": "Hydration, morning routine, glow",
  "dosAndDonts": "Do show texture. Don't mention competitors."
}
```
**Required:** `title`, `brief`  
**Cost:** 89 credits (refunded if create fails)

---

## Creator (`/api/creators`) — Role: creator

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/creators/overview` | Dashboard stats |
| GET | `/api/creators/browse` | Browse active campaigns (approved only) |
| POST | `/api/creators/applications` | Apply to campaign |
| GET | `/api/creators/assignments` | List assignments |
| GET | `/api/creators/assignments/:campaignId` | Assignment + full brief |
| GET | `/api/creators/earnings` | Earnings list |

### Apply to Campaign
```json
POST /api/creators/applications
{ "campaignId": "<campaign_id>" }
```

---

## Campaigns Admin (`/api/campaigns`) — Role: admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List all campaigns |
| GET | `/api/campaigns/:id` | Detail with applicants + assigned creators |
| POST | `/api/campaigns/:id/assign` | Assign creator (marks application approved) |

```json
POST /api/campaigns/:id/assign
{ "creatorId": "<creator_id>" }
```

---

## Deliverables (`/api/deliverables`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/deliverables` | Creator | Submit or resubmit deliverable |
| PATCH | `/api/deliverables/:id/review` | Brand / Admin | Approve/reject |
| GET | `/api/deliverables/admin?status=all` | Admin | List submissions |

### Submit Deliverable
```json
POST /api/deliverables
{ "campaignId": "<id>", "fileUrl": "https://drive.google.com/..." }
```

### Review Deliverable
```json
PATCH /api/deliverables/:id/review
{ "status": "approved", "feedback": "Great work!" }
```

---

## Brands Admin (`/api/brands`) — Role: admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/brands` | List all brands |
| PATCH | `/api/brands/:id/status` | Approve/reject brand |

```json
PATCH /api/brands/:id/status
{ "status": "approved" }
```

---

## Creators Admin (`/api/creators`) — Role: admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/creators` | List all creators |
| PATCH | `/api/creators/:id/status` | Approve/reject creator |

```json
PATCH /api/creators/:id/status
{ "status": "approved" }
```

---

## Payments (`/api/payments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/payments/admin` | Admin | List payments |
| POST | `/api/payments/reconcile` | Internal secret | Stripe checkout reconcile |
| POST | `/api/payments/webhook-complete` | Internal secret | Stripe webhook handler |

**Internal routes** require header: `x-internal-secret: <JWT_SECRET>`

### Reconcile
```json
POST /api/payments/reconcile
Header: x-internal-secret: <JWT_SECRET>
{
  "brandId": "...",
  "packageId": "...",
  "paymentIntentId": "pi_...",
  "amount": 267
}
```

---

## Admin Dashboard (`/api/admin`) — Role: admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/overview` | Stats, pending applications, submission counts, revenue, recent payments |

---

## Roles

| Role | Access |
|------|--------|
| `brand` | Brand dashboard, campaigns, billing, review deliverables |
| `creator` | Browse jobs, apply, assignments, submit deliverables, earnings |
| `admin` | All admin routes + assign creators + approve applications |

---

## Credit Packages

| Package | Credits |
|---------|---------|
| Starter | 267 |
| Growth | 534 |
| Scale | 890 |

Campaign creation cost: **89 credits**

---

## Error Responses

```json
{ "error": "Error message" }
```

Common status codes: `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict, `503` Service Unavailable (health/DB)
