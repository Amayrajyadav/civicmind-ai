import time
import logging
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.endpoints import router as api_router

# Setup logger for the core app
logger = logging.getLogger("civicmind_main")

app = FastAPI(
    title="CivicMind AI Backend",
    description=(
        "AI-Powered Constituency Decision Intelligence Platform backend. "
        "Accepts community issues, coordinates Gemini decision support, "
        "and creates structured PDF-ready briefs for Member of Parliament dashboard interfaces."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log all incoming request execution durations
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    logger.debug(f"Request {request.method} {request.url.path} handled in {process_time:.4f}s")
    return response

# Liveness/Readiness probe
@app.get(
    "/health",
    tags=["Health Status"],
    summary="Retrieve backend health details",
    description="Returns current health state, system timestamp, and connection statuses of firebase and Gemini services."
)
async def health_check():
    from .services.firebase_service import use_mock as fb_mock
    from .services.gemini_service import client as gemini_client
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "firebase": "mock" if fb_mock else "connected",
            "gemini": "connected" if gemini_client else "mock"
        }
    }



# Mount v1 router
app.include_router(api_router, prefix="/api/v1", tags=["CivicMind Core API"])

# Welcome route
@app.get("/", include_in_schema=False)
async def root():
    return {
        "name": "CivicMind AI API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }
