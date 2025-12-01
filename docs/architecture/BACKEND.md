# Backend Documentation Index

หน้านี้เป็นสารบัญย่อยของเอกสารฝั่ง Backend

---

## 📚 เอกสารหลัก

- **Implementation Summary:** `backend/docs/IMPLEMENTATION_SUMMARY.md`

  - รายละเอียด API endpoints ทั้งหมด (45+ endpoints)
  - โครงสร้างโค้ด Backend แบบเต็ม
  - การทำงานของ IoT integration (MQTT + Socket.io)
  - ตัวอย่างการใช้งาน

- **ESP32 Firmware Guide:** `arduino/README.md`
  - วิธีตั้งค่า ESP32 สำหรับ FallHelp
  - Hardware: MPU6050 + Pulse Sensor
  - AP Mode Configuration

---

## 🔄 Feedback System

- **Feedback Routes:** `backend/src/routes/feedbackRoutes.ts`
- **API Endpoints:**
  - `POST /api/feedback` - Submit feedback (User)
  - `GET /api/feedback` - Get all feedback (Admin)
  - `PATCH /api/feedback/:id/status` - Update feedback status (Admin)
- **Documentation:** `docs/FEEDBACK_SYSTEM.md`

---

## 🗄️ Database & Schema

- **Prisma Schema:** `backend/prisma/schema.prisma`
- **Migrations:** `backend/prisma/migrations/`
- **TimescaleDB Setup:** `backend/prisma/timescale-setup.sql`

---

## 🧪 Testing

- **Postman Collection:** `backend/postman_collection.json`
  - Import ใน Postman/Thunder Client
  - ครอบคลุม API endpoints ทั้งหมด

---

## ⚙️ Configuration

- **TypeScript Config:** `backend/tsconfig.json`
- **Prisma Config:** `backend/prisma.config.ts`
- **Environment Variables:** ดูตัวอย่างใน `README.md` (root)

---

## 🚀 Quick Start

```bash
cd backend
npm install
cp .env.example .env
# แก้ไข .env
npx prisma migrate dev
npm run dev
```

---

**Last Updated:** December 1, 2025
