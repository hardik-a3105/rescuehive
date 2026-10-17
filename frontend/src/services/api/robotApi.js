/**
 * Robots API — list, details, create, update, delete
 */
import api from './client.js';

export async function getRobots({ skip = 0, limit = 100 } = {}) {
  return api.get('/robots', { params: { skip, limit } });
}

export async function getRobotById(robotId) {
  return api.get(`/robots/${robotId}`);
}

export async function createRobot(data) {
  return api.post('/robots', data);
}

export async function updateRobot(robotId, data) {
  return api.put(`/robots/${robotId}`, data);
}

export async function deleteRobot(robotId) {
  return api.delete(`/robots/${robotId}`);
}
