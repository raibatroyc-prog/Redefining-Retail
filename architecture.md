# Smart Stock Savvy (Redefining Retail) — System Architecture
## CIA-III | Digital Business Systems | ECD223-3

> Business scenario: **Inventory Management System** for small/medium retail
> businesses, with **two user roles** — Staff (day-to-day stock operations)
> and Manager/Owner (organization administration, purchasing, KPIs).

---

## 1. Business Problem and Target Users

### 1.1 Business Problem
Small and medium retail businesses commonly track stock using spreadsheets
or notebooks, which causes overstocking, stock-outs, missed expiries, slow
reordering decisions and no real-time visibility across staff. Smart Stock
Savvy replaces this with a centralized, multi-tenant web application that
tracks products, stock movements, suppliers and purchase orders, and uses a
demand/risk-based algorithm to recommend what to reorder and when.

### 1.2 Target Users (Roles)
| Role | Access | Typical actions |
|---|---|---|
| **Staff** (`org_role = staff`) | Own organization only | Log stock movements (sale/receipt/waste/adjustment), view products, view alerts, view suppliers |
| **Manager / Owner** (`org_role = manager` / `owner`) | Own organization only, elevated rights | Everything Staff can do, plus: manage products & suppliers, create/approve purchase orders, invite/manage members, view KPIs and reorder recommendations |

Every table is scoped by `org_id`, so the system is multi-tenant: one
deployment can serve many independent retail businesses ("organizations"),
each of which only ever sees its own data.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Vite, TanStack Router + TanStack Query, Tailwind-based UI components |
| Backend / API | TypeScript server functions on TanStack Start (`backend/api`, `backend/services`), Node.js runtime |
| Business logic / agents | TypeScript "intelligence" modules (`backend/intelligence`) plus an orchestrated agent layer (`backend/agents`) built on the OpenAI Agents SDK, used for natural-language assistant features |
| Authentication | Supabase Auth (JWT bearer tokens, verified server-side in `backend/middleware/auth.middleware.ts`) |
| Database | Supabase (managed PostgreSQL) with Row-Level Security (RLS) |
| Storage | Supabase project storage (available for receipts/attachments; schema is storage-ready) |
| Hosting (current) | Lovable platform (build + static/preview hosting) with the TanStack Start server functions |
| Testing | Vitest (`tests/*.test.ts`) |

---

