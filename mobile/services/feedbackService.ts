/**
 * @fileoverview Feedback Service
 * @description Handles user feedback submission
 */

import { apiClient, toApiError } from './api';

/**
 * Submits user feedback to the backend
 * @param message - Feedback message content
 * @returns The created feedback data
 * @throws ApiError if the request fails
 */
export async function submitFeedback(message: string): Promise<unknown> {
  try {
    const response = await apiClient.post('/api/feedback', { message });
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}
