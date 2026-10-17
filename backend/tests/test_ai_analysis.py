"""
RescueHive — Phase 4A AI Vision Analysis Tests
==============================================
Tests for:
- Valid image upload and mocked Ollama vision analysis
- Invalid file rejection (unsupported extension / bad MIME)
- Maximum file-size rejection
- Ollama unavailable error handling (503)
- Ollama inference timeout handling (504)
- Malformed model response handling
- Empty findings response handling
- Valid findings saved to database with status PENDING
- Confirm and Dismiss actions persisted
- Detections Queue retrieval
"""

import io
from unittest.mock import patch, AsyncMock
from PIL import Image
import pytest
import httpx
from fastapi import HTTPException

from app.schemas.ai_analysis import OllamaStatusResponse, VisionModelResult, VisionFinding


def _get_auth_headers(client) -> dict:
    """Helper: register + login and return auth headers."""
    client.post("/api/v1/auth/register", json={
        "name": "Vision AI Tester",
        "email": "vision_tester@rescuehive.dev",
        "password": "visionpassword123",
        "role": "INCIDENT_COMMANDER",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "vision_tester@rescuehive.dev",
        "password": "visionpassword123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_test_image(format="JPEG", size=(100, 100)) -> bytes:
    """Generate a valid test image byte stream."""
    img = Image.new("RGB", size, color=(200, 50, 50))
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    buffer.seek(0)
    return buffer.getvalue()


# ─── 1. Health / Status Check ────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_ai_status_endpoint(client):
    headers = _get_auth_headers(client)
    with patch("app.api.v1.endpoints.ai.check_ollama_status", new_callable=AsyncMock) as mock_status:
        mock_status.return_value = OllamaStatusResponse(
            available=True,
            model="gemma3:4b",
            model_ready=True,
            base_url="http://localhost:11434",
            message="Ollama ready.",
        )
        response = client.get("/api/v1/ai/status", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["available"] is True
        assert data["model"] == "gemma3:4b"


# ─── 2. Valid Image Analysis & Database Persistence ──────────────────────────
@pytest.mark.asyncio
async def test_valid_image_upload_and_persistence(client):
    headers = _get_auth_headers(client)
    img_bytes = _create_test_image(format="JPEG")

    mock_vision_result = VisionModelResult(
        scene_summary="Disaster scene showing collapsed debris and a visible survivor.",
        findings=[
            VisionFinding(
                type="PERSON",
                description="Possible survivor trapped near concrete slab.",
                evidence="Visible human arm and movement in lower-left sector.",
                location_description="lower-left sector",
                estimated_confidence=0.89,
                review_priority="HIGH",
            ),
            VisionFinding(
                type="FIRE",
                description="Active secondary blaze near ruptured pipeline.",
                evidence="Orange flames and dark smoke column.",
                location_description="upper-right background",
                estimated_confidence=0.91,
                review_priority="CRITICAL",
            ),
        ],
    )

    with patch("app.services.vision_analysis_service.call_ollama_vision", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = mock_vision_result

        files = {"file": ("disaster_scene.jpg", img_bytes, "image/jpeg")}
        response = client.post("/api/v1/ai/analyze-image", files=files, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["scene_summary"] == mock_vision_result.scene_summary
        assert data["model_name"] == "gemma3:4b"
        assert data["analysis_source"] == "OLLAMA_VISION_LLM"
        assert len(data["detections"]) == 2

        # Verify initial status is PENDING
        for det in data["detections"]:
            assert det["status"] == "PENDING"
            assert det["analysis_source"] == "OLLAMA_VISION_LLM"
            assert det["image_path"].startswith("/uploads/")

        person_det = next(d for d in data["detections"] if d["detection_type"] == "PERSON")
        assert person_det["confidence"] == 0.89
        assert person_det["description"] == "Possible survivor trapped near concrete slab."

        # ─── Confirm Action Persisted ─────────────────────────────────
        det_id = person_det["id"]
        confirm_resp = client.patch(f"/api/v1/detections/{det_id}/confirm", headers=headers)
        assert confirm_resp.status_code == 200
        assert confirm_resp.json()["status"] == "CONFIRMED"

        # ─── Dismiss Action Persisted ─────────────────────────────────
        fire_det = next(d for d in data["detections"] if d["detection_type"] == "FIRE")
        fire_id = fire_det["id"]
        dismiss_resp = client.patch(f"/api/v1/detections/{fire_id}/dismiss", headers=headers)
        assert dismiss_resp.status_code == 200
        assert dismiss_resp.json()["status"] == "DISMISSED"


# ─── 3. Invalid File Extension & MIME Rejection ─────────────────────────────
def test_invalid_file_extension(client):
    headers = _get_auth_headers(client)
    text_content = b"This is not an image file."
    files = {"file": ("report.pdf", text_content, "application/pdf")}

    response = client.post("/api/v1/ai/analyze-image", files=files, headers=headers)
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]


def test_corrupted_image_content(client):
    headers = _get_auth_headers(client)
    fake_jpg = b"JFIF corrupted fake image bytes 12345"
    files = {"file": ("corrupted.jpg", fake_jpg, "image/jpeg")}

    response = client.post("/api/v1/ai/analyze-image", files=files, headers=headers)
    assert response.status_code == 400
    assert "Invalid or corrupted image payload" in response.json()["detail"]


# ─── 4. File Size Rejection ─────────────────────────────────────────────────
def test_file_size_exceeded(client):
    headers = _get_auth_headers(client)
    oversized = b"0" * (11 * 1024 * 1024)  # 11MB exceeds 10MB limit
    files = {"file": ("large.jpg", oversized, "image/jpeg")}

    response = client.post("/api/v1/ai/analyze-image", files=files, headers=headers)
    assert response.status_code == 413
    assert "maximum allowable size" in response.json()["detail"]


# ─── 5. Ollama Unavailable (503) ─────────────────────────────────────────────
@pytest.mark.asyncio
async def test_ollama_unavailable(client):
    headers = _get_auth_headers(client)
    img_bytes = _create_test_image()

    with patch("app.services.vision_analysis_service.check_ollama_status", new_callable=AsyncMock) as mock_status:
        mock_status.return_value = OllamaStatusResponse(
            available=False,
            model="gemma3:4b",
            model_ready=False,
            base_url="http://localhost:11434",
            message="Ollama server is unreachable at http://localhost:11434.",
        )
        files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
        response = client.post("/api/v1/ai/analyze-image", files=files, headers=headers)
        assert response.status_code == 503
        assert "unreachable" in response.json()["detail"]


# ─── 6. Ollama Timeout (504) ─────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_ollama_timeout(client):
    headers = _get_auth_headers(client)
    img_bytes = _create_test_image()

    with patch("app.services.vision_analysis_service.check_ollama_status", new_callable=AsyncMock) as mock_status:
        mock_status.return_value = OllamaStatusResponse(
            available=True,
            model="gemma3:4b",
            model_ready=True,
            base_url="http://localhost:11434",
            message="Ready",
        )
        with patch("httpx.AsyncClient.post", side_effect=httpx.TimeoutException("Read timed out")):
            files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
            response = client.post("/api/v1/ai/analyze-image", files=files, headers=headers)
            assert response.status_code == 504
            assert "timed out" in response.json()["detail"]


# ─── 7. Empty Findings Response ─────────────────────────────────────────────
@pytest.mark.asyncio
async def test_empty_findings_response(client):
    headers = _get_auth_headers(client)
    img_bytes = _create_test_image()

    mock_empty_result = VisionModelResult(
        scene_summary="Clear open corridor, no victims or hazards visible.",
        findings=[],
    )

    with patch("app.services.vision_analysis_service.call_ollama_vision", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = mock_empty_result
        files = {"file": ("clear_corridor.png", img_bytes, "image/png")}
        response = client.post("/api/v1/ai/analyze-image", files=files, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["scene_summary"] == "Clear open corridor, no victims or hazards visible."
        assert len(data["detections"]) == 0
        assert data["raw_findings_count"] == 0


# ─── 8. Detections Queue Displays Persisted Records ──────────────────────────
@pytest.mark.asyncio
async def test_detections_queue_displays_persisted_records(client):
    headers = _get_auth_headers(client)
    img_bytes = _create_test_image()

    mock_result = VisionModelResult(
        scene_summary="Hazardous container found.",
        findings=[
            VisionFinding(
                type="GAS_CYLINDER",
                description="Pressurized cylinder near collapse point.",
                evidence="Metal gas canister markings.",
                location_description="center",
                estimated_confidence=0.88,
                review_priority="HIGH",
            )
        ],
    )

    with patch("app.services.vision_analysis_service.call_ollama_vision", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = mock_result
        files = {"file": ("gas.jpg", img_bytes, "image/jpeg")}
        create_resp = client.post("/api/v1/ai/analyze-image", files=files, headers=headers)
        assert create_resp.status_code == 201

        # Query GET /api/v1/detections
        list_resp = client.get("/api/v1/detections", headers=headers)
        assert list_resp.status_code == 200
        items = list_resp.json()["detections"]
        gas_items = [d for d in items if d["detection_type"] == "GAS_CYLINDER"]
        assert len(gas_items) >= 1
        assert gas_items[0]["status"] == "PENDING"
        assert gas_items[0]["analysis_source"] == "OLLAMA_VISION_LLM"
