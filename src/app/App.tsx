import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ROUTES } from "@/constants/routes";
import { Loader2 } from "lucide-react";

// Lazy-loaded route-level code splitting
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const MissionPage = lazy(() => import("@/features/missions/MissionPage"));
const RobotsPage = lazy(() => import("@/features/robots/RobotsPage"));
const MapPage = lazy(() => import("@/features/map/MapPage"));
const CameraPage = lazy(() => import("@/features/camera/CameraPage"));
const VictimsPage = lazy(() => import("@/features/detections/VictimsPage"));
const HazardsPage = lazy(() => import("@/features/detections/HazardsPage"));
const HistoryPage = lazy(() => import("@/features/missions/HistoryPage"));
const MissionDetailsPage = lazy(() => import("@/features/missions/MissionDetailsPage"));
const ReportPage = lazy(() => import("@/features/reports/ReportPage"));
const AnalyticsPage = lazy(() => import("@/features/analytics/AnalyticsPage"));
const NotificationsPage = lazy(() => import("@/features/settings/NotificationsPage"));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage"));
const ProfilePage = lazy(() => import("@/features/settings/ProfilePage"));
const AdminPage = lazy(() => import("@/features/admin/AdminPage"));
const SystemHealthPage = lazy(() => import("@/features/admin/SystemHealthPage"));
const NotFoundPage = lazy(() => import("@/features/errors/NotFoundPage"));
const ServerErrorPage = lazy(() => import("@/features/errors/ServerErrorPage"));
const UnauthorizedPage = lazy(() => import("@/features/errors/UnauthorizedPage"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function PageLoader() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
              <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
              <Route path="/500" element={<ServerErrorPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                  <Route path={ROUTES.MISSION} element={<MissionPage />} />
                  <Route path={ROUTES.ROBOTS} element={<RobotsPage />} />
                  <Route path={ROUTES.MAP} element={<MapPage />} />
                  <Route path={ROUTES.VICTIMS} element={<VictimsPage />} />
                  <Route path={ROUTES.HAZARDS} element={<HazardsPage />} />
                  <Route path={ROUTES.CAMERA} element={<CameraPage />} />
                  <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
                  <Route path="/history/:missionId" element={<MissionDetailsPage />} />
                  <Route path="/history/:missionId/report" element={<ReportPage />} />
                  <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
                  <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
                  <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                  <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

                  <Route element={<ProtectedRoute allowedRoles={["system_administrator"]} />}>
                    <Route path={ROUTES.ADMIN} element={<AdminPage />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={["system_administrator", "developer"]} />}>
                    <Route path={ROUTES.SYSTEM_HEALTH} element={<SystemHealthPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
