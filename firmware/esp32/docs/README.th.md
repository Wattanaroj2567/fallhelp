# ESP32 Firmware Docs

[English](README.md) · [ภาษาไทย](README.th.md)

## Doc Meta

- ผู้อ่าน: Hardware Dev, Backend Dev, QA
- Source of Truth: Active
- สถานะ: Active
- อัปเดตล่าสุด: 18 พฤษภาคม 2026

---

## ภาพรวม

เอกสารชุดนี้เป็นแผนที่กลางของงาน ESP32 ใน FallHelp ครอบคลุมทั้ง firmware ระบบหลัก, firmware สำหรับจูนฮาร์ดแวร์ และ Sensor Lab

หลักการอ่านมีดังนี้:

1. เริ่มจากหน้า index นี้เพื่อเลือกงานที่กำลังจะทำ
2. เปิด `guide` ที่ตรงกับโหมดการทำงานก่อนเสมอ
3. เปิด `component guide` เฉพาะเซนเซอร์หรืออุปกรณ์ที่กำลังแตะจริง
4. ถ้าเป็น Fall Detection Sensor Lab ให้ไปที่ `fall_detection_sensor_lab/` สำหรับ workflow แบบละเอียด
5. ถ้าต้องอธิบายเหตุผลเชิงทฤษฎีหรืออ้างงานวิจัย จึงค่อยไปที่ `references/`

---

## เส้นทางการอ่านตามเป้าหมาย

| งานที่ต้องทำ | ให้เปิดไฟล์นี้ก่อน | ไปต่อเมื่อ |
| --- | --- | --- |
| เริ่มรอบทดสอบหน้างาน | [guides/PracticalOperationGuide.md](guides/PracticalOperationGuide.th.md) | ต้องเลือกโหมด firmware หรือเตรียมหลักฐาน |
| เชื่อมระบบเต็มกับ backend/mobile | [guides/Esp32SystemOperationGuide.md](guides/Esp32SystemOperationGuide.th.md) | ต้องเช็ก BLE, WiFi, MQTT, fall flow |
| จูนเซนเซอร์แบบไม่พึ่ง backend | [guides/SensorHardwareOnlyTuningGuide.md](guides/SensorHardwareOnlyTuningGuide.th.md) | ต้องแยก Pulse/MPU และเก็บหลักฐานก่อน-หลัง |
| เก็บข้อมูล Fall Detection Sensor Lab | [../fall_detection_sensor_lab/README.md](../fall_detection_sensor_lab/README.th.md) | ต้องใช้ Node-RED Dashboard, CSV หรือ protocol ของ lab |
| จูนการตรวจจับการล้มจาก MPU6050 | [components/mpu6050.md](components/mpu6050.th.md) | ต้องเข้าใจ SVM, postureDelta, threshold หรือ fall state |
| จูนชีพจรจาก XD-58C | [components/pulse-sensor.md](components/pulse-sensor.th.md) | ต้องตัดสินใจเรื่อง signal quality หรือ accepted rate |
| เช็กปุ่มยกเลิก | [components/cancel-button.md](components/cancel-button.th.md) | ต้องพิสูจน์ `fall_cancelled` ภายใน 15 วินาที |
| เช็กเสียงเตือน | [components/speaker-alert.md](components/speaker-alert.th.md) | ต้องพิสูจน์ว่าเสียงเริ่มและหยุดถูกจังหวะ |
| หาเหตุผลเชิงทฤษฎีหรือคำศัพท์ | [references/README.md](references/README.th.md) | ต้องอ้างสูตร, metric หรือ research |

---

## ความรับผิดชอบของเอกสาร

| หมวด | หน้าที่ | ไฟล์หลัก |
| --- | --- | --- |
| Runbook | ขั้นตอนใช้งานจริงแบบ step-by-step | `guides/*.md` |
| Component Guide | วิธีทดสอบ/ปรับค่ารายอุปกรณ์ | `components/*.md` |
| Reference | ทฤษฎี, คำศัพท์, งานวิจัยอ้างอิง | `references/*.md` |
| Sensor Lab | ขั้นตอนเก็บข้อมูล Fall Detection Sensor Lab และ CSV pipeline | `../fall_detection_sensor_lab/` |

