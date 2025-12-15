# Fall Detection Testing and Tuning Guide

# คู่มือการทดสอบและปรับจูน Fall Detection

เอกสารนี้ครอบคลุมแนวทางที่ใช้และขั้นตอนการทดสอบ/ปรับจูน Fall Detection Algorithm

---

## แนวทางที่ใช้ (Approach)

### คำถาม: ใช้ข้อมูลดิบหรือค่า threshold ที่ปรับแล้ว?

**คำตอบ: ใช้ค่า Threshold จากงานวิจัย (Research-Based)**

### ทำไมไม่ใช้ข้อมูลดิบจาก SiSFall Dataset?

**SiSFall Dataset (Raw Data):**
- เป็นไฟล์ CSV/JSON ที่มี accelerometer + gyroscope readings
- ต้อง download dataset (หลาย GB)
- ต้องวิเคราะห์เอง (ใช้ Python/MATLAB)
- ต้องหา threshold เอง (statistical analysis)
- ใช้เวลานาน (หลายสัปดาห์/เดือน)

**ข้อเสีย:**
- ใช้เวลานานเกินไป
- ต้องมีทักษะ data science
- ไม่เหมาะกับโปรเจกต์ที่ต้องการเริ่มต้นเร็ว

### ทำไมใช้ Threshold จากงานวิจัย?

**Research-Based Thresholds:**
- มีคนวิเคราะห์ SiSFall dataset แล้ว
- มีงานวิจัยหลายชิ้นที่เสนอ threshold values
- ค่าเหล่านี้ผ่านการทดสอบแล้ว
- ใช้เป็น baseline ได้เลย

**ข้อดี:**
- เริ่มต้นได้เร็ว (ไม่ต้องวิเคราะห์เอง)
- ใช้ค่า baseline ที่ผ่านการทดสอบแล้ว
- ปรับจูนได้ตามความต้องการ

### Workflow

```
Research Papers (SiSFall Analysis)
         ↓
   Baseline Thresholds (2.3g, 150ms)
         ↓
   Real-world Testing (2-3 people)
         ↓
   Fine-tuning (adjust thresholds)
         ↓
   Production Thresholds
```

**ดูข้อมูลอ้างอิง SiSFall Dataset:** [`docs/references/SISFALL_DATASET.md`](../../docs/references/SISFALL_DATASET.md)

---

## SiSFall Dataset Overview

**SiSFall Dataset** เป็น dataset ที่ใช้สำหรับ fall detection research:
- 15 ประเภท การหกล้ม (Forward, Backward, Side, etc.)
- 19 ประเภท กิจกรรมปกติ (Walking, Sitting, Standing, etc.)
- ผู้เข้าร่วม: อายุ 19-75 ปี
- Sensors: Accelerometer + Gyroscope

---

## Default Configuration (SiSFall-Based)

### Threshold Values

| Parameter | Low Sensitivity | Medium (Default) | High Sensitivity |
|-----------|----------------|------------------|------------------|
| **Acceleration** | 2.8g | 2.3g | 2.0g |
| **Duration** | 250ms | 150ms | 100ms |
| **Gyroscope** | 300 deg/s | 200 deg/s | 150 deg/s |

### Current Default (Medium Sensitivity)
- **Acceleration Threshold:** 2.3g
- **Duration Threshold:** 150ms
- **Gyroscope Threshold:** 200 deg/s

---

## Testing & Tuning Process

### Phase 1: Initial Testing (2-3 คน)

#### Test Scenarios

**Normal Activities (ไม่ควร trigger):**
- เดินปกติ
- นั่งลง/ลุกขึ้น
- โค้งตัว
- วิ่ง
- กระโดดเบาๆ

**Fall Scenarios (ควร trigger):**
- หกล้มไปข้างหน้า
- หกล้มไปข้างหลัง
- หกล้มไปด้านข้าง
- ล้มจากเก้าอี้
- ล้มขณะเดิน

#### Data Collection

ระหว่างทดสอบ ให้บันทึกข้อมูลต่อไปนี้:

```cpp
// ใน Serial Monitor จะแสดง:
// - Acceleration values (X, Y, Z, Total)
// - Gyroscope values (X, Y, Z)
// - Duration ที่เกิน threshold
// - False positives (trigger เมื่อไม่ควร)
// - Missed falls (ไม่ trigger เมื่อควร)
```

#### Log Format

```
[TEST] Activity: Walking
  Max Accel: 1.5g (No trigger) ✓
  
[TEST] Activity: Forward Fall
  Max Accel: 3.2g (Triggered) ✓
  Duration: 180ms
```

### Phase 2: Analysis & Adjustment

#### False Positive Analysis

**ถ้า trigger บ่อยเกินไป (False Positive):**
- เพิ่ม `activeAccelThreshold` (เช่น 2.3g → 2.5g)
- เพิ่ม `activeDurationThreshold` (เช่น 150ms → 200ms)
- ลด sensitivity (Medium → Low)

**ตัวอย่าง:**
```cpp
// ใน setup() หรือผ่าน Serial command
setFallDetectionSensitivity(SENSITIVITY_LOW);
// หรือ
setCustomFallThresholds(2.5, 200, 250);
```

