/**
 * MQTT Topics for FallHelp IoT devices
 * 
 * Topic Structure:
 * - device/{deviceId}/fall - Fall detection events
 * - device/{deviceId}/heartrate - Heart rate readings
 * - device/{deviceId}/status - Device status updates
 * - device/{deviceId}/config - Device configuration (backend -> device)
 */

export const MQTT_TOPICS = {
  // Subscribe patterns (with wildcards)
  FALL_DETECTION_WILDCARD: 'device/+/fall',
  HEART_RATE_WILDCARD: 'device/+/heartrate',
  DEVICE_STATUS_WILDCARD: 'device/+/status',
  
  // Publish patterns (functions to generate specific topics)
  getFallDetectionTopic: (deviceId: string) => `device/${deviceId}/fall`,
  getHeartRateTopic: (deviceId: string) => `device/${deviceId}/heartrate`,
  getStatusTopic: (deviceId: string) => `device/${deviceId}/status`,
  getConfigTopic: (deviceId: string) => `device/${deviceId}/config`,
} as const;

/**
 * MQTT Message Payloads
 */

// Fall Detection Payload
export interface FallDetectionPayload {
  timestamp: string; // ISO 8601
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  magnitude: number; // Total acceleration magnitude
  // NOTE: GPS coordinates are not part of the current system. No location data.
}

// Heart Rate Payload
export interface HeartRatePayload {
  timestamp: string; // ISO 8601
  heartRate: number; // BPM
  isAbnormal?: boolean; // Pre-calculated by device
}

// Device Status Payload
export interface DeviceStatusPayload {
  timestamp: string; // ISO 8601
  online: boolean;
  signalStrength?: number; // RSSI (dBm)
  firmwareVersion?: string;
}

// Config Payload (Backend -> Device)
export interface DeviceConfigPayload {
  fallThreshold: number;
  hrLowThreshold: number;
  hrHighThreshold: number;
  sampleInterval?: number; // milliseconds
  wifiSSID?: string;
  wifiPassword?: string;
}
