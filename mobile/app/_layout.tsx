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
import { useEffect } from "react";
import { PaperProvider, MD3LightTheme } from "react-native-paper";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, ActivityIndicator } from "react-native";
import Logger from "@/utils/logger";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

/**
 * Root Navigation Guard
 * Handles auth state and routes to correct flow
 */
function RootLayoutNav() {
  const { isSignedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (isLoading) return;

    if (!navigationRef.isReady()) {
      return;
    }

    const currentRoot = segments[0];
    const inAuthGroup = currentRoot === "(auth)" || currentRoot === "(setup)";
    const inTabsGroup = currentRoot === "(tabs)";

    Logger.debug("Auth State Change:", { isSignedIn, currentRoot });

    if (!isSignedIn && !inAuthGroup) {
      // User is NOT signed in, but trying to access a protected route
      // Redirect to Login
      router.replace("/(auth)/login");
    } else if (isSignedIn && inAuthGroup) {
      // User IS signed in, but is on an auth screen (login/register)
      // Redirect to Home
      router.replace("/(tabs)");
    }
  }, [isSignedIn, segments, isLoading, navigationRef]);

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
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
          <PaperProvider theme={{ ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: '#16AD78' } }}>
            <RootLayoutNav />
          </PaperProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
