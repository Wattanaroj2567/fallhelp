# FallHelp ESP32 - Arduino IDE

## 📁 โครงสร้างไฟล์

```
arduino/
├── README.md
└── fallhelp_esp32/
    └── fallhelp_esp32.ino  ← Firmware หลัก (AP Mode + WiFi Config)
```

## 🔄 Flow การใช้งาน

```
┌────────────────────────────────────────────────────────────────────────┐
│ Step 1: Upload Firmware                                               │
│   1. Upload fallhelp_esp32.ino ไปยัง ESP32                            │
│   2. เปิด Serial Monitor (115200)                                     │
│   3. ดู Serial Number เช่น "ESP32-XXXXXXXXXXXX"                       │
│   4. ESP32 จะเปิด AP Mode: "FallHelp-XXXXXX"                          │
├────────────────────────────────────────────────────────────────────────┤
│ Step 2: Admin สร้างอุปกรณ์                                             │
│   Admin Panel → Devices → Create → ใส่ Serial Number ของ ESP32        │
├────────────────────────────────────────────────────────────────────────┤
│ Step 3: ตั้งค่า WiFi ผ่าน Mobile App                                   │
│   1. Mobile เชื่อม WiFi ของ ESP32 (pass: fallhelp123)                 │
│   2. Mobile ส่ง HTTP POST ไป http://192.168.4.1/wifi-config           │
│      Body: { "ssid": "WiFi", "password": "xxx", "mqtt": "192.168.1.x" }│
│   3. ESP32 restart → เชื่อม WiFi บ้าน → MQTT                          │
│      → ส่งสถานะ ONLINE → Backend ส่ง Push Notification "Device Online" │
├────────────────────────────────────────────────────────────────────────┤
│ Step 4: ทดสอบ Sensor Events (จำลอง)                                    │
│   พิมพ์ใน Serial Monitor: fall, hr low/normal/high, status            │
└────────────────────────────────────────────────────────────────────────┘
```

## 🔌 Hardware

| Component         | Pin             | Description               |
| ----------------- | --------------- | ------------------------- |
| **MPU6050** (I2C) | SDA=21, SCL=22  | Accelerometer + Gyroscope |
| **XD-58C Pulse**  | GPIO34 (Analog) | Heart Rate Sensor         |
| **SOS Button**    | GPIO0           | BOOT button (optional)    |

## 📚 Required Libraries

ติดตั้งผ่าน Arduino IDE → Sketch → Include Library → Manage Libraries:

1. **PubSubClient** by Nick O'Leary
2. **ArduinoJson** by Benoit Blanchon

> Built-in: WiFi, WebServer, Preferences, Wire

## ⚙️ Configuration

**ไม่มี hardcode config!** ทุกอย่างรับจาก Mobile App ตอนตั้งค่า:

- Serial Number → สร้างอัตโนมัติจาก ESP32 Chip ID
- WiFi SSID/Password → รับจาก Mobile App
- MQTT Server IP → รับจาก Mobile App

## 🎮 Serial Commands

| Command     | Description       |
| ----------- | ----------------- |
| `fall`      | จำลองการล้ม       |
| `hr low`    | จำลอง HR ต่ำ      |
| `hr normal` | จำลอง HR ปกติ     |
| `hr high`   | จำลอง HR สูง      |
| `status`    | ส่งสถานะอุปกรณ์   |
| `reset`     | ล้าง config       |
| `info`      | แสดงข้อมูลอุปกรณ์ |

## 📡 AP Mode WiFi Config API

| Endpoint       | Method | Body                                             |
| -------------- | ------ | ------------------------------------------------ |
| `/wifi-config` | POST   | `{"ssid":"...", "password":"...", "mqtt":"..."}` |
| `/status`      | GET    | -                                                |
| `/reset`       | POST   | -                                                |

**POST /wifi-config Body:**

```json
{
  "ssid": "Home_WiFi",
  "password": "wifi_password",
  "mqtt": "192.168.1.100"
}
```

## 🚀 Quick Start

1. เปิด Arduino IDE
2. File → Open → `fallhelp_esp32.ino`
3. Tools → Board → ESP32 Dev Module
4. Tools → Port → เลือก COM port
5. Upload (→)
6. เปิด Serial Monitor (115200) → ดู Serial Number
7. Admin สร้างอุปกรณ์ด้วย Serial Number
8. Mobile App ตั้งค่า WiFi + MQTT Server
9. พิมพ์ `fall` หรือ `hr normal` เพื่อทดสอบ (จะมีการแจ้งเตือนไปที่ Mobile App)

---

**Last Updated:** December 5, 2025
**Status:** Firmware Stable & Production Ready
