/**
 * RescueHive Mock Alerts Dataset
 * Clearly marked as SIMULATION / DEMO DATA for Phase 1.
 */

export const MOCK_ALERTS = [
  {
    id: 'ALT-301',
    severity: 'HIGH', // HIGH, MEDIUM, LOW
    title: 'Fire Hazard Detected by Robot Alpha',
    description: 'Active flame and localized thermal anomaly (480°C) confirmed in Sector 4B Basement Hub.',
    timestamp: '22:38:40',
    robotName: 'Robot Alpha',
    robotId: 'RH-UGV-01',
    sector: 'Sector 4B',
    acknowledged: false,
  },
  {
    id: 'ALT-302',
    severity: 'MEDIUM',
    title: 'Robot Bravo Battery Below Safe Threshold',
    description: 'Battery capacity currently at 38%. Return-to-base recommended within 14 minutes.',
    timestamp: '22:31:05',
    robotName: 'Robot Bravo',
    robotId: 'RH-UAV-02',
    sector: 'Sector 4A',
    acknowledged: false,
  },
  {
    id: 'ALT-303',
    severity: 'LOW',
    title: 'Possible Victim Acoustic Ping',
    description: 'Triangulation in Sector 4B suggests human vocal frequencies. Retasked Alpha for visual confirmation.',
    timestamp: '22:15:20',
    robotName: 'Robot Charlie',
    robotId: 'RH-UGV-03',
    sector: 'Sector 4C',
    acknowledged: true,
  },
  {
    id: 'ALT-304',
    severity: 'HIGH',
    title: 'Pressurized Gas Cylinder Threat',
    description: 'LPG cylinder detected adjacent to collapsing partition in Sector 4A. Explosive hazard flagged.',
    timestamp: '22:29:15',
    robotName: 'Robot Bravo',
    robotId: 'RH-UAV-02',
    sector: 'Sector 4A',
    acknowledged: false,
  },
];
