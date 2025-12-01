/**
 * @fileoverview Notification Service
 * @description Handles push notification token registration
 */

import { apiClient } from './api';

/**
 * Registers the Expo push notification token with the backend
 * @param token - Expo push token
 * @remarks Fails silently to avoid disrupting app flow
 */
export async function registerPushToken(token: string): Promise<void> {
    try {
        await apiClient.put('/api/users/push-token', { pushToken: token });
    } catch (error) {
        // Fail silently for push token registration
        console.warn('Failed to register push token:', error);
    }
}
