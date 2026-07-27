"""
Database seeder — creates demo users and sample data matching the
frontend's mockData.ts so the same demo accounts work against the real backend.
"""

import json
import logging
import random
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.detection import HazardDetectionModel, VictimDetectionModel
from app.models.log import LogEntryModel
from app.models.mission import MissionModel
from app.models.notification import NotificationModel
from app.models.robot import RobotModel
from app.models.user import UserModel
from app.services.auth_service import hash_password

logger = logging.getLogger("rescuehive.seed")

# ── Helpers ──────────────────────────────────────────────────────────────

BASE_CENTER = {"lat": 34.0522, "lng": -118.2437}

_seed_counter = 0


def _next_id(prefix: str) -> str:
    global _seed_counter
    _seed_counter += 1
    return f"{prefix}-{str(_seed_counter).zfill(4)}"


def _rand(lo: float, hi: float) -> float:
    return random.uniform(lo, hi)


def _rand_int(lo: int, hi: int) -> int:
    return random.randint(lo, hi)


def _pick(arr: list):
    return random.choice(arr)


def _jitter(center: dict, radius_km: float = 1.2) -> dict:
    r_deg = radius_km / 111
    angle = random.random() * 3.14159 * 2
    r = random.random() * r_deg
    import math
    return {
        "lat": round(center["lat"] + r * math.cos(angle), 6),
        "lng": round(center["lng"] + r * math.sin(angle), 6),
    }


