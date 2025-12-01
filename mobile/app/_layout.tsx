import "react-native-reanimated";
import "../global.css";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getToken } from "../services/tokenStorage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePushNotifications } from "../hooks/usePushNotifications";

const queryClient = new QueryClient();

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

SplashScreen.preventAutoHideAsync();

// ==========================================
// 📱 LAYER: View (Root Layout)
// Purpose: Main Application Entry Point & Provider Setup
// ==========================================
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Kanit: require("../assets/fonts/Kanit-Regular.ttf"),
    ...FontAwesome.font,
  });

  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Use push notifications hook
  const { expoPushToken, notification } = usePushNotifications();

  // Log push token when available
  useEffect(() => {
    if (expoPushToken) {
      console.log("✅ Expo Push Token registered:", expoPushToken);
    }
  }, [expoPushToken]);

  // Handle notification tap navigation
  useEffect(() => {
    if (notification) {
      const data = notification.request.content.data;
      // Navigate to history for relevant events
      if (data?.type === "FALL_DETECTED" || data?.type === "HEART_RATE_ALERT") {
        router.push("/(tabs)/history");
      }
    }
  }, [notification]);

  // ==========================================
  // ⚙️ LAYER: Logic (Side Effects)
  // Purpose: Handle font loading errors
  // ==========================================
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // ==========================================
  // 🔐 LAYER: Logic (Auth Check)
  // Purpose: Check authentication status and redirect
  // ==========================================
  useEffect(() => {
    if (!loaded) return;

    const checkAuth = async () => {
      try {
        const token = await getToken();
        const inAuthGroup = segments[0] === "(auth)";

        if (!token) {
          if (!inAuthGroup) {
            router.replace("/(auth)/login");
          }
        } else {
          // Token exists
          // Check for saved setup step
          try {
            const SecureStore = await import("expo-secure-store");
            const setupStep = await SecureStore.getItemAsync("setup_step");

            if (setupStep === "2") {
              if (
                segments[0] !== "(setup)" ||
                segments[1] !== "step2-device-pairing"
              ) {
                router.replace("/(setup)/step2-device-pairing");
              }
              return;
            } else if (setupStep === "3") {
              if (
                segments[0] !== "(setup)" ||
                segments[1] !== "step3-wifi-setup"
              ) {
                router.replace("/(setup)/step3-wifi-setup");
              }
              return;
            }
          } catch (e) {
            console.log("Error checking setup step:", e);
          }

          // Fallback to existing logic if no setup step is saved
          if (!isReady || inAuthGroup) {
            try {
              const { listElders } = require("../services/elderService");
              const elders = await listElders();
              const hasElders = elders && elders.length > 0;

              if (hasElders) {
                if (inAuthGroup || segments[0] === "(setup)") {
                  router.replace("/(tabs)");
                }
              } else {
                // No elders - force redirect to Setup Welcome
                // Unless we are already there
                const isAtSetup = segments[0] === "(setup)";
                if (!isAtSetup) {
                  router.replace("/(setup)/empty-state");
                }
              }
            } catch (error) {
              console.error("Failed to check elders:", error);
              // If error (e.g. network), allow access to tabs (fallback)
              if (inAuthGroup) {
                router.replace("/(tabs)");
              }
            }
          }
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      } finally {
        setIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch (splashError) {
          // ignore
        }
      }
    };

    checkAuth();
  }, [loaded, segments]);

  if (!loaded || !isReady) {
    return null;
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render app providers and navigation stack
  // ==========================================
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(setup)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(home-features)" />
            <Stack.Screen name="(history-features)" />
            <Stack.Screen name="(setting-features)" />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
