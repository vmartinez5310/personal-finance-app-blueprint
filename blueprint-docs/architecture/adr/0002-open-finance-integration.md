# ADR 0002: Open Finance Integration via Aggregator

## Status
Accepted

## Context
Automatic transaction import significantly improves user experience and adoption (as demonstrated by Mobills with Belvo). Direct bank integrations are complex and regulated.

## Decision
Integrate with a certified **Open Finance Aggregator** (e.g., Belvo in Brazil/LatAm) rather than building direct bank connections.

## Rationale
- Regulatory compliance and security handled by specialized provider.
- Faster time-to-market.
- Enrichment and categorization services available.
- User consent flow managed via provider widget.
- Read-only access model aligns with privacy requirements.

## Consequences
- Positive: Reduced engineering effort, better compliance, enriched data.
- Negative: Dependency on third-party availability and pricing.
- Cost: Per-connection or volume-based fees.
- Alternatives considered: Manual-only entry (rejected for poor UX), direct Open Finance APIs (higher complexity).

## Date
2026-10-18
