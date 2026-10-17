/**
 * Alerts API — list, acknowledge
 */
import api from './client.js';

export async function getAlerts({ skip = 0, limit = 100 } = {}) {
  return api.get('/alerts', { params: { skip, limit } });
}

export async function acknowledgeAlert(alertId) {
  return api.patch(`/alerts/${alertId}/acknowledge`);
}
