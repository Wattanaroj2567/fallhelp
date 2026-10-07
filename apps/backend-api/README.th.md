# FallHelp Backend

[English](README.md) · [ภาษาไทย](README.th.md)

API ของ FallHelp ที่เขียนด้วย Express v5 + TypeScript ครอบคลุมการรับข้อมูลจาก MQTT, realtime events ผ่าน Socket.io และการจัดเก็บข้อมูลใน PostgreSQL

**อัปเดตล่าสุด:** 20 มิถุนายน 2026

## ขอบเขต

- REST API สำหรับ client ฝั่ง mobile/admin
- MQTT handlers สำหรับ IoT events (`fall`, `fall_cancelled`, `heartrate`, `status`)
- การกระจายข้อมูลแบบ realtime ผ่าน Socket.io
- การเข้าถึงข้อมูลและ migrations ด้วย Prisma

## โครงสร้างซอร์สโค้ด

```text
src/
├── app.ts
├── server.ts
├── controllers/
├── services/
├── routes/
├── middlewares/
├── iot/
│   ├── mqttClient.ts
│   ├── topics.ts
│   ├── payloadValidator.ts
│   ├── eventNormalizer.ts
│   └── handlers/
│       ├── fallHandler.ts
│       ├── fallCancelledHandler.ts
│       ├── heartRateHandler.ts
│       └── statusHandler.ts
└── realtime/
    └── socketServer.ts
```

หมายเหตุ runtime: การจัดการการล้มที่ยืนยันแล้ว (confirmed fall) จะอัปเดต event ก่อน แล้วส่ง realtime alert ผ่าน Socket.io จากนั้นจึงสร้างประวัติการแจ้งเตือน (notification history) และส่ง Expo Push

## เริ่มต้นใช้งานอย่างรวดเร็ว

```bash
cd apps/backend-api
npm install
cp .env.example .env

# Update .env before running:
# DATABASE_URL, DATABASE_URL_DOCKER, JWT_SECRET, ENCRYPTION_KEY, MQTT_BROKER_URL

npm run prisma:migrate
npm run prisma:seed
npm run db:verify
npm run dev
```

URL ปริยายบนเครื่อง:

- API: `http://localhost:3000`
- Health (ภายใน): `http://localhost:3000/internal/health`

## Docker Compose

ไฟล์ [`../../docker-compose.yml`](../../docker-compose.yml) ที่ root ใช้ยก `backend`, `admin` และ `tunnel` ขึ้นพร้อมกันได้ (Mosquitto รันเป็น native service แยกต่างหาก)
โดย `npm run env:setup` จะสร้าง root `.env` เป็น symlink ไปที่ `apps/backend-api/.env`
เพื่อให้ Docker Compose อ่านค่า secret/local config ได้อัตโนมัติ

```bash
docker compose up -d --build --pull always
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

ค่าปริยาย:

- Backend: `http://localhost:3000`
- Admin: `http://localhost:5173`

หมายเหตุ runtime ปัจจุบัน:

- Docker image ของ backend รันจาก `dist/server.js` ไม่ได้รัน `tsx src/server.ts` ใน container แล้ว
- image ถูกลดขนาดโดยติดตั้งเฉพาะ production dependencies ของ backend ใน runtime stage
- ยังรองรับ `docker compose exec backend npx prisma migrate deploy` ตามเดิม
- ถ้าต้องการ Cloudflare named tunnel ให้เพิ่ม `--profile tunnel`

Admin Docker image จะรับค่า `ADMIN_VITE_API_URL` จาก Compose แล้วส่งต่อเป็น build arg `VITE_API_URL` ให้ Vite
ถ้าต้องการ override ตอน build ให้ตั้ง `ADMIN_VITE_API_URL` ก่อนรัน `docker compose up --build`

คำสั่ง cleanup ที่ใช้บ่อย:

```bash
docker builder prune -f
docker image prune -f
```

ถ้าต้องการดูขนาด image ปัจจุบัน:

```bash
docker image ls fallhelp-backend fallhelp-admin
docker system df
```

## คำสั่ง

```bash
npm run dev                  # API only (hot reload, uses external MQTT broker)
npm run dev:server           # API only (hot reload)
npm run build                # TypeScript build
npm run typecheck            # TypeScript check (no emit)
npm run lint                 # ESLint
npm run lint:fix             # ESLint autofix
npm run test:ci              # Unit tests (CI/sandbox-safe, no watchman)
npm run test -- --watchman=false
npm run db:test:setup        # Create/recreate fallhelp_test schema from current Prisma schema history
npm run test:integration     # Auto-prepare fallhelp_test, then run integration tests
npm run test:integration:raw # Run integration tests without re-preparing the test DB
npm run db:reset             # Reset DB + schema setup
npm run db:verify            # Verify PostgreSQL schema objects required by runtime
npm run prisma:studio        # Prisma Studio
```

## Environment

ใช้ `apps/backend-api/.env.example` เป็นแหล่งอ้างอิงหลัก (source of truth) กลุ่มค่าที่สำคัญ:

- Database: `DATABASE_URL`, `DATABASE_URL_DOCKER`
- Auth: `JWT_SECRET`, `JWT_EXPIRES_IN`
- Server: `PORT`, `NODE_ENV`, `LOG_LEVEL`
- MQTT: `MQTT_BROKER_URL`, `MQTT_USERNAME`, `MQTT_PASSWORD`, `MQTT_DISABLED`
- Runtime tuning: `DEVICE_ONLINE_THRESHOLD_MS`, `WIFI_CONFIGURING_STALE_MS`
- Security: `ENCRYPTION_KEY` (ต้องยาว 32 ตัวอักษรพอดี)

## ตรวจสอบก่อนเปิด PR

```bash
npm run build
npm run typecheck
npm run lint
npm run test:ci
npm run test -- --watchman=false
```

ถ้า environment สำหรับ integration พร้อมแล้ว (DB + broker):

```bash
npm run test:integration
```

`test:integration` จะ derive URL จาก `apps/backend-api/.env`, สร้างฐาน `fallhelp_test` ถ้ายังไม่มี, แล้ว recreate `public` schema ของ test DB ก่อน apply migration history ปัจจุบันทุกครั้ง
เพื่อกันปัญหา "มี test DB แต่ schema ไม่ครบ" โดยไม่แตะ dev DB หลัก

## เอกสารที่เกี่ยวข้อง

- คู่มือหลักของ repo: [`../../README.th.md`](../../README.th.md)
- ชุดเอกสาร API: [`./docs/README.th.md`](./docs/README.th.md)
- API reference: [`../../docs/api/api-reference.th.md`](../../docs/api/api-reference.th.md)
- Postman collection: [`./docs/api/postman_collection.json`](./docs/api/postman_collection.json)
- บันทึกทางเทคนิคเรื่อง MQTT: [`../../docs/architecture/iot-mqtt.th.md`](../../docs/architecture/iot-mqtt.th.md)
- สารบัญเอกสารของโปรเจกต์: [`../../docs/README.th.md`](../../docs/README.th.md)
