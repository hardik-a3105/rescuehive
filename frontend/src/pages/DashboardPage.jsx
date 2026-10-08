import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  Bot, 
  MapPin, 
  UserCheck, 
  Flame, 
  ShieldAlert, 
  Compass, 
  RefreshCw, 
  ExternalLink 
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { PageHeader } from '../components/common/PageHeader';
import { DashboardCard } from '../components/common/DashboardCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { MapView } from '../components/common/MapView';
import { RobotTable } from '../components/common/RobotTable';
import { DetectionTable } from '../components/common/DetectionTable';
import { AlertCard } from '../components/common/AlertCard';
import { MissionProgress } from '../components/common/MissionProgress';
import { Button } from '../components/ui/Button';

export function DashboardPage() {
  const {
    robots,
    detections,
    alerts,
    activeMission,
    updateRobotStatus,
    updateDetectionStatus,
    acknowledgeAlert,
  } = useMission();

  const [selectedRobotId, setSelectedRobotId] = useState(null);

  const activeRobots = robots.filter((r) => r.status === 'ACTIVE' || r.status === 'EXPLORING');
  const victimsCount = detections.filter((d) => d.type === 'Victim' && d.status !== 'DISMISSED').length;
  const hazardsCount = detections.filter((d) => d.type !== 'Victim' && d.type !== 'Emergency Exit' && d.status !== 'DISMISSED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        subtitle={`Operational Overwatch • ${activeMission?.name}`}
        badge={
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs border border-cyan-500/30 font-semibold uppercase">
            SIMULATION MODE
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              Refreshed: live 10Hz
            </span>
          </div>
        }
      />

      {/* 1. Mission Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <DashboardCard
          title="Mission Status"
          value={activeMission?.status}
          subtitle="Priority: CRITICAL"
          icon={Activity}
        />
        <DashboardCard
          title="Duration"
          value={activeMission?.duration}
          subtitle="Started: 21:00:00"
          icon={Clock}
        />
        <DashboardCard
          title="Active Robots"
          value={`${activeRobots.length} / ${robots.length}`}
          subtitle="100% Mesh Health"
          icon={Bot}
        />
        <DashboardCard
          title="Exploration"
          value={`${activeMission?.exploredAreaPercent}%`}
          subtitle={`${activeMission?.exploredAreaSqM?.toLocaleString()} m² surveyed`}
          icon={MapPin}
        />
        <DashboardCard
          title="Victims Detected"
          value={victimsCount}
          subtitle="3 Confirmed, 1 Pending"
          icon={UserCheck}
        />
        <DashboardCard
          title="Hazards Flagged"
          value={hazardsCount}
          subtitle="Fire & Pressurized LPG"
          icon={Flame}
        />
      </div>

      {/* 2. Interactive Live Map Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Tactical Operational Map (GIS)
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              • Simulated GPS & LiDAR Odometry
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-500 dark:text-amber-400 font-semibold">
            [DATA SOURCE: MOCK SIMULATION]
          </span>
        </div>
        <MapView
          robots={robots}
          detections={detections}
          selectedRobotId={selectedRobotId}
          onSelectRobot={(id) => setSelectedRobotId(id)}
        />
      </div>

      {/* 3. Mission Progress & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Breakdown */}
        <div className="lg:col-span-1">
          <MissionProgress
            mission={activeMission}
            robotsCount={robots.length}
            victimsCount={victimsCount}
            hazardsCount={hazardsCount}
          />
        </div>

        {/* 5. Emergency Alert Panel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Emergency Alert Stream
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {alerts.filter((a) => !a.acknowledged).length} active alerts
            </span>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={acknowledgeAlert}
              />
            ))}
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
          onAction={updateRobotStatus}
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
          detections={detections.slice(0, 5)}
          onConfirm={(id) => updateDetectionStatus(id, 'CONFIRMED')}
          onDismiss={(id) => updateDetectionStatus(id, 'DISMISSED')}
        />
      </div>
    </div>
  );
}
