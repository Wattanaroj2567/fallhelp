# Technical Glossary

[English](TechnicalGlossary.md) · [ภาษาไทย](TechnicalGlossary.th.md)

## Doc Meta

- ผู้อ่าน: Hardware Dev, Backend Dev, QA, AI Agents
- Source of Truth: firmware source, backend contract docs, component owner docs
- สถานะ: Active
- อัปเดตล่าสุด: 21 พฤษภาคม 2026

---

## Fall Detection

| คำศัพท์ | ความหมาย |
| --- | --- |
| `MPU6050` | IMU ที่มี accelerometer และ gyroscope |
| `SVM` | Signal Vector Magnitude คือ magnitude รวมของ acceleration |
| `Posture Delta` | การเปลี่ยนมุมของร่างกาย/อุปกรณ์รอบช่วง impact |
| `Impact Threshold` | gate แรงกระแทกจาก SVM |
| `Duration Threshold` | gate เวลา/ช่วง stabilization |
| `Posture Threshold` | gate องศาของ posture change |
| `suspected_fall` | firmware พบเหตุที่เข้าข่ายล้มเบื้องต้น |
| `fall_confirmed` | ไม่มีการ cancel ภายในเวลา จึงยืนยันเหตุล้ม |
| `fall_cancelled` | ผู้สวมใส่กด GPIO27 ภายใน cancel window |

---

## Cancel vs Acknowledge

| คำศัพท์ | ผู้กระทำ | ผลลัพธ์ |
| --- | --- | --- |
| `Cancel` | ผู้สวมใส่ผ่าน GPIO27 | เปลี่ยนเหตุเป็น `fall_cancelled` / `CANCELLED` |
| `Acknowledge` | caregiver ใน app | รับทราบหรือ reset view ฝั่ง UI โดยไม่เปลี่ยน DB fall stage |
| `Cancel Timeout` | firmware runtime | `15000 ms` ใน prototype ปัจจุบัน |

---

## Pulse / PPG

| คำศัพท์ | ความหมาย |
| --- | --- |
| `PPG` | Photoplethysmography วัดชีพจรจากสัญญาณแสง |
| `BPM` | beats per minute (จำนวนครั้งต่อนาที) |
| `IBI` | inter-beat interval (ช่วงเวลาระหว่าง beat) |
| `Signal Amplitude` | peak-to-trough amplitude ที่ใช้ใน quality gate |
| `Beat accepted` | beat ที่ผ่าน gate และนำไปคำนวณได้ |
| `Beat rejected` | beat ที่ไม่ผ่าน gate เช่น amplitude, IBI, BPM range |
| `Stale Timeout` | ระยะเวลาที่ไม่มี beat ใหม่จน firmware reset heart rate |

---

## MQTT / Runtime Topics

| Topic / คำศัพท์ | ความหมาย |
| --- | --- |
| `device/+/event` | MQTT event หลักของ runtime device flow |
| `device/<serial>/heartrate` | path สำหรับ publish heart rate ขณะ runtime |
| `device/<serial>/status` | path สำหรับ publish สถานะ online/status ของ device |
| `device/<serial>/config` | backend ส่ง config ให้ device |
| `device/<serial>/config/ack` | device ตอบรับ config |
| `device/<serial>/lab/imu` | lab IMU topic จาก `sensor_tuning` สำหรับ Fall Detection Sensor Lab |

---

## คำศัพท์ของ Fall Detection Sensor Lab

| คำศัพท์ | ความหมาย |
| --- | --- |
| Basic Activity Collection | เก็บตัวอย่าง IMU activity เพื่อสอบเทียบเกณฑ์และบันทึกรายงานผล ไม่ใช่ sensor log collection |
| Trial | 1 activity attempt = 1 CSV |
| `imu_sample` | periodic IMU sample ใน lab flow |
| `imu_impact` | snapshot ตอน impact |
| `imu_decision` | snapshot ตอน decision หลัง posture check |
| `selected_values_table.csv` | ตาราง selected rows จาก `npm run sensor-lab -- summarize` |

ห้ามตีความ Fall Detection Sensor Lab เป็นผลเชิงสถิติปัจจุบัน

---

## คำศัพท์ของ Backend Event

| คำศัพท์ | ความหมาย |
| --- | --- |
| `fallStage` | DB stage เช่น `PENDING_CONFIRMATION`, `CONFIRMED`, `CANCELLED` |
| `cancelledAt` | เวลาที่ device cancel สำเร็จ |
| `fall_detected` | socket event หลัง fall ถูก confirmed |
| `Dedup` | การกัน event ซ้ำจาก MQTT retransmission |
| `Pending Fall Event` | event ล้มที่รอการยืนยัน |
| `Confirmed Fall Event` | event ล้มที่ยืนยันแล้ว |

---

## เอกสารที่เกี่ยวข้อง

- [SensorTheoryReference.md](SensorTheoryReference.th.md)
- [ProjectAlignedResearch.md](ProjectAlignedResearch.th.md)
- [../components/mpu6050.md](../components/mpu6050.th.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.th.md)
- [../../../../docs/architecture/iot-mqtt.md](../../../../docs/architecture/iot-mqtt.th.md)
