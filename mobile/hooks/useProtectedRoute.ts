import { useEffect, useRef } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Logger from '@/utils/logger';
import { getUserElders } from '@/services/userService';

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
    // const inTabsGroup = segments[0] === '(tabs)'; // Unused

    Logger.info('Auth State Check:', {
      isSignedIn,
      currentSegment: segments[0],
      inAuthGroup,
      // inTabsGroup,
      hasCheckedSetup: hasCheckedSetup.current,
    });

    const checkElderAndRedirect = async () => {
      // Prevent concurrent checks
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
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
        // Mark as checked to prevent infinite loops
        hasCheckedSetup.current = true;

        // On error, check if it's an auth error (401/403) - might need to sign out
        // Type guard for error with status
        type ErrorWithStatus = {
          response?: { status?: number };
          status?: number;
        };

        const getErrorStatus = (err: unknown): number | undefined => {
          if (typeof err === 'object' && err !== null) {
            const errorObj = err as ErrorWithStatus;
            return errorObj.response?.status ?? errorObj.status;
          }
          return undefined;
        };

        const status = getErrorStatus(error);

        // If auth error, redirect to login (token might be invalid)
        if (status === 401 || status === 403) {
          Logger.warn('Auth error detected, redirecting to login');
          router.replace('/(auth)/login');
          return;
        }

        // For other errors, use fallback logic
        const isForbidden = segments[0] === '(auth)' || segments[0] === '(setup)';
        if (isForbidden) {
          router.replace('/(tabs)');
        }
        // If already on tabs/features, stay there (don't force redirect on error)
      } finally {
        checkingRef.current = false;
      }
    };

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
  }, [isSignedIn, segments, isLoading, router, rootNavigationState?.key]);

  return { isLoading };
}
