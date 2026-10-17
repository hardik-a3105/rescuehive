import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  Crosshair, 
  Compass, 
  FileText, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { robots, detections, errors } = useMission();
  const { user, logout } = useAuth();

  const pendingDetections = detections.filter((d) => d.status === 'PENDING').length;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/robots',
      label: 'Robots Fleet',
      icon: Bot,
      badge: `${robots.length}`,
    },
    {
      to: '/detections',
      label: 'Detections Queue',
      icon: Crosshair,
      badge: pendingDetections > 0 ? `${pendingDetections} new` : null,
      badgeColor: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    },
    {
      to: '/missions',
      label: 'Missions Ops',
      icon: Compass,
      badge: null,
    },
    {
      to: '/reports',
      label: 'AI Reports',
      icon: FileText,
      badge: 'Draft',
    },
    {
      to: '/settings',
      label: 'System Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isBackendHealthy = !errors.dashboard;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-10 w-64 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d1a] flex flex-col justify-between shrink-0 overflow-y-auto transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Links */}
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-mono font-bold text-xs text-cyan-500">NAVIGATION</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
            Mission Operations
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const { to, label, icon: Icon, badge, badgeColor } = item;
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </div>
                  {badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        badgeColor ||
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Backend Connectivity Status Card */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 font-mono text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Server className="w-3 h-3 text-cyan-400" />
              FastAPI Core
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Database:</span>
            <span className="text-emerald-500 font-bold">PostgreSQL</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>REST Polling:</span>
            <span className="text-cyan-500 font-bold">Active (8s)</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: System Status, Logged-in User, Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3 font-mono">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">ROLE:</span>
          <span className="text-cyan-500 font-semibold flex items-center gap-1 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            {user?.role?.replace('_', ' ') || 'OPERATOR'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="truncate mr-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.name || 'Authorized Operator'}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {user?.email || 'operator@rescuehive.dev'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out Terminal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
