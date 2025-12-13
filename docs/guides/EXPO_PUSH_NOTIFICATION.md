# Expo Push Notification Guide

# คู่มือ Push Notification

คู่มือนี้อธิบายวิธีใช้งาน Expo Push Notification กับ FallHelp

---

## Supported Platforms

| Platform         | Development | Production | Firebase Required |
| ---------------- | :---------: | :--------: | :---------------: |
| Android Emulator |      ✓      |     -      |   ✓ ต้องติดตั้ง   |
| iOS Simulator    |      ✓      |     -      |     ✗ ไม่ต้อง     |
| Android Device   |      ✓      |     ✓      |   ✓ ต้องติดตั้ง   |
| iOS Device       |      ✓      |     ✓      |     ✗ ไม่ต้อง     |

---

## Quick Start

### 1. ติดตั้ง Dependencies

```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. ขอ Permission และ Token

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

### 3. ส่ง Token ไป Backend

```typescript
await api.put("/users/push-token", {
  pushToken: token,
});
```

---

## Firebase Setup (Android Only)

### ขั้นตอน

1. **สร้าง Firebase Project**

   - ไปที่ [Firebase Console](https://console.firebase.google.com/)
   - สร้างโปรเจคใหม่ชื่อ "FallHelp"

2. **เพิ่ม Android App**

   - Package name: `com.yourcompany.fallhelp`
   - Download `google-services.json`

3. **วางไฟล์ในโปรเจค**

```
mobile/
├── app.json
├── google-services.json  ← วางที่นี่
└── ...
```

4. **Update app.json**

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

---

## Backend API

### Endpoint: ส่ง Notification

```
POST /api/notifications/send
```

**Request Body:**

```json
{
  "userId": "user-id",
  "title": "Fall Detected!",
  "body": "คุณยายล้ม กรุณาตรวจสอบ",
  "data": {
    "eventId": "event-123",
    "type": "FALL"
  }
}
```

### Internal Function

```typescript
// backend/src/utils/pushNotification.ts
import { Expo } from "expo-server-sdk";

const expo = new Expo();

async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: object
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

---

## Notification Types

| Type            | Title           | Body                             |
| --------------- | --------------- | -------------------------------- |
| FALL            | ตรวจพบการหกล้ม! | คุณ{elderName} ล้ม กรุณาตรวจสอบ  |
| HEART_RATE_HIGH | ชีพจรสูงผิดปกติ | {bpm} BPM กรุณาตรวจสอบ           |
| HEART_RATE_LOW  | ชีพจรต่ำผิดปกติ | {bpm} BPM กรุณาตรวจสอบ           |
| DEVICE_OFFLINE  | อุปกรณ์ออฟไลน์  | อุปกรณ์ของ{elderName} ไม่ตอบสนอง |

---

## Troubleshooting

| ปัญหา                 | วิธีแก้ไข                       |
| --------------------- | ------------------------------- |
| Token เป็น null       | ใช้อุปกรณ์จริง ไม่ใช่ Simulator |
| Android ไม่ได้รับ     | Setup Firebase ก่อน             |
| iOS Simulator ไม่แสดง | ปกติ - ใช้อุปกรณ์จริงทดสอบ      |
| Backend ส่งไม่ได้     | ตรวจสอบ projectId ใน app.json   |

---

**Last Updated:** December 13, 2025
