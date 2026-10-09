"""
RescueHive — Backend Test Configuration
========================================
Provides a test client and in-memory SQLite database for fast, isolated tests.
"""

import os
import sys
import pytest

# Ensure imports work from backend root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db.base import Base
import app.db.base_class  # noqa: F401 — register all models
from app.db.session import get_db
from app.main import app

# Use in-memory SQLite for tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_rescuehive.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Enable WAL mode for SQLite to avoid locking issues
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the database dependency
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    """Create all tables once for the entire test session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    # Clean up test database file
    if os.path.exists("./test_rescuehive.db"):
        try:
            os.remove("./test_rescuehive.db")
        except PermissionError:
            pass  # Windows may hold file locks


@pytest.fixture(scope="session")
def client():
    """Provide a FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def db_session():
    """Provide a fresh database session for each test."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
