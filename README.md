ไ# FallHelp - Fall Detection System for Elderly Care

# ระบบตรวจจับการหกล้มสำหรับดูแลผู้สูงอายุ

---

## Project Status (สถานะโปรเจค)

| Component    | Status   | Date              |
| ------------ | -------- | ----------------- |
| Backend API  | Complete | November 26, 2025 |
| Mobile App   | Complete | December 1, 2025  |
| Admin Panel  | Complete | December 1, 2025  |
| IoT Hardware | Complete | December 5, 2025  |

---

## Project Description (คำอธิบายโปรเจค)

**FallHelp** เป็นระบบตรวจจับการหกล้มของผู้สูงอายุแบบ Real-time ที่ประกอบด้วย:

- **Backend API** - Node.js + Express + TypeScript
- **Mobile App** - React Native + Expo
- **Admin Panel** - React + TypeScript + Vite
- **IoT Device** - ESP32 + MPU6050 + Pulse Sensor

ระบบสามารถแจ้งเตือนผู้ดูแลทันทีเมื่อตรวจพบการหกล้ม พร้อมข้อมูลชีพจรของผู้สูงอายุ

---

## Quick Start (เริ่มต้นใช้งาน)

### Prerequisites

- Node.js 18+
- PostgreSQL with TimescaleDB
- MQTT Broker (Mosquitto - optional)
- Expo CLI

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Server runs at `http://localhost:3333`

### Mobile App Setup

```bash
cd mobile
npm install
npm start
```

### Admin Panel Setup

```bash
cd admin
npm install
npm run dev
```

---

## Project Structure (โครงสร้างโปรเจค)

```
fallhelp/
├── backend/              # Backend API (Express + TypeScript)
│   ├── prisma/           # Database schema & migrations
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middlewares/  # Express middlewares
│   │   ├── iot/          # MQTT + Socket.io
│   │   └── utils/        # Utility functions
│   └── package.json
│
├── mobile/               # Mobile App (React Native + Expo)
│   ├── app/              # App screens & navigation
│   ├── components/       # Reusable components
│   ├── services/         # API services
│   └── package.json
│
├── admin/                # Admin Panel (React + Vite)
│   ├── src/
│   │   ├── pages/        # Page components
│   │   └── components/   # UI components
│   └── package.json
│
├── arduino/              # ESP32 Firmware
│
├── docs/                 # Documentation (consolidated)
│   ├── README.md         # Documentation index
│   ├── architecture/     # System design docs
│   ├── features/         # Feature documentation
│   ├── guides/           # Setup & troubleshooting
│   ├── progress/         # Development history
│   └── testing/          # Test reports
│
└── README.md             # This file
```

---

## Technology Stack (เทคโนโลยีที่ใช้)

### Backend

| Technology               | Purpose                |
| ------------------------ | ---------------------- |
| Node.js + Express v5     | Web framework          |
| TypeScript               | Type safety            |
| PostgreSQL + TimescaleDB | Database + Time-series |
| Prisma ORM               | Database ORM           |
| Socket.io                | Real-time updates      |
| MQTT                     | IoT communication      |
| JWT                      | Authentication         |
| Expo Push API            | Push notifications     |

### Mobile

| Technology         | Purpose              |
| ------------------ | -------------------- |
| React Native       | Mobile framework     |
| Expo SDK 52        | Development platform |
| Expo Router        | File-based routing   |
| React Native Paper | UI components        |

### Admin Panel

| Technology  | Purpose       |
| ----------- | ------------- |
| React       | UI framework  |
| Vite        | Build tool    |
| TypeScript  | Type safety   |
| TailwindCSS | Styling       |
| React Query | Data fetching |

### IoT Hardware

| Component           | Purpose                        |
| ------------------- | ------------------------------ |
| ESP32               | Microcontroller                |
| MPU6050             | Accelerometer (Fall Detection) |
| Pulse Sensor XD-58C | Heart Rate Monitor             |
| MQTT                | Communication protocol         |

---

## System Architecture (สถาปัตยกรรมระบบ)

