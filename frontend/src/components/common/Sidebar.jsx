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
  Activity, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';

export function Sidebar() {
  const navigate = useNavigate();
  const { robots, detections } = useMission();

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
      badge: `${detections.filter((d) => d.status === 'PENDING').length} new`,
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
    navigate('/login');
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#090d18]/70 backdrop-blur-md flex flex-col justify-between shrink-0 transition-colors">
      {/* Navigation Links */}
      <div className="p-4 space-y-6">
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

        {/* Tactical Status Card */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 font-mono text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold text-slate-400">Simulation Mesh</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Uplink:</span>
            <span className="text-emerald-500 font-bold">100% (Sim)</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>Sync Loop:</span>
            <span className="text-cyan-500 font-bold">10 Hz</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: System Status, Logged-in User, Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3 font-mono">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">RUNTIME:</span>
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            NORMAL
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="truncate">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Cmdr. Sarah Vance
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              commander@rescuehive.io
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out (Return to Login)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
