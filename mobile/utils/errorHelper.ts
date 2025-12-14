import { Alert } from 'react-native';
import Logger from './logger';

/**
 * @fileoverview Error Helper Utility (Simplified)
 * 
 * ข้อความ Error ภาษาไทยทั้งหมดมาจาก Backend (ApiError.ts)
 * ไฟล์นี้เพียงแค่ดึง message จาก API response และจัดการ fallback สำหรับ network errors
 */

/**
 * Extract error message from API response
 * All Thai messages now come from Backend ApiError.ts
 */
export const getErrorMessage = (error: any): string => {
  // 1. New API format: { error: { code, message } } - Thai message from Backend
  const apiError = error.response?.data?.error;
  if (apiError && typeof apiError === 'object' && apiError.message) {
    return apiError.message; // Thai message from Backend ApiError.ts
  }

  // 2. toApiError format (from api.ts interceptor): { message }
  if (error.message && typeof error.message === 'string') {
    // Check if it's already a Thai message (from Backend)
    if (/[\u0E00-\u0E7F]/.test(error.message)) {
      return error.message;
    }
    
    // Network/timeout errors - provide Thai fallback
    if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
      return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต';
    }
    if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
      return 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
    }
    
    // Generic axios error pattern
    if (error.message.includes('Request failed with status code')) {
      const status = error.response?.status;
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

  // 3. Legacy format: { error: "string" }
  const legacyError = error.response?.data?.error;
  if (typeof legacyError === 'string') {
    // Check if it contains Thai already
    if (/[\u0E00-\u0E7F]/.test(legacyError)) {
      return legacyError;
    }
  }

  // 4. Default fallback
  return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
};

/**
 * Helper to show standard alert for errors
 */
export const showErrorMessage = (title: string, error: any) => {
  const message = getErrorMessage(error);
  Logger.error(`${title}:`, error);
  Alert.alert(title, message);
};
