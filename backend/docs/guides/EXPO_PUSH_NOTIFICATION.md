# Expo Push Notification Integration Guide

เอกสารนี้อธิบายวิธีการใช้งาน Expo Push Notification กับ FallHelp Backend

---

## ✅ รองรับแพลตฟอร์ม

- ✅ **Expo Go (Android)** - ทดสอบบน Expo Go app (Development) - **รองรับ Emulator ได้ (ต้อง setup Firebase)**
- ✅ **Expo Go (iOS)** - ทดสอบบน Expo Go app (Development) - **รองรับ Simulator ได้**
- ✅ **Android Emulator** - ทดสอบได้ด้วย Expo Go บน Emulator **(ต้อง config Firebase)**
- ✅ **iOS Simulator** - ทดสอบได้ด้วย Expo Go บน Simulator **(ไม่ต้อง Firebase)**
- ✅ **Standalone Android APK** - Production build ด้วย EAS Build
- ✅ **Standalone iOS IPA** - Production build ด้วย EAS Build

---

## 🔥 Firebase Setup สำหรับ Android Emulator

### ⚠️ สำคัญ: Android ต้อง setup Firebase Project

**เหตุผล:** Android Push Notification ใช้ Firebase Cloud Messaging (FCM) ดังนั้นต้อง config Firebase แม้จะใช้ Expo Push API

### ขั้นตอน Setup Firebase:

#### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Add project" / "เพิ่มโปรเจ็กต์"
3. ตั้งชื่อโปรเจ็กต์ เช่น "FallHelp"
4. เลือก "Default Account for Firebase"
5. คลิก "Create project"

#### 2. เพิ่ม Android App

1. ในหน้า Project Overview คลิก Android icon
2. กรอก **Android package name**: `com.yourcompany.fallhelp` (ต้องตรงกับใน `app.json`)
3. (Optional) App nickname: "FallHelp Android"
4. คลิก "Register app"

#### 3. Download google-services.json

1. Download ไฟล์ `google-services.json`
2. วางไฟล์ไว้ใน root ของโปรเจค Mobile (เดียวกับ `app.json`)

```
mobile/
├── app.json
├── google-services.json  ← วางที่นี่
├── App.tsx
└── ...
```

#### 4. Update app.json

เพิ่ม config ใน `app.json`:

```json
{
  "expo": {
    "name": "FallHelp",
    "slug": "fallhelp",
    "android": {
      "package": "com.yourcompany.fallhelp",
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.fallhelp"
    }
  }
}
```

#### 5. Rebuild Development Build (ถ้าจำเป็น)

สำหรับ Android Emulator:

```bash
# ติดตั้ง expo-dev-client
npx expo install expo-dev-client

# Build development build
npx expo run:android
```

### 📝 หมายเหตุสำคัญ:

- **iOS Simulator**: ไม่ต้อง setup Firebase ก็ใช้ได้
- **Android Emulator**: **ต้อง** setup Firebase เพื่อให้ Push Notification ทำงาน
- **Expo Go + Firebase**: ใช้งานร่วมกันได้ ไม่ขัดแย้ง
- **Backend**: ยังคงใช้ Expo Push API (`https://exp.host/--/api/v2/push/send`) ไม่เปลี่ยนแปลง

---

## 📱 การขอ Push Token จาก Mobile App

### 1. ติดตั้ง Dependencies

```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. ขอ Permission และ Token (React Native/Expo)

```typescript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// ตั้งค่า Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Function ขอ Push Token
async function registerForPushNotificationsAsync() {
  let token;

  // ✅ ใช้ได้ทั้ง Physical Device และ Emulator/Simulator (ผ่าน Expo Go)
  if (Platform.OS === "android" || Platform.OS === "ios") {
    // ขอ Permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    // ดึง Expo Push Token (ใช้ได้ทั้ง Device และ Emulator)
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;

    console.log("Expo Push Token:", token);
  }

  // Android: ตั้งค่า Notification Channel
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
```

### 3. ส่ง Token ไป Backend

```typescript
// หลัง Login สำเร็จ
const expoPushToken = await registerForPushNotificationsAsync();

if (expoPushToken) {
  // ส่งไปยัง Backend
  await fetch("http://your-backend.com/api/users/push-token", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      pushToken: expoPushToken, // ExponentPushToken[xxxxx]
    }),
  });
}
```

---

## 🔧 Backend API

### Endpoint: `PUT /api/users/push-token`

**Request:**

```json
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Push token updated successfully"
  }
}
```

---

## 📤 การส่ง Push Notification (Backend)

Backend จะส่งอัตโนมัติเมื่อมี Event เกิดขึ้น:

### 1. Fall Detection

```typescript
// ตัวอย่างการทำงาน (ทำอัตโนมัติใน MQTT Handler)
await notificationService.notifyFallDetection(elderId, eventId, timestamp);

