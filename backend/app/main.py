import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse

from app.core.config import settings
from app.api.v1.api import api_router

# Import all models so they are registered with Base.metadata
import app.db.base_class  # noqa: F401

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("rescuehive")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes system foundation during startup and handles graceful shutdown.
    """
    logger.info("Starting RescueHive backend in '%s' environment", settings.ENVIRONMENT)
    logger.info("Interactive docs available at /docs")
    logger.info("API prefix mounted at '%s'", settings.API_V1_STR)

    # In development mode, create tables if they don't exist (fallback for no-migration setups)
    if settings.ENVIRONMENT == "development":
        try:
            from app.db.base import Base
            from app.db.session import engine
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables verified/created successfully")
        except Exception as exc:
            logger.warning("Could not auto-create tables (PostgreSQL may not be running): %s", exc)

    yield
    logger.info("Shutting down RescueHive backend")


# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for RescueHive — AI-Powered Multi-Robot Disaster Intelligence System",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS) for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)


# ─── Global Error Handlers ───────────────────────────────────────────
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"},
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error("Internal server error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/", include_in_schema=False)
async def root_redirect():
    """Redirect root path to interactive API documentation."""
    return RedirectResponse(url="/docs")
