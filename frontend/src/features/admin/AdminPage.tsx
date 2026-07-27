import { useState } from "react";
import { Users, Bot, ShieldCheck, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_USERS } from "@/utils/mockData";
import { useRobotStore } from "@/stores/robotStore";
import { HealthBadge } from "@/components/common/HealthBadge";
import { roleLabel } from "@/utils/format";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const TABS = ["Users", "Fleet", "Permissions"] as const;

export default function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Users");
  const users = Object.values(MOCK_USERS);
  const robots = useRobotStore((s) => s.robots);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-slate-100">Admin Panel</h1>
        <Link to={ROUTES.SYSTEM_HEALTH}>
          <Button variant="outline"><Activity className="h-4 w-4" /> System Health</Button>
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

      {tab === "Users" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Manage Users</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="px-4 py-2.5 text-slate-200">{u.name}</td>
                    <td className="px-4 py-2.5 mono text-slate-400 text-xs">{u.email}</td>
                    <td className="px-4 py-2.5"><Badge>{roleLabel(u.role)}</Badge></td>
                    <td className="px-4 py-2.5">
                      <Button size="sm" variant="ghost">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "Fleet" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> Manage Fleet</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Robot</th>
                  <th className="px-4 py-2 font-medium">Callsign</th>
                  <th className="px-4 py-2 font-medium">Health</th>
                  <th className="px-4 py-2 font-medium">Battery</th>
                </tr>
              </thead>
              <tbody>
                {robots.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="px-4 py-2.5 text-slate-200">{r.name}</td>
                    <td className="px-4 py-2.5 mono text-xs text-slate-400">{r.callsign}</td>
                    <td className="px-4 py-2.5"><HealthBadge health={r.health} /></td>
                    <td className="px-4 py-2.5 mono text-slate-300">{Math.round(r.battery)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "Permissions" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Role Permissions</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Mission Control</th>
                  <th className="px-4 py-2 font-medium">Admin Panel</th>
                  <th className="px-4 py-2 font-medium">Dev Tools</th>
                </tr>
              </thead>
              <tbody>
                {["support", "field_operator", "incident_commander", "system_administrator", "developer"].map((r) => (
                  <tr key={r} className="border-b border-border/50">
                    <td className="px-4 py-2.5 text-slate-200">{roleLabel(r)}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={r !== "support" ? "success" : "muted"}>{r !== "support" ? "Allowed" : "Restricted"}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={r === "system_administrator" ? "success" : "muted"}>{r === "system_administrator" ? "Allowed" : "Restricted"}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={r === "developer" ? "success" : "muted"}>{r === "developer" ? "Allowed" : "Restricted"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
