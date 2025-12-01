/**
 * @fileoverview User Service
 * @description Handles user profile management and password changes
 */

import { apiClient, toApiError } from './api';
import type { Elder, UserProfile } from './types';

export type UpdateProfilePayload = Partial<
  Pick<UserProfile, 'firstName' | 'lastName' | 'phone' | 'profileImage' | 'email'>
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
    const { data } = await apiClient.get<UserProfile>('/api/users/profile');
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  try {
    const { data } = await apiClient.put<UserProfile>('/api/users/profile', payload);
    return data;
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
    const { data } = await apiClient.get<Elder[]>('/api/users/elders');
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}
