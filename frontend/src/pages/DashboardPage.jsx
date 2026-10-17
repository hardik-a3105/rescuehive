import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  Bot, 
  MapPin, 
  UserCheck, 
  Flame, 
  ShieldAlert, 
  RefreshCw, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { DashboardCard } from '../components/common/DashboardCard';
import { MapView } from '../components/common/MapView';
import { RobotTable } from '../components/common/RobotTable';
import { DetectionTable } from '../components/common/DetectionTable';
import { AlertCard } from '../components/common/AlertCard';
import { MissionProgress } from '../components/common/MissionProgress';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/ui/Button';

export function DashboardPage() {
  const {
    robots,
    detections,
    alerts,
    missions,
    activeMission,
    dashboardSummary,
    loading,
    actionLoading,
    errors,
    updateRobotStatus,
    updateDetectionStatus,
    acknowledgeAlert,
    refreshAll,
    addNotification,
  } = useMission();

  const { isCommander } = useAuth();
  const [selectedRobotId, setSelectedRobotId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshFeeds = async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
      addNotification('Telemetry and mission intelligence feeds refreshed', 'success');
    } catch (err) {
      addNotification(`Failed to refresh feeds: ${err.message || 'Connection error'}`, 'error');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 700);
    }
  };

  // If initial load in progress with no data
  if (loading.dashboard && !dashboardSummary && missions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <LoadingState message="Loading RescueHive command center & mission intelligence..." />
      </div>
    );
  }

  // If backend connection error
  if (errors.dashboard && !dashboardSummary && missions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <ErrorState
          title="Unable to connect to RescueHive backend"
          message={errors.dashboard.message || 'Please check that the FastAPI server is running on port 8000.'}
          status={errors.dashboard.status}
          onRetry={handleRefreshFeeds}
        />
      </div>
    );
  }

  // Derive counts from backend summary with fallback to state arrays
  const activeMissionName = dashboardSummary?.active_mission || activeMission?.name || 'No Active Sortie';
  const activeRobotsCount = dashboardSummary?.active_robots ?? robots.filter((r) => (r.connection_status === 'CONNECTED' || r.connectionStatus === 'CONNECTED') && r.status !== 'OFFLINE').length;
  const totalRobotsCount = dashboardSummary?.total_robots ?? robots.length;
  const exploredArea = dashboardSummary?.explored_area ?? activeMission?.exploredAreaSqM ?? 0;
  const victimCount = dashboardSummary?.victim_count ?? detections.filter((d) => (d.type === 'Victim' || d.detection_type === 'PERSON') && d.status !== 'DISMISSED').length;
  const hazardCount = dashboardSummary?.hazard_count ?? detections.filter((d) => (d.type !== 'Victim' && d.detection_type !== 'PERSON' && d.type !== 'Emergency Exit' && d.detection_type !== 'EMERGENCY_EXIT') && d.status !== 'DISMISSED').length;
  const activeAlertsCount = dashboardSummary?.active_alerts ?? alerts.filter((a) => !a.acknowledged && a.status !== 'ACKNOWLEDGED').length;

  const formatDuration = (seconds) => {
    if (!seconds) return activeMission?.duration || '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const missionDuration = formatDuration(dashboardSummary?.mission_duration);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        subtitle={`Operational Overwatch • ${activeMissionName}`}
        badge={
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs border border-emerald-500/30 font-semibold uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            FastAPI Connected
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshFeeds}
              disabled={isRefreshing || loading.dashboard}
              className="font-mono text-xs gap-1.5 min-w-[130px] justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading.dashboard ? 'animate-spin text-cyan-400' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Feeds'}
            </Button>
          </div>
        }
      />

      {/* No Active Mission Notice */}
      {!activeMission && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>No active mission currently selected. Deploy a sortie in Missions Ops.</span>
          </div>
        </div>
      )}

      {/* 1. Mission Summary Cards (Connected to GET /dashboard/summary) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <DashboardCard
          title="Mission Status"
          value={activeMission?.status || 'STANDBY'}
          subtitle={`Operation: ${activeMission?.name ? String(activeMission.name).slice(0, 16) : 'None'}`}
          icon={Activity}
        />
        <DashboardCard
          title="Sortie Duration"
          value={missionDuration}
          subtitle="Real-time Sortie Clock"
          icon={Clock}
        />
        <DashboardCard
          title="Active Robots"
          value={`${activeRobotsCount} / ${totalRobotsCount}`}
          subtitle={`${Math.round((activeRobotsCount / (totalRobotsCount || 1)) * 100)}% Fleet Deployment`}
          icon={Bot}
        />
        <DashboardCard
          title="Exploration"
          value={`${Number(exploredArea).toLocaleString()} m²`}
          subtitle="Surveyed Surface Area"
          icon={MapPin}
        />
        <DashboardCard
          title="Victims Detected"
          value={victimCount}
          subtitle="Autonomous Vision Flag"
          icon={UserCheck}
        />
        <DashboardCard
          title="Active Hazards"
          value={hazardCount}
          subtitle={`${activeAlertsCount} Unack Alerts`}
          icon={Flame}
        />
      </div>

      {/* 2. Interactive Tactical Map Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Tactical Operational Map (GIS)
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              • Real-time Robotic Telemetry & Detection Coordinates
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            [DATA SOURCE: POSTGRESQL + FASTAPI]
          </span>
        </div>
        <MapView
          robots={robots}
          detections={detections}
          selectedRobotId={selectedRobotId}
          onSelectRobot={(id) => setSelectedRobotId(id)}
          onConfirmDetection={(id) => updateDetectionStatus(id, 'CONFIRMED')}
          onDismissDetection={(id) => updateDetectionStatus(id, 'DISMISSED')}
          onActionRobot={isCommander ? updateRobotStatus : null}
        />
      </div>

      {/* 3. Mission Progress & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Breakdown */}
        <div className="lg:col-span-1">
          <MissionProgress
            mission={activeMission}
            robotsCount={robots.length}
            victimsCount={victimCount}
            hazardsCount={hazardCount}
          />
        </div>

        {/* Emergency Alert Panel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Emergency Alert Stream (FastAPI)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {activeAlertsCount} active unacknowledged
            </span>
          </div>

          <div className="space-y-2.5">
            {alerts.length === 0 ? (
              <p className="text-xs font-mono text-slate-400 text-center py-6 border border-dashed border-slate-800 rounded-xl">
                No active tactical alerts. System running nominally.
              </p>
            ) : (
              alerts.slice(0, 4).map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  isLoading={actionLoading[`alert_${alert.id}`]}
                  onAcknowledge={acknowledgeAlert}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Robot Status (Table / Overview) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Fleet Status & Telemetry
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Click row to locate on tactical map
          </span>
        </div>
        <RobotTable
          robots={robots}
          onSelectRobot={(id) => setSelectedRobotId(id)}
          onAction={isCommander ? updateRobotStatus : null}
        />
      </div>

      {/* 5. Recent Detections Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Recent AI / Computer Vision Detections
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-500 dark:text-amber-400">
            Human-in-the-Loop Confirmation Required
          </span>
        </div>
        <DetectionTable
          detections={detections.slice(0, 6)}
          onConfirm={(id) => updateDetectionStatus(id, 'CONFIRMED')}
          onDismiss={(id) => updateDetectionStatus(id, 'DISMISSED')}
        />
      </div>
    </div>
  );
}
