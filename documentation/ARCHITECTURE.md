# GymOS Technical Architecture

## Architecture style

Use a modular monolith initially. Keep domain boundaries explicit so high-load domains can be extracted later if justified. Do not begin with microservices.

## Logical layers

1. React presentation layer
2. FastAPI API layer
3. Domain services and repositories
4. PostgreSQL persistence layer
5. Redis and background workers
6. External integrations

## Technology stack

### Frontend

- React + TypeScript + Vite
- Tailwind CSS and shadcn/ui
- React Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- Recharts
- Lucide icons

### Backend

- Python + FastAPI
- SQLAlchemy 2.x
- Alembic
- Pydantic v2
- PostgreSQL
- Argon2id password hashing
- JWT access and refresh tokens
- Redis + Celery for background jobs
- Pytest

### Infrastructure proposal

- Frontend: Vercel
- API and workers: Render
- PostgreSQL: Supabase
- Object storage: private S3-compatible storage or Supabase Storage
- Email: transactional email provider
- Monitoring: Sentry plus structured logs

Docker is intentionally not required for initial local development.

## Multi-tenancy

Use a shared database and shared schema with `tenant_id` on tenant-owned rows. Every tenant-scoped query must be authorised by backend-derived tenant context. Never trust a tenant ID supplied by the browser as proof of access.

Recommended controls:

- Resolve workspace from a verified host or allowed path slug.
- Authenticate the user.
- Confirm active `tenant_users` membership.
- Check role and permission.
- Set transaction-local PostgreSQL tenant context.
- Apply RLS as defence in depth.
- Use a restricted database application role without `BYPASSRLS`.
- Test connection-pool reuse and missing-tenant-context behaviour.
- Use composite foreign keys to prevent cross-tenant relationships.

Platform administrators require a separate, tightly controlled access path with explicit audit logging.

## Workspace URL resolution

- Subdomain: `fitzone.gymos.com`
- Path: `gymos.com/fitzone`
- Custom domain: `portal.fitzone.com`

All methods resolve to a tenant UUID. Custom domains require ownership verification, DNS validation, TLS provisioning and takeover protection. Reserve system subdomains such as `www`, `api`, `admin`, `app`, `support`, `mail` and `status`.

## Identity model

A global `users` record represents a login identity. `tenant_users` represents a user's relationship with a gym. Roles are assigned within that relationship and may be scoped to a branch. A user may be a member, trainer or employee in different organisations.

## Financial integrity

- Use NUMERIC/Decimal, never float, for money.
- Preserve currency on each monetary record.
- Use invoice, payment and allocation records separately.
- Use database transactions for payment allocation and subscription activation.
- Make webhook event IDs unique per provider.
- Keep financial events append-only where possible.
- Add a double-entry ledger before offering serious accounting functionality.

## Domain boundaries

Platform: tenants, domains, registrations, platform plans and platform billing.
Identity: users, sessions, roles, permissions and invitations.
Gym operations: branches, members, plans, subscriptions and attendance.
Finance: invoices, payments, allocations, refunds, expenses and ledger.
Fitness: trainers, exercises, workouts, assessments and measurements.
Engagement: CRM, notifications, announcements and support.
Infrastructure: audit, files, webhooks, integrations and background jobs.
