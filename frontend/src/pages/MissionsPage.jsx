import React, { useState } from 'react';
import { 
  Compass, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  MapPin, 
  Bot, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  User, 
  Calendar 
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';

export function MissionsPage() {
  const { missions, activeMissionId, setActiveMissionId, updateMissionStatus, activeMission } = useMission();
  const [showStopDialog, setShowStopDialog] = useState(false);

  const selectedMission = missions.find((m) => m.id === activeMissionId) || missions[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Mission Operations & Log"
        subtitle="Manage active search & rescue sorties and review completed historical deployments"
        badge={
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs border border-cyan-500/30 font-semibold">
            {missions.length} MISSIONS LOGGED
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission List Column */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Operation
          </h3>

          <div className="space-y-2.5">
            {missions.map((mission) => {
              const isSelected = mission.id === selectedMission.id;
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
                    <div>
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
                      <span>Start Date:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{mission.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sortie Duration:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{mission.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Assigned Fleet:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{mission.robotCount} Units</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Area Surveyed:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        {mission.exploredAreaPercent}% ({mission.exploredAreaSqM?.toLocaleString()} m²)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mission Details Panel */}
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Location: {selectedMission.location}
                </p>
              </div>

              {/* Action Buttons (Simulation Control) */}
              <div className="flex items-center gap-2">
                {selectedMission.status === 'ACTIVE' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateMissionStatus(selectedMission.id, 'PAUSED')}
                    className="gap-1.5 font-mono text-xs"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause Mission
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateMissionStatus(selectedMission.id, 'ACTIVE')}
                    className="gap-1.5 font-mono text-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start Mission
                  </Button>
                )}

                {selectedMission.status !== 'COMPLETED' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowStopDialog(true)}
                    className="gap-1.5 font-mono text-xs"
                  >
                    <Square className="w-3.5 h-3.5" />
                    Stop Mission
                  </Button>
                )}
              </div>
            </div>

            {/* Tactical Grid Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Lead Commander</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {selectedMission.leadCommander}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Duration Active</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {selectedMission.duration}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Surveyed Area</span>
                <span className="font-bold text-cyan-500 mt-1 block">
                  {selectedMission.exploredAreaPercent}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Assigned Robots</span>
                <span className="font-bold text-emerald-500 mt-1 block">
                  {selectedMission.assignedRobots.join(', ')}
                </span>
              </div>
            </div>

            {/* Tactical Objectives Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Operational Objectives Checklist
              </h4>

              <div className="space-y-2">
                {selectedMission.objectives?.map((obj, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                      obj.completed
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-700 dark:text-slate-200'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {obj.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span className={obj.completed ? 'line-through opacity-80' : ''}>
                      {obj.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Mission Confirm Dialog */}
      <ConfirmDialog
        isOpen={showStopDialog}
        onClose={() => setShowStopDialog(false)}
        onConfirm={() => updateMissionStatus(selectedMission.id, 'COMPLETED')}
        title="Abort or Finalize Mission Sortie"
        description={`Are you sure you want to stop '${selectedMission.name}'? This will mark the deployment as COMPLETED and park all robots.`}
        confirmText="Confirm Stop"
        variant="danger"
      />
    </div>
  );
}
