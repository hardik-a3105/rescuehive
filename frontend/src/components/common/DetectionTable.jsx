import React, { useState } from 'react';
import { 
  UserCheck, 
  Flame, 
  AlertTriangle, 
  Box, 
  DoorOpen, 
  Check, 
  X, 
  Eye, 
  Sparkles 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';
import { Modal } from './Modal';

export function DetectionTable({
  detections = [],
  onConfirm,
  onDismiss,
  filterType,
  filterStatus,
  filterRobot,
}) {
  const [activeDetection, setActiveDetection] = useState(null);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Victim':
        return <UserCheck className="w-4 h-4 text-rose-500" />;
      case 'Fire':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'Gas Cylinder':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'Debris':
        return <Box className="w-4 h-4 text-slate-400" />;
      case 'Emergency Exit':
        return <DoorOpen className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">TIMESTAMP</th>
              <th className="py-3 px-4">SOURCE ROBOT</th>
              <th className="py-3 px-4">TARGET TYPE</th>
              <th className="py-3 px-4">AI CONFIDENCE</th>
              <th className="py-3 px-4">SECTOR / COORDS</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {detections.map((det) => (
              <tr
                key={det.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                  {det.timestamp}
                </td>

                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                  {det.robotName}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                    <span className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                      {getTypeIcon(det.type)}
                    </span>
                    <span>{det.type}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-bold">
                  <span
                    className={
                      det.confidence >= 0.9
                        ? 'text-emerald-500'
                        : det.confidence >= 0.75
                        ? 'text-cyan-500'
                        : 'text-amber-500'
                    }
                  >
                    {Math.round(det.confidence * 100)}%
                  </span>
                </td>

                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={det.location.sector}>
                  {det.location.sector}
                </td>

                <td className="py-3.5 px-4">
                  <StatusBadge status={det.status} />
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {det.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => onConfirm && onConfirm(det.id)}
                          title="Confirm Detection (Human-in-the-Loop)"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDismiss && onDismiss(det.id)}
                          title="Dismiss False Positive"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setActiveDetection(det)}
                      title="Inspect Thermal / Vision Frame"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detection Detail Modal */}
      {activeDetection && (
        <Modal
          isOpen={!!activeDetection}
          onClose={() => setActiveDetection(null)}
          title={`Detection Inspection #${activeDetection.id}`}
          subtitle={`Simulated Optical/Thermal Payload Stream • ${activeDetection.robotName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Mock Image Snapshot */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
              <img
                src={activeDetection.imageUrl}
                alt="Detection frame"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-400">
                AI BOUNDING BOX: {activeDetection.type.toUpperCase()} ({Math.round(activeDetection.confidence * 100)}%)
              </div>
              <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-md text-[10px] font-mono text-amber-400">
                [SIMULATION FRAME]
              </div>
            </div>

            {/* Metadata Detail */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Location Coordinates</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  X: {activeDetection.location.x}, Y: {activeDetection.location.y}
                </span>
                <span className="text-[11px] text-slate-500">{activeDetection.location.sector}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Sensor Pipeline</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {activeDetection.sensor}
                </span>
                <span className="text-[11px] text-slate-500">Timestamp: {activeDetection.timestamp}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-mono block mb-1">
                Field Diagnostic Note
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {activeDetection.details}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Current Status:</span>
                <StatusBadge status={activeDetection.status} />
              </div>

              <div className="flex items-center gap-2">
                {activeDetection.status === 'PENDING' && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        onDismiss(activeDetection.id);
                        setActiveDetection(null);
                      }}
                      className="font-mono text-xs"
                    >
                      Dismiss False Positive
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onConfirm(activeDetection.id);
                        setActiveDetection(null);
                      }}
                      className="font-mono text-xs"
                    >
                      Confirm Detection
                    </Button>
                  </>
                )}
                {activeDetection.status !== 'PENDING' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveDetection(null)}
                    className="font-mono text-xs"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
