import React from 'react';
import { Clock, Bot, UserCheck, Flame, Compass } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function MissionProgress({ mission, robotsCount = 3, victimsCount = 4, hazardsCount = 3 }) {
  const percent = mission?.exploredAreaPercent || 68.4;
  const duration = mission?.duration || '01:42:18';

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>
          <Compass className="w-4 h-4 text-cyan-500" />
          Mission Exploration Progress
        </CardTitle>
        <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
          {percent}% COMPLETE
        </span>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500 relative"
              style={{ width: `${percent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse-subtle"></div>
            </div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Staging Line (0%)</span>
            <span>Target Coverage ({mission?.targetAreaSqM?.toLocaleString() || '6,140'} m²)</span>
          </div>
        </div>

        {/* Tactical Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              ELAPSED
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              {duration}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              FLEET
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              {robotsCount} Units
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
              <UserCheck className="w-3.5 h-3.5 text-rose-500" />
              VICTIMS
            </div>
            <div className="text-base font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {victimsCount} Flagged
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              HAZARDS
            </div>
            <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {hazardsCount} Active
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
