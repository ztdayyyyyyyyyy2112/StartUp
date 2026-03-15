"""
NutriAI Backend — FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.session import init_db
from app.middleware.rate_limit import RateLimitMiddleware

# ── Startup / Shutdown ─────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup and shutdown tasks."""
    setup_logging()
    await init_db()
    yield
    # cleanup on shutdown


# ── App instance ───────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## NutriAI API

Nền tảng AI dinh dưỡng cá nhân hoá cho người Việt.

### Modules
- **Auth** — Đăng ký, đăng nhập, refresh token
- **Users** — Hồ sơ, mục tiêu sức khoẻ, cài đặt
- **Meals** — Quản lý bữa ăn, lịch sử
- **Foods** — Cơ sở dữ liệu 1000+ món ăn Việt
- **AI** — Gợi ý thực đơn, chatbot dinh dưỡng, phân tích
- **Tracking** — Calo, vận động, giấc ngủ, nước
- **Challenges** — Thử thách cộng đồng, điểm thưởng
- **Analytics** — Biểu đồ, báo cáo, xu hướng
    """,
    openapi_url="/api/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Health check ───────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    return JSONResponse({
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.APP_ENV,
    })


@app.get("/", tags=["System"])
async def root():
    return JSONResponse({
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "health": "/health",
    })
