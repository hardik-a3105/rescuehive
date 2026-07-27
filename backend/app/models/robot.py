"""
Robot and RobotTelemetry ORM models.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class RobotModel(Base):
    """Static / slow-changing robot metadata."""

    __tablename__ = "robots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    callsign: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    mission_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("missions.id"), nullable=True
    )
    # Current state (denormalized from latest telemetry for fast reads)
    battery: Mapped[float] = mapped_column(Float, default=100.0)
    signal: Mapped[float] = mapped_column(Float, default=100.0)
    health: Mapped[str] = mapped_column(String(50), default="nominal")
    task: Mapped[str] = mapped_column(String(50), default="idle")
    temperature: Mapped[float] = mapped_column(Float, default=25.0)
    speed: Mapped[float] = mapped_column(Float, default=0.0)
    lat: Mapped[float] = mapped_column(Float, default=0.0)
    lng: Mapped[float] = mapped_column(Float, default=0.0)
    distance_travelled: Mapped[float] = mapped_column(Float, default=0.0)
    connection: Mapped[str] = mapped_column(String(50), default="live")
    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    # Sensor status stored as individual columns
    sensor_lidar: Mapped[str] = mapped_column(String(20), default="ok")
    sensor_thermal: Mapped[str] = mapped_column(String(20), default="ok")
    sensor_camera: Mapped[str] = mapped_column(String(20), default="ok")
    sensor_gas: Mapped[str] = mapped_column(String(20), default="ok")
    # Trail stored as JSON text (list of {lat, lng} dicts)
    trail_json: Mapped[str | None] = mapped_column(Text, nullable=True, default="[]")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class RobotTelemetryModel(Base):
    """Time-series telemetry data for analytics and trail history."""

    __tablename__ = "robot_telemetry"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    robot_id: Mapped[str] = mapped_column(String, ForeignKey("robots.id"), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    battery: Mapped[float] = mapped_column(Float, default=100.0)
    speed: Mapped[float] = mapped_column(Float, default=0.0)
    temperature: Mapped[float] = mapped_column(Float, default=25.0)
    signal: Mapped[float] = mapped_column(Float, default=100.0)
    lat: Mapped[float] = mapped_column(Float, default=0.0)
    lng: Mapped[float] = mapped_column(Float, default=0.0)
    health: Mapped[str] = mapped_column(String(50), default="nominal")
    task: Mapped[str] = mapped_column(String(50), default="idle")
    connection: Mapped[str] = mapped_column(String(50), default="live")
