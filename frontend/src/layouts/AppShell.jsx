import React from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from '../components/common/Topbar';
import { Sidebar } from '../components/common/Sidebar';
import { useMission } from '../context/MissionContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export function AppShell() {
  const { notifications, removeNotification } = useMission();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Topbar */}
      <Topbar />

      {/* Main Container: Sidebar + Page Viewport */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-grid-pattern relative">
          <Outlet />
        </main>
      </div>

      {/* Interactive Simulation Action Toast Stack */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-xl border border-cyan-500/40 bg-slate-950/95 text-slate-100 shadow-2xl font-mono text-xs backdrop-blur-md animate-fade-in"
          >
            <div className="flex items-center gap-2">
              {n.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : n.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span className="leading-snug">{n.message}</span>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
