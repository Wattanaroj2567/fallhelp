# Arduino Documentation Index

# สารบัญเอกสาร Arduino/Hardware

เอกสารทั้งหมดสำหรับการพัฒนาและใช้งาน ESP32 Firmware

---

## เอกสารหลัก

| เอกสาร | คำอธิบาย |
| :----- | :------- |
| [Sensors Documentation](SENSORS_README.md) | เอกสารครบถ้วนเกี่ยวกับ Sensor Modules ทั้งหมด (MPU6050, Pulse, False Alarm Cancel, Power, Alert) |
| [Fall Detection Tuning Guide](FALL_DETECTION_TUNING.md) | คู่มือการทดสอบและปรับจูน Fall Detection Algorithm (รวมแนวทางที่ใช้) |

---

## Sensor Modules

### Hardware Sensors
- **MPU6050** - Fall Detection (Accelerometer + Gyroscope)
- **Pulse Sensor XD-58C** - Heart Rate Monitoring
- **False Alarm Cancel Button** - ปุ่มยกเลิกการแจ้งเตือน (False Alarm)

### System Modules
- **Power Management** - Battery & Charging Management
- **Alert System** - Speaker & LED Indicator
- **Sensor Manager** - Unified Sensor Interface

### Configuration
- **Fall Detection Config** - SiSFall-based threshold configuration

---

## Quick Links

### สำหรับเริ่มต้นใช้งาน
1. อ่าน [Sensors Documentation](SENSORS_README.md) เพื่อเข้าใจ Sensor Modules
2. อ่าน [Fall Detection Tuning Guide](FALL_DETECTION_TUNING.md) สำหรับการทดสอบและแนวทาง

### สำหรับการพัฒนา
- ดูโครงสร้างโค้ดใน `../fallhelp_esp32/`
- อ่าน comments ในไฟล์ `.ino` แต่ละไฟล์
- ใช้ [Fall Detection Tuning Guide](FALL_DETECTION_TUNING.md) สำหรับการปรับจูน

---

## โครงสร้างไฟล์

```
arduino/
├── README.md                    ← เอกสารหลัก (Quick Start)
├── docs/                        ← เอกสารทั้งหมด (ที่นี่)
│   ├── README.md               ← Index (ไฟล์นี้)
│   ├── SENSORS_README.md       ← Sensor Modules Documentation
│   └── FALL_DETECTION_TUNING.md ← Testing & Tuning Guide (รวมแนวทางที่ใช้)
├── fallhelp_esp32/              ← Firmware Source Code
│   ├── fallhelp_esp32.ino      ← Main Firmware
│   ├── MPU6050_Sensor.ino      ← Fall Detection
│   ├── PulseSensor.ino         ← Heart Rate
│   ├── FalseAlarmCancelButton.ino ← False Alarm Cancel Button
│   ├── PowerManagement.ino    ← Battery & Power
│   ├── AlertSystem.ino         ← Speaker & Alert
│   ├── SensorManager.ino       ← Unified Interface
│   └── FallDetectionConfig.ino ← Configuration
```

---

**Last Updated:** December 15, 2025
