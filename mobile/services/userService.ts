/**
 * @fileoverview User Service
 * @description Handles user profile management and password changes
 */

import { apiClient, toApiError } from './api';
import type { Elder, UserProfile } from './types';

export type UpdateProfilePayload = Partial<
  Pick<UserProfile, 'firstName' | 'lastName' | 'phone' | 'profileImage' | 'email' | 'gender'>
>;

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type UpdatePushTokenPayload = {
  pushToken: string;
};

export async function getProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get<{ data: UserProfile; success: boolean }>('/api/users/profile');
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  try {
    const response = await apiClient.put<{ data: UserProfile; success: boolean }>('/api/users/profile', payload);
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function changePassword(payload: ChangePasswordPayload) {
  try {
    await apiClient.put('/api/users/password', payload);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updatePushToken(payload: UpdatePushTokenPayload) {
  try {
    await apiClient.put('/api/users/push-token', payload);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getUserElders(): Promise<Elder[]> {
  try {
    const response = await apiClient.get<{ data: Elder[]; success: boolean }>('/api/users/elders');
    return response.data.data || [];
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteAccount(): Promise<void> {
  try {
    await apiClient.delete('/api/users/me');
  } catch (error) {
    throw toApiError(error);
  }
}
