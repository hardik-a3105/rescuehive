import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Flame, 
  UserCheck, 
  AlertTriangle, 
  Bot, 
  Plane, 
  Radio,
  Crosshair,
  Info
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';

export function MapView({ robots = [], detections = [], onSelectRobot, selectedRobotId }) {
  const [zoom, setZoom] = useState(1);
  const [showTrails, setShowTrails] = useState(true);
  const [showVictims, setShowVictims] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapMode, setMapMode] = useState('tactical'); // 'tactical' or 'satellite'

  // Map coordinate bounds
  const mapWidth = 900;
  const mapHeight = 520;

  // Scale coordinates (0-100 to svg viewBox)
  const toX = (val) => (val / 100) * mapWidth;
  const toY = (val) => (val / 100) * mapHeight;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200 tracking-wider">TACTICAL GIS GRID</span>
          </div>

          {/* Mandatory Mock / Simulation Badge */}
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold tracking-widest uppercase animate-pulse">
            SIMULATION / MOCK DATA
          </span>
        </div>

        {/* Layer Controls & Zoom */}
        <div className="flex items-center gap-2">
          {/* Layer toggles */}
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2 py-1 rounded border text-[11px] transition-colors ${
              showTrails
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            Trails
          </button>
          <button
            onClick={() => setShowVictims(!showVictims)}
            className={`px-2 py-1 rounded border text-[11px] transition-colors ${
              showVictims
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            Victims
          </button>
          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2 py-1 rounded border text-[11px] transition-colors ${
              showHazards
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            Hazards
          </button>

          {/* Zoom controls */}
          <div className="flex items-center border border-slate-800 rounded bg-slate-900 ml-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 1.8))}
              className="p-1 hover:text-cyan-400 text-slate-400"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] text-slate-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
              className="p-1 hover:text-cyan-400 text-slate-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:text-cyan-400 text-slate-400 border-l border-slate-800"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full overflow-hidden bg-[#070c18] aspect-[16/9] min-h-[420px] max-h-[600px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full transition-transform duration-300 select-none cursor-crosshair"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Blueprint Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.07)" strokeWidth="1" />
            </pattern>
            <pattern id="subgrid" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1.5" />
            </pattern>
            {/* Radar scan gradient */}
            <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.15)" />
              <stop offset="70%" stopColor="rgba(6, 182, 212, 0.05)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width={mapWidth} height={mapHeight} fill="#060b17" />
          <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />
          <rect width={mapWidth} height={mapHeight} fill="url(#subgrid)" />

          {/* Sector Outlines & Explored Zones */}
          {/* Sector 4A - North Recon Yard */}
          <polygon
            points={`${toX(55)},${toY(15)} ${toX(95)},${toY(15)} ${toX(95)},${toY(65)} ${toX(65)},${toY(65)}`}
            fill="rgba(6, 182, 212, 0.06)"
            stroke="rgba(6, 182, 212, 0.3)"
            strokeDasharray="4 4"
          />
          <text x={toX(66)} y={toY(20)} fill="rgba(56, 189, 248, 0.5)" fontSize="11" fontFamily="monospace">
            SECTOR 4A — NORTH DECK
          </text>

          {/* Sector 4B - Basement Collapse Hub */}
          <polygon
            points={`${toX(25)},${toY(10)} ${toX(52)},${toY(10)} ${toX(52)},${toY(50)} ${toX(25)},${toY(50)}`}
            fill="rgba(244, 63, 94, 0.08)"
            stroke="rgba(244, 63, 94, 0.35)"
            strokeDasharray="4 4"
          />
          <text x={toX(27)} y={toY(16)} fill="rgba(244, 63, 94, 0.6)" fontSize="11" fontFamily="monospace">
            SECTOR 4B — STRUCTURAL BREACH
          </text>

          {/* Sector 4C - West Corridor */}
          <polygon
            points={`${toX(5)},${toY(20)} ${toX(22)},${toY(20)} ${toX(22)},${toY(70)} ${toX(5)},${toY(70)}`}
            fill="rgba(16, 185, 129, 0.06)"
            stroke="rgba(16, 185, 129, 0.3)"
            strokeDasharray="4 4"
          />
          <text x={toX(7)} y={toY(26)} fill="rgba(16, 185, 129, 0.5)" fontSize="11" fontFamily="monospace">
            SECTOR 4C — CORRIDORS
          </text>

          {/* Base Command Staging Depot */}
          <circle cx={toX(10)} cy={toY(10)} r="24" fill="rgba(6, 182, 212, 0.1)" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.5" />
          <circle cx={toX(10)} cy={toY(10)} r="4" fill="#06b6d4" />
          <text x={toX(10)} y={toY(10) + 16} textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
            BASE STAGING
          </text>

          {/* Robot Exploration Trail Paths */}
          {showTrails &&
            robots.map((robot) => {
              if (!robot.pathHistory || robot.pathHistory.length < 2) return null;
              const points = robot.pathHistory.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ');
              const strokeColor =
                robot.id === 'RH-UGV-01' ? '#06b6d4' : robot.id === 'RH-UAV-02' ? '#3b82f6' : '#10b981';

              return (
                <g key={`trail-${robot.id}`}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    opacity="0.6"
                  />
                  {/* Waypoint nodes */}
                  {robot.pathHistory.map((p, idx) => (
                    <circle
                      key={`pt-${idx}`}
                      cx={toX(p.x)}
                      cy={toY(p.y)}
                      r="3"
                      fill={strokeColor}
                      opacity="0.8"
                    />
                  ))}
                </g>
              );
            })}

          {/* Hazard Markers */}
          {showHazards &&
            detections
              .filter((d) => d.type !== 'Victim' && d.type !== 'Emergency Exit' && d.status !== 'DISMISSED')
              .map((hazard) => {
                const x = toX(hazard.location.x);
                const y = toY(hazard.location.y);
                const isFire = hazard.type === 'Fire';

                return (
                  <g
                    key={`hazard-${hazard.id}`}
                    className="cursor-pointer group"
                    onClick={() => setActiveMarker(hazard)}
                  >
                    {/* Pulsing hazard glow */}
                    <circle cx={x} cy={y} r="14" fill={isFire ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'} className="animate-pulse" />
                    <circle cx={x} cy={y} r="8" fill={isFire ? '#ef4444' : '#f59e0b'} stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fill={isFire ? '#f87171' : '#fbbf24'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {hazard.type.toUpperCase()}
                    </text>
                  </g>
                );
              })}

          {/* Victim Markers */}
          {showVictims &&
            detections
              .filter((d) => d.type === 'Victim' && d.status !== 'DISMISSED')
              .map((victim) => {
                const x = toX(victim.location.x);
                const y = toY(victim.location.y);

                return (
                  <g
                    key={`victim-${victim.id}`}
                    className="cursor-pointer group"
                    onClick={() => setActiveMarker(victim)}
                  >
                    {/* Double pulse beacon */}
                    <circle cx={x} cy={y} r="18" fill="rgba(244, 63, 94, 0.2)" className="animate-ping" style={{ animationDuration: '3s' }} />
                    <circle cx={x} cy={y} r="9" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={x}
                      y={y - 13}
                      textAnchor="middle"
                      fill="#fda4af"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      VICTIM ({Math.round(victim.confidence * 100)}%)
                    </text>
                  </g>
                );
              })}

          {/* Robot Units (Alpha, Bravo, Charlie) */}
          {robots.map((robot) => {
            const x = toX(robot.position.x);
            const y = toY(robot.position.y);
            const isSelected = selectedRobotId === robot.id;
            const isUAV = robot.type.includes('UAV');

            return (
              <g
                key={`robot-${robot.id}`}
                className="cursor-pointer"
                onClick={() => {
                  setActiveMarker(robot);
                  if (onSelectRobot) onSelectRobot(robot.id);
                }}
              >
                {/* Selected focus ring */}
                {isSelected && (
                  <circle cx={x} cy={y} r="26" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" className="animate-spin" />
                )}

                {/* Radar beam circle */}
                <circle cx={x} cy={y} r="20" fill="url(#radarScan)" />

                {/* Outer beacon ring */}
                <circle cx={x} cy={y} r="12" fill="#0f172a" stroke={isSelected ? '#38bdf8' : '#06b6d4'} strokeWidth="2" />

                {/* Robot center point */}
                <circle cx={x} cy={y} r="5" fill={robot.status === 'ACTIVE' || robot.status === 'EXPLORING' ? '#10b981' : '#f59e0b'} />

                {/* Label box */}
                <rect x={x - 42} y={y + 16} width="84" height="20" rx="4" fill="#090d16" stroke="#334155" strokeWidth="1" />
                <text x={x} y={y + 30} textAnchor="middle" fill="#e2e8f0" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                  {robot.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay at bottom-left */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 font-mono text-[11px] space-y-1.5 backdrop-blur-md hidden sm:block shadow-lg">
          <div className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 pb-1 mb-1">
            Tactical Map Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300">Active Robot Unit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Victim Signature</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Hazard (Fire / Gas / Debris)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-cyan-400"></span>
            <span className="text-slate-300">Robot Odometry Trail</span>
          </div>
        </div>

        {/* Selected Marker Detail Card (Floater) */}
        {activeMarker && (
          <div className="absolute top-4 right-4 w-72 bg-slate-900/95 border border-cyan-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-lg font-mono text-xs z-20">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider">
                  {activeMarker.callsign ? 'Robot Unit Telemetry' : 'Detection Marker'}
                </span>
                <h4 className="font-bold text-white text-sm">
                  {activeMarker.name || `${activeMarker.type} #${activeMarker.id}`}
                </h4>
              </div>
              <button
                onClick={() => setActiveMarker(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-slate-300 text-[11px]">
              {activeMarker.status && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <StatusBadge status={activeMarker.status} />
                </div>
              )}
              {activeMarker.battery !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Battery:</span>
                  <span className="font-bold text-emerald-400">{activeMarker.battery}%</span>
                </div>
              )}
              {activeMarker.confidence !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="font-bold text-cyan-400">{Math.round(activeMarker.confidence * 100)}%</span>
                </div>
              )}
              {activeMarker.position && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-slate-200">
                    X: {activeMarker.position.x}, Y: {activeMarker.position.y}
                  </span>
                </div>
              )}
              {activeMarker.currentTask && (
                <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800">
                  <span className="text-slate-300 font-semibold">Task: </span>
                  {activeMarker.currentTask}
                </div>
              )}
              {activeMarker.details && (
                <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800">
                  <span className="text-slate-300 font-semibold">Details: </span>
                  {activeMarker.details}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Bottom Status Strip */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Tactical Simulation Canvas (Scale 1:100m)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>CRS: Local Metric Grid</span>
          <span>•</span>
          <span className="text-amber-400/90 font-semibold">Simulated Environment</span>
        </div>
      </div>
    </div>
  );
}
