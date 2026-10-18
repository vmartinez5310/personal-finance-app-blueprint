# ADR 0001: Use PostgreSQL as Primary Database

## Status
Accepted

## Context
The application requires a reliable relational database to model complex financial entities: users, accounts, transactions, categories, budgets, goals, and credit cards, with strong consistency and complex queries for reports.

## Decision
Use **PostgreSQL** as the primary database.

## Rationale
- Strong ACID compliance for financial data integrity.
- Excellent support for complex joins, window functions, and JSON (for flexible metadata).
- Mature ecosystem, replication, and partitioning options for scale.
- Wide tooling support (ORMs, migrations, monitoring).
- Row-Level Security features useful for multi-tenancy.

## Consequences
- Positive: Data integrity, powerful querying for analytics.
- Negative: Requires careful schema design and indexing for high-volume transaction tables.
- Alternatives considered: MongoDB (rejected for weaker consistency needs), MySQL (PostgreSQL preferred for advanced features).

## Date
2026-10-18
