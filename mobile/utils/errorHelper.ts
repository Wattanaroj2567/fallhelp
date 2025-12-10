import { Alert } from 'react-native';
import Logger from './logger';

/**
 * Standardized error message translator
 * Converts technical errors into user-friendly Thai messages
 */
export const getErrorMessage = (error: any): string => {
  const message = error.response?.data?.error || error.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
  const dataString = JSON.stringify(error.response?.data || {});

  // Authentication Errors
  if (message.includes('Invalid email') || message.includes('password') || message.includes('credentials')) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
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
