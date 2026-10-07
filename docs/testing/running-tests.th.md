# การรันเทสต์

[English](running-tests.md) · [ภาษาไทย](running-tests.th.md)

## ข้อมูลเอกสาร

- ผู้อ่าน: Developers, QA
- แหล่งข้อมูลอ้างอิง: [package.json](../../package.json), ไฟล์ `package.json` ของแต่ละ app, [scripts/audit/infra-scan.mjs](../../scripts/audit/infra-scan.mjs)
- สถานะ: Active
- อัปเดตล่าสุด: 7 ตุลาคม 2026

---

## Backend

```bash
cd apps/backend-api
npm test -- --watchman=false
npm run test:ci
npm run test:coverage
npm run test:integration
npm run test:all
```

| Script                         | คำอธิบาย                                |
| ------------------------------ | --------------------------------------- |
| `npm test -- --watchman=false` | Unit tests                              |
| `npm run test:ci`              | โหมด Watchman-safe (sandbox/CI)         |
| `npm run test:coverage`        | Unit tests พร้อม coverage report        |
| `npm run test:integration`     | Integration tests (ต้องมี DB รันอยู่)   |
| `npm run test:all`             | Unit + Integration                      |

## Mobile

```bash
cd apps/mobile
npm test -- --watchman=false
npm run test:light -- --watchman=false
npm run test:light -- --runInBand --watchman=false
npm run test:coverage
```

| Script                                               | คำอธิบาย                        |
| ---------------------------------------------------- | ------------------------------- |
| `npm test -- --watchman=false`                       | เทสต์ทั้งหมด                    |
| `npm run test:light -- --watchman=false`             | เฉพาะ smoke tests แบบเร็ว       |
| `npm run test:light -- --runInBand --watchman=false` | โหมด Watchman-safe (sandbox/CI) |
| `npm run test:coverage`                              | พร้อม coverage report           |

## Admin

```bash
cd apps/admin
npm test
npm run test:coverage
```

## Device Simulator

```bash
npx nx run device-simulator:test
```

Unit tests สำหรับ payload builders, จังหวะเวลาของ fall sequence, connection status และ log helpers
ส่วน MQTT payload contract (`apps/device-simulator/src/contract/fixtures.json`) ถูกตรวจฝั่ง backend
ด้วยเช่นกันโดย `apps/backend-api/src/__tests__/unit/iot/simulatorContract.test.ts`

## Infra Scan

```bash
npm run infra:scan
npm run infra:scan:strict
npm run infra:scan:strict:no-integration
```

- `infra:scan`: baseline ตรวจความสอดคล้องของ runtime + docs/env
- `infra:scan:strict`: baseline + lint/typecheck (apps/backend-api, apps/mobile, apps/admin) + backend integration tests (ต้องมี DB)
- `infra:scan:strict:no-integration`: โหมด strict แบบไม่รัน integration tests (เหมาะกับ sandbox/dev ที่ไม่มี DB)

## Sensor-Lab

`firmware/esp32/fall_detection_sensor_lab/` คือ lab module **Fall Detection Sensor Lab Basic Activity
Collection** ซึ่งไม่จำเป็นต่อการทำงานของ FallHelp runtime ที่ใช้งานจริง
แต่ใช้สำหรับทดสอบ sensor workflow และเก็บข้อมูลที่ติด label

Module นี้แยกอิสระจาก `main_firmware` (production) และ `sensor_tuning` (hardware
calibration) โดย lab รัน Node-RED ร่วมกับ FlowFuse Dashboard 2.0 เพื่อบันทึก IMU activity
CSV trials ที่ติด label จาก firmware `sensor_tuning` บน ESP32
