/**
 * Missions API — CRUD + control actions
 */
import api from './client.js';

export async function getMissions({ skip = 0, limit = 100 } = {}) {
  return api.get('/missions', { params: { skip, limit } });
}

export async function getMissionById(missionId) {
  return api.get(`/missions/${missionId}`);
}

export async function createMission({ name, description }) {
  return api.post('/missions', { name, description });
}

export async function updateMission(missionId, data) {
  return api.put(`/missions/${missionId}`, data);
}

export async function deleteMission(missionId) {
  return api.delete(`/missions/${missionId}`);
}

// ─── Mission Control Actions ───────────────────────────────────────────
export async function startMission(missionId) {
  return api.post(`/missions/${missionId}/start`);
}

export async function pauseMission(missionId) {
  return api.post(`/missions/${missionId}/pause`);
}

export async function resumeMission(missionId) {
  return api.post(`/missions/${missionId}/resume`);
}

export async function stopMission(missionId) {
  return api.post(`/missions/${missionId}/stop`);
}
