"""
Tests for Detection Endpoints
"""


def _get_auth_headers(client) -> dict:
    """Helper: register + login and return auth headers."""
    client.post("/api/v1/auth/register", json={
        "name": "Detection Test User",
        "email": "detection_test@rescuehive.dev",
        "password": "detectpass",
        "role": "FIELD_OPERATOR",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "detection_test@rescuehive.dev",
        "password": "detectpass",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_detection(client):
    """POST /api/v1/detections should create a detection."""
    headers = _get_auth_headers(client)
    response = client.post("/api/v1/detections", json={
        "detection_type": "PERSON",
        "confidence": 0.92,
        "x": 5.0,
        "y": 3.0,
        "z": 0.0,
    }, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["detection_type"] == "PERSON"
    assert data["confidence"] == 0.92
    assert data["status"] == "PENDING"


def test_list_detections(client):
    """GET /api/v1/detections should return a list."""
    headers = _get_auth_headers(client)
    response = client.get("/api/v1/detections", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "detections" in data
    assert "total" in data


def test_confirm_detection(client):
    """PATCH /api/v1/detections/{id}/confirm should confirm a detection."""
    headers = _get_auth_headers(client)
    create_resp = client.post("/api/v1/detections", json={
        "detection_type": "FIRE",
        "confidence": 0.88,
    }, headers=headers)
    det_id = create_resp.json()["id"]

    response = client.patch(f"/api/v1/detections/{det_id}/confirm", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "CONFIRMED"


def test_dismiss_detection(client):
    """PATCH /api/v1/detections/{id}/dismiss should dismiss a detection."""
    headers = _get_auth_headers(client)
    create_resp = client.post("/api/v1/detections", json={
        "detection_type": "HELMET",
        "confidence": 0.55,
    }, headers=headers)
    det_id = create_resp.json()["id"]

    response = client.patch(f"/api/v1/detections/{det_id}/dismiss", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "DISMISSED"


def test_invalid_detection_type(client):
    """Creating a detection with invalid type should fail."""
    headers = _get_auth_headers(client)
    response = client.post("/api/v1/detections", json={
        "detection_type": "ALIEN",
        "confidence": 0.99,
    }, headers=headers)
    assert response.status_code == 400


def test_detection_unauthorized(client):
    """Accessing detections without token should fail with 401."""
    response = client.get("/api/v1/detections")
    assert response.status_code == 401
