# กลยุทธ์ E2E สำหรับ Critical Path

[English](e2e-critical-path.md) · [ภาษาไทย](e2e-critical-path.th.md)

## ข้อมูลเอกสาร

- ผู้อ่าน: Developers, QA, reviewers
- แหล่งข้อมูลอ้างอิง: simulator scripts ปัจจุบัน, mobile app test IDs, backend MQTT/API contracts
- สถานะ: Active
- อัปเดตล่าสุด: 21 พฤษภาคม 2026

---

## ภาพรวม

FallHelp ควรรักษา E2E coverage ให้เล็กและตรงจุด เพราะ repository มี unit และ integration coverage ที่กว้างอยู่แล้ว E2E จึงควรใช้ตรวจเฉพาะ flows ที่ test ของ module เดียวไม่สามารถพิสูจน์ product behavior ได้

ใช้ E2E กับ paths ที่ข้ามขอบเขตระบบและสำคัญต่อความปลอดภัย:

- MQTT fall lifecycle -> backend persistence -> ผลข้างเคียงด้าน Socket / Push
- Mobile setup และ device provisioning
- การแสดง fall alert บน mobile และพฤติกรรมการรับทราบ (acknowledge)
- Smoke checks ของ admin login และ device management
- ESP32 simulation บน hardware จริง เมื่อต้องการความมั่นใจระดับ release

อย่าใช้ E2E เป็นค่าเริ่มต้นสำหรับ pure helpers, UI states เล็กๆ ที่เป็น UI ล้วน, service functions ที่แยกส่วน หรือการเปลี่ยนแปลงที่มีแค่เอกสาร

---

## ระดับของ E2E

| ระดับ | ขอบเขต | Tool / หลักฐาน | สถานะ |
|---|---|---|---|
| Backend pipeline E2E | MQTT -> backend handler -> ผลข้างเคียงด้าน DB / Socket / Push | `npm run iot:sim-fall` ร่วมกับสังเกตผลที่ API/mobile | พร้อมใช้ผ่าน simulator ที่มีอยู่ |
| Mobile app E2E | หน้าจอแอปจริงบน Android/iOS dev build | Maestro หรือ manual UAT โดยใช้ `testID` ที่คงที่ | วางแผนไว้ |
| Admin web E2E | Smoke ของ browser login และ device management | Playwright | วางแผนไว้ |
| Hardware E2E | ESP32 command -> firmware -> MQTT -> backend/mobile | `npm run iot:sim-fall -- --hardware` และสังเกตที่อุปกรณ์ | ตรวจสอบบน hardware ด้วยมือ |

---

## Flows สำคัญ

### 1. Fall Confirmed Alert

นี่คือ E2E path ที่มีคุณค่าสูงสุด เพราะพิสูจน์ safety pipeline ครอบคลุม MQTT, backend, realtime events, notifications และ UI ของ caregiver

```text
simulator publishes suspected_fall
  -> backend creates PENDING_CONFIRMATION event
  -> backend emits event_status_changed / FALL_SUSPECTED
  -> simulator waits cancel window
  -> simulator publishes fall_confirmed
  -> backend updates Event to CONFIRMED
  -> backend emits fall_detected + event_status_changed / FALL_CONFIRMED
  -> backend creates Notification and attempts Push
  -> mobile dashboard shows fall alert
```

คำสั่ง:

```bash
npm run iot:sim-fall -- --fast
```

หลักฐานที่คาดหวัง:

- Backend ได้รับ `suspected_fall` และ `fall_confirmed` ตามลำดับ
- Event ในฐานข้อมูลเปลี่ยนจาก pending confirmation เป็น critical/confirmed
- Socket emit `event_status_changed` ทั้งในขั้น suspected และ confirmed
- Socket emit `fall_detected` หลังยืนยันการล้มแล้วเท่านั้น
- มีการสร้าง Notification record สำหรับการล้มที่ยืนยันแล้ว
- Alert overlay/card แสดงขึ้นบนแอปของ caregiver

### 2. การยกเลิกสัญญาณเตือนผิดพลาด (False Alarm Cancellation)

การยกเลิกเป็นเรื่องสำคัญต่อความปลอดภัย เพราะมีเพียงผู้สวมใส่อุปกรณ์เท่านั้นที่ยกเลิกได้ผ่าน GPIO27 ภายในช่วงเวลา 15 วินาที

รูปแบบ E2E ที่แนะนำ:

```text
device or simulator publishes suspected_fall
  -> backend creates PENDING_CONFIRMATION event
  -> device wearer presses GPIO27 before timeout
  -> firmware publishes fall_cancelled
  -> backend updates Event to CANCELLED with cancelledAt
  -> backend emits event_status_changed / FALL_CANCELLED
  -> mobile clears or de-emphasizes the pending fall view
```

สถานะปัจจุบัน:

