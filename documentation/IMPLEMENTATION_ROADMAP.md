# GymOS Implementation Roadmap

Indicative 20-week plan for a small development team. This is an estimate, not a delivery guarantee.

## Phase 1 — Foundation (Weeks 1–3)
- Repository setup and conventions
- PostgreSQL and SQLAlchemy
- Alembic migrations
- Authentication and identity
- Tenant model and tenant resolution
- Roles and permissions
- Gym onboarding and branches
- Initial RLS and isolation tests

## Phase 2 — Core gym operations (Weeks 4–7)
- Member registration and profiles
- Membership plans
- Subscriptions and lifecycle
- Attendance
- Manual payment recording
- Gym owner dashboard

## Phase 3 — Financial and customer experience (Weeks 8–10)
- Invoices and receipts
- Payment-provider abstraction
- Provider integration and webhook verification
- Member portal
- Digital membership cards
- QR check-in
- Email notifications
- Renewal automation

## Phase 4 — Fitness and staff (Weeks 11–14)
- Staff and trainer management
- Workout plans
- Fitness progress
- Group classes and bookings

## Phase 5 — Business intelligence (Weeks 15–17)
- CRM and retention
- Reports and analytics
- Inventory
- Expenses
- Support tickets

## Phase 6 — Testing and launch (Weeks 18–20)
- Tenant-isolation testing
- Payment and finance reconciliation tests
- Security and performance tests
- Staging and production deployment
- Pilot gym onboarding
- Documentation and operational runbooks

## MVP acceptance criteria
- Gym can register through self-service or approval workflow.
- Workspace resolves through configured URL mode.
- Gym can configure branches and staff.
- Gym can register members and create membership plans.
- Gym can create and renew subscriptions.
- Payments can be recorded manually or verified online.
- Attendance can be tracked.
- Members can access their own portal.
- Gym owner can view basic operational and financial reports.
- Free, trial and paid SaaS entitlements are enforced server-side.
- Cross-tenant access is blocked and tested.

## Engineering sequence
1. Database and tenancy foundation
2. Backend authentication and authorization
3. Frontend application shell
4. Gym onboarding and branches
5. Members and memberships
6. Payments and attendance
7. SaaS billing and entitlements
8. Member portal
9. Additional fitness and business modules
