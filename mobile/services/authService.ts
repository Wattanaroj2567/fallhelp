/**
 * @fileoverview Authentication Service
 * @description Handles user authentication, registration, and password management
 */

import { apiClient, toApiError } from './api';
import { clearToken, setToken } from './tokenStorage';
import type { UserProfile } from './types';

export type AuthResponse = {
  token: string;
  user: UserProfile;
};

export type BackendAuthResponse = {
  success: boolean;
  message: string;
  data: AuthResponse;
};

export type LoginPayload = {
  email?: string;
  identifier?: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  firstName: string;
  lastName: string;
  gender: string;
  phone?: string;
};

export type OtpPurpose = 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION';

export type RequestOtpPayload = {
  email: string;
  purpose: OtpPurpose;
};

export type VerifyOtpPayload = {
  email: string;
  code: string;
  purpose: OtpPurpose;
};

export type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
};

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<BackendAuthResponse>('/api/auth/login', payload);
    await setToken(data.data.token);
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<BackendAuthResponse>('/api/auth/register', payload);
    await setToken(data.data.token);
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export type OtpResponse = {
  message: string;
  referenceCode: string;
  expiresInMinutes: number;
};

export async function requestOtp(payload: RequestOtpPayload): Promise<OtpResponse> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: OtpResponse }>(
      '/api/auth/request-otp',
      payload,
    );
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export type VerifyOtpResponse = {
  valid: boolean;
  message: string;
};

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: VerifyOtpResponse }>(
      '/api/auth/verify-otp',
      payload,
    );

    // Check if OTP is valid - throw error if not
    if (!data.data.valid) {
      throw new Error(data.data.message || 'รหัส OTP ไม่ถูกต้อง');
    }

    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function resetPassword(payload: ResetPasswordPayload) {
  try {
    await apiClient.post('/api/auth/reset-password', payload);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function fetchProfile(): Promise<UserProfile> {
  try {
    const { data } = await apiClient.get<UserProfile>('/api/auth/me');
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function logout() {
  await clearToken();
}
