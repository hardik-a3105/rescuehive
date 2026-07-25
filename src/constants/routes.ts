export const ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  MISSION: "/mission",
  ROBOTS: "/robots",
  MAP: "/map",
  VICTIMS: "/victims",
  HAZARDS: "/hazards",
  CAMERA: "/camera",
  HISTORY: "/history",
  MISSION_DETAILS: "/history/:missionId",
  REPORT: "/history/:missionId/report",
  ANALYTICS: "/analytics",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  ADMIN: "/admin",
  SYSTEM_HEALTH: "/admin/system-health",
  UNAUTHORIZED: "/unauthorized",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  support: "Support",
  field_operator: "Field Operator",
  incident_commander: "Incident Commander",
  system_administrator: "System Administrator",
  developer: "Developer",
};

// Which roles can access which nav items — used by RoleGuard + Sidebar.
export const ROLE_HOME: Record<string, string> = {
  support: ROUTES.DASHBOARD,
  field_operator: ROUTES.MISSION,
  incident_commander: ROUTES.DASHBOARD,
  system_administrator: ROUTES.ADMIN,
  developer: ROUTES.SYSTEM_HEALTH,
};
