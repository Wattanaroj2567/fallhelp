# XD-58C Pulse Sensor Guide

[English](pulse-sensor.md) · [ภาษาไทย](pulse-sensor.th.md)

## Doc Meta

- ผู้อ่าน: Hardware Dev, QA
- Source of Truth: `firmware/esp32/src/main_firmware/PulseSensor.ino`, `firmware/esp32/src/sensor_tuning/PulseSensor.ino`
- สถานะ: Active
- อัปเดตล่าสุด: 18 พฤษภาคม 2026

---

## ภาพรวม

XD-58C ใช้วัด heart rate จากสัญญาณ PPG ที่ตำแหน่ง ear clip ของอุปกรณ์ FallHelp

เอกสารนี้เป็น owner doc ของ pulse sensor และ PPG signal quality ไม่ใช่เอกสารของ Fall Detection Sensor Lab เพราะ Fall Detection Sensor Lab เก็บเฉพาะ IMU Basic Activity Collection

---

## ขอบเขต

ไฟล์นี้ครอบคลุม:

1. ข้อเท็จจริงของ XD-58C และ GPIO/ADC
2. ค่า runtime ที่ใช้คัดกรอง beat
3. วิธีแยก Rest, Motion และปัญหา signal quality
4. checklist สำหรับทดสอบ hardware readiness

ไฟล์นี้ไม่ครอบคลุม:

1. การสรุปผล pulse เชิงสถิติ
2. การเปลี่ยน backend event contract
3. การใช้ pulse data เป็น metric ของ Fall Detection Sensor Lab
4. การปรับ fall detection threshold

---

## ข้อเท็จจริงด้านฮาร์ดแวร์

| รายการ | ค่า |
| --- | --- |
| Component | XD-58C Pulse Sensor + Easy Earclip Mount |
| Input pin | `GPIO34` (`ADC1_CH6`) |
| ADC scale | 10-bit, `0..1023` |
| ADC attenuation | `ADC_11db` |
| Library | `PulseSensorPlayground` |

GPIO34 เป็น input-only pin เหมาะกับ analog sensor แต่ต้องระวังสายหลวมและ noise จากการขยับตัว

---

## ความรับผิดชอบของ Firmware

| Firmware | บทบาทของ pulse sensor |
| --- | --- |
| `main_firmware` | อ่าน heart rate สำหรับ runtime device state และ snapshot ที่แนบไปกับ fall event |
| `sensor_tuning` | แยกทดสอบ Rest/Motion และดู reject reason โดยลดตัวแปรจาก backend/mobile |

ค่าหลักที่ตรงกันใน firmware ปัจจุบัน:

| ค่า | ปัจจุบัน | ใช้ทำอะไร |
| --- | --- | --- |
| `PULSE_THRESHOLD_10BIT` | `480` | threshold พื้นฐานของ waveform |
| `VALID_BPM_MIN` | `40` | BPM ต่ำสุดที่รับได้ |
| BPM max | `180` | BPM สูงสุดที่รับได้ (`HR_VALID_BPM_MAX` หรือ `VALID_BPM_MAX` ตาม variant) |
| `SIGNAL_AMP_MIN` | `15` | amplitude ต่ำสุดที่รับ beat |
| `SIGNAL_AMP_MAX` | `400` | amplitude สูงสุดก่อนถือว่าเป็น noise/invalid |
| `HEART_RATE_STALE_TIMEOUT_MS` | `1500 ms` | reset heart rate เมื่อไม่มี beat ใหม่ |

---

## พฤติกรรมขณะทำงาน (Runtime Behavior)

PPG pipeline โดยย่อ:

```text
raw ADC sample
  -> smoothing / library sample path
  -> PulseSensorPlayground beat detection
  -> amplitude / IBI / BPM gates
  -> accepted beat หรือ rejected beat
  -> heartRate + confidence / abnormal state
```

สาเหตุ reject ที่ควรดู:

1. `signal_quality` — amplitude ต่ำ/สูงเกินช่วง
2. `ibi` — interval ระหว่าง beat ไม่สมเหตุสมผล
3. `bpm_range` — BPM อยู่นอกช่วงที่รับได้
4. `bpm_jump` — ค่าเปลี่ยนเร็วผิดปกติ

ข้อควรระวังในการตีความ:

