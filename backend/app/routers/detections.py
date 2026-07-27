"""
Detections router — victims and hazards list + confirm/reject.
Matches BACKEND.md §5.3.
Critical business rule: detections can only be confirmed/rejected by humans.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.detection import HazardDetectionModel, VictimDetectionModel
from app.models.user import UserModel
from app.schemas.detection import (
    HazardDetectionOut,
    UpdateDetectionRequest,
    VictimDetectionOut,
)
from app.schemas.robot import Coordinates
from app.services.ws_manager import ws_manager
from app.utils import AppError

router = APIRouter(prefix="/detections", tags=["detections"])


def _to_victim_out(d: VictimDetectionModel) -> VictimDetectionOut:
    return VictimDetectionOut(
        id=d.id,
        missionId=d.mission_id,
        robotId=d.robot_id,
        robotName=d.robot_name,
        imageUrl=d.image_url,
        confidence=d.confidence,
        position=Coordinates(lat=d.lat, lng=d.lng),
        distance=d.distance,
        priority=d.priority,
        detectedAt=d.detected_at.isoformat() if d.detected_at else "",
        status=d.status,
        notes=d.notes,
    )


def _to_hazard_out(d: HazardDetectionModel) -> HazardDetectionOut:
    return HazardDetectionOut(
        id=d.id,
        missionId=d.mission_id,
        type=d.type,
        severity=d.severity,
        position=Coordinates(lat=d.lat, lng=d.lng),
        robotId=d.robot_id,
        robotName=d.robot_name,
        imageUrl=d.image_url,
        detectedAt=d.detected_at.isoformat() if d.detected_at else "",
        status=d.status,
    )


@router.get("/victims", response_model=list[VictimDetectionOut])
async def list_victims(
    mission_id: str | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    stmt = select(VictimDetectionModel)
    if mission_id:
        stmt = stmt.where(VictimDetectionModel.mission_id == mission_id)
    if status:
        stmt = stmt.where(VictimDetectionModel.status == status)
    stmt = stmt.order_by(VictimDetectionModel.detected_at.desc())
    result = await db.execute(stmt)
    return [_to_victim_out(d) for d in result.scalars().all()]


@router.patch("/victims/{detection_id}", response_model=VictimDetectionOut)
async def update_victim(
    detection_id: str,
    body: UpdateDetectionRequest,
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(
        require_role(["field_operator", "incident_commander"])
    ),
):
    result = await db.execute(
        select(VictimDetectionModel).where(VictimDetectionModel.id == detection_id)
    )
    detection = result.scalar_one_or_none()
    if not detection:
        raise AppError(404, "DETECTION_NOT_FOUND", "Victim detection not found.")

    if detection.status in ("confirmed", "rejected"):
        raise AppError(409, "DETECTION_ALREADY_CONFIRMED", "This detection has already been reviewed.")

    detection.status = body.status.value
    if body.notes is not None:
        detection.notes = body.notes
    detection.confirmed_by = user.id
    detection.confirmed_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(detection)

    # Broadcast detection update via WebSocket
    out = _to_victim_out(detection)
    await ws_manager.broadcast({
        "type": "detection",
        "kind": "victim",
        "payload": out.model_dump(),
    })

    return out


@router.get("/hazards", response_model=list[HazardDetectionOut])
async def list_hazards(
    mission_id: str | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    stmt = select(HazardDetectionModel)
    if mission_id:
        stmt = stmt.where(HazardDetectionModel.mission_id == mission_id)
    if status:
        stmt = stmt.where(HazardDetectionModel.status == status)
    stmt = stmt.order_by(HazardDetectionModel.detected_at.desc())
    result = await db.execute(stmt)
    return [_to_hazard_out(d) for d in result.scalars().all()]


@router.patch("/hazards/{detection_id}", response_model=HazardDetectionOut)
async def update_hazard(
    detection_id: str,
    body: UpdateDetectionRequest,
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(
        require_role(["field_operator", "incident_commander"])
    ),
):
    result = await db.execute(
        select(HazardDetectionModel).where(HazardDetectionModel.id == detection_id)
    )
    detection = result.scalar_one_or_none()
    if not detection:
        raise AppError(404, "DETECTION_NOT_FOUND", "Hazard detection not found.")

    if detection.status in ("confirmed", "rejected"):
        raise AppError(409, "DETECTION_ALREADY_CONFIRMED", "This detection has already been reviewed.")

    detection.status = body.status.value
    detection.confirmed_by = user.id
    detection.confirmed_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(detection)

    out = _to_hazard_out(detection)
    await ws_manager.broadcast({
        "type": "detection",
        "kind": "hazard",
        "payload": out.model_dump(),
    })

    return out
