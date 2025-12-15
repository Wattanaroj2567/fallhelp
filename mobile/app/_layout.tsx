import 'react-native-reanimated';
import '../global.css';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { AppTheme } from '@/constants/theme';
import { LoadingScreen } from '@/components/LoadingScreen';

// ==========================================
// ⚙️ React Query Configuration
// Purpose: Global query defaults for consistent data fetching behavior
// ==========================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Data is stale immediately → refetch on component mount
      gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Disable auto-refetch on window focus
      refetchOnMount: true, // Refetch when component mounts (if data is stale)
      retry: 1, // Retry failed queries once
    },
  },
});

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

/**
 * Root Navigation Guard
 * Handles auth state and routes to correct flow
 */
function RootLayoutNav() {
  const { isLoading } = useProtectedRoute();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(setup)" />
      <Stack.Screen name="(features)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Kanit: require('../assets/fonts/Kanit-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <ThemeProvider value={DefaultTheme}>
            <PaperProvider theme={AppTheme}>
              <RootLayoutNav />
            </PaperProvider>
          </ThemeProvider>
        </SocketProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
