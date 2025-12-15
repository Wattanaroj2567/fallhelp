import { Alert } from 'react-native';
import Logger from './logger';

/**
 * @fileoverview Error Helper Utility (Simplified)
 *
 * ข้อความ Error ภาษาไทยทั้งหมดมาจาก Backend (ApiError.ts)
 * ไฟล์นี้เพียงแค่ดึง message จาก API response และจัดการ fallback สำหรับ network errors
 */

/**
 * Type guards for error objects
 */
type ErrorWithResponse = {
  response?: {
    status?: number;
    data?: {
      error?: string | { code?: string; message?: string };
    };
  };
};

type ErrorWithMessage = {
  message?: string;
  code?: string;
};

function isErrorWithResponse(error: unknown): error is ErrorWithResponse {
  return typeof error === 'object' && error !== null && ('response' in error || 'data' in error);
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === 'object' && error !== null && 'message' in error;
}

/**
 * Extract error message from API response
 * All Thai messages now come from Backend ApiError.ts
 */
export const getErrorMessage = (error: unknown): string => {
  // Type guard: Check if error has response structure (Axios error)
  if (isErrorWithResponse(error)) {
    // 1. New API format: { error: { code, message } } - Thai message from Backend
    const apiError = error.response?.data?.error;
    if (
      apiError &&
      typeof apiError === 'object' &&
      'message' in apiError &&
      typeof apiError.message === 'string'
    ) {
      return apiError.message; // Thai message from Backend ApiError.ts
    }

    // 3. Legacy format: { error: "string" }
    if (typeof apiError === 'string') {
      // Check if it contains Thai already
      if (/[\u0E00-\u0E7F]/.test(apiError)) {
        return apiError;
      }
    }

    // Generic axios error pattern with status code
    if (error.response?.status) {
      const status = error.response.status;
      switch (status) {
        case 500:
          return 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        case 404:
          return 'ไม่พบข้อมูลที่ร้องขอ';
        case 401:
          return 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
        case 403:
          return 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้';
        case 409:
          return 'ข้อมูลซ้ำกับที่มีอยู่แล้ว';
        default:
          return 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
      }
    }
  }

  // 2. toApiError format (from api.ts interceptor): { message }
  if (isErrorWithMessage(error)) {
    const message = error.message;
    if (typeof message === 'string') {
      // Check if it's already a Thai message (from Backend)
      if (/[\u0E00-\u0E7F]/.test(message)) {
        return message;
      }

      // Network/timeout errors - provide Thai fallback
      if (message.includes('Network Error') || error.code === 'ERR_NETWORK') {
        return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต';
      }
      if (message.includes('timeout') || error.code === 'ECONNABORTED') {
        return 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
      }

      // Generic axios error pattern
      if (message.includes('Request failed with status code')) {
        // Try to extract status from error object
        if (isErrorWithResponse(error) && error.response?.status) {
          const status = error.response.status;
          switch (status) {
            case 500:
              return 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
            case 404:
              return 'ไม่พบข้อมูลที่ร้องขอ';
            case 401:
              return 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
            case 403:
              return 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้';
            case 409:
              return 'ข้อมูลซ้ำกับที่มีอยู่แล้ว';
            default:
              return 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
          }
        }
      }
    }
  }

  // 4. Default fallback
  return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
};

/**
 * Helper to show standard alert for errors
 */
export const showErrorMessage = (title: string, error: unknown) => {
  const message = getErrorMessage(error);
  Logger.error(`${title}:`, error);
  Alert.alert(title, message);
};
