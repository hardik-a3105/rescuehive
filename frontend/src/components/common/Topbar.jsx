import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Radio, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useMission } from '../../context/MissionContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from './StatusBadge';

export function Topbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { activeMission, alerts, robots, errors } = useMission();
  const { user, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeRobotsCount = robots.filter(
    (r) => (r.connection_status === 'CONNECTED' || r.connectionStatus === 'CONNECTED') && r.status !== 'OFFLINE'
  ).length;
  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'OP';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isConnected = !errors.dashboard && !errors.missions;

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
                Phase 3 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans truncate max-w-xs">
              {activeMission?.name || 'FastAPI + PostgreSQL Integrated'}
            </p>
          </div>
        </div>

        {/* Live Mission Status Pills */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-xs pl-4 border-l border-slate-200 dark:border-slate-800">
          <StatusBadge status={activeMission?.status || 'ACTIVE'} />

          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px]">
            {activeRobotsCount} / {robots.length} ROBOTS ONLINE
          </span>
        </div>
      </div>

      {/* Right Controls: Connection, Theme Switch, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Connection Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span
            className={`hidden sm:inline font-medium text-[11px] ${
              isConnected
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isConnected ? 'API CONNECTED' : 'BACKEND OFFLINE'}
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
                  Recent Tactical Alerts
                </span>
                <span className="text-[10px] text-slate-400">
                  {unreadAlertsCount} unacknowledged
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-slate-400 text-center py-4 text-xs font-sans">
                    No active emergency alerts recorded.
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-2.5 rounded-lg border text-[11px] ${
                        alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                          ? 'border-rose-500/30 bg-rose-500/5 text-rose-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{alert.title}</span>
                        <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-sans">
                        {alert.description || alert.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Capsule with Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left font-mono">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                {user?.name || 'Authenticated Operator'}
              </div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-400 leading-tight uppercase font-semibold">
                {user?.role?.replace('_', ' ') || 'FIELD OPERATOR'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 font-mono text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors font-medium text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out Terminal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
