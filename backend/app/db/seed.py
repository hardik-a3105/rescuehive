"""
RescueHive — Development Seed Data Script
==========================================
Creates demo users, missions, robots, detections, and alerts
for local development and testing.

Usage:
    cd backend
    python -m app.db.seed

WARNING: This script is for DEVELOPMENT ONLY.
"""

import sys
import os
from datetime import datetime, timezone, timedelta

# Ensure the backend directory is on the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from dotenv import load_dotenv
load_dotenv()

from app.db.session import SessionLocal, engine
from app.db.base import Base
import app.db.base_class  # noqa: F401 — register all models

from app.models.domain import (
    User, UserRole,
    Mission, MissionStatus,
    Robot, RobotStatus, ConnectionStatus,
    Detection, DetectionType, DetectionStatus,
    Alert, AlertSeverity, AlertStatus,
    MissionEvent,
)
from app.core.security import hash_password


def seed():
    """Populate the database with development demo data."""
    print("=" * 60)
    print("  RescueHive — Seeding Development Data")
    print("=" * 60)

    # Create tables
    print("\n[1/6] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("  ✓ Tables created / verified")

    db = SessionLocal()

    try:
        # ─── Demo Users ──────────────────────────────────────
        print("\n[2/6] Creating demo users...")
        users = []
        user_data = [
            {"name": "Admin User", "email": "admin@rescuehive.dev", "password": "admin123", "role": UserRole.ADMIN},
            {"name": "Commander Singh", "email": "commander@rescuehive.dev", "password": "commander123", "role": UserRole.INCIDENT_COMMANDER},
            {"name": "Operator Raj", "email": "operator@rescuehive.dev", "password": "operator123", "role": UserRole.FIELD_OPERATOR},
        ]

        for ud in user_data:
            existing = db.query(User).filter(User.email == ud["email"]).first()
            if existing:
                print(f"  → User '{ud['email']}' already exists, skipping")
                users.append(existing)
            else:
                user = User(
                    name=ud["name"],
                    email=ud["email"],
                    password_hash=hash_password(ud["password"]),
                    role=ud["role"],
                )
                db.add(user)
                db.flush()
                users.append(user)
                print(f"  ✓ Created user: {ud['email']} ({ud['role'].value})")

        db.commit()

        # ─── Demo Mission ────────────────────────────────────
        print("\n[3/6] Creating demo mission...")
        existing_mission = db.query(Mission).filter(Mission.name == "Operation Phoenix Rising").first()
        if existing_mission:
            mission = existing_mission
            print("  → Mission already exists, skipping")
        else:
            mission = Mission(
                name="Operation Phoenix Rising",
                description="Multi-robot search and rescue operation in collapsed parking structure. "
                            "Deploying ground and aerial units for systematic floor-by-floor sweep.",
                status=MissionStatus.ACTIVE,
                started_at=datetime.now(timezone.utc) - timedelta(hours=2, minutes=34),
                explored_area=1847.5,
                created_by=users[1].id,  # Commander
            )
            db.add(mission)
            db.flush()
            print(f"  ✓ Created mission: {mission.name}")
        db.commit()

        # ─── Demo Robots ─────────────────────────────────────
        print("\n[4/6] Creating demo robots...")
        robot_data = [
            {
                "robot_id": "GRD-01", "name": "Pathfinder Alpha",
                "status": RobotStatus.ACTIVE, "battery": 78.0,
                "connection_status": ConnectionStatus.CONNECTED,
                "x": 12.4, "y": 3.2, "z": 0.0,
                "current_task": "Autonomous patrol — Floor B2 corridor sweep",
            },
            {
                "robot_id": "GRD-02", "name": "Pathfinder Beta",
                "status": RobotStatus.ACTIVE, "battery": 64.0,
                "connection_status": ConnectionStatus.CONNECTED,
                "x": -5.1, "y": 8.7, "z": -3.0,
                "current_task": "Thermal imaging scan — Floor B3 east wing",
            },
            {
                "robot_id": "UAV-01", "name": "Overwatch Hawk",
                "status": RobotStatus.ACTIVE, "battery": 42.0,
                "connection_status": ConnectionStatus.WEAK,
                "x": 0.0, "y": 0.0, "z": 15.0,
                "current_task": "Aerial reconnaissance — Structural damage assessment",
            },
        ]

        robots = []
        for rd in robot_data:
            existing = db.query(Robot).filter(Robot.robot_id == rd["robot_id"]).first()
            if existing:
                print(f"  → Robot '{rd['robot_id']}' already exists, skipping")
                robots.append(existing)
            else:
                robot = Robot(
                    **rd,
                    mission_id=mission.id,
                    last_seen=datetime.now(timezone.utc) - timedelta(seconds=30),
                )
                db.add(robot)
                db.flush()
                robots.append(robot)
                print(f"  ✓ Created robot: {rd['robot_id']} — {rd['name']}")
        db.commit()

        # ─── Demo Detections ─────────────────────────────────
        print("\n[5/6] Creating demo detections...")
        detection_data = [
            {"detection_type": DetectionType.PERSON, "confidence": 0.94, "x": 11.2, "y": 2.8, "z": 0.0,
             "status": DetectionStatus.CONFIRMED, "robot_idx": 0},
            {"detection_type": DetectionType.PERSON, "confidence": 0.87, "x": -4.5, "y": 9.1, "z": -3.0,
             "status": DetectionStatus.PENDING, "robot_idx": 1},
            {"detection_type": DetectionType.FIRE, "confidence": 0.91, "x": 8.3, "y": 5.5, "z": 0.0,
             "status": DetectionStatus.CONFIRMED, "robot_idx": 0},
            {"detection_type": DetectionType.GAS_CYLINDER, "confidence": 0.78, "x": -2.0, "y": 7.3, "z": -3.0,
             "status": DetectionStatus.PENDING, "robot_idx": 1},
            {"detection_type": DetectionType.DEBRIS, "confidence": 0.96, "x": 15.0, "y": 1.0, "z": 0.0,
             "status": DetectionStatus.CONFIRMED, "robot_idx": 0},
            {"detection_type": DetectionType.HELMET, "confidence": 0.72, "x": -6.0, "y": 10.0, "z": -3.0,
             "status": DetectionStatus.PENDING, "robot_idx": 1},
            {"detection_type": DetectionType.PERSON, "confidence": 0.65, "x": 3.0, "y": 4.0, "z": 0.0,
             "status": DetectionStatus.DISMISSED, "robot_idx": 2},
            {"detection_type": DetectionType.BACKPACK, "confidence": 0.83, "x": 10.0, "y": 2.0, "z": 0.0,
             "status": DetectionStatus.PENDING, "robot_idx": 0},
        ]

        det_count = db.query(Detection).filter(Detection.mission_id == mission.id).count()
        if det_count > 0:
            print(f"  → {det_count} detections already exist for this mission, skipping")
        else:
            for i, dd in enumerate(detection_data):
                robot_idx = dd.pop("robot_idx")
                detection = Detection(
                    mission_id=mission.id,
                    robot_id=robots[robot_idx].id,
                    timestamp=datetime.now(timezone.utc) - timedelta(minutes=60 - i * 8),
                    **dd,
                )
                db.add(detection)
            db.commit()
            print(f"  ✓ Created {len(detection_data)} detections")

        # ─── Demo Alerts ──────────────────────────────────────
        print("\n[6/6] Creating demo alerts...")
        alert_data = [
            {"severity": AlertSeverity.CRITICAL, "title": "Victim Detected — Floor B2",
             "message": "High-confidence person detection near collapsed pillar. Immediate rescue team dispatch recommended.",
             "status": AlertStatus.ACTIVE, "robot_idx": 0},
            {"severity": AlertSeverity.HIGH, "title": "Active Fire — Floor B2 East",
             "message": "Thermal anomaly confirmed as active combustion. HAZMAT team notification required.",
             "status": AlertStatus.ACTIVE, "robot_idx": 0},
            {"severity": AlertSeverity.MEDIUM, "title": "UAV-01 Battery Low",
             "message": "Aerial unit battery at 42%. Return-to-base recommended within 15 minutes.",
             "status": AlertStatus.ACKNOWLEDGED, "robot_idx": 2},
            {"severity": AlertSeverity.HIGH, "title": "Gas Cylinder Detected — Floor B3",
             "message": "Pressurized gas cylinder identified in debris field. Explosion risk assessment pending.",
             "status": AlertStatus.ACTIVE, "robot_idx": 1},
            {"severity": AlertSeverity.LOW, "title": "Communication Signal Weak — UAV-01",
             "message": "Signal strength below threshold. Possible structural interference.",
             "status": AlertStatus.ACTIVE, "robot_idx": 2},
        ]

        alert_count = db.query(Alert).filter(Alert.mission_id == mission.id).count()
        if alert_count > 0:
            print(f"  → {alert_count} alerts already exist for this mission, skipping")
        else:
            for i, ad in enumerate(alert_data):
                robot_idx = ad.pop("robot_idx")
                alert = Alert(
                    mission_id=mission.id,
                    robot_id=robots[robot_idx].id,
                    created_at=datetime.now(timezone.utc) - timedelta(minutes=50 - i * 10),
                    **ad,
                )
                db.add(alert)
            db.commit()
            print(f"  ✓ Created {len(alert_data)} alerts")

        # ─── Mission Events ──────────────────────────────────
        event_count = db.query(MissionEvent).filter(MissionEvent.mission_id == mission.id).count()
        if event_count == 0:
            events = [
                MissionEvent(mission_id=mission.id, event_type="MISSION_CREATED",
                             message="Mission 'Operation Phoenix Rising' created",
                             timestamp=datetime.now(timezone.utc) - timedelta(hours=3)),
                MissionEvent(mission_id=mission.id, event_type="MISSION_STARTED",
                             message="Mission started — deploying units",
                             timestamp=datetime.now(timezone.utc) - timedelta(hours=2, minutes=34)),
                MissionEvent(mission_id=mission.id, robot_id=robots[0].id, event_type="ROBOT_DEPLOYED",
                             message="GRD-01 deployed to Floor B2",
                             timestamp=datetime.now(timezone.utc) - timedelta(hours=2, minutes=30)),
                MissionEvent(mission_id=mission.id, robot_id=robots[1].id, event_type="ROBOT_DEPLOYED",
                             message="GRD-02 deployed to Floor B3",
                             timestamp=datetime.now(timezone.utc) - timedelta(hours=2, minutes=28)),
                MissionEvent(mission_id=mission.id, robot_id=robots[2].id, event_type="ROBOT_DEPLOYED",
                             message="UAV-01 deployed for aerial recon",
                             timestamp=datetime.now(timezone.utc) - timedelta(hours=2, minutes=25)),
            ]
            for e in events:
                db.add(e)
            db.commit()

        print("\n" + "=" * 60)
        print("  ✓ Seed data complete!")
        print()
        print("  Demo Credentials:")
        print("    admin@rescuehive.dev     / admin123       (ADMIN)")
        print("    commander@rescuehive.dev / commander123   (INCIDENT_COMMANDER)")
        print("    operator@rescuehive.dev  / operator123    (FIELD_OPERATOR)")
        print("=" * 60)

    except Exception as exc:
        db.rollback()
        print(f"\n  ✗ Error during seeding: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
