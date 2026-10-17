import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  User, 
  Bell, 
  Radio, 
  Save, 
  Check, 
  Moon, 
  Sun,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states initialized with live authenticated user
  const [profile, setProfile] = useState({
    name: user?.name || 'Authorized Operator',
    email: user?.email || 'operator@rescuehive.dev',
    role: user?.role || 'FIELD_OPERATOR',
    callsign: 'Overwatch-Lead',
    organization: 'National Disaster Robotics Swarm Taskforce',
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.role || prev.role,
      }));
    }
  }, [user]);

  const [preferences, setPreferences] = useState({
    refreshRate: '8',
    units: 'metric',
    soundAlerts: true,
    showTrails: true,
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

        {/* 2. Operator Profile Settings (FastAPI Authenticated) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Operator Terminal Profile (GET /auth/me)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Full Operator Name:
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
                Command Station Email:
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">
                Assigned Operational Role:
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-cyan-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                <span>{profile.role}</span>
              </div>
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
                REST Polling Refresh Rate:
              </label>
              <select
                value={preferences.refreshRate}
                onChange={(e) => setPreferences({ ...preferences, refreshRate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="5">5 Seconds (High Bandwidth)</option>
                <option value="8">8 Seconds (Default Balanced)</option>
                <option value="15">15 Seconds (Low Bandwidth)</option>
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
        </div>

        {/* 4. Backend Environment Info */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Server className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Backend Architecture (Phase 3 Integration)
            </h3>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">REST API Target:</span>
              <span className="text-cyan-400 font-bold">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="text-emerald-400 font-bold">PostgreSQL via SQLAlchemy ORM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Authentication Protocol:</span>
              <span className="text-purple-400 font-bold">JWT Bearer (HS256)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Webots Simulator:</span>
              <span className="text-amber-400 font-bold">Decoupled (Reserved for Phase 4)</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
