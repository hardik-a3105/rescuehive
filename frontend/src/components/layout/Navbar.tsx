import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Settings, LogOut, User, CloudSun, Wifi, WifiOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useMissionStore } from "@/stores/missionStore";
import { useUIStore } from "@/stores/uiStore";
import { formatClock } from "@/utils/format";
import { roleLabel } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants/routes";

export function Navbar() {
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unread = useNotificationStore((s) => s.unreadCount);
  const activeMission = useMissionStore((s) => s.getActiveMission());
  const wsState = useUIStore((s) => s.wsConnectionState);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/40">
            <span className="text-primary font-bold text-sm">RH</span>
          </div>
          <span className="hidden sm:block font-semibold tracking-wide text-slate-200">RescueHive</span>
        </div>

        {activeMission && (
          <Badge variant={activeMission.status === "active" ? "live" : "muted"} className="hidden lg:flex">
            {activeMission.name}
          </Badge>
        )}
      </div>

      <div className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5">
        <Search className="h-4 w-4 text-muted" />
        <input
          placeholder="Search robots, missions, detections..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted" title="Connection status">
          {wsState === "open" ? (
            <Wifi className="h-3.5 w-3.5 text-live" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-warning animate-pulse" />
          )}
          <span className="capitalize">{wsState}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted">
          <CloudSun className="h-3.5 w-3.5" />
          <span>24°C Clear</span>
        </div>

        <div className="mono text-sm text-slate-300 hidden sm:block" aria-label="Mission clock">
          {formatClock(now)} UTC
        </div>

        <button
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          className="relative rounded-lg p-2 text-slate-400 hover:bg-card hover:text-slate-200"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate(ROUTES.SETTINGS)}
          className="rounded-lg p-2 text-slate-400 hover:bg-card hover:text-slate-200"
          aria-label="Settings"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 hover:bg-card"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/25 text-xs font-semibold text-primary">
              {user?.name.charAt(0) ?? "U"}
            </div>
            <div className="hidden xl:block text-left leading-tight">
              <p className="text-xs font-medium text-slate-200">{user?.name}</p>
              <p className="text-[10px] text-muted">{user ? roleLabel(user.role) : ""}</p>
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-30 w-48 rounded-lg border border-border bg-card shadow-glass">
              <button
                onClick={() => { setMenuOpen(false); navigate(ROUTES.PROFILE); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-surface"
              >
                <User className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={() => { setMenuOpen(false); navigate(ROUTES.SETTINGS); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-surface"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              <button
                onClick={() => { logout(); navigate(ROUTES.LOGIN); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-critical hover:bg-surface border-t border-border"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
