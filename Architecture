# Smart Stock Savvy — System Architecture

## 1. Business Problem and Target Users

### Business Problem

Small and medium-sized retail businesses often struggle to manage inventory efficiently. Manual stock tracking using notebooks or spreadsheets can result in:

•⁠  ⁠Overstocking and unnecessary holding costs.
•⁠  ⁠Stock-outs and missed sales.
•⁠  ⁠Difficulty identifying low-stock products.
•⁠  ⁠Poor visibility into current inventory levels.
•⁠  ⁠Time-consuming stock updates.
•⁠  ⁠Difficulty monitoring product movement and sales trends.
•⁠  ⁠Human errors in inventory calculations.
•⁠  ⁠Limited access to real-time inventory information.

*Smart Stock Savvy* is a web-based inventory management system designed to provide a centralized interface for monitoring and managing retail stock. The system helps users view inventory information, identify products that require attention, and make better stock-management decisions through a dashboard-based interface.

### Target Users

The primary target users are:

 1.⁠ ⁠*Retail Store Owners*

   * Monitor overall inventory.
   * Identify low-stock products.
   * Make purchasing and restocking decisions.

 2.⁠ ⁠*Inventory Managers*

   * Add and update products.
   * Monitor stock quantities.
   * Track inventory movement.

 3.⁠ ⁠*Store Employees*

   * View product information.
   * Update inventory-related information.
   * Assist with day-to-day stock management.

 4.⁠ ⁠*Small and Medium-Sized Businesses*

   * Replace manual spreadsheets with a centralized digital inventory system.
   * Access inventory information through a web browser.

---

# 2. Technology Stack

Smart Stock Savvy is developed as a modern web application using the Lovable development platform.

### Frontend

•⁠  ⁠*React.js*
•⁠  ⁠*TypeScript*
•⁠  ⁠*Vite*
•⁠  ⁠*HTML5*
•⁠  ⁠*CSS*
•⁠  ⁠*Tailwind CSS / component-based styling*
•⁠  ⁠Responsive web UI

Lovable applications are standard Vite + React projects and can be deployed as static frontends or containers.

### Backend / API

The application can use *Supabase* as its managed backend where connected to the Lovable project.

Supabase provides:

•⁠  ⁠PostgreSQL database
•⁠  ⁠Authentication
•⁠  ⁠REST APIs
•⁠  ⁠Realtime capabilities
•⁠  ⁠Storage
•⁠  ⁠Edge/serverless functions

Lovable's Supabase integration is designed to connect the frontend to these backend services without requiring a separately managed traditional server.

### Database

•⁠  ⁠*PostgreSQL*
•⁠  ⁠Managed through Supabase when Supabase is connected.

Typical inventory entities include:

•⁠  ⁠Users
•⁠  ⁠Products
•⁠  ⁠Categories
•⁠  ⁠Inventory/stock quantities
•⁠  ⁠Stock transactions
•⁠  ⁠Suppliers
•⁠  ⁠Sales/stock movement records

### Authentication

Authentication can be handled using *Supabase Authentication*.

Possible authentication mechanisms include:

•⁠  ⁠Email/password authentication
•⁠  ⁠OAuth providers such as Google
•⁠  ⁠Session/token management
•⁠  ⁠Role-based access control

The exact authentication providers enabled depend on the project's Supabase configuration.

### Storage

If the application stores product images or uploaded files, *Supabase Storage* can be used.

Example:

⁠ text
Product Image
      |
      v
Supabase Storage
      |
      v
Image URL
      |
      v
React Frontend
 ⁠

### External Services

The current published application does not expose enough information to confirm any additional third-party services.

Potential future integrations include:

•⁠  ⁠Payment gateways
•⁠  ⁠Email/SMS notification services
•⁠  ⁠Analytics
•⁠  ⁠External supplier APIs
•⁠  ⁠Business intelligence platforms

---

# 3. Current System Architecture

The current application is deployed as a web application through Lovable.

### Current Architecture Diagram

