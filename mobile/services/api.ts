/**
 * @fileoverview API Client Configuration
 * @description Axios client with authentication interceptor for API requests
 */

import axios, { type AxiosRequestHeaders } from 'axios';

import { CONFIG } from '@/constants/Config';
import { getToken } from './tokenStorage';

import Logger from '@/utils/logger';

/**
 * Configured Axios instance for API requests
 * - Base URL from CONFIG
 * - Request timeout configured
 * - Auto-attaches JWT token to requests
 */
export const apiClient = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: CONFIG.REQUEST_TIMEOUT,
});

if (__DEV__) {
  Logger.info('🚀 API Client Initialized with Base URL:', CONFIG.API_URL);
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
  }
  // Logger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Logger.debug(`Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const apiError = toApiError(error);

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      Logger.debug(`API 401 (Session Expired): ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    }
    // Handle 500 "User not found" - invalid token with non-existent userId
    else if (
      error.response?.status === 500 &&
      error.config?.url?.includes('/api/users/profile') &&
      error.response?.data?.error === 'User not found'
    ) {
      Logger.warn('User not found in database - clearing invalid token');
      // Clear token to force re-login
      const { clearToken } = await import('./tokenStorage');
      await clearToken();
    }
    // Handle 409 Conflict (e.g. Device already paired) - Handled in UI
    else if (error.response?.status === 409) {
      Logger.debug(`API 409 (Conflict): ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${apiError.message}`);
    }
    // Log other errors
    else {
      Logger.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, apiError);
    }

    return Promise.reject(apiError);
  }
);

/**
 * Standardized API error structure
 */
export type ApiError = {
  /** HTTP status code (if available) */
  status?: number;
  /** Human-readable error message */
  message: string;
  /** Raw error response data */
  data?: unknown;
};

/**
 * Converts any error to a standardized ApiError format
 * @param error - The caught error (Axios or generic)
 * @returns Normalized ApiError object
 */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    // Extract message from various possible error formats
    let message = error.message; // Default to axios message
    const responseData = error.response?.data;

    // New format: { error: { code, message } }
    if (responseData?.error && typeof responseData.error === 'object' && responseData.error.message) {
      message = responseData.error.message;
    }
    // Legacy format: { error: "string" }
    else if (typeof responseData?.error === 'string') {
      message = responseData.error;
    }
    // Alternative format: { message: "string" }
    else if (responseData?.message) {
      message = responseData.message;
    }

    return {
      status: error.response?.status,
      message: message,
      data: error.response?.data,
    };
  }
  return { message: (error as Error)?.message ?? 'Unknown error' };
}
