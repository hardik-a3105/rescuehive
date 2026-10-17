import React from 'react';
import { 
  Bot, 
  Plane, 
  Battery, 
  Wifi, 
  WifiOff,
  MapPin, 
  Activity, 
  Play, 
  Pause, 
  RotateCcw, 
  SlidersHorizontal,
  Eye,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';
import { useSettings } from '../../context/SettingsContext';

export function RobotCard({ robot, onAction, onRetask, onInspect, isCompact = false }) {
  const { formatArea } = useSettings();
  const {
    id,
    name,
    callsign,
    type,
    status,
    battery,
    connection,
    connection_status,
    signalStrength,
    position,
    currentTask,
    exploredArea,
  } = robot;

  const isUAV =
    (type && type.includes('UAV')) ||
    (name && name.toLowerCase().includes('uav')) ||
    (name && name.toLowerCase().includes('hawk'));
  const Icon = isUAV ? Plane : Bot;

  const isOffline = status === 'OFFLINE' || connection_status === 'DISCONNECTED' || connection === 'Offline';

  // Battery status styling
  const batteryColor =
    (battery ?? 100) > 60
      ? 'text-emerald-500'
      : (battery ?? 100) > 25
      ? 'text-amber-500'
      : 'text-rose-500';

  const posX = typeof position?.x === 'number' ? position.x.toFixed(1) : (typeof robot.x === 'number' ? robot.x.toFixed(1) : '0.0');
  const posY = typeof position?.y === 'number' ? position.y.toFixed(1) : (typeof robot.y === 'number' ? robot.y.toFixed(1) : '0.0');

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-200 bg-white dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl hover:border-cyan-500/50 flex flex-col justify-between min-h-[340px] ${
      isOffline ? 'opacity-85' : ''
    }`}>
      <div>
        {/* Header: Clean flex row with no overlapping absolute buttons */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
              isOffline
                ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-400'
                : 'bg-cyan-500/10 dark:bg-cyan-950/60 border-cyan-500/25 text-cyan-600 dark:text-cyan-400'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white font-mono truncate">
                  {name}
                </h3>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                  [{callsign || 'UNIT'}]
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {type || 'Autonomous Robotic Asset'}
              </p>
            </div>
          </div>

          {/* Header Controls: Inspect Button + Status Badge */}
          <div className="flex items-center gap-2 shrink-0">
            {onInspect && (
              <button
                type="button"
                onClick={() => onInspect(robot)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                title="Inspect Telemetry Details (/robots/{id})"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            <StatusBadge status={status || 'IDLE'} />
          </div>
        </div>

        {/* Vitals Grid: Responsive 2-column or 4-column layout with comfortable spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 font-mono text-xs">
          {/* Battery */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>BATTERY</span>
              <Battery className={`w-3.5 h-3.5 ${batteryColor}`} />
            </div>
            <div className={`text-sm font-bold mt-1 ${batteryColor}`}>
              {battery ?? 100}%
            </div>
          </div>

          {/* Connection */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>SIGNAL</span>
              {isOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <div className={`text-sm font-bold mt-1 truncate ${isOffline ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
              {isOffline ? 'Offline' : `${signalStrength ?? -48} dBm`}
            </div>
          </div>

          {/* Position Coordinates */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>POSITION</span>
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xs font-bold mt-1 text-slate-900 dark:text-white">
              {posX}, {posY}
            </div>
          </div>

          {/* Survey Coverage */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>COVERAGE</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xs font-bold mt-1 text-slate-900 dark:text-white truncate">
              {formatArea(exploredArea ?? 0)}
            </div>
          </div>
        </div>

        {/* Current Task Description */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 mb-4 min-h-[64px]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Current Assignment:
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed line-clamp-2">
            {currentTask || 'Autonomous perimeter sweep & reconnaissance'}
          </p>
        </div>
      </div>

      {/* Footer Actions: Always renders a consistent footer to prevent cards from collapsing */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
        {onAction ? (
          <div className="flex items-center flex-wrap gap-2">
            {status === 'ACTIVE' || status === 'EXPLORING' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onAction(id, 'IDLE', 'Holding station — exploration paused')}
                className="gap-1.5 font-mono text-xs flex-1 justify-center"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => onAction(id, 'ACTIVE', 'Autonomous exploration active')}
                className="gap-1.5 font-mono text-xs flex-1 justify-center"
              >
                <Play className="w-3.5 h-3.5" />
                Resume
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(id, 'RETURNING', 'Autonomous RTL to staging depot')}
              className="gap-1.5 font-mono text-xs text-amber-500 hover:text-amber-400"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Return
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
        ) : (
          /* Field Operator Mode / Monitoring Only Footer */
          <div className="flex items-center justify-between text-xs font-mono py-1">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
              <span>Link: {isOffline ? 'Offline' : 'Online (100%)'}</span>
            </div>
            {onInspect && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInspect(robot)}
                className="text-[11px] font-mono gap-1 py-1 px-3"
              >
                <Eye className="w-3.5 h-3.5" />
                Inspect Telemetry
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
