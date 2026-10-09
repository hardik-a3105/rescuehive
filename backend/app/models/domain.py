import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Text, Float, Integer, DateTime, Enum, ForeignKey, Boolean
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


# ─── Enums ───────────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    FIELD_OPERATOR = "FIELD_OPERATOR"
    INCIDENT_COMMANDER = "INCIDENT_COMMANDER"
    ADMIN = "ADMIN"


class MissionStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    ABORTED = "ABORTED"


class RobotStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    IDLE = "IDLE"
    RETURNING = "RETURNING"
    OFFLINE = "OFFLINE"
    ERROR = "ERROR"


class ConnectionStatus(str, enum.Enum):
    CONNECTED = "CONNECTED"
    DISCONNECTED = "DISCONNECTED"
    WEAK = "WEAK"


class DetectionType(str, enum.Enum):
    PERSON = "PERSON"
    FIRE = "FIRE"
    GAS_CYLINDER = "GAS_CYLINDER"
    HELMET = "HELMET"
    DEBRIS = "DEBRIS"
    EMERGENCY_EXIT = "EMERGENCY_EXIT"
    BACKPACK = "BACKPACK"


class DetectionStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    DISMISSED = "DISMISSED"


class AlertSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


# ─── Utility ─────────────────────────────────────────────────────────
def _utcnow():
    return datetime.now(timezone.utc)


def _new_uuid():
    return uuid.uuid4()


# ─── User Model ──────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.FIELD_OPERATOR)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)

    # Relationships
    created_missions = relationship("Mission", back_populates="creator", lazy="dynamic")

    def __repr__(self):
        return f"<User {self.email} ({self.role.value})>"


# ─── Mission Model ───────────────────────────────────────────────────
class Mission(Base):
    __tablename__ = "missions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(MissionStatus), nullable=False, default=MissionStatus.PLANNED)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration = Column(Float, nullable=True, doc="Duration in seconds")
    explored_area = Column(Float, nullable=True, default=0.0, doc="Explored area in sq meters")
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    creator = relationship("User", back_populates="created_missions")
    robots = relationship("Robot", back_populates="mission", lazy="dynamic")
    detections = relationship("Detection", back_populates="mission", lazy="dynamic")
    alerts = relationship("Alert", back_populates="mission", lazy="dynamic")
    events = relationship("MissionEvent", back_populates="mission", lazy="dynamic")

    def __repr__(self):
        return f"<Mission {self.name} ({self.status.value})>"


# ─── Robot Model ─────────────────────────────────────────────────────
class Robot(Base):
    __tablename__ = "robots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    robot_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    status = Column(Enum(RobotStatus), nullable=False, default=RobotStatus.IDLE)
    battery = Column(Float, nullable=True, default=100.0)
    connection_status = Column(
        Enum(ConnectionStatus), nullable=False, default=ConnectionStatus.DISCONNECTED
    )
    x = Column(Float, nullable=True, default=0.0)
    y = Column(Float, nullable=True, default=0.0)
    z = Column(Float, nullable=True, default=0.0)
    current_task = Column(String(500), nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=True)

    # Relationships
    mission = relationship("Mission", back_populates="robots")
    detections = relationship("Detection", back_populates="robot", lazy="dynamic")
    alerts = relationship("Alert", back_populates="robot", lazy="dynamic")
    events = relationship("MissionEvent", back_populates="robot", lazy="dynamic")

    def __repr__(self):
        return f"<Robot {self.robot_id} ({self.status.value})>"


# ─── Detection Model ─────────────────────────────────────────────────
class Detection(Base):
    __tablename__ = "detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=True)
    robot_id = Column(UUID(as_uuid=True), ForeignKey("robots.id"), nullable=True)
    detection_type = Column(Enum(DetectionType), nullable=False)
    confidence = Column(Float, nullable=False, default=0.0)
    x = Column(Float, nullable=True)
    y = Column(Float, nullable=True)
    z = Column(Float, nullable=True)
    image_path = Column(String(500), nullable=True)
    status = Column(Enum(DetectionStatus), nullable=False, default=DetectionStatus.PENDING)
    timestamp = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    mission = relationship("Mission", back_populates="detections")
    robot = relationship("Robot", back_populates="detections")

    def __repr__(self):
        return f"<Detection {self.detection_type.value} confidence={self.confidence}>"


# ─── Alert Model ──────────────────────────────────────────────────────
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=True)
    robot_id = Column(UUID(as_uuid=True), ForeignKey("robots.id"), nullable=True)
    severity = Column(Enum(AlertSeverity), nullable=False, default=AlertSeverity.LOW)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(Enum(AlertStatus), nullable=False, default=AlertStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    mission = relationship("Mission", back_populates="alerts")
    robot = relationship("Robot", back_populates="alerts")

    def __repr__(self):
        return f"<Alert {self.severity.value}: {self.title}>"


# ─── Mission Event Model ─────────────────────────────────────────────
class MissionEvent(Base):
    __tablename__ = "mission_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=False)
    robot_id = Column(UUID(as_uuid=True), ForeignKey("robots.id"), nullable=True)
    event_type = Column(String(100), nullable=False)
    message = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    mission = relationship("Mission", back_populates="events")
    robot = relationship("Robot", back_populates="events")

    def __repr__(self):
        return f"<MissionEvent {self.event_type} at {self.timestamp}>"
