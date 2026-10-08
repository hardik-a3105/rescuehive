import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  RotateCcw, 
  Play, 
  Pause, 
  SlidersHorizontal, 
  Radio, 
  MapPin, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { PageHeader } from '../components/common/PageHeader';
import { RobotCard } from '../components/common/RobotCard';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/ui/Button';

export function RobotsPage() {
  const { robots, updateRobotStatus } = useMission();
  const [retaskRobot, setRetaskRobot] = useState(null);
  const [selectedTaskPreset, setSelectedTaskPreset] = useState('');
  const [customTask, setCustomTask] = useState('');

  const taskPresets = [
    'Autonomous thermal scanning in Sector 4B collapsed basement',
    'High-resolution 3D photogrammetry & roof structural survey',
    'Acoustic survivor listening array triangulation in Sector 4C',
    'Gas plume threshold monitoring & perimeter cordon verification',
    'Ingress route clearance inspection for human emergency responders',
  ];

  const handleRetaskSubmit = (e) => {
    e.preventDefault();
    const task = customTask || selectedTaskPreset || 'General autonomous reconnaissance';
    if (retaskRobot) {
      updateRobotStatus(retaskRobot.id, 'ACTIVE', task);
      setRetaskRobot(null);
      setCustomTask('');
      setSelectedTaskPreset('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Robot Fleet Operations"
        subtitle="Tactical monitoring and teleoperation command overrides"
        badge={
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs border border-emerald-500/30 font-semibold">
            {robots.length} UNITS SYNCED
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                robots.forEach((r) => updateRobotStatus(r.id, 'RETURNING'));
              }}
              className="gap-2 font-mono text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Recall All Units
            </Button>
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
          <span className="text-slate-400 text-[10px] uppercase block">Active Exploring</span>
          <span className="text-lg font-bold text-emerald-500 mt-0.5 block">
            {robots.filter((r) => r.status === 'ACTIVE' || r.status === 'EXPLORING').length} Units
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">Avg Battery</span>
          <span className="text-lg font-bold text-cyan-500 mt-0.5 block">
            {Math.round(robots.reduce((acc, r) => acc + r.battery, 0) / robots.length)}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">Mesh Protocol</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
            802.11s Sub-GHz Sim
          </span>
        </div>
      </div>

      {/* Robot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {robots.map((robot) => (
          <RobotCard
            key={robot.id}
            robot={robot}
            onAction={updateRobotStatus}
            onRetask={(r) => {
              setRetaskRobot(r);
              setSelectedTaskPreset(taskPresets[0]);
            }}
          />
        ))}
      </div>

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
              <Button variant="default" size="md" type="submit">
                Dispatch Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
