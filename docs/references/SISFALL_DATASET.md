# SiSFall Dataset Reference - Fall Detection Approach

**⚠️ สำคัญ:** เราใช้ **Threshold Values จากงานวิจัย** ที่วิเคราะห์ SiSFall dataset แล้ว ไม่ใช่ข้อมูลดิบจาก dataset

ข้อมูลอ้างอิงสำหรับพัฒนา Fall Detection Algorithm โดยใช้เทคนิคและค่า threshold ที่มีคนวิเคราะห์ SiSFall dataset แล้ว

---

## ภาพรวม (Overview)

| รายการ           | ข้อมูล                                    |
| ---------------- | ----------------------------------------- |
| **ชื่อ**         | SisFall - A Fall and Movement Dataset     |
| **ปีที่เผยแพร่** | 2017                                      |
| **วัตถุประสงค์** | วิจัยการตรวจจับการหกล้มและกิจกรรมประจำวัน |

## แนวทางที่เราใช้ (Our Approach)

**เราไม่ใช้ข้อมูลดิบจาก SiSFall dataset** แต่ใช้ **Threshold Values จากงานวิจัย** ที่วิเคราะห์ SiSFall dataset แล้ว

**สรุปสั้นๆ:**
- ใช้ Threshold จากงานวิจัย (baseline: 2.3g @ 150ms)
- ทดสอบจริงกับ 2-3 คน
- ปรับจูนตามผลการทดสอบ

**ดูรายละเอียดแนวทาง:** [`arduino/docs/FALL_DETECTION_TUNING.md`](../../arduino/docs/FALL_DETECTION_TUNING.md)

---

## ข้อมูลอ้างอิง Dataset (Reference Only)

**หมายเหตุ:** ข้อมูลด้านล่างเป็นข้อมูลอ้างอิงเท่านั้น เราไม่ได้ใช้ข้อมูลดิบจาก dataset

**แหล่งดาวน์โหลด:**

| เวอร์ชัน     | ลิงก์                                                                                              | คำอธิบาย                                                        |
| ------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Original** | [SisFall Original Dataset](https://www.kaggle.com/datasets/nvnikhil0001/sis-fall-original-dataset) | ข้อมูลดิบจากงานวิจัยต้นฉบับ - ไฟล์แยกตาม Subject และ Activity   |
| **Enhanced** | [SisFall Enhanced](https://www.kaggle.com/datasets/nvnikhil0001/sisfall-enhanced)                  | **มี Label 3 Class:** Fall, Non-Fall, Pre-Fall - พร้อมใช้กับ ML |

**สำหรับผู้ที่ต้องการวิเคราะห์เอง:** ใช้ **Enhanced** สำหรับ Threshold Analysis เพราะมี Label แบ่งกลุ่มมาให้แล้ว

---

## Sensors ที่ใช้เก็บข้อมูล

| Sensor              | รุ่น                 | ประเภท   | Range    |
| ------------------- | -------------------- | -------- | -------- |
| **Accelerometer 1** | MMA8451Q (Freescale) | ความเร่ง | ±8g      |
| **Accelerometer 2** | ADXL345              | ความเร่ง | ±16g     |
| **Gyroscope**       | ITG3200              | การหมุน  | ±2000°/s |

**หมายเหตุ:** MPU6050 ที่เราใช้มี Accelerometer + Gyroscope ในตัวเดียว ซึ่งเทียบเท่ากับ SisFall ได้

---

## ผู้เข้าร่วมทดสอบ (Participants)

| กลุ่ม            |   จำนวน   | อายุ             |
| ---------------- | :-------: | ---------------- |
| **Young Adults** |   23 คน   | 19-30 ปี         |
| **Elderly**      |   15 คน   | 60-75 ปี         |
| **รวม**          | **38 คน** | 19 ชาย / 19 หญิง |

---

## ประเภทกิจกรรม

### Activities of Daily Living (ADLs) - 19 ประเภท

|  รหัส   | กิจกรรม                               |
| :-----: | ------------------------------------- |
|   D01   | เดินช้า                               |
|   D02   | เดินเร็ว                              |
|   D03   | วิ่งเหยาะช้า                          |
|   D04   | วิ่งเหยาะเร็ว                         |
|   D05   | ขึ้นบันไดช้า                          |
|   D06   | ขึ้นบันไดเร็ว                         |
|   D07   | ลงบันไดช้า                            |
|   D08   | ลงบันไดเร็ว                           |
|   D09   | นั่งลงบนเก้าอี้และลุกขึ้น             |
| D10-D19 | กิจกรรมอื่นๆ (งอตัว, ก้มหยิบของ, ฯลฯ) |

### Fall Types - 15 ประเภท

|  รหัส   | ประเภทการล้ม                 |
| :-----: | ---------------------------- |
|   F01   | ล้มไปข้างหน้าขณะเดิน (สะดุด) |
|   F02   | ล้มไปข้างหลังขณะเดิน (ลื่น)  |
|   F03   | ล้มไปด้านข้างขณะเดิน         |
|   F04   | ล้มไปข้างหน้าขณะพยายามลุก    |
|   F05   | ล้มไปข้างหลังขณะพยายามนั่ง   |
| F06-F15 | รูปแบบการล้มอื่นๆ            |

---

## ข้อมูลทางเทคนิค

| รายการ             | ค่า                           |
| ------------------ | ----------------------------- |
| **Sampling Rate**  | 200 Hz                        |
| **ตำแหน่งติดตั้ง** | เอว (Waist)                   |
| **รูปแบบข้อมูล**   | CSV                           |
| **แกนข้อมูล**      | X, Y, Z (ทั้ง Accel และ Gyro) |

---

## การนำไปใช้กับ FallHelp

### ความเหมือน

| SisFall                   | FallHelp (เรา)             |
| ------------------------- | -------------------------- |
| Accelerometer + Gyroscope | MPU6050 (Accel + Gyro)     |
| 200 Hz                    | ปรับได้ (แนะนำ 50-100 Hz)  |
| เอว                       | คอ (อาจต้องปรับ Threshold) |

### วิธีใช้งาน (สำหรับโปรเจกต์ FallHelp)

**เราใช้ Threshold จากงานวิจัย ไม่ใช่ข้อมูลดิบ**

**ดูเอกสารเพิ่มเติม:**
- [Fall Detection Tuning](../../arduino/docs/FALL_DETECTION_TUNING.md) - คู่มือการทดสอบและปรับจูน (รวมแนวทางที่ใช้)
- `arduino/fallhelp_esp32/FallDetectionConfig.ino` - Configuration file

---

## อ้างอิง (References)

- **Paper:** Sucerquia, A., López, J.D., Vargas-Bonilla, J.F. (2017). "SisFall: A Fall and Movement Dataset"
- **DOI:** 10.3390/s17010198
- **Published in:** Sensors (MDPI)
- **PubMed:** [https://pubmed.ncbi.nlm.nih.gov/28117691/](https://pubmed.ncbi.nlm.nih.gov/28117691/)

---

**Last Updated:** December 15, 2025  
**Status:** Using Research-Based Thresholds (Not Raw Dataset)
