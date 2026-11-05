-- GymOS initial PostgreSQL schema reference.
-- Review and split into Alembic migrations before production.
-- Target: PostgreSQL 15+.
-- This file is a foundation, not the complete future schema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    email CITEXT NOT NULL,
    phone VARCHAR(30),
    logo_url TEXT,
    country_code CHAR(2) NOT NULL DEFAULT 'GH',
    currency CHAR(3) NOT NULL DEFAULT 'GHS',
    timezone VARCHAR(100) NOT NULL DEFAULT 'Africa/Accra',
    registration_status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (registration_status IN ('pending','approved','rejected')),
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','active','suspended','cancelled','archived')),
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),
    submitted_by UUID REFERENCES users(id),
    business_registration_number VARCHAR(100),
    business_description TEXT,
    review_status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (review_status IN ('pending','under_review','approved','rejected')),
    review_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    domain VARCHAR(255) NOT NULL UNIQUE,
    domain_type VARCHAR(30) NOT NULL
        CHECK (domain_type IN ('subdomain','custom')),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending','verified','failed')),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    ssl_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id, tenant_id)
);

CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(30),
    email CITEXT,
    timezone VARCHAR(100),
    is_headquarters BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    opening_hours JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, code),
    UNIQUE (id, tenant_id)
);

CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('invited','active','suspended','removed')),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, user_id),
    UNIQUE (id, tenant_id)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_tenant_role_name
ON roles(tenant_id, LOWER(name))
WHERE tenant_id IS NOT NULL;

CREATE UNIQUE INDEX uq_global_role_name
ON roles(LOWER(name))
WHERE tenant_id IS NULL;

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_user_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    branch_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (tenant_user_id, tenant_id)
        REFERENCES tenant_users(id, tenant_id),
    FOREIGN KEY (branch_id, tenant_id)
        REFERENCES branches(id, tenant_id)
);

CREATE UNIQUE INDEX uq_user_role_assignment
ON user_roles(tenant_user_id, role_id, branch_id) NULLS NOT DISTINCT;

CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email CITEXT NOT NULL,
    invitation_token_hash TEXT NOT NULL UNIQUE,
    role_id UUID REFERENCES roles(id),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    branch_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    member_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email CITEXT,
    phone VARCHAR(30),
    gender VARCHAR(30),
    date_of_birth DATE,
    address TEXT,
    profile_image_url TEXT,
    emergency_contact JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active','inactive','suspended','archived')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, member_number),
    UNIQUE (id, tenant_id),
    FOREIGN KEY (branch_id, tenant_id)
        REFERENCES branches(id, tenant_id)
);

CREATE INDEX idx_members_tenant_branch
ON members(tenant_id, branch_id);

CREATE INDEX idx_members_tenant_phone
ON members(tenant_id, phone);

CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(14,2) NOT NULL CHECK (price >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'GHS',
    duration_value INTEGER NOT NULL CHECK (duration_value > 0),
    duration_unit VARCHAR(20) NOT NULL
        CHECK (duration_unit IN ('day','week','month','year')),
    access_type VARCHAR(30) NOT NULL DEFAULT 'single_branch'
        CHECK (access_type IN ('single_branch','selected_branches','all_branches')),
    max_visits INTEGER,
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id, tenant_id)
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    member_id UUID NOT NULL,
    membership_plan_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    purchased_price NUMERIC(14,2) NOT NULL CHECK (purchased_price >= 0),
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'GHS',
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','active','expired','suspended','cancelled')),
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id, tenant_id),
    FOREIGN KEY (member_id, tenant_id)
        REFERENCES members(id, tenant_id),
    FOREIGN KEY (membership_plan_id, tenant_id)
        REFERENCES membership_plans(id, tenant_id),
    CHECK (end_date >= start_date)
);

CREATE INDEX idx_subscriptions_expiry
ON subscriptions(tenant_id, end_date, status);

CREATE TABLE platform_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    plan_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    is_trial_eligible BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES platform_plans(id),
    feature_code VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    usage_limit INTEGER,
    UNIQUE (plan_id, feature_code)
);

CREATE TABLE platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    plan_id UUID NOT NULL REFERENCES platform_plans(id),
    billing_interval VARCHAR(20) NOT NULL
        CHECK (billing_interval IN ('monthly','yearly','lifetime')),
    status VARCHAR(30) NOT NULL
        CHECK (status IN ('trialing','active','past_due','cancelled','expired','suspended')),
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'GHS',
    trial_starts_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_subscriptions_tenant
ON platform_subscriptions(tenant_id);

CREATE TABLE platform_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    subscription_id UUID NOT NULL REFERENCES platform_subscriptions(id),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    amount NUMERIC(14,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    status VARCHAR(30) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
);

CREATE TABLE platform_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    invoice_id UUID NOT NULL REFERENCES platform_invoices(id),
    provider VARCHAR(50),
    provider_reference VARCHAR(200),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    member_id UUID NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    subtotal NUMERIC(14,2) NOT NULL,
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'GHS',
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','issued','partially_paid','paid','overdue','cancelled')),
    issued_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, invoice_number),
    UNIQUE (id, tenant_id),
    FOREIGN KEY (member_id, tenant_id)
        REFERENCES members(id, tenant_id)
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    invoice_id UUID NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(14,2) NOT NULL,
    total NUMERIC(14,2) NOT NULL,
    FOREIGN KEY (invoice_id, tenant_id)
        REFERENCES invoices(id, tenant_id)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    member_id UUID NOT NULL,
    payment_reference VARCHAR(150) NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_provider VARCHAR(50),
    provider_reference VARCHAR(200),
    status VARCHAR(30) NOT NULL
        CHECK (status IN ('pending','processing','successful','failed','cancelled','partially_refunded','refunded')),
    paid_at TIMESTAMPTZ,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, payment_reference),
    UNIQUE (id, tenant_id),
    FOREIGN KEY (member_id, tenant_id)
        REFERENCES members(id, tenant_id)
);

CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    payment_id UUID NOT NULL,
    invoice_id UUID NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (payment_id, tenant_id)
        REFERENCES payments(id, tenant_id),
    FOREIGN KEY (invoice_id, tenant_id)
        REFERENCES invoices(id, tenant_id)
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    payment_id UUID NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    reason TEXT,
    provider_reference VARCHAR(200),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (payment_id, tenant_id)
        REFERENCES payments(id, tenant_id)
);

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    branch_id UUID NOT NULL,
    member_id UUID NOT NULL,
    check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_at TIMESTAMPTZ,
    check_in_method VARCHAR(30) NOT NULL
        CHECK (check_in_method IN ('qr','manual','card','barcode','device')),
    status VARCHAR(30) NOT NULL DEFAULT 'inside',
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (branch_id, tenant_id)
        REFERENCES branches(id, tenant_id),
    FOREIGN KEY (member_id, tenant_id)
        REFERENCES members(id, tenant_id),
    CHECK (check_out_at IS NULL OR check_out_at >= check_in_at)
);

CREATE UNIQUE INDEX uq_member_active_checkin
ON attendance_records(tenant_id, member_id)
WHERE check_out_at IS NULL;

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(150) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant_date
ON audit_logs(tenant_id, created_at DESC);

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    provider_event_id VARCHAR(200) NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    event_type VARCHAR(150) NOT NULL,
    payload JSONB NOT NULL,
    processing_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_event_id)
);

-- RLS policies should be installed only after the application role,
-- tenant context setup and migration/test strategy are established.
