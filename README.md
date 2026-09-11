# Smart Stock Savvy

<img width="1254" height="1254" alt="image" src="https://github.com/user-attachments/assets/3af9b2b4-ac67-4706-b5ec-793a29dcf161" />


**Smart Stock Savvy** is a modern inventory management platform designed to help retail organizations monitor stock, understand inventory risks, evaluate suppliers, and make informed purchasing decisions.

The platform combines inventory management with deterministic analytics and a controlled AI assistant, allowing users to turn inventory data into clear and useful insights.

The current version provides an authenticated, read-only experience covering inventory, stock movements, suppliers, purchase orders, inventory analysis, and AI-assisted queries.

---

## Key Features

### Inventory Management

Smart Stock Savvy provides a centralized view of inventory and product information, helping users quickly understand their current stock position.

Users can access:

* Inventory summaries
* Product details
* Stock movements
* Supplier information
* Inventory-related insights

### Inventory Intelligence

The platform includes a deterministic intelligence layer that analyzes available inventory data to provide useful decision-support insights.

These include:

* Demand estimation
* Stockout risk
* Expiry risk
* Reorder recommendations
* Supplier risk evaluation
* Inventory recommendations
* Reporting summaries

The recommendations are designed to be explainable and are based only on the information available within the organization's data.

### AI Inventory Assistant

Smart Stock Savvy includes a read-only AI assistant that allows users to ask questions about their inventory using natural language.

User requests are automatically classified into relevant areas such as:

* Inventory
* Forecasting
* Suppliers
* Risk
* Reporting

The assistant then uses the appropriate specialist capabilities to provide a response based on the organization's available data.

The assistant does **not** independently modify inventory, create purchase orders, contact suppliers, or perform other business actions. Any recommended action remains under the user's control.

---

## Security and Organization Management

Smart Stock Savvy is designed for organization-based use, with security enforced at both the application and database levels.

The platform uses:

* Supabase Authentication
* PostgreSQL
* Row Level Security (RLS)
* Server-side organization membership checks
* Organization-aware API requests
* Secure server-side configuration

The organization selected by the frontend is treated only as a routing hint. Backend authentication and membership checks remain authoritative.

When users switch organizations, organization-specific application data is also isolated through organization-aware query management.

---

## Application Routes

The authenticated application currently includes the following areas:

| Route                               | Purpose                                                 |
| ----------------------------------- | ------------------------------------------------------- |
| `/login`                            | User authentication                                     |
| `/dashboard`                        | Inventory summaries, recommendations, and data insights |
| `/inventory`                        | Inventory overview                                      |
| `/inventory/$productId`             | Product details and stock movements                     |
| `/suppliers`                        | Supplier overview                                       |
| `/suppliers/$supplierId`            | Supplier details                                        |
| `/purchase-orders`                  | Purchase order overview                                 |
| `/purchase-orders/$purchaseOrderId` | Purchase order details and line items                   |

The current application is intentionally **read-only**.

It does not provide workflows for creating, editing, deleting, approving, cancelling, or receiving inventory and purchase orders.

---

## Deterministic Intelligence

The intelligence layer is located in `backend/intelligence/` and is designed to produce consistent, explainable results.

It includes:

* `forecasting.ts` — demand estimation
* `inventory-risk.ts` — stockout and expiry risk analysis
* `reorder.ts` — conservative reorder recommendations
* `supplier-evaluation.ts` — supplier risk evaluation
* `recommendation.ts` — inventory recommendations

These functions are deterministic and do not modify application data.

### Forecasting Approach

The current forecasting system uses available inventory information such as capacity, inventory velocity, and demand trends to generate a deterministic demand estimate.

It is important to note that the current implementation is **not**:

* A historical sales forecasting model
* A machine-learning model
* Seasonality-aware forecasting
* A statistically calibrated prediction system

Similarly, `confidence` and `stockoutProbability` are heuristic indicators rather than statistically calibrated probabilities.

This approach allows the current system to provide useful and transparent decision support while leaving room for more advanced forecasting methods in future versions.

---

## AI Agent Architecture

The AI assistant uses a controlled intent-routing system to determine what type of request a user is making.

Supported intents include:

* `INVENTORY`
* `FORECAST`
* `SUPPLIER`
* `RISK`
* `REPORTING`
* `MIXED`
* `UNKNOWN`

Based on the identified intent, the system selects the relevant specialist capabilities.

