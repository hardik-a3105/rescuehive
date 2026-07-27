import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  Bot,
  Map,
  Users,
  Flame,
  Camera,
  FileBarChart,
  BarChart3,
  History,
  Settings,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/constants/routes";
import type { Role } from "@/types/domain";

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: ["incident_commander", "system_administrator", "developer", "support"] },
  { label: "Mission", to: ROUTES.MISSION, icon: Radio, roles: ["field_operator", "incident_commander", "system_administrator"] },
  { label: "Robots", to: ROUTES.ROBOTS, icon: Bot, roles: ["field_operator", "incident_commander", "system_administrator", "developer"] },
  { label: "Map", to: ROUTES.MAP, icon: Map, roles: ["field_operator", "incident_commander", "system_administrator"] },
  { label: "Victims", to: ROUTES.VICTIMS, icon: Users, roles: ["incident_commander", "field_operator", "system_administrator"] },
  { label: "Hazards", to: ROUTES.HAZARDS, icon: Flame, roles: ["incident_commander", "field_operator", "system_administrator"] },
  { label: "Camera", to: ROUTES.CAMERA, icon: Camera, roles: ["field_operator", "incident_commander", "system_administrator"] },
  { label: "Reports", to: ROUTES.HISTORY, icon: FileBarChart, roles: ["incident_commander", "system_administrator"] },
  { label: "Analytics", to: ROUTES.ANALYTICS, icon: BarChart3, roles: ["incident_commander", "system_administrator", "developer"] },
  { label: "History", to: ROUTES.HISTORY, icon: History, roles: ["incident_commander", "system_administrator", "support"] },
  { label: "Admin", to: ROUTES.ADMIN, icon: ShieldCheck, roles: ["system_administrator"] },
  { label: "Settings", to: ROUTES.SETTINGS, icon: Settings, roles: ["support", "field_operator", "incident_commander", "system_administrator", "developer"] },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const role = useAuthStore((s) => s.user?.role);
  const items = NAV_ITEMS.filter((item) => !role || item.roles.includes(role));

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 border-r border-border bg-surface transition-all duration-200",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
        <ul className="space-y-1 px-2">
          {items.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-slate-400 hover:bg-card hover:text-slate-200 border border-transparent"
                  )
                }
                aria-label={item.label}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-2 space-y-1">
        <NavLink
          to="/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-card hover:text-slate-200"
        >
          <HelpCircle className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Help</span>}
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-card hover:text-slate-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
