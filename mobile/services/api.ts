/**
 * @fileoverview API Client Configuration
 * @description Axios client with authentication interceptor for API requests
 */

import axios, { type AxiosRequestHeaders } from 'axios';

import { CONFIG } from '@/constants/Config';
import { getToken } from './tokenStorage';

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
  console.log('🚀 API Client Initialized with Base URL:', CONFIG.API_URL);
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

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
    return {
      status: error.response?.status,
      message: error.response?.data?.message ?? error.message,
      data: error.response?.data,
    };
  }
  return { message: (error as Error)?.message ?? 'Unknown error' };
}
