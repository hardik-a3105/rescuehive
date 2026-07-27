"""
FastAPI application factory.
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base, async_session
from app.routers import (
    admin,
    analytics,
    auth,
    detections,
    missions,
    notifications,
    robots,
    system,
    ws,
)
from app.services.seed import seed_database
from app.services.ws_manager import heartbeat_loop
from app.utils import AppError, app_error_handler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rescuehive")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data if enabled
    if settings.SEED_ON_STARTUP:
        async with async_session() as db:
            await seed_database(db)

    # Start WebSocket heartbeat task
    heartbeat_task = asyncio.create_task(heartbeat_loop())

    yield

    # Teardown
    heartbeat_task.cancel()
    await engine.dispose()


app = FastAPI(
    title="RescueHive API",
    description="Backend for the RescueHive disaster intelligence platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(AppError, app_error_handler)


# Public health check
@app.get("/api/health", tags=["system"])
async def health_check():
    return JSONResponse(content={"status": "ok"})


# Mount routers
app.include_router(auth.router, prefix="/api")
app.include_router(missions.router, prefix="/api")
app.include_router(robots.router, prefix="/api")
app.include_router(detections.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(system.router, prefix="/api")
app.include_router(ws.router)