⁠ mermaid
flowchart TD

    U[Retail User] --> B[Web Browser]

    B --> F[React + TypeScript Frontend]

    F --> L[Lovable Hosted Application]

    F --> API[Backend/API Layer]

    API --> DB[(PostgreSQL Database)]

    API --> AUTH[Authentication Service]

    API --> STORAGE[File/Object Storage]

    DB --> DATA[Inventory Data]

    STORAGE --> IMG[Product Images / Files]
 ⁠

### Architecture Explanation

The user accesses Smart Stock Savvy through a web browser.

The browser loads the React-based frontend. The frontend provides the dashboard and inventory-management interface.

When the user performs an operation such as viewing, adding, updating, or deleting inventory information, the frontend communicates with the backend/API layer.

The backend communicates with the database and other services where required.

The database stores persistent application information, while storage is used for files such as product images if the application requires them.

---

# 4. Frontend Architecture

The frontend is responsible for the application's user interface and client-side interactions.

### Main responsibilities

•⁠  ⁠Display dashboard information.
•⁠  ⁠Display inventory/product information.
•⁠  ⁠Provide forms for adding and editing products.
•⁠  ⁠Display stock status.
•⁠  ⁠Handle user interactions.
•⁠  ⁠Perform client-side validation.
•⁠  ⁠Communicate with backend APIs.
•⁠  ⁠Display success and error messages.
•⁠  ⁠Provide responsive layouts.

### Frontend Flow

⁠ text
User
  |
  v
React Components
  |
  v
Application State
  |
  v
API / Supabase Client
  |
  v
Backend Services
 ⁠

The frontend should remain largely stateless with respect to permanent inventory information. Persistent data should be stored in the backend database rather than only in browser memory.

---

# 5. Backend / API Architecture

The backend provides access to persistent application data and business operations.

A Supabase-based implementation provides a PostgreSQL database together with APIs, authentication, storage and serverless/Edge Functions.

### Main backend responsibilities

•⁠  ⁠Authenticate users.
•⁠  ⁠Authorize access to resources.
•⁠  ⁠Read inventory data.
•⁠  ⁠Create new products.
•⁠  ⁠Update product quantities.
•⁠  ⁠Delete or archive products.
•⁠  ⁠Record inventory transactions.
•⁠  ⁠Validate business rules.
•⁠  ⁠Return data to the frontend.
•⁠  ⁠Execute server-side operations where required.

For operations requiring sensitive credentials or server-side processing, Edge Functions should be used instead of exposing secrets in the frontend.

---

# 6. Authentication Architecture

The authentication flow is:

⁠ mermaid
sequenceDiagram

    participant User
    participant Browser
    participant Frontend
    participant Auth as Authentication Service
    participant DB as Database

    User->>Browser: Open Smart Stock Savvy
    Browser->>Frontend: Load application
    User->>Frontend: Login
    Frontend->>Auth: Authentication request
    Auth->>Auth: Validate credentials
    Auth-->>Frontend: Session / access token
    Frontend->>DB: Authorized request
    DB-->>Frontend: Requested data
    Frontend-->>User: Display dashboard
 ⁠

Authentication should be separated from inventory data so that users can only access information they are authorized to view or modify.

Database-level security policies such as Row Level Security can additionally restrict access to records.

---

# 7. Database Architecture

The proposed logical database structure is:

