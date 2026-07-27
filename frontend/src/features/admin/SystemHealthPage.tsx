import { useState } from "react";
import { Server, Database, Radio, Cpu, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { generateSystemHealth, generateLogs } from "@/utils/mockData";

export default function SystemHealthPage() {
  const [health] = useState(() => generateSystemHealth());
  const [logs] = useState(() => generateLogs(80));

  const statusVariant = (s: string) => (s === "operational" ? "success" : s === "degraded" ? "warning" : "critical");

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <h1 className="text-lg font-semibold text-slate-100">System Health</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Server className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted">API Status</p>
              <Badge variant={statusVariant(health.apiStatus)} className="capitalize mt-1">{health.apiStatus}</Badge>
              <p className="mono text-[11px] text-muted mt-1">{health.apiLatencyMs}ms latency</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-live/15">
              <Database className="h-4 w-4 text-live" />
            </div>
            <div>
              <p className="text-xs text-muted">Database</p>
              <Badge variant={statusVariant(health.dbStatus)} className="capitalize mt-1">{health.dbStatus}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15">
              <Radio className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted">WebSocket Gateway</p>
              <Badge variant={statusVariant(health.wsStatus)} className="capitalize mt-1">{health.wsStatus}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-warning" />
              <p className="text-xs text-muted">Server Load</p>
            </div>
            <Progress value={health.serverLoad} />
            <p className="mono text-[11px] text-muted mt-1">{health.serverLoad}% · {health.uptimePercent}% uptime</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Terminal className="h-4 w-4" /> System Logs</CardTitle></CardHeader>
        <CardContent className="p-0 max-h-[500px] overflow-y-auto scrollbar-thin">
          <ul className="divide-y divide-border/70 mono text-xs">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center gap-3 px-4 py-2">
                <span className="text-muted w-40 shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
                <Badge
                  variant={log.level === "error" ? "critical" : log.level === "warn" ? "warning" : "muted"}
                  className="w-14 justify-center shrink-0"
                >
                  {log.level}
                </Badge>
                <span className="text-slate-400 w-36 shrink-0 truncate">{log.source}</span>
                <span className="text-slate-200 truncate">{log.message}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
