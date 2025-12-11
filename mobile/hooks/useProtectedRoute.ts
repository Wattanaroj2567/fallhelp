import { useEffect, useRef, useState } from 'react';
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
  const hasCheckedSetup = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === '(setup)';
    const inTabsGroup = segments[0] === '(tabs)';
    
    Logger.info('Auth State Check:', { 
      isSignedIn, 
      currentSegment: segments[0],
      inAuthGroup,
      inTabsGroup,
      hasCheckedSetup: hasCheckedSetup.current
    });

    if (!isSignedIn && !inAuthGroup) {
      // User is NOT signed in, but trying to access a protected route
      // Redirect to Login
      hasCheckedSetup.current = false;
      router.replace('/(auth)/login');
    } else if (isSignedIn && inAuthGroup && segments[0] !== '(setup)') {
      // User IS signed in, but is on an auth screen (login/register)
      // Check if they have elder data before redirecting
      hasCheckedSetup.current = false;
      checkElderAndRedirect();
    } else if (isSignedIn && inTabsGroup && !hasCheckedSetup.current) {
      // User IS signed in and on tabs → check setup completion ONCE
      checkElderAndRedirect();
    }
  }, [isSignedIn, segments, isLoading]);

  const checkElderAndRedirect = async () => {
    // Prevent concurrent checks
    if (checkingRef.current) return;
    checkingRef.current = true;
    
    try {
      const { getUserElders } = require('../services/userService');
      const elders = await getUserElders();
      
      if (!elders || elders.length === 0) {
        // No elder data → redirect to step 1 (via empty-state)
        hasCheckedSetup.current = true;
        router.replace('/(setup)/empty-state');
        return;
      }

      // Has elder → setup is considered complete
      // Mark as checked and allow staying in tabs
      hasCheckedSetup.current = true;
      
      // Only redirect to tabs if we're NOT already there
      if (segments[0] !== '(tabs)') {
        router.replace('/(tabs)');
      }
      
    } catch (error) {
      Logger.error('Failed to check elder data:', error);
      // Mark as checked to prevent loops
      hasCheckedSetup.current = true;
      // On error, assume setup is complete and stay/go to tabs
      if (segments[0] !== '(tabs)') {
        router.replace('/(tabs)');
      }
    } finally {
      checkingRef.current = false;
    }
  };

  return { isLoading };
}
