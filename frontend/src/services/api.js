const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Perform a health check query against the backend API:
 * GET /api/v1/health
 */
export async function getHealthStatus() {
  const startTime = performance.now();
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const latency = Math.round(performance.now() - startTime);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    return {
      success: false,
      error: error.message || 'Failed to reach backend service',
      latency,
      timestamp: new Date().toISOString(),
    };
  }
}
