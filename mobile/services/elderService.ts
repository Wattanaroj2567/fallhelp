/**
 * @fileoverview Elder Service
 * @description Handles elder profile management and member access control
 */

import { apiClient, toApiError } from './api';
import type { Elder, Member } from './types';

export type CreateElderPayload = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  weight?: number;
  height?: number;
  diseases?: string[];
  profileImage?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  notes?: string;
  // Address fields
  houseNumber?: string;
  village?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  zipcode?: string;
};

export type UpdateElderPayload = Partial<CreateElderPayload>;

export type InviteMemberPayload = {
  email: string;
};

export async function createElder(payload: CreateElderPayload): Promise<Elder> {
  try {
    const response = await apiClient.post<{ data: Elder; success: boolean }>('/api/elders', payload);
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function listElders(): Promise<Elder[]> {
  try {
    const response = await apiClient.get<{ data: Elder[]; success: boolean }>('/api/elders');
    return response.data.data || [];
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getElder(elderId: string): Promise<Elder> {
  try {
    const response = await apiClient.get<{ data: Elder; success: boolean }>(`/api/elders/${elderId}`);
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateElder(elderId: string, payload: UpdateElderPayload): Promise<Elder> {
  try {
    const response = await apiClient.put<{ data: Elder; success: boolean }>(`/api/elders/${elderId}`, payload);
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deactivateElder(elderId: string): Promise<Elder> {
  try {
    const { data } = await apiClient.patch<Elder>(`/api/elders/${elderId}/deactivate`);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteElder(elderId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/elders/${elderId}`);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function listMembers(elderId: string): Promise<Member[]> {
  try {
    const response = await apiClient.get<{ data: Member[]; success: boolean }>(`/api/elders/${elderId}/members`);
    return response.data.data || [];
  } catch (error) {
    throw toApiError(error);
  }
}

export async function inviteMember(elderId: string, payload: InviteMemberPayload): Promise<Member> {
  try {
    const { data } = await apiClient.post<Member>(`/api/elders/${elderId}/members`, payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function removeMember(elderId: string, userId: string) {
  try {
    await apiClient.delete(`/api/elders/${elderId}/members/${userId}`);
  } catch (error) {
    throw toApiError(error);
  }
}
