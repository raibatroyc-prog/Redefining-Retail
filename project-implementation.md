# Project Implementation Tracker & Work Log
## Smart Stock Savvy (Redefining Retail) — CIA-III, ECD223-3

> **How this file was built:** every row below is grounded in the actual
> Git history of this repository (`git log --all`), not invented. The
> `Evidence` column gives the real short commit hash. **Each group member
> must still review their own rows and correct anything that doesn't match
> what they actually did** — a git commit alone is not proof of
> understanding, and you must be able to explain your rows in the viva.
>
> **Group members (name — GitHub account):**
> | Name | GitHub |
> |---|---|
> | Eeshani Srivastava | `Eeshani Srivastava` (commits authored under full name) |
> | Raibat Roy Choudhury | `raibatroyc-prog` |
> | Shrinjini Samanta | `shrinjinisamanta15` |
> | Sujishnu Bhattacharya | `sujishnu19` |
> | Thiruharan K | `thiruharank-star` |

### Status values used: Pending · In Progress · Completed · Blocked · Reopened

| Task ID | Task | Component | Assigned To | Status | Completed By | Date Completed | AI Assistance | Evidence |
|---|---|---|---|---|---|---|---|---|
| T001 | Initialize repository and project scaffold | Project Setup | Raibat Roy Choudhury (raibatroyc-prog) | Completed | Raibat Roy Choudhury (raibatroyc-prog) | 2026-07-03 | Yes | commit `40f4d79` "Initial commit" |
| T002 | Create initial database schema (organizations, profiles, products, etc.) | Database | Sujishnu Bhattacharya (sujishnu19) | Completed | Sujishnu Bhattacharya (sujishnu19) | 2026-09-02 | Yes | commit `3aedf18` "Create schema.sql" |
| T003 | Extend/initialize schema with full table set and constraints | Database | Raibat Roy Choudhury (raibatroyc-prog) | Completed | Raibat Roy Choudhury (raibatroyc-prog) | 2026-09-02 | Yes | commit `b5d5918` "Initialize database schema with tables and functions" |
| T004 | Implement DB functions and triggers (stock updates, timestamps, new-user profile) | Database | Raibat Roy Choudhury (raibatroyc-prog) | Completed | Raibat Roy Choudhury (raibatroyc-prog) | 2026-09-02 | Yes | commit `0d41cc3` "Implement functions and triggers for stock and user management" |
| T005 | Add SQL triggers for stock/product tables | Database | Sujishnu Bhattacharya (sujishnu19) | Completed | Sujishnu Bhattacharya (sujishnu19) | 2026-09-02 | Yes | commit `6ecdfb0` "Add SQL triggers for various tables" |
| T006 | Implement Row-Level Security policies and grants | Database / Security | Raibat Roy Choudhury (raibatroyc-prog) | Completed | Raibat Roy Choudhury (raibatroyc-prog) | 2026-09-02 | Yes | commit `d6f1f28` "Implement row-level security and grants in policies.sql" |
| T007 | Add security patches: revoke unsafe function access, harden self-insert policy | Database / Security | Raibat Roy Choudhury (raibatroyc-prog) | Completed | Raibat Roy Choudhury (raibatroyc-prog) | 2026-09-02 | Yes | commit `971da5a` "Add security patches for function access control" |
| T008 | Enhance security: revoke function access from anon/public, add supporting policies | Database / Security | Sujishnu Bhattacharya (sujishnu19) | Completed | Sujishnu Bhattacharya (sujishnu19) | 2026-09-02 | Yes | commit `aa03a20` "Enhance security by revoking function access and adding policies" |
| T009 | Update/finalize security policies and function access controls | Database / Security | Raibat Roy Choudhury (raibatroyc-prog) | Completed | Raibat Roy Choudhury (raibatroyc-prog) | 2026-09-02 | Yes | commit `0aab3ed` "Update security policies and function access controls" |
| T010 | Create backend HTTP server entry point | Backend | Eeshani Srivastava | Completed | Eeshani Srivastava | 2026-09-01 | Yes | commit `d52dcf9` "Create server.ts" |
| T011 | Create server startup/bootstrap logic | Backend | Eeshani Srivastava | Completed | Eeshani Srivastava | 2026-09-01 | Yes | commit `14197cc` "Create start.ts" |
| T012 | Implement Supabase authentication middleware (JWT verification) | Authentication | Eeshani Srivastava | Completed | Eeshani Srivastava | 2026-09-01 | Yes | commit `89475ab` "Add Supabase authentication middleware" |
| T013 | Implement centralized error-handling middleware | Backend | Eeshani Srivastava | Completed | Eeshani Srivastava | 2026-09-02 | Yes | commit `c01081a` / `db602b5` "Create/Update error.middleware.ts" |
| T014 | Implement inventory service (product & stock-movement CRUD) | Backend / API | Eeshani Srivastava | Completed | Eeshani Srivastava | 2026-09-02 | Yes | commit `91a31ad` "Create inventory.service.ts" |
| T015 | Implement supplier service | Backend / API | Eeshani Srivastava | Completed | Eeshani Srivastava | 2026-09-02 | Yes | commit `b535fcc` / `9da2bf2` "Create/Update supplier.service.ts" |
| T016 | Implement purchase-order service | Backend / API | Eeshani Srivastava | Completed | Eeshani Srivastava | 2026-09-02 | Yes | commit `032e960` / `73a8abf` "Create/Implement purchase-order.service.ts" |
| T017 | Implement organization service (CRUD) | Backend / API | Eeshani Srivastava | Completed | Eeshani Srivastava | 2026-09-02 | Yes | commit `28caac8` "Implement organization service with CRUD operations" |
| T018 | Create frontend router and route tree | Frontend | Shrinjini Samanta (shrinjinisamanta15) | Completed | Shrinjini Samanta (shrinjinisamanta15) | 2026-09-01 | Yes | commit `771dac1` / `b18a5fb` "Create router.tsx" / "Add router setup with React Query integration" |
| T019 | Create application shell (navigation/layout) | Frontend | Shrinjini Samanta (shrinjinisamanta15) | Completed | Shrinjini Samanta (shrinjinisamanta15) | 2026-09-01 | Yes | commit `1883640` "Create app-shell.tsx" |
| T020 | Add inventory route/page | Frontend | Shrinjini Samanta (shrinjinisamanta15) | Completed | Shrinjini Samanta (shrinjinisamanta15) | 2026-09-01 | Yes | commit `f8f053e` "Add inventory route with necessary imports" |
| T021 | Implement business algorithm: demand forecasting, inventory risk scoring and reorder decision engine (see architecture.md §5) | Backend / Algorithm | Shrinjini Samanta (shrinjinisamanta15) | Completed | Shrinjini Samanta (shrinjinisamanta15) | 2026-09-08 | Yes | commit `ec420c0` "Complete Phase 4B.4 agent reliability and safety" — `backend/intelligence/{forecasting,inventory-risk,reorder}.ts`; unit tests in `tests/intelligence.test.ts` |
| T022 | Build agent orchestrator and specialised agents (forecast/inventory/supplier/risk/reporting) around the algorithm | Backend / Integration | Shrinjini Samanta (shrinjinisamanta15) | Completed | Shrinjini Samanta (shrinjinisamanta15) | 2026-09-08 | Yes | commit `ec420c0`; `backend/agents/*` |
| T023 | Add authenticated agent-assistant UI (chat interface to the algorithm/agents) | Frontend / Integration | Sujishnu Bhattacharya (sujishnu19) | Completed | Sujishnu Bhattacharya (sujishnu19) | 2026-09-08 | Yes | commit `c6e56d4` "Add authenticated agent assistant UI" |
| T024 | Build read-only supplier management experience (Manager view) | Frontend | Sujishnu Bhattacharya (sujishnu19) | Completed | Sujishnu Bhattacharya (sujishnu19) | 2026-09-08 | Yes | commit `6f993e6` "Add read-only supplier experience" |
| T025 | Build read-only purchase-order experience (Manager view) | Frontend | Sujishnu Bhattacharya (sujishnu19) | Completed | Sujishnu Bhattacharya (sujishnu19) | 2026-09-08 | Yes | commit `3466011` "Add read-only purchase order experience" |
| T026 | Complete Phase 5 inventory experience (Staff dashboard) | Frontend | Sujishnu Bhattacharya (sujishnu19) | Completed | Sujishnu Bhattacharya (sujishnu19) | 2026-09-08 | Yes | commit `ac346a6` "Complete Phase 5 inventory experience" |
| T027 | Harden Phase 5 read-only experience (bug fixes / access-control review) | Frontend / QA | Sujishnu Bhattacharya (sujishnu19) | Completed | Sujishnu Bhattacharya (sujishnu19) | 2026-09-09 | Yes | commit `e7549c9` "Harden Phase 5 read-only experience" |
| T028 | Write automated tests for intelligence/algorithm modules | Testing | *(assign to whoever verified `tests/intelligence.test.ts`)* | Completed | — | 2026-09-08 | Yes | `tests/intelligence.test.ts`, `tests/agents.test.ts` |
| T029 | Write architecture documentation (original draft) | Documentation | Shrinjini Samanta (shrinjinisamanta15) / Sujishnu Bhattacharya (sujishnu19) | Completed | Shrinjini Samanta (shrinjinisamanta15) | 2026-08-28 | Yes | commit `a9a9820` "Create Architecture.md"; `2ed5413` |
| T030 | Write implementation work-log documentation (original draft) | Documentation | Eeshani Srivastava / Shrinjini Samanta (shrinjinisamanta15) | Completed | Shrinjini Samanta (shrinjinisamanta15) | 2026-08-28 – 2026-09-10 | Yes | commit `772c1ec`, `796aac2`, `268ce8b` |
| T031 | Restructure documentation into required `docs/architecture.md` and `docs/project-implementation.md` (CIA-III compliance), add quantitative scalability analysis, security table and failure/recovery table | Documentation | *(assign to the group member submitting this task)* | Completed | — | 2026-09-10 | Yes | `docs/architecture.md`, `docs/project-implementation.md` (this file) |
| T032 | Maintain README (business context, contributors, course details) | Documentation | Thiruharan K (thiruharank-star) / Sujishnu Bhattacharya (sujishnu19) / Raibat Roy Choudhury (raibatroyc-prog) | Completed | Thiruharan K (thiruharank-star) | ongoing | Yes | commits `6713982`, `d7f421c`, and README history |
| T033 | Manually verify the full working system end-to-end before submission (auth, CRUD, algorithm output, RLS isolation between two orgs) | Testing / QA | **Assign to a named student** | Pending | — | — | No (manual verification is not an AI task) | Follow `docs/t033-verification-checklist.md` and attach screenshots to `docs/evidence/` |
| T034 | Prepare and rehearse individual viva explanations for each student's own rows above | Documentation | **All students** | Pending | — | — | No | *(n/a — preparation task)* |
| T035 | Fix broken build: `frontend/src/routes/_authenticated.tsx` imported a non-existent `@/integrations/lovable/index` module and referenced undefined `supabase`/`useSession`/`LoadingState`, so `npm run typecheck` failed. Replaced with the real Supabase client import (`@/integrations/supabase/client`), the real `useSession` hook (`@/hooks/use-session`) and the real `LoadingState` component (`@/components/loading-state`) | Frontend / Bug fix | **Assign to whoever commits this fix** | Completed | — | 2026-09-10 | Yes | `npm run typecheck` now passes with 0 errors (was 5 errors before the fix) |
| T036 | **Runtime bug found (not yet fixed — needs a real secret value, see notes below):** `backend/config.ts` requires `SUPABASE_SERVICE_ROLE_KEY`, and `backend/middleware/auth.middleware.ts` calls `getServerConfig()` on every authenticated request. The committed `.env` only has `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` (+ `VITE_` copies) and is missing `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY`. Without the service-role key, **every authenticated API call will throw "Missing required environment variable" and fail** | Backend / Config | **Assign to whoever owns Supabase project settings** | Blocked | — | — | No | Confirmed by static review of `backend/config.ts` + `.env`; fix steps in `docs/t036-env-setup.md` |
| T037 | Create ER (entity-relationship) diagram for submission checklist item | Documentation | *(assign to the group member submitting this task)* | Completed | — | 2026-09-10 | Yes | `docs/er-diagram.svg` |
| T038 | **Critical fix:** `main` (the repository's default branch — what GitHub shows and what a fresh clone checks out) was missing 118 files versus `phase-4b4-complete`, including the **entire** `backend/agents/`, `backend/intelligence/` (the business algorithm), all `backend/api/controllers/`, and most of `frontend/src/components`/`hooks`. `main` had never been updated past an early snapshot while all Phase 4B/5 work landed only on the `phase-4b4-complete` branch. Anyone grading the default branch as-is would have seen almost none of the working system. Merged `phase-4b4-complete` into `main` (commit `4ad7d78`), keeping `main`'s more recently edited `README.md`/`Documentation/implimentation.md` where the two branches conflicted. Re-ran `npm run typecheck` on the merged result — 0 errors | Backend / Frontend / Repo hygiene | **Assign to whoever pushes this to GitHub** | Completed | — | 2026-09-10 | Yes | Local merge commit `4ad7d78` on `main`; `git ls-tree` diff confirmed `main` now matches `phase-4b4-complete`'s file set plus this session's docs |
| T039 | Add RBAC helper `requireOrganizationRole()` (looks up `org_members.role` and throws 403 if not in an allowed set) to fix the "read-only frontend despite write-capable backend" gap identified in T024–T027/T038 | Backend / Security | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `backend/api/auth.ts` (`getOrganizationRole`, `requireOrganizationRole`) |
| T040 | Add reusable JSON body-parsing and field-validation helpers (`parseJsonBody`, `requireString`, `requireEnum`, `requirePositiveNumber`, etc.) for write endpoints | Backend | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `backend/api/validation.ts` |
| T041 | Connect the previously-unreachable `createProduct()` and `addStockMovement()` service functions to new write endpoints (`POST /api/inventory`, `POST /api/inventory/:id/movements`), including a business rule rejecting a `sale`/`waste` movement that exceeds current stock | Backend / API | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `backend/api/controllers/inventory.controller.ts` (`create`, `recordMovement`) |
| T042 | Connect `createSupplier()` and `updateSupplier()` to new write endpoints (`POST /api/suppliers`, `PATCH /api/suppliers/:id`), manager/owner only | Backend / API | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `backend/api/controllers/supplier.controller.ts` (`create`, `update`) |
| T043 | Connect `createPurchaseOrder()`, `addPurchaseOrderItem()`, `updatePurchaseOrderStatus()` to new write endpoints, and implement the PO status **state-machine business rule** (`draft → sent → received`, or `cancelled` from `draft`/`sent`; no other transitions), manager/owner only | Backend / API / Algorithm | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `backend/api/controllers/purchase-order.controller.ts` (`create`, `addItem`, `updateStatus`, `PO_STATUS_TRANSITIONS`) |
| T044 | Wire T041–T043's controller methods into the router with method-based dispatch (`POST`/`PATCH` vs `GET` on the same path), preserving the existing dependency-injection pattern used by tests | Backend | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `backend/api/routes/index.ts` (`ApiRouteDependencies`, `handleApiRequest`) |
| T045 | Add frontend write support: `requestMutationApi()` in the API client, and mutation hooks + forms for recording stock movements, creating products, creating/updating suppliers, and creating purchase orders / adding line items / changing PO status — wired into the existing routes behind an `owner`/`manager`-only UI guard (backend RBAC in T039 is the real enforcement; the UI guard just avoids showing a form the user can't submit) | Frontend | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `frontend/src/lib/api-client.ts` (`requestMutationApi`); `frontend/src/hooks/use-record-stock-movement.ts`, `use-supplier-mutations.ts`, `use-purchase-order-mutations.ts`, `use-create-product.ts`; `frontend/src/components/stock-movement-form.tsx`, `supplier-form.tsx`, `supplier-status-form.tsx`, `purchase-order-create-form.tsx`, `purchase-order-item-form.tsx`, `purchase-order-status-actions.tsx`, `product-create-form.tsx`; wired into `frontend/src/routes/_authenticated/{inventory,inventory.$productId,suppliers,suppliers.$supplierId,purchase-orders,purchase-orders.$purchaseOrderId}.tsx` |
| T046 | Add automated tests for the new write endpoints: routing dispatch for every new `POST`/`PATCH` path, ApiError→HTTP-status/code mapping (403 RBAC, 400 validation, 400 illegal PO transition), and the PO status transition table | Testing | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `tests/write-operations.test.ts` |
| T047 | Reconcile documentation with T039–T046: added a "Working System — Business Operations Implemented" mapping table to `docs/architecture.md` §3.3, and a "Phase 6 — Write operations added" section to `Documentation/Architecture.md` correcting the now-outdated "Explicit Phase 5 boundary" (read-only) claim | Documentation | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `docs/architecture.md` §3.3, §11; `Documentation/Architecture.md` "Phase 6" section |
| T048 | **Run and confirm the full verification chain for T039–T046** — `npm install && npm run typecheck && npm test && npm run build` — on a machine/CI runner with network access to the npm registry, and fix anything that fails. T039–T046 above were verified by careful source inspection and a TypeScript-syntax parse only (no dependencies could be installed in the environment that wrote the code, so no real typecheck/test/build run was possible there) | Testing / Backend / Frontend | **Assign to a named student** | Pending | — | — | No (must be run by a human/CI with network access — this is exactly what T033 already required for the rest of the system) | Run the four commands above from the repository root; attach the terminal output (or a CI run link) as evidence and flip this row to Completed or Reopened |
| T049 | `.gitignore` already excluded `.env`/`.env.*` and explicitly un-ignored `.env.example`, but no `.env.example` file existed, so a fresh clone had no record of which environment variables the app needs (only discoverable by reading `backend/config.ts`). Added `.env.example` with placeholder values for every variable `backend/config.ts` reads (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`) — no real secrets included | Documentation / Config | **Assign to the group member submitting this task** | Completed | — | 2026-09-11 | Yes | `.env.example` |

---

## Notes for the group

1. **T048 is now the most important remaining task** (alongside T033).
   This session (2026-09-11) connected the previously-unreachable backend
   write functions to real API endpoints and UI forms, closing the
   "read-only frontend" gap flagged in T024–T027/T038. That code was
   reviewed carefully by hand and passed a TypeScript-syntax parse, but
   **could not be run** in that environment (no network access to install
   dependencies). Before anything in T039–T046 is treated as verified for
   grading purposes, run `npm install && npm run typecheck && npm test &&
   npm run build` yourself and record the result against T048.
2. **T033 is also still open.** Everything above proves code exists and
   was committed; it does not by itself prove the system runs end-to-end
   today, or that RLS actually blocks cross-organization access. Before
   submission, one student should be assigned to log in as two different
   organizations and confirm data isolation, then record the result
   (screenshot/steps) as evidence and flip T033 to Completed.
3. **AI assistance was used throughout** (Lovable + AI coding agent commits
   appear as "Agent host session..." in `git log`). This is permitted by
   the brief, but *every* student listed as "Completed By" above must be
   able to explain, in their own words, what the code in their rows does
   and why — that is what the viva and problem-solving challenge test.
4. If any row above misattributes work (e.g. two people pair-programmed a
   task, or the GitHub account doesn't match the actual person), correct it
   directly in this file before submission — this file, not the commit
   log alone, is treated as the authoritative contribution record.
5. Add new rows here **as you do further work** — don't reconstruct this
   at the end.
6. **T036 needs a human, not code:** add `SUPABASE_SERVICE_ROLE_KEY` (and,
   optionally, `OPENAI_API_KEY` for the agent-assistant feature) to `.env`
   locally and to your deployment's environment variables. Get the service
   role key from Supabase → Project Settings → API → `service_role` secret.
   **Never commit it to Git** — keep it only in `.env` (already
   git-ignored) and in your deployment platform's secret manager.
