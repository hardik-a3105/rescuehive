import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Radio, 
  Database, 
  Terminal, 
  Layers,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSystemHealth } from '../hooks/useSystemHealth';
import { Badge } from '../components/ui/Badge';

export function AppShell() {
  const { connected, loading, data, latency, refresh } = useSystemHealth(10000);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Telemetry Header */}
      <header className="border-b border-slate-800/90 bg-[#0c1222]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
                <ShieldAlert className="w-6 h-6 text-slate-950 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-wider text-white font-mono">RESCUEHIVE</span>
                  <Badge variant="primary" className="text-[10px] uppercase tracking-wider py-0 px-2">
                    Phase 0
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  AI-Powered Multi-Robot Disaster Intelligence System
                </p>
              </div>
            </div>

            {/* System Status Indicators */}
            <div className="flex items-center gap-4">
              {/* Backend API Health Status */}
              <div 
                onClick={refresh}
                title="Click to check backend health status"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
              >
                <div className="relative flex h-2.5 w-2.5">
                  {connected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    loading ? 'bg-amber-400' : connected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}></span>
                </div>
                
                <div className="text-xs font-mono">
                  <span className="text-slate-400 mr-1.5">API:</span>
                  <span className={connected ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {loading ? 'CHECKING...' : connected ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  {connected && latency !== null && (
                    <span className="text-slate-500 text-[10px] ml-1.5">({latency}ms)</span>
                  )}
                </div>
              </div>

              {/* Docs / Swagger Link */}
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-mono transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60"
              >
                <Terminal className="w-3.5 h-3.5" />
                API Docs
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Sub Navigation */}
          <nav className="flex items-center gap-1 -mb-px overflow-x-auto text-xs font-mono font-medium border-t border-slate-800/60 pt-1 pb-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <Layers className="w-3.5 h-3.5" />
              FOUNDATION OVERVIEW
            </NavLink>

            <div className="flex items-center gap-1 text-slate-600 px-3 py-1.5 cursor-not-allowed">
              <Radio className="w-3.5 h-3.5" />
              FLEET TELEMETRY
              <span className="text-[10px] bg-slate-800/80 text-slate-500 px-1.5 py-0.2 rounded font-normal">
                Phase 1
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-600 px-3 py-1.5 cursor-not-allowed">
              <Cpu className="w-3.5 h-3.5" />
              AI DETECTIONS
              <span className="text-[10px] bg-slate-800/80 text-slate-500 px-1.5 py-0.2 rounded font-normal">
                Phase 3
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-600 px-3 py-1.5 cursor-not-allowed">
              <Database className="w-3.5 h-3.5" />
              POSTGRES MODELS
              <span className="text-[10px] bg-slate-800/80 text-slate-500 px-1.5 py-0.2 rounded font-normal">
                Phase 2
              </span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 bg-grid-pattern relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* System Boundary & Architecture Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080d19] py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>RescueHive Platform Core</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400/90 font-sans text-xs">
              Webots simulation is external to this repository and will be integrated through APIs in a later phase.
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>React + Vite</span>
            <span>•</span>
            <span>FastAPI</span>
            <span>•</span>
            <span>PostgreSQL Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
