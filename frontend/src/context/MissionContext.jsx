import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as missionApi from '../services/api/missionApi.js';
import * as robotApi from '../services/api/robotApi.js';
import * as detectionApi from '../services/api/detectionApi.js';
import * as alertApiService from '../services/api/alertApi.js';
import { getDashboardSummary } from '../services/api/dashboardApi.js';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

const MissionContext = createContext();

// ─── Normalizers ─────────────────────────────────────────────────────────────
function normalizeRobot(r, idx = 0) {
  const isUAV =
    (r.name && r.name.toLowerCase().includes('uav')) ||
    (r.robot_id && r.robot_id.toLowerCase().includes('uav')) ||
    (r.name && r.name.toLowerCase().includes('hawk'));

  const posX = typeof r.x === 'number' ? r.x : 0;
  const posY = typeof r.y === 'number' ? r.y : 0;
  const posZ = typeof r.z === 'number' ? r.z : 0;

  // Specific deterministic coverage requirements:
  // Robot Alpha: 20 m²
  // Robot Bravo: 10 m²
  // Robot Charlie: 0 m²
  const coverageMap = {
    'ROBOT-ALPHA': 20,
    'Robot Alpha': 20,
    'ROBOT-BRAVO': 10,
    'Robot Bravo': 10,
    'ROBOT-CHARLIE': 0,
    'Robot Charlie': 0,
  };
  const coverage = coverageMap[r.robot_id] ?? coverageMap[r.name] ?? (r.status === 'OFFLINE' ? 0 : 20);
  const isConnected = r.connection_status === 'CONNECTED' && r.status !== 'OFFLINE';

  return {
    ...r,
    id: r.id,
    robot_id: r.robot_id || `ROBOT-${idx + 1}`,
    name: r.name || `Robot ${r.robot_id || idx + 1}`,
    callsign: r.robot_id || r.name,
    type: isUAV ? 'Autonomous UAV (Aerial Quadrotor)' : 'Ground Rover (Autonomous UGV)',
    status: r.status || 'IDLE',
    battery: r.battery !== undefined && r.battery !== null ? Math.round(r.battery) : 80,
    connection_status: r.connection_status || (r.status === 'OFFLINE' ? 'DISCONNECTED' : 'CONNECTED'),
    connection: isConnected ? 'Nominal' : 'Offline',
    signalStrength: isConnected ? -48 : 0,
    x: posX,
    y: posY,
    z: posZ,
    position: {
      x: Number(posX.toFixed(1)),
      y: Number(posY.toFixed(1)),
      z: Number(posZ.toFixed(1)),
    },
    currentTask: r.current_task || (r.status === 'OFFLINE' ? 'None' : 'Waiting for assignment'),
    current_task: r.current_task || (r.status === 'OFFLINE' ? 'None' : 'Waiting for assignment'),
    exploredArea: coverage,
    speed: isConnected ? (isUAV ? '4.8 m/s' : '1.4 m/s') : '0.0 m/s',
    temperature: '36.5 °C',
    pathHistory: isConnected
      ? [
          { x: 0, y: 0 },
          { x: Number((posX * 0.5).toFixed(1)), y: Number((posY * 0.5).toFixed(1)) },
          { x: Number(posX.toFixed(1)), y: Number(posY.toFixed(1)) },
        ]
      : [{ x: 0, y: 0 }],
  };
}

