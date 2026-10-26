# System Design

## High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌───────────────────┐
│  Mobile Apps    │     │   Web Dashboard │     │   Admin Panel    │
│ (iOS / Android) │     │                 │     │                  │
└────────┬────────┘     └────────┬────────┘     └────────┬─────────┘
         │                       │                       │
         └────────────────────────┬─────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      API Gateway        │
                    │   (Auth, Rate Limiting) │
                    └───────────┬───────────┘
                                 │
         ┌───────────────────────┬──────────────────────┐
         │                       │                       │
┌────────▼────────┐   ┌──────────▼──────────┐  ┌─────────▼─────────┐
│  Core Domain    │   │  Sync Service       │  │ Notification Svc  │
│  (Accounts,     │   │  (Open Finance,     │  │ (Email, Push)     │
│   Transactions, │   │   Import Jobs)      │  │                   │
│   Budgets,      │   │                     │  │                   │
│   Goals)        │   └──────────┬─────────┘  └───────────────────┘
└────────┬────────┘              │
         │              ┌────────▼────────┐
         │              │ Open Finance    │
         │              │ Aggregator      │
         │              │ (e.g. Belvo)    │
         │              └─────────────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│   (Primary DB)  │
└────────────────┘
         │
┌────────▼────────┐
│   Redis / Cache │
│   Object Storage│
│   (Receipts)    │
└────────────────┘
```

## Key Components

### 1. Client Applications
- **Mobile**: Native or cross-platform (React Native / Flutter) with offline-first capability (local SQLite + sync).
- **Web**: Dashboard for deeper analysis and report exports.

### 2. Backend Services
- **API Layer**: RESTful (or GraphQL) endpoints documented in OpenAPI.
- **Core Domain Service**: Handles business logic for accounts, transactions, budgets, goals, credit cards.
- **Sync Service**: Manages Open Finance connections, webhook processing, transaction enrichment and categorization.
- **Notification Service**: Bill reminders, budget alerts, goal progress.

### 3. Data Layer
- PostgreSQL as primary relational store.
- Redis for caching dashboard aggregates and session data.
- Object storage (S3-compatible) for receipt images.

### 4. External Integrations
- **Open Finance Aggregator** (Belvo or equivalent): Consent widget, transaction fetch, categorization enrichment.
- Email/Push providers for notifications.
- Optional: Payment processors (if expanding beyond tracking).

## Sequence Diagram: Open Finance Bank Sync

```
User → Mobile App → API → Sync Service → Open Finance Aggregator
                              │
                              ▼
                         Webhook ← Aggregator (data ready)
                              │
                              ▼
                         Process & Categorize → Core Domain → DB
                              │
                              ▼
                         Notify User (new transactions available)
```

1. User initiates connection in the app.
2. App opens Aggregator widget (embedded webview).
3. User authenticates with bank and grants consent (read-only).
4. Aggregator creates link and fetches historical data asynchronously.
5. Webhook notifies Sync Service when data is ready.
6. Sync Service retrieves, normalizes, and enriches transactions.
7. Transactions are stored and user is notified.

## Deployment Considerations
- Containerized services (Docker + Kubernetes or managed PaaS).
- Separate environments: dev, staging, production.
- Secrets managed via vault (Open Finance credentials, encryption keys).
