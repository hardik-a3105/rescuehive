"""
RescueHive — Deterministic Development Seed Data Script
======================================================
Populates the database with the simplified testing data:
- 3 Demo Robots (Alpha: ACTIVE, Bravo: IDLE, Charlie: OFFLINE)
- 2 Demo Missions (Basic Exploration: ACTIVE, Victim Detection Test: PLANNED)
- 2 Sample Detections (Victim: 92% PENDING, Fire: 88% PENDING)
- 1 Sample Alert (Fire detected: HIGH, ACTIVE)

Usage:
    cd backend
    python -m app.db.seed
"""

import sys
import os
from datetime import datetime, timezone, timedelta

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from dotenv import load_dotenv
load_dotenv()

from app.db.session import SessionLocal, engine
from app.db.base import Base
import app.db.base_class  # noqa: F401 — register models

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
    """Populate database with simplified deterministic testing data."""
    print("=" * 60)
    print("  RescueHive — Seeding Simplified Test Data")
    print("=" * 60)

    # Verify tables
    print("\n[1/6] Verifying database schema...")
    Base.metadata.create_all(bind=engine)
    print("  ✓ Schema verified")

    db = SessionLocal()

    try:
        # ─── 1. Demo Users (Preserved) ────────────────────────
        print("\n[2/6] Verifying user credentials...")
        users = []
        user_data = [
            {"name": "Admin User", "email": "admin@rescuehive.dev", "password": "admin123", "role": UserRole.ADMIN},
            {"name": "Commander Singh", "email": "commander@rescuehive.dev", "password": "commander123", "role": UserRole.INCIDENT_COMMANDER},
            {"name": "Operator Raj", "email": "operator@rescuehive.dev", "password": "operator123", "role": UserRole.FIELD_OPERATOR},
        ]

        for ud in user_data:
            existing = db.query(User).filter(User.email == ud["email"]).first()
            if existing:
                print(f"  → User '{ud['email']}' exists, preserved")
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

        commander_user = users[1]
        db.commit()

        # ─── 2. Clean Up Prior Demo Sortie Data ───────────────
        print("\n[3/6] Clearing previous demo sortie records...")
        db.query(Alert).delete()
        db.query(Detection).delete()
        db.query(MissionEvent).delete()
        db.query(Robot).delete()
        db.query(Mission).delete()
        db.commit()
        print("  ✓ Cleared previous dynamic records (users preserved)")

        # ─── 3. Two Simplified Demo Missions ─────────────────
        print("\n[4/6] Creating 2 simplified demo missions...")
        now = datetime.now(timezone.utc)

        # Mission A: Basic Exploration (ACTIVE, 20 m², 00:05:00)
        mission_a = Mission(
            name="Basic Exploration",
            description="Systematic sector exploration and perimeter assessment.",
            status=MissionStatus.ACTIVE,
            started_at=now - timedelta(minutes=5),
            duration=300.0,
            explored_area=20.0,
            created_by=commander_user.id,
        )
        db.add(mission_a)

        # Mission B: Victim Detection Test (PLANNED, 0 m², 00:00:00)
        mission_b = Mission(
            name="Victim Detection Test",
            description="Scan assigned sector and review victim detection.",
            status=MissionStatus.PLANNED,
            started_at=None,
            duration=0.0,
            explored_area=0.0,
            created_by=commander_user.id,
        )
        db.add(mission_b)
        db.flush()
        print(f"  ✓ Created Mission A: {mission_a.name} (ACTIVE, 20 m²)")
        print(f"  ✓ Created Mission B: {mission_b.name} (PLANNED, 0 m²)")

        # ─── 4. Three Simplified Demo Robots ─────────────────
        print("\n[5/6] Creating 3 simplified demo robots...")
        # Robot Alpha: ACTIVE, 80%, (2, 3), 20 m², CONNECTED
        robot_alpha = Robot(
            robot_id="ROBOT-ALPHA",
            name="Robot Alpha",
            status=RobotStatus.ACTIVE,
            battery=80.0,
            connection_status=ConnectionStatus.CONNECTED,
            x=2.0,
            y=3.0,
            z=0.0,
            current_task="Basic exploration",
            mission_id=mission_a.id,
            last_seen=now,
        )
        db.add(robot_alpha)

        # Robot Bravo: IDLE, 65%, (5, 4), 10 m², CONNECTED
        robot_bravo = Robot(
            robot_id="ROBOT-BRAVO",
            name="Robot Bravo",
            status=RobotStatus.IDLE,
            battery=65.0,
            connection_status=ConnectionStatus.CONNECTED,
            x=5.0,
            y=4.0,
            z=0.0,
            current_task="Waiting for assignment",
            mission_id=mission_a.id,
            last_seen=now,
        )
        db.add(robot_bravo)

        # Robot Charlie: OFFLINE, 45%, (0, 0), 0 m², DISCONNECTED
        robot_charlie = Robot(
            robot_id="ROBOT-CHARLIE",
            name="Robot Charlie",
            status=RobotStatus.OFFLINE,
            battery=45.0,
            connection_status=ConnectionStatus.DISCONNECTED,
            x=0.0,
            y=0.0,
            z=0.0,
            current_task="None",
            mission_id=None,
            last_seen=now - timedelta(hours=4),
        )
        db.add(robot_charlie)
        db.flush()
        print("  ✓ Created Robot Alpha   (ACTIVE, 80% batt, pos: 2, 3, online: CONNECTED)")
        print("  ✓ Created Robot Bravo   (IDLE, 65% batt, pos: 5, 4, online: CONNECTED)")
        print("  ✓ Created Robot Charlie (OFFLINE, 45% batt, pos: 0, 0, offline: DISCONNECTED)")

        # ─── 5. Two Sample Detections & One Alert ─────────────
        print("\n[6/6] Creating 2 sample detections and 1 alert...")
        # Victim: 92% confidence, PENDING at (2, 3)
        victim_det = Detection(
            mission_id=mission_a.id,
            robot_id=robot_alpha.id,
            detection_type=DetectionType.PERSON,
            confidence=0.92,
            status=DetectionStatus.PENDING,
            x=2.0,
            y=3.0,
            z=0.0,
            timestamp=now - timedelta(minutes=4),
            image_path="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=600&q=80",
        )
        db.add(victim_det)

        # Fire: 88% confidence, PENDING at (5, 4)
        fire_det = Detection(
            mission_id=mission_a.id,
            robot_id=robot_bravo.id,
            detection_type=DetectionType.FIRE,
            confidence=0.88,
            status=DetectionStatus.PENDING,
            x=5.0,
            y=4.0,
            z=0.0,
            timestamp=now - timedelta(minutes=2),
            image_path="https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=600&q=80",
        )
        db.add(fire_det)

        # Alert: Fire detected, HIGH severity, ACTIVE
        fire_alert = Alert(
            mission_id=mission_a.id,
            robot_id=robot_bravo.id,
            title="Fire detected",
            message="Fire detected in exploration zone",
            severity=AlertSeverity.HIGH,
            status=AlertStatus.ACTIVE,
            created_at=now - timedelta(minutes=2),
        )
        db.add(fire_alert)

        # Mission Events
        events = [
            MissionEvent(
                mission_id=mission_a.id,
                event_type="MISSION_CREATED",
                message="Mission 'Basic Exploration' created",
                timestamp=now - timedelta(minutes=6),
            ),
            MissionEvent(
                mission_id=mission_a.id,
                event_type="MISSION_STARTED",
                message="Mission started — deploying units",
                timestamp=now - timedelta(minutes=5),
            ),
            MissionEvent(
                mission_id=mission_a.id,
                robot_id=robot_alpha.id,
                event_type="ROBOT_DEPLOYED",
                message="Robot Alpha deployed to exploration zone",
                timestamp=now - timedelta(minutes=5),
            ),
            MissionEvent(
                mission_id=mission_a.id,
                robot_id=robot_bravo.id,
                event_type="ROBOT_DEPLOYED",
                message="Robot Bravo on standby for tasking",
                timestamp=now - timedelta(minutes=5),
            ),
        ]
        for ev in events:
            db.add(ev)

        db.commit()
        print("  ✓ Created Victim Detection (92% confidence, PENDING)")
        print("  ✓ Created Fire Detection   (88% confidence, PENDING)")
        print("  ✓ Created Fire Alert       (HIGH severity, Unacknowledged/ACTIVE)")

        print("\n" + "=" * 60)
        print("  ✓ Simplified seed data successfully committed to PostgreSQL!")
        print("  Demo Users:")
        print("    admin@rescuehive.dev     / admin123     (ADMIN)")
        print("    commander@rescuehive.dev / commander123 (INCIDENT_COMMANDER)")
        print("    operator@rescuehive.dev  / operator123  (FIELD_OPERATOR)")
        print("=" * 60)

    except Exception as exc:
        db.rollback()
        print(f"\n  ✗ Error during seeding: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
