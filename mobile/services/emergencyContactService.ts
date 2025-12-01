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
  priority: number;
};

export type UpdateContactPayload = Partial<CreateContactPayload>;

export async function listContacts(elderId: string): Promise<EmergencyContact[]> {
  try {
    const { data } = await apiClient.get<EmergencyContact[]>(
      `/api/elders/${elderId}/emergency-contacts`
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createContact(
  elderId: string,
  payload: CreateContactPayload
): Promise<EmergencyContact> {
  try {
    const { data } = await apiClient.post<EmergencyContact>(
      `/api/elders/${elderId}/emergency-contacts`,
      payload
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateContact(
  contactId: string,
  payload: UpdateContactPayload
): Promise<EmergencyContact> {
  try {
    const { data } = await apiClient.put<EmergencyContact>(
      `/api/emergency-contacts/${contactId}`,
      payload
    );
    return data;
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
