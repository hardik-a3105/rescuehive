import React, { useState } from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  Palette, 
  User, 
  Bell, 
  Monitor, 
  Radio, 
  Save, 
  Check, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';

export function SettingsPage() {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form mock states
  const [profile, setProfile] = useState({
    name: 'Cmdr. Sarah Vance',
    callsign: 'Overwatch-Lead',
    role: 'Incident Commander',
    email: 'vance.s@rescuehive.io',
    organization: 'National Disaster Robotics Division',
  });

  const [preferences, setPreferences] = useState({
    refreshRate: '10',
    units: 'metric',
    soundAlerts: true,
    autoCenterMap: true,
    showTrails: true,
    compactTables: false,
    simLatency: '25',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Command Platform Settings"
        subtitle="Manage appearance themes, telemetry preferences, and operator workstation profiles"
        badge={
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs border border-cyan-500/30 font-semibold">
            WORKSTATION CONFIG
          </span>
        }
        action={
          <Button
            size="md"
            onClick={handleSave}
            className="gap-2 font-mono text-xs"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Save className="w-3.5 h-3.5" />}
            {savedSuccess ? 'Preferences Saved!' : 'Save Preferences'}
          </Button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Theme & Appearance (Requested Dark and Light Mode Switch) */}
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
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  theme === 'dark'
                    ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-lg'
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
                    {theme === 'dark' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500 text-slate-950 font-bold font-mono">
                        ACTIVE
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
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  theme === 'light'
                    ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-lg'
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
                    {theme === 'light' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500 text-slate-950 font-bold font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    Crisp, high-contrast daylight silver layout tailored for sunlight and field laptop deployments.
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
              Incident Commander Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Full Name:
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Tactical Call Sign:
              </label>
              <input
                type="text"
                value={profile.callsign}
                onChange={(e) => setProfile({ ...profile, callsign: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Role Assignment:
              </label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Disaster Response Agency:
              </label>
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 3. System Preferences & Notifications */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              System Preferences & Telemetry
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Simulation Telemetry Loop Rate:
              </label>
              <select
                value={preferences.refreshRate}
                onChange={(e) => setPreferences({ ...preferences, refreshRate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="10">10 Hz (Real-time telemetry stream)</option>
                <option value="5">5 Hz (Balanced bandwidth)</option>
                <option value="1">1 Hz (Battery saving simulation)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Measurement Units:
              </label>
              <select
                value={preferences.units}
                onChange={(e) => setPreferences({ ...preferences, units: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="metric">Metric (Meters / Celsius / m/s)</option>
                <option value="imperial">Imperial (Feet / Fahrenheit / mph)</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Audible Alert Chimes on Critical Victim & Fire Detection
              </span>
              <input
                type="checkbox"
                checked={preferences.soundAlerts}
                onChange={(e) => setPreferences({ ...preferences, soundAlerts: e.target.checked })}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Show Historical Robot Odometry Trails on Tactical GIS Grid
              </span>
              <input
                type="checkbox"
                checked={preferences.showTrails}
                onChange={(e) => setPreferences({ ...preferences, showTrails: e.target.checked })}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>
          </div>
        </div>

        {/* 4. Connection & Simulator Settings */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Radio className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Simulator Interface & Connection Mode
            </h3>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-mono text-amber-800 dark:text-amber-300">
            <p className="font-bold">Notice: Webots Simulator is an External System</p>
            <p className="mt-1 font-sans text-amber-700 dark:text-amber-400">
              In Phase 1, all telemetry is rendered from local mock datasets. Connection to live WebSocket streams from the external Webots simulation engine will occur in Phase 4.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