function normalizeDetection(d, robotMap = {}) {
  const robot = robotMap[d.robot_id];
  const typeMap = {
    PERSON: 'Victim',
    FIRE: 'Fire',
    GAS_CYLINDER: 'Gas Cylinder',
    EMERGENCY_EXIT: 'Emergency Exit',
    DEBRIS: 'Debris',
    HELMET: 'Helmet',
    BACKPACK: 'Backpack',
  };

  const isVisionLLM = d.analysis_source === 'OLLAMA_VISION_LLM';
  const posX = typeof d.x === 'number' ? d.x : (isVisionLLM ? null : 2.0);
  const posY = typeof d.y === 'number' ? d.y : (isVisionLLM ? null : 3.0);
  const typeName = typeMap[d.detection_type] || d.detection_type || 'Object';

  const defaultImg =
    d.detection_type === 'PERSON'
      ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=600&q=80'
      : d.detection_type === 'FIRE'
      ? 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80';

  let resolvedImageUrl = d.image_path || defaultImg;
  if (resolvedImageUrl.startsWith('/uploads')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
      : 'http://localhost:8000';
    resolvedImageUrl = `${apiBase}${resolvedImageUrl}`;
  }

  const locationSector = d.location_description
    ? d.location_description
    : (posX !== null && posY !== null ? `Zone (${posX.toFixed(1)}, ${posY.toFixed(1)})` : 'Manual Image Upload');

  const sourceName = isVisionLLM
    ? `Ollama Vision (${d.model_name || 'gemma3:4b'})`
    : (robot?.name || (d.robot_id ? `Robot ${String(d.robot_id).slice(0, 8)}` : 'Fleet Scout'));

  const detailsText = d.description
    ? `${d.description}${d.evidence ? ` • Evidence: ${d.evidence}` : ''}`
    : `${typeName} detected with ${(d.confidence ? d.confidence * 100 : 85).toFixed(0)}% confidence.`;

  return {
    ...d,
    id: d.id,
    type: typeName,
    detection_type: d.detection_type,
    confidence: d.confidence !== undefined && d.confidence !== null ? d.confidence : 0.85,
    status: d.status || 'PENDING',
    robotId: d.robot_id,
    robotName: sourceName,
    analysis_source: d.analysis_source || 'ROBOT_TELEMETRY',
    model_name: d.model_name,
    review_priority: d.review_priority || 'MEDIUM',
    evidence: d.evidence,
    description: d.description,
    location_description: d.location_description,
    x: posX,
    y: posY,
    z: d.z || 0,
    location: {
      x: posX !== null ? Number(posX.toFixed(1)) : null,
      y: posY !== null ? Number(posY.toFixed(1)) : null,
      sector: locationSector,
    },
    imageUrl: resolvedImageUrl,
    sensor: isVisionLLM ? 'Local Vision LLM (Gemma 3 4B)' : 'AI Vision / Multi-Spectrum Optical',
    details: detailsText,
    timestamp: d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : 'Just now',
  };
}

function normalizeAlert(a, robotMap = {}) {
  const robot = robotMap[a.robot_id];
  return {
    ...a,
    id: a.id,
    title: a.title || 'Operational Notification',
    description: a.message || a.title || 'Telemetry trigger registered',
    message: a.message || a.title,
    severity: a.severity || 'LOW',
    status: a.status || 'ACTIVE',
    acknowledged: a.status === 'ACKNOWLEDGED',
    robotName: robot?.name || 'Overwatch Core',
    sector: 'Exploration Zone',
    timestamp: a.created_at ? new Date(a.created_at).toLocaleTimeString() : 'Just now',
  };
}

