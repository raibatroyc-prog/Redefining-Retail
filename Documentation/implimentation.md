# Smart Stock Savvy — Project Implementation Work Log

This document records the significant development tasks undertaken during the implementation of the Smart Stock Savvy inventory management system. It is the group's single, authoritative work log and contribution record, per the CIA-III brief (Section 8).

## Implementation Work Log

| Task ID | Task | Component | Assigned To | Status | Completed By | Date Completed | AI Assistance | Evidence |
|---|---|---|---|---|---|---|---|---|
| T001 | Set up project structure and development environment | Project Setup | Sujishnu | Completed | Sujishnu | 20 Aug | Yes | Lovable project / Git commit |
| T002 | Design application navigation and overall UI structure | Frontend | Sujishnu | Completed | Sujishnu | 20 Aug | Yes | Lovable project / UI screens |
| T003 | Create authentication and login interface | Authentication | Eeshani | Completed | Eeshani | 21 Aug | Yes | Authentication screen / Git commit |
| T004 | Create inventory management dashboard | Frontend | Sujishnu | Completed | Sujishnu | 21 Aug | Yes | Dashboard screen |
| T005 | Implement product/inventory data structure | Database | Eeshani | Completed | Eeshani | 22 Aug | Yes | Database schema / Git commit |
| T006 | Implement product creation and editing functionality | Backend/API | Eeshani, Raibat | Completed | Eeshani, Raibat | 22 Aug | Yes | Application functionality / Git commit |
| T007 | Implement stock quantity tracking | Backend/Algorithm | Raibat | Completed | Raibat | 23 Aug | Yes | Stock management functionality |
| T008 | Implement low-stock identification and alerts | Backend/Algorithm | Raibat | Completed | Raibat | 23 Aug | Yes | Low-stock dashboard / Git commit |
| T009 | Implement inventory search and filtering | Frontend | Sujishnu | Completed | Sujishnu | 23 Aug | Yes | Search/filter functionality |
| T010 | Create dashboard statistics and inventory summaries | Frontend/Analytics | Sujishnu, Shrinjini | Completed | Sujishnu, Shrinjini | 24 Aug | Yes | Dashboard statistics |
| T011 | Connect frontend components with backend/database | Integration | Shrinjini | Completed | Shrinjini | 24 Aug | Yes | Application/database integration |
| T012 | Test product addition, editing and stock updates | Testing | Shrinjini | Completed | Shrinjini | 24 Aug | Yes | Test results / application demo |
| T013 | Test authentication and user access | Testing/Authentication | Shrinjini, Eeshani | Completed | Shrinjini, Eeshani | 24 Aug | Yes | Authentication test |
| T014 | Improve responsive UI and fix interface issues | Frontend/UI | Shrinjini, Sujishnu | Completed | Shrinjini, Sujishnu | 25 Aug | Yes | Updated published application |
| T015 | Deploy and publish Smart Stock Savvy | Deployment | Shrinjini, Sujishnu | Completed | Shrinjini, Sujishnu | 25 Aug | Yes | Published URL |
| T016 | Prepare cloud deployment architecture for large-scale usage | Cloud Architecture | Thiruharan | Completed | Thiruharan | 25 Aug | Yes | architecture.md |
| T017 | Document current architecture and proposed AWS architecture | Documentation | Thiruharan | Completed | Thiruharan | 25 Aug | Yes | architecture.md |
| T018 | Final system testing and verification | Testing | Shrinjini | Completed | Shrinjini | 25 Aug | Yes | Final published application |
| T019 | Develop and integrate Retail Intelligence Agent for inventory decision support | AI / Application Logic | Shrinjini | Completed | Shrinjini | 10 Sep | Yes | `retail-agent.ts`, `retail-agent.tsx`, App Shell integration |
| T020 | Review remaining issues and improvements | Testing/QA | Shrinjini | In Progress | — | — | Yes | Issue list / project review |
| T021 | Final documentation and submission preparation | Documentation | Shrinjini, Thiruharan | In Progress | — | — | Yes | Project documentation |
| T022 | Configure Supabase project and PostgreSQL database | Backend/Database | Eeshani | Completed | Eeshani | 22 Aug | Yes | Supabase project / database |
| T023 | Create organizations and user profile tables | Database | Eeshani | Completed | Eeshani | 22 Aug | Yes | Database schema |
| T024 | Implement organization membership and user roles | Authentication/Database | Eeshani | Completed | Eeshani | 23 Aug | Yes | `org_members` / RLS |
| T025 | Implement Row-Level Security policies | Database/Security | Eeshani | Completed | Eeshani | 23 Aug | Yes | RLS policies |
| T026 | Create products and suppliers database relationships | Database | Eeshani | Completed | Eeshani | 23 Aug | Yes | Database schema |
| T027 | Implement stock movement database structure | Database | Eeshani | Completed | Eeshani | 23 Aug | Yes | `stock_movements` table |
| T028 | Implement purchase order database structure | Database | Eeshani | Completed | Eeshani | 24 Aug | Yes | Purchase order tables |
| T029 | Implement stock IN/OUT business logic | Backend/Algorithm | Raibat | Completed | Raibat | 24 Aug | Yes | Stock movement functionality |
| T030 | Implement reorder-level and stock-risk logic | Backend/Algorithm | Raibat | Completed | Raibat | 24 Aug | Yes | Inventory logic |
| T031 | Implement supplier management functionality | Frontend/Backend | Sujishnu, Eeshani | Completed | Sujishnu, Eeshani | 25 Aug | Yes | Supplier interface |
| T032 | Implement stock request workflow | Frontend/Backend | Sujishnu, Eeshani | Completed | Sujishnu, Eeshani | 25 Aug | Yes | Stock request interface |
| T033 | Implement request status tracking | Frontend/Backend | Sujishnu | Completed | Sujishnu | 25 Aug | Yes | My Requests page |
| T034 | Implement inventory data fetching from Supabase | Integration | Shrinjini, Eeshani | Completed | Shrinjini, Eeshani | 26 Aug | Yes | Supabase queries |
| T035 | Implement real-time inventory updates | Backend/Integration | Eeshani | Completed | Eeshani | 26 Aug | Yes | Supabase Realtime |
| T036 | Implement loading, validation and error states | Frontend | Sujishnu | Completed | Sujishnu | 27 Aug | Yes | UI screens |
| T037 | Test role-based access for users | Security/Testing | Shrinjini, Eeshani | Completed | Shrinjini, Eeshani | 27 Aug | Yes | Authentication tests |
| T038 | Test inventory transaction accuracy | Testing | Shrinjini | Completed | Shrinjini | 28 Aug | Yes | Test results |
| T039 | Test stock request workflow end-to-end | Testing | Shrinjini | Completed | Shrinjini | 28 Aug | Yes | Workflow test |
| T040 | Test supplier and purchase order workflow | Testing | Shrinjini | Completed | Shrinjini | 29 Aug | Yes | Test results |
| T041 | Integrate inventory recommendation logic with Retail Intelligence Agent | AI/Application Logic | Shrinjini, Raibat | Completed | Shrinjini, Raibat | 10 Sep | Yes | `retail-agent.ts` |
| T042 | Connect Retail Intelligence Agent to application interface | Frontend/AI Integration | Shrinjini | Completed | Shrinjini | 10 Sep | Yes | `retail-agent.tsx` / App Shell |
| T043 | Test Retail Intelligence Agent with inventory scenarios | AI/Testing | Shrinjini | Completed | Shrinjini | 10 Sep | Yes | Agent test cases |
| T044 | Validate agent recommendations against inventory data | AI/Testing | Raibat | Completed | Raibat | 10 Sep | Yes | Agent responses |
| T045 | Review application security and access controls | Security/QA | Eeshani, Shrinjini | Completed | Eeshani, Shrinjini | 10 Sep | Yes | Security review |
| T046 | Review application performance and scalability requirements | Cloud/Scalability | Thiruharan | Completed | Thiruharan | 10 Sep | Yes | Scalability analysis |
| T047 | Prepare 1-million-user scalability architecture | Cloud Architecture | Thiruharan | Completed | Thiruharan | 10 Sep | Yes | `architecture.md` |
| T048 | Prepare 5-million-user scalability architecture | Cloud Architecture | Thiruharan | Completed | Thiruharan | 10 Sep | Yes | `architecture.md` |
| T049 | Prepare database and ER documentation | Documentation | Eeshani, Thiruharan | Completed | Eeshani, Thiruharan | 10 Sep | Yes | `database.md` |
| T050 | Compile final implementation evidence | Documentation/QA | Shrinjini | In Progress | — | — | Yes | Screenshots / commits |
| T051 | Conduct final demonstration testing | Testing | Shrinjini | In Progress | — | — | Yes | Final test checklist |
| T052 | Finalize technical documentation and submission | Documentation | Shrinjini, Thiruharan | In Progress | — | — | Yes | Final submission |
| T053 | **Live organization-isolation (RLS) verification:** created two brand-new separate workspaces with distinct test accounts, added distinct test products/suppliers/purchase orders to each, and confirmed from Workspace A's session that Workspace B's data was invisible in the UI, not listed in the workspace switcher, and could not be read or modified via direct requests; confirmed an unauthenticated request was rejected; confirmed a staff-role test user could record stock movements (stock correctly updated 4 → 2 on a sale, triggering a correct high-priority reorder suggestion) but was correctly blocked from adding suppliers/purchase orders. **One gap found during this test:** a staff-role user could also create products, which should have been owner/manager-only — see T054 for the fix and re-verification | Security / Testing | Shrinjini | Completed | Shrinjini | 14 Sep 2026 | Yes (test executed with AI agent assistance; reviewed and confirmed by Shrinjini) | Isolation-test screenshots/log (attach to evidence folder) |
| T054 | **Fix for the gap found in T053:** restricted product creation (add / import / delete) to `owner`/`manager` roles only, both in the Supabase RLS policy on `products` and in the Settings page UI (staff now see an explanatory note instead of the product forms); stock-movement recording was deliberately left open to all workspace members and re-confirmed still working after the change | Database/Security, Frontend | Shrinjini | Completed | Shrinjini | 14 Sep 2026 | Yes (fix implemented with AI assistance; applied and re-verified by Shrinjini) | Updated RLS policy on `products`; updated Settings page; re-tested with the T053 staff test account — product creation now blocked, stock-movement recording still succeeds |

