# Non-Functional Requirements

## Performance
- API response time < 300ms for 95th percentile under normal load.
- Dashboard load time < 2 seconds on mobile.
- Support for offline mode with eventual consistency on sync.
- Transaction import (Open Finance) should complete within 30 seconds after consent.

## Security
- All data in transit encrypted (TLS 1.3).
- Sensitive financial data encrypted at rest (AES-256).
- Open Finance integration must be read-only and consent-based (no credential storage by the app).
- User authentication via secure methods (OAuth2, password + optional 2FA).
- Compliance with LGPD (Brazil) and similar data protection regulations.
- Audit logs for data access and consent changes.

## Scalability
- Horizontal scaling of API servers.
- Database designed for multi-tenant isolation (row-level security or schema separation).
- Support for 100k+ active users with proper indexing and caching.
- Background job processing for sync and report generation.

## Reliability & Availability
- 99.9% uptime SLA for core services.
- Graceful degradation if Open Finance provider is temporarily unavailable.
- Automatic retries with exponential backoff for external integrations.

## Privacy & Data Protection
- Minimal data retention for Open Finance tokens (short-lived).
- User can revoke consent and delete all synced data.
- No selling of user financial data.
- Transparent privacy policy.

## Usability & Accessibility
- WCAG 2.1 AA compliance.
- Support for dark/light mode.
- Responsive design (mobile-first, web dashboard).
- Multi-language support (Portuguese, English, Spanish as priorities).

## Maintainability
- Clear separation of concerns (API, domain, infrastructure).
- Comprehensive API documentation (OpenAPI).
- Infrastructure as Code for deployments.

## Observability
- Structured logging, metrics (Prometheus), and distributed tracing.
- Alerting on error rates, sync failures, and performance degradation.
