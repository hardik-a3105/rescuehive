from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, missions, robots, detections, alerts, dashboard

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router)
api_router.include_router(missions.router)
api_router.include_router(robots.router)
api_router.include_router(detections.router)
api_router.include_router(alerts.router)
api_router.include_router(dashboard.router)
