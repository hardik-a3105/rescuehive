import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { RobotCard } from "./RobotCard";
import { useRobotStore } from "@/stores/robotStore";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import type { RobotHealth } from "@/types/domain";

const FILTERS: Array<{ label: string; value: RobotHealth | "all" }> = [
  { label: "All", value: "all" },
  { label: "Nominal", value: "nominal" },
  { label: "Warning", value: "warning" },
  { label: "Critical", value: "critical" },
  { label: "Offline", value: "offline" },
];

export default function RobotsPage() {
  const robots = useRobotStore((s) => s.robots);
  const [filter, setFilter] = useState<RobotHealth | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return robots.filter((r) => {
      const matchesFilter = filter === "all" || r.health === filter;
      const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase()) || r.callsign.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [robots, filter, query]);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Robot Fleet</h1>
          <p className="text-sm text-muted">{robots.length} robots registered · {robots.filter(r=>r.health!=='offline').length} online</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fleet..."
            className="bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}>
            <Badge
              variant={filter === f.value ? "default" : "outline"}
              className={cn("cursor-pointer capitalize", filter === f.value && "border-primary")}
            >
              {f.label}
            </Badge>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((robot) => (
          <RobotCard key={robot.id} robot={robot} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted">No robots match the current filter.</p>
        )}
      </div>
    </div>
  );
}