#### Missed Fall Analysis

**ถ้าไม่ trigger เมื่อหกล้ม (Missed Fall):**
- ลด `activeAccelThreshold` (เช่น 2.3g → 2.0g)
- ลด `activeDurationThreshold` (เช่น 150ms → 100ms)
- เพิ่ม sensitivity (Medium → High)

**ตัวอย่าง:**
```cpp
setFallDetectionSensitivity(SENSITIVITY_HIGH);
// หรือ
setCustomFallThresholds(2.0, 100, 150);
```

#### Fine-Tuning

**ถ้าต้องการปรับแบบละเอียด:**
```cpp
// ปรับเฉพาะ acceleration threshold
setCustomFallThresholds(2.4, 150, 200);

// ปรับเฉพาะ duration threshold
setCustomFallThresholds(2.3, 180, 200);

// ปรับทั้งสอง
setCustomFallThresholds(2.35, 170, 220);
```

---

## Testing Checklist

### Pre-Testing
- [ ] Upload firmware พร้อม SiSFall default values
- [ ] เปิด Serial Monitor (115200 baud)
- [ ] ตรวจสอบว่า sensors ทำงานปกติ
- [ ] ทดสอบ alert system

### During Testing
- [ ] บันทึกทุก activity ที่ทดสอบ
- [ ] บันทึก acceleration values สำหรับแต่ละ activity
- [ ] บันทึก false positives
- [ ] บันทึก missed falls
- [ ] บันทึก duration ที่ trigger

### Post-Testing
- [ ] วิเคราะห์ false positive rate
- [ ] วิเคราะห์ missed fall rate
- [ ] ปรับ threshold ตามผลการทดสอบ
- [ ] ทดสอบซ้ำกับค่าใหม่
- [ ] บันทึกค่า threshold ที่เหมาะสม

---

## Configuration Methods

### Method 1: Sensitivity Levels

```cpp
// ใน setup()
initFallDetectionConfig();  // Default: Medium

// หรือเปลี่ยน sensitivity
setFallDetectionSensitivity(SENSITIVITY_HIGH);  // More sensitive
setFallDetectionSensitivity(SENSITIVITY_LOW);     // Less sensitive
```

### Method 2: Custom Thresholds

```cpp
// ปรับแบบละเอียด
setCustomFallThresholds(
  2.4,    // Acceleration threshold (g)
  170,    // Duration threshold (ms)
  210     // Gyroscope threshold (deg/s)
);
```

---

## Expected Values (Reference)

### Normal Activities (ไม่ควร trigger)

| Activity | Typical Max Accel | Typical Duration |
|----------|-------------------|------------------|
| Walking | 1.2-1.8g | < 100ms |
| Sitting | 0.8-1.2g | < 50ms |
| Standing | 0.9-1.1g | < 50ms |
| Bending | 1.5-2.0g | < 150ms |
| Running | 2.0-2.5g | < 200ms |

### Fall Activities (ควร trigger)

| Fall Type | Typical Max Accel | Typical Duration |
|-----------|-------------------|------------------|
| Forward Fall | 2.5-4.0g | 150-300ms |
| Backward Fall | 2.5-4.5g | 150-350ms |
| Side Fall | 2.3-3.8g | 120-280ms |
| Chair Fall | 2.8-4.2g | 180-400ms |

---

## Recommended Tuning Strategy

### Step 1: Start with Default (Medium Sensitivity)
- ใช้ค่าเริ่มต้นจาก SiSFall
- ทดสอบกับ 2-3 คน
- บันทึกผล

### Step 2: Analyze Results
- คำนวณ False Positive Rate
- คำนวณ Missed Fall Rate
- เปรียบเทียบกับ target (< 5% false positive, < 2% missed fall)

### Step 3: Adjust Thresholds
- ถ้า false positive สูง → เพิ่ม threshold
- ถ้า missed fall สูง → ลด threshold
- ปรับทีละน้อย (0.1g, 10ms)

### Step 4: Re-test
- ทดสอบซ้ำกับค่าใหม่
- เปรียบเทียบผลลัพธ์
- ปรับจนได้ค่าที่เหมาะสม

### Step 5: Finalize
- บันทึกค่า threshold ที่เหมาะสม
- ใช้ค่าเหล่านี้เป็น production default
- Document สำหรับทีม

---

## Notes

- **Threshold ไม่ควรต่ำเกินไป** → จะ trigger บ่อย (false positive)
- **Threshold ไม่ควรสูงเกินไป** → จะไม่ trigger เมื่อหกล้ม (missed fall)
- **Duration threshold** ช่วยลด false positive จากกิจกรรมปกติ
- **Gyroscope threshold** (optional) ช่วยเพิ่มความแม่นยำ

## Iterative Process

```
Test → Analyze → Adjust → Re-test → Finalize
  ↑                                    ↓
  └────────────────────────────────────┘
```

---

**Last Updated:** December 15, 2025  
**Status:** Ready for Testing & Tuning
