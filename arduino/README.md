# FallHelp ESP32 - Arduino IDE

**Development Phase: Phase 1 - Core Functions (WiFi + MQTT)**

ESP32 Firmware สำหรับเชื่อมต่อ WiFi และ MQTT ผ่าน Captive Portal

## โครงสร้างไฟล์

```
arduino/
├── README.md                    ← เอกสารหลัก (Quick Start)
├── docs/                        ← เอกสารทั้งหมด
│   ├── README.md               ← Documentation Index
│   ├── SENSORS_README.md       ← Sensor Modules Documentation
│   └── FALL_DETECTION_TUNING.md ← Testing & Tuning Guide (รวมแนวทางที่ใช้)
├── fallhelp_esp32/              ← Firmware Source Code
│   ├── fallhelp_esp32.ino      ← Main Firmware (Phase 1: WiFi + MQTT)
│   │
│   └── [Phase 2-3: Sensor Modules - ยังไม่ใช้]
│       ├── MPU6050_Sensor.ino      ← Fall Detection Sensor (Phase 2-3)
│       ├── PulseSensor.ino         ← Heart Rate Monitoring (Phase 2)
│       ├── FalseAlarmCancelButton.ino ← False Alarm Cancel Button (Phase 3)
│       ├── PowerManagement.ino    ← Battery & Power Management (Phase 2)
│       ├── AlertSystem.ino         ← Speaker & Alert System (Phase 2)
│       ├── SensorManager.ino       ← Unified Sensor Interface (Phase 2-3)
│       └── FallDetectionConfig.ino ← SiSFall-based Configuration (Phase 3)
```

## Flow การใช้งาน

```
┌────────────────────────────────────────────────────────────────────────┐
│ Step 1: Upload Firmware                                               │
│   1. Upload fallhelp_esp32.ino ไปยัง ESP32                            │
│   2. เปิด Serial Monitor (115200)                                     │
│   3. ดู Serial Number เช่น "ESP32-XXXXXXXXXXXX"                       │
│   4. ESP32 จะเปิด AP Mode: "FallHelp-XXXXXX" (ไม่มีรหัสผ่าน)          │
├────────────────────────────────────────────────────────────────────────┤
│ Step 2: Admin สร้างอุปกรณ์                                             │
│   Admin Panel → Devices → Create → ใส่ Serial Number ของ ESP32        │
├────────────────────────────────────────────────────────────────────────┤
│ Step 3: ตั้งค่า WiFi ผ่าน Captive Portal                              │
│   1. เชื่อม WiFi "FallHelp-XXXXXX" (ไม่มีรหัสผ่าน)                    │
│   2. Captive Portal จะเปิดอัตโนมัติ (หรือไป 192.168.4.1)               │
│   3. กรอกชื่อ WiFi + รหัสผ่าน → กดบันทึก                              │
│   4. ESP32 ทดสอบเชื่อมต่อ (~10วินาที) → แสดงผลสำเร็จ/ล้มเหลว          │
│   5. ESP32 restart → เชื่อม WiFi → MQTT → Online!                    │
└────────────────────────────────────────────────────────────────────────┘

**Phase 2-3:** Sensor modules จะถูกเพิ่มในภายหลัง
```

## Hardware

**Phase 1 (ปัจจุบัน):**

- ESP32-DevKitC V4 เท่านั้น (ยังไม่ต้องต่อ sensors)

**Phase 2-3 (อนาคต):**
| Component | Pin | Description |
| ------------------- | ---------------- | -------------------------- |
| **MPU6050** (I2C) | SDA=21, SCL=22 | Accelerometer + Gyroscope |
| **XD-58C Pulse** | GPIO34 (Analog) | Heart Rate Sensor |
| **False Alarm Cancel Button** | GPIO4 | Large Push Button Module (ยกเลิกการแจ้งเตือน) |
| **Battery Monitor** | GPIO35 (Analog) | Battery voltage monitoring |
| **Charging Status** | GPIO32 (Digital) | TP4056 charging status |
| **Power Switch** | GPIO33 (Digital) | Slide Switch SS12D00 G4 |
| **Speaker** | GPIO25 (PWM) | Grove Speaker Module |
| **LED Indicator** | GPIO2 | Built-in LED |

## Required Libraries

**หมายเหตุ:** ตอนนี้ยังไม่ต้องติดตั้ง Libraries (Phase 1: WiFi + MQTT only)

**สำหรับ Phase 2-3 (Sensor Integration):**

- **PubSubClient** by Nick O'Leary (MQTT client)
- **ArduinoJson** by Benoit Blanchon (JSON parsing)

> Built-in: WiFi, WebServer, DNSServer, Preferences, Wire (I2C)

## Configuration

**Pre-configured:**

| Setting     | Value           |
| ----------- | --------------- |
| MQTT Server | 192.168.1.102   |
| MQTT Port   | 1883            |
| AP SSID     | FallHelp-XXXXXX |
| AP Password | ไม่มี (Open)    |

**รับจากผู้ใช้ผ่าน Captive Portal:**

- WiFi SSID
- WiFi Password

## Serial Commands

| Command | Description       |
| ------- | ----------------- |
| `reset` | ล้าง WiFi config  |
| `info`  | แสดงข้อมูลอุปกรณ์ |

## Captive Portal Endpoints

| Endpoint       | Method | Description                    |
| -------------- | ------ | ------------------------------ |
| `/`            | GET    | หน้าตั้งค่า WiFi (Mobile UI)   |
| `/wifi-config` | POST   | รับ ssid, password (Form POST) |
| `/status`      | GET    | สถานะการเชื่อมต่อ              |
| `/reset`       | POST   | ล้าง config + restart          |

## Features

- **Open AP** - ไม่ต้องใช้รหัสผ่าน เชื่อมต่อง่าย
- **Captive Portal** - เปิดหน้าตั้งค่าอัตโนมัติ
- **Connection Testing** - ทดสอบ WiFi ก่อนบันทึก
- **Mobile-style UI** - หน้าเว็บสวยงาม (Kanit font, สี FallHelp)
- **MQTT Last Will** - แจ้ง Offline อัตโนมัติเมื่อ disconnect

## Quick Start

1. เปิด Arduino IDE
2. File → Open → `fallhelp_esp32/fallhelp_esp32.ino`
3. Tools → Board → ESP32 Dev Module
4. Tools → Port → เลือก COM port
5. Upload (→)
6. เปิด Serial Monitor (115200) → ดู Serial Number
7. Admin สร้างอุปกรณ์ด้วย Serial Number
8. เชื่อม WiFi "FallHelp-XXXXXX" → ตั้งค่าผ่าน Captive Portal

## Documentation

ดูเอกสารเพิ่มเติมในโฟลเดอร์ `docs/`:

**Phase 1 (ปัจจุบัน):**

- เอกสารนี้ (README.md) - Quick Start Guide สำหรับ WiFi + MQTT

**Phase 2-3 (อนาคต):**

- [Sensors Documentation](docs/SENSORS_README.md) - Sensor Modules ครบถ้วน (Phase 2-3)
- [Fall Detection Tuning](docs/FALL_DETECTION_TUNING.md) - Testing & Tuning Guide (Phase 3)

---

**Last Updated:** December 15, 2025  
**Status:** Phase 1 - WiFi + MQTT (Sensor modules will be added in Phase 2-3)
