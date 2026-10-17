/**
 * Dashboard API — aggregated summary from backend
 */
import api from './client.js';

export async function getDashboardSummary() {
  return api.get('/dashboard/summary');
}
