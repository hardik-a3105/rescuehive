import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Download, MapPinned, Users, Flame, Bot, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMissionStore } from "@/stores/missionStore";
import { useDetectionStore } from "@/stores/detectionStore";
import { useRobotStore } from "@/stores/robotStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDuration } from "@/utils/format";
import { ROUTES } from "@/constants/routes";

const COLORS = ["#EF4444", "#F59E0B", "#22C55E", "#2563EB"];

export default function ReportPage() {
  const { missionId } = useParams();
  const mission = useMissionStore((s) => s.missions.find((m) => m.id === missionId));
  const victims = useDetectionStore((s) => s.victims.filter((v) => v.missionId === missionId));
  const hazards = useDetectionStore((s) => s.hazards.filter((h) => h.missionId === missionId));
  const robots = useRobotStore((s) => s.robots);

  if (!mission) return <Navigate to={ROUTES.HISTORY} replace />;

  const priorityData = ["critical", "high", "medium", "low"].map((p) => ({
    name: p,
    value: victims.filter((v) => v.priority === p).length,
  }));

  const coverageTrend = Array.from({ length: 8 }).map((_, i) => ({
    hour: `T+${i}h`,
    coverage: Math.min(100, Math.round((mission.areaCoverage / 8) * (i + 1))),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 lg:p-6">
      <Link to={`/history/${mission.id}`} className="flex items-center gap-1.5 text-sm text-muted hover:text-slate-200 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to mission
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-slate-100">AI Mission Report</h1>
        </div>
        <Button variant="outline"><Download className="h-4 w-4" /> Export PDF</Button>
      </div>

      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs font-medium text-warning">
        AI Generated Recommendation — For Human Review Only
      </div>

      <Card>
        <CardHeader><CardTitle>Mission Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <p>
            {mission.name} covered {mission.location} across a {mission.searchAreaKm2} km² search area, reaching{" "}
            {Math.round(mission.areaCoverage)}% area coverage over {formatDuration(mission.startedAt, mission.endedAt)}.
            The fleet identified {victims.length} potential victim locations and {hazards.length} hazards, with an
            average fleet battery level of {mission.averageBattery}%.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            {[
              { icon: Clock, label: "Duration", value: formatDuration(mission.startedAt, mission.endedAt) },
              { icon: MapPinned, label: "Coverage", value: `${Math.round(mission.areaCoverage)}%` },
              { icon: Users, label: "Victims", value: victims.length },
              { icon: Flame, label: "Hazards", value: hazards.length },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-surface p-3 text-center">
                <s.icon className="mx-auto h-4 w-4 text-muted mb-1" />
                <p className="mono text-lg font-semibold text-slate-100">{s.value}</p>
                <p className="text-[11px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Victim Priority Breakdown</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {priorityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #243244", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Coverage Timeline</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={coverageTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" />
                <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #243244", fontSize: 12 }} />
                <Line type="monotone" dataKey="coverage" stroke="#2563EB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> Robot Statistics</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium">Robot</th>
                <th className="px-4 py-2 font-medium">Distance</th>
                <th className="px-4 py-2 font-medium">Avg Battery</th>
                <th className="px-4 py-2 font-medium">Health</th>
              </tr>
            </thead>
            <tbody>
              {robots.slice(0, 6).map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="px-4 py-2 text-slate-200">{r.name}</td>
                  <td className="px-4 py-2 mono text-slate-300">{r.distanceTravelled}m</td>
                  <td className="px-4 py-2 mono text-slate-300">{r.battery}%</td>
                  <td className="px-4 py-2 capitalize text-slate-300">{r.health}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI Recommendations</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Prioritize dispatch of ground response teams to critical-priority victim coordinates first.</li>
            <li>Re-route search robots away from confirmed severe hazard zones until cleared by hazmat teams.</li>
            <li>Consider extending search radius in low-coverage sectors before concluding the mission.</li>
          </ul>
          <p className="mt-3 text-xs text-warning">These recommendations are generated by AI and must be reviewed by a human before acting.</p>
        </CardContent>
      </Card>
    </div>
  );
}
