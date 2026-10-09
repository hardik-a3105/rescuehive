"""
Tests for Authentication Endpoints
"""
import pytest


# ─── Registration Tests ─────────────────────────────────────────────

def test_register_user(client):
    """POST /api/v1/auth/register should create a new user."""
    response = client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "test@rescuehive.dev",
        "password": "testpass123",
        "role": "FIELD_OPERATOR",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test User"
    assert data["email"] == "test@rescuehive.dev"
    assert data["role"] == "FIELD_OPERATOR"
    assert "id" in data
    assert "password_hash" not in data  # Password must never leak


def test_register_duplicate_email(client):
    """Registering with the same email should fail with 400."""
    client.post("/api/v1/auth/register", json={
        "name": "Duplicate User",
        "email": "duplicate@rescuehive.dev",
        "password": "pass123456",
        "role": "FIELD_OPERATOR",
    })
    response = client.post("/api/v1/auth/register", json={
        "name": "Another User",
        "email": "duplicate@rescuehive.dev",
        "password": "pass654321",
        "role": "ADMIN",
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_register_invalid_role(client):
    """Registering with an invalid role should fail with 400."""
    response = client.post("/api/v1/auth/register", json={
        "name": "Bad Role User",
        "email": "badrole@rescuehive.dev",
        "password": "pass123456",
        "role": "SUPER_ADMIN",
    })
    assert response.status_code == 400


# ─── Login Tests ─────────────────────────────────────────────────────

def test_login_success(client):
    """POST /api/v1/auth/login should return a JWT token."""
    # First register
    client.post("/api/v1/auth/register", json={
        "name": "Login Test User",
        "email": "login@rescuehive.dev",
        "password": "loginpass123",
        "role": "ADMIN",
    })
    # Then login
    response = client.post("/api/v1/auth/login", json={
        "email": "login@rescuehive.dev",
        "password": "loginpass123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Login with wrong password should fail with 401."""
    client.post("/api/v1/auth/register", json={
        "name": "Wrong Pass User",
        "email": "wrongpass@rescuehive.dev",
        "password": "correctpass",
        "role": "FIELD_OPERATOR",
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "wrongpass@rescuehive.dev",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Login with unknown email should fail with 401."""
    response = client.post("/api/v1/auth/login", json={
        "email": "nobody@rescuehive.dev",
        "password": "anything",
    })
    assert response.status_code == 401


# ─── Token / Me Tests ────────────────────────────────────────────────

def test_get_me_authenticated(client):
    """GET /api/v1/auth/me with valid token should return user profile."""
    # Register and login
    client.post("/api/v1/auth/register", json={
        "name": "Me Test User",
        "email": "me@rescuehive.dev",
        "password": "mepass123",
        "role": "INCIDENT_COMMANDER",
    })
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "me@rescuehive.dev",
        "password": "mepass123",
    })
    token = login_resp.json()["access_token"]

    response = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@rescuehive.dev"
    assert data["role"] == "INCIDENT_COMMANDER"


def test_get_me_unauthenticated(client):
    """GET /api/v1/auth/me without token should fail with 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_me_invalid_token(client):
    """GET /api/v1/auth/me with invalid token should fail with 401."""
    response = client.get("/api/v1/auth/me", headers={
        "Authorization": "Bearer invalid-token-here",
    })
    assert response.status_code == 401
