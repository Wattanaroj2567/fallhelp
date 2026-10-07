# คู่มือ Simulator

[English](simulator-guide.md) · [ภาษาไทย](simulator-guide.th.md)

## ข้อมูลเอกสาร

- ผู้อ่าน: Developer, QA
- แหล่งอ้างอิงหลัก: `apps/backend-api/scripts/sim-*.ts`
- สถานะ: Active
- อัปเดตล่าสุด: 7 ตุลาคม 2026

---

## ภาพรวม

FallHelp มี simulator scripts สำหรับทดสอบ fall pipeline แบบ manual โดยไม่ต้องรอสัญญาณจากอุปกรณ์จริง
ทุก script อยู่ใน `apps/backend-api/scripts/` และรันผ่าน npm scripts ของ `apps/backend-api`

ถ้าต้องการปุ่มกดบนเว็บแทน CLI (เหมาะกับการนำเสนอ) ใช้ [device simulator](../../apps/device-simulator/README.th.md) ตามขั้นตอนใน [demo guide](../demo/DEMO_GUIDE.th.md)

Simulator scripts เป็น QA/development helpers สำหรับสร้างข้อมูลทดสอบ, ทดสอบ Push/Socket, และตรวจ pipeline แบบควบคุมได้ ไม่ใช่ firmware runtime และไม่แทนการทดสอบกับอุปกรณ์จริงก่อน demo หรือ release

---

## เลือก Script ไหน?

```
What do you want to test?
│
├─ Monthly Report / Event History pages (historical data across many days)
│    └─→ sim:events
│
├─ Push Notification + notification page (quick test, no waiting)
│    └─→ sim:push
│
└─ Full 2-stage pipeline with a real cancel window
     ├─ No device / don't want the device to wake up
     │    └─→ sim:fall  (default)
     └─ Device is online and you want to test real firmware
          └─→ sim:fall --hardware
```

---

## sim:events — Seed ข้อมูลย้อนหลัง

**ไฟล์:** `scripts/sim-events.ts`

สร้าง FALL events กระจายในเดือนปัจจุบัน (เวลาไทย UTC+7) สำหรับทดสอบ Monthly Report และ Event History

### ต้องการ

| สิ่งที่ต้องรัน | จำเป็น |
|---|---|
| Database (PostgreSQL) | ✅ |
| Backend server | ❌ |
| MQTT broker | ❌ |
| อุปกรณ์ ESP32 | ❌ |

### คำสั่ง

```bash
# seed 10 events (6 CRITICAL + 4 WARNING)
npm run sim:events

# clear all test data in the current month
npm run sim:events -- --clear
```

### Events ที่สร้าง

| ประเภท | Severity | จำนวน | วัตถุประสงค์ |
|---|---|---|---|
| FALL + ชีพจรสูง (>100 BPM) | CRITICAL | 3 | ทดสอบ HR badge สีแดง |
| FALL + ชีพจรปกติ (60–100) | CRITICAL | 2 | ทดสอบ HR badge สีเขียว |
| FALL + ชีพจรต่ำ (<60) | CRITICAL | 1 | ทดสอบ HR badge สีน้ำเงิน |
| FALL (suspected) | WARNING | 4 | ทดสอบ peak hour (02:xx น.) |

> **หมายเหตุ:** WARNING events จะไม่แสดงในหน้า Event History (ถูก filter ออก) แต่ใช้ทดสอบ peak hour ใน Monthly Report

---

## sim:push — Push Notification (Bypass Hardware)

**ไฟล์:** `scripts/sim-push.ts`

สร้าง FALL CRITICAL event ตรงเข้า DB แล้วยิง Push Notification ทันที ไม่ผ่าน MQTT หรือ 2-stage flow

### ต้องการ

| สิ่งที่ต้องรัน | จำเป็น |
|---|---|
| Database (PostgreSQL) | ✅ |
| Backend server | ❌ |
| MQTT broker | ❌ |
| อุปกรณ์ ESP32 | ❌ |

### คำสั่ง

```bash
# create a FALL event + send Push (random BPM 85–124)
npm run sim:push

# set the BPM yourself
npm run sim:push -- --bpm 120
```

---

## sim:fall — Full 2-Stage Pipeline

**ไฟล์:** `scripts/sim-fall.ts`

จำลอง fall pipeline แบบครบวงจรพร้อม cancel window รองรับ 2 โหมด

---

### โหมด 1: No-Hardware (default)

ส่ง MQTT events ตรงไปหา broker แทน ESP32 โดย script จำลอง 2-stage เอง

