/**
 * Socket.io Event Types for FallHelp Real-time Communication
 * 
 * Client -> Server Events:
 * - authenticate: Client sends userId and elderId to join specific rooms
 * - ping: Connection health check
 * - disconnect: Client disconnects
 * 
 * Server -> Client Events:
 * - authenticated: Confirmation of successful authentication
 * - pong: Response to ping
 * - fall_detected: Fall detection alert
 * - heart_rate_alert: Abnormal heart rate alert
 * - heart_rate_update: Normal heart rate reading
 * - device_status_update: Device online/offline status
 * - event_status_change: When an event is cancelled/resolved
 * - system_message: System-wide announcement
 */

// Client -> Server
export interface AuthenticatePayload {
  userId?: string;
  elderId?: string;
}

// Server -> Client
export interface FallDetectedEvent {
  eventId: string;
  elderId: string;
  elderName: string;
  deviceId: string;
  deviceCode: string;
  timestamp: string; // ISO 8601
  severity: string;
  accelerationMagnitude: number; // No GPS data in current system
}

export interface HeartRateAlertEvent {
  eventId: string;
  elderId: string;
  elderName: string;
  deviceId: string;
  deviceCode: string;
  timestamp: string; // ISO 8601
  heartRate: number;
  severity: string;
  type: 'LOW' | 'HIGH';
}

export interface HeartRateUpdateEvent {
  elderId: string;
  elderName: string;
  deviceId: string;
  deviceCode: string;
  timestamp: string; // ISO 8601
  heartRate: number;
}

export interface DeviceStatusUpdate {
  deviceId: string;
  elderId?: string;
  status: 'online' | 'offline';
  lastOnline: string;
  metadata?: any;
}

export interface EventStatusChangedEvent {
  eventId: string;
  elderId: string;
  status: string; // 'CANCELLED', 'RESOLVED', etc.
  timestamp: string; // ISO 8601
}

export interface SystemMessageEvent {
  message: string;
  data?: any;
  timestamp: string; // ISO 8601
}

export interface PongEvent {
  timestamp: string; // ISO 8601
}

export interface AuthenticatedEvent {
  success: boolean;
}
