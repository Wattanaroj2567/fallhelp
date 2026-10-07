# Feature Test Checklist — FallHelp

[English](feature-test-checklist.md) · [ภาษาไทย](feature-test-checklist.th.md)

## ข้อมูลเอกสาร

- ผู้อ่าน: Dev / QA / Reviewer
- แหล่งอ้างอิงหลัก: test files ใน `apps/backend-api/src/__tests__`, `apps/mobile/__tests__`, `apps/admin/src/__tests__`
- สถานะ: Active
- อัปเดตล่าสุด: 8 มิถุนายน 2026

---

## 1. ภาพรวมผลการตรวจสอบ

ตัวเลขด้านล่างวัดจากโค้ดจริง ณ วันที่อัปเดตเอกสารนี้ ไม่ใช่ตัวเลขจากแผนเดิม

| Module  | Test files | Test declarations | คำสั่งที่รันล่าสุด                                                                  | ผลลัพธ์                                                  |
| ------- | ---------- | ----------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Backend | 56         | 897               | `npm run --prefix apps/backend-api test:ci && npm run --prefix apps/backend-api test:integration` | PASS: 56 suites / 897 tests passed                      |
| Mobile  | 43         | 224               | `npm run --prefix apps/mobile test -- --watchman=false --runInBand`               | PASS: 43 suites / 224 tests                             |
| Admin   | 4          | 10                | `npm run --prefix apps/admin test -- --runInBand --watchman=false`                | PASS: 4 suites / 10 tests                               |

หมายเหตุ:

- Backend coverage script ต้องรันใน shell ที่อนุญาตให้ `supertest` bind local server ได้; sandbox ปกติจะติด `listen EPERM 0.0.0.0`
- Backend test declaration count รวม integration tests ด้วยและนับเฉพาะ `it(`/`test(` calls จริง ไม่รวม method call เช่น `.test(...)`; coverage command ด้านบนเป็น Jest unit/config/route/service coverage ตาม `jest.config.cjs`
- Mobile full test ผ่านครบ แต่ Jest ยังมี open-handle warning หลังจบชุดทดสอบ ถ้าจะ cleanup test runtime ให้รันเพิ่มด้วย `--detectOpenHandles`
- Admin test default ติด Watchman ใน sandbox ต้องเพิ่ม `--watchman=false`

---

## 2. ตาราง Feature Coverage

สัญลักษณ์:

- ✅ มี automated test ตรงกับโค้ดจริง
- ◐ มี test บางส่วนหรือ indirect coverage
- ⬜ มี test แต่ต้องรันใน environment ที่มี DB/local bind พร้อม
- — ไม่เกี่ยวข้องกับ module นั้น
- ❌ ยังไม่พบ automated test เฉพาะจุด

