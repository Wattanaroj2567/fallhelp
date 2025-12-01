// Common response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface OtpRequest {
  email: string;
  purpose: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION';
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  purpose: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION';
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

// Elder types
export interface CreateElderRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  weight?: number;
  height?: number;
  diseases?: string[];
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  notes?: string;
  profileImage?: string;
}

export interface UpdateElderRequest extends Partial<CreateElderRequest> {}

export interface InviteMemberRequest {
  email: string;
  accessLevel: 'VIEWER';
}

// Device types
export interface CreateDeviceRequest {
  serialNumber: string;
}

export interface PairDeviceRequest {
  deviceCode: string;
  elderId: string;
}

export interface WiFiConfigRequest {
  ssid: string;
  password: string;
}

export interface DeviceConfigRequest {
  fallThreshold?: number;
  hrLowThreshold?: number;
  hrHighThreshold?: number;
  fallCancelTime?: number;
}

// Emergency Contact types
export interface CreateEmergencyContactRequest {
  name: string;
  phone: string;
  relationship?: string;
  priority: number;
}

export interface UpdateEmergencyContactRequest extends Partial<CreateEmergencyContactRequest> {}

// Event types
export interface EventQueryParams {
  elderId?: string;
  deviceId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Statistics types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  activeDevices: number;
  totalElders: number;
  activeElders: number;
  todayEvents: number;
  todayFalls: number;
}

export interface EventStats {
  totalEvents: number;
  fallCount: number;
  heartRateHighCount: number;
  heartRateLowCount: number;
  deviceOfflineCount: number;
  cancelledFalls: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalEvents: number;
  fallCount: number;
  avgHeartRate: number;
  deviceUptime: number;
}
