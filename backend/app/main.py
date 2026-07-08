import time
import logging
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .api.endpoints import router as api_router

logger = logging.getLogger("civicmind_main")

app = FastAPI(
    title="CivicMind AI Backend",
    description=(
        "AI-Powered Constituency Decision Intelligence Platform backend. "
        "Accepts community issues, coordinates Gemini decision support, "
        "and creates structured PDF-ready briefs."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# -------------------------------
# CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Middleware
# -------------------------------
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    logger.debug(
        f"{request.method} {request.url.path} handled in {process_time:.4f}s"
    )
    return response


# -------------------------------
# Health
# -------------------------------


@app.get(
    "/health",
    tags=["Health Status"],
    summary="Retrieve backend health details",
)
async def health_check():
    from .services.firebase_service import use_mock as fb_mock
    from .services.gemini_service import client as gemini_client

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "firebase": "mock" if fb_mock else "connected",
            "gemini": "connected" if gemini_client else "mock",
        },
    }


# -------------------------------
# API Routes
# -------------------------------
app.include_router(api_router, prefix="/api/v1", tags=["CivicMind Core API"])


# ============================================================
# FRONTEND (React Build)
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

print("=" * 60)
print("BASE_DIR:", BASE_DIR)

FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

print("FRONTEND_DIST:", FRONTEND_DIST)
print("Exists:", FRONTEND_DIST.exists())
print("=" * 60)

if FRONTEND_DIST.exists():

    assets_dir = FRONTEND_DIST / "assets"

    if assets_dir.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=str(assets_dir)),
            name="assets",
        )

    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):

        # Don't intercept API endpoints
        if full_path.startswith("api"):
            return {"error": "API route not found"}

        # Don't intercept docs
        if full_path.startswith("docs"):
            return {"error": "Not Found"}

        requested = FRONTEND_DIST / full_path

        if requested.exists() and requested.is_file():
            return FileResponse(requested)

        return FileResponse(FRONTEND_DIST / "index.html")

else:

    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "name": "CivicMind AI API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/health",
        }