| Feature / Runtime Flow                  | Backend Unit | Backend Integration | Mobile | Admin | หมายเหตุ                                                                                     |
| --------------------------------------- | :----------: | :-----------------: | :----: | :---: | -------------------------------------------------------------------------------------------- |
| Authentication: register/login/logout   |      ✅      |         ✅          |   ✅   |  ✅   | Backend auth controller/service + mobile auth routes + admin login                           |
| OTP forgot/reset password               |      ✅      |         ✅          |   ✅   |   —   | Mobile รวมใน `password-reset.test.tsx`                                                  |
| User profile / password / push token    |      ✅      |         ✅          |   ✅   |   —   | Mobile profile tests ครอบคลุม UI ของ account/edit/password/email/phone                              |
| Elder profile CRUD                      |      ✅      |         ✅          |   ✅   |   —   | Admin ไม่มีขอบเขตการจัดการผู้สูงอายุหรือ dashboard summary แล้ว                              |
| Device lookup and pairing               |      ✅      |         ✅          |   ✅   |  ✅   | Mobile ครอบคลุม pairing route/action; admin ครอบคลุม device create/list/delete                   |
| Device unpair / RESET_WIFI side effect  |      ✅      |         ✅          |   ◐    |  ✅   | Backend service/admin tests ครอบคลุม MQTT reset path                                            |
| WiFi config via backend/MQTT            |      ✅      |         ✅          |   ◐    |   —   | Mobile ครอบคลุม BLE/setup และ device actions; backend ครอบคลุม config ACK/timeout                |
| BLE WiFi provisioning                   |      —       |          —          |   ✅   |   —   | ครอบคลุมผ่าน mock ของ setup/device action ไม่ใช่ native BLE hardware จริง                           |
| Device online/offline status            |      ✅      |          ◐          |   ✅   |   ◐   | Backend status handler + mobile dashboard/store; admin แสดง state ที่คำนวณต่อจากข้อมูลนี้                |
| Fall suspected lifecycle                |      ✅      |          ◐          |   ✅   |   —   | Backend emit `event_status_changed/FALL_SUSPECTED`; mobile pending guard ครอบคลุมทางอ้อม |
| Fall confirmed alert                    |      ✅      |         ✅          |   ✅   |   —   | Backend DB/socket/push path + mobile dashboard/fall alert state                              |
| Fall cancelled by GPIO27                |      ✅      |          ◐          |   ✅   |   —   | Backend cancellation handler + พฤติกรรม lifecycle ภายในของ mobile                            |
| Heart rate realtime update              |      ✅      |          ◐          |   ✅   |   —   | Heart rate เป็น realtime state; DB เก็บเฉพาะ snapshot `Event.bpm` ณ เวลาที่ล้ม                  |
| Event history                           |      ✅      |         ✅          |   ✅   |   —   | Backend event controller/service + mobile history                                            |
| Monthly summary report                  |      ✅      |         ✅          |   ✅   |   —   | Mobile report รวมอยู่ใน notification/report route test                                 |
| Emergency contacts CRUD/reorder         |      ✅      |         ✅          |   ✅   |   —   | Backend service/controller/integration + mobile emergency route test                         |
| Notifications and unread count          |      ✅      |         ✅          |   ✅   |   —   | Backend บังคับ relation `eventId` + mobile notification route/service                      |
| Push notification send helper           |      ✅      |          —          |   ◐    |   —   | Backend push utility มี test; mobile push registration ทดสอบระดับ service                       |
| Socket.io auth/rooms/events             |      ✅      |          —          |   ✅   |   —   | Backend realtime/iot socket tests + mobile socket-driven stores/routes                       |
| Admin device management                 |      ✅      |          —          |   —    |  ✅   | Admin `Devices.tsx` + backend admin service/controller                                       |
| Internal health check                   |      ✅      |         ✅          |   —    |   —   | `/internal/health` controller + integration                                                  |
| Route mounting / 404 / middleware chain |      ✅      |          —          |   —    |   —   | `app.test.ts`, `routes.test.ts`, middleware tests                                            |
| Firmware ESP32 runtime                  |      —       |          —          |   —    |   —   | ยังไม่มี automated firmware tests ใน repo; ตรวจด้วย hardware/sensor-lab workflow              |

---

## 3. รายการ Backend Tests

### จำนวนปัจจุบัน

| Group                        | Files  | Test declarations |
| ---------------------------- | ------ | ----------------- |
| Unit root / app / scheduler  | 2      | 12                |
| Config                       | 2      | 70                |
| Controllers                  | 8      | 83                |
| Internal controllers         | 1      | 11                |
| IoT / MQTT / socket handlers | 8      | 158               |
| Middlewares                  | 4      | 96                |
| Realtime                     | 1      | 32                |
| Routes                       | 1      | 16                |
| Services                     | 9      | 153               |
| Utils                        | 11     | 193               |
| Integration API              | 9      | 73                |
| **Total**                    | **56** | **897**           |

### ผลจาก Coverage Script

อัปเดตล่าสุด: 10 พฤษภาคม 2026 — วัดจาก `npm run --prefix apps/backend-api test:coverage -- --runInBand --watchman=false`

| Metric     | Coverage |
| ---------- | -------- |
| Statements | 97.49%   |
| Branches   | 91.23%   |
| Functions  | 96.96%   |
| Lines      | 97.72%   |

ผล Jest: 47 suites passed / 824 tests passed. ตัวเลขนี้เป็น unit/config/route/service coverage จาก `jest.config.cjs`; integration API tests อยู่ใน `jest.integration.config.cjs` และนับใน inventory แยกต่างหาก

### คำสั่ง

```bash
cd apps/backend-api
npm run test:ci
npm run test:coverage -- --runInBand --watchman=false
npm run test:integration
```

