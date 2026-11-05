# GymOS Product Specification

## Product vision
GymOS is a multi-tenant SaaS platform for commercial gyms, fitness centres, personal-training studios and multi-branch fitness businesses. It supports gym operations and gives members a self-service portal.

## User environments
1. **GymOS Platform Administration** — tenant review, platform plans, subscriptions, revenue, usage, support and system administration.
2. **Gym Business Dashboard** — branches, members, memberships, payments, attendance, staff, classes, inventory and reporting.
3. **Staff and Trainer Portal** — permission-scoped reception, branch, finance and training workflows.
4. **Member Portal** — membership, renewals, receipts, attendance, workouts, progress, class bookings and notifications.

## Product decisions
- Gym registration: both self-service and approval-based.
- Workspace access: subdomain, path-based and custom domain.
- Monetisation: hybrid free tier, trial and paid tiers.
- Initial architecture: modular monolith, shared PostgreSQL schema, tenant isolation.
- Currency and timezone configurable per tenant; initial Ghana defaults are GHS and Africa/Accra.

## Functional modules
1. Platform administration
2. Gym onboarding and tenant management
3. Multi-branch management
4. Member registration and profiles
5. Membership plans and subscriptions
6. Attendance and access control
7. Payments, invoices, refunds and financial reporting
8. Trainer and staff management
9. Workout and exercise management
10. Fitness progress tracking
11. Classes and bookings
12. CRM and customer retention
13. Notifications and communications
14. Equipment and inventory
15. Expenses and accounting support
16. Reports and analytics
17. Support tickets and feedback
18. Settings, security and audit

## Member lifecycle
Prospect → Registered member → Active subscription → Expired / Suspended → Renewed / Reactivated / Cancelled.

Registration and subscription activation are separate operations. A member record must not imply paid access.

## Payment principles
- Separate gym-member payments from payments made by gyms to GymOS.
- Invoice, payment and payment allocation are separate records.
- Verify provider webhooks server-side.
- Use idempotency to prevent duplicate processing.
- Record refunds and reversals rather than deleting successful transactions.
- Reconcile provider transactions.
- Never activate a paid subscription from a frontend redirect alone.

## SaaS plans
Illustrative tiers:
- Free: permanent basic plan with restricted limits.
- Starter: paid monthly/annually.
- Professional: paid monthly/annually.
- Enterprise: negotiated limits and support.
- Trial: time-limited access to selected paid entitlements.

Feature limits must be enforced by the backend, not only hidden in the UI.

## Non-functional requirements
- Strict tenant isolation
- Role- and permission-based access
- Secure authentication and session revocation
- Audit logging for sensitive operations
- UTC timestamps and tenant timezone display
- Backups and tested recovery
- Observability and structured logs
- Accessible responsive UI
- Privacy-aware handling of personal and fitness data
