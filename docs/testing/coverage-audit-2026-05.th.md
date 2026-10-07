# รายงานตรวจสอบ Coverage ของระบบ

[English](coverage-audit-2026-05.md) · [ภาษาไทย](coverage-audit-2026-05.th.md)

> **วันที่:** พฤษภาคม 2026
> **ขอบเขต:** Backend, Mobile และ Admin Applications
> **วัตถุประสงค์:** หาช่องว่างระหว่าง implementation (src) กับ test coverage (**tests**) ในทั้ง 3 modules

---

## 1. สรุปผลการรันเทสต์

รันเทสต์ที่มีอยู่ทั้งหมดทั่วทั้ง workspace:

| Module | สถานะ | Unit Tests | Integration Tests | หมายเหตุ |
|---|---|---|---|---|
| **Backend** | ✅ PASS | 47 Suites, 824 Tests | N/A | เทสต์ผ่าน แต่มี async handlers บางตัวรั่ว (ต้อง force exit) |
| **Mobile** | ✅ PASS | 40 Suites, 205 Tests | N/A | ผ่านเรียบร้อย |
| **Admin** | ✅ PASS | 4 Suites, 10 Tests | N/A | ผ่านเรียบร้อย |

---

## 2. วิเคราะห์ Code เทียบกับ Test (ช่องว่างของ Coverage)

เราเทียบไฟล์ implementation จริงกับไฟล์เทสต์ เพื่อหาส่วนที่ยังไม่มี test coverage

### 🟢 Backend API

Backend มีเทสต์ค่อนข้างครบ (Services และ Controllers มีไฟล์เทสต์ครอบคลุม 100%) แต่ยังมี utility functions บางตัวที่ขาดเทสต์:

**เทสต์ที่ยังขาด:**

* ~~`utils/deviceSemantics.ts` - แปลง `Device.status` เป็น `pairingStatus` และคำนวณ `onlineStatus`~~ (✅ เพิ่มแล้ว)
* ~~`utils/deviceSerial.ts` - ตรวจสอบและ normalize รูปแบบ serial `ESP32-`~~ (✅ เพิ่มแล้ว)

### 🔵 Mobile App

Mobile app มี coverage ที่ดีสำหรับ services และ stores แต่ยังขาดเทสต์ของ hooks ที่เกี่ยวกับ hardware และ UI utilities หลายตัว

**Service Tests ที่ยังขาด:**

* `services/bleService.ts`
* `services/wifiScannerService.ts`
* `services/index.ts` (Export aggregator)

**Hooks Tests ที่ยังขาด:**

* `hooks/useProtectedRoute.ts` - navigation guard ที่สำคัญ
* `hooks/useRouterGuard.ts` - patch router สำหรับ cold starts
* `hooks/useCurrentElder.ts`
* `hooks/useNavBarInset.ts`
* `hooks/useNavigationBar.ts`
* `hooks/usePushNotifications.ts`
* `hooks/useUnsavedChanges.ts`

**Utils Tests ที่ยังขาด:**

* `utils/blePermissions.ts`
* `utils/dialogService.ts`
* ~~`utils/errorHelper.ts` - แปลง API errors เป็นข้อความ error ภาษาไทย~~ (✅ เพิ่มแล้ว)
* ~~`utils/heartRate.ts` - เกณฑ์ HR (`HR_HIGH_THRESHOLD`, `HR_LOW_THRESHOLD`)~~ (✅ เพิ่มแล้ว)
* `utils/keyboard.ts`
* `utils/logger.ts`
* ~~`utils/modalGuard.ts` - ป้องกันการเปิด modal ซ้อนกันหลายตัว~~ (✅ เพิ่มแล้ว)
* `utils/passwordPolicy.ts`
* `utils/setupStorage.ts`
* `utils/toast.ts`

### 🟣 Admin Device Management

ตอนนี้ admin app เน้นงานจัดการอุปกรณ์ มีเทสต์สำหรับหน้า device, หน้า login, admin layout และ env validation แล้ว แต่ยังไม่มี coverage โดยตรงสำหรับ custom device hook

**เทสต์ที่ยังขาด:**

* `hooks/useAdminDevices.ts`

---

## 3. ข้อเสนอแนะ

อ้างอิงจาก skill `testing-expert` ต่อไปนี้คือลำดับความสำคัญของเทสต์ที่ควรเขียนต่อ เพื่อให้ business logic แข็งแรง:

1. **Mobile Router Guards:** เทสต์ `useProtectedRoute` และ `useRouterGuard` เพราะควบคุมการเข้าถึงฟีเจอร์ของแอปและจัดการ routing race conditions
2. **Mobile Error & Display Helpers:** เทสต์ `errorHelper.ts`, `heartRate.ts` และ `modalGuard.ts` เพื่อให้ผู้ใช้เห็น label ภาษาไทยและ UI states ที่ถูกต้อง
3. **Backend Serial & Status:** เทสต์ `deviceSerial.ts` และ `deviceSemantics.ts` เพื่อให้ hardware edge cases ถูกตรวจสอบอย่างถูกต้อง
4. **Admin Device Hook:** เทสต์ `useAdminDevices.ts` เพื่อยืนยัน API mapping, polling, mutation invalidation และ loading/error states