⁠ mermaid
erDiagram

    USERS ||--o{ PRODUCTS : manages
    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ STOCK_TRANSACTIONS : has
    USERS ||--o{ STOCK_TRANSACTIONS : performs
    SUPPLIERS ||--o{ PRODUCTS : supplies

    USERS {
        uuid user_id PK
        string name
        string email
        string role
    }

    PRODUCTS {
        uuid product_id PK
        uuid category_id FK
        uuid supplier_id FK
        string product_name
        string sku
        decimal price
        integer stock_quantity
        integer reorder_level
    }

    CATEGORIES {
        uuid category_id PK
        string category_name
    }

    SUPPLIERS {
        uuid supplier_id PK
        string supplier_name
        string contact
    }

    STOCK_TRANSACTIONS {
        uuid transaction_id PK
        uuid product_id FK
        uuid user_id FK
        string transaction_type
        integer quantity
        timestamp created_at
    }
 ⁠

### Important database considerations

The production database should use:

•⁠  ⁠Primary keys.
•⁠  ⁠Foreign keys.
•⁠  ⁠Indexes on frequently searched columns.
•⁠  ⁠Unique constraints for SKUs.
•⁠  ⁠Transactions for stock updates.
•⁠  ⁠Row Level Security where appropriate.
•⁠  ⁠Database backups.
•⁠  ⁠Database monitoring.

For example, the following fields should be indexed for high-volume inventory systems:

⁠ text
product_id
sku
category_id
supplier_id
created_at
stock_quantity
 ⁠

---

# 8. Storage Architecture

If product images and other files are required, they should not be stored directly inside PostgreSQL.

Instead:

⁠ text
React Frontend
      |
      v
Storage API
      |
      v
Object Storage
      |
      v
Product Image
 ⁠

For the current Lovable/Supabase architecture, Supabase Storage can provide this object-storage layer. Lovable's documentation specifically supports Supabase Storage for uploaded files and images.

---

# 9. Data Flow Between Major Components

### Product Creation

⁠ mermaid
flowchart LR

    A[Inventory Manager] --> B[React Frontend]
    B --> C[API / Supabase]
    C --> D[Authentication]
    C --> E[(PostgreSQL)]
    E --> F[Product Created]
    F --> C
    C --> B
    B --> G[Updated Dashboard]
 ⁠

### Stock Update

⁠ mermaid
flowchart LR

    A[Employee / Manager] --> B[Stock Update Form]
    B --> C[Frontend Validation]
    C --> D[Backend API]
    D --> E[(PostgreSQL)]
    E --> F[Stock Transaction]
    F --> G[Updated Inventory]
    G --> B
 ⁠

### Viewing Inventory

⁠ mermaid
flowchart LR

    A[User] --> B[Dashboard]
    B --> C[API Request]
    C --> D[(PostgreSQL)]
    D --> C
    C --> B
    B --> A
 ⁠

---

# 10. Current Hosting / Deployment Approach

The current application is publicly deployed through *Lovable* and is accessible through:

⁠ text
https://smart-stock-savvy-47.lovable.app
 ⁠

The published URL represents the deployed version of the application. Lovable publishing deploys a current project version to a live URL.

### Current deployment model

⁠ text
Developer
    |
    v
Lovable
    |
    v
Build / Deployment
    |
    v
Lovable Hosted Application
    |
    v
Public HTTPS URL
    |
    v
End Users
 ⁠

This approach is suitable for development, demonstrations, prototypes and early production use because infrastructure management is largely handled by the platform.

---

# 11. Proposed AWS Cloud Deployment Architecture

For large-scale production deployment, the recommended cloud provider is *Amazon Web Services (AWS)*.

The proposed architecture separates the frontend, API layer, database, storage, caching and monitoring components.

### Proposed AWS Architecture

⁠ mermaid
flowchart TD

    USERS[1M - 5M Users]
        --> R53[Amazon Route 53]

    R53 --> CF[Amazon CloudFront CDN]

    CF --> S3[Amazon S3<br/>React Static Frontend]

    USERS --> WAF[AWS WAF]

    WAF --> ALB[Application Load Balancer]

    ALB --> ECS[Amazon ECS / Fargate<br/>Backend API]

    ECS --> CACHE[Amazon ElastiCache<br/>Redis]

    ECS --> RDS[(Amazon RDS<br/>PostgreSQL)]

    ECS --> S3DATA[Amazon S3<br/>Product Images / Files]

    ECS --> SQS[Amazon SQS<br/>Async Jobs]

    SQS --> WORKERS[ECS Workers / Lambda]

    ECS --> EXT[External APIs]

    ECS --> CW[Amazon CloudWatch]

    RDS --> BACKUP[Automated Backups]

    S3 --> CF
 ⁠

---

# 12. AWS Component Explanation

## Amazon Route 53

Provides DNS management for the application.

Example:

⁠ text
smartstocksavvy.com
        |
        v
Route 53
 ⁠

---

## Amazon CloudFront

CloudFront acts as the Content Delivery Network.

It caches static frontend resources closer to users.

Benefits:

•⁠  ⁠Faster page loading.
•⁠  ⁠Reduced load on origin servers.
•⁠  ⁠Global distribution.
•⁠  ⁠Better performance for users in different geographical regions.

---

## Amazon S3

S3 stores the React application's static build files.

Example:

⁠ text
index.html
assets/
javascript/
css/
images/
 ⁠

S3 can also store product images and other uploaded files.

---

## AWS WAF

AWS WAF protects the application against common web attacks and malicious traffic.

It can provide:

•⁠  ⁠Rate limiting.
•⁠  ⁠IP filtering.
•⁠  ⁠SQL injection protection.
•⁠  ⁠Cross-site scripting protection.
•⁠  ⁠Bot protection rules.

---

## Application Load Balancer

The Application Load Balancer distributes API requests across multiple backend instances.

⁠ text
                ALB
             /   |   \
            /    |    \
        API-1  API-2  API-3
 ⁠

This prevents one backend server from becoming a bottleneck.

---

## Amazon ECS / Fargate

The backend API can run as containerized services using Amazon ECS with Fargate.

Advantages:

•⁠  ⁠Automatic container scaling.
•⁠  ⁠No need to manage physical servers.
•⁠  ⁠Easy deployment of multiple API instances.
•⁠  ⁠Integration with load balancing.
•⁠  ⁠Suitable for high request volumes.

---

## Amazon RDS PostgreSQL

Amazon RDS PostgreSQL would store:

•⁠  ⁠Users.
•⁠  ⁠Products.
•⁠  ⁠Categories.
•⁠  ⁠Inventory.
•⁠  ⁠Stock transactions.
•⁠  ⁠Suppliers.
•⁠  ⁠Application configuration.

For production, the database should use:

•⁠  ⁠Multi-AZ deployment.
•⁠  ⁠Automated backups.
•⁠  ⁠Read replicas where necessary.
•⁠  ⁠Indexing.
•⁠  ⁠Connection pooling.
•⁠  ⁠Monitoring.

---

## Amazon ElastiCache

Redis can be introduced as a caching layer.

Frequently requested information such as:

⁠ text
Dashboard statistics
Product categories
Popular products
Low-stock summaries
 ⁠

can be cached.

This reduces repeated database queries.

---

## Amazon SQS

SQS can handle tasks that do not need to happen immediately.

Examples:

⁠ text
Stock alert
      |
      v
SQS
      |
      v
Notification Worker
      |
      v
Email / SMS
 ⁠

This keeps the main API responsive.

---

# 13. Proposed AWS Data Flow

⁠ mermaid
sequenceDiagram

    participant U as User
    participant CF as CloudFront
    participant FE as S3 Frontend
    participant ALB as Load Balancer
    participant API as ECS API
    participant R as Redis
    participant DB as RDS PostgreSQL
    participant S3 as S3 Storage

    U->>CF: Request application
    CF->>FE: Fetch static files
    FE-->>CF: React application
    CF-->>U: Application

    U->>ALB: API request
    ALB->>API: Forward request
    API->>R: Check cache

    alt Cache hit
        R-->>API: Cached result
    else Cache miss
        API->>DB: Query database
        DB-->>API: Data
        API->>R: Store result
    end

    API-->>ALB: Response
    ALB-->>U: Response

    API->>S3: Upload / retrieve files
    S3-->>API: File URL / data
 ⁠

---

# 14. Scaling to 1 Million Users

The system should not be designed around one server.

Instead, the architecture should scale horizontally.

### Frontend scaling

The React application is static after compilation.

Therefore:

⁠ text
Users
  |
CloudFront
  |
S3
 ⁠

can serve large numbers of users without requiring an individual frontend server for every user.

CloudFront caches static assets at edge locations.

### Backend scaling

The API should run multiple ECS tasks.

Example:

⁠ text
             Load Balancer
          /      |       \
         /       |        \
     API-1     API-2     API-3
 ⁠

When traffic increases, additional containers can be started.

### Database scaling

At 1 million users:

•⁠  ⁠Use a production PostgreSQL instance.
•⁠  ⁠Add appropriate indexes.
•⁠  ⁠Use connection pooling.
•⁠  ⁠Add read replicas for read-heavy workloads.
•⁠  ⁠Separate read-heavy dashboard queries from transactional operations where practical.

### Caching

Redis should cache frequently requested data.

This prevents every dashboard request from reaching PostgreSQL.

### Asynchronous processing

SQS should handle:

•⁠  ⁠Notifications.
•⁠  ⁠Reports.
•⁠  ⁠Background calculations.
•⁠  ⁠Bulk imports.
•⁠  ⁠Scheduled inventory jobs.

This prevents long-running operations from blocking user requests.

---

# 15. Scaling to 5 Million Users

At 5 million users, the architecture should move toward a more distributed and highly available design.

### Frontend

⁠ text
5M Users
    |
CloudFront
    |
S3
 ⁠

The frontend remains highly scalable because static resources are distributed through the CDN.

### API

The backend should use automatic horizontal scaling:

⁠ text
                 ALB
                  |
       -----------------------
       |    |    |    |     |
      API  API  API  API   API
       |    |    |    |     |
       -----------------------
                  |
                Redis
                  |
             PostgreSQL
 ⁠

The number of API containers can automatically increase based on:

•⁠  ⁠CPU utilization.
•⁠  ⁠Memory utilization.
•⁠  ⁠Request count.
•⁠  ⁠Response latency.
•⁠  ⁠Queue length.

### Database

At 5 million users, database design becomes critical.

Recommended measures:

 1.⁠ ⁠Multi-AZ PostgreSQL.
 2.⁠ ⁠Read replicas.
 3.⁠ ⁠Connection pooling.
 4.⁠ ⁠Query optimization.
 5.⁠ ⁠Proper indexes.
 6.⁠ ⁠Partitioning of very large transaction tables.
 7.⁠ ⁠Automated backups.
 8.⁠ ⁠Disaster recovery.
 9.⁠ ⁠Database monitoring.
10.⁠ ⁠Careful transaction management.

### Database Partitioning

The ⁠ stock_transactions ⁠ table could eventually become extremely large.

It can be partitioned based on time:

⁠ text
stock_transactions
       |
       +-- 2026
       +-- 2027
       +-- 2028
       +-- ...
 ⁠

This keeps queries efficient as historical transaction data grows.

---

# 16. 1 Million vs 5 Million User Architecture

| Component       | 1 Million Users           | 5 Million Users                                          |
| --------------- | ------------------------- | -------------------------------------------------------- |
| Frontend        | S3 + CloudFront           | S3 + CloudFront                                          |
| CDN             | CloudFront                | CloudFront + optimized caching                           |
| API             | ECS/Fargate autoscaling   | Larger ECS/Fargate cluster with aggressive autoscaling   |
| Load Balancer   | Application Load Balancer | Multiple scalable API services behind ALB                |
| Cache           | Redis                     | Redis cluster / highly available cache                   |
| Database        | RDS PostgreSQL            | Multi-AZ RDS + read replicas + partitioning              |
| Storage         | Amazon S3                 | Amazon S3 with lifecycle policies                        |
| Background jobs | SQS + workers             | SQS + scalable worker fleet                              |
| Monitoring      | CloudWatch                | CloudWatch + centralized logging + advanced alerting     |
| Security        | WAF + IAM + HTTPS         | WAF + IAM + rate limiting + advanced security monitoring |
| Availability    | Multi-AZ                  | Multi-AZ + disaster recovery strategy                    |
| Deployment      | CI/CD                     | CI/CD + blue/green or rolling deployments                |

---

# 17. High Availability

The proposed production architecture should avoid single points of failure.

### Example

⁠ text
                 Route 53
                    |
               CloudFront
                    |
                 AWS WAF
                    |
                  ALB
             ______|______
            /      |      \
         ECS-A   ECS-B   ECS-C
            \      |      /
             \   Redis   /
                  |
             RDS PostgreSQL
              /         \
        Primary        Replica
 ⁠

If one backend container fails, the load balancer routes traffic to healthy containers.

If a database instance encounters a failure, the Multi-AZ configuration can provide failover.

---

# 18. Security Architecture

Security should be implemented at multiple layers.

### Frontend

•⁠  ⁠HTTPS.
•⁠  ⁠Secure authentication.
•⁠  ⁠Input validation.
•⁠  ⁠Avoid exposing secret API keys.
•⁠  ⁠Secure session handling.

### API

•⁠  ⁠Authentication.
•⁠  ⁠Authorization.
•⁠  ⁠Rate limiting.
•⁠  ⁠Input validation.
•⁠  ⁠API request logging.

### Database

•⁠  ⁠Private database networking.
•⁠  ⁠Encryption at rest.
•⁠  ⁠Encryption in transit.
•⁠  ⁠Least-privilege access.
•⁠  ⁠Row-level access controls where appropriate.
•⁠  ⁠Automated backups.

### AWS

•⁠  ⁠IAM roles.
•⁠  ⁠Security Groups.
•⁠  ⁠AWS WAF.
•⁠  ⁠CloudWatch monitoring.
•⁠  ⁠Secrets Manager for credentials.
•⁠  ⁠VPC isolation.

---

# 19. Monitoring and Observability

Amazon CloudWatch should monitor:

•⁠  ⁠API response time.
•⁠  ⁠HTTP errors.
•⁠  ⁠CPU utilization.
•⁠  ⁠Memory usage.
•⁠  ⁠Database connections.
•⁠  ⁠Database CPU.
•⁠  ⁠Cache hit rate.
•⁠  ⁠Queue depth.
•⁠  ⁠Application logs.

Example alert:

⁠ text
API latency > threshold
        |
        v
CloudWatch Alarm
        |
        v
Operations / Administrator
 ⁠

---

# 20. Deployment Pipeline

A Git-based CI/CD workflow can be used:

⁠ mermaid
flowchart LR

    A[Developer] --> B[GitHub]
    B --> C[CI/CD Pipeline]
    C --> D[Build React Application]
    C --> E[Build Backend Container]
    D --> F[S3]
    F --> G[CloudFront]
    E --> H[Container Registry]
    H --> I[ECS / Fargate]
 ⁠

Lovable projects can be synchronized with GitHub and deployed to external infrastructure, including AWS services such as S3 + CloudFront, ECS and EKS.

---

# 21. Final Architecture Recommendation

The recommended long-term architecture for Smart Stock Savvy is:

⁠ text
                    USERS
                      |
                      v
                Amazon Route 53
                      |
                      v
              CloudFront + WAF
                  /       \
                 /         \
                v           v
        S3 Frontend       ALB
                           |
                           v
                    ECS / Fargate
                    Backend APIs
                       /    \
                      /      \
                     v        v
                  Redis      SQS
                    |          |
                    v          v
               PostgreSQL    Workers
                RDS          / Lambda
                    |
                    v
                 S3 Data
 ⁠

This architecture provides a clear separation between the presentation layer, API layer, data layer, caching layer, object storage and asynchronous processing.

The current Lovable deployment is appropriate for the prototype and initial deployment stage. For a production system expected to support *1 million to 5 million users*, migrating the production infrastructure to AWS provides greater control over scalability, availability, networking, security, monitoring and deployment. Lovable applications can be moved to AWS infrastructure because they are standard Vite + React applications and can be deployed using services such as S3, CloudFront, ECS or EKS.

## Conclusion

Smart Stock Savvy uses a modern web-based architecture to provide centralized inventory management for retail businesses. The current Lovable deployment provides a rapid and managed environment for developing and hosting the application.

For large-scale deployment, AWS can provide a highly available and scalable architecture consisting of:

•⁠  ⁠Amazon Route 53
•⁠  ⁠Amazon CloudFront
•⁠  ⁠AWS WAF
•⁠  ⁠Amazon S3
•⁠  ⁠Application Load Balancer
•⁠  ⁠Amazon ECS/Fargate
•⁠  ⁠Amazon RDS PostgreSQL
•⁠  ⁠Amazon ElastiCache
•⁠  ⁠Amazon SQS
•⁠  ⁠AWS Lambda / background workers
•⁠  ⁠Amazon CloudWatch

The architecture can scale horizontally by increasing frontend CDN capacity, backend containers and asynchronous workers while scaling the database through optimization, caching, read replicas and partitioning. This makes the system capable of evolving from a small retail inventory application into a large-scale cloud-based inventory management platform.


# 23. Worklog Division

The project work is divided among the five students as follows:

## 1. Sujishnu — Frontend / Staff Interface
- Develop the staff-facing React interface.
- Build and maintain the staff login page and authentication flow.
- Develop the staff dashboard and dashboard statistics display.
- Implement the View Inventory interface, including search, filtering, stock-status display, loading states and error handling.
- Implement the Record Stock Movement form for IN/OUT transactions.
- Implement the Create Stock Request form and validation.
- Implement the My Requests page with request status information.
- Integrate frontend components with Supabase.
- Handle frontend state management, data fetching, validation and user interaction.
- Ensure responsive UI using Tailwind CSS, shadcn/ui and Lucide React.

## 2. Eeshani — Backend / Database / Authentication
- Configure and maintain the Supabase backend.
- Design and implement the PostgreSQL database structure.
- Create and manage tables for users, products, categories, inventory/stock, stock transactions and stock requests as required.
- Configure Supabase Authentication.
- Implement role-based access and Row Level Security policies where appropriate.
- Support database operations for inventory updates and stock transactions.
- Ensure data validation and integrity through appropriate constraints and relationships.
- Support the frontend with the required Supabase queries and backend functionality.

## 3. Raibat — Inventory / Stock Management Operations
- Implement and manage the core inventory-management business logic.
- Work on product and inventory data handling.
- Implement stock IN/OUT transaction logic.
- Ensure stock quantities are updated correctly after transactions.
- Apply business rules such as preventing invalid quantities and stock from becoming negative.
- Support low-stock identification and reorder-level functionality.
- Test inventory calculations and stock movement operations.
- Assist with integration between inventory operations, the database and the frontend.

## 4. Thiruharan — Architecture / Deployment / Scalability
- Work on the overall system architecture and technical documentation.
- Maintain architecture diagrams and data-flow documentation.
- Work on the deployment approach using Lovable and the proposed cloud architecture.
- Document the AWS scalability architecture for larger user loads.
- Cover services such as CloudFront, S3, WAF, ECS/Fargate, RDS PostgreSQL, ElastiCache, SQS and CloudWatch.
- Document high-availability, monitoring and deployment considerations.
- Assist with performance, scalability and infrastructure-related testing.
- Ensure the final technical documentation accurately reflects the implemented system.

## 5. Shrinjini — Testing / UI-UX / Documentation / Quality Assurance
- Test the complete application workflow from login through inventory operations and stock requests.
- Perform functional testing of forms, navigation, validation, authentication and status updates.
- Check responsive design and usability across the staff interface.
- Identify and document bugs, errors and missing functionality.
- Verify that frontend operations correctly communicate with Supabase.
- Assist with UI/UX consistency using Tailwind CSS, shadcn/ui and Lucide React.
- Maintain project documentation, screenshots and evidence of completed functionality.
- Assist with final system testing and preparation of the project demonstration/viva.

## Worklog Summary

| Student | Primary Responsibility |
|---|---|
| Sujishnu | Frontend / Staff Interface |
| Eeshani | Backend / Database / Authentication |
| Raibat | Inventory / Stock Management Operations |
| Thiruharan | Architecture / Deployment / Scalability |
| Shrinjini | Testing / UI-UX / Documentation / Quality Assurance |
