/**
 * @fileoverview Feedback Service
 * @description Handles user feedback submission
 */

import { apiClient, toApiError } from './api';

// Types
export interface FeedbackItem {
  id: string;
  message: string;
  userName?: string;
  createdAt: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
}

/**
 * Submits user feedback to the backend
 * @param data - Feedback data containing message and userName
 * @returns The created feedback data
 * @throws ApiError if the request fails
 */
export async function submitFeedback(data: { message: string; userName?: string }): Promise<unknown> {
  try {
    const response = await apiClient.post('/api/feedback', data);
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Fetches user's feedback history
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