---

# Work Log Details

### T001 — Project Setup

The Smart Stock Savvy project was initialized using Lovable. The initial project structure, frontend environment and application configuration were established.

**Primary contribution:** Sujishnu, with support from the team.

### T002 — UI and Navigation

The main navigation structure and user interface for the inventory management system were designed. The interface was structured to allow users to access inventory information and management functions easily.

**Primary contribution:** Sujishnu, with UI/UX support from Shrinjini.

### T003 — Authentication

The authentication interface and protected application flow were implemented to provide controlled access to the inventory management system.

**Primary contribution:** Eeshani, with frontend implementation support from Sujishnu.

### T004 — Inventory Dashboard

The main inventory dashboard was created, providing users with a centralized view of stock information and important inventory indicators.

**Primary contribution:** Sujishnu, with analytics and UI/UX support from Shrinjini.

### T005 — Database Structure

The inventory data model was designed to support products, users, suppliers, stock quantities and inventory transactions. Persistent PostgreSQL storage was configured through Supabase.

**Primary contribution:** Eeshani.

### T006 — Product Management

Product management functionality was implemented, allowing authorized users to add, modify and manage inventory information.

**Primary contribution:** Eeshani and Raibat, with frontend integration support from Sujishnu.

### T007 — Stock Tracking

