# GymOS Development Rules

1. Keep business logic in domain services, not route handlers or React components.
2. Every tenant-owned query must use an authenticated tenant context.
3. Never trust a tenant ID from request payloads as proof of access.
4. Use Decimal/NUMERIC for monetary calculations.
5. Use database transactions for multi-step financial and subscription operations.
6. Make webhook handling idempotent.
7. Do not hard-delete financial transactions or audit logs.
8. Use Alembic for all schema changes.
9. Test migrations on a clean database and a copy of the prior schema.
10. Add cross-tenant tests for every tenant-scoped module.
11. Enforce permissions in the backend even when the UI hides actions.
12. Do not store secrets in source control.
13. Keep personal and fitness information private and permission-scoped.
14. Add pagination to collection endpoints.
15. Use explicit API schemas; do not expose SQLAlchemy models directly.
16. Keep platform billing and gym-member billing in separate domains.
