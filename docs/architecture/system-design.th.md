# การออกแบบระบบและสถาปัตยกรรม

[English](system-design.md) · [ภาษาไทย](system-design.th.md)

## ข้อมูลเอกสาร

- ผู้อ่าน: Backend/Mobile/Admin Dev, QA
- แหล่งอ้างอิงหลัก (Source of Truth): [apps/backend-api/src/](../../apps/backend-api/src), [apps/mobile/app/](../../apps/mobile/app), [apps/admin/src/](../../apps/admin/src)
- สถานะ: Active
- อัปเดตล่าสุด: 10 พฤษภาคม 2026

---

## ภาพรวม

เอกสารนี้อธิบายสถาปัตยกรรมหลักของระบบ FallHelp: IoT ingestion, Database, Mobile App, Admin Panel และ Notification System

---

## System Flow (ภาพรวมระดับสูง)

```
IoT Device → MQTT → Backend API/Realtime Layer → (Socket.io + Push) → Mobile
                                              ↘ DB (PostgreSQL)
Admin Panel → Backend API → DB
```

---

## 1) สถาปัตยกรรมฐานข้อมูล (PostgreSQL)

เราใช้ PostgreSQL เก็บข้อมูล event จากอุปกรณ์ IoT (Fall Detection และ Heart Rate)

### การตั้งค่าและรีเซ็ต

```bash
npm run db:reset --prefix apps/backend-api
```

### การตรวจสอบ

```bash
npm run db:verify --prefix apps/backend-api
```

**สิ่งที่ตรวจ:** Prisma migrations, tables/constraints, indexes และการตรวจ data integrity

---

## 2) สถาปัตยกรรม Mobile App

### Core Providers และ App Shell (`apps/mobile/app/_layout.tsx`)

- **AuthProvider** - สถานะ auth + token
- **DialogProvider** - จัดการ dialog แบบรวมศูนย์
- **useSocketConnection + Zustand stores** - realtime socket lifecycle และ runtime telemetry state
- **React Query** - caching + fetching
- **SafeAreaProvider + PaperProvider** - UI พื้นฐาน
- **useProtectedRoute** - route guard
- **usePushNotifications** - ลงทะเบียน Expo Push token + invalidation สำรองเมื่อได้รับ push ขณะแอปอยู่ foreground

### การจัดการ Error

- Logger: `apps/mobile/utils/logger.ts`
- API interceptor: `apps/mobile/services/api.ts`
- Error boundaries: `expo-router` + `ErrorBoundary` ที่เขียนเอง

### Real-time Events

- `fall_detected`, `event_status_changed`, `heart_rate_update`, `device_status_update`, `system_message`

---

## 3) สถาปัตยกรรม Admin Panel

### Auth และ Routing

- `apps/admin/src/App.tsx` ใช้ `AuthProvider`, `ThemeProvider`, `React Query`
- **ProtectedRoute** บังคับให้ login
- **ไม่มี register/reset ของ admin แบบสาธารณะ** (สร้างผ่าน seed/จัดการโดย admin เท่านั้น)

### API Client

- `apps/admin/src/services/api.ts` แนบ JWT
- Redirect อัตโนมัติเมื่อได้ 401 (กรณีไม่ใช่ request login)

---

## 4) สถาปัตยกรรม Background Scheduler

Scheduled tasks ปัจจุบันถูก bootstrap ผ่าน `initSchedulers()` ใน `apps/backend-api/src/schedulers/otpScheduler.ts` และถูกเรียกครั้งเดียวใน `server.ts` หลัง HTTP server เริ่มทำงาน

| Scheduler    | ตำแหน่ง           | รอบการทำงาน               | วัตถุประสงค์                 |
| ------------ | ----------------- | ------------------------- | ---------------------------- |
| `otpCleanup` | `otpScheduler.ts` | ทุกชั่วโมง + ตอน startup | ลบ OTP หมดอายุใน `auth_otps` |

> ถ้าจะเพิ่ม scheduler ใหม่ในโครงสร้างปัจจุบัน ให้เพิ่ม logic ลงไฟล์ scheduler bootstrap ที่ใช้งานจริง หรือแยก helper ใหม่แล้ว import เข้ามาที่ `otpScheduler.ts` ในโฟลเดอร์ `schedulers`

---

## 5) สถาปัตยกรรมระบบแจ้งเตือน

### Backend

- `notificationService.ts` สร้าง notification records
- `pushNotification.ts` ส่ง Expo Push สำหรับ fall alert ที่ยืนยันแล้ว
- `userRoutes` เปิด `/api/users/me/push-token`
- `authRoutes` เปิด `/api/auth/logout` เพื่อล้าง `users.pushToken` เมื่อแอป mobile ออกจากระบบ
- `fallHandler.ts` emit Socket.io ก่อน side effect ของ push/notification เพื่อให้การ์ดบน dashboard อัปเดตก่อน
- `notifications.eventId` เป็น required FK ไปยัง `events.id` เพื่อให้ join เหตุการณ์ตรงจาก relational model

### Mobile

- `notificationService.ts` จัดการ list/read/read-all/unread count
- หน้าจอ Notifications: `apps/mobile/app/(features)/(notification)/notifications.tsx`
- Unread badge: `apps/mobile/app/(tabs)/dashboard.tsx`
- `useSocketConnection.ts` refetch unread count และรายการ notification พร้อมกันหลังการล้มถูกยืนยัน เพื่อไม่ให้ badge ขึ้นก่อนรายการใน notification list

---

## เอกสารที่เกี่ยวข้อง

- [`project-structure.md`](project-structure.th.md)
- [`../planning/functional-requirements.md`](../planning/functional-requirements.th.md)
- [`../tech/api-reference.md`](../api/api-reference.th.md)

---