หมายเหตุเรื่อง sandbox: `npm run test:ci` และ `npm run test:coverage` อาจ fail ใน sandbox ที่ถูกจำกัดสิทธิ์ที่ `app.test.ts` เพราะ `supertest` bind `0.0.0.0` ไม่ได้ (`listen EPERM`) ให้รันใน local shell ปกติก่อน release

### Unit: App / Config / Routes

| Test file                    | Declarations | Covers                                                                          |
| ---------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `unit/app.test.ts`           | 6            | Express app setup, CORS/rate limit mounting, route registration, 404/error flow |
| `unit/routes/routes.test.ts` | 16           | API router base paths and mounted route modules                                 |
| `unit/otpScheduler.test.ts`  | 6            | OTP cleanup scheduler startup, interval behavior, cleanup                       |
| `unit/config/env.test.ts`    | 56           | Env parsing/defaults/required keys, origin list, log level, runtime thresholds  |
| `unit/config/origin.test.ts` | 14           | Shared Express/Socket CORS origin policy                                        |

### Unit: Controllers

| Test file                                             | Declarations | Covers                                                       |
| ----------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| `unit/controllers/authController.test.ts`             | 13           | register, login, OTP request/verify, reset password, logout  |
| `unit/controllers/userController.test.ts`             | 8            | current profile, profile update, password update, push token |
| `unit/controllers/elderController.test.ts`            | 8            | create/list/detail/update elder flow                         |
| `unit/controllers/deviceController.test.ts`           | 10           | device lookup, pair/unpair, WiFi config GET/PUT              |
| `unit/controllers/emergencyContactController.test.ts` | 10           | contact CRUD, priority reorder                               |
| `unit/controllers/eventController.test.ts`            | 9            | event list/detail/monthly summary                            |
| `unit/controllers/notificationController.test.ts`     | 15           | list, unread count, mark one read, mark all read validation  |
| `unit/controllers/adminController.test.ts`            | 6            | admin device create/list/delete/unpair actions               |
| `unit/internal/healthController.test.ts`              | 11           | DB/MQTT health response and failure modes                    |

### Unit: Services

| Test file                                       | Declarations | Covers                                                                         |
| ----------------------------------------------- | ------------ | ------------------------------------------------------------------------------ |
| `unit/services/authService.test.ts`             | 25           | register/login, password hashing, OTP lifecycle, reset password                |
| `unit/services/userService.test.ts`             | 16           | profile lookup/update, password update, push token update                      |
| `unit/services/elderService.test.ts`            | 18           | elder CRUD, owner checks, address/date fields, integer/date normalization      |
| `unit/services/deviceService.test.ts`           | 22           | pair/unpair, retained RESET_WIFI, WiFi config ACK/timeout, online semantics    |
| `unit/services/deviceConfig.test.ts`            | 3            | WiFi config status helper behavior                                             |
| `unit/services/emergencyContactService.test.ts` | 15           | CRUD, priority uniqueness, reorder transaction                                 |
| `unit/services/eventService.test.ts`            | 16           | create/list/detail events, fall cancellation guard, monthly summary            |
| `unit/services/notificationService.test.ts`     | 14           | notification creation, unread count, mark read/all read, push helper           |
| `unit/services/adminService.test.ts`            | 13           | admin device list/create/delete/unpair and best-effort reset |

### Unit: IoT / MQTT / Realtime

| Test file                               | Declarations | Covers                                                                               |
| --------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| `unit/iot/fallHandler.test.ts`          | 18           | suspected/confirmed flow, dedup, BPM snapshot, Socket/notification side effects      |
| `unit/iot/fallCancelledHandler.test.ts` | 5            | GPIO27 device-only cancellation path                                                 |
| `unit/iot/heartRateHandler.test.ts`     | 8            | realtime HR update, abnormal cooldown, latest-HR cache behavior                      |
| `unit/iot/statusHandler.test.ts`        | 14           | heartbeat/LWT, `lastOnline`, `wifiStatus`, ghost-device RESET_WIFI                   |
| `unit/iot/payloadValidator.test.ts`     | 12           | MQTT payload validation for fall/HR/status/config ACK                                |
| `unit/iot/mqttClient.test.ts`           | 62           | connect/subscribe/publish, ACK waiter, retained reset, topic routing, guard behavior |
| `unit/iot/mqttGuard.test.ts`            | 7            | UNPAIRED device rejection and RESET_WIFI guard                                       |
| `unit/iot/socketServer.test.ts`         | 32           | Socket auth, room join, emitted events, session replacement                          |
| `unit/realtime/socketServer.test.ts`    | 32           | Realtime server behavior from socket module boundary                                 |

