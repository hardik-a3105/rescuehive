import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Download, ChevronRight } from "lucide-react";
import { useMissionStore } from "@/stores/missionStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDuration } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { MissionStatus } from "@/types/domain";

const statusVariant: Record<MissionStatus, "live" | "warning" | "success" | "critical" | "muted"> = {
  active: "live",
  planning: "muted",
  paused: "warning",
  completed: "success",
  aborted: "critical",
};

export default function HistoryPage() {
  const missions = useMissionStore((s) => s.missions);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MissionStatus | "all">("all");

  const filtered = useMemo(
    () =>
      missions.filter(
        (m) =>
          (status === "all" || m.status === status) &&
          (m.name.toLowerCase().includes(query.toLowerCase()) || m.location.toLowerCase().includes(query.toLowerCase()))
      ),
    [missions, query, status]
  );

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Mission History</h1>
          <p className="text-sm text-muted">{missions.length} missions on record</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search missions..."
            className="bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "paused", "completed", "aborted"] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)}>
            <Badge variant={status === s ? "default" : "outline"} className={cn("cursor-pointer capitalize", status === s && "border-primary")}>
              {s}
            </Badge>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-[180px] flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-100">{m.name}</p>
                  <Badge variant={statusVariant[m.status]} className="capitalize">{m.status}</Badge>
                </div>
                <p className="text-xs text-muted mt-0.5">{m.location} · {m.searchAreaKm2} km²</p>
              </div>
              <div className="flex gap-6 text-xs text-center">
                <div>
                  <p className="mono text-slate-200">{formatDuration(m.startedAt, m.endedAt)}</p>
                  <p className="text-muted">Duration</p>
                </div>
                <div>
                  <p className="mono text-slate-200">{m.victimsFound}</p>
                  <p className="text-muted">Victims</p>
                </div>
                <div>
                  <p className="mono text-slate-200">{m.hazardsFound}</p>
                  <p className="text-muted">Hazards</p>
                </div>
                <div>
                  <p className="mono text-slate-200">{Math.round(m.areaCoverage)}%</p>
                  <p className="text-muted">Coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Export</Button>
                <Link to={`/history/${m.id}`}>
                  <Button size="sm" variant="outline">
                    Details <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted">No missions match your search.</p>}
      </div>
    </div>
  );
}
