# GymOS Database Design

## Conventions
- UUID primary keys
- `TIMESTAMPTZ` stored in UTC
- `NUMERIC(14,2)` or a suitable precision for money; never floating point
- `tenant_id` on tenant-owned entities
- Composite foreign keys for tenant consistency
- `created_at` and `updated_at` where appropriate
- Explicit status values and database constraints
- Historical financial records must not be casually deleted

## Core entity groups

### Platform and tenancy
`tenants`, `tenant_registrations`, `tenant_domains`, `tenant_settings`, `branches`

### Identity and permissions
`users`, `tenant_users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `invitations`, `user_sessions`

### SaaS billing
`platform_plans`, `platform_plan_features`, `platform_subscriptions`, `platform_invoices`, `platform_payments`, `platform_usage_records`, `platform_subscription_history`

### Gym membership
`members`, `membership_plans`, `membership_plan_branches`, `subscriptions`, `subscription_freezes`, `subscription_history`, `subscription_branch_access`

### Finance
`invoices`, `invoice_items`, `payments`, `payment_allocations`, `refunds`, `expenses`, `expense_categories`, `ledger_accounts`, `journal_entries`, `journal_lines`

### Attendance and access
`attendance_records`, `access_devices`, `digital_membership_cards`, `qr_tokens`, `access_logs`

### Staff and fitness
`staff_profiles`, `staff_attendance`, `staff_shifts`, `trainers`, `trainer_assignments`, `exercises`, `workout_plans`, `workout_plan_exercises`, `workout_sessions`, `fitness_assessments`, `fitness_measurements`

### Classes and engagement
`fitness_classes`, `class_schedules`, `class_bookings`, `class_attendance`, `notifications`, `notification_templates`, `notification_preferences`, `announcements`, `leads`, `customer_interactions`, `follow_up_tasks`, `support_tickets`

### Inventory and operations
`equipment`, `equipment_maintenance`, `products`, `inventory_items`, `suppliers`, `purchase_orders`, `purchase_order_items`, `stock_movements`

### System and integrations
`audit_logs`, `webhook_events`, `integration_configs`, `file_attachments`, `api_keys`

## Key relationships
- One tenant has many branches.
- Users join tenants through `tenant_users`.
- A tenant has many members and membership plans.
- A member has many subscriptions over time.
- A member has many invoices, payments and attendance records.
- Payments settle invoices through payment allocations.
- A tenant has a separate GymOS platform subscription.
- A platform subscription references a GymOS platform plan.
- Trainers and staff are linked to tenant users and may be branch-scoped.

## Important constraints
- `UNIQUE(tenant_id, member_number)`
- `UNIQUE(tenant_id, branch_code)`
- Unique verified domain
- Unique provider webhook event `(provider, provider_event_id)`
- Partial unique index allowing only one open attendance session per member/tenant, if this matches the business rule
- Composite foreign keys `(id, tenant_id)` for tenant-owned relationships
- Validate that branch, member, invoice and payment all belong to the same tenant
- Enforce plan limits transactionally to prevent concurrent over-allocation

## Schema delivery strategy
Do not create every future table in the first migration. Start with platform/tenancy, identity, branches, members, plans, subscriptions, SaaS billing, invoices/payments, attendance, audit and webhooks. Add fitness, CRM, inventory and class tables when those modules are implemented.

The SQL in `database/initial_schema.sql` is a starting reference, not a production-certified migration. Review and split it into Alembic migrations, add all missing composite constraints, and test against the target PostgreSQL version before production.
