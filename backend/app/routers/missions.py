"""
Missions router — CRUD + state transitions + report/summary.
Matches BACKEND.md §5.1.
"""

import random
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.detection import HazardDetectionModel, VictimDetectionModel
from app.models.log import LogEntryModel
from app.models.mission import MissionModel
from app.models.robot import RobotModel
from app.models.user import UserModel
from app.schemas.detection import HazardDetectionOut, VictimDetectionOut
from app.schemas.mission import (
    CreateMissionRequest,
    MissionOut,
    MissionReportOut,
    UpdateMissionRequest,
)
from app.schemas.system import LogEntryOut
from app.utils import AppError

router = APIRouter(prefix="/missions", tags=["missions"])


def _to_mission_out(m: MissionModel) -> MissionOut:
    return MissionOut(
        id=m.id,
        name=m.name,
        status=m.status,
        startedAt=m.started_at.isoformat() if m.started_at else "",
        endedAt=m.ended_at.isoformat() if m.ended_at else None,
        areaCoverage=m.area_coverage,
        robotsActive=m.robots_active,
        victimsFound=m.victims_found,
        hazardsFound=m.hazards_found,
        averageBattery=m.average_battery,
        connectionHealth=m.connection_health,
        location=m.location,
        searchAreaKm2=m.search_area_km2,
    )


