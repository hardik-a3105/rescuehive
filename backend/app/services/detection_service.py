from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.domain import Detection, DetectionType, DetectionStatus


def get_detections(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    mission_id: Optional[UUID] = None,
    robot_id: Optional[UUID] = None,
    detection_type: Optional[str] = None,
    detection_status: Optional[str] = None,
    min_confidence: Optional[float] = None,
) -> tuple:
    """Return filtered, paginated detections."""
    query = db.query(Detection)

    if mission_id:
        query = query.filter(Detection.mission_id == mission_id)
    if robot_id:
        query = query.filter(Detection.robot_id == robot_id)
    if detection_type:
        try:
            dt = DetectionType(detection_type)
            query = query.filter(Detection.detection_type == dt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid detection type: {detection_type}",
            )
    if detection_status:
        try:
            ds = DetectionStatus(detection_status)
            query = query.filter(Detection.status == ds)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid detection status: {detection_status}",
            )
    if min_confidence is not None:
        query = query.filter(Detection.confidence >= min_confidence)

    total = query.count()
    detections = query.order_by(Detection.timestamp.desc()).offset(skip).limit(limit).all()
    return detections, total


def get_detection_by_id(db: Session, detection_id: UUID) -> Detection:
    """Fetch a single detection by ID."""
    detection = db.query(Detection).filter(Detection.id == detection_id).first()
    if not detection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Detection {detection_id} not found",
        )
    return detection


def create_detection(db: Session, **kwargs) -> Detection:
    """Create a new detection record."""
    # Validate detection type
    try:
        det_type = DetectionType(kwargs["detection_type"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid detection type: {kwargs['detection_type']}",
        )

    detection = Detection(
        mission_id=kwargs.get("mission_id"),
        robot_id=kwargs.get("robot_id"),
        detection_type=det_type,
        confidence=kwargs["confidence"],
        x=kwargs.get("x"),
        y=kwargs.get("y"),
        z=kwargs.get("z"),
        image_path=kwargs.get("image_path"),
        status=DetectionStatus.PENDING,
    )
    db.add(detection)
    db.commit()
    db.refresh(detection)
    return detection


def confirm_detection(db: Session, detection_id: UUID) -> Detection:
    """Mark a detection as confirmed."""
    detection = get_detection_by_id(db, detection_id)
    if detection.status == DetectionStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Detection is already confirmed",
        )
    detection.status = DetectionStatus.CONFIRMED
    db.commit()
    db.refresh(detection)
    return detection


def dismiss_detection(db: Session, detection_id: UUID) -> Detection:
    """Mark a detection as dismissed."""
    detection = get_detection_by_id(db, detection_id)
    if detection.status == DetectionStatus.DISMISSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Detection is already dismissed",
        )
    detection.status = DetectionStatus.DISMISSED
    db.commit()
    db.refresh(detection)
    return detection
