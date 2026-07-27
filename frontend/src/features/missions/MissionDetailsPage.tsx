import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, FileBarChart, PlayCircle } from "lucide-react";
import { useMissionStore } from "@/stores/missionStore";
import { useDetectionStore } from "@/stores/detectionStore";
import { generateLogs } from "@/utils/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDuration, formatRelativeTime } from "@/utils/format";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";

const TABS = ["Overview", "Logs", "Images", "Statistics", "Replay"] as const;

export default function MissionDetailsPage() {
  const { missionId } = useParams();
  const mission = useMissionStore((s) => s.missions.find((m) => m.id === missionId));
  const victims = useDetectionStore((s) => s.victims.filter((v) => v.missionId === missionId));
  const hazards = useDetectionStore((s) => s.hazards.filter((h) => h.missionId === missionId));
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [logs] = useState(() => generateLogs(60));

  if (!mission) return <Navigate to={ROUTES.HISTORY} replace />;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <Link to={ROUTES.HISTORY} className="flex items-center gap-1.5 text-sm text-muted hover:text-slate-200 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to history
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">{mission.name}</h1>
          <p className="text-sm text-muted">{mission.location} · {formatDuration(mission.startedAt, mission.endedAt)}</p>
        </div>
        <Link to={`/history/${mission.id}/report`}>
          <Button><FileBarChart className="h-4 w-4" /> View AI Report</Button>
        </Link>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-2 text-sm border-b-2 -mb-px",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-slate-300"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Area Coverage", `${Math.round(mission.areaCoverage)}%`],
            ["Robots Deployed", mission.robotsActive],
            ["Victims Found", victims.length],
            ["Hazards Found", hazards.length],
          ].map(([label, value]) => (
            <Card key={label as string}>
              <CardContent className="p-4">
                <p className="text-xs text-muted">{label}</p>
                <p className="mono text-xl font-semibold text-slate-100 mt-1">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "Logs" && (
        <Card>
          <CardHeader><CardTitle>Mission Logs</CardTitle></CardHeader>
          <CardContent className="p-0 max-h-[500px] overflow-y-auto scrollbar-thin">
            <ul className="divide-y divide-border/70 mono text-xs">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center gap-3 px-4 py-2">
                  <span className="text-muted w-16 shrink-0">{formatRelativeTime(log.timestamp)}</span>
                  <Badge
                    variant={log.level === "error" ? "critical" : log.level === "warn" ? "warning" : "muted"}
                    className="w-14 justify-center shrink-0"
                  >
                    {log.level}
                  </Badge>
                  <span className="text-slate-400 w-32 shrink-0 truncate">{log.source}</span>
                  <span className="text-slate-200 truncate">{log.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {tab === "Images" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[...victims, ...hazards].slice(0, 24).map((item) => (
            <img key={item.id} src={item.imageUrl} alt="Mission capture" className="aspect-square w-full rounded-lg object-cover border border-border" />
          ))}
        </div>
      )}

      {tab === "Statistics" && (
        <Card>
          <CardContent className="p-6 text-sm text-muted">
            Detailed statistics charts are available on the <Link to="/analytics" className="text-primary hover:underline">Analytics</Link> page, filtered for this mission.
          </CardContent>
        </Card>
      )}

      {tab === "Replay" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <PlayCircle className="h-10 w-10 text-muted" />
            <p className="text-sm text-slate-300">Mission replay engine</p>
            <p className="text-xs text-muted max-w-xs">
              Frame-by-frame telemetry and detection replay will render here once the recorded mission log format is finalized with the backend team.
            </p>
            <Button variant="outline" disabled>Replay unavailable</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
