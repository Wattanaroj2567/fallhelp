import { useEffect, useRef, useState } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
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
  const rootNavigationState = useRootNavigationState(); // ✅ Check navigation state
  const checkingRef = useRef(false);
  const hasCheckedSetup = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return; // ✅ Wait for navigation to be ready

    // ✅ FIX: Fast Refresh / Reload Race Condition
    // During HMR or initialization, segments might be empty for a split second.
    // If we proceed, logic thinks we are NOT in (auth) and redirects to Login.
    if ((segments as string[]).length === 0) return;

    const inAuthGroup = segments[0] === '(auth)';
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
    } else if (isSignedIn && inAuthGroup) {
      // User IS signed in, but is on an auth screen (login/register)

      // EXCEPTION: Allow "Success" screen to stay visible
      // The user will manually navigate away from it
      if (segments[1] === 'success') return;

      // Check if they have elder data before redirecting
      hasCheckedSetup.current = false;
      checkElderAndRedirect();
    } else if (isSignedIn && !hasCheckedSetup.current) {
      // User IS signed in, on any other screen (tabs, setup, features)
      // Check setup completion if not done yet
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

      // Logic: If we are here, setup is complete.
      // We should ONLY redirect if the user is currently on a "forbidden" route for a fully set-up user.
      // Forbidden routes: (auth) group, (setup) group.
      // Allowed routes: (tabs), (features), or empty/loading state (let Router resolve).

      const isForbidden = segments[0] === '(auth)' || segments[0] === '(setup)';

      if (isForbidden) {
        router.replace('/(tabs)');
      } else {
        // If on (tabs), (features), or valid deep link, STAY THERE.
        // Do not force redirect to tabs.
      }

    } catch (error) {
      Logger.error('Failed to check elder data:', error);
      // Mark as checked to prevent loops
      hasCheckedSetup.current = true;

      // Same fallback logic on error
      const isForbidden = segments[0] === '(auth)' || segments[0] === '(setup)';
      if (isForbidden) {
        router.replace('/(tabs)');
      }
    } finally {
      checkingRef.current = false;
    }
  };

  return { isLoading };
}