### Unit: Middleware / Utils

| Test file                               | Declarations | Covers                                              |
| --------------------------------------- | ------------ | --------------------------------------------------- |
| `unit/middlewares/auth.test.ts`         | 9            | JWT auth, admin guard, unauthorized/forbidden paths |
| `unit/middlewares/errorHandler.test.ts` | 13           | ApiError mapping, 404, generic error safety         |
| `unit/middlewares/rateLimit.test.ts`    | 5            | rate limiter configuration                          |
| `unit/middlewares/validation.test.ts`   | 69           | auth/user/elder/device/contact validation rules     |
| `unit/utils/ApiError.test.ts`           | 50           | error factories, status codes, localized messages   |
| `unit/utils/configValidator.test.ts`    | 22           | startup env validation                              |
| `unit/utils/deviceConnectivity.test.ts` | 14           | `lastOnline` freshness and online/offline helper    |
| `unit/utils/email.test.ts`              | 8            | OTP email sending and disabled/failure paths        |
| `unit/utils/fileCleanup.test.ts`        | 13           | safe filename extraction and cleanup guard          |
| `unit/utils/jwt.test.ts`                | 13           | token generation/verification/failure               |
| `unit/utils/logger.test.ts"             | 13           | logger formatting and audit helper                  |
| `unit/utils/param.test.ts`              | 7            | route parameter extraction                          |
| `unit/utils/password.test.ts`           | 18           | hash/compare/OTP/password strength                  |
| `unit/utils/pushNotification.test.ts`   | 10           | Expo Push request/failure handling                  |
| `unit/utils/time.test.ts`               | 25           | date range/month boundary helper                    |

### Integration API

| Test file                                                | Declarations | Covers                                            |
| -------------------------------------------------------- | ------------ | ------------------------------------------------- |
| `integration/api/auth.integration.test.ts`               | 16           | register/login/me/logout/OTP reset API flow       |
| `integration/api/users.integration.test.ts`              | 10           | `/users/me`, password, push token, related elders |
| `integration/api/elders.integration.test.ts`             | 10           | elder create/list/detail/update                   |
| `integration/api/device-pairings.integration.test.ts`    | 6            | pair/unpair API boundary                          |
| `integration/api/devices.integration.test.ts`            | 5            | device lookup and WiFi config API                 |
| `integration/api/emergency-contacts.integration.test.ts` | 11           | nested emergency contact CRUD/reorder             |
| `integration/api/events.integration.test.ts`             | 2            | event list/monthly summary API                    |
| `integration/api/notifications.integration.test.ts`      | 11           | notification list/unread/mark read/all read       |
| `integration/api/health.integration.test.ts`             | 2            | internal health endpoint                          |

---

## 4. รายการ Mobile Tests

### จำนวนปัจจุบัน

| Group      | Files  | Test declarations |
| ---------- | ------ | ----------------- |
| App routes | 17     | 58                |
| Contexts   | 2      | 14                |
| Hooks      | 2      | 19                |
| Services   | 9      | 61                |
| Stores     | 3      | 25                |
| Utils      | 10     | 47                |
| **Total**  | **43** | **224**           |

### คำสั่ง

```bash
cd apps/mobile
npm run test:light -- --watchman=false
npm test -- --watchman=false --runInBand
npm run typecheck
npm run lint
```

### App Routes

| Test file                                     | Declarations | Source screens covered                                        |
| --------------------------------------------- | ------------ | ------------------------------------------------------------- |
| `app/(auth)/login.test.tsx`                   | 1            | `app/(auth)/login.tsx`                                        |
| `app/(auth)/register.test.tsx`                | 1            | `app/(auth)/register.tsx`                                     |
| `app/(auth)/password-reset.test.tsx`          | 7            | `forgot-password`, `verify-otp`, `reset-password`, `success`  |
| `app/(setup)/welcome.test.tsx`                | 2            | `app/(setup)/empty-state.tsx`                                 |
| `app/(setup)/step1-elder-info.test.tsx`       | 1            | elder setup form                                              |
| `app/(setup)/step2-device-pairing.test.tsx`   | 1            | QR/manual device pairing step                                 |
| `app/(setup)/step3-wifi-setup.test.tsx`       | 2            | BLE WiFi setup step                                           |
| `app/(setup)/saved-success.test.tsx`          | 1            | setup completion route                                        |
| `app/(tabs)/dashboard.test.tsx`               | 13           | dashboard realtime cards, fall alert state, emergency actions |
| `app/(tabs)/history.test.tsx`                 | 3            | event history filter/list behavior                            |
| `app/(features)/device-actions.test.tsx`      | 5            | device pairing, smart WiFi setup/reconfig path                |
| `app/(features)/device-info.test.tsx`         | 1            | current device detail screen                                  |
| `app/(features)/elder.test.tsx`               | 2            | elder info and edit routes                                    |
| `app/(features)/emergency.test.tsx`           | 4            | contacts/add/edit/call routes                                 |
| `app/(features)/notification-report.test.tsx` | 2            | notifications and report summary routes                       |
| `app/(features)/profile.test.tsx`             | 10           | account/edit info/email/password/phone routes                 |
| `app/root.test.tsx`                           | 2            | modal and not-found routes                                    |

### State / Hooks / Services

| Test file                                  | Declarations | Covers                                         |
| ------------------------------------------ | ------------ | ---------------------------------------------- |
| `contexts/AuthContext.test.tsx`            | 8            | token bootstrap, sign in/out, runtime cleanup  |
| `contexts/DialogContext.test.tsx`          | 6            | global dialog behavior                         |
| `hooks/useHomeDisplayState.test.ts`        | 9            | dashboard display derivation                   |
| `hooks/useProtectedRoute.cache.test.ts`    | 10           | boot cache route decisions and setup recovery  |
| `stores/useDeviceSetupStore.test.ts`       | 5            | elder/device setup runtime state               |
| `stores/useFallAlertStore.test.ts`         | 9            | fall alert state and acknowledge behavior      |
| `stores/useSensorStore.test.ts`            | 11           | online/HR/socket telemetry state               |
| `services/api.test.ts`                     | 8            | axios client behavior and auth error handling  |
| `services/authService.test.ts`             | 10           | login/register/OTP/reset/logout service calls  |
| `services/deviceService.test.ts`           | 6            | device lookup/pairing/WiFi config calls        |
| `services/elderService.test.ts"            | 6            | elder CRUD service calls                       |
| `services/emergencyContactService.test.ts` | 6            | contact CRUD/reorder service calls             |
| `services/eventService.test.ts`            | 6            | event list/detail/monthly summary calls        |
| `services/notificationService.test.ts`     | 10           | notification list/read/unread/push token calls |
| `services/tokenStorage.test.ts`            | 4            | token persistence helpers                      |
| `services/userService.test.ts`             | 5            | profile/password/push token service calls      |

