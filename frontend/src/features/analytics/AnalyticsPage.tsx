import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useRobotStore } from "@/stores/robotStore";
import { useMissionStore } from "@/stores/missionStore";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const coverageData = days.map((d) => ({ day: d, coverage: Math.round(40 + Math.random() * 55) }));
const detectionData = days.map((d) => ({ day: d, victims: Math.round(Math.random() * 8), hazards: Math.round(Math.random() * 5) }));
const batteryData = days.map((d) => ({ day: d, battery: Math.round(50 + Math.random() * 40) }));
const accuracyData = days.map((d) => ({ day: d, accuracy: Math.round(78 + Math.random() * 18) }));
const speedData = days.map((d) => ({ day: d, speed: Number((0.6 + Math.random() * 1.2).toFixed(2)) }));

const chartTooltip = { contentStyle: { background: "#1E293B", border: "1px solid #243244", fontSize: 12, borderRadius: 8 } };
const axisStyle = { fill: "#94A3B8", fontSize: 11 };

export default function AnalyticsPage() {
  const robots = useRobotStore((s) => s.robots);
  const missions = useMissionStore((s) => s.missions);

  const healthCounts = ["nominal", "warning", "critical", "offline"].map((h) => ({
    health: h,
    count: robots.filter((r) => r.health === h).length,
  }));

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Analytics</h1>
        <p className="text-sm text-muted">Fleet performance and mission trends across {missions.length} missions</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Area Coverage Trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" />
                <XAxis dataKey="day" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip {...chartTooltip} />
                <Area type="monotone" dataKey="coverage" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Detections (Victims vs Hazards)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" />
                <XAxis dataKey="day" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip {...chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="victims" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hazards" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Average Fleet Battery</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={batteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" />
                <XAxis dataKey="day" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip {...chartTooltip} />
                <Line type="monotone" dataKey="battery" stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Robot Health Distribution</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthCounts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" />
                <XAxis type="number" tick={axisStyle} />
                <YAxis dataKey="health" type="category" tick={axisStyle} width={70} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Detection Accuracy</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" />
                <XAxis dataKey="day" tick={axisStyle} />
                <YAxis domain={[0, 100]} tick={axisStyle} />
                <Tooltip {...chartTooltip} />
                <Area type="monotone" dataKey="accuracy" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Exploration Speed (m/s)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" />
                <XAxis dataKey="day" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip {...chartTooltip} />
                <Line type="monotone" dataKey="speed" stroke="#2563EB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