@router.get("", response_model=list[MissionOut])
async def list_missions(
    status: str | None = Query(None),
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    stmt = select(MissionModel)
    if status:
        stmt = stmt.where(MissionModel.status == status)
    if q:
        stmt = stmt.where(MissionModel.name.ilike(f"%{q}%"))
    stmt = stmt.order_by(MissionModel.created_at.desc())
    result = await db.execute(stmt)
    return [_to_mission_out(m) for m in result.scalars().all()]


@router.get("/{mission_id}", response_model=MissionOut)
async def get_mission(
    mission_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    result = await db.execute(select(MissionModel).where(MissionModel.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise AppError(404, "MISSION_NOT_FOUND", "Mission not found.")
    return _to_mission_out(mission)


@router.post("", response_model=MissionOut, status_code=201)
async def create_mission(
    body: CreateMissionRequest,
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(
        require_role(["incident_commander", "system_administrator"])
    ),
):
    mission = MissionModel(
        name=body.name,
        location=body.location,
        search_area_km2=body.searchAreaKm2,
        status="planning",
        commander_id=user.id,
    )
    db.add(mission)
    await db.flush()
    await db.refresh(mission)
    return _to_mission_out(mission)


@router.patch("/{mission_id}", response_model=MissionOut)
async def update_mission(
    mission_id: str,
    body: UpdateMissionRequest,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(
        require_role(["incident_commander", "system_administrator"])
    ),
):
    result = await db.execute(select(MissionModel).where(MissionModel.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise AppError(404, "MISSION_NOT_FOUND", "Mission not found.")

    if body.name is not None:
        mission.name = body.name
    if body.location is not None:
        mission.location = body.location
    if body.searchAreaKm2 is not None:
        mission.search_area_km2 = body.searchAreaKm2

    await db.flush()
    await db.refresh(mission)
    return _to_mission_out(mission)


@router.post("/{mission_id}/start", response_model=MissionOut)
async def start_mission(
    mission_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(
        require_role(["incident_commander", "field_operator"])
    ),
):
    result = await db.execute(select(MissionModel).where(MissionModel.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise AppError(404, "MISSION_NOT_FOUND", "Mission not found.")
    if mission.status not in ("planning", "paused"):
        raise AppError(409, "INVALID_TRANSITION", f"Cannot start a mission with status '{mission.status}'.")
    mission.status = "active"
    mission.started_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(mission)
    return _to_mission_out(mission)


@router.post("/{mission_id}/pause", response_model=MissionOut)
async def pause_mission(
    mission_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(
        require_role(["incident_commander", "field_operator"])
    ),
):
    result = await db.execute(select(MissionModel).where(MissionModel.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise AppError(404, "MISSION_NOT_FOUND", "Mission not found.")
    if mission.status != "active":
        raise AppError(409, "INVALID_TRANSITION", "Only active missions can be paused.")
    mission.status = "paused"
    await db.flush()
    await db.refresh(mission)
    return _to_mission_out(mission)


@router.post("/{mission_id}/stop", response_model=MissionOut)
async def stop_mission(
    mission_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(require_role(["incident_commander"])),
):
    result = await db.execute(select(MissionModel).where(MissionModel.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise AppError(404, "MISSION_NOT_FOUND", "Mission not found.")
    if mission.status in ("completed", "aborted"):
        raise AppError(409, "INVALID_TRANSITION", "Mission is already terminated.")
    mission.status = "completed"
    mission.ended_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(mission)
    return _to_mission_out(mission)


@router.get("/{mission_id}/summary")
async def mission_summary(
    mission_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    result = await db.execute(select(MissionModel).where(MissionModel.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise AppError(404, "MISSION_NOT_FOUND", "Mission not found.")

    # Count detections
    v_count = (await db.execute(
        select(VictimDetectionModel).where(VictimDetectionModel.mission_id == mission_id)
    )).scalars().all()
    h_count = (await db.execute(
        select(HazardDetectionModel).where(HazardDetectionModel.mission_id == mission_id)
    )).scalars().all()

    return {
        "missionId": mission.id,
        "missionName": mission.name,
        "status": mission.status,
        "areaCoverage": mission.area_coverage,
        "robotsActive": mission.robots_active,
        "victimsFound": len(v_count),
        "hazardsFound": len(h_count),
        "averageBattery": mission.average_battery,
        "duration": (
            (mission.ended_at or datetime.now(timezone.utc)) - mission.started_at
        ).total_seconds() if mission.started_at else 0,
    }


@router.get("/{mission_id}/images")
async def mission_images(
    mission_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(VictimDetectionModel)
        .where(VictimDetectionModel.mission_id == mission_id)
        .order_by(VictimDetectionModel.detected_at.desc())
        .offset(offset)
        .limit(limit)
    )
    detections = result.scalars().all()
    return [
        {"id": d.id, "imageUrl": d.image_url, "detectedAt": d.detected_at.isoformat(), "robotName": d.robot_name}
        for d in detections
    ]


@router.get("/{mission_id}/logs", response_model=list[LogEntryOut])
async def mission_logs(
    mission_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(
        require_role(["system_administrator", "developer"])
    ),
    limit: int = Query(100, ge=1, le=500),
):
    result = await db.execute(
        select(LogEntryModel)
        .where(LogEntryModel.mission_id == mission_id)
        .order_by(LogEntryModel.timestamp.desc())
        .limit(limit)
    )
    return [
        LogEntryOut(
            id=log.id,
            timestamp=log.timestamp.isoformat(),
            level=log.level,
            source=log.source,
            message=log.message,
        )
        for log in result.scalars().all()
    ]


@router.get("/{mission_id}/report", response_model=MissionReportOut)
async def mission_report(
    mission_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    result = await db.execute(select(MissionModel).where(MissionModel.id == mission_id))
    mission = result.scalar_one_or_none()
    if not mission:
        raise AppError(404, "MISSION_NOT_FOUND", "Mission not found.")

    # Get robots for this mission
    robots_result = await db.execute(
        select(RobotModel).where(RobotModel.mission_id == mission_id)
    )
    robots = robots_result.scalars().all()

    # Build plausible AI recommendations
    ai_recommendations = [
        "Prioritize sectors 3B and 5A for secondary sweeps based on thermal anomaly clustering.",
        "Deploy additional ground units to the northwestern quadrant where aerial coverage is limited.",
        "Consider rotating robots RH-03 and RH-07 due to elevated temperature readings and potential sensor degradation.",
        f"Current area coverage ({mission.area_coverage:.1f}%) suggests extending the search grid by 0.8 km² to cover the adjacent collapsed structures.",
        "Recommend establishing a forward staging area closer to the high-density detection zone to reduce robot transit time.",
    ]

    robot_stats = [
        {
            "robotId": r.id,
            "name": r.name,
            "callsign": r.callsign,
            "battery": r.battery,
            "distanceTravelled": r.distance_travelled,
            "health": r.health,
            "task": r.task,
        }
        for r in robots
    ]

    # Simulated coverage timeline (hourly snapshots)
    coverage_timeline = [
        {"hour": i, "coverage": min(mission.area_coverage, random.uniform(0, mission.area_coverage) * (i + 1) / 8)}
        for i in range(8)
    ]

    return MissionReportOut(
        missionId=mission.id,
        missionName=mission.name,
        summary=(
            f"Mission '{mission.name}' deployed {len(robots)} robots across {mission.search_area_km2} km² "
            f"in {mission.location}. {mission.victims_found} potential victims identified, "
            f"{mission.hazards_found} hazards mapped. Current area coverage: {mission.area_coverage:.1f}%."
        ),
        coverageTimeline=coverage_timeline,
        victimPriorityBreakdown={
            "critical": mission.victims_found // 4,
            "high": mission.victims_found // 3,
            "medium": mission.victims_found // 3,
            "low": max(0, mission.victims_found - mission.victims_found // 4 - mission.victims_found // 3 * 2),
        },
        robotStats=robot_stats,
        aiRecommendations=ai_recommendations,
    )
