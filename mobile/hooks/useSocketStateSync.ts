/**
 * @fileoverview Socket State Sync Hook
 * @description Syncs socket real-time updates with React Query cache to prevent state inconsistency
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Logger from '@/utils/logger';
import type { Elder, Device } from '@/services/types';

export interface SocketState {
  isConnected: boolean;
  heartRate: number | null;
  fallStatus: 'NORMAL' | 'FALL' | null;
  activeFallEventId: string | null;
}

/**
 * Hook to sync socket state with React Query cache
 * This prevents state inconsistency between socket updates and cached data
 *
 * @param elderId - Elder ID to sync state for
 * @param socketState - Current socket state from useSocket hook
 */
export function useSocketStateSync(elderId: string | undefined, socketState: SocketState): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!elderId) {
      return;
    }

    // Sync heart rate with elder data cache
    if (socketState.heartRate !== null) {
      queryClient.setQueryData(['userElders'], (oldData: unknown) => {
        if (!oldData || !Array.isArray(oldData)) {
          return oldData;
        }

        // Update device status in elder data
        return oldData.map((elder: unknown) => {
          if (
            typeof elder === 'object' &&
            elder !== null &&
            'id' in elder &&
            elder.id === elderId &&
            'device' in elder &&
            elder.device
          ) {
            const elderData = elder as Elder;
            const device = elderData.device as Device | null;
            if (device) {
              return {
                ...elderData,
                device: {
                  ...device,
                  // Mark device as online if we have heart rate data
                  status: socketState.isConnected ? 'ACTIVE' : device.status,
                },
              };
            }
          }
          return elder;
        });
      });
    }

    // Sync fall status with events cache
    if (socketState.fallStatus === 'FALL' && socketState.activeFallEventId) {
      // Invalidate events query to fetch latest fall event
      queryClient.invalidateQueries({
        queryKey: ['initialEvents', elderId],
      });
      Logger.debug('Socket: Fall detected, invalidating events cache');
    } else if (socketState.fallStatus === 'NORMAL' && !socketState.activeFallEventId) {
      // Fall resolved, invalidate to update UI
      queryClient.invalidateQueries({
        queryKey: ['initialEvents', elderId],
      });
      Logger.debug('Socket: Fall resolved, invalidating events cache');
    }

    // Sync device connection status
    queryClient.setQueryData(['userElders'], (oldData: unknown) => {
      if (!oldData || !Array.isArray(oldData)) {
        return oldData;
      }

      return oldData.map((elder: unknown) => {
        if (
          typeof elder === 'object' &&
          elder !== null &&
          'id' in elder &&
          elder.id === elderId &&
          'device' in elder
        ) {
          const elderData = elder as Elder;
          const device = elderData.device as Device | null;
          if (device) {
            return {
              ...elderData,
              device: {
                ...device,
                // Update lastOnline timestamp if device is connected
                lastOnline: socketState.isConnected ? new Date().toISOString() : device.lastOnline,
              },
            };
          }
        }
        return elder;
      });
    });
  }, [
    elderId,
    socketState.isConnected,
    socketState.heartRate,
    socketState.fallStatus,
    socketState.activeFallEventId,
    queryClient,
  ]);
}
