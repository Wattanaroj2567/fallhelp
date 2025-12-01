# FallHelp - Fall Detection System for Elderly Care

## ✅ PROJECT STATUS: COMPLETE

**Backend API:** ✅ **100% Complete** (November 26, 2025)  
**Mobile App:** ✅ **100% Complete** (December 1, 2025)  
**Admin Panel:** ✅ **100% Complete** (December 1, 2025)  
**IoT Hardware:** ✅ **Hardware Ready** (ESP32 with firmware)

---

## 📖 Project Description

**FallHelp** เป็นระบบตรวจจับการหกล้มของผู้สูงอายุแบบ Real-time ที่ประกอบด้วย:

- **Backend API** (Node.js + Express + TypeScript) - ✅ **100% Complete**
- **Mobile App** (React Native + Expo) - ✅ **100% Complete**
- **Admin Panel** (React + TypeScript + Vite) - ✅ **100% Complete**
- **IoT Device** (ESP32 + MPU6050 + Pulse Sensor) - ✅ **Hardware Ready**

ระบบสามารถแจ้งเตือนผู้ดูแลทันทีเมื่อตรวจพบการหกล้ม พร้อมข้อมูลตำแหน่ง GPS และสัญญาณชีพของผู้สูงอายุ

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (สำหรับ Backend)
- PostgreSQL with TimescaleDB extension
- MQTT Broker (Mosquitto recommended - optional)
- Expo CLI (สำหรับ Mobile App)

### Backend Setup

```bash
# เข้าโฟลเดอร์ backend
cd backend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env (copy from .env.example)
cp .env.example .env

# แก้ไข .env ให้ตรงกับ environment ของคุณ
nano .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

เซิร์ฟเวอร์จะรันที่ `http://localhost:3333`

### Mobile App Setup

```bash
# เข้าโฟลเดอร์ mobile
cd mobile

# ติดตั้ง dependencies
npm install

# Start Expo development server
npm start
```

---

## 📁 Project Structure

```
fallhelp/
├── backend/              # Backend API (Express + TypeScript)
│   ├── prisma/          # Database schema & migrations
│   ├── src/
│   │   ├── utils/       # Utility functions
│   │   ├── types/       # TypeScript types
│   │   ├── middlewares/ # Express middlewares
│   │   ├── services/    # Business logic
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── iot/         # MQTT + Socket.io
│   │   ├── app.ts       # Express app
│   │   └── server.ts    # HTTP server
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/              # Mobile App (React Native + Expo)
│   ├── app/            # App screens & navigation
│   ├── components/     # Reusable components
│   ├── assets/         # Images, fonts, etc.
│   ├── package.json
│   └── tsconfig.json
│
└── README.md           # This file
```

---

## 🛠️ Technology Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express v5
- **Language:** TypeScript
- **Database:** PostgreSQL + TimescaleDB
- **ORM:** Prisma
- **Real-time:** Socket.io, MQTT
- **Authentication:** JWT
- **Push Notifications:** Expo Push Notification API
- **Logging:** Debug library with namespaces

### Mobile

- **Framework:** React Native
- **Platform:** Expo
- **Navigation:** Expo Router
- **State Management:** (TBD)
- **UI Library:** (TBD)

### IoT

- **Microcontroller:** ESP32
- **Sensors:** MPU6050 (Accelerometer), MAX30102 (Heart Rate)
- **Protocol:** MQTT
- **WiFi:** ESP32 built-in

---

## 📡 System Architecture

```
┌─────────────┐      MQTT       ┌──────────────┐      REST API     ┌────────────┐
│  IoT Device │ ───────────────> │   Backend    │ <──────────────── │ Mobile App │
│   (ESP32)   │                  │   Server     │                   │  (Expo)    │
└─────────────┘                  └──────────────┘                   └────────────┘
      │                                  │                                  │
      │                                  │                                  │
      └──────── Fall Detection ──────────┤                                  │
                                         │                                  │
                                    ┌────▼────┐                             │
                                    │PostgreSQL│                            │
                                    │TimescaleDB│                           │
                                    └─────────┘                             │
                                         │                                  │
                                         │                                  │
                                    ┌────▼────────┐                         │
                                    │   Socket.io  │ ◄───────────────────────┘
                                    │  Real-time   │
                                    └──────────────┘
                                         │
                                         ▼
                                    ┌────────────┐
                                    │ Expo Push  │
                                    │Push Notify │
                                    └────────────┘
```

---

## 📊 Key Features

### ✅ Implemented (Backend)

