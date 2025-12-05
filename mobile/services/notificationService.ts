/**
 * @fileoverview Notification Service
 * @description Handles push notification token registration
 */

import { apiClient, toApiError } from './api';
import Logger from '@/utils/logger';
import { Notification, Paginated } from './types';

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
        Logger.warn('Failed to register push token:', error);
    }
}

export type NotificationFilters = {
    page?: number;
    pageSize?: number;
    isRead?: boolean;
};

export async function listNotifications(filters: NotificationFilters = {}): Promise<Paginated<Notification>> {
    try {
        const { data } = await apiClient.get<Paginated<Notification>>('/api/notifications', { params: filters });
        return data;
    } catch (error) {
        throw toApiError(error);
    }
}

export async function getUnreadCount(): Promise<number> {
    try {
        const { data } = await apiClient.get<{ count: number }>('/api/notifications/unread-count');
        return data.count;
    } catch (error) {
        // Return 0 on error to avoid breaking UI
        return 0;
    }
}

export async function markAsRead(id: string): Promise<void> {
    try {
        await apiClient.patch(`/api/notifications/${id}/read`);
    } catch (error) {
        throw toApiError(error);
    }
}

export async function markAllAsRead(): Promise<void> {
    try {
        await apiClient.patch('/api/notifications/read-all');
    } catch (error) {
        throw toApiError(error);
    }
}

export async function deleteNotification(id: string): Promise<void> {
    try {
        await apiClient.delete(`/api/notifications/${id}`);
    } catch (error) {
        throw toApiError(error);
    }
}

export async function clearAllNotifications(): Promise<void> {
    try {
        await apiClient.delete('/api/notifications');
    } catch (error) {
        throw toApiError(error);
    }
}
