/**
 * Expo Push Notification utilities
 * Uses Expo Push Notification API instead of Firebase Admin SDK
 * 
 * ✅ Supports: Expo Go (Android & iOS), Standalone Apps, EAS Build
 * 
 * Documentation: https://docs.expo.dev/push-notifications/sending-notifications/
 * API Endpoint: https://exp.host/--/api/v2/push/send
 * 
 * Token Format: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
 * - Same token format for both Android and iOS
 * - Works with Expo Go app (Development)
 * - Works with production builds (EAS Build)
 */

import createDebug from 'debug';

const log = createDebug('fallhelp:push');

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Send push notification to single device via Expo Push API
 */
export const sendNotification = async (
  expoPushToken: string,
  payload: NotificationPayload
): Promise<boolean> => {
  try {
    // Validate Expo Push Token format
    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
      log('[Expo Push] Invalid token format: %s', expoPushToken);
      return false;
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (result.data && result.data[0]?.status === 'ok') {
      log('[Expo Push] ✅ Notification sent successfully: %s...', expoPushToken.substring(0, 30));
      return true;
    } else {
      log('[Expo Push] ❌ Failed to send: %O', result);
      return false;
    }
  } catch (error) {
    log('[Expo Push] Error sending notification: %O', error);
    return false;
  }
};

/**
 * Send push notification to multiple devices via Expo Push API
 */
export const sendMulticastNotification = async (
  expoPushTokens: string[],
  payload: NotificationPayload
): Promise<number> => {
  try {
    // Filter valid tokens
    const validTokens = expoPushTokens.filter(token => 
      token && token.startsWith('ExponentPushToken[')
    );

    if (validTokens.length === 0) {
      log('[Expo Push] No valid tokens to send to');
      return 0;
    }

    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    const successCount = result.data?.filter((r: any) => r.status === 'ok').length || 0;
    log('[Expo Push] ✅ Sent to %d/%d devices', successCount, validTokens.length);

    return successCount;
  } catch (error) {
    log('[Expo Push] Error sending multicast notification: %O', error);
    return 0;
  }
};

/**
 * Send fall detection alert
 */
export const sendFallAlert = async (
  pushTokens: string[],
  elderName: string,
  timestamp: Date
): Promise<void> => {
  await sendMulticastNotification(pushTokens, {
    title: '⚠️ ตรวจพบการหกล้ม',
    body: `${elderName} อาจหกล้ม กรุณาตรวจสอบด่วน!`,
    data: {
      type: 'FALL_DETECTED',
      timestamp: timestamp.toISOString(),
    },
  });
};

/**
 * Send heart rate alert
 */
export const sendHeartRateAlert = async (
  pushTokens: string[],
  elderName: string,
  value: number,
  type: 'HIGH' | 'LOW'
): Promise<void> => {
  await sendMulticastNotification(pushTokens, {
    title: type === 'HIGH' ? '⚠️ ชีพจรสูงผิดปกติ' : '⚠️ ชีพจรต่ำผิดปกติ',
    body: `${elderName} มีชีพจร ${value} BPM`,
    data: {
      type: 'HEART_RATE_ALERT',
      value: value.toString(),
      alertType: type,
    },
  });
};

/**
 * Send device offline alert
 */
export const sendDeviceOfflineAlert = async (
  pushTokens: string[],
  elderName: string
): Promise<void> => {
  await sendMulticastNotification(pushTokens, {
    title: '📱 อุปกรณ์ขาดการเชื่อมต่อ',
    body: `อุปกรณ์ของ ${elderName} ออฟไลน์`,
    data: {
      type: 'DEVICE_OFFLINE',
    },
  });
};