- [x] User Authentication (JWT)
- [x] Multi-user elder management (OWNER/VIEWER roles)
- [x] Device pairing with QR code
- [x] Fall detection event logging
- [x] Heart rate monitoring with alerts
- [x] Real-time notifications (Socket.io)
- [x] IoT communication (MQTT)
- [x] Push notifications (Expo Push API)
- [x] Time-series data storage (TimescaleDB)
- [x] Event statistics (Daily/Monthly)
- [x] ESP32 firmware with Arduino IDE
- [x] Admin dashboard API

### 🚧 To Be Implemented (Mobile)

- [ ] User authentication UI
- [ ] Elder management UI
- [ ] Device pairing with QR scanner
- [ ] Real-time event monitoring
- [ ] Event timeline
- [ ] Statistics dashboard
- [ ] Push notification handling
- [ ] Emergency contact management

---

## 📚 Documentation

### Backend API

สำหรับรายละเอียด API endpoints, IoT communication, และวิธีใช้งาน:

- [📖 Backend Implementation Summary](./backend/docs/IMPLEMENTATION_SUMMARY.md)

### API Endpoints

- **Authentication:** `/api/auth/*`
- **Users:** `/api/users/*`
- **Elders:** `/api/elders/*`
- **Devices:** `/api/devices/*`
- **Events:** `/api/events/*`
- **Emergency Contacts:** `/api/elders/:elderId/contacts/*`
- **Admin:** `/api/admin/*`

ดู API documentation เต็มรูปแบบได้ใน [IMPLEMENTATION_SUMMARY.md](./backend/docs/IMPLEMENTATION_SUMMARY.md)

---

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Test REST API with HTTP client
# (Postman, Thunder Client, Insomnia, etc.)

# Start backend server
npm run dev
```

### IoT Testing (ESP32)

ดู `arduino/README.md` สำหรับการตั้งค่า ESP32 และการทดสอบกับ MQTT broker

### Mobile Testing

```bash
cd mobile
npm start
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code for physical device
```

---

## 🔐 Environment Variables

### Backend `.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fallhelp"
PORT=3333
JWT_SECRET="your-secret-key"
CORS_ORIGIN="http://localhost:8081"
MQTT_BROKER_URL="mqtt://localhost:1883"
DEBUG="fallhelp:*"
```

**Environment Variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Backend server port (default: 3333)
- `JWT_SECRET` - Secret key for JWT authentication
- `CORS_ORIGIN` - Frontend URL for CORS (use `FRONTEND_URL` in production)
- `MQTT_BROKER_URL` - MQTT broker connection string
- `DEBUG` - Debug namespaces (`fallhelp:*` for all, `fallhelp:mqtt:*` for MQTT only)

ดู `.env.example` สำหรับตัวอย่างเต็มรูปแบบ

---

## 📝 Development Timeline

- **Phase 1-11:** Backend Development (Nov 24-25, 2025) ✅ **COMPLETED**
- **Phase 12-15:** Mobile App Development (TBD) 🚧 **IN PROGRESS**
- **Phase 16-18:** IoT Device Development (TBD) 🚧 **IN PROGRESS**
- **Phase 19:** Integration Testing (TBD) ⏳ **PENDING**
- **Phase 20:** Deployment (TBD) ⏳ **PENDING**

---

## 🤝 Contributing

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Message Convention

```
Add: เพิ่มฟีเจอร์ใหม่
Fix: แก้ไข bug
Update: อัพเดทโค้ดที่มีอยู่แล้ว
Remove: ลบโค้ดที่ไม่ใช้แล้ว
Docs: อัพเดทเอกสาร
Test: เพิ่ม/แก้ไข tests
```

---

## 📜 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Developer:** Tawan (Senior Project 2024-2025)
- **Advisor:** (TBD)
- **University:** (TBD)

---

## 🙏 Acknowledgments

- **GitHub Copilot** (Claude Sonnet 4.5) - AI Assistant for code development
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **TimescaleDB** - Time-series database
- **Socket.io** - Real-time communication
- **Expo** - React Native development platform

---

## 📞 Contact

สำหรับคำถามหรือข้อเสนอแนะ:

- GitHub: [@Wattanaroj2567](https://github.com/Wattanaroj2567)

---

## 🎉 Status

**Backend:** ✅ **PRODUCTION READY** (100% Complete)  
**Mobile App:** 🚧 **IN DEVELOPMENT**  
**IoT Device:** 🚧 **IN DEVELOPMENT**

**Last Updated:** November 25, 2025
