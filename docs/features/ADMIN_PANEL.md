# Admin Panel Documentation

ระบบ Admin Panel สำหรับผู้ดูแลระบบ FallHelp

---

## Tech Stack

| เทคโนโลยี   | รุ่น                  |
| ----------- | --------------------- |
| Vite        | React 18              |
| TypeScript  | -                     |
| TailwindCSS | -                     |
| React Query | @tanstack/react-query |

---

## Features

| หน้า          | ฟังก์ชัน                                             |
| ------------- | ---------------------------------------------------- |
| **Login**     | เข้าสู่ระบบ Admin (ไม่มี Register สาธารณะ)           |
| **Dashboard** | แสดงภาพรวม (Users, Elders, Devices, Recent Events)   |
| **Users**     | ดูรายชื่อผู้ใช้งานทั้งหมด                            |
| **Elders**    | ดูรายชื่อผู้สูงอายุและข้อมูลการดูแล                  |
| **Devices**   | ลงทะเบียน, สร้าง QR, ดูรายการ, ลบอุปกรณ์             |
| **Feedback**  | ดูและจัดการ Feedback (PENDING → REVIEWED → RESOLVED) |

---

## Quick Start

```bash
cd admin
npm install
npm run dev     # http://localhost:5173
```

---

## สร้าง Admin Account

> ⚠️ **ไม่มีหน้า Register สาธารณะ** - ใช้ Seed Script เพื่อความปลอดภัย

### 1. ตั้งค่า Environment Variables

เพิ่มใน `backend/.env`:

```env
ADMIN_EMAIL="admin@fallhelp.com"
ADMIN_PASSWORD="YourSecurePassword123!"
ADMIN_FIRST_NAME="System"
ADMIN_LAST_NAME="Admin"
```

### 2. รัน Seed Script

```bash
cd backend
npx prisma db seed
```

### 3. Login

ไปที่ `http://localhost:5173` แล้ว Login ด้วย credentials ที่ตั้งไว้

---

## API Endpoints

> รายละเอียด API ทั้งหมดดูได้ที่: **[API_DOCUMENTATION.md](../API_DOCUMENTATION.md)**

---

**Last Updated:** December 13, 2025
