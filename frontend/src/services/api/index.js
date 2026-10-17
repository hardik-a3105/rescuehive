/**
 * API Service Layer — barrel export for all API modules.
 */
export { api, ApiError, getStoredToken, setStoredToken, clearStoredToken } from './client.js';
export * from './authApi.js';
export * from './dashboardApi.js';
export * from './missionApi.js';
export * from './robotApi.js';
export * from './detectionApi.js';
export * from './alertApi.js';
