# Sensor Theory Reference

[English](SensorTheoryReference.md) · [ภาษาไทย](SensorTheoryReference.th.md)

## Doc Meta

- ผู้อ่าน: Dev, QA, Stakeholder, ผู้วิจัย
- Source of Truth: firmware source, component owner docs, curated references
- สถานะ: Active
- อัปเดตล่าสุด: 18 พฤษภาคม 2026

---

## ภาพรวม

ไฟล์นี้อธิบายหลักการของ IMU fall detection และ PPG signal processing ใน FallHelp

ไฟล์นี้ไม่ใช่ runbook และไม่ใช่ที่ประกาศผลของรอบทดลองปัจจุบัน

---

## ค่าใน Firmware เทียบกับค่าจากงานวิจัย

แยกความหมายให้ชัด:

| ประเภทค่า | ความหมาย |
| --- | --- |
| Firmware value | ค่าที่ source code ใช้อยู่จริง |
| Research/reference value | ค่าจากวรรณกรรมหรือ baseline เชิงทฤษฎี |
| Tuning candidate | ค่าที่เสนอให้ทดลองในรอบ tuning |
| Full-study result | ผลสรุปจาก dataset/protocol เต็ม ซึ่งยังไม่อยู่ใน scope ของ Fall Detection Sensor Lab |

ค่าที่ใช้จริงต้องอ้างจาก firmware source ก่อนเสมอ

---

## แนวคิด Fall Detection ด้วย MPU6050

SVM:

```text
SVM = sqrt(ax^2 + ay^2 + az^2)
```

ใช้วัด magnitude ของแรงลัพธ์จาก accelerometer

Posture change:

```text
postureDelta = angle difference around impact window
```

ใช้แยกกิจกรรมที่มีแรงมากแต่ไม่ได้ล้ม ออกจาก posture change ที่เข้าข่ายการล้ม

Fall detection ใน firmware เป็น threshold-based hybrid approach:

```text
impact magnitude gate
  + duration/stabilization gate
  + postureDelta gate
  -> suspected_fall
  -> cancel/confirm layer
```

ค่า prototype ปัจจุบันใน owner docs:

| ค่า | ความหมาย |
| --- | --- |
| `2.0g` | default impact threshold |
| `1500 ms` | default duration/stabilization threshold |
| `45 deg` | default posture threshold |
| `15000 ms` | cancel window |

---

## Complementary Filter

FallHelp ใช้ complementary filter เพื่อรวม accelerometer และ gyroscope สำหรับคำนวณ pitch/roll

แนวคิด:

1. Gyroscope ตอบสนองเร็ว แต่เกิด drift ได้
2. Accelerometer อ้างอิง gravity ได้ แต่ถูกรบกวนเมื่อมีแรงกระแทก
3. complementary filter ผสมข้อมูลสองแหล่งเพื่อให้ angle นิ่ง (stable) ขึ้น

สูตรในเชิงแนวคิด:

```cpp
pitch = 0.98f * (pitch + gyroX * dt) + 0.02f * accelPitch;
roll = 0.98f * (roll + gyroY * dt) + 0.02f * accelRoll;
```

ให้ดู source จริงก่อนอ้างรายละเอียด implementation:

1. `firmware/esp32/src/main_firmware/MPU6050_Sensor.ino`
2. `firmware/esp32/src/sensor_tuning/MPU6050_Sensor.ino`

---

## แนวคิด PPG

PPG วัดชีพจรจากการเปลี่ยนแปลงของแสงที่สัมพันธ์กับ blood volume

ข้อจำกัดหลัก:

1. motion artifact
2. contact pressure ของ ear clip
3. ambient light / sensor placement
4. perfusion ที่ตำแหน่งวัด

Firmware จึงใช้ guardrails เช่น:

| ค่า | ใช้ทำอะไร |
| --- | --- |
| `PULSE_THRESHOLD_10BIT` | threshold ของ waveform |
| `VALID_BPM_MIN` / max | ตัด BPM ที่ไม่สมเหตุสมผล |
| `SIGNAL_AMP_MIN/MAX` | quality gate จาก amplitude |
| `HEART_RATE_STALE_TIMEOUT_MS` | reset เมื่อไม่มี beat ใหม่ |

Pulse data ใช้เพื่อ monitoring ไม่ใช่การวินิจฉัยทางการแพทย์ (medical diagnosis)

---

## หลักการลด Noise

1. จูนทีละ 1 ค่า
2. แยก MPU, Pulse และ system integration เป็นคนละรอบ
3. เก็บ raw log ก่อนทำ summary
4. เทียบผลกับรอบที่มีเงื่อนไขใกล้เคียงกัน
5. อย่าถือว่าผลใน lab เท่ากับผลใน real-world

---

## ขอบเขตของการตีความ

1. Fall Detection Sensor Lab เป็น Basic Activity Collection เฉพาะ IMU
2. ไม่สรุปผลเชิงสถิติเป็นผลปัจจุบัน
3. งานเชิงปริมาณของ Pulse เป็น future work ที่แยกจาก Fall Detection Sensor Lab
4. FallHelp เป็น monitoring system ไม่ใช่ medical diagnostic device

---

## เอกสารที่เกี่ยวข้อง

- [ProjectAlignedResearch.md](ProjectAlignedResearch.th.md)
- [TechnicalGlossary.md](TechnicalGlossary.th.md)
- [../components/mpu6050.md](../components/mpu6050.th.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.th.md)
- [../guides/SensorHardwareOnlyTuningGuide.md](../guides/SensorHardwareOnlyTuningGuide.th.md)
