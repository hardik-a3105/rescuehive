"""
Tests for Health Endpoint
"""


def test_health_endpoint(client):
    """GET /api/v1/health should return status ok."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "rescuehive-backend"


def test_root_redirect(client):
    """GET / should redirect to /docs."""
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert "/docs" in response.headers.get("location", "")
