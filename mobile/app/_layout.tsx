import "react-native-reanimated";
import "../global.css";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
  Stack,
  SplashScreen,
  useRouter,
  useSegments,
  useNavigationContainerRef,
} from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, ActivityIndicator } from "react-native";
import { getToken } from "@/services/tokenStorage";
import Logger from "@/utils/logger";

const queryClient = new QueryClient();

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

/**
 * Root Navigation Guard
 * Handles auth state and routes to correct flow
 */
function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Check if user has valid token
        const token = await getToken();
        setIsSignedIn(!!token);
        Logger.info(
          "Auth check:",
          !!token ? "Authenticated" : "Not authenticated"
        );
      } catch (e) {
        Logger.error("Error checking auth state:", e);
        setIsSignedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // ✅ CRITICAL FIX: Wait for navigation to be ready
    if (!navigationRef.isReady()) {
      Logger.debug("Navigation not ready yet, skipping redirect");
      return;
    }

    const currentRoot = segments[0];
    const inAuthGroup = currentRoot === "(auth)" || currentRoot === "(setup)";
    const inTabsGroup = currentRoot === "(tabs)";
    const inFeaturesGroup = currentRoot === "(features)";

    Logger.debug("Navigation check:", {
      segments: segments.join("/"),
      inAuthGroup,
      inTabsGroup,
      inFeaturesGroup,
      isSignedIn,
      hasRedirected,
    });

    // Route based on auth state
    if (!isSignedIn && !inAuthGroup) {
      // User not signed in and trying to access protected routes
      Logger.warn("User not authenticated, redirecting to login");
      if (!hasRedirected) {
        setHasRedirected(true);
        setTimeout(() => {
          try {
            router.replace("/(auth)/login");
          } catch (e) {
            Logger.error("Navigation error:", e);
          }
        }, 0);
      }
    } else if (isSignedIn && inAuthGroup && !hasRedirected) {
      // User signed in but on auth screens, redirect to dashboard
      Logger.info("User authenticated, redirecting from auth to dashboard");
      setHasRedirected(true);
      setTimeout(() => {
        try {
          // ✅ FIX: Use explicit index route to prevent wrong screen resolution
          router.replace({ pathname: "/(tabs)", params: {} });
        } catch (e) {
          Logger.error("Navigation error:", e);
          setHasRedirected(false); // Allow retry on error
        }
      }, 100); // Increase timeout slightly for better stability
    } else if (isSignedIn && inFeaturesGroup && !navigationRef.canGoBack()) {
      // เปิดแอปแล้วหลุดเข้าหน้า features โดยไม่มีประวัติ stack ให้ย้อนกลับ → ส่งกลับแท็บหลักเป็น default
      if (!hasRedirected) {
        Logger.info(
          "No history and landed in features, redirecting to tabs as initial screen"
        );
        setHasRedirected(true);
        setTimeout(() => {
          try {
            router.replace({ pathname: "/(tabs)", params: {} });
          } catch (e) {
            Logger.error("Navigation error:", e);
            setHasRedirected(false);
          }
        }, 50);
      }
    } else if (inTabsGroup) {
      // Reset only when in tabs root to avoid flip-flop in features
      if (hasRedirected) setHasRedirected(false);
    }
  }, [isSignedIn, segments, isLoading, navigationRef, hasRedirected]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16AD78" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(setup)" />
      <Stack.Screen name="(features)" />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Kanit: require("../assets/fonts/Kanit-Regular.ttf"),
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
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
          <RootLayoutNav />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
