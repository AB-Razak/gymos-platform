# GymOS Platform

Multi-tenant Gym Management & Fitness Operations SaaS starter repository.

## What's included

- Product and technical architecture documentation
- Initial PostgreSQL schema reference
- FastAPI backend scaffold
- React + TypeScript + Vite frontend scaffold
- API, security, tenancy, billing and implementation documentation
- Environment templates and development instructions

## Important scope note

This ZIP is a **development starter and architecture pack**, not a completed production gym-management application. The backend/frontend are bootstrapped scaffolds. The SQL file is an initial schema reference that must be reviewed, split into Alembic migrations, and tested before production use. Payment integrations, full RBAC, RLS policies, tenant-domain verification, and the business modules still require implementation.

## Product decisions

- Multi-tenant SaaS
- Self-service and approval-based gym onboarding
- Workspace access through subdomains, path-based URLs and verified custom domains
- Hybrid monetisation: free tier, free trial and paid plans
- React + TypeScript frontend
- Python FastAPI backend
- PostgreSQL + SQLAlchemy + Alembic
- Modular monolith

## Repository layout

- `gymos-backend/` — FastAPI starter
- `gymos-frontend/` — React + TypeScript starter
- `database/` — initial PostgreSQL schema reference
- `documentation/` — architecture and implementation blueprint

## Quick start

### Backend

```bash
cd gymos-backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The initial health endpoint is `GET /health`; API documentation is available at `/docs`.

### Frontend

```bash
cd gymos-frontend
npm install
cp .env.example .env
npm run dev
```

## Before production

1. Configure real secrets and managed infrastructure.
2. Implement and test tenant resolution and authorization.
3. Convert the schema reference into reviewed Alembic migrations.
4. Implement PostgreSQL RLS using a restricted application database role.
5. Add payment-provider webhook verification and idempotency.
6. Add automated tests for cross-tenant isolation and financial invariants.
7. Configure backups, monitoring, TLS and deployment environments.

See `documentation/IMPLEMENTATION_ROADMAP.md`.
