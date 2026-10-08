import React from 'react';
import { 
  Bot, 
  Plane, 
  Battery, 
  BatteryCharging, 
  Wifi, 
  MapPin, 
  Activity, 
  Play, 
  Pause, 
  RotateCcw, 
  SlidersHorizontal 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';

export function RobotCard({ robot, onAction, onRetask, isCompact = false }) {
  const {
    id,
    name,
    callsign,
    type,
    status,
    battery,
    connection,
    signalStrength,
    position,
    currentTask,
    exploredArea,
    speed,
    temperature,
    detectionsCount,
  } = robot;

  const isUAV = type.includes('UAV');
  const Icon = isUAV ? Plane : Bot;

  // Battery status styling
  const batteryColor =
    battery > 60 ? 'text-emerald-500' : battery > 25 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="rounded-2xl border p-5 transition-all duration-200 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl hover:border-cyan-500/40">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/60 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white font-mono">
                {name}
              </h3>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                [{callsign}]
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {type}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 font-mono text-xs">
        {/* Battery */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>BATTERY</span>
            <Battery className={`w-3.5 h-3.5 ${batteryColor}`} />
          </div>
          <div className={`text-base font-bold mt-1 ${batteryColor}`}>
            {battery}%
          </div>
        </div>

        {/* Connection */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>SIGNAL</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold mt-1 text-slate-900 dark:text-white">
            {signalStrength} dBm
          </div>
        </div>

        {/* Position */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>POSITION</span>
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xs font-bold mt-1 text-slate-900 dark:text-white truncate">
            {position?.x}, {position?.y}
          </div>
        </div>

        {/* Coverage */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>COVERAGE</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold mt-1 text-slate-900 dark:text-white">
            {exploredArea?.toLocaleString()} m²
          </div>
        </div>
      </div>

      {/* Task Description */}
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 mb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
          Current Assignment:
        </span>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
          {currentTask}
        </p>
      </div>

      {/* Action Controls (UI Simulation Only) */}
      {onAction && (
        <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {status === 'ACTIVE' || status === 'EXPLORING' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAction(id, 'PAUSED')}
              className="gap-1.5 font-mono text-xs"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onAction(id, 'ACTIVE')}
              className="gap-1.5 font-mono text-xs"
            >
              <Play className="w-3.5 h-3.5" />
              Resume
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction(id, 'RETURNING')}
            className="gap-1.5 font-mono text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Return to Base
          </Button>

          {onRetask && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetask(robot)}
              className="gap-1.5 font-mono text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Retask
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
