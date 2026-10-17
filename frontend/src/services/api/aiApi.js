/**
 * RescueHive — AI Vision LLM API Client (Phase 4A)
 */
import api from './client.js';

export async function getAiStatus() {
  return api.get('/ai/status');
}

export async function analyzeImage(file, missionId = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (missionId) {
    formData.append('mission_id', missionId);
  }
  return api.post('/ai/analyze-image', formData);
}
