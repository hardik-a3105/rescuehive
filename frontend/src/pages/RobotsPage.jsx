import React, { useState } from 'react';
import { 
  Bot, 
  RotateCcw, 
  SlidersHorizontal, 
  RefreshCw, 
  ShieldCheck, 
  Eye, 
  Loader2,
  MapPin,
  Activity,
  Battery
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import * as robotApi from '../services/api/robotApi';
import { PageHeader } from '../components/common/PageHeader';
import { RobotCard } from '../components/common/RobotCard';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/ui/Button';

export function RobotsPage() {
  const { robots, loading, errors, updateRobotStatus, fetchRobots, actionLoading } = useMission();
  const { isCommander } = useAuth();

  const [retaskRobot, setRetaskRobot] = useState(null);
  const [selectedTaskPreset, setSelectedTaskPreset] = useState('');
  const [customTask, setCustomTask] = useState('');

  // Inspect detail modal state (GET /robots/{id})
  const [inspectRobot, setInspectRobot] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const taskPresets = [
    'Autonomous thermal scanning in Sector 4B collapsed basement',
    'High-resolution 3D photogrammetry & roof structural survey',
    'Acoustic survivor listening array triangulation in Sector 4C',
    'Gas plume threshold monitoring & perimeter cordon verification',
    'Ingress route clearance inspection for human emergency responders',
  ];

  const handleInspect = async (robotId) => {
    setInspectLoading(true);
    setInspectRobot({ id: robotId, name: 'Loading...' });
    try {
      const data = await robotApi.getRobotById(robotId);
      setInspectRobot(data);
    } catch (err) {
      // Fallback to in-memory robot if specific fetch fails
      const fallback = robots.find((r) => r.id === robotId);
      setInspectRobot(fallback || { id: robotId, name: 'Robot' });
    } finally {
      setInspectLoading(false);
    }
  };

  const handleRetaskSubmit = async (e) => {
    e.preventDefault();
    const task = customTask || selectedTaskPreset || 'General autonomous reconnaissance';
    if (retaskRobot) {
      await updateRobotStatus(retaskRobot.id, 'ACTIVE', task);
      setRetaskRobot(null);
      setCustomTask('');
      setSelectedTaskPreset('');
    }
  };

  const handleRecallAll = async () => {
    for (const r of robots) {
      await updateRobotStatus(r.id, 'RETURNING', 'Autonomous RTL to staging depot');
    }
  };

  // Loading state
  if (loading.robots && robots.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <LoadingState message="Fetching registered robot fleet from FastAPI..." />
      </div>
    );
  }

  // Error state
  if (errors.robots && robots.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <ErrorState
          title="Fleet Telemetry Unavailable"
          message={errors.robots.message || 'Unable to retrieve robot records from PostgreSQL.'}
          status={errors.robots.status}
          onRetry={fetchRobots}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Robot Fleet Operations"
        subtitle="Tactical telemetry monitoring and teleoperation command overrides (PostgreSQL)"
        badge={
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs border border-emerald-500/30 font-semibold">
            {robots.length} UNITS SYNCED
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRobots}
              disabled={loading.robots}
              className="gap-1.5 font-mono text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading.robots ? 'animate-spin' : ''}`} />
              Sync Fleet
            </Button>
            {isCommander && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecallAll}
                className="gap-2 font-mono text-xs text-amber-500 hover:text-amber-400"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Recall All Units
              </Button>
            )}
          </div>
        }
      />

      {/* Fleet Overview Strip */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 font-mono text-xs grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">Total Fleet</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
            {robots.length} Robotic Units
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">Online Fleet</span>
          <span className="text-lg font-bold text-emerald-500 mt-0.5 block">
            {robots.filter((r) => (r.connection_status === 'CONNECTED' || r.connectionStatus === 'CONNECTED') && r.status !== 'OFFLINE').length} Units
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">Avg Battery</span>
          <span className="text-lg font-bold text-cyan-500 mt-0.5 block">
            {robots.length > 0
              ? Math.round(robots.reduce((acc, r) => acc + (r.battery || 0), 0) / robots.length)
              : 0}
            %
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">FastAPI Endpoint</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
            /api/v1/robots
          </span>
        </div>
      </div>

      {/* Robot Cards Grid or Empty State */}
      {robots.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No Robots Found"
          description="No robotic assets are currently registered in PostgreSQL."
          actionText="Refresh List"
          onAction={fetchRobots}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot) => (
            <RobotCard
              key={robot.id}
              robot={robot}
              onAction={isCommander ? updateRobotStatus : null}
              onRetask={
                isCommander
                  ? (r) => {
                      setRetaskRobot(r);
                      setSelectedTaskPreset(taskPresets[0]);
                    }
                  : null
              }
              onInspect={(r) => handleInspect(r.id)}
            />
          ))}
        </div>
      )}

      {/* Inspect Robot Details Modal (GET /robots/{id}) */}
      {inspectRobot && (
        <Modal
          isOpen={!!inspectRobot}
          onClose={() => setInspectRobot(null)}
          title={`Robot Telemetry Inspector — ${inspectRobot.name}`}
          subtitle={`Hardware ID: ${inspectRobot.robot_id || inspectRobot.id}`}
        >
          {inspectLoading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Operational Status</span>
                  <div className="mt-1">
                    <StatusBadge status={inspectRobot.status} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Battery Level</span>
                  <span className="text-sm font-bold text-emerald-400 mt-1 block">
                    {inspectRobot.battery ?? 100}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Coordinates (X, Y, Z)</span>
                  <span className="text-slate-200 font-bold mt-1 block">
                    ({inspectRobot.x?.toFixed?.(2) ?? 0}, {inspectRobot.y?.toFixed?.(2) ?? 0}, {inspectRobot.z?.toFixed?.(2) ?? 0})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Connection Link</span>
                  <span className="text-cyan-400 font-bold mt-1 block">
                    {inspectRobot.connection_status || 'CONNECTED'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block mb-1">Assigned Mission Task</span>
                <p className="text-slate-300 font-sans leading-relaxed">
                  {inspectRobot.current_task || 'No active task assigned.'}
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button variant="secondary" size="sm" onClick={() => setInspectRobot(null)}>
                  Close Telemetry
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Retask Modal */}
      {retaskRobot && (
        <Modal
          isOpen={!!retaskRobot}
          onClose={() => setRetaskRobot(null)}
          title={`Retask ${retaskRobot.name} (${retaskRobot.id})`}
          subtitle="Assign new tactical waypoint mission or mission priority override"
        >
          <form onSubmit={handleRetaskSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-2">
                Preset Mission Objectives:
              </label>
              <div className="space-y-2">
                {taskPresets.map((preset, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedTaskPreset === preset
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-medium'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preset"
                      checked={selectedTaskPreset === preset}
                      onChange={() => {
                        setSelectedTaskPreset(preset);
                        setCustomTask('');
                      }}
                      className="mt-0.5 accent-cyan-500"
                    />
                    <span>{preset}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Or Custom Objective Override:
              </label>
              <input
                type="text"
                placeholder="Enter specific search waypoint instructions..."
                value={customTask}
                onChange={(e) => {
                  setCustomTask(e.target.value);
                  setSelectedTaskPreset('');
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => setRetaskRobot(null)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="md"
                type="submit"
                disabled={actionLoading[`robot_${retaskRobot.id}`]}
              >
                {actionLoading[`robot_${retaskRobot.id}`] ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Dispatching...
                  </span>
                ) : (
                  'Dispatch Assignment'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
