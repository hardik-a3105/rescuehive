import React from 'react';
import { Bot, Plane, Battery, Wifi, MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';

export function RobotTable({ robots = [], onSelectRobot, onAction }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left text-xs font-mono">
        <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="py-3 px-4">ROBOT / CALLSIGN</th>
            <th className="py-3 px-4">STATUS</th>
            <th className="py-3 px-4">BATTERY</th>
            <th className="py-3 px-4">SIGNAL</th>
            <th className="py-3 px-4">POSITION (X, Y)</th>
            <th className="py-3 px-4">CURRENT TASK</th>
            <th className="py-3 px-4">COVERAGE</th>
            {onAction && <th className="py-3 px-4 text-right">ACTION</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {robots.map((robot) => {
            const isUAV = robot.type.includes('UAV');
            const Icon = isUAV ? Plane : Bot;
            const batteryColor =
              robot.battery > 60
                ? 'text-emerald-500'
                : robot.battery > 25
                ? 'text-amber-500'
                : 'text-rose-500';

            return (
              <tr
                key={robot.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                onClick={() => onSelectRobot && onSelectRobot(robot.id)}
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {robot.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {robot.id} • {robot.callsign}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <StatusBadge status={robot.status} />
                </td>

                <td className="py-3.5 px-4 font-bold">
                  <span className={batteryColor}>{robot.battery}%</span>
                </td>

                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {robot.signalStrength} dBm
                </td>

                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {robot.position.x}, {robot.position.y}
                </td>

                <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300" title={robot.currentTask}>
                  {robot.currentTask}
                </td>

                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {robot.exploredArea.toLocaleString()} m²
                </td>

                {onAction && (
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction(robot.id, robot.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
                      className="text-[10px] py-1 px-2"
                    >
                      {robot.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
