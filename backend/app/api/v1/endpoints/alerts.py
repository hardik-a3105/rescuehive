from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.alert import AlertResponse, AlertListResponse
from app.services.alert_service import get_alerts, acknowledge_alert
from app.core.security import get_current_user
from app.models.domain import User

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=AlertListResponse, summary="List all alerts")
def api_list_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a paginated list of all alerts (newest first)."""
    alerts, total = get_alerts(db, skip=skip, limit=limit)
    return AlertListResponse(alerts=alerts, total=total)


@router.patch("/{alert_id}/acknowledge", response_model=AlertResponse, summary="Acknowledge an alert")
def api_acknowledge_alert(
    alert_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Acknowledge an active alert."""
    return acknowledge_alert(db, alert_id)
