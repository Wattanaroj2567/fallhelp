/**
 * @fileoverview Emergency Contact Service
 * @description Handles CRUD operations for elder emergency contacts
 */

import { apiClient, toApiError } from './api';
import type { EmergencyContact } from './types';

export type CreateContactPayload = {
  name: string;
  phone: string;
  relationship?: string;
  priority?: number;
};

export type UpdateContactPayload = Partial<CreateContactPayload>;

export async function listContacts(elderId: string): Promise<EmergencyContact[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: EmergencyContact[] }>(
      `/api/elders/${elderId}/emergency-contacts`,
    );
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createContact(
  elderId: string,
  payload: CreateContactPayload,
): Promise<EmergencyContact> {
  try {
    const { data } = await apiClient.post<EmergencyContact>(
      `/api/elders/${elderId}/emergency-contacts`,
      payload,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateContact(
  id: string,
  payload: Partial<CreateContactPayload>,
): Promise<EmergencyContact> {
  try {
    const { data } = await apiClient.put<{ success: boolean; data: EmergencyContact }>(
      `/api/emergency-contacts/${id}`,
      payload,
    );
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function reorderContacts(elderId: string, contactIds: string[]): Promise<void> {
  try {
    await apiClient.put(`/api/elders/${elderId}/emergency-contacts/reorder`, { contactIds });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteContact(contactId: string) {
  try {
    await apiClient.delete(`/api/emergency-contacts/${contactId}`);
  } catch (error) {
    throw toApiError(error);
  }
}
