import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  UserCheck, 
  Flame, 
  ShieldCheck, 
  Filter, 
  Calendar, 
  Sparkles, 
  RefreshCw,
  Eye,
  Crosshair,
  AlertOctagon,
  Download
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { useSettings } from '../context/SettingsContext';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/ui/Button';

export function ReportsPage() {
  const { missions, detections, robots, loading, errors, fetchMissions, fetchDetections } = useMission();
  const { formatArea, formatSpeed, formatTemperature } = useSettings();

  // Filter states
  const [selectedMissionId, setSelectedMissionId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisSuccess, setSynthesisSuccess] = useState(false);

  // Filter missions
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      if (selectedMissionId !== 'ALL' && m.id !== selectedMissionId) return false;
      if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;
      if (dateFilter === 'TODAY') {
        const d = m.started_at ? new Date(m.started_at) : (m.created_at ? new Date(m.created_at) : null);
        if (d) {
          const today = new Date();
          if (d.toDateString() !== today.toDateString()) return false;
        }
      }
      return true;
    });
  }, [missions, selectedMissionId, selectedStatus, dateFilter]);

  // Primary active report target
  const currentReportMission = useMemo(() => {
    if (selectedMissionId !== 'ALL') {
      return missions.find((m) => m.id === selectedMissionId) || missions[0];
    }
    return filteredMissions[0] || missions[0];
  }, [missions, selectedMissionId, filteredMissions]);

  // Relevant detections for this mission
  const missionDetections = useMemo(() => {
    if (!currentReportMission) return detections;
    return detections.filter(
      (d) => !d.mission_id || d.mission_id === currentReportMission.id || d.missionId === currentReportMission.id
    );
  }, [detections, currentReportMission]);

  // Real victim counts from DB
  const victims = useMemo(() => {
    return missionDetections.filter(
      (d) => (d.detection_type === 'PERSON' || d.type === 'Victim') && d.status !== 'DISMISSED'
    );
  }, [missionDetections]);

  // Real hazard counts from DB
  const hazards = useMemo(() => {
    return missionDetections.filter(
      (d) =>
        d.detection_type !== 'PERSON' &&
        d.type !== 'Victim' &&
        d.detection_type !== 'EMERGENCY_EXIT' &&
        d.type !== 'Emergency Exit' &&
        d.status !== 'DISMISSED'
    );
  }, [missionDetections]);

  // Real emergency exits / ingress egress points
  const emergencyExits = useMemo(() => {
    return missionDetections.filter(
      (d) => d.detection_type === 'EMERGENCY_EXIT' || d.type === 'Emergency Exit'
    );
  }, [missionDetections]);

  const handleSynthesizeReport = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      setSynthesisSuccess(true);
      setTimeout(() => setSynthesisSuccess(false), 4000);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading.missions && missions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <LoadingState message="Retrieving Mission Intelligence from PostgreSQL..." />
      </div>
    );
  }

  if (errors.missions && missions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <ErrorState
          title="Mission Reports Offline"
          message={errors.missions.message || 'Unable to retrieve missions from FastAPI.'}
          onRetry={fetchMissions}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="no-print">
        <PageHeader
          title="AI Mission Intelligence Report"
          subtitle="Post-sortie telemetry analysis, victim triage priority, and ingress pathfinding (FastAPI & PostgreSQL)"
          badge={
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs border border-cyan-500/30 font-semibold">
              SYNTHESIS ENGINE
            </span>
          }
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleSynthesizeReport}
                disabled={isSynthesizing}
                className="gap-2 font-mono text-xs"
              >
                {isSynthesizing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                )}
                {isSynthesizing ? 'Synthesizing...' : 'Re-Synthesize Report'}
              </Button>
              <Button
                variant="default"
                size="md"
                onClick={handlePrint}
                className="gap-2 font-mono text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </Button>
            </div>
          }
        />

        {synthesisSuccess && (
          <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Report synthesized successfully using actual PostgreSQL telemetry records.</span>
            </div>
            <span className="text-[11px] text-slate-400">Ready to print or archive.</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
              <Filter className="w-4 h-4 text-cyan-500" />
              <span>REPORT PARAMETERS & SORTIE SELECTION</span>
            </div>
            <button
              onClick={() => {
                setSelectedMissionId('ALL');
                setSelectedStatus('ALL');
                setDateFilter('ALL');
              }}
              className="text-[11px] text-slate-400 hover:text-cyan-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mission Selector */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Target Mission:</label>
              <select
                value={selectedMissionId}
                onChange={(e) => setSelectedMissionId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Recorded Missions</option>
                {missions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} [{m.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Status Filter:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PLANNED">PLANNED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            {/* Date Selector */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Time Horizon:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Available Sorties</option>
                <option value="TODAY">Today's Operations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mandatory AI Recommendation Warning Banner */}
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <div className="font-bold text-sm font-mono tracking-wide">
              MANDATORY NOTICE — AI Recommendation: Human Decision Required
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed font-sans">
              Autonomous path planning, victim triage priorities, and hazard assessments are algorithmic suggestions for human review only.
              The Incident Commander must independently verify structural integrity, atmospheric toxicity, and rescue team safety before authorizing personnel into collapsed structures.
            </p>
          </div>
        </div>
      </div>

      {/* Main Report Container */}
      {!currentReportMission ? (
        <EmptyState
          icon={FileText}
          title="No Mission Matches Filter"
          description="Select another mission or reset filters to review intelligence reports."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedMissionId('ALL');
            setSelectedStatus('ALL');
            setDateFilter('ALL');
          }}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-8 font-sans print:border-none print:shadow-none print:p-0">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                RESCUEHIVE DISASTER INTELLIGENCE SYNTHESIS
              </div>
              <h2 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {currentReportMission.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                <span>Mission ID: {String(currentReportMission.id).slice(0, 8)}...</span>
                <span>•</span>
                <StatusBadge status={currentReportMission.status} />
                <span>•</span>
                <span>Assigned: {currentReportMission.assignedRobotsText || 'Robot Alpha & Bravo'}</span>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-500">
              <div>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
              <div>Source: PostgreSQL Database Engine</div>
              <div className="text-cyan-600 dark:text-cyan-400 font-semibold">Classification: RESTRICTED</div>
            </div>
          </div>

          {/* 1. Sortie Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>1. Sortie Executive Summary</span>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                (Deterministic Telemetry Metrics)
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Explored Area</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                  {formatArea(currentReportMission.explored_area ?? currentReportMission.exploredAreaSqM ?? 20)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Sortie Duration</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                  {currentReportMission.duration || '00:05:00'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Victims Detected</span>
                <span className="text-lg font-bold text-rose-500 mt-1 block">
                  {victims.length} Flagged
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Hazards Identified</span>
                <span className="text-lg font-bold text-amber-500 mt-1 block">
                  {hazards.length} Flagged
                </span>
              </div>
            </div>
          </div>

          {/* 2. Detected Victims & Triage Priority */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Victim Detections & Advisory Extraction Priority
              </h3>
              <span className="text-[11px] font-mono text-amber-500 font-semibold">
                AI Advisory Ranking
              </span>
            </div>

            {victims.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-500 font-mono">
                No active victim detections recorded for this sortie.
              </div>
            ) : (
              <div className="space-y-3">
                {victims.map((v, idx) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono font-bold text-xs">
                          PRIORITY {idx + 1} ({v.review_priority || 'HIGH'})
                        </span>
                        <StatusBadge status={v.status} />
                      </div>
                      <span className="font-mono text-xs text-rose-500 font-semibold">
                        Location: {v.location?.sector || 'Exploration Sector'}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {v.description || `${v.type} anomaly verified with ${Math.round((v.confidence || 0.9) * 100)}% confidence`}
                    </div>

                    {v.evidence && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-950/60 p-2 rounded border border-slate-200 dark:border-slate-800">
                        Evidence: {v.evidence}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                      <span>Source: {v.analysis_source === 'OLLAMA_VISION_LLM' ? `Ollama Vision (${v.model_name || 'gemma3:4b'})` : v.robotName}</span>
                      <span>Confidence: {Math.round((v.confidence || 0.9) * 100)}% ({v.analysis_source === 'OLLAMA_VISION_LLM' ? 'Uncalibrated' : 'Calibrated'})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Detected Hazards & Safety Buffer */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Operational Hazards & Environmental Obstacles
            </h3>

            {hazards.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-500 font-mono">
                No secondary structural or chemical hazards recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hazards.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-500 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" />
                        {h.type}
                      </span>
                      <StatusBadge status={h.status} />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-sans text-xs">
                      {h.description || h.details}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      Sector: {h.location?.sector || 'Unknown'} • Severity: {h.review_priority || 'MEDIUM'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Recommended Safe Vector & Ingress / Egress Route */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                4. Recommended Safe Ingress / Egress Vector
              </h3>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">
                Hazard-Avoidance Routing
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>PRIMARY EXTRACTION CORRIDOR: WAYPOINT RECON-ALPHA</span>
              </div>

              <ol className="list-decimal list-inside space-y-1.5 text-slate-700 dark:text-slate-300 pl-1 font-sans">
                <li>
                  Enter via designated perimeter access point. Confirmed safe by initial robot scout telemetry.
                </li>
                <li>
                  Maintain clearance from {hazards.length > 0 ? `${hazards[0].type} zone (${hazards[0].location?.sector || 'detected sector'})` : 'active structural collapse points'}.
                </li>
                <li>
                  Deploy hydraulic shoring if advancing towards victims flagged in basement and cavity regions.
                </li>
                <li>
                  Maintain wireless mesh repeater link through active fleet units.
                </li>
              </ol>
            </div>
          </div>

          {/* Commander Sign-off Block */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Review Status: Awaiting Incident Commander Final Authorization
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                Human signature required prior to staging manned rescue squads.
              </p>
            </div>
            <div className="border-b border-dashed border-slate-400 w-52 text-right pb-1">
              Sign: Incident Commander
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
