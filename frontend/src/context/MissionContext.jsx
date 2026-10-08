import React, { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_ROBOTS } from '../mock/mockRobots';
import { MOCK_DETECTIONS } from '../mock/mockDetections';
import { MOCK_ALERTS } from '../mock/mockAlerts';
import { MOCK_MISSIONS } from '../mock/mockMissions';

const MissionContext = createContext();

export function MissionProvider({ children }) {
  const [robots, setRobots] = useState(MOCK_ROBOTS);
  const [detections, setDetections] = useState(MOCK_DETECTIONS);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [missions, setMissions] = useState(MOCK_MISSIONS);
  const [activeMissionId, setActiveMissionId] = useState('MSN-2026-08');
  const [notifications, setNotifications] = useState([]);

  // Toast notification helper
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type, time: new Date().toLocaleTimeString() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Robot controls (UI simulation only)
  const updateRobotStatus = useCallback((robotId, newStatus, taskDescription) => {
    setRobots((prev) =>
      prev.map((robot) => {
        if (robot.id === robotId) {
          const updated = { ...robot, status: newStatus };
          if (taskDescription) {
            updated.currentTask = taskDescription;
          } else if (newStatus === 'RETURNING') {
            updated.currentTask = 'Returning to staging rendezvous point';
          } else if (newStatus === 'ACTIVE') {
            updated.currentTask = 'Autonomous patrol & multi-spectral scanning resumed';
          } else if (newStatus === 'OFFLINE') {
            updated.currentTask = 'Standby mode / Motors paused';
          }
          return updated;
        }
        return robot;
      })
    );
    addNotification(`[SIMULATION] ${robotId} status set to ${newStatus}`, 'info');
  }, [addNotification]);

  // Detection actions (Confirm, Dismiss)
  const updateDetectionStatus = useCallback((detectionId, newStatus) => {
    setDetections((prev) =>
      prev.map((det) => (det.id === detectionId ? { ...det, status: newStatus } : det))
    );
    addNotification(`[SIMULATION] Detection ${detectionId} updated to ${newStatus}`, newStatus === 'CONFIRMED' ? 'success' : 'warning');
  }, [addNotification]);

  // Mission actions (Start, Pause, Stop)
  const updateMissionStatus = useCallback((missionId, newStatus) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, status: newStatus } : m))
    );
    addNotification(`[SIMULATION] Mission ${missionId} changed to ${newStatus}`, 'info');
  }, [addNotification]);

  // Alert acknowledgement
  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    addNotification(`[SIMULATION] Alert ${alertId} acknowledged`, 'success');
  }, [addNotification]);

  const activeMission = missions.find((m) => m.id === activeMissionId) || missions[0];

  return (
    <MissionContext.Provider
      value={{
        robots,
        detections,
        alerts,
        missions,
        activeMission,
        activeMissionId,
        setActiveMissionId,
        notifications,
        addNotification,
        removeNotification,
        updateRobotStatus,
        updateDetectionStatus,
        updateMissionStatus,
        acknowledgeAlert,
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
