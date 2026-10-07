# FallHelp Admin

[English](README.md) · [ภาษาไทย](README.th.md)

แผงผู้ดูแลระบบบนเว็บ (React + Vite) สำหรับงานจัดการอุปกรณ์ของ FallHelp

## ขอบเขต

- หน้าจัดการอุปกรณ์ ESP32 ที่ลงทะเบียนไว้
- การยืนยันตัวตนของผู้ดูแลระบบและ protected routes
- การเชื่อมต่อ API สำหรับ workflow ดูรายการอุปกรณ์, ลงทะเบียน, ลบ และ force-unpair

## เริ่มต้นใช้งานอย่างรวดเร็ว

```bash
cd apps/admin
npm install
cp .env.example .env
npm run dev
```

URL ปริยายบนเครื่อง: `http://localhost:5173`  
URL ของ backend API ที่คาดไว้: `http://localhost:3000/api`

## คำสั่ง

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
npm run test:coverage
npm run preview
```

## Docker

สามารถรันผ่าน compose ที่ root ได้จาก [`../../docker-compose.yml`](../../docker-compose.yml)

```bash
docker compose --env-file apps/backend-api/.env up -d --build --pull always admin
```

ค่าปริยายของหน้าเว็บใน container คือ `http://localhost:5173`

## Environment

ใช้ `apps/admin/.env.example` เป็นแหล่งอ้างอิงหลัก (source of truth)

- `VITE_API_URL=http://localhost:3000/api`

## Data Layer

- `src/services/api.ts` เป็น Axios instance กลางสำหรับ base URL, auth token, interceptors และ 401 handling
- `src/services/adminAuthService.ts` รับผิดชอบการเข้าสู่ระบบของผู้ดูแลระบบ
- `src/services/adminDeviceService.ts` รวม fetch/mutation functions ของ Admin API สำหรับ device list, register, delete และ force-unpair
- `src/hooks/useAdminDevices.ts` รับผิดชอบ TanStack Query cache/state ของหน้า Devices เช่น `queryKey`, polling interval และ invalidation

## ตรวจสอบก่อนเปิด PR

```bash
npm run build
npm run typecheck
npm run lint
npm run test
```

## เอกสารที่เกี่ยวข้อง

- คู่มือหลักของ repo: [`../../README.th.md`](../../README.th.md)
- สารบัญเอกสาร: [`../../docs/README.th.md`](../../docs/README.th.md)
- สเปกฟีเจอร์ Admin: [`../../docs/features/admin-panel.th.md`](../../docs/features/admin-panel.th.md)
