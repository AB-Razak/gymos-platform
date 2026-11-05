from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import router

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

# Frontend development and production origins.
allowed_origins = [
    settings.frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(allowed_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": settings.app_name,
    }


app.include_router(
    router,
    prefix=settings.api_v1_prefix,
)