### Utils

| Test file                             | Declarations | Covers                                        |
| ------------------------------------- | ------------ | --------------------------------------------- |
| `utils/date.test.ts`                  | 2            | date formatting helpers                       |
| `utils/deviceConnectivity.test.ts`    | 6            | device online/offline helper                  |
| `utils/emergencyRelationship.test.ts` | 4            | emergency relationship labels/options         |
| `utils/safeRouter.test.ts`            | 5            | duplicate navigation guard and retry behavior |
| `utils/testId.test.ts`                | 2            | test id helper                                |
| `utils/thailandAddress.test.ts`       | 5            | Thai address lookup/normalization             |
| `utils/errorHelper.test.ts`           | 10           | API error message mapping                     |
| `utils/modalGuard.test.ts`            | 6            | modal navigation protection                   |
| `utils/heartRate.test.ts`             | 5            | HR formatting and confidence labels           |
| `utils/deviceSerial.test.ts`          | 2            | Serial number normalization                   |

---

## 5. รายการ Admin Tests

### จำนวนปัจจุบัน

| Group     | Files | Test declarations |
| --------- | ----- | ----------------- |
| Layouts   | 1     | 1                 |
| Pages     | 2     | 6                 |
| Utils     | 1     | 3                 |
| **Total** | **4** | **10**            |

