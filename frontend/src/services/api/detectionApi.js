/**
 * Detections API — list, details, confirm, dismiss
 */
import api from './client.js';

export async function getDetections({ skip = 0, limit = 100, mission_id, robot_id, type, status, min_confidence } = {}) {
  return api.get('/detections', {
    params: { skip, limit, mission_id, robot_id, type, status, min_confidence },
  });
}

export async function getDetectionById(detectionId) {
  return api.get(`/detections/${detectionId}`);
}

export async function createDetection(data) {
  return api.post('/detections', data);
}

export async function confirmDetection(detectionId) {
  return api.patch(`/detections/${detectionId}/confirm`);
}

export async function dismissDetection(detectionId) {
  return api.patch(`/detections/${detectionId}/dismiss`);
}

export async function analyzeImage(file, missionId = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (missionId) {
    formData.append('mission_id', missionId);
  }
  return api.post('/ai/analyze-image', formData);
}

export async function getAiStatus() {
  return api.get('/ai/status');
}
