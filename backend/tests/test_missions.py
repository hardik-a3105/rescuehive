"""
Tests for Mission Endpoints
"""
import pytest


def _get_auth_headers(client) -> dict:
    """Helper: register + login and return auth headers."""
    client.post("/api/v1/auth/register", json={
        "name": "Mission Test User",
        "email": "mission_test@rescuehive.dev",
        "password": "missionpass",
        "role": "INCIDENT_COMMANDER",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "mission_test@rescuehive.dev",
        "password": "missionpass",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_mission(client):
    """POST /api/v1/missions should create a new mission."""
    headers = _get_auth_headers(client)
    response = client.post("/api/v1/missions", json={
        "name": "Test Mission Alpha",
        "description": "Automated test mission",
    }, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Mission Alpha"
    assert data["status"] == "PLANNED"


def test_list_missions(client):
    """GET /api/v1/missions should return a list."""
    headers = _get_auth_headers(client)
    response = client.get("/api/v1/missions", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "missions" in data
    assert "total" in data
    assert data["total"] >= 0


def test_get_mission_detail(client):
    """GET /api/v1/missions/{id} should return mission details."""
    headers = _get_auth_headers(client)
    create_resp = client.post("/api/v1/missions", json={
        "name": "Detail Test Mission",
    }, headers=headers)
    mission_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/missions/{mission_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Detail Test Mission"


def test_start_and_stop_mission(client):
    """Test mission lifecycle: create → start → stop."""
    headers = _get_auth_headers(client)

    # Create
    resp = client.post("/api/v1/missions", json={
        "name": "Lifecycle Mission",
    }, headers=headers)
    mission_id = resp.json()["id"]
    assert resp.json()["status"] == "PLANNED"

    # Start
    resp = client.post(f"/api/v1/missions/{mission_id}/start", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "ACTIVE"

    # Stop
    resp = client.post(f"/api/v1/missions/{mission_id}/stop", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "COMPLETED"


def test_mission_not_found(client):
    """GET /api/v1/missions/{invalid_id} should return 404."""
    headers = _get_auth_headers(client)
    response = client.get(
        "/api/v1/missions/00000000-0000-0000-0000-000000000000",
        headers=headers,
    )
    assert response.status_code == 404


def test_mission_unauthorized(client):
    """Accessing missions without token should fail with 401."""
    response = client.get("/api/v1/missions")
    assert response.status_code == 401
