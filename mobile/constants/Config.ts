import Constants from 'expo-constants';

import { Platform } from 'react-native';

// Central configuration for backend communication.
// Reads from Expo public env if present; otherwise falls back to app.json > extra.*.
const extra = Constants.expoConfig?.extra ?? {};

const getHostIp = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    console.log('[Config] Detected Host URI (Expo Go):', ip);
    return ip;
  }
  
  // [C] FALLBACK IP FOR STANDALONE BUILD
  // แก้ไข IP ตรงนี้ให้เป็น IP ของเครื่อง Server (คอมพิวเตอร์ของคุณ) ก่อนสั่ง Build
  // ตัวอย่าง: '192.168.1.100'
  const FALLBACK_IP = '192.168.1.102'; 
  console.log('[Config] Using Fallback IP (Standalone):', FALLBACK_IP);
  return FALLBACK_IP;
};

const HOST_IP = getHostIp();

const API_URL =
  (typeof extra === 'object' && typeof extra?.apiUrl === 'string' && extra.apiUrl) ||
  process.env.EXPO_PUBLIC_API_URL || // Support .env files
  (Platform.OS === 'web' ? 'http://localhost:3000' : `http://${HOST_IP}:3000`);

console.log('[Config] Final API URL:', API_URL);

const SOCKET_URL =
  (typeof extra === 'object' && typeof extra?.socketUrl === 'string' && extra.socketUrl) ||
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  API_URL;

const REQUEST_TIMEOUT = 30000; // ms (เพิ่มเป็น 30 วินาที)

export const CONFIG = {
  API_URL,
  SOCKET_URL,
  REQUEST_TIMEOUT,
};

export type AppConfig = typeof CONFIG;