Stock quantity tracking was implemented so that the system maintains current product quantities and reflects inventory changes through stock movement operations.

**Primary contribution:** Raibat, with database integration support from Eeshani.

### T008 — Low-Stock Identification and Alerts

The system identifies products whose stock levels fall below defined thresholds and presents alerts to help users identify products that may require replenishment.

**Primary contribution:** Raibat, with frontend and testing support from Shrinjini.

### T009 — Search and Filtering

Search and filtering functionality was implemented to allow users to locate relevant inventory records efficiently.

**Primary contribution:** Sujishnu, with testing and usability review by Shrinjini.

### T010 — Dashboard Analytics

Inventory statistics and summaries were incorporated into the dashboard to provide users with a quick overview of the current inventory situation.

**Primary contribution:** Sujishnu and Shrinjini.

### T011 — Frontend and Backend Integration

Frontend components were connected with the backend and database layer so that application operations could work with persistent inventory information.

**Primary contribution:** Shrinjini, with support from Sujishnu and Eeshani.

### T012 — Functional Testing

Important inventory operations were tested, including product creation, editing, stock updates and inventory workflows.

**Primary contribution:** Shrinjini, with support from Raibat.

### T013 — Authentication Testing

Authentication-related functionality was tested to verify that the login and protected application flow operated correctly.

