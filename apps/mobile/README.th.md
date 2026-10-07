# FallHelp Mobile

[English](README.md) · [ภาษาไทย](README.th.md)

แอปพลิเคชันสำหรับผู้ดูแล (caregiver) ของ FallHelp พัฒนาด้วย React Native (Expo SDK 55)  
รองรับการยืนยันตัวตน, การจัดการผู้สูงอายุ/อุปกรณ์, การแจ้งเตือนแบบ realtime และ flow การเฝ้าติดตาม

## ขอบเขต

- UX และการนำทางของแอปผู้ดูแล (Expo Router)
- การเชื่อมต่อ API กับ backend
- การจัดการ realtime events ผ่าน Socket
- flow การตั้งค่า BLE/WiFi สำหรับ provisioning อุปกรณ์
- การลงทะเบียน Expo Push, การล้าง push token ที่ backend ตอน logout และการ sync badge/รายการแจ้งเตือน

## โครงสร้าง Route

```text
app/
├── (auth)/          # Login/register/OTP/password flows
├── (setup)/         # Empty state + 3-step onboarding wizard
├── (tabs)/
│   ├── dashboard.tsx
│   └── history.tsx
└── (features)/
    ├── (device)/        # device-pairing, device-wifi-setup (+ internal reconfig/BLE subflows), device-info
    ├── (elder)/         # elder-info, edit
    ├── (emergency)/     # contacts, add, edit, call
    ├── (notification)/  # notifications
    ├── (report)/        # report-summary
    └── (profile)/       # profile-info, edit-info, change-email/password, edit-phone
```

## หมายเหตุ Runtime

- สถานะของการ์ดบน Dashboard ขับเคลื่อนด้วย realtime events จาก Socket.io
- badge แจ้งเตือนและรายการแจ้งเตือนถูก sync จาก notification records ของ backend พร้อมกัน ดังนั้นจุดแดงไม่ควรขึ้นก่อนที่รายการจะมีอยู่จริง
- การ logout จะเรียก `/api/auth/logout` ของ backend ก่อนล้าง JWT ในเครื่อง เพื่อให้ `users.pushToken` ถูกล้างที่ฝั่ง server

## เริ่มต้นใช้งานอย่างรวดเร็ว

```bash
cd apps/mobile
npm install
cp .env.example .env

# Update .env for your machine/network
npx expo start
```

เป้าหมายการรัน:

```bash
npm run android
npm run ios
npm run web
```

## คำสั่ง

```bash
npm run start
npm run typecheck
npm run lint
npm run lint:fix
npm run test -- --watchman=false
npm run test:light -- --watchman=false
npm run test:coverage
```

## EAS Build

ติดตั้ง `eas-cli` เป็น devDependency ของแอปนี้ และเรียกใช้ผ่าน entrypoint ของ package manager ในโปรเจกต์

```bash
cd apps/mobile
npm exec eas login
npm exec eas build --platform android --profile development
```

ใช้ entrypoint ในโปรเจกต์แบบเดียวกันนี้กับคำสั่ง EAS อื่น ๆ ทั้งหมด

## Environment

ใช้ `apps/mobile/.env.example` เป็นแหล่งอ้างอิงหลัก (source of truth)

- `EXPO_PUBLIC_API_URL` (แนะนำ)
- `EXPO_PUBLIC_SOCKET_URL` (override ได้ ไม่บังคับ)
- `EXPO_PUBLIC_FORCE_PUBLIC` (บังคับใช้ public URL เมื่อใช้ Expo tunnel)
- `GOOGLE_SERVICES_JSON_BASE64` (ไม่บังคับ ใช้สำหรับ EAS Android build)

## ตรวจสอบก่อนเปิด PR

```bash
npm run typecheck
npm run lint
npm run test:light -- --watchman=false
```

## เอกสารที่เกี่ยวข้อง

- คู่มือหลักของ repo: [`../../README.th.md`](../../README.th.md)
- flow การจับคู่อุปกรณ์และ BLE/WiFi provisioning: [`../../docs/features/device-pairing.th.md`](../../docs/features/device-pairing.th.md)
- Dashboard: [`../../docs/features/dashboard.th.md`](../../docs/features/dashboard.th.md)
- ระบบแจ้งเตือน: [`../../docs/features/notifications.th.md`](../../docs/features/notifications.th.md)
- ฟีเจอร์ตรวจจับการล้ม: [`../../docs/features/fall-detection.th.md`](../../docs/features/fall-detection.th.md)
