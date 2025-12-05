# FallHelp Documentation

ยินดีต้อนรับสู่เอกสารของโปรเจค FallHelp — คู่มือสั้นๆ สำหรับผู้อ่านใหม่เพื่อทำความเข้าใจโปรเจค และลิงก์ไปยังไฟล์รายงาน/เอกสารทั้งหมด

---

## 🔎 ภาพรวมสั้นๆ

FallHelp คือระบบตรวจจับการหกล้มของผู้สูงอายุแบบ Real-time ประกอบด้วย:

- **Backend:** Node.js + Express + TypeScript + PostgreSQL/TimescaleDB + MQTT + Socket.io
- **Mobile App:** React Native + Expo (✅ Complete)
- **Admin Panel:** Vite + React + TypeScript + TailwindCSS (✅ Complete)
- **IoT:** ESP32 + Accelerometer + Heart Rate

**สถานะโปรเจค:** ✅ Mobile App และ Admin Panel เสร็จสมบูรณ์ (December 5, 2025 - v1.3.0)

ภาพรวมเชิงเทคนิคและการตั้งค่าแบบรวบรัดอยู่ใน README หลักของโปรเจค (root) ซึ่งยังคงเป็นแหล่งข้อมูลหลักสำหรับ Quick Start

---

## 📚 ลิงก์เอกสารสำคัญ

- **Backend Summary:** `backend/docs/IMPLEMENTATION_SUMMARY.md`
- **Backend Troubleshooting:** `backend/docs/TROUBLESHOOTING.md`
- **Mobile Progress:** `mobile/docs/progress/PROGRESS.md`
- **Mobile Troubleshooting:** `mobile/docs/TROUBLESHOOTING.md`
- **Admin Panel:** `admin/docs/README.md` ✨ NEW
- **ESP32 Firmware Guide:** `arduino/README.md`
- **UI Features (Mobile):** `docs/UI_FEATURES.md`
- **Project Structure:** `docs/PROJECT_STRUCTURE.md`
- **Postman Collection:** `backend/postman_collection.json`

---

## 🚀 เริ่มต้นใช้งาน (Quick Start)

- **Backend:** ดูส่วน Quick Start ใน `README.md` (root)
  - ติดตั้ง, config `.env`, migrate, รัน `npm run dev`
- **Mobile:** ดูส่วน Mobile Setup ใน `README.md` (root)
  - `cd mobile && npm install && npm start`
- **ESP32 Firmware:** ดูคู่มือใน `arduino/README.md`

---

## 🧭 เส้นทางการอ่านที่แนะนำ

1. อ่าน `README.md` (root) เพื่อเข้าใจภาพรวม + Quick Start
2. อ่าน `backend/docs/IMPLEMENTATION_SUMMARY.md` เพื่อรายละเอียด Implementation และ API
3. อ่าน `docs/UI_FEATURES.md` เพื่อเข้าใจ Flow/UI ฝั่ง Mobile
4. อ้างอิง `docs/PROJECT_STRUCTURE.md` เพื่อดูแผนผังโค้ดทั้งหมด
5. ตั้งค่า ESP32 Device → `arduino/README.md`

---

## 🧪 การทดสอบเบื้องต้น

- **ทดสอบ API:** ใช้ Postman Collection ที่ `backend/postman_collection.json`
- **ทดสอบ IoT:** ใช้ ESP32 จริงพร้อม MPU6050 และ Pulse Sensor

---

## 🤝 แนวทางการพัฒนา/Commit

- ดู Git Workflow + ชื่อ Commit ที่แนะนำใน `README.md` (root)
- ดู AI Agent Guidelines ใน `AGENT.md` (root)

---

## 🗺️ แผนภาพสถาปัตยกรรม

- แผนภาพ ASCII และคำอธิบายอยู่ใน `README.md` (root)

---

**Last Updated:** December 5, 2025
