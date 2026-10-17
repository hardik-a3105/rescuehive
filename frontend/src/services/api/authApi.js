/**
 * Auth API — login, register, current user
 */
import api, { setStoredToken } from './client.js';

export async function loginUser(email, password) {
  const data = await api.post('/auth/login', { email, password }, { requireAuth: false });
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function registerUser({ name, email, password, role = 'FIELD_OPERATOR' }) {
  return api.post('/auth/register', { name, email, password, role }, { requireAuth: false });
}

export async function getCurrentUser() {
  return api.get('/auth/me');
}
