import React, { useState } from 'react';
import { 
  Compass, 
  Play, 
  Pause, 
  Square, 
  Plus, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  Circle, 
  ShieldAlert,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/ui/Button';

export function MissionsPage() {
  const { 
    missions, 
    activeMissionId, 
    setActiveMissionId, 
    updateMissionStatus, 
    createMission,
    fetchMissions,
    loading,
    actionLoading,
    errors 
  } = useMission();

  const { isCommander } = useAuth();
  const { formatArea } = useSettings();

  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMissionName, setNewMissionName] = useState('');
  const [newMissionDesc, setNewMissionDesc] = useState('');
  const [createError, setCreateError] = useState(null);

  const selectedMission =
    missions.find((m) => m.id === activeMissionId) ||
    missions[0] ||
    null;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);
    try {
      await createMission({
        name: newMissionName.trim(),
        description: newMissionDesc.trim(),
      });
      setShowCreateModal(false);
      setNewMissionName('');
      setNewMissionDesc('');
    } catch (err) {
      setCreateError(err.message || 'Failed to create mission.');
    }
  };

  // Loading state
  if (loading.missions && missions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <LoadingState message="Querying active missions from PostgreSQL..." />
      </div>
    );
  }

  // Error state
  if (errors.missions && missions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <ErrorState
          title="Mission Operations Unreachable"
          message={errors.missions.message || 'Unable to connect to FastAPI mission services.'}
          status={errors.missions.status}
          onRetry={fetchMissions}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Mission Operations & Log"
        subtitle="Manage active search & rescue sorties and review completed historical deployments (FastAPI)"
        badge={
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs border border-cyan-500/30 font-semibold">
            {missions.length} MISSIONS LOGGED
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMissions}
              disabled={loading.missions}
              className="gap-1.5 font-mono text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading.missions ? 'animate-spin' : ''}`} />
              Sync
            </Button>

            {isCommander && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="gap-1.5 font-mono text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Mission
              </Button>
            )}
          </div>
        }
      />

      {missions.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No Missions Initialized"
          description="There are currently no missions recorded in the database. Create a mission to deploy robotic sorties."
          actionText={isCommander ? "Create New Mission" : null}
          onAction={isCommander ? () => setShowCreateModal(true) : null}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mission List Column */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Operation
            </h3>

            <div className="space-y-2.5">
              {missions.map((mission) => {
                const isSelected = selectedMission?.id === mission.id;
                return (
                  <div
                    key={mission.id}
                    onClick={() => setActiveMissionId(mission.id)}
                    className={`p-4 rounded-xl border text-xs font-mono cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-md ring-1 ring-cyan-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                      <div className="truncate mr-2">
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold block">
                          {mission.code}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {mission.name}
                        </h4>
                      </div>
                      <StatusBadge status={mission.status} />
                    </div>

                    <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span>Robots Assigned:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{mission.assignedRobotsText || 'Alpha'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Duration:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{mission.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Surveyed Area:</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                          {formatArea(mission.exploredAreaSqM)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Objectives:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{mission.completedObjectivesText}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mission Details Panel */}
          {selectedMission && (
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm dark:shadow-xl space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-500 uppercase">
                        {selectedMission.code} • {selectedMission.type}
                      </span>
                      <StatusBadge status={selectedMission.status} />
                    </div>
                    <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                      {selectedMission.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                      {selectedMission.description || 'No detailed mission directive specified.'}
                    </p>
                  </div>

                  {/* Mission Control Action Buttons */}
                  <div className="flex items-center flex-wrap gap-2">
                    {/* PLANNED: Can Start */}
                    {selectedMission.status === 'PLANNED' && (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={!isCommander || actionLoading[`mission_${selectedMission.id}_ACTIVE`]}
                        onClick={() => updateMissionStatus(selectedMission.id, 'ACTIVE')}
                        className="gap-1.5 font-mono text-xs"
                      >
                        {actionLoading[`mission_${selectedMission.id}_ACTIVE`] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        Start Mission
                      </Button>
                    )}

                    {/* ACTIVE: Can Pause and Stop */}
                    {selectedMission.status === 'ACTIVE' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!isCommander || actionLoading[`mission_${selectedMission.id}_PAUSED`]}
                          onClick={() => updateMissionStatus(selectedMission.id, 'PAUSED')}
                          className="gap-1.5 font-mono text-xs"
                        >
                          {actionLoading[`mission_${selectedMission.id}_PAUSED`] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Pause className="w-3.5 h-3.5" />
                          )}
                          Pause Mission
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          disabled={!isCommander}
                          onClick={() => setShowStopDialog(true)}
                          className="gap-1.5 font-mono text-xs"
                        >
                          <Square className="w-3.5 h-3.5" />
                          Stop Mission
                        </Button>
                      </>
                    )}

                    {/* PAUSED: Can Resume and Stop */}
                    {selectedMission.status === 'PAUSED' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={!isCommander || actionLoading[`mission_${selectedMission.id}_RESUMED`]}
                          onClick={() => updateMissionStatus(selectedMission.id, 'RESUMED')}
                          className="gap-1.5 font-mono text-xs"
                        >
                          {actionLoading[`mission_${selectedMission.id}_RESUMED`] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          Resume Mission
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          disabled={!isCommander}
                          onClick={() => setShowStopDialog(true)}
                          className="gap-1.5 font-mono text-xs"
                        >
                          <Square className="w-3.5 h-3.5" />
                          Stop Mission
                        </Button>
                      </>
                    )}

                    {/* Finalized: COMPLETED or ABORTED */}
                    {(selectedMission.status === 'COMPLETED' || selectedMission.status === 'ABORTED') && (
                      <span className="text-[11px] font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        Mission Finalized (Controls Locked)
                      </span>
                    )}
                  </div>
                </div>

                {/* Role Warning for Field Operators */}
                {!isCommander && (
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Mission launch/stop controls require Incident Commander or Admin authority.</span>
                  </div>
                )}

                {/* Tactical Grid Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block">Mission Status</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                      {selectedMission.status}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block">Duration</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                      {selectedMission.duration}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block">Surveyed Area</span>
                    <span className="font-bold text-cyan-500 mt-1 block">
                      {formatArea(selectedMission.exploredAreaSqM)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block">Robots Assigned</span>
                    <span className="font-bold text-slate-200 mt-1 block truncate" title={selectedMission.assignedRobotsText}>
                      {selectedMission.assignedRobotsText || 'Alpha and Bravo'}
                    </span>
                  </div>
                </div>

                {/* Tactical Objectives Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Mission Objectives ({selectedMission.completedObjectivesText})
                    </h4>
                    <span className="text-[11px] font-mono text-cyan-500 font-semibold">
                      {selectedMission.objectives?.filter((o) => o.completed).length} / {selectedMission.objectives?.length} Completed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedMission.objectives?.map((obj, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs font-sans ${
                          obj.completed
                            ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-800 dark:text-slate-200'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {obj.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className={obj.completed ? 'font-medium' : ''}>
                            {idx + 1}. {obj.text}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                          obj.completed
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {obj.completed ? 'completed' : 'pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stop Mission Confirm Dialog */}
      {selectedMission && (
        <ConfirmDialog
          isOpen={showStopDialog}
          onClose={() => setShowStopDialog(false)}
          onConfirm={() => {
            updateMissionStatus(selectedMission.id, 'COMPLETED');
            setShowStopDialog(false);
          }}
          title="Finalize Sortie Deployment"
          description={`Are you sure you want to stop '${selectedMission.name}'? This will mark the mission as COMPLETED in PostgreSQL and park all robots.`}
          confirmText="Confirm Stop"
          variant="danger"
        />
      )}

      {/* Create Mission Modal (POST /missions) */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Initialize New Search & Rescue Sortie"
          subtitle="Registers a new operational mission in PostgreSQL (FastAPI)"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 font-mono text-xs">
            {createError && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                {createError}
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1">Mission Codename:</label>
              <input
                type="text"
                placeholder="e.g. Operation Aegis Shield"
                value={newMissionName}
                onChange={(e) => setNewMissionName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Mission Directive / Description:</label>
              <textarea
                rows={3}
                placeholder="Deployment objective: Swarm autonomous reconnaissance across collapsed building sectors..."
                value={newMissionDesc}
                onChange={(e) => setNewMissionDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="md"
                type="submit"
                disabled={actionLoading.create_mission || !newMissionName.trim()}
              >
                {actionLoading.create_mission ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Initializing...
                  </span>
                ) : (
                  'Deploy Mission'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
