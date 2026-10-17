/**
 * RescueHive API Client — Centralized HTTP layer with JWT auth.
 * All API calls flow through this module for consistent error handling,
 * token injection, and automatic 401→login redirect.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// ─── Token helpers ─────────────────────────────────────────────────────
const TOKEN_KEY = 'rescuehive_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Core fetch wrapper ────────────────────────────────────────────────

/**
 * Build a standard request with JSON body + Bearer token.
 * Handles 401/403/404/422/500 and network errors uniformly.
 */
async function request(method, path, { body, params, requireAuth = true } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const headers = { 'Accept': 'application/json' };
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch (err) {
    // Network failure — backend unreachable
    throw new ApiError(0, 'Unable to connect to RescueHive backend. Please check that the server is running.', err);
  }

  // 204 No Content — successful delete etc.
  if (response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = data?.detail || response.statusText || 'Unknown error';

    // Auto-redirect on expired/invalid token
    if (response.status === 401) {
      clearStoredToken();
      // Dispatch a custom event so AuthContext can react
      window.dispatchEvent(new CustomEvent('rescuehive:auth-expired'));
    }

    throw new ApiError(response.status, detail, data);
  }

  return data;
}

// ─── Custom error class ────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── Convenience methods ───────────────────────────────────────────────
export const api = {
  get:    (path, opts) => request('GET', path, opts),
  post:   (path, body, opts) => request('POST', path, { body, ...opts }),
  put:    (path, body, opts) => request('PUT', path, { body, ...opts }),
  patch:  (path, body, opts) => request('PATCH', path, { body, ...opts }),
  delete: (path, opts) => request('DELETE', path, opts),
};

export default api;
