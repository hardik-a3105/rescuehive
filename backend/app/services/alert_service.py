from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.domain import Alert, AlertSeverity, AlertStatus


def get_alerts(db: Session, skip: int = 0, limit: int = 100) -> tuple:
    """Return paginated list of alerts (newest first)."""
    total = db.query(Alert).count()
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts, total


def create_alert(db: Session, **kwargs) -> Alert:
    """Create a new alert."""
    try:
        severity = AlertSeverity(kwargs.get("severity", "LOW"))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid severity: {kwargs.get('severity')}",
        )

    alert = Alert(
        mission_id=kwargs.get("mission_id"),
        robot_id=kwargs.get("robot_id"),
        severity=severity,
        title=kwargs["title"],
        message=kwargs.get("message"),
        status=AlertStatus.ACTIVE,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def acknowledge_alert(db: Session, alert_id: UUID) -> Alert:
    """Acknowledge an active alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found",
        )
    if alert.status == AlertStatus.ACKNOWLEDGED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alert is already acknowledged",
        )
    alert.status = AlertStatus.ACKNOWLEDGED
    db.commit()
    db.refresh(alert)
    return alert
