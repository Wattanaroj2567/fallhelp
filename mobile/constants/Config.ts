import Constants from 'expo-constants';

import { Platform } from 'react-native';

// Central configuration for backend communication.
// Reads from Expo public env if present; otherwise falls back to app.json > extra.*.
const extra = Constants.expoConfig?.extra ?? {};

const API_URL =
  (typeof extra === 'object' && typeof extra?.apiUrl === 'string' && extra.apiUrl) ||
  (Platform.OS === 'web' ? 'http://localhost:3000' : 'http://192.168.1.103:3000');

const SOCKET_URL =
  (typeof extra === 'object' && typeof extra?.socketUrl === 'string' && extra.socketUrl) ||
  API_URL;

const REQUEST_TIMEOUT = 30000; // ms (เพิ่มเป็น 30 วินาที)

export const CONFIG = {
  API_URL,
  SOCKET_URL,
  REQUEST_TIMEOUT,
};

export type AppConfig = typeof CONFIG;
