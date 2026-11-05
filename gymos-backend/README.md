# GymOS Backend

FastAPI starter scaffold.

## Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `DATABASE_URL` to a PostgreSQL database, then run:
```bash
uvicorn app.main:app --reload
```

- Health: http://localhost:8000/health
- OpenAPI: http://localhost:8000/docs

The scaffold intentionally does not yet implement authentication, tenant resolution, RLS, business modules or production migrations. Implement and test those before exposing tenant data.
