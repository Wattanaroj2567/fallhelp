import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { updatePushToken } from '@/services';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationState {
  expoPushToken?: string;
  notification?: Notifications.Notification;
  error?: Error;
}

export const usePushNotifications = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const [error, setError] = useState<Error | undefined>();

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  // Register for push notifications and get token
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      // Set notification channel for Android
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for push notifications');
      }

      // Get Expo Push Token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log('Expo Push Token:', token);

      // Send token to backend
      // Send token to backend if user is logged in
      try {
        const { getToken } = require('@/services/tokenStorage');
        const authToken = await getToken();
        if (authToken) {
          await updatePushToken({ pushToken: token });
          console.log('Push token saved to backend');
        } else {
          console.log('User not logged in, skipping push token save');
        }
      } catch (err: any) {
        // Check for 401 Unauthorized (invalid/expired token)
        // [CRITICAL] DO NOT REMOVE OR MODIFY THIS CHECK WITHOUT TESTING STARTUP FLOW
        // This logic suppresses "Invalid token" errors that occur when the app starts
        // and tries to register a push token before the user has logged in.
        // We check status, message, and stringified error to be absolutely sure we catch it.
        const status = err?.status || err?.response?.status;
        const message = err?.message || '';
        const isUnauthorized = status === 401 || message.includes('401') || JSON.stringify(err).includes('401');

        // Only log if it's NOT a 401 error
        if (!isUnauthorized) {
          console.error('Failed to save push token to backend:', err);
        } else {
          console.log('Push token save skipped: User not authenticated (401)');
        }
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    return token;
  }

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token))
      .catch((error: Error) => setError(error));

    // Listener for when a notification is received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    // Listener for when a user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      console.log('Notification data:', data);
      // TODO: Add navigation logic based on notification type
    });

    // Cleanup listeners
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    error,
  };
};
