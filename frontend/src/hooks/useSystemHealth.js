import { useState, useEffect, useCallback } from 'react';
import { getHealthStatus } from '../services/api';

export function useSystemHealth(pollInterval = 0) {
  const [health, setHealth] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
    latency: null,
    lastChecked: null,
  });

  const check = useCallback(async () => {
    setHealth((prev) => ({ ...prev, loading: true }));
    const result = await getHealthStatus();

    if (result.success) {
      setHealth({
        loading: false,
        connected: true,
        data: result.data,
        error: null,
        latency: result.latency,
        lastChecked: result.timestamp,
      });
    } else {
      setHealth({
        loading: false,
        connected: false,
        data: null,
        error: result.error,
        latency: result.latency,
        lastChecked: result.timestamp,
      });
    }
  }, []);

  useEffect(() => {
    check();

    if (pollInterval > 0) {
      const timer = setInterval(check, pollInterval);
      return () => clearInterval(timer);
    }
  }, [check, pollInterval]);

  return { ...health, refresh: check };
}