// จะส่ง Push Notification ไปยัง caregivers ทั้งหมด
```

### 2. Heart Rate Alert

```typescript
await notificationService.notifyHeartRateAlert(
  elderId,
  eventId,
  timestamp,
  heartRate, // 145 BPM
  "HIGH" // or 'LOW'
);
```

### 3. Device Offline

```typescript
await notificationService.notifyDeviceOffline(elderId, eventId, timestamp);
```

---

## 📋 Token Format

**Expo Push Token Format:**

```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

**ตัวอย่าง Token:**

- Android: `ExponentPushToken[A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6]`
- iOS: `ExponentPushToken[Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4]`

**⚠️ หมายเหตุ:** Token format เหมือนกันทั้ง Android และ iOS

---

## 🧪 การทดสอบ

### 1. ทดสอบด้วย Expo Go App

**Android (Emulator) - ต้อง setup Firebase ก่อน:**

1. ✅ Setup Firebase Project แล้ว (ตามขั้นตอนด้านบน)
2. ✅ Download `google-services.json` และวางใน root โปรเจค
3. ✅ Update `app.json` ให้มี `googleServicesFile`
4. เปิด Android Emulator
5. ติดตั้ง Expo Go จาก Play Store บน Emulator
6. Run `npx expo start` และ Scan QR Code
7. ขอ Permission → ได้ Token
8. ทดสอบส่ง Notification ผ่าน Backend API

**Android (Physical Device):**

1. ติดตั้ง Expo Go จาก Google Play Store
2. Scan QR Code จากโปรเจค Mobile (`npx expo start`)
3. ขอ Permission แล้วจะได้ Token
4. ทดสอบส่ง Notification

**iOS (Simulator) - ไม่ต้อง setup Firebase:**

1. เปิด iOS Simulator
2. ติดตั้ง Expo Go
3. Scan QR Code จากโปรเจค Mobile (`npx expo start`)
4. ขอ Permission → ได้ Token
5. ทดสอบส่ง Notification

**iOS (Physical Device):**

1. ติดตั้ง Expo Go จาก App Store
2. Scan QR Code
3. ขอ Permission → ได้ Token
4. ทดสอบส่ง Notification

**✅ สำคัญ:** Expo Go รองรับ Push Notification บน Emulator/Simulator เพราะ Expo จัดการ infrastructure ให้

### 2. ทดสอบด้วย API Simulator

```bash
# 1. Start Simulator
curl -X POST http://localhost:3000/api/simulator/start/FH-DEV-001 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Trigger Fall Event
curl -X POST http://localhost:3000/api/simulator/trigger/fall/FH-DEV-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "high",
    "latitude": 13.7563,
    "longitude": 100.5018
  }'

# Mobile App ควรได้รับ Push Notification ทันที
```

### 3. ทดสอบด้วย Expo Push Notification Tool

เข้าไปที่ https://expo.dev/notifications แล้วใส่:

- **Token:** `ExponentPushToken[xxxxx]`
- **Title:** Test Notification
- **Body:** This is a test message

---

## 🚀 Production Deployment

### 1. Build with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### 2. app.json Configuration