**Primary contribution:** Shrinjini and Eeshani.

### T014 — UI Improvements and Issue Resolution

The interface was reviewed for usability, consistency and responsiveness. Issues identified during testing were investigated and corrected where possible.

**Primary contribution:** Shrinjini and Sujishnu.

### T015 — Deployment

The application was deployed and published as a live web application.

**Current published application:**

https://smart-stock-savvy-47.lovable.app

**Primary contribution:** Shrinjini and Sujishnu, with deployment support from Thiruharan.

### T016 — Cloud Architecture

A scalable cloud deployment architecture was designed using AWS services including Amazon S3, CloudFront, AWS WAF, Application Load Balancer, ECS/Fargate, RDS PostgreSQL, ElastiCache and SQS.

**Primary contribution:** Thiruharan.

### T017 — Architecture Documentation

The current system architecture and proposed AWS cloud architecture were documented in `architecture.md`, including data flow, scalability and deployment considerations.

**Primary contribution:** Thiruharan, with documentation and technical review support from Shrinjini.

### T018 — Final System Testing

The team participated in final testing of the completed application using the published deployment to verify the main user interface and inventory-management workflow.

**Primary contribution:** Shrinjini, with testing support from all team members.

### T019 — Retail Intelligence Agent

A **Retail Intelligence Agent** was developed and integrated into Smart Stock Savvy as an inventory decision-support feature.

The agent is a local, rules-based application component that works with the application's inventory data rather than requiring a separate external AI API.

It can assist users with questions and decisions related to:

* Products requiring replenishment.
* Low-stock and critical-stock items.
* Potential stockout risks.
* Overstock situations.
* Inventory value.
* Expiry and waste risks.
* Demand trends.
* Supplier performance.
* Individual product/SKU information.
* Overall inventory health.

The agent uses the existing inventory and recommendation logic to provide explainable business outputs. This allows the feature to function as a **Retail Intelligence / Decision Support Agent** while remaining connected to the actual inventory system.

**Primary contribution:** Shrinjini.

**Supporting contributions:**

* Raibat — inventory business rules and interpretation of stock-related logic.
* Eeshani — database/data access support.
* Sujishnu — interface integration and presentation.
* Thiruharan — documentation and scalability consideration.

**Technical evidence:**

* `src/lib/retail-agent.ts`
* `src/components/retail-agent.tsx`
* App Shell integration
* Inventory/Supplier data integration

### T020 — Remaining Issues and Improvements

The application is being reviewed for remaining bugs, technical issues and possible improvements before final submission.

Activities include checking application workflows, validating important functionality, reviewing UI behaviour and identifying issues that may affect the final demonstration.

**Primary contribution:** Shrinjini, with testing and technical review support from the team.

### T021 — Final Documentation and Submission Preparation

