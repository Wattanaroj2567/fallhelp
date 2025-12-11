import { Alert } from 'react-native';
import Logger from './logger';

/**
 * Standardized error message translator
 * Handles new API error format: { error: { code, message } }
 * Also handles legacy format for backward compatibility
 */
export const getErrorMessage = (error: any): string => {
  // New API error format: { error: { code, message } }
  const apiError = error.response?.data?.error;
  if (apiError && typeof apiError === 'object' && apiError.message) {
    return apiError.message; // Thai message from backend
  }

  // Legacy format: { error: "string" }
  const message = error.response?.data?.error || error.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
  const statusCode = error.response?.status;
  const dataString = JSON.stringify(error.response?.data || {});

  // HTTP Status Code Handling - Convert to user-friendly messages
  if (statusCode === 500 || message.includes('status code 500')) {
    return 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
  }
  if (statusCode === 404 || message.includes('status code 404')) {
    return 'ไม่พบข้อมูลที่ร้องขอ';
  }
  if (statusCode === 401 || message.includes('status code 401')) {
    return 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
  }
  if (statusCode === 403 || message.includes('status code 403')) {
    return 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้';
  }
  if (statusCode === 429 || message.includes('status code 429')) {
    return 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
  }

  // Generic "Request failed with status code X" pattern
  if (message.includes('Request failed with status code')) {
    return 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
  }

  // Authentication Errors
  if (message.includes('Invalid email') || message.includes('password') || message.includes('credentials')) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
  }
  if (message.includes('deactivated')) {
    return 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
  }

  // Device Pairing Errors
  if (
    message.includes('already paired') ||
    message.includes('Device is already paired') ||
    dataString.includes('already paired')
  ) {
    return 'DEVICE_ALREADY_PAIRED'; // Special code for handling in UI
  }

  // Common Network Errors
  if (message.includes('Network Error') || message.includes('timeout')) {
    return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต';
  }

  // User Not Found
  if (message.includes('User not found') || message.includes('ไม่พบผู้ใช้')) {
    return 'ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง';
  }

  // Role Restriction (Admin trying to use mobile features)
  if (message.includes('ไม่สามารถใช้ฟังก์ชันนี้') || message.includes('ผู้ดูแลระบบ')) {
    return 'บัญชีนี้เป็นบัญชีผู้ดูแลระบบ กรุณาใช้งานผ่าน Admin Panel แทน';
  }

  // If message contains technical details, return generic error
  if (message.includes('status code') || message.includes('Error:') || message.includes('Exception')) {
    return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
  }

  return message;
};

/**
 * Helper to show standard alert for errors
 */
export const showErrorMessage = (title: string, error: any) => {
  const message = getErrorMessage(error);

  if (message === 'DEVICE_ALREADY_PAIRED') {
    // Should be handled by specific UI logic, but fallback here just in case
    Alert.alert('อุปกรณ์ถูกเชื่อมต่อแล้ว', 'อุปกรณ์นี้มีผู้ใช้งานแล้ว');
    return;
  }

  Logger.error(`${title}:`, error);
  Alert.alert(title, message);
};
