"""
Tests for Robot Endpoints
"""


def _get_auth_headers(client) -> dict:
    """Helper: register + login and return auth headers."""
    client.post("/api/v1/auth/register", json={
        "name": "Robot Test User",
        "email": "robot_test@rescuehive.dev",
        "password": "robotpass",
        "role": "ADMIN",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "robot_test@rescuehive.dev",
        "password": "robotpass",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_robot(client):
    """POST /api/v1/robots should register a new robot."""
    headers = _get_auth_headers(client)
    response = client.post("/api/v1/robots", json={
        "robot_id": "TEST-GRD-01",
        "name": "Test Ground Bot",
        "status": "IDLE",
        "battery": 100.0,
    }, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["robot_id"] == "TEST-GRD-01"
    assert data["name"] == "Test Ground Bot"


def test_list_robots(client):
    """GET /api/v1/robots should return a list."""
    headers = _get_auth_headers(client)
    response = client.get("/api/v1/robots", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "robots" in data
    assert "total" in data


def test_get_robot_detail(client):
    """GET /api/v1/robots/{id} should return robot details."""
    headers = _get_auth_headers(client)
    create_resp = client.post("/api/v1/robots", json={
        "robot_id": "TEST-GRD-DETAIL",
        "name": "Detail Bot",
    }, headers=headers)
    robot_uuid = create_resp.json()["id"]

    response = client.get(f"/api/v1/robots/{robot_uuid}", headers=headers)
    assert response.status_code == 200
    assert response.json()["robot_id"] == "TEST-GRD-DETAIL"


def test_duplicate_robot_id(client):
    """Creating a robot with duplicate robot_id should fail."""
    headers = _get_auth_headers(client)
    client.post("/api/v1/robots", json={
        "robot_id": "DUPE-BOT-01",
        "name": "Original Bot",
    }, headers=headers)
    response = client.post("/api/v1/robots", json={
        "robot_id": "DUPE-BOT-01",
        "name": "Duplicate Bot",
    }, headers=headers)
    assert response.status_code == 400


def test_robot_unauthorized(client):
    """Accessing robots without token should fail with 401."""
    response = client.get("/api/v1/robots")
    assert response.status_code == 401
