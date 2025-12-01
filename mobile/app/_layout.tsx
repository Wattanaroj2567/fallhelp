import 'react-native-reanimated';
import '../global.css';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getToken } from '../services/tokenStorage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerPushToken } from '../services/notificationService';
import Constants from 'expo-constants';


const queryClient = new QueryClient();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ==========================================
// 📱 LAYER: View (Root Layout)
// Purpose: Main Application Entry Point & Provider Setup
// ==========================================
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Kanit: require('../assets/fonts/Kanit-Regular.ttf'),
    ...FontAwesome.font,
  });

  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // ==========================================
  // ⚙️ LAYER: Logic (Side Effects)
  // Purpose: Handle font loading errors
  // ==========================================
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // ==========================================
  // ⚙️ LAYER: Logic (Notifications)
  // Purpose: Register for push notifications
  // ==========================================
  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        console.log('✅ Expo Push Token:', token);
        // Store token to send after login (avoid 401 error before authentication)
        try {
          const SecureStore = await import('expo-secure-store');
          await SecureStore.setItemAsync('pushToken', token);
          console.log('Push token stored for later registration');
        } catch (error) {
          console.log('Failed to store push token:', error);
        }
      }
    }).catch(error => {
      console.log('Push notification registration failed:', error);
    });


    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Handle notification received while app is foreground
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification tap
      const data = response.notification.request.content.data;
      // Navigate to history for relevant events
      if (data?.type === 'FALL_DETECTED' || data?.type === 'HEART_RATE_ALERT') {
        router.push('/(tabs)/history');
      } else {
        router.push('/(tabs)');
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // ==========================================
  // 🔐 LAYER: Logic (Auth Check)
  // Purpose: Check authentication status and redirect
  // ==========================================
  useEffect(() => {
    if (!loaded) return;

    const checkAuth = async () => {
      try {
        const token = await getToken();
        const inAuthGroup = segments[0] === '(auth)';

        if (!token) {
          if (!inAuthGroup) {
            router.replace('/(auth)/login');
          }
        } else {
          // Token exists
          // Check for saved setup step
          try {
            const SecureStore = await import('expo-secure-store');
            const setupStep = await SecureStore.getItemAsync('setup_step');

            if (setupStep === '2') {
              if (segments[0] !== '(setup)' || segments[1] !== 'step2-device-pairing') {
                router.replace('/(setup)/step2-device-pairing');
              }
              return;
            } else if (setupStep === '3') {
              if (segments[0] !== '(setup)' || segments[1] !== 'step3-wifi-setup') {
                router.replace('/(setup)/step3-wifi-setup');
              }
              return;
            }
          } catch (e) {
            console.log('Error checking setup step:', e);
          }

          // Fallback to existing logic if no setup step is saved
          if (!isReady || inAuthGroup) {
            try {
              const { listElders } = require('../services/elderService');
              const elders = await listElders();
              const hasElders = elders && elders.length > 0;

              if (hasElders) {
                if (inAuthGroup || segments[0] === '(setup)') {
                  router.replace('/(tabs)');
                }
              } else {
                // No elders - force redirect to Setup Welcome
                // Unless we are already there
                const isAtSetup = segments[0] === '(setup)';
                if (!isAtSetup) {
                  router.replace('/(setup)/empty-state');
                }
              }
            } catch (error) {
              console.error('Failed to check elders:', error);
              // If error (e.g. network), allow access to tabs (fallback)
              if (inAuthGroup) {
                router.replace('/(tabs)');
              }
            }
          }
        }
      } catch (e) {
        console.error('Auth check failed:', e);
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
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    // alert('Failed to get push token for push notification!');
    return;
  }

  // Check if running in Expo Go
  if (Constants.appOwnership === 'expo') {
    console.log('Running in Expo Go - Push notifications are limited.');
    // On Android, Expo Go no longer supports remote notifications in SDK 53+
    if (Platform.OS === 'android') {
      console.log('Skipping push token registration on Android Expo Go');
      return;
    }
  }

  // ProjectId is now configured in app.json by EAS CLI
  // expo-notifications will automatically read it from app.json (extra.eas.projectId)
  try {
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
  } catch (error) {
    console.log('Error getting push token:', error);
  }

  return token;
}