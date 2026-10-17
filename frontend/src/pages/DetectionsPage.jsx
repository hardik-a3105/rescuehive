import React, { useState, useMemo } from 'react';
import { 
  Crosshair, 
  Filter, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { PageHeader } from '../components/common/PageHeader';
import { DetectionTable } from '../components/common/DetectionTable';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/ui/Button';

export function DetectionsPage() {
  const { detections, robots, loading, errors, updateDetectionStatus, fetchDetections } = useMission();

  // Filters state
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRobot, setSelectedRobot] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [minConfidence, setMinConfidence] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');

  const typesList = ['ALL', 'Victim', 'Fire', 'Gas Cylinder', 'Debris', 'Emergency Exit', 'Helmet', 'Backpack'];
  const statusesList = ['ALL', 'PENDING', 'CONFIRMED', 'DISMISSED'];

  const filteredDetections = useMemo(() => {
    return detections.filter((det) => {
      if (selectedType !== 'ALL' && det.type !== selectedType && det.detection_type !== selectedType) return false;
      if (selectedRobot !== 'ALL' && det.robotId !== selectedRobot && det.robot_id !== selectedRobot) return false;
      if (selectedStatus !== 'ALL' && det.status !== selectedStatus) return false;
      if ((det.confidence ?? 1) < parseFloat(minConfidence)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchSector = det.location?.sector?.toLowerCase().includes(query);
        const matchDetails = det.details?.toLowerCase().includes(query);
        const matchId = String(det.id)?.toLowerCase().includes(query);
        if (!matchSector && !matchDetails && !matchId) return false;
      }
      return true;
    });
  }, [detections, selectedType, selectedRobot, selectedStatus, minConfidence, searchQuery]);

  const pendingCount = detections.filter((d) => d.status === 'PENDING').length;

  // Loading state
  if (loading.detections && detections.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <LoadingState message="Retrieving AI detections queue from PostgreSQL..." />
      </div>
    );
  }

  // Error state
  if (errors.detections && detections.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <ErrorState
          title="Detections Feed Offline"
          message={errors.detections.message || 'Unable to retrieve detections from FastAPI.'}
          status={errors.detections.status}
          onRetry={fetchDetections}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="AI Detections Queue"
        subtitle="Human-in-the-loop review of computer vision detections and hazard anomalies (FastAPI)"
        badge={
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs border border-amber-500/30 font-semibold">
            {pendingCount} PENDING REVIEW
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDetections}
              disabled={loading.detections}
              className="gap-1.5 font-mono text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading.detections ? 'animate-spin' : ''}`} />
              Sync Detections
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <Filter className="w-4 h-4 text-cyan-500" />
            <span>FILTER ANOMALIES</span>
          </div>
          <button
            onClick={() => {
              setSelectedType('ALL');
              setSelectedRobot('ALL');
              setSelectedStatus('ALL');
              setMinConfidence('0');
              setSearchQuery('');
            }}
            className="text-[11px] text-slate-400 hover:text-cyan-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search text */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sector / ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {typesList.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>
          </div>

          {/* Robot filter */}
          <div>
            <select
              value={selectedRobot}
              onChange={(e) => setSelectedRobot(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Robot: All Fleet</option>
              {robots.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.robot_id || r.id})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {statusesList.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence threshold */}
          <div>
            <select
              value={minConfidence}
              onChange={(e) => setMinConfidence(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="0">Confidence: All (&gt;0%)</option>
              <option value="0.75">Confidence: &gt;75%</option>
              <option value="0.90">Confidence: &gt;90% High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detections Table / Empty State */}
      {filteredDetections.length > 0 ? (
        <DetectionTable
          detections={filteredDetections}
          onConfirm={(id) => updateDetectionStatus(id, 'CONFIRMED')}
          onDismiss={(id) => updateDetectionStatus(id, 'DISMISSED')}
        />
      ) : (
        <EmptyState
          icon={Crosshair}
          title="No Detections Found"
          description={
            detections.length === 0
              ? 'No detections recorded yet in PostgreSQL. Deploy active robots to detect survivors and hazards.'
              : 'No detection entries matched your current filter combinations.'
          }
          actionText={detections.length > 0 ? 'Clear All Filters' : 'Refresh Queue'}
          onAction={() => {
            if (detections.length > 0) {
              setSelectedType('ALL');
              setSelectedRobot('ALL');
              setSelectedStatus('ALL');
              setMinConfidence('0');
              setSearchQuery('');
            } else {
              fetchDetections();
            }
          }}
        />
      )}
    </div>
  );
}