For requests involving multiple areas, specialist execution is strictly limited to maintain predictable and controlled system behaviour.

The assistant's final response is based on actual specialist results and deterministic intelligence outputs.

It does not invent product IDs, quantities, dates, lead times, or other numerical information when the required data is unavailable.

---

## Agent Safety

The AI layer has been designed with a strong focus on controlled execution and data safety.

The system:

* Does not modify inventory or supplier records.
* Does not create or approve purchase orders.
* Does not communicate with external systems.
* Does not create dynamic agents or unrestricted tools.
* Limits specialist execution.
* Validates authentication and organization membership on the server.
* Rejects invalid and oversized requests.
* Keeps API keys and sensitive configuration server-side.
* Does not include secrets or authorization information in logs.

If the AI model is unavailable, the system can fall back to deterministic, read-only processing rather than generating an unsupported response.

---

## Grounded Responses

A key principle of Smart Stock Savvy is that AI responses should remain **grounded in available data**.

The assistant can only provide numerical or factual claims that are supported by the authenticated organization's data and the deterministic intelligence layer.

When sufficient information is not available, the system communicates the limitation instead of generating an unsupported answer.

This ensures that the AI assistant functions as a **decision-support tool**, rather than presenting assumptions as facts.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* TanStack Router
* TanStack Query

### Backend

* TypeScript
* TanStack Start
* Server-side authentication
* API routing
* Agent orchestration
* Deterministic intelligence services

### Database

* Supabase
* PostgreSQL
* Row Level Security (RLS)
* Database policies
* Triggers
* Functions
* Seed data

### AI

* OpenAI API
* Controlled intent routing
* Specialist agent architecture
* Grounded response generation

---

## Project Structure

```text
frontend/src
    └── React interface, routing, queries and inventory calculations

backend
    └── API services, authentication, agent orchestration
        and deterministic intelligence

database
    └── PostgreSQL schema, RLS policies, triggers,
        functions, migrations and seed data
```

---

## API

The server-side API is intentionally small and controlled.

Requests under `/api/*` are processed through request validation, authentication, and organization membership checks before domain services are accessed.

### Available endpoints

* `/api/health` — public health check
* `/api/me` — authenticated user information
* `/api/agent/query` — authenticated inventory assistant

The `/api/agent/query` endpoint requires a valid authenticated session and organization membership.

Requests are limited to **4,000 characters**, and empty or invalid requests are rejected before processing.

---

## Environment Setup

### Prerequisites

* Node.js 22 or newer
* npm 10 or newer
* A Supabase project

### Installation

```sh
npm install
copy .env.example .env
```

Configure the required Supabase values in `.env`.

**Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit `.env` to the repository.**

For local preview and development testing only, preview authentication can be enabled using:

```text
VITE_ENABLE_PREVIEW_AUTH=true
```

This should remain disabled in production and should not be used as a replacement for Supabase authentication.

---

## Running the Application

Start the development server with:

```sh
npm run dev
```

---

## Testing and Verification

The project includes testing for API contracts, agent safety, intelligence functions, intent routing, grounding, and regression behaviour.

Run the following commands to verify the project:

```sh
npm run typecheck
npm test
npm run build
npm run build:backend
```

Database migrations should be applied through the Supabase SQL Editor or Supabase CLI in the specified migration order.

For database and seed information, refer to `database/README.md`.

---

## Current Scope

The current version focuses on **read-only inventory intelligence and decision support**.

The application does not currently include:

* Product creation or editing
* Inventory adjustments
* Supplier creation or editing
* Purchase order creation
* Purchase order approval or cancellation
* Purchase order receiving
* Automated supplier communication
* Email or messaging workflows
* Autonomous inventory actions

This keeps the current system focused on providing reliable information and recommendations while ensuring that final business decisions remain with the user.

---

## Future Potential

Smart Stock Savvy provides a foundation for expanding inventory operations with more advanced forecasting, analytics, automation, and intelligent workflows.

Future development can build upon the existing architecture while maintaining the project's focus on **security, transparency, reliable data, and human oversight**.

---

# Team

**Smart Stock Savvy** was developed by:

* Eeshani Srivastava
* Raibat Roy Choudhury
* Shrijini Samanta
* Sujishnu Bhattacharya
* Thiruharan Keshavan Pillai

---

### Smart Stock Savvy

**Making inventory data easier to understand and decisions easier to make.**
