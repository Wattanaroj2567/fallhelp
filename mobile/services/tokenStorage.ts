/**
 * @fileoverview Secure Token Storage
 * @description Platform-aware JWT token storage using SecureStore (native) or localStorage (web)
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from '@/utils/logger';

/** Storage key for authentication token */
const TOKEN_KEY = 'fallhelp_auth_token';

/**
 * Stores the authentication token securely
 * @param token - JWT token to store
 */
export async function setToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

/**
 * Retrieves the stored authentication token
 * @returns The stored JWT token, or null if not found
 */
export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  } else {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }
}

/**
 * Removes the stored authentication token (logout)
 */
export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

/**
 * Clears all session data including token, setup progress, and cached forms
 */
export async function clearSession(): Promise<void> {
  await clearToken();
  
  if (Platform.OS !== 'web') {
    // Clear Setup Progress & IDs
    await SecureStore.deleteItemAsync('setup_step');
    await SecureStore.deleteItemAsync('setup_elderId');
    await SecureStore.deleteItemAsync('setup_deviceId');
  }
  
  // Clear Cached Form Data (AsyncStorage)
  try {
    await AsyncStorage.removeItem('setup_step1_form_data');
  } catch (e) {
    Logger.debug('Error clearing form data:', e);
  }
}
