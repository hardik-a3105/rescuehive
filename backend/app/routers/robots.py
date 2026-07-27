"""
Robots router — list, detail, retask, emergency stop, camera, trail.
Matches BACKEND.md §5.2 + §5.4.
"""

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.robot import RobotModel, RobotTelemetryModel
from app.models.user import UserModel
from app.schemas.robot import CameraFeedOut, Coordinates, RetaskRequest, RobotOut, SensorStatus
from app.services.ws_manager import ws_manager
from app.utils import AppError

router = APIRouter(prefix="/robots", tags=["robots"])


def _to_robot_out(r: RobotModel) -> RobotOut:
    trail = []
    if r.trail_json:
        try:
            trail = [Coordinates(**c) for c in json.loads(r.trail_json)]
        except (json.JSONDecodeError, TypeError):
            trail = []
    return RobotOut(
        id=r.id,
        name=r.name,
        callsign=r.callsign,
        battery=r.battery,
        signal=r.signal,
        health=r.health,
        task=r.task,
        temperature=r.temperature,
        speed=r.speed,
        position=Coordinates(lat=r.lat, lng=r.lng),
        distanceTravelled=r.distance_travelled,
        sensors=SensorStatus(
            lidar=r.sensor_lidar,
            thermal=r.sensor_thermal,
            camera=r.sensor_camera,
            gas=r.sensor_gas,
        ),
        lastSeen=r.last_seen.isoformat() if r.last_seen else "",
        connection=r.connection,
        trail=trail,
        missionId=r.mission_id or "",
    )


@router.get("", response_model=list[RobotOut])
async def list_robots(
    mission_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    stmt = select(RobotModel)
    if mission_id:
        stmt = stmt.where(RobotModel.mission_id == mission_id)
    result = await db.execute(stmt)
    return [_to_robot_out(r) for r in result.scalars().all()]


@router.get("/{robot_id}", response_model=RobotOut)
async def get_robot(
    robot_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    result = await db.execute(select(RobotModel).where(RobotModel.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise AppError(404, "ROBOT_NOT_FOUND", "Robot not found.")
    return _to_robot_out(robot)


@router.post("/{robot_id}/retask", response_model=RobotOut)
async def retask_robot(
    robot_id: str,
    body: RetaskRequest,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(
        require_role(["field_operator", "incident_commander"])
    ),
):
    result = await db.execute(select(RobotModel).where(RobotModel.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise AppError(404, "ROBOT_NOT_FOUND", "Robot not found.")
    robot.task = body.task.value
    await db.flush()
    await db.refresh(robot)

    # Broadcast robot_status WS message
    await ws_manager.broadcast({
        "type": "robot_status",
        "robotId": robot.id,
        "health": robot.health,
        "task": robot.task,
        "connection": robot.connection,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return _to_robot_out(robot)


@router.post("/{robot_id}/emergency-stop", response_model=RobotOut)
async def emergency_stop(
    robot_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(
        require_role(["field_operator", "incident_commander"])
    ),
):
    result = await db.execute(select(RobotModel).where(RobotModel.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise AppError(404, "ROBOT_NOT_FOUND", "Robot not found.")
    robot.task = "e_stopped"
    robot.speed = 0.0
    await db.flush()
    await db.refresh(robot)

    # High-priority broadcast
    await ws_manager.broadcast({
        "type": "robot_status",
        "robotId": robot.id,
        "health": robot.health,
        "task": "e_stopped",
        "connection": robot.connection,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return _to_robot_out(robot)


@router.post("/{robot_id}/return-home", response_model=RobotOut)
async def return_home(
    robot_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(
        require_role(["field_operator", "incident_commander"])
    ),
):
    result = await db.execute(select(RobotModel).where(RobotModel.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise AppError(404, "ROBOT_NOT_FOUND", "Robot not found.")
    robot.task = "returning_home"
    await db.flush()
    await db.refresh(robot)

    await ws_manager.broadcast({
        "type": "robot_status",
        "robotId": robot.id,
        "health": robot.health,
        "task": "returning_home",
        "connection": robot.connection,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return _to_robot_out(robot)


@router.get("/{robot_id}/trail")
async def robot_trail(
    robot_id: str,
    since: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    result = await db.execute(select(RobotModel).where(RobotModel.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise AppError(404, "ROBOT_NOT_FOUND", "Robot not found.")

    trail = []
    if robot.trail_json:
        try:
            trail = json.loads(robot.trail_json)
        except (json.JSONDecodeError, TypeError):
            trail = []
    return {"robotId": robot.id, "trail": trail}


@router.get("/{robot_id}/telemetry-history")
async def telemetry_history(
    robot_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(
        require_role(["developer", "system_administrator"])
    ),
    limit: int = Query(100, ge=1, le=1000),
):
    result = await db.execute(
        select(RobotTelemetryModel)
        .where(RobotTelemetryModel.robot_id == robot_id)
        .order_by(RobotTelemetryModel.timestamp.desc())
        .limit(limit)
    )
    telemetry = result.scalars().all()
    return [
        {
            "robotId": t.robot_id,
            "timestamp": t.timestamp.isoformat(),
            "battery": t.battery,
            "speed": t.speed,
            "temperature": t.temperature,
            "signal": t.signal,
            "position": {"lat": t.lat, "lng": t.lng},
        }
        for t in telemetry
    ]


@router.get("/{robot_id}/camera", response_model=CameraFeedOut)
async def camera_metadata(
    robot_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    result = await db.execute(select(RobotModel).where(RobotModel.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise AppError(404, "ROBOT_NOT_FOUND", "Robot not found.")

    return CameraFeedOut(
        robotId=robot.id,
        robotName=robot.name,
        streamUrl=f"https://picsum.photos/seed/{robot.id}-cam/640/360",
        fps=25,
        latencyMs=120.0,
        isLive=robot.connection == "live",
        isRecording=True,
        hasThermal=robot.sensor_thermal != "fault",
        hasDepth=True,
        lastFrameAt=datetime.now(timezone.utc).isoformat(),
    )


@router.post("/{robot_id}/camera/snapshot")
async def camera_snapshot(
    robot_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    result = await db.execute(select(RobotModel).where(RobotModel.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise AppError(404, "ROBOT_NOT_FOUND", "Robot not found.")

    return {
        "imageUrl": f"https://picsum.photos/seed/{robot.id}-snap-{int(datetime.now(timezone.utc).timestamp())}/640/480",
        "capturedAt": datetime.now(timezone.utc).isoformat(),
    }
