/**
 * @fileoverview Feedback Service
 * @description Handles user feedback submission
 */

import { apiClient, toApiError } from './api';

// Types
export type FeedbackType = 'COMMENT' | 'REPAIR_REQUEST';

export interface FeedbackItem {
  id: string;
  message: string;
  userName?: string;
  type: FeedbackType;
  ticketNumber?: string; // REP-001, REP-002 for repair requests
  createdAt: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
}

/**
 * Submits user feedback to the backend
 * @param data - Feedback data containing message, userName, and type
 * @returns The created feedback data
 * @throws ApiError if the request fails
 */
export async function submitFeedback(data: { message: string; userName?: string; type?: FeedbackType }): Promise<unknown> {
  try {
    const response = await apiClient.post('/api/feedback', data);
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Fetches user's feedback history (all types)
 * @returns List of feedback items
 */
export async function getFeedbackHistory(): Promise<FeedbackItem[]> {
  try {
    const response = await apiClient.get<{ data: FeedbackItem[] }>('/api/users/feedback');
    return response.data.data || [];
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Fetches user's repair request history (only REPAIR_REQUEST type)
 * @returns List of repair request items
 */
export async function getRepairHistory(): Promise<FeedbackItem[]> {
  try {
    const response = await apiClient.get<{ data: FeedbackItem[] }>('/api/feedback/repair-requests');
    return response.data.data || [];
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Deletes a repair request
 * @param id - ID of the repair request to delete
 */
export async function deleteRepairRequest(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/feedback/repair-requests/${id}`);
  } catch (error) {
    throw toApiError(error);
  }
}
