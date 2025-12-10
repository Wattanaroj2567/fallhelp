import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Logger from '@/utils/logger';

/**
 * Hook to handle automatic redirection based on auth state
 * Returns boolean indicating if navigation is ready/safe
 */
export function useProtectedRoute() {
  const { isSignedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const checkingRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === '(setup)';
    const inTabsGroup = segments[0] === '(tabs)';
    
    Logger.info('Auth State Check:', { 
      isSignedIn, 
      currentSegment: segments[0],
      inAuthGroup,
      inTabsGroup
    });

    if (!isSignedIn && !inAuthGroup) {
      // User is NOT signed in, but trying to access a protected route
      // Redirect to Login
      router.replace('/(auth)/login');
    } else if (isSignedIn && inAuthGroup && segments[0] !== '(setup)') {
      // User IS signed in, but is on an auth screen (login/register)
      // Check if they have elder data before redirecting
      checkElderAndRedirect();
    } else if (isSignedIn && inTabsGroup) {
      // User IS signed in and on tabs → always check setup completion
      checkElderAndRedirect();
    }
  }, [isSignedIn, segments, isLoading]);

  const checkElderAndRedirect = async () => {
    // Prevent concurrent checks
    if (checkingRef.current) return;
    checkingRef.current = true;
    
    try {
      const { getUserElders } = require('../services/userService');
      const { listDevices } = require('../services/deviceService');
      const elders = await getUserElders();
      
      if (!elders || elders.length === 0) {
        // No elder data → redirect to step 1 (via empty-state)
        router.replace('/(setup)/empty-state');
        return;
      }

      // Has elder → check device status
      const elder = elders[0];
      
      if (!elder.deviceId) {
        // Elder exists but no device → redirect to step 2 (device pairing)
        router.replace('/(setup)/step2-device-pairing');
        return;
      }

      // Has elder + deviceId → check WiFi status
      try {
        const devices = await listDevices();
        const device = devices.find((d: any) => d.id === elder.deviceId);
        
        if (!device || !device.wifiSsid) {
          // Device not connected to WiFi → redirect to step 3 (WiFi config)
          router.replace('/(setup)/step3-wifi-setup');
          return;
        }
      } catch (error) {
        Logger.error('Failed to check device WiFi:', error);
        // If can't check device, assume WiFi not configured
        router.replace('/(setup)/step3-wifi-setup');
        return;
      }

      // Everything complete → redirect to home
      router.replace('/(tabs)');
      
    } catch (error) {
      Logger.error('Failed to check elder data:', error);
      // Fallback to home on error
      router.replace('/(tabs)');
    } finally {
      checkingRef.current = false;
    }
  };

  return { isLoading };
}
