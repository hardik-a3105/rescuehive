import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext();

const STORAGE_KEY = 'rescuehive_workstation_settings';

const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light'
  refreshRate: 8, // seconds: 5, 8, 15, 30
  units: 'metric', // 'metric' | 'imperial'
  soundAlerts: true,
  compactMode: false,
  desktopNotifications: true,
  profile: {
    callsign: 'Overwatch-Lead',
    agency: 'National Disaster Robotics Swarm Taskforce',
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          profile: { ...DEFAULT_SETTINGS.profile, ...(parsed.profile || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to load saved settings, using defaults', e);
    }
    // Also check legacy theme key if present
    const legacyTheme = localStorage.getItem('rescuehive_theme');
    return {
      ...DEFAULT_SETTINGS,
      theme: legacyTheme === 'light' || legacyTheme === 'dark' ? legacyTheme : DEFAULT_SETTINGS.theme,
    };
  });

  // Keep theme class in sync on <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('rescuehive_theme', settings.theme);
  }, [settings.theme]);

  // Keep compact mode class in sync on <body> element
  useEffect(() => {
    if (settings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [settings.compactMode]);

  // Persist all settings on change
  const saveSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const merged = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.error('Failed to persist workstation settings:', err);
      }
      return merged;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    saveSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, [saveSettings]);

  // Sound alert utility (beeps if enabled)
  const playAlertSound = useCallback((severity = 'MEDIUM') => {
    if (!settings.soundAlerts || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (severity === 'CRITICAL' || severity === 'HIGH') {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch warning
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 chime
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio context may be restricted by browser policy before user interaction
    }
  }, [settings.soundAlerts]);

  // Metric / Imperial unit converters
  const formatArea = useCallback((sqMeters) => {
    const val = typeof sqMeters === 'number' ? sqMeters : parseFloat(sqMeters) || 0;
    if (settings.units === 'imperial') {
      const sqFt = Math.round(val * 10.7639);
      return `${sqFt.toLocaleString()} sq ft`;
    }
    return `${val.toLocaleString()} m²`;
  }, [settings.units]);

  const formatSpeed = useCallback((mps) => {
    const val = typeof mps === 'number' ? mps : parseFloat(mps) || 0;
    if (settings.units === 'imperial') {
      const mph = (val * 2.23694).toFixed(1);
      return `${mph} mph`;
    }
    return `${val.toFixed(1)} m/s`;
  }, [settings.units]);

  const formatDistance = useCallback((meters) => {
    const val = typeof meters === 'number' ? meters : parseFloat(meters) || 0;
    if (settings.units === 'imperial') {
      const feet = (val * 3.28084).toFixed(1);
      return `${feet} ft`;
    }
    return `${val.toFixed(1)} m`;
  }, [settings.units]);

  const formatTemperature = useCallback((celsius) => {
    const val = typeof celsius === 'number' ? celsius : parseFloat(celsius) || 36.5;
    if (settings.units === 'imperial') {
      const fahrenheit = ((val * 9) / 5 + 32).toFixed(1);
      return `${fahrenheit} °F`;
    }
    return `${val.toFixed(1)} °C`;
  }, [settings.units]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        saveSettings,
        toggleTheme,
        theme: settings.theme,
        playAlertSound,
        formatArea,
        formatSpeed,
        formatDistance,
        formatTemperature,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
