from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns service availability and status.",
)
async def get_health() -> HealthResponse:
    """
    Service health check endpoint.
    Returns status: 'ok' and service name.
    """
    return HealthResponse(
        status="ok",
        service="rescuehive-backend",
    )
