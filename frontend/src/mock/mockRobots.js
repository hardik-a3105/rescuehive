/**
 * RescueHive Mock Telemetry & Robots Dataset
 * Clearly marked as SIMULATION / DEMO DATA for Phase 1.
 */

export const MOCK_ROBOTS = [
  {
    id: 'RH-UGV-01',
    name: 'Robot Alpha',
    callsign: 'Apex-1',
    type: 'UGV (Tracked Ground Robot)',
    model: 'ApexRover Gen-3',
    status: 'ACTIVE', // ACTIVE, EXPLORING, RETURNING, OFFLINE
    battery: 84,
    batteryHealth: 'Optimal',
    connection: 'CONNECTED',
    signalStrength: -58, // dBm
    position: { x: 42.8, y: 18.3, z: 0.1 },
    heading: 135, // degrees
    speed: 1.2, // m/s
    currentTask: 'Autonomous perimeter sweep & structural thermal scanning in Sector 4B',
    exploredArea: 1840, // sq meters
    temperature: 38.5, // Celsius
    detectionsCount: 5,
    payload: 'FLIR Thermal IR + LiDAR + Gas Sensor Array',
    firmware: 'v2.4.1-sim',
    pathHistory: [
      { x: 10, y: 10 },
      { x: 18, y: 12 },
      { x: 26, y: 16 },
      { x: 34, y: 15 },
      { x: 42.8, y: 18.3 },
    ],
  },
  {
    id: 'RH-UAV-02',
    name: 'Robot Bravo',
    callsign: 'Specter-2',
    type: 'UAV (Aerial Recon Quadrotor)',
    model: 'AeroScout V4',
    status: 'EXPLORING', // ACTIVE, EXPLORING, RETURNING, OFFLINE
    battery: 38, // Triggering medium threshold alert
    batteryHealth: 'Caution (Low Charge)',
    connection: 'CONNECTED',
    signalStrength: -72, // dBm
    position: { x: 74.2, y: 55.6, z: 12.4 },
    heading: 210,
    speed: 3.4, // m/s
    currentTask: 'High-altitude photogrammetry & roof collapse assessment in Sector 4A',
    exploredArea: 2480,
    temperature: 42.1,
    detectionsCount: 4,
    payload: '4K Optical Zoom + Dual Band Radiometric Thermal',
    firmware: 'v3.0.8-sim',
    pathHistory: [
      { x: 30, y: 20 },
      { x: 45, y: 35 },
      { x: 60, y: 48 },
      { x: 74.2, y: 55.6 },
    ],
  },
  {
    id: 'RH-UGV-03',
    name: 'Robot Charlie',
    callsign: 'Titan-3',
    type: 'UGV (Heavy Rescue Crawler)',
    model: 'TerraTrack Heavy',
    status: 'RETURNING', // ACTIVE, EXPLORING, RETURNING, OFFLINE
    battery: 92,
    batteryHealth: 'Optimal',
    connection: 'CONNECTED',
    signalStrength: -49,
    position: { x: 22.4, y: 38.9, z: 0.0 },
    heading: 45,
    speed: 0.8,
    currentTask: 'Returning to staging base after acoustic rubble breach in Sector 4C',
    exploredArea: 1320,
    temperature: 34.2,
    detectionsCount: 3,
    payload: 'Acoustic Listening Array + Ground Penetrating Radar',
    firmware: 'v2.2.0-sim',
    pathHistory: [
      { x: 5, y: 25 },
      { x: 12, y: 30 },
      { x: 19, y: 34 },
      { x: 22.4, y: 38.9 },
    ],
  },
];
