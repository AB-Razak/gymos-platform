
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.core.config import settings
from app.api.v1.router import router


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gymos")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("%s API is starting...", settings.app_name)
    logger.info("API version prefix: %s", settings.api_v1_prefix)

    yield

    logger.info("%s API is shutting down...", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

# Frontend development and production origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gymos-platform-omega.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def home():
    return HTMLResponse(
        content=f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="theme-color" content="#09090b">
            <title>{settings.app_name} | API Status</title>

            <style>
                * {{
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }}

                body {{
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: #09090b;
                    color: #fafafa;
                    font-family: Inter, -apple-system, BlinkMacSystemFont,
                                 "Segoe UI", sans-serif;
                }}

                .container {{
                    width: 100%;
                    max-width: 760px;
                }}

                .brand {{
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    color: #a1a1aa;
                    margin-bottom: 48px;
                }}

                .card {{
                    background: #18181b;
                    border: 1px solid #27272a;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 24px 80px rgba(0,0,0,.3);
                }}

                .status {{
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    padding: 9px 14px;
                    border-radius: 30px;
                    background: rgba(34,197,94,.1);
                    color: #4ade80;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 28px;
                }}

                .dot {{
                    height: 8px;
                    width: 8px;
                    border-radius: 50%;
                    background: #4ade80;
                    box-shadow: 0 0 12px #4ade80;
                }}

                h1 {{
                    font-size: clamp(30px, 6vw, 46px);
                    letter-spacing: -2px;
                    margin-bottom: 16px;
                }}

                .description {{
                    color: #a1a1aa;
                    line-height: 1.8;
                    font-size: 15px;
                    max-width: 540px;
                }}

                .divider {{
                    height: 1px;
                    background: #27272a;
                    margin: 32px 0;
                }}

                .details {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }}

                .detail-label {{
                    color: #71717a;
                    font-size: 12px;
                    margin-bottom: 9px;
                }}

                .detail-value {{
                    font-size: 14px;
                    font-weight: 600;
                    overflow-wrap: anywhere;
                }}

                .links {{
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-top: 32px;
                }}

                a {{
                    display: inline-flex;
                    padding: 12px 18px;
                    border-radius: 10px;
                    background: #fafafa;
                    color: #09090b;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 700;
                    transition: opacity .2s;
                }}

                a:hover {{
                    opacity: .8;
                }}

                a.secondary {{
                    background: #27272a;
                    color: #fafafa;
                    border: 1px solid #3f3f46;
                }}

                footer {{
                    margin-top: 28px;
                    color: #52525b;
                    font-size: 12px;
                    text-align: center;
                }}

                @media(max-width: 520px) {{
                    .card {{ padding: 26px 22px; }}
                    .details {{ grid-template-columns: 1fr; }}
                    .brand {{ margin-bottom: 30px; }}
                }}
            </style>
        </head>

        <body>
            <main class="container">
                <div class="brand">GYMOS <span style="color:#52525b">/ API</span></div>

                <section class="card">
                    <div class="status">
                        <span class="dot"></span>
                        ALL SYSTEMS OPERATIONAL
                    </div>

                    <h1>Backend is running.</h1>

                    <p class="description">
                        The {settings.app_name} API is online and ready
                        to receive requests. Your backend service has
                        successfully started.
                    </p>

                    <div class="divider"></div>

                    <div class="details">
                        <div>
                            <div class="detail-label">SERVICE</div>
                            <div class="detail-value">{settings.app_name}</div>
                        </div>

                        <div>
                            <div class="detail-label">STATUS</div>
                            <div class="detail-value" style="color:#4ade80">
                                Operational
                            </div>
                        </div>

                        <div>
                            <div class="detail-label">API PREFIX</div>
                            <div class="detail-value">{settings.api_v1_prefix}</div>
                        </div>

                        <div>
                            <div class="detail-label">ENVIRONMENT</div>
                            <div class="detail-value">
                                {"Development" if settings.debug else "Production"}
                            </div>
                        </div>
                    </div>

                    <div class="links">
                        <a href="/health">Health Check ↗</a>
                        <a href="/docs" class="secondary">API Documentation ↗</a>
                    </div>
                </section>

                <footer>
                    © {settings.app_name} · API Service
                </footer>
            </main>
        </body>
        </html>
        """
    )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "application": settings.app_name,
        "environment": "development" if settings.debug else "production",
        "api_prefix": settings.api_v1_prefix,
    }


app.include_router(
    router,
    prefix=settings.api_v1_prefix,
)
