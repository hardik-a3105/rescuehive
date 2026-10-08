import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useMission } from '../../context/MissionContext';
import { StatusBadge } from './StatusBadge';

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { activeMission, alerts, robots, notifications, removeNotification } = useMission();
  const [showNotifications, setShowNotifications] = useState(false);

  const activeRobotsCount = robots.filter((r) => r.status === 'ACTIVE' || r.status === 'EXPLORING').length;
  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Branding & Current Mission Status */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <ShieldAlert className="w-6 h-6 text-slate-950 stroke-[2.2]" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider font-mono text-slate-900 dark:text-white">
                RESCUEHIVE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono font-bold uppercase border border-cyan-500/30">
                Phase 1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans truncate max-w-xs">
              {activeMission?.name || 'Disaster Intelligence Command'}
            </p>
          </div>
        </div>

        {/* Live Mission Status Pills */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-xs pl-4 border-l border-slate-200 dark:border-slate-800">
          <StatusBadge status={activeMission?.status || 'ACTIVE'} />

          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold">
            SIMULATION MODE
          </span>

          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px]">
            {activeRobotsCount} / {robots.length} ROBOTS ONLINE
          </span>
        </div>
      </div>

      {/* Right Controls: Connection, Theme Switch, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Connection Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-medium">
            SIM TELEMETRY LIVE
          </span>
        </div>

        {/* Quick Dark/Light Mode Switch */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-500 hover:border-cyan-500/40 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-600" />
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors relative"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Recent Tactical Events
                </span>
                <span className="text-[10px] text-slate-400">
                  {unreadAlertsCount} unacknowledged
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-lg border text-[11px] ${
                      alert.severity === 'HIGH'
                        ? 'border-rose-500/30 bg-rose-500/5 text-rose-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{alert.title}</span>
                      <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-sans">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            SV
          </div>
          <div className="hidden md:block text-left font-mono">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Cmdr. Sarah Vance
            </div>
            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 leading-tight">
              Incident Commander
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
