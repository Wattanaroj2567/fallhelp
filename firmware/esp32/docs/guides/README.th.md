# ESP32 Guides Index

[English](README.md) · [ภาษาไทย](README.th.md)

## Doc Meta

- ผู้อ่าน: Hardware Dev, QA, AI Agents
- Source of Truth: `firmware/esp32/docs/guides/`, `firmware/esp32/docs/components/`
- สถานะ: Active
- อัปเดตล่าสุด: 18 พฤษภาคม 2026

---

## ภาพรวม

`guides/` คือชั้น runbook สำหรับลงมือทำงานกับ ESP32 ให้ถูกโหมด

อ่านตามลำดับนี้:

1. เริ่มที่ [PracticalOperationGuide.md](PracticalOperationGuide.th.md) เพื่อเลือกงานและหลักฐาน
2. ถ้าเป็นระบบเต็ม ให้ไปที่ [Esp32SystemOperationGuide.md](Esp32SystemOperationGuide.th.md)
3. ถ้าเป็น sensor tuning ให้ไปที่ [SensorHardwareOnlyTuningGuide.md](SensorHardwareOnlyTuningGuide.th.md)
4. ถ้าต้องรู้รายละเอียดรายอุปกรณ์ ให้เปิด component guide ที่เกี่ยวข้อง

---

## เลือก Guide ที่ต้องใช้

| สถานการณ์ | เอกสารที่ต้องเปิด | ผลลัพธ์ที่ควรได้ |
| --- | --- | --- |
| ยังไม่แน่ใจว่างานนี้คืออะไร | [PracticalOperationGuide.md](PracticalOperationGuide.th.md) | เลือก firmware, evidence และ definition of done ได้ |
| เช็ก BLE, WiFi, MQTT, fall flow กับ backend/mobile | [Esp32SystemOperationGuide.md](Esp32SystemOperationGuide.th.md) | system integration checklist |
| จูน MPU หรือ Pulse โดยลดตัวแปรจาก backend/mobile | [SensorHardwareOnlyTuningGuide.md](SensorHardwareOnlyTuningGuide.th.md) | hardware-only tuning workflow |
| เก็บข้อมูล Fall Detection Sensor Lab | [../../fall_detection_sensor_lab/README.md](../../fall_detection_sensor_lab/README.th.md) | lab workflow, protocol, CSV pipeline |

---

## เอกสารรายอุปกรณ์ที่ต้องอ่านต่อ

หลังเลือก guide แล้ว ให้เปิด owner doc รายอุปกรณ์เมื่อจำเป็น:

- [../components/mpu6050.md](../components/mpu6050.th.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.th.md)
- [../components/cancel-button.md](../components/cancel-button.th.md)
- [../components/speaker-alert.md](../components/speaker-alert.th.md)

---

## ขอบเขต

1. `main_firmware` ใช้สำหรับ system integration และ runtime prototype flow
2. `sensor_tuning` ใช้สำหรับ hardware tuning และ lab collection
3. Fall Detection Sensor Lab เป็น Basic Activity Collection ไม่ใช่ sensor log collection
4. Node-RED CSV เป็นหลักฐานหลักเฉพาะ Sensor Lab หรือรอบที่ตั้งใจเก็บ CSV เท่านั้น

---

## เอกสารที่เกี่ยวข้อง

- [../README.md](../README.th.md)
- [../references/README.md](../references/README.th.md)
- [../../fall_detection_sensor_lab/README.md](../../fall_detection_sensor_lab/README.th.md)