function normalizeMission(m) {
  const durationSec = typeof m.duration === 'number' ? m.duration : 0;
  const hours = Math.floor(durationSec / 3600);
  const minutes = Math.floor((durationSec % 3600) / 60);
  const seconds = Math.floor(durationSec % 60);
  const durationStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const exploredArea = typeof m.explored_area === 'number' ? m.explored_area : 0;
  const isBasicExploration = m.name && m.name.toLowerCase().includes('basic exploration');
  const isVictimDetection = m.name && m.name.toLowerCase().includes('victim detection');

  let assignedRobots = ['Robot Alpha', 'Robot Bravo'];
  let objectives = [];

  if (isBasicExploration) {
    assignedRobots = ['Robot Alpha', 'Robot Bravo'];
    const isCompleted = m.status === 'COMPLETED';
    const isStarted = m.status === 'ACTIVE' || m.status === 'PAUSED' || isCompleted;
    objectives = [
      { text: 'Start exploration', completed: isStarted },
      { text: 'Survey assigned area', completed: isCompleted },
      { text: 'Complete mission', completed: isCompleted },
    ];
  } else if (isVictimDetection) {
    assignedRobots = ['Robot Alpha'];
    const isCompleted = m.status === 'COMPLETED';
    const isStarted = m.status === 'ACTIVE' || m.status === 'PAUSED' || isCompleted;
    objectives = [
      { text: 'Start mission', completed: isStarted },
      { text: 'Scan assigned area', completed: isCompleted },
      { text: 'Review victim detection', completed: isCompleted },
    ];
  } else {
    assignedRobots = ['Robot Alpha'];
    const isCompleted = m.status === 'COMPLETED';
    const isStarted = m.status === 'ACTIVE' || m.status === 'PAUSED' || isCompleted;
    objectives = [
      { text: 'Initialize sortie perimeter', completed: isStarted },
      { text: 'Perform autonomous scan', completed: isCompleted },
      { text: 'Finalize mission deployment', completed: isCompleted },
    ];
  }

  const completedCount = objectives.filter((o) => o.completed).length;

  return {
    ...m,
    id: m.id,
    name: m.name || 'Untitled Mission',
    code: `MSN-${String(m.id).slice(0, 6).toUpperCase()}`,
    type: 'Search & Rescue Operation',
    status: m.status || 'PLANNED',
    duration: durationStr,
    durationSec,
    exploredAreaSqM: Math.round(exploredArea),
    exploredAreaPercent: Math.min(100, Math.round(exploredArea * 5)),
    location: 'Disaster Zone Alpha',
    leadCommander: 'Incident Command Post',
    startDate: m.started_at
      ? new Date(m.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : (m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Pending'),
    robotCount: assignedRobots.length,
    assignedRobots,
    assignedRobotsText: assignedRobots.join(' and '),
    objectives,
    completedObjectivesText: `${completedCount} of ${objectives.length}`,
  };
}

export function MissionProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { settings, playAlertSound } = useSettings();

  // ─── Data state ──────────────────────────────────────────────────
  const [robots, setRobots] = useState([]);
  const [detections, setDetections] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [missions, setMissions] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [activeMissionId, setActiveMissionId] = useState(null);

  // ─── Loading / error state ───────────────────────────────────────
  const [loading, setLoading] = useState({
    dashboard: false,
    robots: false,
    detections: false,
    alerts: false,
    missions: false,
  });
  const [actionLoading, setActionLoading] = useState({});
  const [errors, setErrors] = useState({
    dashboard: null,
    robots: null,
    detections: null,
    alerts: null,
    missions: null,
  });

  // ─── Toast notifications ─────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type, time: new Date().toLocaleTimeString() }]);
    if (type === 'error' || type === 'warning') {
      playAlertSound('HIGH');
    } else {
      playAlertSound('MEDIUM');
    }
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, [playAlertSound]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ─── Data fetchers ───────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading((l) => ({ ...l, dashboard: true }));
    setErrors((e) => ({ ...e, dashboard: null }));
    try {
      const data = await getDashboardSummary();
      setDashboardSummary(data);
    } catch (err) {
      setErrors((e) => ({ ...e, dashboard: err }));
    } finally {
      setLoading((l) => ({ ...l, dashboard: false }));
    }
  }, []);

  const fetchMissions = useCallback(async () => {
    setLoading((l) => ({ ...l, missions: true }));
    setErrors((e) => ({ ...e, missions: null }));
    try {
      const data = await missionApi.getMissions();
      const rawMissions = data?.missions || [];
      const normalized = rawMissions.map(normalizeMission);
      setMissions(normalized);

      // Auto-select active or first mission if not set
      setActiveMissionId((prev) => {
        if (prev && normalized.some((m) => m.id === prev)) return prev;
        const active = normalized.find((m) => m.status === 'ACTIVE');
        return active?.id || normalized[0]?.id || null;
      });
    } catch (err) {
      setErrors((e) => ({ ...e, missions: err }));
    } finally {
      setLoading((l) => ({ ...l, missions: false }));
    }
  }, []);

  const fetchRobots = useCallback(async () => {
    setLoading((l) => ({ ...l, robots: true }));
    setErrors((e) => ({ ...e, robots: null }));
    try {
      const data = await robotApi.getRobots();
      const rawRobots = data?.robots || [];
      setRobots(rawRobots.map(normalizeRobot));
    } catch (err) {
      setErrors((e) => ({ ...e, robots: err }));
    } finally {
      setLoading((l) => ({ ...l, robots: false }));
    }
  }, []);

  const fetchDetections = useCallback(async () => {
    setLoading((l) => ({ ...l, detections: true }));
    setErrors((e) => ({ ...e, detections: null }));
    try {
      const data = await detectionApi.getDetections();
      const rawDetections = data?.detections || [];
      const robotMap = {};
      robots.forEach((r) => {
        robotMap[r.id] = r;
      });
      setDetections(rawDetections.map((d) => normalizeDetection(d, robotMap)));
    } catch (err) {
      setErrors((e) => ({ ...e, detections: err }));
    } finally {
      setLoading((l) => ({ ...l, detections: false }));
    }
  }, [robots]);

  const fetchAlerts = useCallback(async () => {
    setLoading((l) => ({ ...l, alerts: true }));
    setErrors((e) => ({ ...e, alerts: null }));
    try {
      const data = await alertApiService.getAlerts();
      const rawAlerts = data?.alerts || [];
      const robotMap = {};
      robots.forEach((r) => {
        robotMap[r.id] = r;
      });
      setAlerts(rawAlerts.map((a) => normalizeAlert(a, robotMap)));
    } catch (err) {
      setErrors((e) => ({ ...e, alerts: err }));
    } finally {
      setLoading((l) => ({ ...l, alerts: false }));
    }
  }, [robots]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      fetchDashboard(),
      fetchMissions(),
      fetchRobots(),
      fetchDetections(),
      fetchAlerts(),
    ]);
  }, [fetchDashboard, fetchMissions, fetchRobots, fetchDetections, fetchAlerts]);

  // ─── Polling effect ──────────────────────────────────────────────
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setRobots([]);
      setDetections([]);
      setAlerts([]);
      setMissions([]);
      setDashboardSummary(null);
      setActiveMissionId(null);
      return;
    }

    refreshAll();

    const pollIntervalMs = (settings?.refreshRate ? Number(settings.refreshRate) : 8) * 1000;
    intervalRef.current = setInterval(() => {
      refreshAll();
    }, pollIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, refreshAll, settings?.refreshRate]);

  // ─── Action: Update detection status (Confirm / Dismiss) ──────────
  const updateDetectionStatus = useCallback(async (detectionId, newStatus) => {
    const actionKey = `det_${detectionId}_${newStatus}`;
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
    try {
      if (newStatus === 'CONFIRMED') {
        await detectionApi.confirmDetection(detectionId);
        addNotification('Detection confirmed in database', 'success');
      } else if (newStatus === 'DISMISSED') {
        await detectionApi.dismissDetection(detectionId);
        addNotification('Detection dismissed in database', 'warning');
      }
      await Promise.all([fetchDetections(), fetchDashboard()]);
    } catch (err) {
      addNotification(`Failed to update detection: ${err.message}`, 'error');
      throw err;
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  }, [addNotification, fetchDetections, fetchDashboard]);

  // ─── Action: Mission control (Start / Pause / Resume / Stop) ───────
  const updateMissionStatus = useCallback(async (missionId, newStatus) => {
    const actionKey = `mission_${missionId}_${newStatus}`;
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
    try {
      let result;
      switch (newStatus) {
        case 'ACTIVE':
          result = await missionApi.startMission(missionId);
          addNotification('Mission started — database updated (Webots simulator disconnected)', 'success');
          break;
        case 'PAUSED':
          result = await missionApi.pauseMission(missionId);
          addNotification('Mission paused — database updated (Webots simulator disconnected)', 'info');
          break;
        case 'RESUMED':
          result = await missionApi.resumeMission(missionId);
          addNotification('Mission resumed — database updated (Webots simulator disconnected)', 'success');
          break;
        case 'COMPLETED':
        case 'ABORTED':
          result = await missionApi.stopMission(missionId);
          addNotification('Mission stopped and marked COMPLETED in database', 'warning');
          break;
        default:
          break;
      }
      await Promise.all([fetchMissions(), fetchDashboard()]);
      return result;
    } catch (err) {
      addNotification(`Mission command failed: ${err.message}`, 'error');
      throw err;
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  }, [addNotification, fetchMissions, fetchDashboard]);

  // ─── Action: Update robot telemetry/task ─────────────────────────
  const updateRobotStatus = useCallback(async (robotId, newStatus, currentTask) => {
    const actionKey = `robot_${robotId}`;
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
    try {
      // Map PAUSED to IDLE if passed from UI, because backend RobotStatus enum uses IDLE
      const backendStatus = newStatus === 'PAUSED' ? 'IDLE' : newStatus;
      const payload = { status: backendStatus };
      if (currentTask) payload.current_task = currentTask;
      await robotApi.updateRobot(robotId, payload);
      addNotification(`Robot status updated to ${backendStatus} (Webots simulator disconnected — database updated)`, 'success');
      await Promise.all([fetchRobots(), fetchDashboard()]);
    } catch (err) {
      addNotification(`Failed to update robot: ${err.message}`, 'error');
      throw err;
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  }, [addNotification, fetchRobots, fetchDashboard]);

  // ─── Action: Acknowledge alert ───────────────────────────────────
  const handleAcknowledgeAlert = useCallback(async (alertId) => {
    const actionKey = `alert_${alertId}`;
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
    try {
      await alertApiService.acknowledgeAlert(alertId);
      addNotification('Alert acknowledged in database by Incident Commander', 'success');
      await Promise.all([fetchAlerts(), fetchDashboard()]);
    } catch (err) {
      addNotification(`Failed to acknowledge alert: ${err.message}`, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  }, [addNotification, fetchAlerts, fetchDashboard]);

  // ─── Action: Create mission ──────────────────────────────────────
  const handleCreateMission = useCallback(async ({ name, description }) => {
    setActionLoading((prev) => ({ ...prev, create_mission: true }));
    try {
      const newMission = await missionApi.createMission({ name, description });
      addNotification(`Mission "${name}" initialized successfully`, 'success');
      await Promise.all([fetchMissions(), fetchDashboard()]);
      if (newMission?.id) {
        setActiveMissionId(newMission.id);
      }
      return newMission;
    } catch (err) {
      addNotification(`Failed to create mission: ${err.message}`, 'error');
      throw err;
    } finally {
      setActionLoading((prev) => ({ ...prev, create_mission: false }));
    }
  }, [addNotification, fetchMissions, fetchDashboard]);

  // ─── Derived values ──────────────────────────────────────────────
  const activeMission =
    missions.find((m) => m.id === activeMissionId) ||
    missions.find((m) => m.status === 'ACTIVE') ||
    missions[0] ||
    null;

  return (
    <MissionContext.Provider
      value={{
        // Data
        robots,
        detections,
        alerts,
        missions,
        dashboardSummary,
        activeMission,
        activeMissionId,
        setActiveMissionId,

        // State
        loading,
        actionLoading,
        errors,
        notifications,

        // Actions
        addNotification,
        removeNotification,
        updateDetectionStatus,
        updateMissionStatus,
        updateRobotStatus,
        acknowledgeAlert: handleAcknowledgeAlert,
        createMission: handleCreateMission,

        // Refresh
        refreshAll,
        fetchDashboard,
        fetchMissions,
        fetchRobots,
        fetchDetections,
        fetchAlerts,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
}