### คำสั่ง

```bash
cd apps/admin
npm test -- --runInBand --watchman=false
npm run typecheck
npm run lint
```

### ไฟล์

| Test file                       | Declarations | Source covered                               |
| ------------------------------- | ------------ | -------------------------------------------- |
| `layouts/AdminLayout.test.tsx`  | 1            | `layouts/AdminLayout.tsx` device overview shell |
| `pages/Login.test.tsx`          | 3            | `pages/Login.tsx` admin login and role guard |
| `pages/Devices.test.tsx`        | 4            | `pages/Devices.tsx` list/register/print flows |
| `utils/configValidator.test.ts` | 3            | admin env config validation                  |

ปัจจุบัน admin app มี page source เพียงสองไฟล์: `Devices.tsx` และ `Login.tsx`

---

## 6. ช่องว่างที่ทราบแล้ว

| ช่องว่าง                                                  | Module          | สาเหตุปัจจุบัน / ขั้นตอนถัดไป                                                                                                                             |
| --------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend tests รันไม่จบใน sandbox ที่ถูกจำกัดสิทธิ์       | Backend         | sandbox บล็อก local bind ของ `supertest`; ให้รัน `npm run test:ci` หรือ `npm run test:coverage -- --runInBand --watchman=false` ใหม่ใน local shell ปกติ |
| Backend integration tests ต้องใช้ DB                      | Backend         | ต้องมี PostgreSQL + ค่า integration ใน `.env` ก่อนรัน `npm run test:integration`                                                                        |
| Mobile Jest มี open handle หลังรันครบชุด                    | Mobile          | Tests ผ่าน แต่ยังมี open async handle ค้างอยู่; ใช้ `--detectOpenHandles` เมื่อ cleanup test runtime                                                        |
| พฤติกรรมของ native BLE hardware                              | Mobile/Firmware | Mobile mock BLE service ไว้; provisioning จริงยังต้องตรวจกับอุปกรณ์/hardware                                                                     |
| Firmware unit tests                                       | Firmware        | ยังไม่มี automated firmware unit test harness ใน repo                                                                                                        |
| Full UI automation ด้วย Maestro/Playwright                | Cross-stack     | E2E baseline กำหนดไว้ใน [e2e-critical-path.th.md](./e2e-critical-path.th.md) แต่ยังไม่ได้ต่อ mobile/admin UI automation                             |
| หน้า admin summary/user/elder เฉพาะที่เลิกใช้แล้ว          | Admin           | ไม่มี source pages แล้ว; ปัจจุบัน admin ครอบคลุมเฉพาะการจัดการอุปกรณ์                                                                                |
| Health data export / account deletion / multi-user access | Product backlog | มีเพียงเอกสารแผน ยังไม่มี runtime implementation หรือ tests                                                                                                  |

---

## 7. Checklist ตรวจสอบก่อน Release

ใช้ checklist นี้ก่อน push เข้า `main` หรือปิด milestone ที่แตะ logic:

- [x] แก้ Backend: รัน `npm run --prefix apps/backend-api test:ci` ใน local shell ปกติ
- [x] แก้ Backend API/DB: รัน `npm run --prefix apps/backend-api test:integration`
- [x] แก้ Mobile: รัน `npm run --prefix apps/mobile test:light -- --watchman=false`
- [x] แก้ Mobile route/store/service: รัน `npm run --prefix apps/mobile test -- --watchman=false --runInBand`
- [x] แก้ Mobile TypeScript: รัน `npm run --prefix apps/mobile typecheck`
- [x] Mobile มีการแก้ที่กระทบ lint: รัน `npm run --prefix apps/mobile lint`
- [x] แก้ Admin: รัน `npm run --prefix apps/admin test -- --runInBand --watchman=false`
- [x] แก้ Admin TypeScript: รัน `npm run --prefix apps/admin typecheck`
- [ ] แก้ Fall/pairing critical path: รัน `npm run iot:sim-fall -- --fast` แล้วตรวจผลที่ mobile/admin
- [x] แก้ Docs/config/runtime: รัน `npm run infra:scan`
- [x] แก้ AI docs/instructions: รัน `npm run audit:instructions`
