from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    SQLAlchemy declarative base class for RescueHive models.
    Domain models (Users, Robots, Missions, Detections) will inherit from this base in Phase 2.
    """
    pass
