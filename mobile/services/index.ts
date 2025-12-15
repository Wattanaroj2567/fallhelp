/**
 * @fileoverview Mobile API Services - Barrel Export
 * @description Centralized exports for all API service modules
 *
 * @example
 * ```typescript
 * import { login, register, getProfile } from '@/services';
 * import type { UserProfile, Elder, Device } from '@/services';
 * ```
 */

// =============================================================================
// Core API Client
// =============================================================================
export { apiClient, toApiError } from './api';
export type { ApiError } from './api';

// =============================================================================
// Token Management
// =============================================================================
export { getToken, setToken, clearToken } from './tokenStorage';

// =============================================================================
// Domain Types
// =============================================================================
export type {
  // Enums
  Gender,
  UserRole,
  AccessLevel,
  DeviceStatus,
  WifiStatus,
  EventType,
  EventSeverity,
  NotificationType,
  // Models
  UserProfile,
  Elder,
  Device,
  DeviceConfig,
  Event,
  EmergencyContact,
  Member,
  Notification,
  // Utilities
  Paginated,
  DailySummary,
  MonthlySummary,
} from './types';

// =============================================================================
// Authentication Service
// =============================================================================
export {
  login,
  register,
  requestOtp,
  verifyOtp,
  resetPassword,
  fetchProfile,
  logout,
} from './authService';
export type {
  AuthResponse,
  BackendAuthResponse,
  LoginPayload,
  RegisterPayload,
  OtpPurpose,
  RequestOtpPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
} from './authService';

// =============================================================================
// User Service
// =============================================================================
export {
  getProfile,
  updateProfile,
  changePassword,
  updatePushToken,
  getUserElders,
} from './userService';
export type {
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpdatePushTokenPayload,
} from './userService';

// =============================================================================
// Elder Service
// =============================================================================
export {
  createElder,
  listElders,
  getElder,
  updateElder,
  deactivateElder,
  listMembers,
  inviteMember,
  removeMember,
} from './elderService';
export type { CreateElderPayload, UpdateElderPayload, InviteMemberPayload } from './elderService';

// =============================================================================
// Device Service
// =============================================================================
export {
  createDevice,
  getPairingQr,
  pairDevice,
  unpairDevice,
  getDeviceConfig,
  updateDeviceConfig,
  configureWifi,
} from './deviceService';
export type {
  CreateDevicePayload,
  PairDevicePayload,
  UnpairDevicePayload,
  WifiConfigPayload,
  UpdateDeviceConfigPayload,
} from './deviceService';

// =============================================================================
// Event Service
// =============================================================================
export {
  listEvents,
  getRecentEvents,
  getEvent,
  cancelEvent,
  getDailySummary,
  getMonthlySummary,
} from './eventService';
export type { EventFilters } from './eventService';

// =============================================================================
// Emergency Contact Service
// =============================================================================
export {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
} from './emergencyContactService';
export type { CreateContactPayload, UpdateContactPayload } from './emergencyContactService';

// =============================================================================
// Notification Service
// =============================================================================
export { registerPushToken } from './notificationService';

// =============================================================================
// Feedback Service
// =============================================================================
export { submitFeedback } from './feedbackService';
