# Smart Stock Savvy

Smart Stock Savvy is a React/TypeScript inventory management foundation for
organization-scoped retail data. The current repository includes inventory,
stock movement, supplier, purchase-order, simulation, and Supabase security
building blocks. AI agents and production forecasting are future phases.

## Architecture

- `frontend/src`: Vite React UI, TanStack Router/Query, and pure inventory calculations.
- `backend`: TypeScript services and TanStack Start middleware.
- `database`: Supabase PostgreSQL schema, RLS policies, triggers, functions, and seed data.

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- A Supabase project for database-backed development

## Installation and environment

```sh
npm install
copy .env.example .env
```

Set the Supabase values in `.env`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to
the browser or commit `.env`.

For local preview/dev testing only, set `VITE_ENABLE_PREVIEW_AUTH=true` to enable
explicit preview auth storage. Leave it disabled in production and do not use it as
a substitute for real Supabase auth.

## Development

```sh
npm run dev
```

## API foundation

The server-side API boundary is intentionally small and explicit. Requests under
`/api/*` are handled through a lightweight router, server-side auth validation,
and organization membership checks before any domain services are called. The
`/api/health` endpoint is public; `/api/me` requires an authenticated Supabase
session, and organization-scoped routes require membership validation.

## Intent routing and grounded agent orchestration

Phase 4B.2 introduces a fixed intent router that classifies user prompts into one of
`INVENTORY`, `FORECAST`, `SUPPLIER`, `RISK`, `REPORTING`, `MIXED`, or `UNKNOWN`.
The orchestrator then selects only the existing specialist agents and enforces a
hard execution cap for mixed requests. This helps keep agent execution bounded,
read-only, and grounded in the deterministic intelligence layer.

The final response is synthesized from actual specialist evidence and the
read-only inventory intelligence outputs. It does not invent product IDs,
quantities, dates, lead times, or numerical values when the underlying data is
missing or insufficient. Limitations are preserved in the structured response.

## Agent evaluation and grounding

Phase 4B.3 adds a lightweight deterministic evaluation layer under
`backend/agents/evaluation/`. The evaluator tests real routing behavior,
selects the fixed specialist allowlist, validates the least-privilege tool set,
and checks that synthesized answers remain grounded in the actual specialist and
intelligence outputs. The evaluation is intentionally not an ML benchmark: it is
repository code that asserts intent correctness, tool correctness, safety bounds,
and limitation propagation without calling the live OpenAI API.

Grounding means the agent answer may only state values supported by the
authenticated organization data and the deterministic intelligence functions. The
numerical source of truth remains the Phase 3 domain intelligence layer (demand
forecasting, risk scoring, reorder decisions, supplier evaluation, and reporting
summaries). Evaluation tests also prevent unsupported claims from being hidden by
an LLM summary and keep mixed-request execution bounded by
`MAX_SPECIALIST_EXECUTIONS`.

## Deterministic intelligence layer

The repository includes a read-only deterministic intelligence layer at
`backend/intelligence/`. These modules are intentionally pure and deterministic:

- `forecasting.ts` estimates demand with explicit insufficient-data handling.
- `inventory-risk.ts` scores stockout and expiry exposure.
- `reorder.ts` calculates conservative reorder actions.
- `supplier-evaluation.ts` evaluates supplier risk without inventing metrics.
- `recommendation.ts` produces explainable inventory recommendations.

The current forecasting system is a deterministic demand proxy based on available
inventory metadata such as capacity, velocity, and demand trend. It is NOT:

- historical sales forecasting
- an ML model
- seasonality-aware forecasting
- a statistically calibrated prediction

The `confidence` value is a heuristic score and the `stockoutProbability`
field is a heuristic risk indicator, not a calibrated probability. Supplier
risk evaluation is also a risk signal, not a measure of supplier reliability.
This layer does not call LLMs, mutate data, or create autonomous workflows. It is
meant to support human-in-the-loop decision support and future agent-ready APIs.

## Verification

```sh
npm run typecheck
npm test
npm run build
npm run build:backend
```

The database scripts are applied through the Supabase SQL editor or Supabase
CLI in migration order. See `database/README.md` for seed guidance.

## Agent safety and production reliability

This project includes a read-only agent service for inventory conversations. The runtime is intentionally bounded and must not mutate inventory, suppliers, purchase orders, or external systems.

Required server environment variables:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` for optional model-based refinement
- `OPENAI_MODEL` (default: `gpt-4o-mini`)

Model configuration:

- `OPENAI_API_KEY` is treated as server-side configuration only.
- Model calls are not retried repeatedly and are bounded by execution timeouts.
- When the model is unavailable, the system falls back to deterministic read-only routing rather than fabricating a successful answer.

Request safety:

- `POST /api/agent/query` rejects empty or whitespace-only bodies.
- JSON bodies must be valid before execution.
- Messages longer than 4,000 characters are rejected with `413` and code `message_too_large`.
- The request context and organization membership remain server-authoritative; user input cannot override them.

Execution bounds:

- `MAX_SPECIALIST_EXECUTIONS = 3`
- `maxTurns` stays bounded and model execution is wrapped in a request timeout.
- The runtime never creates dynamic agents or arbitrary tools.

Logging and safety:

- Structured audit metadata includes requestId, intent, specialist selection, duration, and execution status.
- Secrets, tokens, raw authorization headers, and provider internals are not included in logs or API responses.

## Frontend inventory assistant

The authenticated inventory page includes a read-only assistant backed by
`POST /api/agent/query`. The browser sends the current Supabase access token and
the selected organization as an `x-org-id` routing hint; backend authentication
and organization membership checks remain authoritative.

OpenAI configuration is server-only and is never sent to the frontend. The
assistant does not change inventory or supplier records, create purchase orders,
or communicate with external systems. Recommendations require human action.
Phase 4B.5 keeps assistant state transient in the browser and does not add
persistent chat memory.