## 3. Current System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│   React + TanStack Router UI  — Staff view / Manager view       │
└───────────────┬───────────────────────────────┬─────────────────┘
                 │ HTTPS (JSON)                  │ HTTPS
                 ▼                               ▼
     ┌───────────────────────┐        ┌─────────────────────────┐
     │  TanStack Start API   │        │  Agent Orchestrator      │
     │  backend/api/*        │◄──────►│  backend/agents/*         │
     │  - auth.ts            │        │  (router, forecast-agent, │
     │  - controllers/*      │        │  inventory-agent,          │
     │  - validation.ts      │        │  supplier-agent,            │
     └───────────┬────────────┘        │  risk-agent, reporting)   │
                 │                    └─────────────┬─────────────┘
                 │ verifies Bearer JWT                │ calls
                 ▼                                   ▼
     ┌──────────────────────────┐        ┌─────────────────────────┐
     │ auth.middleware.ts       │        │ intelligence/*            │
     │ (Supabase getClaims)     │        │ forecasting.ts, reorder.ts,│
     └───────────┬────────────┘        │ inventory-risk.ts,          │
                 │                     │ supplier-evaluation.ts,     │
                 ▼                     │ recommendation.ts, policy.ts│
     ┌──────────────────────────┐        └─────────────┬─────────────┘
     │ services/*                 │                    │ reads
     │ inventory.service.ts      │◄───────────────────┘
     │ organization.service.ts   │
     │ supplier.service.ts       │
     │ purchase-order.service.ts │
     │ report.service.ts         │
     └───────────┬────────────┘
                 │ Supabase client (RLS-enforced, per-user JWT)
                 ▼
     ┌──────────────────────────────────────────────────────────┐
     │           SUPABASE (managed PostgreSQL + Auth)             │
     │  organizations · profiles · org_members · suppliers ·      │
     │  products · stock_movements · purchase_orders ·            │
     │  purchase_order_items                                      │
     │  Row-Level Security + SECURITY DEFINER helper functions    │
     │  + triggers (stock updates, timestamps, new-user profile)  │
     └──────────────────────────────────────────────────────────┘
```

### 3.1 Data Layer — Entities

A full entity-relationship diagram is provided at
[`docs/er-diagram.svg`](./er-diagram.svg) (open it directly, or embed it as
an image in a Word/PDF export for submission).

8 tables satisfy the ≥6-entity / ≥4-attribute / identifiable-relationship
requirement:

| Entity | Key attributes | Relationships |
|---|---|---|
| `organizations` | id, name, slug, plan, created_by | 1—N `org_members`, `products`, `suppliers`, `purchase_orders` |
| `profiles` | id (=auth user), full_name, current_org_id | 1—1 with `auth.users`; 1—N `org_members` |
| `org_members` | org_id, user_id, role (owner/manager/staff) | N—1 `organizations`, N—1 `auth.users` |
| `suppliers` | id, org_id, name, category, on_time_rate | 1—N `products`, 1—N `purchase_orders` |
| `products` | id, org_id, sku, stock, capacity, velocity, demand_trend, expires_at, unit_cost | N—1 `organizations`, N—1 `suppliers`, 1—N `stock_movements` |
| `stock_movements` | id, product_id, type (sale/receipt/waste/adjustment), qty, actor_id | N—1 `products`, N—1 `auth.users` |
| `purchase_orders` | id, org_id, supplier_id, status, total, created_by | N—1 `suppliers`, 1—N `purchase_order_items` |
| `purchase_order_items` | id, po_id, product_id, qty, unit_cost | N—1 `purchase_orders`, N—1 `products` |

That gives well over the required 5 relationships (org↔members, org↔products,
org↔suppliers, product↔supplier, product↔movements, supplier↔PO, PO↔items,
items↔products).

### 3.2 Data Flow (Interface → Logic → Data → Output)
1. **Interface**: Staff/Manager performs an action in the React UI (e.g. logs
   a stock receipt, or opens the Reorder Recommendations panel).
2. **Application logic**: The request hits `backend/api`, is authenticated by
   `auth.middleware.ts` (verifies the Supabase JWT), then routed to the
   relevant `backend/services/*` function.
3. **Business logic**: For reorder recommendations, `services/inventory.service.ts`
   calls into `backend/intelligence/reorder.ts`, which in turn calls
   `forecasting.ts` and `inventory-risk.ts` (see Section 5 — Business
   Algorithm).
4. **Data layer**: The service reads/writes Supabase PostgreSQL through the
   Supabase client, with RLS enforcing that only rows belonging to the
   caller's `org_id` are visible or writable.
5. **Business output**: The API returns a decision object (action, priority,
   recommended quantity, reason) which the UI renders as an actionable
   dashboard card / alert for the Manager.

### 3.3 Working System — Business Operations Implemented

The CIA-III brief requires ≥3 meaningful business operations on the User
side and ≥3 management operations plus record management on the
Manager/Admin side, all wired end-to-end (UI → API → DB). As of 2026-09-11
these are implemented and connected (previously the services existed but
had no route/UI — see `docs/project-implementation.md` tasks T040–T046):

| Side | Operation | UI | API | Service |
|---|---|---|---|---|
| User (any role) | Record a stock transaction (receipt/sale/waste/adjustment) | `/inventory/$productId` — stock movement form | `POST /api/inventory/:id/movements` | `addStockMovement()` |
| User (any role) | View inventory with filters, expiry/low-stock status | `/inventory` | `GET /api/inventory` | `getProducts()` |
| User (any role) | View stock-movement/transaction history | `/inventory/$productId` | `GET /api/inventory/:id/movements` | `getStockMovements()` |
| Manager/Admin | Add a product/SKU | `/inventory` — product create form | `POST /api/inventory` | `createProduct()` |
| Manager/Admin | Add / update a supplier record | `/suppliers`, `/suppliers/$supplierId` | `POST /api/suppliers`, `PATCH /api/suppliers/:id` | `createSupplier()`, `updateSupplier()` |
| Manager/Admin | Create a draft purchase order + add line items | `/purchase-orders`, `/purchase-orders/$id` | `POST /api/purchase-orders`, `POST /api/purchase-orders/:id/items` | `createPurchaseOrder()`, `addPurchaseOrderItem()` |
| Manager/Admin | Approve/send, receive, or cancel a purchase order (status transaction) | `/purchase-orders/$id` — status actions | `PATCH /api/purchase-orders/:id/status` | `updatePurchaseOrderStatus()` |
| Manager/Admin | View KPIs (total stock, low-stock/overstock/expiring counts, average fill rate) | `/dashboard` | `GET /api/reports/inventory-summary` | `report.service.ts` |

All write operations require authentication and organization membership
(`requireAuthentication`, `authorizeOrganizationAccess`); Manager/Admin
operations additionally require `owner`/`manager` role via
`requireOrganizationRole()` (`backend/api/auth.ts`). The purchase-order
status transition is itself a small business rule (state machine): a PO
can only move `draft → sent → received` or be `cancelled` from `draft`/
`sent` — it cannot skip stages or leave a terminal state. Stock movements
of type `sale`/`waste` are rejected if the requested quantity exceeds
current stock on hand.

---

## 4. Current Hosting / Deployment Approach

- The frontend and TanStack Start server functions are built with Vite
  (`npm run build`) and are hosted through the Lovable platform, which
  serves the compiled `dist/` bundle and executes the server functions.
- The database, authentication and row-level security run on a managed
  Supabase project (PostgreSQL + Supabase Auth).
- Environment configuration (Supabase URL/keys) is supplied via `.env` /
  `backend/config.ts` and is not committed to source control.
- CI-equivalent checks: `npm run typecheck` and `npm run test` (Vitest) run
  locally/on demand before deployment.

This is sufficient for a low-to-moderate number of concurrent users; it is
**not** the target architecture for millions of users, which is addressed
below.

---

## 5. Business Algorithm — Reorder Decision Engine

*(Documented in the format required by the brief; implementation is
authoritative in `backend/intelligence/`.)*

**Problem being solved:** Given a product's current stock, capacity, sales
velocity and demand trend, decide automatically whether the product needs
no action, monitoring, a standard reorder, or an urgent reorder — and how
much to order — instead of a manager manually eyeballing every SKU.

**Input** (`IntelligenceProductLike`):
- `stock` (current units on hand)
- `capacity` (max shelf/storage units)
- `velocity` (`High` / `Medium` / `Low`)
- `demand_trend` (% change, −100..+100)
- optional `supplier.leadTimeDays`

**Processing logic** (pipeline):
1. `forecastDemand()` — estimates `averageDailyDemand` from
   `capacity × velocityFactor`, adjusted by `demand_trend`, and derives a
   `confidence` score and `dataQuality` flag (insufficient/partial/complete).
2. `analyzeInventoryRisk()` — converts current stock and forecast demand
   into `coverageDays` (how many days of stock remain) and a `riskLevel`
   (`low`/`medium`/`high`/`critical`).
3. `calculateReorderDecision()` — combines forecast + risk + supplier lead
   time to compute a `targetStock` and `projectedNeed`, caps the result by
   remaining capacity, and classifies the outcome:
   - `coverageDays ≤ 2` or risk = critical → **urgent_reorder** (priority: critical)
   - `coverageDays ≤ 5` or risk = high → **reorder** (priority: high)
   - `coverageDays ≤ 10` or risk = medium → **monitor** (priority: medium, half quantity)
   - otherwise → **no_action** (priority: low)

**Output** (`ReorderDecision`): `{ productId, action, priority,
recommendedQuantity, coverageDays, reason, dataQuality }`

**Pseudocode:**
```
function calculateReorderDecision(product, supplier):
    forecast = forecastDemand(product)
    risk     = analyzeInventoryRisk(product)
    if product invalid: return no_action("insufficient data")
    if stock >= capacity: return no_action("already full")

    targetStock   = avgDailyDemand * max(bufferDays, supplier.leadTimeDays)
    projectedNeed = ceil(targetStock + avgDailyDemand*2 - currentStock)
    qty           = min(projectedNeed, capacityRemaining)

    if risk == critical or coverageDays <= 2:  return urgent_reorder(qty)
    if risk == high     or coverageDays <= 5:  return reorder(qty)
    if risk == medium   or coverageDays <= 10: return monitor(qty * 0.5)
    return no_action
```

**Implemented in:**
- `backend/intelligence/forecasting.ts` (`dailyDemand`, `forecastDemand`)
- `backend/intelligence/inventory-risk.ts` (`analyzeInventoryRisk`)
- `backend/intelligence/reorder.ts` (`calculateReorderDecision`)
- Consumed by `backend/services/inventory.service.ts` and the
  `inventory-agent` in `backend/agents/inventory-agent.ts`
- Unit-tested in `tests/intelligence.test.ts`

**Example input:**
```json
{ "id": "p1", "stock": 8, "capacity": 200, "velocity": "High",
  "demand_trend": 12 }
```
**Example output:**
```json
{ "productId": "p1", "action": "urgent_reorder", "priority": "critical",
  "recommendedQuantity": 46, "coverageDays": 1.9,
  "reason": "Stock coverage is critically low and the item is at high risk of stockout.",
  "dataQuality": "complete" }
```

*(Secondary algorithms also present in the codebase and available for the
individual viva: `supplier-evaluation.ts` — on-time-rate based supplier
risk scoring; `recommendation.ts` — ranking of reorder candidates.)*

---

## 6. Proposed Cloud Deployment Architecture (AWS)

```
Users ─▶ Route 53 ─▶ CloudFront (CDN, static frontend + caching)
                         │
                         ▼
                 Application Load Balancer (ALB, multi-AZ)
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ECS Fargate      ECS Fargate      ECS Fargate      (API / server-function
   task (API)        task (API)       task (API)        containers, auto-scaled)
        │                │                │
        └────────────────┼────────────────┘
                         ▼
              Amazon RDS for PostgreSQL (Multi-AZ, primary)
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
        Read Replicas        Amazon ElastiCache (Redis)
      (reporting/dashboards)   (session cache, hot reads,
                                 rate-limit counters)

  Amazon S3 (product images / receipts)  ── CloudFront origin
  Amazon SQS (async jobs: reorder recompute, report generation)
  Amazon Cognito or Supabase (managed) — Auth, JWT issuance
  AWS WAF + Shield — edge security
  Amazon CloudWatch + X-Ray — monitoring, tracing, alarms
  AWS Backup — automated RDS/S3 snapshots
  Secrets Manager — DB credentials, API keys
```

- **Frontend**: static build served from S3 + CloudFront (global edge cache).
- **API**: containerized (Docker) TanStack Start server, deployed on ECS
  Fargate behind an ALB, scaled by target-tracking on CPU/requests.
- **Database**: Amazon RDS PostgreSQL (Multi-AZ) — a lift-and-shift of the
  current Supabase/Postgres schema, or continued use of Supabase's own
  managed infrastructure (which itself runs on AWS) at higher tiers.
- **Caching**: ElastiCache (Redis) in front of read-heavy endpoints
  (dashboards, KPI summaries, reorder recommendations).
- **Async work**: SQS + worker tasks for anything that doesn't need to block
  the request (nightly reorder recompute across all products, report
  generation, notification emails).
- **Security**: WAF at the edge, Secrets Manager for credentials, IAM least
  privilege per service, RLS retained at the database layer.
- **Observability**: CloudWatch metrics/alarms + X-Ray tracing across ALB →
  ECS → RDS.

---

## 7. Scaling to 1,000,000 and 5,000,000 Users

| Concern | At 1,000,000 users | At 5,000,000 users |
|---|---|---|
| **Application scaling** | ECS Fargate service auto-scales (e.g. 4–20 tasks) behind ALB; stateless API so horizontal scaling is linear | Scale to multiple ECS services per region, or split by microservice (auth, inventory, purchasing, reporting) so hot paths scale independently |
| **Database scaling** | RDS Multi-AZ + 1–2 read replicas for dashboards/reports; connection pooling (PgBouncer/RDS Proxy) | Read replicas per region + partition/shard large tables (`stock_movements`) by `org_id` range or time; consider Aurora PostgreSQL for storage auto-scaling |
| **Storage scaling** | S3 for images/receipts (already effectively infinite) | Same — S3 scales automatically; add lifecycle rules to move old data to Glacier |
| **Network scaling** | CloudFront CDN absorbs static asset + read traffic globally | Multi-region CloudFront + Route 53 latency routing to nearest API region |
| **Traffic management** | ALB + target-tracking auto-scaling policies | Add API Gateway/WAF rate limiting per organization to stop one tenant starving others |
| **Caching** | ElastiCache for dashboard/reorder-recommendation reads (short TTL, invalidated on stock_movement writes) | Multi-node Redis cluster, cache warm-up jobs, edge caching for public/marketing pages |
| **Load balancing** | Single-region ALB across AZs | Multi-region active-active with Route 53 health-check failover |
| **Security** | WAF, RLS, Secrets Manager, per-tenant isolation via `org_id` | Same controls at larger scale + dedicated security monitoring (GuardDuty), regular pen-testing |
| **Monitoring** | CloudWatch dashboards + alarms on latency/error-rate/DB CPU | Centralized observability (CloudWatch + X-Ray + log aggregation), SLO-based alerting, on-call rotation |
| **Backup & recovery** | Automated daily RDS snapshots, 7–30 day retention | Cross-region snapshot replication, documented RTO/RPO, periodic restore drills |

The multi-tenant design (every row scoped by `org_id`, enforced by RLS) is
what makes this scaling story tractable: sharding, rate-limiting and
per-tenant caching can all key off `org_id` without an application rewrite.

---

## 8. Quantitative Scalability Analysis

All calculations follow **Formula → Values → Calculation → Result → Interpretation.**

### 8.1 User growth (10,000 users, 25% annual growth)
**Formula:** `Users(n) = 10,000 × (1.25)^n`

| Year | Calculation | Result |
|---|---|---|
| 1 | 10,000 × 1.25 | **12,500** |
| 2 | 12,500 × 1.25 | **15,625** |
| 3 | 15,625 × 1.25 | **19,531** |
| 4 | 19,531.25 × 1.25 | **24,414** |
| 5 | 24,414.06 × 1.25 | **30,518** |

**Interpretation:** At 25%/year compounding, the user base roughly triples
in 5 years (10,000 → ~30,518). This is a manageable growth curve for the
horizontal auto-scaling design above, provided database and caching layers
are addressed before year 3–4 (~20–30K users), since that is typically when
a single-instance Postgres setup starts to show connection-pool pressure.

### 8.2 Peak concurrent users (10% of registered users active at peak)
**Formula:** `Concurrent = Registered × 0.10`

| Registered users | Calculation | Peak concurrent users |
|---|---|---|
| 100,000 | 100,000 × 0.10 | **10,000** |
| 500,000 | 500,000 × 0.10 | **50,000** |
| 1,000,000 | 1,000,000 × 0.10 | **100,000** |
| 5,000,000 | 5,000,000 × 0.10 | **500,000** |

**Interpretation:** At 5,000,000 registered users, the system must sustain
500,000 simultaneous sessions at peak. This is well beyond a single-server
deployment and requires the ALB + auto-scaled ECS Fargate fleet, connection
pooling (RDS Proxy) in front of Postgres, and Redis caching to avoid the
database becoming the bottleneck.

### 8.3 Requests per minute / per second (5 requests per active user per minute)
**Formula:** `RPM = ActiveUsers × 5`, `RPS = RPM / 60`

| Active users | RPM calculation | RPM | RPS |
|---|---|---|---|
| 10,000 | 10,000 × 5 | 50,000 | **833.3** |
| 50,000 | 50,000 × 5 | 250,000 | **4,166.7** |
| 100,000 | 100,000 × 5 | 500,000 | **8,333.3** |
| 500,000 | 500,000 × 5 | 2,500,000 | **41,666.7** |

**Interpretation:** At the 5,000,000-user tier (500,000 concurrent, ~41,667
requests/second sustained at peak), the API layer needs many parallel
Fargate tasks behind the ALB, aggressive read caching (most requests are
dashboard/reporting reads, not writes), and a database that can handle high
read concurrency (read replicas) while writes (`stock_movements`,
`purchase_orders`) stay on the primary. This figure is the key input for
sizing ALB target-tracking thresholds and RDS instance class.

---

## 9. Security Mechanisms (≥8, covering multiple areas)

| # | Mechanism | Component | Purpose | Threat Addressed |
|---|---|---|---|---|
| 1 | Supabase Auth JWT issuance | Authentication | Confirms user identity before any API call | Unauthenticated access |
| 2 | Server-side Bearer-token verification (`auth.middleware.ts` — `supabase.auth.getClaims`) | Authentication | Rejects requests with missing/invalid/expired tokens before they reach business logic | Token forgery, replay of invalid tokens |
| 3 | Row-Level Security (RLS) on every table, scoped by `org_id` | Authorization / Database security | Ensures a user can only read/write rows belonging to organizations they are a member of | Cross-tenant data leakage (IDOR) |
| 4 | Role-based policies (`owner`/`manager`/`staff` via `has_org_role()`) | Authorization | Restricts sensitive actions (e.g. updating org, managing members) to owners/managers | Privilege escalation |
| 5 | `REVOKE`d `SECURITY DEFINER` helper functions from `anon`/`authenticated`/`PUBLIC` (`SecurityPatches.sql`) | Database security | Prevents client-side callers from directly invoking privileged helper functions that bypass RLS checks | Function-based RLS bypass |
| 6 | Constrained self-insert policy on `org_members` (only as `owner`, only for an org you created, only if no members exist yet) | Database security | Prevents a user from granting themselves elevated membership in an arbitrary/existing organization | Self-granted privilege escalation |
| 7 | Input validation layer (`backend/api/validation.ts`, Zod schemas) | Application security | Rejects malformed/unexpected payloads before they hit services or the database | Injection, malformed-data corruption |
| 8 | Centralized error handling middleware that avoids leaking internals (`error.middleware.ts`, `error-capture.ts`) | Application security / monitoring | Returns safe error responses while still capturing details server-side for debugging | Information disclosure via stack traces |
| 9 | Environment-based secrets (`.env`, `backend/config.ts`, not committed) | Account/credential protection | Keeps Supabase keys/DB credentials out of source control | Credential leakage via repo |
| 10 | Automated Supabase/Postgres backups (managed platform) | Backup & recovery | Enables point-in-time restore after data loss/corruption | Accidental deletion, ransomware, data corruption |

*(10 mechanisms are listed, exceeding the required minimum of 8, across
authentication, authorization, database security, application security,
credential protection and backup/recovery.)*

---

## 10. Failure and Recovery Analysis

| Area | Failure | Impact | Detection | Recovery |
|---|---|---|---|---|
| **Application/server** | An API/server-function instance crashes or hangs (e.g. unhandled exception in an agent call) | Requests routed to that instance fail or time out | ALB health checks fail; CloudWatch alarm on 5xx rate / latency | ALB stops routing to the unhealthy target; ECS Fargate auto-replaces the task; stateless design means no session data is lost |
| **Database** | Supabase/RDS primary becomes unreachable or a bad migration corrupts data | Reads/writes fail org-wide; dashboards go blank | Connection errors surfaced to `error.middleware.ts`; CloudWatch/Supabase DB alarms on connection failures | Multi-AZ automatic failover to standby (RDS) / managed failover (Supabase); restore from latest automated snapshot for corruption; migrations are reviewed and reversible |
| **Network** | CDN/edge or regional network outage between client and API | Users in the affected region see timeouts | Synthetic uptime checks / Route 53 health checks fail | Route 53 fails over to a healthy region/endpoint; CloudFront serves cached static assets even if the API is briefly degraded |
| **Storage** | S3 bucket (receipts/images) becomes unavailable or an object is accidentally deleted | Missing images/attachments; upload failures | S3 error responses logged; CloudWatch alarms on 4xx/5xx from S3 | S3 versioning + lifecycle policy allows restoring the previous object version; cross-region replication for disaster recovery |
| **Security** | A leaked/stolen Supabase JWT or compromised credential is used to call the API | Attempted unauthorized access to an organization's data | RLS blocks any row outside the attacker's own `org_id`; anomalous access patterns flagged in logs | Immediately revoke/rotate the compromised token or key via Supabase Auth / Secrets Manager; RLS limits blast radius to the attacker's own org even before rotation; force re-authentication for affected users |

---

## 11. Documentation Status Note
This document (`docs/architecture.md`) is the authoritative, CIA-III-compliant
architecture document for the repository. Prior architecture notes retained
under `Documentation/Architecture.md` and `Documentation/implimentation.md`
were the working drafts produced earlier in development and are kept for
history; `docs/project-implementation.md` is the single, current work log.

**Verification note (2026-09-11):** the write endpoints described in
Section 3.3 were added and reviewed by source inspection (controllers,
routes, RBAC checks, and frontend wiring were read end-to-end and traced
by hand) and by a TypeScript-syntax parse of every changed file, but
**`npm install` / `npm run typecheck` / `npm test` / `npm run build` could
not be executed** in the environment these changes were made in (no
network access to the npm registry). Treat these operations as
source-verified but not build/test-verified until you run:
`npm install && npm run typecheck && npm test && npm run build`
and confirm they pass. Update the "Completed" status in
`docs/project-implementation.md` to reflect the real result.
