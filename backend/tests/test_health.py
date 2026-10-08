import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_returns_200():
    """Verify GET /api/v1/health returns status 200 with expected schema."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "status": "ok",
        "service": "rescuehive-backend",
    }


def test_root_redirects_to_docs():
    """Verify root GET / redirects to /docs."""
    response = client.get("/", follow_redirects=False)
    assert response.status_code in (307, 302, 301)
    assert response.headers["location"] == "/docs"
