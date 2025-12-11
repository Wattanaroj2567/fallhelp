/**
 * @fileoverview Domain Type Definitions
 * @description Shared TypeScript types used across all API service modules
 */

// =============================================================================
// Enums
// =============================================================================

/** User gender options */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type UserRole = 'ADMIN' | 'CAREGIVER';

export type AccessLevel = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'PAIRED' | 'UNPAIRED';

export type WifiStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONFIGURING' | 'ERROR';

export type EventType =
  | 'FALL'
  | 'HEART_RATE_HIGH'
  | 'HEART_RATE_LOW'
  | 'HEART_RATE_NORMAL'
  | 'DEVICE_OFFLINE'
  | 'DEVICE_ONLINE'
  | 'SENSOR_ERROR';

export type EventSeverity = 'CRITICAL' | 'WARNING' | 'NORMAL' | 'INFO';

export type NotificationType =
  | 'FALL_DETECTED'
  | 'HEART_RATE_ALERT'
  | 'DEVICE_OFFLINE'
  | 'DEVICE_ONLINE'
  | 'SYSTEM_UPDATE'
  | 'EMERGENCY_CONTACT_CALLED';

export type Elder = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  weight?: number | null;
  height?: number | null;
  diseases?: string[];
  profileImage?: string | null;
  bloodType?: string | null;
  allergies?: string[];
  medications?: string[];
  // Address fields (separated)
  houseNumber?: string | null;
  village?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  province?: string | null;
  zipcode?: string | null;
  // Legacy field for backward compatibility
  address?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  device?: Device | null;
  /** Access level of the current user to this elder ('OWNER' | 'VIEWER') */
  accessLevel?: AccessLevel;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: Gender | null;
  phone?: string | null;
  role: UserRole;
  profileImage?: string | null;
};

export type DeviceConfig = {
  id: string;
  deviceId: string;
  ssid?: string | null;
  wifiPassword?: string | null;
  wifiStatus?: WifiStatus;
  ipAddress?: string | null;
  fallThreshold?: number;
  hrLowThreshold?: number;
  hrHighThreshold?: number;
  fallCancelTime?: number;
  updatedAt?: string;
};

export type Device = {
  id: string;
  deviceCode: string;
  serialNumber: string;
  elderId?: string | null;
  status?: DeviceStatus;
  lastOnline?: string | null;
  firmwareVersion?: string | null;
  createdAt?: string;
  updatedAt?: string;
  config?: DeviceConfig | null;
};

export type Event = {
  id: string;
  elderId: string;
  deviceId: string;
  type: EventType;
  severity: EventSeverity;
  value?: number | null;
  isCancelled?: boolean;
  cancelledAt?: string | null;
  isNotified?: boolean;
  notifiedAt?: string | null;
  timestamp: string;
  metadata?: unknown;
};

export type EmergencyContact = {
  id: string;
  elderId: string;
  name: string;
  phone: string;
  relationship?: string | null;
  priority: number;

  createdAt?: string;
  updatedAt?: string;
};

export type Member = {
  userId: string;
  elderId: string;
  accessLevel: AccessLevel;
  grantedAt?: string;
};

export type Paginated<T> = {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export type DailyStat = {
  date: string;
  total: number;
  fall?: number;
  heartRateHigh?: number;
  heartRateLow?: number;
};

export type MonthlyStat = {
  month: string;
  total: number;
  fall?: number;
  heartRateHigh?: number;
  heartRateLow?: number;
};

export type Notification = {
  id: string;
  userId: string;
  eventId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  event?: Event | null;
};
