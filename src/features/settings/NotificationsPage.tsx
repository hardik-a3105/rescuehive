import { CheckCheck, Bot, Users, Flame, Radio, Settings as SettingsIcon } from "lucide-react";
import { useNotificationStore } from "@/stores/notificationStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/format";
import type { AppNotification } from "@/types/domain";

const categoryIcon: Record<AppNotification["category"], typeof Bot> = {
  robot: Bot,
  detection: Users,
  hazard: Flame,
  mission: Radio,
  system: SettingsIcon,
};

const severityVariant = { info: "default", success: "success", warning: "warning", critical: "critical" } as const;

export default function NotificationsPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markRead = useNotificationStore((s) => s.markRead);

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Notifications</h1>
          <p className="text-sm text-muted">{notifications.filter((n) => !n.read).length} unread</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <CheckCheck className="h-3.5 w-3.5" /> Mark all read
        </Button>
      </div>

      <ul className="space-y-2">
        {notifications.map((n) => {
          const Icon = categoryIcon[n.category];
          return (
            <li
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                n.read ? "border-border bg-card/40" : "border-primary/30 bg-card"
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                <Icon className="h-4 w-4 text-slate-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200">{n.title}</p>
                  <Badge variant={severityVariant[n.severity]} className="capitalize">{n.severity}</Badge>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted mt-0.5">{n.message}</p>
                <p className="text-[11px] text-muted mt-1">{formatRelativeTime(n.timestamp)}</p>
              </div>
            </li>
          );
        })}
        {notifications.length === 0 && <p className="py-10 text-center text-sm text-muted">No notifications yet.</p>}
      </ul>
    </div>
  );
}
