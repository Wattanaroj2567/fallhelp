# Notification System

[English](notifications.md) · [ภาษาไทย](notifications.th.md)

# Notification System Guide

## Doc Meta

- Audience: Backend Dev / Mobile Dev / QA
- Source of Truth: [notificationService.ts](../../apps/backend-api/src/services/notificationService.ts), [fallHandler.ts](../../apps/backend-api/src/iot/handlers/fallHandler.ts), [useSocketConnection.ts](../../apps/mobile/hooks/useSocketConnection.ts), [usePushNotifications.ts](../../apps/mobile/hooks/usePushNotifications.ts), [pushNotification.ts](../../apps/backend-api/src/utils/pushNotification.ts)
- Status: Active
- Last Updated: May 21, 2026

---

## Overview

The FallHelp notification system is designed so caregivers receive important information immediately (Real-time) through multiple channels, with clearly separated rules:

- `fall_confirmed` = Socket + Push + Notification history
- Device online/offline status = shown in real time on the Dashboard; does not create a normal notification
- The BPM at the moment of the fall is stored in `Event.bpm` of the `FALL` event and is included in the alert message when available

This guide describes the boundaries of Expo Push Notification in FallHelp, from requesting permission, storing the token, and sending via the backend, to the limits between push and in-app alerts.

---

## Notification Types

| Source Event | Trigger Condition       | Channels           |
| :----------- | :---------------------- | :----------------- |
| **Event**    | `fallStage = CONFIRMED` | Socket + Push + DB |

**Notification Scope:**

| Source Event                 | Channel       | Title                | Body                                                            |
| ---------------------------- | ------------- | -------------------- | --------------------------------------------------------------- |
| Fall event (`eventId`)       | Push + In-App | ตรวจพบการหกล้ม! (Fall detected!) | {elderName} อาจล้ม ชีพจร: {bpm} BPM ({elderName} may have fallen, heart rate: {bpm} BPM) (if data is available) |

> **Push notifications in the current phase come only from fall events** — there is no standalone HR notification
> The BPM at fall time is attached directly to the fall notification (if the sensor read a value within 5 minutes)
> The Dashboard card comes from Socket.io realtime, while the bell badge and the notification list sync after the backend actually creates the notification record

---

## Notification Channels

We use 3 main channels for alerts:

| Channel               | Tech Stack    | Use Case                                            | Speed         |
| :-------------------- | :------------ | :-------------------------------------------------- | :------------ |
| **Real-time Alert**   | Socket.io     | Red Full Screen Alert while the app is open         | Instant (<1s) |
| **Push Notification** | Expo Push API | Alerts while the screen is locked or the app is closed | Fast (1-5s) |
| **In-App History**    | PostgreSQL    | Past notification history + bell badge              | After the backend creates the record and mobile refetches |

---

## Push Implementation (Expo)

### Supported Platforms

| Platform         | Development | Production | Firebase Required |
| ---------------- | :---------: | :--------: | :---------------: |
| Android Emulator |      ✓      |     -      |   ✓ Required      |
| iOS Simulator    |      ✓      |     -      |   ✗ Not required  |
| Android Device   |      ✓      |     ✓      |   ✓ Required      |
| iOS Device       |      ✓      |     ✓      |   ✗ Not required  |

### Quick Start

**1. Install Dependencies:**

```bash
npx expo install expo-notifications expo-device expo-constants
```

**2. Request Permission and Token:**

```typescript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Permission not granted");
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: "your-expo-project-id",
  });

  return token.data;
}
```

**3. Send the Token to the Backend:**

```typescript
await api.put("/api/users/me/push-token", {
  pushToken: token,
});
```

### Firebase Setup (Android Only)

1. **Create a Firebase Project** — go to the [Firebase Console](https://console.firebase.google.com/)
2. **Add an Android App** — Package name: `com.yourcompany.fallhelp`, Download `google-services.json`
3. **Place the file in the project:**

```
apps/mobile/
├── app.json
├── google-services.json  ← place it here
└── ...
```

1. **Update app.json:**

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.fallhelp",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### Backend Internal Function

```typescript
// apps/backend-api/src/utils/pushNotification.ts
import { Expo } from "expo-server-sdk";

const expo = new Expo();

async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: object,
) {
  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  };

  const [ticket] = await expo.sendPushNotificationsAsync([message]);
  return ticket;
}
```

### Token Management

- The token is stored in `users.pushToken`
- The Mobile App updates the token every time the app opens (`registerPushToken`)
- On mobile logout, the app calls `POST /api/auth/logout` before clearing the local JWT so the backend clears `users.pushToken`
- The current model is 1 User ↔ 1 Elder, so notifications go to that elder's owner

---

## Architecture Flow

Example Flow: **Fall Confirmed**

1. **IoT Device:** sends `fall_confirmed` (with the BPM value if available) via MQTT
2. **Backend (`fallHandler.ts`):**
   - Finds the pending event and updates `fallStage` to `CONFIRMED`
   - Saves the BPM in `Event.bpm` from the heart-rate cache (if available)
3. **Trigger Alert Channels:**
   - **Socket:** Emit `fall_detected` to the elder's room first, so the Dashboard card responds as fast as possible
   - **DB:** Create a record in the `notifications` table (for History)
   - **Push:** Send an Expo Push Notification via the Expo Push API

> This order is intentional so the real-time card arrives before or together with the push. The bell badge and notification list do not use an optimistic fake item; they wait to refetch after the backend has actually created the `Notification`, so they should arrive together.

---

## Socket vs Push Distinction

### Socket.io Events (Namespace: `/`)

Events the Mobile App must listen to:

- `fall_detected` → opens the Fall Alert screen
- `event_status_changed` → internal lifecycle signal for the pending/confirmed/cancelled guard; does not create a caregiver alert or notification record
- `heart_rate_update` → updates the BPM value on the Dashboard (real-time, does not create a notification)
- `device_status_update` → updates the device's online/offline status

### Database Schema

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  message   String
  isRead    Boolean  @default(false)

  eventId   String
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}
```

> `Notification` in the current phase comes only from fall events, so `eventId` is required and `onDelete: Cascade` is used so no history remains without its source event

### Client-Side Handling (Mobile)

**Foreground:**

- Socket event arrives → shows the Modal/Overlay immediately
- `useSocketConnection` waits briefly, then refetches `unread-count` and the notification list together, so the bell's red dot does not appear before the actual list
- Push Notification arrives → invalidates notification/history queries and serves as a fallback while the app is in the foreground

**Background/Quit:**

- User taps the Push Notification → always navigates to the **Dashboard (home screen)**
- No deep link straight to the Event Detail screen — so the caregiver sees the real-time status before deciding (call or view details)

---

## Backend API Endpoints

### Register Expo Push Token

```
PUT /api/users/me/push-token
```

**Request Body:**

```json
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### Logout and Clear Push Token

```
POST /api/auth/logout
```

Mobile must call this endpoint before clearing the local JWT so the backend sets `users.pushToken = null`
and stops sending push to the device/session that has logged out.

---

## Troubleshooting

| Problem               | Solution                        |
| --------------------- | ------------------------------- |
| Token is null         | Use a real device, not a Simulator |
| Android not receiving | Set up Firebase first           |
| iOS Simulator shows nothing | Normal - test on a real device |
| Backend cannot send   | Check projectId in app.json     |

---

## Related Docs

- [Realtime System](realtime.md)
- [Fall Detection System](fall-detection.md)
- [API Reference](../api/api-reference.md)
- [Mobile AI Context](../ai/mobile.md)
- [Backend AI Context](../ai/backend.md)
