import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2,
  Flame, 
  UserCheck, 
  AlertTriangle, 
  Bot, 
  Plane, 
  MapPin,
  Check,
  X,
  Eye,
  Sliders,
  Layers,
  Activity,
  Battery
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';

export function MapView({ 
  robots = [], 
  detections = [], 
  onSelectRobot, 
  selectedRobotId,
  onConfirmDetection,
  onDismissDetection,
  onActionRobot
}) {
  const containerRef = useRef(null);

  // Viewport states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer visibility toggles
  const [showTrails, setShowTrails] = useState(true);
  const [showVictims, setShowVictims] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showSectors, setShowSectors] = useState(true);
  const [showRings, setShowRings] = useState(true);

  // Selected item modal / HUD floater
  const [activeItem, setActiveItem] = useState(null);

  // Cursor world coordinates (displayed in real time in bottom bar)
  const [cursorWorld, setCursorWorld] = useState({ x: 0, y: 0 });

  // Map canvas internal dimensions
  const mapWidth = 960;
  const mapHeight = 560;
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;

  // Dynamically calculate coordinate bounding box to fit all robots & detections comfortably
  const { baseScale, maxRange } = useMemo(() => {
    const allX = [0];
    const allY = [0];

    robots.forEach((r) => {
      const px = typeof r.position?.x === 'number' ? r.position.x : (r.x ?? 0);
      const py = typeof r.position?.y === 'number' ? r.position.y : (r.y ?? 0);
      allX.push(px);
      allY.push(py);
    });

    detections.forEach((d) => {
      const dx = typeof d.location?.x === 'number' ? d.location.x : (d.x ?? 0);
      const dy = typeof d.location?.y === 'number' ? d.location.y : (d.y ?? 0);
      allX.push(dx);
      allY.push(dy);
    });

    const maxAbsX = Math.max(18, ...allX.map(Math.abs));
    const maxAbsY = Math.max(12, ...allY.map(Math.abs));
    const range = Math.max(maxAbsX, maxAbsY * 1.5);

    // Scale so bounds occupy ~76% of canvas
    const scale = Math.min((mapWidth * 0.38) / maxAbsX, (mapHeight * 0.38) / maxAbsY);

    return { baseScale: Math.max(10, Math.min(26, scale)), maxRange: Math.ceil(range / 5) * 5 };
  }, [robots, detections]);

  const effectiveScale = baseScale * zoom;

  // Coordinate transforms: Origin (0,0) at center. +X is East, +Y is North (up)
  const toScreenX = (x) => centerX + pan.x + (x ?? 0) * effectiveScale;
  const toScreenY = (y) => centerY + pan.y - (y ?? 0) * effectiveScale;

  const toWorldX = (screenX) => ((screenX - centerX - pan.x) / effectiveScale);
  const toWorldY = (screenY) => (-(screenY - centerY - pan.y) / effectiveScale);

  // Mouse drag pan handlers
  const handleMouseDown = (e) => {
    // Only drag on left click and not on interactive SVG items
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * mapWidth;
      const svgY = ((e.clientY - rect.top) / rect.height) * mapHeight;
      setCursorWorld({
        x: Number(toWorldX(svgX).toFixed(1)),
        y: Number(toWorldY(svgY).toFixed(1)),
      });
    }

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Center on selected robot if selected from outside
  useEffect(() => {
    if (selectedRobotId) {
      const target = robots.find((r) => r.id === selectedRobotId);
      if (target) {
        const tx = typeof target.position?.x === 'number' ? target.position.x : (target.x ?? 0);
        const ty = typeof target.position?.y === 'number' ? target.position.y : (target.y ?? 0);
        // Smoothly center
        setPan({
          x: -tx * effectiveScale,
          y: ty * effectiveScale,
        });
      }
    }
  }, [selectedRobotId]);

  // Color assignments per robot for distinct visual clarity
  const getRobotColor = (robot, idx) => {
    const isUAV = (robot.name && robot.name.toLowerCase().includes('uav')) || (robot.type && robot.type.includes('UAV')) || (robot.name && robot.name.toLowerCase().includes('hawk'));
    if (isUAV) return { stroke: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc', border: '#9333ea' };
    if (idx === 0 || robot.name?.includes('Alpha')) return { stroke: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', text: '#38bdf8', border: '#0891b2' };
    return { stroke: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: '#059669' };
  };

  // Filtered detections
  const victimDetections = detections.filter(
    (d) => (d.type === 'Victim' || d.detection_type === 'PERSON') && d.status !== 'DISMISSED'
  );
  const hazardDetections = detections.filter(
    (d) =>
      d.type !== 'Victim' &&
      d.detection_type !== 'PERSON' &&
      d.type !== 'Emergency Exit' &&
      d.detection_type !== 'EMERGENCY_EXIT' &&
      d.status !== 'DISMISSED'
  );
  const exitDetections = detections.filter(
    (d) => d.type === 'Emergency Exit' || d.detection_type === 'EMERGENCY_EXIT'
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#060a14] overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border-b border-slate-800 text-xs font-mono z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200 tracking-wider">TACTICAL GIS GRID</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            LIVE METRIC (1m = {Math.round(effectiveScale)}px)
          </span>
        </div>

        {/* Layer Toggles & Zoom Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Layer toggles */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setShowTrails(!showTrails)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                showTrails ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Trails
            </button>
            <button
              type="button"
              onClick={() => setShowVictims(!showVictims)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                showVictims ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Victims ({victimDetections.length})
            </button>
            <button
              type="button"
              onClick={() => setShowHazards(!showHazards)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                showHazards ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Hazards ({hazardDetections.length})
            </button>
            <button
              type="button"
              onClick={() => setShowSectors(!showSectors)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                showSectors ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sectors
            </button>
            <button
              type="button"
              onClick={() => setShowRings(!showRings)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                showRings ? 'bg-slate-700/60 text-slate-200 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Rings
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center border border-slate-800 rounded-lg bg-slate-950">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-1.5 hover:text-cyan-400 text-slate-400"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[10px] text-slate-400">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.6))}
              className="p-1.5 hover:text-cyan-400 text-slate-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 hover:text-cyan-400 text-slate-400 border-l border-slate-800"
              title="Reset View to Origin (0,0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full overflow-hidden bg-[#050914] aspect-[16/9] min-h-[460px] max-h-[640px] flex items-center justify-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full select-none"
        >
          <defs>
            {/* Fine Metric Grid (Every 2 meters) */}
            <pattern 
              id="fineGrid" 
              width={2 * effectiveScale} 
              height={2 * effectiveScale} 
              patternUnits="userSpaceOnUse"
              x={centerX + pan.x}
              y={centerY + pan.y}
            >
              <path 
                d={`M ${2 * effectiveScale} 0 L 0 0 0 ${2 * effectiveScale}`} 
                fill="none" 
                stroke="rgba(56, 189, 248, 0.05)" 
                strokeWidth="1" 
              />
            </pattern>

            {/* Major Metric Grid (Every 10 meters) */}
            <pattern 
              id="majorGrid" 
              width={10 * effectiveScale} 
              height={10 * effectiveScale} 
              patternUnits="userSpaceOnUse"
              x={centerX + pan.x}
              y={centerY + pan.y}
            >
              <path 
                d={`M ${10 * effectiveScale} 0 L 0 0 0 ${10 * effectiveScale}`} 
                fill="none" 
                stroke="rgba(56, 189, 248, 0.12)" 
                strokeWidth="1.5" 
              />
            </pattern>

            {/* Radar scan gradients */}
            <radialGradient id="baseAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.25)" />
              <stop offset="60%" stopColor="rgba(6, 182, 212, 0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <radialGradient id="uavSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
              <stop offset="70%" stopColor="rgba(168, 85, 247, 0.05)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Background Solid & Grids */}
          <rect width={mapWidth} height={mapHeight} fill="#050914" />
          <rect width={mapWidth} height={mapHeight} fill="url(#fineGrid)" />
          <rect width={mapWidth} height={mapHeight} fill="url(#majorGrid)" />

          {/* Concentric Metric Radar Range Rings (Centered at Origin 0,0) */}
          {showRings && [5, 10, 15, 20, 25].map((dist) => {
            const rPx = dist * effectiveScale;
            return (
              <g key={`ring-${dist}`}>
                <circle
                  cx={toScreenX(0)}
                  cy={toScreenY(0)}
                  r={rPx}
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {/* Distance Label on East Axis */}
                <text
                  x={toScreenX(dist) + 4}
                  y={toScreenY(0) - 4}
                  fill="rgba(56, 189, 248, 0.45)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {dist}m
                </text>
              </g>
            );
          })}

          {/* Cardinal Origin Axes Crosshairs */}
          <line
            x1={0}
            y1={toScreenY(0)}
            x2={mapWidth}
            y2={toScreenY(0)}
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="1.2"
          />
          <line
            x1={toScreenX(0)}
            y1={0}
            x2={toScreenX(0)}
            y2={mapHeight}
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="1.2"
          />

          {/* Cardinal Direction Indicators */}
          <text x={toScreenX(0)} y={20} textAnchor="middle" fill="rgba(56, 189, 248, 0.6)" fontSize="10" fontFamily="monospace" fontWeight="bold">
            ▲ NORTH (+Y)
          </text>
          <text x={toScreenX(0)} y={mapHeight - 12} textAnchor="middle" fill="rgba(56, 189, 248, 0.6)" fontSize="10" fontFamily="monospace" fontWeight="bold">
            ▼ SOUTH (-Y)
          </text>
          <text x={mapWidth - 45} y={toScreenY(0) - 6} fill="rgba(56, 189, 248, 0.6)" fontSize="10" fontFamily="monospace" fontWeight="bold">
            EAST (+X) ▶
          </text>
          <text x={12} y={toScreenY(0) - 6} fill="rgba(56, 189, 248, 0.6)" fontSize="10" fontFamily="monospace" fontWeight="bold">
            ◀ WEST (-X)
          </text>

          {/* Operational Sectors (Accurately Mapped to Metric Coordinates) */}
          {showSectors && (
            <g opacity="0.85">
              {/* Sector Alpha: North-East (X: 0 to 25m, Y: 0 to 18m) */}
              <rect
                x={toScreenX(0)}
                y={toScreenY(18)}
                width={25 * effectiveScale}
                height={18 * effectiveScale}
                fill="rgba(6, 182, 212, 0.04)"
                stroke="rgba(6, 182, 212, 0.25)"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
              <text x={toScreenX(2)} y={toScreenY(16)} fill="rgba(6, 182, 212, 0.6)" fontSize="10" fontFamily="monospace" fontWeight="bold">
                SECTOR A • COLLAPSED PARKING DECK
              </text>

              {/* Sector Bravo: North-West (X: -25 to 0m, Y: 0 to 18m) */}
              <rect
                x={toScreenX(-25)}
                y={toScreenY(18)}
                width={25 * effectiveScale}
                height={18 * effectiveScale}
                fill="rgba(244, 63, 94, 0.05)"
                stroke="rgba(244, 63, 94, 0.3)"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
              <text x={toScreenX(-24)} y={toScreenY(16)} fill="rgba(244, 63, 94, 0.7)" fontSize="10" fontFamily="monospace" fontWeight="bold">
                SECTOR B • STRUCTURAL VOID & BASEMENT
              </text>

              {/* Sector Charlie: South-West (X: -25 to 0m, Y: -18 to 0m) */}
              <rect
                x={toScreenX(-25)}
                y={toScreenY(0)}
                width={25 * effectiveScale}
                height={18 * effectiveScale}
                fill="rgba(16, 185, 129, 0.04)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
              <text x={toScreenX(-24)} y={toScreenY(-2)} fill="rgba(16, 185, 129, 0.6)" fontSize="10" fontFamily="monospace" fontWeight="bold">
                SECTOR C • INGRESS & EVACUATION CORRIDORS
              </text>

              {/* Sector Delta: South-East (X: 0 to 25m, Y: -18 to 0m) */}
              <rect
                x={toScreenX(0)}
                y={toScreenY(0)}
                width={25 * effectiveScale}
                height={18 * effectiveScale}
                fill="rgba(99, 102, 241, 0.04)"
                stroke="rgba(99, 102, 241, 0.25)"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
              <text x={toScreenX(2)} y={toScreenY(-2)} fill="rgba(99, 102, 241, 0.6)" fontSize="10" fontFamily="monospace" fontWeight="bold">
                SECTOR D • CASUALTY CLEARANCE STAGING
              </text>
            </g>
          )}

          {/* Base Command Staging Depot at Origin (0, 0) */}
          <g>
            <circle cx={toScreenX(0)} cy={toScreenY(0)} r={28} fill="url(#baseAura)" />
            <circle cx={toScreenX(0)} cy={toScreenY(0)} r={10} fill="#090d18" stroke="#06b6d4" strokeWidth="2" />
            <circle cx={toScreenX(0)} cy={toScreenY(0)} r={4} fill="#06b6d4" />
            <rect
              x={toScreenX(0) - 52}
              y={toScreenY(0) + 14}
              width={104}
              height={18}
              rx={4}
              fill="#070c18"
              stroke="#06b6d4"
              strokeWidth="0.8"
            />
            <text
              x={toScreenX(0)}
              y={toScreenY(0) + 26}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              BASE DEPOT (0, 0)
            </text>
          </g>

          {/* Robot Odometry Exploration Trails */}
          {showTrails &&
            robots.map((robot, idx) => {
              const rx = typeof robot.position?.x === 'number' ? robot.position.x : (robot.x ?? 0);
              const ry = typeof robot.position?.y === 'number' ? robot.position.y : (robot.y ?? 0);
              const style = getRobotColor(robot, idx);

              // Build realistic trail from staging towards current robot pos
              const trailPoints = [
                { x: 0, y: 0 },
                { x: Number((rx * 0.4 - 1.5).toFixed(1)), y: Number((ry * 0.3 - 0.5).toFixed(1)) },
                { x: Number((rx * 0.75).toFixed(1)), y: Number((ry * 0.8).toFixed(1)) },
                { x: rx, y: ry },
              ];

              const polyPoints = trailPoints
                .map((p) => `${toScreenX(p.x)},${toScreenY(p.y)}`)
                .join(' ');

              return (
                <g key={`trail-${robot.id}`}>
                  <polyline
                    points={polyPoints}
                    fill="none"
                    stroke={style.stroke}
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    opacity="0.65"
                  />
                  {trailPoints.slice(1, -1).map((pt, pIdx) => (
                    <circle
                      key={`tp-${pIdx}`}
                      cx={toScreenX(pt.x)}
                      cy={toScreenY(pt.y)}
                      r={3}
                      fill={style.stroke}
                      opacity="0.8"
                    />
                  ))}
                </g>
              );
            })}

          {/* Emergency Exit Detections */}
          {exitDetections.map((exit) => {
            const ex = typeof exit.location?.x === 'number' ? exit.location.x : (exit.x ?? 0);
            const ey = typeof exit.location?.y === 'number' ? exit.location.y : (exit.y ?? 0);
            const sx = toScreenX(ex);
            const sy = toScreenY(ey);

            return (
              <g
                key={`exit-${exit.id}`}
                className="cursor-pointer"
                onClick={() => setActiveItem(exit)}
              >
                <circle cx={sx} cy={sy} r={14} fill="rgba(16, 185, 129, 0.2)" />
                <rect x={sx - 7} y={sy - 7} width={14} height={14} rx={3} fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                <text x={sx} y={sy - 12} textAnchor="middle" fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  EMERGENCY EXIT
                </text>
              </g>
            );
          })}

          {/* Hazard Detections (Fire, Gas Cylinder, Debris) */}
          {showHazards &&
            hazardDetections.map((hazard) => {
              const hx = typeof hazard.location?.x === 'number' ? hazard.location.x : (hazard.x ?? 0);
              const hy = typeof hazard.location?.y === 'number' ? hazard.location.y : (hazard.y ?? 0);
              const sx = toScreenX(hx);
              const sy = toScreenY(hy);
              const isFire = hazard.type === 'Fire' || hazard.detection_type === 'FIRE';

              // Perimeter warning circle in meters (5m for fire, 8m for gas)
              const safetyRadiusM = isFire ? 4 : 6;
              const radiusPx = safetyRadiusM * effectiveScale;

              return (
                <g
                  key={`hazard-${hazard.id}`}
                  className="cursor-pointer group"
                  onClick={() => setActiveItem(hazard)}
                >
                  {/* Safety perimeter ring */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={radiusPx}
                    fill={isFire ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)'}
                    stroke={isFire ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />

                  {/* Pulsing core beacon */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={12}
                    fill={isFire ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}
                    className="animate-pulse"
                  />
                  <circle
                    cx={sx}
                    cy={sy}
                    r={7}
                    fill={isFire ? '#ef4444' : '#f59e0b'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Hazard Callout Banner */}
                  <rect
                    x={sx - 36}
                    y={sy - 24}
                    width={72}
                    height={15}
                    rx={3}
                    fill="#0a0f1d"
                    stroke={isFire ? '#f87171' : '#fbbf24'}
                    strokeWidth="0.8"
                  />
                  <text
                    x={sx}
                    y={sy - 13}
                    textAnchor="middle"
                    fill={isFire ? '#f87171' : '#fbbf24'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {hazard.type ? hazard.type.toUpperCase() : 'HAZARD'}
                  </text>
                </g>
              );
            })}

          {/* Victim Detections (Trapped Survivors) */}
          {showVictims &&
            victimDetections.map((victim) => {
              const vx = typeof victim.location?.x === 'number' ? victim.location.x : (victim.x ?? 0);
              const vy = typeof victim.location?.y === 'number' ? victim.location.y : (victim.y ?? 0);
              const sx = toScreenX(vx);
              const sy = toScreenY(vy);
              const confPercent = Math.round((victim.confidence ?? 0.85) * 100);

              return (
                <g
                  key={`victim-${victim.id}`}
                  className="cursor-pointer group"
                  onClick={() => setActiveItem(victim)}
                >
                  {/* Double expanding ping beacon */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={22}
                    fill="rgba(244, 63, 94, 0.2)"
                    className="animate-ping"
                    style={{ animationDuration: '2.5s' }}
                  />
                  <circle cx={sx} cy={sy} r={12} fill="rgba(244, 63, 94, 0.35)" />
                  <circle cx={sx} cy={sy} r={7} fill="#f43f5e" stroke="#ffffff" strokeWidth="1.8" />

                  {/* Victim Pill Badge */}
                  <rect
                    x={sx - 48}
                    y={sy - 25}
                    width={96}
                    height={16}
                    rx={4}
                    fill="#0d111e"
                    stroke="#f43f5e"
                    strokeWidth="1"
                  />
                  <text
                    x={sx}
                    y={sy - 13}
                    textAnchor="middle"
                    fill="#fda4af"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    VICTIM ({confPercent}%)
                  </text>
                </g>
              );
            })}

          {/* Live Robotic Units (Pathfinder Alpha, Beta, Overwatch Hawk) */}
          {robots.map((robot, idx) => {
            const rx = typeof robot.position?.x === 'number' ? robot.position.x : (robot.x ?? 0);
            const ry = typeof robot.position?.y === 'number' ? robot.position.y : (robot.y ?? 0);
            const sx = toScreenX(rx);
            const sy = toScreenY(ry);
            const isSelected = selectedRobotId === robot.id;
            const isUAV = (robot.name && robot.name.toLowerCase().includes('uav')) || (robot.type && robot.type.includes('UAV')) || (robot.name && robot.name.toLowerCase().includes('hawk'));
            const style = getRobotColor(robot, idx);
            const isActive = robot.status === 'ACTIVE' || robot.status === 'EXPLORING';

            return (
              <g
                key={`robot-${robot.id}`}
                className="cursor-pointer"
                onClick={() => {
                  setActiveItem(robot);
                  if (onSelectRobot) onSelectRobot(robot.id);
                }}
              >
                {/* Selected focus ring */}
                {isSelected && (
                  <circle
                    cx={sx}
                    cy={sy}
                    r={28}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    className="animate-spin"
                  />
                )}

                {/* Radar sweep / coverage glow */}
                <circle
                  cx={sx}
                  cy={sy}
                  r={22}
                  fill={isUAV ? 'url(#uavSweep)' : style.bg}
                />

                {/* Outer housing beacon */}
                <circle
                  cx={sx}
                  cy={sy}
                  r={12}
                  fill="#090d18"
                  stroke={isSelected ? '#38bdf8' : style.stroke}
                  strokeWidth="2.2"
                />

                {/* Robot status core */}
                <circle
                  cx={sx}
                  cy={sy}
                  r={5}
                  fill={isActive ? '#10b981' : '#f59e0b'}
                />

                {/* Callsign and position label */}
                <rect
                  x={sx - 52}
                  y={sy + 16}
                  width={104}
                  height={22}
                  rx={4}
                  fill="#070c18"
                  stroke={isSelected ? '#38bdf8' : '#334155'}
                  strokeWidth="1.2"
                />
                <text
                  x={sx}
                  y={sy + 28}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {robot.name || robot.robot_id}
                </text>
                <text
                  x={sx}
                  y={sy + 36}
                  textAnchor="middle"
                  fill={style.text}
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  ({rx.toFixed(1)}, {ry.toFixed(1)}) • {robot.battery ?? 100}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tactical Legend Card at bottom-left */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 font-mono text-[11px] space-y-1.5 backdrop-blur-md hidden sm:block shadow-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 pb-1 mb-1">
            GIS Tactical Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300">Active Ground / Air Fleet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-slate-300">Survivor Signature (Victim)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Hazard (Fire / Gas / Debris)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 bg-cyan-400" />
            <span className="text-slate-300">Odometry Path History</span>
          </div>
        </div>

        {/* Selected Marker Detail Card (High-Tech Floater HUD) */}
        {activeItem && (
          <div className="absolute top-4 right-4 w-80 bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl font-mono text-xs z-20 space-y-3">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider block">
                  {activeItem.robot_id || activeItem.callsign ? 'Robotic Unit Telemetry' : 'Tactical Sensor Target'}
                </span>
                <h4 className="font-bold text-white text-sm mt-0.5">
                  {activeItem.name || `${activeItem.type} #${String(activeItem.id).slice(0, 8)}`}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-slate-300 text-[11px]">
              {activeItem.status && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status:</span>
                  <StatusBadge status={activeItem.status} />
                </div>
              )}

              {activeItem.battery !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Battery Level:</span>
                  <span className="font-bold text-emerald-400">{activeItem.battery}%</span>
                </div>
              )}

              {activeItem.confidence !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Confidence:</span>
                  <span className="font-bold text-cyan-400">{Math.round(activeItem.confidence * 100)}%</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-400">Metric Coordinates:</span>
                <span className="text-slate-200 font-bold">
                  X: {activeItem.position?.x ?? activeItem.location?.x ?? activeItem.x ?? 0}m, 
                  Y: {activeItem.position?.y ?? activeItem.location?.y ?? activeItem.y ?? 0}m
                </span>
              </div>

              {activeItem.currentTask && (
                <div className="pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400 text-[10px] block uppercase">Current Task:</span>
                  <p className="text-slate-300 font-sans mt-0.5">{activeItem.currentTask}</p>
                </div>
              )}

              {activeItem.details && (
                <div className="pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400 text-[10px] block uppercase">Field Diagnostic:</span>
                  <p className="text-slate-300 font-sans mt-0.5">{activeItem.details}</p>
                </div>
              )}
            </div>

            {/* Quick Actions inside Floater HUD */}
            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
              {activeItem.status === 'PENDING' && onConfirmDetection && (
                <>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      onDismissDetection(activeItem.id);
                      setActiveItem(null);
                    }}
                    className="text-[10px] py-1 px-2.5 font-mono"
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      onConfirmDetection(activeItem.id);
                      setActiveItem(null);
                    }}
                    className="text-[10px] py-1 px-2.5 font-mono"
                  >
                    Confirm
                  </Button>
                </>
              )}
              {activeItem.battery !== undefined && onActionRobot && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onActionRobot(activeItem.id, activeItem.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
                    setActiveItem(null);
                  }}
                  className="text-[10px] py-1 px-2.5 font-mono"
                >
                  {activeItem.status === 'ACTIVE' ? 'Pause Unit' : 'Resume Unit'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Bottom Status Strip: Displays live cursor metric coordinates and pan info */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            CRS: Local Metric Cartesian Grid
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline text-cyan-400 font-semibold">
            CURSOR: ({cursorWorld.x > 0 ? `+${cursorWorld.x}` : cursorWorld.x}m, {cursorWorld.y > 0 ? `+${cursorWorld.y}` : cursorWorld.y}m)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-500">Drag to Pan • Click Pin for Telemetry HUD</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">Active Swarm Overwatch</span>
        </div>
      </div>
    </div>
  );
}