**topic ที่ใช้:** `device/{serialNumber}/event` — เป็น topic ที่ ESP32 *publish* ไม่ใช่ subscribe
ดังนั้นแม้อุปกรณ์จริงต่ออยู่และมีแบต **อุปกรณ์จะไม่ตื่นหรือทำงานใดๆ**

#### ต้องการ

| สิ่งที่ต้องรัน | จำเป็น |
|---|---|
| Database (PostgreSQL) | ✅ |
| Backend server | ✅ |
| MQTT broker | ✅ |
| อุปกรณ์ ESP32 | ❌ (ต่ออยู่ก็ไม่กระทบ) |

#### คำสั่ง

```bash
# run the pipeline with a 15s cancel window (same as real)
npm run sim:fall

# speed up — 3s cancel window (for dev)
npm run sim:fall -- --fast

# set the cancel window yourself (unit: seconds)
npm run sim:fall -- --timeout 8

# simulate pressing cancel (Cancel mode) - sends fall_cancelled instead of confirmed
npm run sim:fall -- --cancel

# specify the serialNumber yourself (skip the DB query)
npm run sim:fall -- --serial ESP32-XXXXXXXXXXXX
```

#### ลำดับการทำงาน

```
script
  │
  ├─ [1/2] publish suspected_fall ──→ broker ──→ backend fallHandler
  │                                              └─ create PENDING_CONFIRMATION event
  │                                              └─ emit event_status_changed / FALL_SUSPECTED
  │                                              └─ no caregiver alert / push
  │
  ├─ ⏱  wait for cancel window (15s / --fast 3s / --timeout N)
  │
  └─ [2/2] publish fall_confirmed ──→ broker ──→ backend fallHandler
                                                 └─ update to CRITICAL event
                                                 └─ create Notification record
                                                 └─ send Push Notification
                                                 └─ emit fall_detected + event_status_changed / FALL_CONFIRMED
                                                 
  *(if run with --cancel)*
  └─ [2/2] publish fall_cancelled ──→ broker ──→ backend fallCancelledHandler
                                                 └─ update Event to CANCELLED
                                                 └─ emit event_status_changed / FALL_CANCELLED
                                                 └─ ❌ no Push Notification sent
```

---

### โหมด 2: Hardware (`--hardware`)

ส่ง `{ cmd: "sim_fall" }` ไปยัง ESP32 แล้วให้ firmware จัดการ 2-stage pipeline เอง

**topic ที่ใช้:** `device/{serialNumber}/cmd` — ESP32 subscribe อยู่ → firmware ตื่นและทำงานจริง

#### ต้องการ

| สิ่งที่ต้องรัน | จำเป็น |
|---|---|
| Database (PostgreSQL) | ✅ |
| Backend server | ✅ |
| MQTT broker | ✅ |
| อุปกรณ์ ESP32 | ✅ (ต้อง online) |

#### คำสั่ง

```bash
npm run sim:fall -- --hardware

# specify the serial yourself
npm run sim:fall -- --hardware --serial ESP32-XXXXXXXXXXXX
```

---

## เปรียบเทียบสรุป

| | sim:events | sim:push | sim:fall | sim:fall --hardware |
|---|---|---|---|---|
| ต้องการ backend server | ❌ | ❌ | ✅ | ✅ |
| ต้องการ MQTT broker | ❌ | ❌ | ✅ | ✅ |
| ต้องการ ESP32 online | ❌ | ❌ | ❌ | ✅ |
| อุปกรณ์ต่ออยู่จะตื่นไหม | ❌ | ❌ | ❌ | ✅ |
| ผ่าน fallHandler จริง | ❌ | ❌ | ✅ | ✅ |
| Socket lifecycle emit ทำงาน | ❌ | ❌ | ✅ | ✅ |
| Push Notification | ❌ | ✅ | ✅ | ✅ |
| มี cancel window จริง | ❌ | ❌ | ✅ | ✅ |
| เหมาะกับ | Monthly Report / History | Push / Notification UI | Pipeline + Socket + Push | End-to-end จริง |

---

## รัน script จาก root (ทางเลือก)

```bash
# only sim:fall is exposed at the root
npm run iot:sim-fall               # = sim:fall (no-hardware)
npm run iot:sim-fall -- --hardware # = sim:fall --hardware
```

---

## เอกสารที่เกี่ยวข้อง

- [Testing Glossary](./testing-glossary.th.md)
- [Feature Test Checklist](./feature-test-checklist.th.md)
- [E2E Critical Path Strategy](./e2e-critical-path.th.md)
- Script source: `apps/backend-api/scripts/sim-*.ts`
