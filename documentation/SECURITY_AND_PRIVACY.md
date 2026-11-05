# Security and Privacy Requirements

## Authentication
- Argon2id password hashing
- Short-lived access tokens
- Refresh-token rotation and revocation
- Email verification
- Secure password reset tokens
- Optional MFA
- Rate limiting on login and recovery endpoints
- Secure, HttpOnly, SameSite cookies where cookie-based refresh is used

## Authorization
- Role-based and permission-based access
- Branch-scoped access
- Tenant membership checked server-side
- Platform administration separated from tenant roles
- Deny by default

## Tenant isolation
- Backend-derived tenant context
- Composite tenant-aware foreign keys
- PostgreSQL RLS as defence in depth
- Restricted application database role
- No `BYPASSRLS` for normal application connections
- Transaction-local tenant context
- Cross-tenant security tests

## Payments
- Verify webhook signatures
- Store provider event IDs and enforce uniqueness
- Verify amount, currency, reference and transaction status with provider
- Idempotent processing
- Do not trust frontend redirects
- Keep refunds and reversals auditable

## Personal and fitness information
- Collect only necessary information
- Restrict fitness/medical data by permission
- Use consent and clear privacy notices
- Private file storage
- Signed, short-lived file URLs
- Define retention and deletion policies
- Obtain appropriate legal review for applicable data-protection obligations

## Operations
- Secrets only in environment/secret manager
- TLS everywhere
- Structured logs with sensitive data redacted
- Backups and restore tests
- Dependency scanning
- Error monitoring
- Audit sensitive administrative actions
