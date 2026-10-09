from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.detection import DetectionCreate, DetectionResponse, DetectionListResponse
from app.services.detection_service import (
    get_detections, get_detection_by_id, create_detection, confirm_detection, dismiss_detection,
)
from app.core.security import get_current_user
from app.models.domain import User

router = APIRouter(prefix="/detections", tags=["Detections"])


@router.get("", response_model=DetectionListResponse, summary="List detections")
def api_list_detections(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    mission_id: Optional[UUID] = None,
    robot_id: Optional[UUID] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    min_confidence: Optional[float] = Query(None, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return filtered, paginated list of detections.
    Supports filtering by mission, robot, type, status, and minimum confidence.
    """
    detections, total = get_detections(
        db,
        skip=skip, limit=limit,
        mission_id=mission_id,
        robot_id=robot_id,
        detection_type=type,
        detection_status=status,
        min_confidence=min_confidence,
    )
    return DetectionListResponse(detections=detections, total=total)


@router.get("/{detection_id}", response_model=DetectionResponse, summary="Get detection details")
def api_get_detection(
    detection_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details of a specific detection."""
    return get_detection_by_id(db, detection_id)


@router.post("", response_model=DetectionResponse, status_code=201, summary="Create a detection")
def api_create_detection(
    data: DetectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record a new detection event."""
    return create_detection(db, **data.model_dump())


@router.patch("/{detection_id}/confirm", response_model=DetectionResponse, summary="Confirm a detection")
def api_confirm_detection(
    detection_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a detection as confirmed by an operator."""
    return confirm_detection(db, detection_id)


@router.patch("/{detection_id}/dismiss", response_model=DetectionResponse, summary="Dismiss a detection")
def api_dismiss_detection(
    detection_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dismiss a false-positive detection."""
    return dismiss_detection(db, detection_id)
