import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Eye, 
  FileImage, 
  Cpu, 
  ShieldCheck, 
  ChevronDown, 
  Trash2,
  Terminal,
  Activity
} from 'lucide-react';
import { analyzeImage, getAiStatus } from '../../services/api/aiApi.js';
import { Button } from '../ui/Button';

export function ImageAnalysisSection({ missions = [], onAnalysisSuccess }) {
  // States: 'IDLE' | 'READY_TO_UPLOAD' | 'UPLOADING' | 'ANALYZING' | 'COMPLETED' | 'FAILED' | 'OLLAMA_UNAVAILABLE'
  const [analysisState, setAnalysisState] = useState('IDLE');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [checkingOllama, setCheckingOllama] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Check Ollama server availability
  const checkStatus = async () => {
    setCheckingOllama(true);
    try {
      const status = await getAiStatus();
      setOllamaStatus(status);
      if (!status.available || !status.model_ready) {
        if (analysisState === 'IDLE' || analysisState === 'READY_TO_UPLOAD') {
          // Keep as notice, don't necessarily block if user wants to retry
        }
      }
    } catch (err) {
      setOllamaStatus({
        available: false,
        model_ready: false,
        model: 'gemma3:4b',
        base_url: 'http://localhost:11434',
        message: err.message || 'Ollama server unreachable.',
      });
    } finally {
      setCheckingOllama(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleFile = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(`Unsupported format: ${file.type || 'unknown'}. Please upload a JPEG, PNG, or WebP image.`);
      setAnalysisState('FAILED');
      return;
    }

    // Validate size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage(`File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed upload size is 10MB.`);
      setAnalysisState('FAILED');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage('');
    setAnalysisResult(null);
    setAnalysisState('READY_TO_UPLOAD');
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMessage('');
    setAnalysisState('IDLE');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    // Quick pre-check
    if (ollamaStatus && !ollamaStatus.available) {
      setAnalysisState('OLLAMA_UNAVAILABLE');
      setErrorMessage(ollamaStatus.message);
      return;
    }

    setAnalysisState('UPLOADING');
    setErrorMessage('');

    try {
      // Small simulated transition to show uploading before heavy inference
      await new Promise((r) => setTimeout(r, 400));
      setAnalysisState('ANALYZING');

      const result = await analyzeImage(selectedFile, selectedMissionId || null);
      setAnalysisResult(result);
      setAnalysisState('COMPLETED');

      if (onAnalysisSuccess) {
        onAnalysisSuccess(result);
      }
    } catch (err) {
      const msg = err.data?.detail || err.message || 'Vision model inference failed.';
      if (err.status === 503 || msg.toLowerCase().includes('ollama')) {
        setAnalysisState('OLLAMA_UNAVAILABLE');
      } else {
        setAnalysisState('FAILED');
      }
      setErrorMessage(msg);
    }
  };

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center gap-2">
              <span>LOCAL OLLAMA VISION INTELLIGENCE</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-normal">
                Gemma 3 4B
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              Analyze photographic payloads for survivors, fire, structural collapse, and hazardous anomalies
            </div>
          </div>
        </div>

        {/* Runtime Status Pill */}
        <div className="flex items-center gap-2">
          {checkingOllama ? (
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <RefreshCw className="w-3 h-3 animate-spin" /> Checking runtime...
            </span>
          ) : ollamaStatus?.available && ollamaStatus?.model_ready ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Ollama Engine Ready (GPU)
            </span>
          ) : (
            <button
              onClick={checkStatus}
              title="Click to re-check Ollama status"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] transition-colors"
            >
              <AlertTriangle className="w-3 h-3" />
              Ollama Offline / Checking (Retry)
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-4">
        {/* Upload Zone & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Drag-and-drop / Preview (7 cols) */}
          <div className="lg:col-span-7">
            {!previewUrl ? (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px] ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : 'border-slate-700/80 hover:border-cyan-500/50 bg-slate-950/40 hover:bg-slate-950/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="font-mono text-xs font-semibold text-slate-200 mb-1">
                  Drag and drop disaster scene photo here, or <span className="text-cyan-400 underline">Browse</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Supported: JPEG, PNG, WebP • Max size: 10MB
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center group">
                <img
                  src={previewUrl}
                  alt="Inspection preview"
                  className="w-full h-full object-contain"
                />

                {/* Overlay actions */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={clearSelection}
                    disabled={analysisState === 'UPLOADING' || analysisState === 'ANALYZING'}
                    className="p-1.5 rounded-lg bg-slate-900/90 text-rose-400 hover:bg-rose-950/80 border border-slate-700 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Badge showing file info */}
                <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-md text-[11px] font-mono text-slate-300 flex items-center gap-2">
                  <FileImage className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                  <span className="text-slate-500">
                    ({(selectedFile?.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Operational Configuration & Action (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3 font-mono text-xs">
              <label className="block text-slate-300 font-semibold uppercase text-[11px]">
                Target Mission Context
              </label>
              <select
                value={selectedMissionId}
                onChange={(e) => setSelectedMissionId(e.target.value)}
                disabled={analysisState === 'UPLOADING' || analysisState === 'ANALYZING'}
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="">No Mission (Independent Recon Photo)</option>
                {missions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} [{m.status}]
                  </option>
                ))}
              </select>

              {/* Compliance & Governance Callout */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-1.5 font-sans text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  HUMAN-IN-THE-LOOP SAFEGUARD
                </div>
                <p className="leading-relaxed">
                  Vision LLM outputs are qualitative scene interpretations with uncalibrated estimates. Findings are saved with <strong className="text-amber-400 font-mono">PENDING</strong> status and require field operator review.
                </p>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-2">
              <Button
                variant="default"
                size="lg"
                onClick={handleAnalyze}
                disabled={
                  !selectedFile ||
                  analysisState === 'UPLOADING' ||
                  analysisState === 'ANALYZING'
                }
                className="w-full justify-center gap-2 font-mono text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950"
              >
                {analysisState === 'UPLOADING' && (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Uploading Image to Core...
                  </>
                )}
                {analysisState === 'ANALYZING' && (
                  <>
                    <Cpu className="w-4 h-4 animate-spin text-cyan-300" />
                    Running Gemma 3 4B Vision Inference...
                  </>
                )}
                {analysisState !== 'UPLOADING' && analysisState !== 'ANALYZING' && (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run AI Scene Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* State Display: Analyzing Indicator */}
        {analysisState === 'ANALYZING' && (
          <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 flex items-center gap-3 font-mono text-xs text-cyan-300 animate-pulse">
            <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
            <div>
              <div className="font-bold">Multimodal Vision Inference in Progress</div>
              <div className="text-[11px] text-cyan-400/80 font-sans">
                Gemma 3 4B is examining visible scene pixels for survivors, smoke, flames, and structural obstacles on your RTX 3050 GPU...
              </div>
            </div>
          </div>
        )}

        {/* State Display: Ollama Unavailable Warning */}
        {analysisState === 'OLLAMA_UNAVAILABLE' && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-200 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Ollama Vision Engine Unavailable</span>
              </div>
              <button
                onClick={checkStatus}
                className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700 text-[11px]"
              >
                Retry Check
              </button>
            </div>
            <p className="text-[11px] font-sans text-rose-300/90 leading-relaxed">
              {errorMessage || 'The local Ollama server is not running or the required vision model is not pulled.'}
            </p>
            <div className="p-2.5 rounded bg-black/60 border border-rose-900/50 text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-cyan-400" /> Commands to run on Windows host:
              </div>
              <div className="text-cyan-400">1. ollama serve</div>
              <div className="text-cyan-400">2. ollama run gemma3:4b</div>
            </div>
          </div>
        )}

        {/* State Display: General Error */}
        {analysisState === 'FAILED' && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-200 flex items-start justify-between gap-3 font-mono text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5" />
              <div>
                <div className="font-bold text-rose-300">Analysis Failed</div>
                <div className="text-[11px] text-rose-300/90 font-sans mt-0.5">{errorMessage}</div>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              className="px-3 py-1.5 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-100 border border-rose-700 text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* State Display: Analysis Completed Banner */}
        {analysisState === 'COMPLETED' && analysisResult && (
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-emerald-400">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>AI Vision Analysis Complete & Persisted in PostgreSQL</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Model: {analysisResult.model_name}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-900/50">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Scene Summary
              </span>
              <p className="text-slate-200 font-sans leading-relaxed text-xs">
                {analysisResult.scene_summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 pt-1">
              <span>
                Saved <strong>{analysisResult.detections?.length || 0}</strong> detection records to queue with status <strong className="text-amber-400">PENDING</strong>.
              </span>
              <span className="text-cyan-400">
                Scroll down to review and confirm or dismiss findings ↓
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