```json
{
  "expo": {
    "name": "FallHelp",
    "slug": "fallhelp",
    "version": "1.0.0",
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FF231F",
      "iosDisplayInForeground": true,
      "androidMode": "default",
      "androidCollapsedTitle": "FallHelp Alert"
    },
    "android": {
      "package": "com.fallhelp.app",
      "permissions": ["RECEIVE_BOOT_COMPLETED", "VIBRATE"]
    },
    "ios": {
      "bundleIdentifier": "com.fallhelp.app",
      "supportsTablet": true
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

---

## 🔍 Troubleshooting

### ปัญหา: ไม่ได้รับ Notification บน Android Emulator

**แก้ไข:**

1. ✅ **ตรวจสอบ Firebase Setup:**
   - ตรวจสอบว่า `google-services.json` อยู่ใน root โปรเจค
   - ตรวจสอบว่า `app.json` มี `googleServicesFile` config
   - ตรวจสอบว่า package name ตรงกันใน Firebase Console และ `app.json`
2. ✅ Rebuild app: `npx expo run:android`
3. ✅ ตรวจสอบว่า Permission ได้รับแล้ว
4. ✅ Restart Expo Go app
5. ✅ ลองส่ง test notification ผ่าน [Expo Push Tool](https://expo.dev/notifications)

### ปัญหา: google-services.json ไม่ทำงาน

**แก้ไข:**

```bash
# ลบ cache แล้ว rebuild
rm -rf node_modules
npm install
npx expo prebuild --clean
npx expo run:android
```

### ปัญหา: ไม่ได้รับ Notification บน iOS Simulator

**แก้ไข:**

1. ✅ ใช้ Expo Go บน Simulator (รองรับ Push Notification)
2. ตรวจสอบว่า Permission ได้รับแล้ว
3. ตรวจสอบ `iosDisplayInForeground: true` ใน app.json
4. ลอง Restart Expo Go app

### ปัญหา: Token Format ไม่ถูกต้อง

**ตรวจสอบ:**

```typescript
// Token ต้องเริ่มด้วย ExponentPushToken[
if (!token.startsWith("ExponentPushToken[")) {
  console.error("Invalid token format");
}
```

### ปัญหา: Backend ส่ง Error 400

**ตรวจสอบ:**

1. Token format ถูกต้องหรือไม่
2. Token หมดอายุหรือไม่ (ขอ Token ใหม่)
3. ดู Backend logs: `[Expo Push] ❌ Failed to send`

### 💡 Tips สำหรับการทดสอบบน Emulator/Simulator

**สำหรับ Android Emulator:**

- ⚠️ **ต้อง setup Firebase Project** (ดูขั้นตอนด้านบน)
- ✅ Download `google-services.json` และวางใน root
- ✅ Config `app.json` ให้มี `googleServicesFile`
- ✅ Rebuild: `npx expo run:android`

**สำหรับ iOS Simulator:**

- ✅ **ไม่ต้อง** setup Firebase
- ✅ ใช้ Expo Go ได้เลยโดยไม่ต้อง config เพิ่ม

**ขั้นตอนการทดสอบ:**

1. **(Android เท่านั้น)** Setup Firebase + google-services.json
2. เปิด Android Emulator หรือ iOS Simulator
3. ติดตั้ง Expo Go app
4. Run `npx expo start` และ scan QR code
5. ขอ Permission → ได้ Token
6. ส่ง Token ไป Backend
7. Trigger Event → รับ Notification ทันที

**ข้อดี:**

- ✅ ไม่ต้องมีอุปกรณ์จริง
- ✅ ทดสอบได้รวดเร็ว
- ✅ Expo + Firebase ทำงานร่วมกันได้ดี

**Reference:** [Expo Push Notifications on Emulator Tutorial](https://youtu.be/V-hois8dgM4)

---

## 📊 Notification Types

Backend รองรับ 3 ประเภท:

| Type               | Title                     | Body Example                        | Data                         |
| ------------------ | ------------------------- | ----------------------------------- | ---------------------------- |
| `FALL_DETECTED`    | ⚠️ ตรวจพบการหกล้ม         | แม่ทองดี อาจหกล้ม กรุณาตรวจสอบด่วน! | `{ type, timestamp }`        |
| `HEART_RATE_ALERT` | ⚠️ ชีพจรผิดปกติ           | แม่ทองดี มีชีพจร 145 BPM            | `{ type, value, alertType }` |
| `DEVICE_OFFLINE`   | 📱 อุปกรณ์ขาดการเชื่อมต่อ | อุปกรณ์ของ แม่ทองดี ออฟไลน์         | `{ type }`                   |

---

## 🔐 Security Notes

1. **Token Storage:** เก็บ Token ใน Backend database (User.pushToken)
2. **Token Refresh:** Mobile App ควร update token ทุกครั้งที่ Login
3. **Validation:** Backend validate token format ก่อนบันทึก
4. **HTTPS:** ใช้ HTTPS เสมอใน Production

---

## 📚 References

- [Expo Push Notifications Documentation](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Sending Notifications Guide](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Push Notification Format](https://docs.expo.dev/push-notifications/sending-notifications/#message-request-format)

---

**อัพเดทล่าสุด:** 26 พฤศจิกายน 2568

**หมายเหตุ:** System รองรับทั้ง Android และ iOS แบบเต็มรูปแบบ ไม่ต้องแยก configuration
