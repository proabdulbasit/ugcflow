# UGCFlow API Reference

**Base URL:** `http://localhost:4000`  
**Auth:** JWT via `Authorization: Bearer <token>` or httpOnly cookie `token`

---

## Import into Postman

1. Open Postman → **Import**
2. Import these files:
   - `backend/postman/UGCFlow-API.postman_collection.json`
   - `backend/postman/UGCFlow-Local.postman_environment.json`
3. Select environment **UGCFlow Local**
4. Run **Auth → Login** (token auto-saves to `{{token}}`)

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check `{ ok: true }` |

---

## Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register brand or creator |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/logout` | No | Clear session cookie |
| GET | `/api/auth/me` | Yes | Current user + role data |
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

### Promote Admin
```
POST /api/auth/promote-admin
Header: x-admin-seed-secret: <ADMIN_SEED_SECRET>
Body: { "email": "user@example.com" }
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
| GET | `/api/brands/campaigns/:id` | Campaign + deliverables |

### Create Campaign
```json
POST /api/brands/campaigns
{ "title": "Summer UGC", "brief": "30s TikTok review" }
```

---

## Creator (`/api/creators`) — Role: creator

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/creators/overview` | Dashboard stats |
| GET | `/api/creators/browse` | Browse active campaigns (approved only) |
| POST | `/api/creators/applications` | Apply to campaign |
| GET | `/api/creators/assignments` | List assignments |
| GET | `/api/creators/assignments/:campaignId` | Assignment detail |
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
| GET | `/api/campaigns/:id` | Campaign detail + creators |
| POST | `/api/campaigns/:id/assign` | Assign creator |

```json
POST /api/campaigns/:id/assign
{ "creatorId": "<creator_id>" }
```

---

## Deliverables (`/api/deliverables`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| PATCH | `/api/deliverables/:id/review` | Brand / Admin | Approve/reject |
| GET | `/api/deliverables/admin?status=all` | Admin | List submissions |

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
| POST | `/api/payments/reconcile` | No | Stripe checkout reconcile |
| POST | `/api/payments/webhook-complete` | Internal secret | Stripe webhook handler |

### Reconcile
```json
POST /api/payments/reconcile
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
| GET | `/api/admin/overview` | Dashboard overview (stats, pending applications, payments, submission counts) |

---

## Roles

| Role | Access |
|------|--------|
| `brand` | Brand dashboard, campaigns, billing |
| `creator` | Browse jobs, assignments, earnings |
| `admin` | All admin routes + all dashboards |

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

Common status codes: `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict
