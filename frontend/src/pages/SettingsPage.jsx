import React, { useState, useEffect, useMemo } from 'react';
import { 
  Palette, 
  User, 
  Bell, 
  Save, 
  Check, 
  Moon, 
  Sun,
  ShieldCheck,
  Server,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  AlertCircle,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';

export function SettingsPage() {
  const { settings, saveSettings, playAlertSound } = useSettings();
  const { user } = useAuth();
  const { addNotification } = useMission();

  // Local form state
  const [formData, setFormData] = useState({
    theme: settings.theme || 'dark',
    refreshRate: Number(settings.refreshRate || 8),
    units: settings.units || 'metric',
    soundAlerts: settings.soundAlerts !== false,
    compactMode: !!settings.compactMode,
    desktopNotifications: settings.desktopNotifications !== false,
    name: user?.name || 'Authorized Operator',
    callsign: settings.profile?.callsign || 'Overwatch-Lead',
    agency: settings.profile?.agency || 'National Disaster Robotics Swarm Taskforce',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Sync with persisted settings on mount / when settings change externally
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      theme: settings.theme,
      refreshRate: Number(settings.refreshRate),
      units: settings.units,
      soundAlerts: settings.soundAlerts,
      compactMode: settings.compactMode,
      desktopNotifications: settings.desktopNotifications,
      callsign: settings.profile?.callsign || prev.callsign,
      agency: settings.profile?.agency || prev.agency,
    }));
  }, [settings]);

  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    const orig = {
      theme: settings.theme,
      refreshRate: Number(settings.refreshRate),
      units: settings.units,
      soundAlerts: settings.soundAlerts,
      compactMode: settings.compactMode,
      desktopNotifications: settings.desktopNotifications,
      name: user?.name || 'Authorized Operator',
      callsign: settings.profile?.callsign || 'Overwatch-Lead',
      agency: settings.profile?.agency || 'National Disaster Robotics Swarm Taskforce',
    };
    return JSON.stringify(formData) !== JSON.stringify(orig);
  }, [formData, settings, user]);

  const handleSave = (e) => {
    if (e) e.preventDefault();

    // Input validation
    if (!formData.name.trim()) {
      setValidationError('Operator name cannot be empty.');
      return;
    }
    if (!formData.agency.trim()) {
      setValidationError('Agency name cannot be empty.');
      return;
    }
    setValidationError('');

    try {
      saveSettings({
        theme: formData.theme,
        refreshRate: Number(formData.refreshRate),
        units: formData.units,
        soundAlerts: formData.soundAlerts,
        compactMode: formData.compactMode,
        desktopNotifications: formData.desktopNotifications,
        profile: {
          callsign: formData.callsign.trim(),
          agency: formData.agency.trim(),
        },
      });

      setSavedSuccess(true);
      addNotification('Workstation preferences saved and persisted locally.', 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setValidationError(`Failed to persist preferences: ${err.message}`);
    }
  };

  const handleReset = () => {
    setFormData({
      theme: 'dark',
      refreshRate: 8,
      units: 'metric',
      soundAlerts: true,
      compactMode: false,
      desktopNotifications: true,
      name: user?.name || 'Authorized Operator',
      callsign: 'Overwatch-Lead',
      agency: 'National Disaster Robotics Swarm Taskforce',
    });
    setValidationError('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Command Platform Settings"
        subtitle="Manage appearance themes, telemetry polling intervals, measurement units, and operator workstation profiles"
        badge={
          isDirty ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-mono text-xs border border-amber-500/30 font-semibold animate-pulse">
              ● UNSAVED CHANGES
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs border border-cyan-500/30 font-semibold">
              WORKSTATION ACTIVE
            </span>
          )
        }
        action={
          <div className="flex items-center gap-2">
            {isDirty && (
              <Button
                variant="outline"
                size="md"
                onClick={handleReset}
                className="gap-1.5 font-mono text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            )}
            <Button
              size="md"
              onClick={handleSave}
              className={`gap-2 font-mono text-xs ${
                savedSuccess ? 'bg-emerald-600 text-white' : ''
              }`}
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
              {savedSuccess ? 'Preferences Saved!' : 'Save Preferences'}
            </Button>
          </div>
        }
      />

      {validationError && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-mono text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Theme & Appearance Mode Switch */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Palette className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Workstation Appearance & Theme Mode
            </h3>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-mono text-slate-500 dark:text-slate-400 block">
              Display Mode Selection:
            </label>

            {/* Dark & Light Mode Radio Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dark Mode Card */}
              <div
                onClick={() => setFormData({ ...formData, theme: 'dark' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  formData.theme === 'dark'
                    ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-lg ring-1 ring-cyan-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="p-3 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 shrink-0">
                  <Moon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">
                      Dark Command Theme
                    </span>
                    {formData.theme === 'dark' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500 text-slate-950 font-bold font-mono">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    Deep naval slate command center styling designed for low-light mission control environments.
                  </p>
                </div>
              </div>

              {/* Light Mode Card */}
              <div
                onClick={() => setFormData({ ...formData, theme: 'light' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  formData.theme === 'light'
                    ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-lg ring-1 ring-cyan-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                  <Sun className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">
                      Light Tactical Theme
                    </span>
                    {formData.theme === 'light' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500 text-slate-950 font-bold font-mono">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    Crisp, high-contrast daylight layout tailored for sunlight and outdoor field deployments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Operator Profile Settings */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Operator Terminal Identity & Agency
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Operator Display Name:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Commander Singh"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Command Station Email (Authenticated):
              </label>
              <input
                type="email"
                value={user?.email || 'operator@rescuehive.dev'}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Operational Role (Read-Only):
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-cyan-500 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{user?.role?.replace('_', ' ') || 'FIELD OPERATOR'}</span>
              </div>
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Tactical Call-sign:
              </label>
              <input
                type="text"
                value={formData.callsign}
                onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Overwatch-Lead"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Disaster Response Agency / Taskforce:
              </label>
              <input
                type="text"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. National Disaster Robotics Swarm Taskforce"
              />
            </div>
          </div>
        </div>

        {/* 3. System Preferences & Telemetry */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Telemetry, Measurement Units & Alerts
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-mono">
            {/* Refresh Polling Rate */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                REST Polling Refresh Rate:
              </label>
              <select
                value={formData.refreshRate}
                onChange={(e) => setFormData({ ...formData, refreshRate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={5}>5 Seconds (High Bandwidth / Real-Time)</option>
                <option value={8}>8 Seconds (Default Balanced)</option>
                <option value={15}>15 Seconds (Low Bandwidth)</option>
                <option value={30}>30 Seconds (Field Battery Saver)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Controls automatic background sync frequency for fleet telemetry and detections queue.
              </span>
            </div>

            {/* Measurement Units */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Measurement System:
              </label>
              <select
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="metric">Metric (Meters, m², m/s, °C)</option>
                <option value="imperial">Imperial (Feet, sq ft, mph, °F)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Used across dashboard telemetry, mission explored area, and report summaries.
              </span>
            </div>

            {/* Sound Alerts */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {formData.soundAlerts ? <Volume2 className="w-4 h-4 text-cyan-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span>Audible Alert Chimes</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Play tactical tones on high-severity hazards and detections
                </div>
              </div>
              <div className="flex items-center gap-2">
                {formData.soundAlerts && (
                  <button
                    type="button"
                    onClick={() => playAlertSound('HIGH')}
                    className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] transition-colors"
                    title="Test chime"
                  >
                    Test
                  </button>
                )}
                <input
                  type="checkbox"
                  checked={formData.soundAlerts}
                  onChange={(e) => setFormData({ ...formData, soundAlerts: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Compact Dashboard Mode */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-500" />
                  <span>Compact Layout Density</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Reduce paddings for multi-monitor tactical command setups
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.compactMode}
                onChange={(e) => setFormData({ ...formData, compactMode: e.target.checked })}
                className="w-4 h-4 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Backend Environment Architecture Status */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Server className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Backend Architecture & Database Foundation
            </h3>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">REST API Target:</span>
              <span className="text-cyan-500 dark:text-cyan-400 font-bold">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="text-emerald-500 font-bold">PostgreSQL via SQLAlchemy ORM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AI Vision Engine:</span>
              <span className="text-cyan-500 font-bold">Ollama / Gemma 3 4B (Local Multimodal)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Authentication Protocol:</span>
              <span className="text-purple-500 font-bold">JWT Bearer (HS256)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Simulator Boundary:</span>
              <span className="text-amber-500 font-bold">Decoupled (Dedicated API bridge for Webots)</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