```
┌─────────────┐      MQTT       ┌──────────────┐      REST API     ┌────────────┐
│  IoT Device │ ───────────────→ │   Backend    │ ←──────────────── │ Mobile App │
│   (ESP32)   │                  │   Server     │                   │  (Expo)    │
└─────────────┘                  └──────────────┘                   └────────────┘
                                        │
                                   Socket.io
                                        │
                                        ▼
                                ┌──────────────┐
                                │ Push Notify  │
                                │   (Expo)     │
                                └──────────────┘
```

---

## Key Features (ฟีเจอร์หลัก)

### Backend

- User Authentication (JWT)
- Multi-user Elder Management (Owner/Editor/Viewer)
- Device Pairing with QR Code
- Fall Detection Event Logging
- Heart Rate Monitoring with Alerts
- Real-time Notifications (Socket.io)
- IoT Communication (MQTT)
- Push Notifications (Expo Push API)
- Time-series Data Storage (TimescaleDB)
- Event Summary (Daily/Monthly)
- Admin Dashboard API

### Mobile App

- User Authentication UI
- Elder Management UI
- Device Pairing with QR Scanner
- Real-time Event Monitoring
- Event Timeline
- Dashboard Overview
- Push Notification Handling
- Emergency Contact Management
- Notification History
- Multi-user Access

### Admin Panel

- Admin Authentication
- Dashboard Overview
- User Management
- Elder Management
- Device Management
- Feedback Management

---

## Documentation (เอกสาร)

All documentation is consolidated in `docs/` folder:

| Document                                                            | Description               |
| ------------------------------------------------------------------- | ------------------------- |
| [Documentation Index](./docs/README.md)                             | Central documentation hub |
| [Project Structure](./docs/architecture/PROJECT_STRUCTURE.md)       | Full project layout       |
| [System Design](./docs/architecture/SYSTEM_DESIGN.md)               | Architecture details      |
| [Implementation Summary](./docs/progress/IMPLEMENTATION_SUMMARY.md) | Backend API reference     |

---

## API Endpoints (API หลัก)

| Category           | Endpoint                          |
| ------------------ | --------------------------------- |
| Authentication     | `/api/auth/*`                     |
| Users              | `/api/users/*`                    |
| Elders             | `/api/elders/*`                   |
| Devices            | `/api/devices/*`                  |
| Events             | `/api/events/*`                   |
| Notifications      | `/api/notifications/*`            |
| Emergency Contacts | `/api/elders/:elderId/contacts/*` |
| Admin              | `/api/admin/*`                    |

---

## Environment Variables (ตัวแปรสภาพแวดล้อม)

### Backend `.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fallhelp"
PORT=3333
JWT_SECRET="your-secret-key"
CORS_ORIGIN="http://localhost:8081"
MQTT_BROKER_URL="mqtt://localhost:1883"
DEBUG="fallhelp:*"
```

---

## Testing (การทดสอบ)

### Backend

```bash
cd backend
npm run dev
# Use Postman or similar HTTP client
```

### Mobile

```bash
cd mobile
npm test    # Run Jest tests
npm start   # Start Expo dev server
```

### Admin

```bash
cd admin
npm run dev
```

---

## Development Timeline (ไทม์ไลน์การพัฒนา)

| Phase                  | Date                 | Status   |
| ---------------------- | -------------------- | -------- |
| Backend Development    | Nov 24-26, 2025      | Complete |
| Mobile App Development | Nov 26 - Dec 1, 2025 | Complete |
| IoT Device Development | Dec 1-5, 2025        | Complete |
| Integration Testing    | Dec 5, 2025          | Complete |
| Documentation Refactor | Dec 13, 2025         | Complete |

---

## Contributing (การมีส่วนร่วม)

### Git Workflow

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

### Commit Message Convention

```
Add: เพิ่มฟีเจอร์ใหม่
Fix: แก้ไข bug
Update: อัปเดตโค้ดที่มีอยู่
Remove: ลบโค้ดที่ไม่ใช้
Docs: อัปเดตเอกสาร
```

---

## License

MIT License

---

## Contact

- GitHub: [@Wattanaroj2567](https://github.com/Wattanaroj2567)

---

**Last Updated:** December 13, 2025