1. Rest session ใช้ดู baseline ของ sensor และตำแหน่งหนีบ
2. Motion session ใช้ดู motion artifact
3. Pulse data เป็น monitoring signal ไม่ใช่เครื่องมือวินิจฉัยทางการแพทย์
4. งาน pulse เชิงปริมาณเป็นงานแยกในอนาคต ไม่ใช่ผลของ Fall Detection Sensor Lab

---

## Checklist การทดสอบ

### ความพร้อมพื้นฐาน

1. ตั้ง `sensor_tuning` เป็น `FALLHELP_SINGLE_SENSOR_PULSE`
2. Upload `sensor_tuning.ino`
3. เปิด Serial Monitor ที่ `115200`
4. หนีบ ear clip ให้แน่นและอยู่ในตำแหน่งใช้งานจริง
5. รอให้สัญญาณนิ่งก่อนอ่านผล

### ตรวจขณะพัก (Rest)

1. ให้ผู้สวมใส่อยู่นิ่ง 1-2 นาที
2. ดู raw, smoothed value, BPM, confidence และ reject reason จาก Serial
3. ยืนยันว่า BPM ไม่ค้างและไม่แกว่งผิดปกติ
4. ถ้าต้องเทียบเป็นตาราง ให้เก็บ CSV เพิ่มตาม runbook ของรอบนั้น

### ตรวจขณะเคลื่อนไหว (Motion)

1. เริ่มจาก motion เบา ๆ ไม่ใช่กิจกรรมรุนแรงทันที
2. ดูว่า motion artifact ทำให้ reject เพิ่มขึ้นแค่ไหน
3. เทียบกับ Rest ก่อนตัดสินว่าปัญหาอยู่ที่ sensor, clip หรือ threshold

---

## หลักฐานที่ต้องเก็บ

| งาน | หลักฐาน |
| --- | --- |
| Hardware readiness | Serial log ที่แสดง init success, raw, voltage, threshold |
| Rest check | Serial log ช่วงอยู่นิ่ง 1-2 นาที |
| Motion check | Serial log ที่เห็น reject reason ระหว่างขยับ |
| Tuning decision | ค่าเดิม, ค่าที่เสนอปรับ และเหตุผลจาก log |

CSV เป็นหลักฐานเสริมเฉพาะรอบที่ตั้งใจเก็บข้อมูลเป็นตาราง ไม่ใช่ค่า default ของ pulse ทุก session

---

## การแก้ปัญหา

### ไม่มี Beat หรือ BPM เป็น 0 นานเกินไป

ตรวจ:

1. Ear clip แน่นและอยู่ตำแหน่งเดิมหรือไม่
2. raw ADC เปลี่ยนตามชีพจรจริงหรือไม่
3. `PULSE_THRESHOLD_10BIT` สูง/ต่ำเกินไปหรือไม่
4. sensor หลุดจากผิวหรือมีแสงรบกวนหรือไม่

### Reject เพราะ Signal Quality

ตรวจ:

1. amplitude ต่ำกว่า `SIGNAL_AMP_MIN` หรือสูงกว่า `SIGNAL_AMP_MAX`
2. สาย ADC หลวมหรือโดนดึงหรือไม่
3. motion artifact มากกว่าที่ session ตั้งใจทดสอบหรือไม่
4. clip กดแน่นเกินหรือตื้นเกินไปหรือไม่

### BPM ไม่สมเหตุสมผล

ตรวจ:

1. BPM หลุดช่วง `40..180` หรือไม่
2. IBI ผิดช่วงหรือไม่
3. มี sudden jump จาก motion หรือ noise หรือไม่
4. stale timeout reset ค่าเร็วตาม `1500 ms` หรือไม่

### Rest ผ่าน แต่ Motion พัง

แปลว่าปัญหาหลักมีแนวโน้มเป็น motion artifact ไม่ใช่ baseline sensor failure

แนวทาง:

1. ปรับตำแหน่ง clip ก่อนปรับ threshold
2. ลดการขยับที่ไม่อยู่ใน scope ของรอบนั้น
3. เก็บ log เปรียบเทียบก่อน-หลัง แบบหนึ่งตัวแปรต่อรอบ

---

## เอกสารที่เกี่ยวข้อง

- [../guides/SensorHardwareOnlyTuningGuide.md](../guides/SensorHardwareOnlyTuningGuide.th.md)
- [../guides/PracticalOperationGuide.md](../guides/PracticalOperationGuide.th.md)
- [../references/SensorTheoryReference.md](../references/SensorTheoryReference.th.md)
