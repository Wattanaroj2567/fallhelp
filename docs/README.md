# FallHelp Documentation Index

# สารบัญเอกสารโปรเจค FallHelp

เอกสารนี้เป็นศูนย์รวมเอกสารหลักของโปรเจค FallHelp ทั้งหมด  
This directory contains the single source of truth for all project documentation.

---

## Architecture (สถาปัตยกรรมและโครงสร้างระบบ)

| เอกสาร                                                             | คำอธิบาย                                                       |
| :----------------------------------------------------------------- | :------------------------------------------------------------- |
| [Project Structure](architecture/PROJECT_STRUCTURE.md)             | โครงสร้างโปรเจค, Tech Stack, Directory Layout, Database Schema |
| [Functional Requirements](architecture/FUNCTIONAL_REQUIREMENTS.md) | ความต้องการเชิงฟังก์ชัน, Actors, Use Cases                     |
| [System Design](architecture/SYSTEM_DESIGN.md)                     | การออกแบบระบบ: Database, Mobile, Admin, Notification           |
| [Development Plan](architecture/DEVELOPMENT_PLAN.md)               | แผนพัฒนา 4 ระยะ สำหรับ Software และ Hardware                   |

---

## Features (ฟีเจอร์และคุณสมบัติ)

| เอกสาร                                         | คำอธิบาย                                   |
| :--------------------------------------------- | :----------------------------------------- |
| [UI Features & Flow](features/UI_FEATURES.md)  | UI/UX ทั้งหมดของ Mobile App (1,294 บรรทัด) |
| [Admin Panel](features/ADMIN_PANEL.md)         | ฟีเจอร์และ Endpoints ของ Admin Panel       |
| [Feedback System](features/FEEDBACK_SYSTEM.md) | ระบบรับความคิดเห็นจากผู้ใช้                |

---

## Guides (คู่มือการใช้งาน)

| เอกสาร                                                       | คำอธิบาย                      |
| :----------------------------------------------------------- | :---------------------------- |
| [Device Pairing Flow](guides/DEVICE_PAIRING_FLOW.md)         | ขั้นตอนการจับคู่อุปกรณ์ ESP32 |
| [Expo Push Notification](guides/EXPO_PUSH_NOTIFICATION.md)   | การตั้งค่า Push Notification  |
| [Production Deployment](guides/PRODUCTION_DEPLOYMENT.md)     | การ Deploy ขึ้น Production    |
| [Troubleshooting Backend](guides/TROUBLESHOOTING_BACKEND.md) | แก้ปัญหาฝั่ง Backend          |
| [Troubleshooting Mobile](guides/TROUBLESHOOTING_MOBILE.md)   | แก้ปัญหาฝั่ง Mobile           |

---

## Testing (การทดสอบ)

| เอกสาร                                                      | คำอธิบาย               |
| :---------------------------------------------------------- | :--------------------- |
| [Test Completion Report](testing/TEST_COMPLETION_REPORT.md) | ผลการทดสอบและ Coverage |

---

## References (เอกสารอ้างอิง)

| เอกสาร                                           | คำอธิบาย                           |
| :----------------------------------------------- | :--------------------------------- |
| [API Documentation](API_DOCUMENTATION.md)        | เอกสาร API ครบทุก Endpoints        |
| [SiSFall Dataset Reference](references/SISFALL_DATASET.md) | ข้อมูลอ้างอิงและแนวทาง Fall Detection (ใช้ Threshold จากงานวิจัย) |

---

## Progress (บันทึกความคืบหน้า)

| เอกสาร                                           | คำอธิบาย                    |
| :----------------------------------------------- | :-------------------------- |
| [Backend Progress](progress/BACKEND_PROGRESS.md) | ประวัติการพัฒนา Backend     |
| [Mobile Progress](progress/MOBILE_PROGRESS.md)   | ประวัติการพัฒนา Mobile App  |
| [Admin Progress](progress/ADMIN_PROGRESS.md)     | ประวัติการพัฒนา Admin Panel |
| [Doc Progress](progress/DOC_PROGRESS.md)         | ความคืบหน้าการจัดทำเอกสาร   |

---

---

## Arduino/Hardware Documentation

| เอกสาร | คำอธิบาย |
| :----- | :------- |
| [`arduino/README.md`](../arduino/README.md) | ESP32 Firmware overview และ Captive Portal setup |
| [`arduino/docs/README.md`](../arduino/docs/README.md) | Arduino Documentation Index |
| [`arduino/docs/SENSORS_README.md`](../arduino/docs/SENSORS_README.md) | Sensor modules documentation (MPU6050, Pulse, False Alarm Cancel, Power, Alert) |
| [`arduino/docs/FALL_DETECTION_TUNING.md`](../arduino/docs/FALL_DETECTION_TUNING.md) | Fall detection testing & tuning guide (รวมแนวทางที่ใช้) |

---

## Bug & Error Tracking

**ไฟล์สำคัญ:** [`bug-fix-errorProblems.txt`](../bug-fix-errorProblems.txt)

ไฟล์นี้ใช้เก็บ Log ของ Bug และ Error ที่พบระหว่างการพัฒนา โดยผู้พัฒนาจะเป็นคนบันทึกเอง เพื่อให้สามารถ Fix และ Debug ได้สะดวก

**วิธีใช้งาน:**
- บันทึก Error messages, Stack traces, หรือปัญหาที่เจอ
- ระบุ Component/Layer ที่เกิดปัญหา (Backend/Mobile/Admin/Arduino)
- บันทึกวิธีแก้ไข (ถ้าแก้แล้ว)
- ใช้เป็น Reference สำหรับปัญหาที่เจอซ้ำ

---

**Last Updated:** December 15, 2025