กติกา:

- ถ้าต้อง “ลงมือทำ” ให้เริ่มที่ `guides/`
- ถ้าต้อง “ปรับค่า/ดีบักอุปกรณ์” ให้ไปที่ `components/`
- ถ้าต้อง “อธิบายเหตุผลว่าทำไมใช้ค่านี้” ให้ไปที่ `references/`

---

## ขั้นตอนการทำงานทีละขั้น

### Step 1 — เลือกโหมดงาน

1. `main_firmware` — firmware หลักของ prototype สำหรับ BLE, WiFi, MQTT, fall flow, heart rate และ alert sound
2. `sensor_tuning` — firmware แยกสำหรับจูนฮาร์ดแวร์ เพื่อลดตัวแปรจาก backend/mobile
3. `fall_detection_sensor_lab` — lab module สำหรับ Basic Activity Collection และ CSV pipeline
4. ถ้าไม่แน่ใจ ให้เริ่มจาก [guides/PracticalOperationGuide.md](guides/PracticalOperationGuide.th.md)

### Step 2 — เปิด owner doc ให้ถูก

1. งานระบบเต็ม → [guides/Esp32SystemOperationGuide.md](guides/Esp32SystemOperationGuide.th.md)
2. งานจูนฮาร์ดแวร์ → [guides/SensorHardwareOnlyTuningGuide.md](guides/SensorHardwareOnlyTuningGuide.th.md)
3. งานรายเซนเซอร์ → component guide ที่เกี่ยวข้อง

### Step 3 — เตรียมหลักฐาน

1. ใช้ `capture_commands.md` บันทึกคำสั่งทุกครั้ง
2. ใช้ Serial/backend/mobile/MQTT logs ตามประเภทงาน
3. ใช้ CSV จาก Node-RED เฉพาะงาน Sensor Lab หรืองาน sensor_tuning ที่ต้องเก็บข้อมูลเป็นตาราง
4. ใช้ `session_notes.md` เพื่อสรุปผลและเหตุผลของการปรับค่า

### Step 4 — สรุปผลรอบ

1. ห้ามสรุปผลโดยไม่มี log ดิบ
2. 1 รอบ ปรับได้ 1 ค่าเท่านั้น
3. ถ้าไม่ผ่านเกณฑ์ ให้บอกให้ชัดว่า failed เพราะอะไร ไม่ใช่แค่ “ยังไม่ดี”

---

## เอกสารที่ใช้งานอยู่

### Runbooks

- [guides/PracticalOperationGuide.md](guides/PracticalOperationGuide.th.md)
- [guides/Esp32SystemOperationGuide.md](guides/Esp32SystemOperationGuide.th.md)
- [guides/SensorHardwareOnlyTuningGuide.md](guides/SensorHardwareOnlyTuningGuide.th.md)
- [guides/README.md](guides/README.th.md)

### Component Guides

- [components/mpu6050.md](components/mpu6050.th.md)
- [components/pulse-sensor.md](components/pulse-sensor.th.md)
- [components/cancel-button.md](components/cancel-button.th.md)
- [components/speaker-alert.md](components/speaker-alert.th.md)

### References

- [references/SensorTheoryReference.md](references/SensorTheoryReference.th.md)
- [references/TechnicalGlossary.md](references/TechnicalGlossary.th.md)
- [references/ProjectAlignedResearch.md](references/ProjectAlignedResearch.th.md)
- [references/README.md](references/README.th.md)

---

## เอกสารที่เกี่ยวข้อง

- [../README.md](../README.th.md)
- [../START_HERE.md](../START_HERE.th.md)
- [../fall_detection_sensor_lab/README.md](../fall_detection_sensor_lab/README.th.md)
