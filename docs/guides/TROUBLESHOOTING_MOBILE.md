# Mobile Troubleshooting

# การแก้ไขปัญหา Mobile App

รวบรวมปัญหาที่พบบ่อยและวิธีแก้ไขสำหรับ Mobile App

---

## รายการปัญหา

| #   | ปัญหา                        | สาเหตุ          |
| --- | ---------------------------- | --------------- |
| 1   | 401 Unauthorized ตอน Startup | Token หมดอายุ   |
| 2   | App Crash on Logout          | ฟังก์ชันชื่อผิด |
| 3   | Push Notifications ไม่ทำงาน  | ไม่มี Token     |
| 4   | Cannot connect to API        | URL ผิด         |

---

## 1. 401 Unauthorized ตอน Startup

**อาการ:**  
App แสดง error "Invalid or expired token" ตอนเปิดแอป

**สาเหตุ:**  
Token เก่าหมดอายุแล้วยังเก็บอยู่

**วิธีแก้ไข:**

ใน `app/_layout.tsx` ต้องมี logic นี้:

```typescript
// ตรวจสอบ 401 Unauthorized
const status = error?.status || error?.response?.status;
if (status === 401) {
  await clearToken();
  router.replace("/(auth)/login");
  return;
}
```

---

## 2. App Crash on Logout

**อาการ:**  
`TypeError: removeToken is not a function`

**วิธีแก้ไข:**

เปลี่ยน `removeToken` เป็น `clearToken`:

```typescript
// ❌ ผิด
import { removeToken } from "services/tokenStorage";

// ✅ ถูก
import { clearToken } from "services/tokenStorage";
```

---

## 3. Push Notifications ไม่ทำงาน

**อาการ:**  
Notification อยู่ใน History แต่ไม่มี pop-up

**วิธีแก้ไข:**

1. ตรวจสอบว่ามี Push Token ใน DB:

   - ดู `User.pushToken` ในฐานข้อมูล

2. ตรวจสอบ Permissions:

   - ตรวจสอบว่า app ขอ permissions แล้ว

3. Android Emulator:

   - ต้อง setup Firebase ก่อน (ดู `EXPO_PUSH_NOTIFICATION.md`)

4. iOS Simulator:
   - Push อาจไม่แสดง visual - ใช้อุปกรณ์จริง

---

## 4. Cannot Connect to API

**อาการ:**  
`Network Error` หรือ `ECONNREFUSED`

**วิธีแก้ไข:**

1. ตรวจสอบว่า Backend กำลังทำงาน:

```bash
cd backend
npm run dev
```

2. ตรวจสอบ API URL ใน Mobile:

```typescript
// mobile/services/api.ts หรือ Config.ts
const API_URL = "http://YOUR_IP:3333/api";
```

3. ใช้ IP จริงแทน `localhost`:
   - Android Emulator: `10.0.2.2`
   - iOS Simulator: `localhost` หรือ IP จริง
   - Physical Device: IP จริง (เช่น `192.168.1.x`)

---

**Last Updated:** December 13, 2025