- Unit coverage ของ backend และ mobile ตรวจ contract ระหว่าง cancel กับ acknowledge แล้ว
- โหมด cancel ที่ขับด้วย simulator พร้อมใช้ผ่าน `npm run iot:sim-fall -- --cancel` (ใช้ร่วมกับ `--fast` ได้)
- การตรวจบน hardware ยังเป็นวิธีที่เชื่อถือได้ที่สุดในการพิสูจน์พฤติกรรมของ GPIO27

หลักฐานที่คาดหวัง:

- ไม่มี action ใดในแอปของ caregiver ที่เขียน `fallStage = CANCELLED`
- ไม่มีการสร้าง push notification ของการล้มที่ยืนยันแล้ว หลังจากยกเลิกทันเวลา
- Mobile ใช้ acknowledge/reset view เฉพาะการปิด UI ฝั่ง caregiver เท่านั้น

### 3. การจับคู่อุปกรณ์ / ตั้งค่า WiFi

Flow นี้ควรกลายเป็น mobile E2E flow เมื่อ dev build และ selectors คงที่แล้ว

รูปแบบ E2E ที่แนะนำ:

```text
fresh app state
  -> login or register
  -> open setup flow
  -> grant BLE permissions
  -> scan/select device
  -> submit WiFi credentials
  -> backend/device association appears
  -> dashboard shows device status
```

สถานะปัจจุบัน:

- Unit tests ครอบคลุม setup screens, auth context และ device actions
- BLE automation เต็มรูปแบบต้องต่อ Maestro/device-lab เพราะเทสต์ที่ใช้แค่ simulator ไม่สามารถพิสูจน์ OS permission และพฤติกรรมของ BLE ได้

งานด้าน selector ที่ต้องทำก่อน automation:

- `testID` ที่คงที่บน setup entry points
- `testID` ที่คงที่บน BLE scan state, device row, WiFi form, submit action และ success/error states
- Test fixture device หรือ simulator mode ที่มีเอกสารกำกับ

### 4. Admin Smoke

Admin E2E ควรตื้นไว้ และพิสูจน์เพียงว่า web app ที่ deploy แล้วสามารถ authenticate และอ่าน device management table ได้

รูปแบบ E2E ที่แนะนำ:

```text
open admin app
  -> login
  -> device management page loads
  -> device table or empty state renders
  -> register-device modal or QR/print action opens
```

สถานะปัจจุบัน:

- มี Jest coverage สำหรับ auth, layout, พฤติกรรมของ device page และ env validation
- ยังไม่ได้ต่อ Playwright

---

## เมื่อใดที่ต้องมี E2E

ต้องมี E2E หรือหลักฐานจาก simulator เมื่อการเปลี่ยนแปลงแตะส่วนต่อไปนี้:

- การเปลี่ยน state ใน fall lifecycle (`suspected_fall`, `fall_confirmed`, `fall_cancelled`)
- MQTT topic contracts หรือ payload validation
- ชื่อหรือ payload ของ Socket.io events
- เงื่อนไขการสร้างหรือส่ง push notification
- การแสดง fall alert บน mobile, พฤติกรรม acknowledge/reset หรือ setup flow
- Device pairing, WiFi provisioning, BLE permission flow หรือ firmware command flow
- Admin auth หรือ data-loading paths ของ device management ที่ใช้ในการ review งานปฏิบัติการ

โดยทั่วไปไม่จำเป็นต้องมี E2E สำหรับ:

- การเปลี่ยน formatting หรือข้อความล้วนๆ
- Utility functions ที่แยกส่วนและมี unit coverage ดีอยู่แล้ว
- Visual states ระดับ component ที่มีเทสต์เฉพาะจุดอยู่แล้ว
- การอัปเดตเอกสาร backlog หรือ planning เท่านั้น

---

## หลักฐานขั้นต่ำสำหรับ Release

สำหรับ release ปกติ:

```bash
npm run infra:scan
npm run --prefix apps/mobile test:light -- --watchman=false
npm run --prefix apps/admin test -- --runInBand --watchman=false
```

สำหรับการเปลี่ยนแปลงด้าน fall/device ที่สำคัญต่อความปลอดภัย ให้เพิ่ม:

```bash
npm run iot:sim-fall -- --fast
```

จากนั้นตรวจผลบน mobile/admin ด้วยมือ จนกว่าจะต่อ Maestro และ Playwright suites เสร็จ

สำหรับความมั่นใจระดับ hardware release ให้เพิ่ม:

```bash
npm run iot:sim-fall -- --hardware
```

---

## เอกสารที่เกี่ยวข้อง

- [Feature Test Checklist](./feature-test-checklist.th.md)
- [Simulator Guide](./simulator-guide.th.md)
- [Testing Glossary](./testing-glossary.th.md)
- [Fall Detection System](../features/fall-detection.th.md)