The team is completing the required technical documentation and preparing the project for final submission and demonstration.

This includes reviewing the architecture documentation, implementation work log, business algorithm documentation, database/ER documentation, scalability analysis, security analysis, failure/recovery analysis and final evidence.

**Primary contribution:** Shrinjini and Thiruharan, with relevant technical inputs from all team members.

### T053 — Organization Isolation (RLS) Verification

Two brand-new test accounts and two separate workspaces ("companies") were created through the normal sign-up flow, each seeded with its own distinctly-named products and suppliers. From Workspace A's authenticated session:

* The inventory page showed only Workspace A's own items; Workspace B's items never appeared, including in the workspace switcher.
* Every attempted read, edit, or write against Workspace B's data from Workspace A's session was blocked or returned nothing; Workspace B's stock was confirmed unchanged afterward.
* A request made with no authentication was rejected.
* A staff-role test user was correctly blocked from adding suppliers or purchase orders, but was allowed to record stock movements — a sale correctly reduced stock from 4 to 2 units, and the reorder engine correctly produced a high-priority replenishment suggestion in response.
* **Gap found:** the same staff-role test user was still able to create new products, which is a manager/admin-level operation and should have been blocked. See T054.

**Primary contribution:** Shrinjini — the test itself was executed with AI agent assistance, but Shrinjini directed the test and is responsible for being able to explain the result and methodology in the viva.

### T054 — Restrict Product Creation to Owner/Manager

Following the gap identified in T053, product creation (adding, importing, or deleting products) was restricted to `owner`/`manager` roles:

* The Supabase Row-Level Security policy governing writes to the `products` table was updated so only `owner`/`manager` roles can insert/update/delete rows; all workspace members can still read.
* The Settings page now shows staff-role users a short explanatory note in place of the add/import/delete product forms.
* Stock-movement recording (receipts, sales, waste, adjustments) was deliberately left open to all workspace members, since that is a day-to-day staff-level transaction, not a catalog-management operation.
* Re-tested with the same staff test account from T053: product creation is now blocked, and stock-movement recording still succeeds.

**Primary contribution:** Shrinjini.

---

# AI Assistance Record

AI tools were used during development for activities including:

* Generating and refining UI components.
* Suggesting application structure.
* Assisting with frontend implementation.
* Assisting with backend/API logic.
* Debugging and resolving implementation issues.
* Suggesting database structures and relationships.
* Assisting with inventory business logic.
* Supporting development of the Retail Intelligence Agent.
* Improving technical documentation.
* Designing the proposed cloud architecture.
* Assisting with testing and issue identification.
* Executing and reporting on the live organization-isolation (RLS) test and the subsequent product-creation access-control fix (T053, T054).

AI-generated suggestions were reviewed, tested and adapted by the team before being incorporated into the project. AI tools were used as development assistance and did not replace team verification or technical decision-making.

---

# Evidence

Evidence for completed tasks should be linked to the corresponding Git commit, pull request, Lovable project history, screenshot, test result, API response, database result or published application.

For the Retail Intelligence Agent, evidence can include:

* Agent interface screenshot.
* `retail-agent.ts` source file.
* `retail-agent.tsx` source file.
* App Shell integration.
* Example inventory query and agent response.
* Git commit containing the agent implementation.

For final submission, generic evidence descriptions should be replaced with the actual Git commit IDs, screenshots or other verifiable evidence available from the project.

---

# Current Project Status

The core Smart Stock Savvy application has been implemented and published. The major frontend, database, inventory-management, integration, deployment and documentation components have been completed.

A Retail Intelligence Agent has also been integrated into the application to provide inventory-focused decision support using the system's existing business and inventory data.

Organization-level data isolation (Row-Level Security) has been verified end-to-end with a live two-workspace test (T053), and a resulting access-control gap in product creation has been identified and fixed (T054).

Final issue review, documentation verification, evidence collection, and submission preparation remain in progress.

---

# Worklog Division

The project responsibilities are divided among the five students as follows:

