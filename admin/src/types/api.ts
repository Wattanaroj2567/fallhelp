export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardSummary {
  totalUsers: number;
  totalElders: number;
  totalDevices: number;
  activeDevices: number;
}

