import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  Database, 
  Cpu, 
  Terminal, 
  Bot, 
  ShieldCheck, 
  ArrowUpRight,
  Sparkles,
  FileCode2,
  Box
} from 'lucide-react';
import { useSystemHealth } from '../hooks/useSystemHealth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function HomePage() {
  const { connected, loading, data, error, latency, lastChecked, refresh } = useSystemHealth();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-mono tracking-wider text-cyan-400 uppercase font-semibold">
                Phase 0 Milestone Complete
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              RescueHive Project Foundation
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Clean, modular architecture established for the AI-Powered Multi-Robot Disaster Intelligence System.
              Frontend and FastAPI services are operational with database and simulator boundaries configured.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={refresh}
              className="gap-2 font-mono text-xs"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Test API Health
            </Button>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="md" className="gap-2 font-mono text-xs">
                Swagger Docs
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Live Backend Diagnostics + Database Foundation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend API Health Status Card */}
        <Card glow={connected} className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>
                <Server className="w-4 h-4 text-cyan-400" />
                Backend Service Diagnostics
              </CardTitle>
              <Badge variant={connected ? 'success' : loading ? 'warning' : 'danger'}>
                {loading ? 'CHECKING...' : connected ? 'HEALTHY' : 'UNREACHABLE'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Endpoint:</span>
                  <span className="text-cyan-400 font-semibold">GET /api/v1/health</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Response Status:</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    {connected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">"{data?.status || 'ok'}"</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-400">Failed</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Service Identifier:</span>
                  <span className="text-slate-200">
                    {data?.service || (connected ? 'rescuehive-backend' : '—')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Round-trip Latency:</span>
                  <span className="text-slate-300">
                    {latency !== null ? `${latency} ms` : '—'}
                  </span>
                </div>

                {error && (
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/60 text-rose-300 text-[11px]">
                    Error: {error}
                  </div>
                )}
              </div>
            </CardContent>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>FastAPI ASGI Core</span>
            <span>{lastChecked ? new Date(lastChecked).toLocaleTimeString() : 'Awaiting check'}</span>
          </div>
        </Card>

        {/* Database Foundation Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>
                <Database className="w-4 h-4 text-emerald-400" />
                PostgreSQL Architecture Layer
              </CardTitle>
              <Badge variant="primary">SQLAlchemy 2.0</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 mb-3 font-sans leading-relaxed">
                Database foundation established using SQLAlchemy connection pooling and declarative base. 
                Ready for model mapping in Phase 2 without hard coupling in Phase 0.
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Driver / Dialect:</span>
                  <span className="text-emerald-400 font-semibold">PostgreSQL (psycopg2)</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Session Engine:</span>
                  <span className="text-slate-300">app.db.session.SessionLocal</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Declarative Base:</span>
                  <span className="text-slate-300">app.db.base.Base</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-cyan-400 font-medium">Prepared for Phase 2 Models</span>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
            Models to be registered: Users, Robots, Missions, Detections
          </div>
        </Card>
      </div>

      {/* Project Structure & Verification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Frontend Architecture */}
        <Card>
          <CardHeader>
            <CardTitle>
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              Frontend Foundation
            </CardTitle>
            <Badge variant="outline">React + Vite</Badge>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Tailwind CSS & dark-mode theme</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>shadcn/ui inspired primitives (Card, Badge, Button)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>React Router DOM navigation shell</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Lucide React mission-control iconography</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Vision Boundary */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Cpu className="w-4 h-4 text-amber-400" />
              AI Pipeline Boundary
            </CardTitle>
            <Badge variant="warning">Phase 3</Badge>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><code>ai/detection/</code> (YOLO victim & hazard)</span>
            </div>
            <div className="flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><code>ai/segmentation/</code> (SAM 2 disaster zones)</span>
            </div>
            <div className="flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><code>ai/depth/</code> (MiDaS traversability)</span>
            </div>
            <div className="flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><code>ai/models/</code> (Model weights directory)</span>
            </div>
          </CardContent>
        </Card>

        {/* Simulator Boundary */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Bot className="w-4 h-4 text-rose-400" />
              Simulator Boundary
            </CardTitle>
            <Badge variant="danger">External</Badge>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Maintained by external team member</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Webots controllers excluded from repo</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Phase 4: Telemetry via WebSocket</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Phase 4: Camera streams via WebRTC/HLS</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Terminal Box */}
      <div className="rounded-xl bg-[#050811] border border-slate-800 p-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-500">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">PHASE 0 EXECUTION VERIFICATION</span>
          </div>
          <span className="text-[11px] text-emerald-400">READY</span>
        </div>
        <div className="space-y-1 text-slate-400">
          <p className="text-slate-500">// Run backend with auto-reload:</p>
          <p className="text-cyan-300 select-all">$ uvicorn app.main:app --reload</p>
          <p className="text-slate-500 pt-2">// Run frontend development server:</p>
          <p className="text-cyan-300 select-all">$ npm run dev</p>
          <p className="text-slate-500 pt-2">// Automated health check route:</p>
          <p className="text-emerald-400 select-all">$ curl http://localhost:8000/api/v1/health</p>
          <p className="text-slate-300 pl-4">=&gt; {JSON.stringify({ status: "ok", service: "rescuehive-backend" })}</p>
        </div>
      </div>
    </div>
  );
}