## 1. Sujishnu — Frontend / Staff Interface

* Develop the staff-facing React interface.
* Build and maintain the staff login page and authentication flow.
* Develop the staff dashboard and dashboard statistics display.
* Implement the View Inventory interface.
* Implement search, filtering, stock-status display, loading states and error handling.
* Implement the Record Stock Movement interface.
* Implement the Create Stock Request interface and validation.
* Implement the My Requests page with request status information.
* Integrate frontend components with Supabase.
* Handle frontend state management, data fetching and user interaction.
* Ensure responsive UI using Tailwind CSS, shadcn/ui and Lucide React.
* Support presentation of the Retail Intelligence Agent within the application interface.

## 2. Eeshani — Backend / Database / Authentication

* Configure and maintain the Supabase backend.
* Design and implement the PostgreSQL database structure.
* Create and manage the required inventory-related tables.
* Configure Supabase Authentication.
* Implement role-based access and Row Level Security policies where appropriate.
* Support database operations for inventory updates and stock transactions.
* Ensure data validation and integrity through constraints and relationships.
* Support the frontend with required Supabase queries and backend functionality.
* Provide database/data-access support for the Retail Intelligence Agent.
* Verify persistent storage and database behaviour during testing.

## 3. Raibat — Inventory / Stock Management Operations

* Implement and manage core inventory-management business logic.
* Work on product and inventory data handling.
* Implement stock IN/OUT transaction logic.
* Ensure stock quantities are updated correctly after transactions.
* Apply business rules such as preventing invalid quantities and negative stock.
* Support low-stock identification and reorder-level functionality.
* Test inventory calculations and stock movement operations.
* Support inventory recommendation logic.
* Provide inventory-domain inputs for the Retail Intelligence Agent.
* Verify that agent outputs relating to stock levels, replenishment and inventory risk are consistent with the application's business rules.

## 4. Thiruharan — Architecture / Deployment / Scalability

* Work on the overall system architecture and technical documentation.
* Maintain architecture diagrams and data-flow documentation.
* Document the current Lovable deployment.
* Develop the proposed AWS cloud architecture.
* Document AWS services including CloudFront, S3, WAF, ECS/Fargate, RDS PostgreSQL, ElastiCache, SQS and CloudWatch.
* Document high-availability and monitoring considerations.
* Work on scalability analysis for 1 million and 5 million users.
* Assist with performance, scalability and infrastructure-related testing.
* Review the technical architecture of the Retail Intelligence Agent and its potential scaling considerations.
* Ensure the final technical documentation accurately reflects the implemented and proposed architecture.

## 5. Shrinjini — Integration / AI Agent / Testing / UI-UX / Documentation / QA

* Coordinate end-to-end testing of the complete application workflow.
* Perform functional testing of forms, navigation, validation, authentication and status updates.
* Test responsive design and usability across the staff interface.
* Identify, reproduce and document bugs and implementation issues.
* Verify that frontend operations correctly communicate with Supabase.
* Assist with UI/UX consistency using Tailwind CSS, shadcn/ui and Lucide React.
* Work on frontend-backend integration and issue resolution.
* Lead development and integration of the **Retail Intelligence Agent**.
* Implement the agent's inventory-focused decision-support logic.
* Integrate the agent into the application's main interface.
* Test agent responses against actual inventory data and existing business rules.
* Maintain project documentation, screenshots and evidence of completed functionality.
* Coordinate final system testing and verification.
* Support preparation of the project demonstration and technical viva.
* Assist with final submission preparation and documentation review.

---

# Worklog Summary

| Student | Primary Responsibility |
|---|---|
| **Sujishnu** | Frontend / Staff Interface |
| **Eeshani** | Backend / Database / Authentication |
| **Raibat** | Inventory / Stock Management & Business Logic |
| **Thiruharan** | Architecture / Deployment / Scalability |
| **Shrinjini** | Integration / Retail Intelligence Agent / Testing / UI-UX / Documentation / QA |