def _iso_minutes_ago(minutes: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(minutes=minutes)


def _random_trail(center: dict, points: int = 12) -> list[dict]:
    trail = []
    cursor = dict(center)
    for _ in range(points):
        cursor = _jitter(cursor, 0.06)
        trail.append(cursor)
    return trail


# ── Seed functions ───────────────────────────────────────────────────────


async def seed_database(db: AsyncSession):
    """Main entry point: seed all tables if the users table is empty."""
    existing = await db.execute(select(UserModel).limit(1))
    if existing.scalar_one_or_none() is not None:
        logger.info("Database already seeded, skipping.")
        return

    logger.info("Seeding database with demo data...")

    # ── Users (matching frontend MOCK_USERS exactly) ─────────────────────
    password_hash = hash_password("demo1234")
    users = [
        UserModel(
            id="usr-1001", name="Elena Vargas", email="commander@rescuehive.io",
            password_hash=password_hash, role="incident_commander", callsign="COMMAND-1",
        ),
        UserModel(
            id="usr-1002", name="Marcus Reyes", email="operator@rescuehive.io",
            password_hash=password_hash, role="field_operator", callsign="FIELD-4",
        ),
        UserModel(
            id="usr-1003", name="Priya Nandan", email="admin@rescuehive.io",
            password_hash=password_hash, role="system_administrator", callsign="ADMIN-1",
        ),
        UserModel(
            id="usr-1004", name="Sam Okafor", email="dev@rescuehive.io",
            password_hash=password_hash, role="developer", callsign="DEV-1",
        ),
        UserModel(
            id="usr-1005", name="Jamie Lin", email="support@rescuehive.io",
            password_hash=password_hash, role="support", callsign="SUPPORT-1",
        ),
    ]
    db.add_all(users)

    # ── Missions ─────────────────────────────────────────────────────────
    mission_names = [
        "Operation Firebreak",
        "Cascade Ridge Collapse",
        "Harborview Flood Response",
        "Sector 7 Structural Search",
        "Northgate Earthquake Response",
    ]
    locations = [
        "Cascade Ridge, Sector B",
        "Harborview District",
        "Northgate Industrial Zone",
        "Downtown Core",
    ]
    missions = []
    for i, name in enumerate(mission_names):
        status = "active" if i == 0 else _pick(["active", "paused", "completed", "completed"])
        m = MissionModel(
            id=_next_id("mission"),
            name=name,
            status=status,
            started_at=_iso_minutes_ago(_rand_int(30, 4000)),
            ended_at=_iso_minutes_ago(_rand_int(1, 29)) if status == "completed" else None,
            area_coverage=_rand_int(12, 96),
            robots_active=_rand_int(2, 10),
            victims_found=_rand_int(0, 12),
            hazards_found=_rand_int(0, 8),
            average_battery=_rand_int(35, 92),
            connection_health=_pick(["live", "degraded", "live", "live"]),
            location=_pick(locations),
            search_area_km2=round(_rand(0.5, 6.0), 1),
            commander_id="usr-1001",
        )
        missions.append(m)
    db.add_all(missions)

    # ── Robots (attached to first active mission) ────────────────────────
    active_mission = missions[0]
    robot_model_names = [
        "Scout", "Pathfinder", "Sentinel", "Ranger", "Vanguard",
        "Recon", "Atlas", "Falcon", "Nomad", "Cipher",
    ]
    robots = []
    for i in range(10):
        health = _pick(["nominal", "nominal", "nominal", "warning", "critical", "offline"])
        task = "idle" if health == "offline" else _pick(
            ["exploring", "exploring", "returning_home", "idle", "charging"]
        )
        position = _jitter(BASE_CENTER)
        trail = _random_trail(position)

        r = RobotModel(
            id=_next_id("robot"),
            name=f"{robot_model_names[i % len(robot_model_names)]}-{_rand_int(10, 99)}",
            callsign=f"RH-{str(i + 1).zfill(2)}",
            model=robot_model_names[i % len(robot_model_names)],
            mission_id=active_mission.id,
            battery=float(_rand_int(0, 15) if health == "offline" else _rand_int(18, 100)),
            signal=0.0 if health == "offline" else float(_rand_int(40, 100)),
            health=health,
            task=task,
            temperature=round(_rand(28, 61), 1),
            speed=round(_rand(0.2, 1.8), 2) if task == "exploring" else 0.0,
            lat=position["lat"],
            lng=position["lng"],
            distance_travelled=float(_rand_int(120, 4800)),
            connection="offline" if health == "offline" else _pick(["live", "live", "live", "degraded"]),
            last_seen=_iso_minutes_ago(_rand_int(5, 90) if health == "offline" else _rand_int(0, 2)),
            sensor_lidar=_pick(["ok", "ok", "ok", "degraded", "fault"]),
            sensor_thermal=_pick(["ok", "ok", "ok", "degraded", "fault"]),
            sensor_camera=_pick(["ok", "ok", "ok", "degraded", "fault"]),
            sensor_gas=_pick(["ok", "ok", "ok", "degraded", "fault"]),
            trail_json=json.dumps(trail),
        )
        robots.append(r)
    db.add_all(robots)

    # ── Victim detections ────────────────────────────────────────────────
    victims = []
    for _ in range(40):
        robot = _pick(robots)
        pos = _jitter({"lat": robot.lat, "lng": robot.lng}, 0.15)
        v = VictimDetectionModel(
            id=_next_id("victim"),
            mission_id=active_mission.id,
            robot_id=robot.id,
            robot_name=robot.name,
            image_url=f"https://picsum.photos/seed/{uuid.uuid4().hex[:8]}/480/320",
            confidence=float(_rand_int(52, 99)),
            lat=pos["lat"],
            lng=pos["lng"],
            distance=float(_rand_int(2, 45)),
            priority=_pick(["low", "medium", "high", "critical"]),
            detected_at=_iso_minutes_ago(_rand_int(0, 600)),
            status=_pick(["unconfirmed", "unconfirmed", "confirmed", "rejected"]),
        )
        victims.append(v)
    db.add_all(victims)

    # ── Hazard detections ────────────────────────────────────────────────
    hazard_types = ["fire", "gas_leak", "debris", "collapsed_structure", "blocked_path"]
    hazards = []
    for _ in range(20):
        robot = _pick(robots)
        pos = _jitter({"lat": robot.lat, "lng": robot.lng}, 0.18)
        h = HazardDetectionModel(
            id=_next_id("hazard"),
            mission_id=active_mission.id,
            type=_pick(hazard_types),
            severity=_pick(["low", "moderate", "severe", "extreme"]),
            lat=pos["lat"],
            lng=pos["lng"],
            robot_id=robot.id,
            robot_name=robot.name,
            image_url=f"https://picsum.photos/seed/{uuid.uuid4().hex[:8]}/480/320",
            detected_at=_iso_minutes_ago(_rand_int(0, 600)),
            status=_pick(["unconfirmed", "confirmed", "confirmed"]),
        )
        hazards.append(h)
    db.add_all(hazards)

    # ── Log entries ──────────────────────────────────────────────────────
    log_sources = [
        "ws-gateway", "mission-planner", "robot-fleet",
        "auth-service", "detection-pipeline", "api-gateway",
    ]
    log_messages = [
        "Heartbeat received",
        "Reconnect attempt succeeded",
        "Telemetry batch processed",
        "Detection confidence below threshold, discarded",
        "Mission checkpoint saved",
        "Robot registered to fleet",
        "WebSocket connection dropped, retrying",
        "Battery threshold alert dispatched",
        "Route replanned due to obstacle",
        "Image upload completed",
    ]
    logs = []
    for _ in range(200):
        logs.append(LogEntryModel(
            id=_next_id("log"),
            timestamp=_iso_minutes_ago(_rand_int(0, 2000)),
            level=_pick(["info", "info", "info", "debug", "warn", "error"]),
            source=_pick(log_sources),
            message=_pick(log_messages),
            mission_id=active_mission.id,
        ))
    db.add_all(logs)

    # ── Notifications (for commander user) ───────────────────────────────
    notif_templates = [
        ("critical", "detection", "Victim detected", "High-confidence victim detection requires review"),
        ("warning", "robot", "Battery low", "Robot battery has dropped below 20%"),
        ("critical", "hazard", "Hazard detected", "Fire hazard detected in search sector"),
        ("info", "mission", "Mission checkpoint", "Area coverage has reached a new milestone"),
        ("success", "mission", "Mission complete", "Search mission has been completed successfully"),
        ("warning", "robot", "Robot offline", "Connection to robot has been lost"),
        ("info", "system", "System update", "Fleet firmware update available"),
    ]
    notifications = []
    for _ in range(12):
        severity, category, title, message = _pick(notif_templates)
        notifications.append(NotificationModel(
            id=_next_id("notif"),
            user_id="usr-1001",
            severity=severity,
            title=title,
            message=message,
            timestamp=_iso_minutes_ago(_rand_int(0, 400)),
            read=random.random() > 0.5,
            category=category,
        ))
    db.add_all(notifications)

    await db.commit()
    logger.info(
        "Seeded: %d users, %d missions, %d robots, %d victims, %d hazards, %d logs, %d notifications",
        len(users), len(missions), len(robots), len(victims), len(hazards), len(logs), len(notifications),
    )
