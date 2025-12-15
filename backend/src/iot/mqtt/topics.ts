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
  timestamp: number | string; // ESP32 sends millis() (number), but we use server time
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  magnitude: number; // Total acceleration magnitude
  // NOTE: GPS coordinates are not part of the current system. No location data.
}

// Heart Rate Payload
export interface HeartRatePayload {
  timestamp: number | string; // ESP32 sends millis() (number), but we use server time
  heartRate: number; // BPM
  isAbnormal?: boolean; // Pre-calculated by device
}

// Device Status Payload
export interface DeviceStatusPayload {
  timestamp: number | string; // ESP32 sends millis() (number), but we use server time
  online: boolean;
  signalStrength?: number; // RSSI (dBm)
  firmwareVersion?: string;
  ip?: string; // IP address (ESP32 sends this when WiFi is connected)
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
