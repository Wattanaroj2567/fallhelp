# FallHelp Project Structure

ระบบช่วยเหลือผู้สูงอายุด้วย IoT - ตรวจจับการหกล้มและวัดชีพจรแบบเรียลไทม์

---

## Tech Stack

| ส่วน            | เทคโนโลยี                                          |
| --------------- | -------------------------------------------------- |
| **Mobile App**  | Expo (React Native), TypeScript, Expo Router       |
| **Backend**     | Node.js, Express, Prisma, PostgreSQL + TimescaleDB |
| **Admin Panel** | Vite, React, TypeScript, TailwindCSS               |
| **IoT Device**  | ESP32 + MPU6050 + Pulse Sensor XD-58C              |

---

## Folder Structure

```
fallhelp/
├── README.md                 # Project overview
├── CHANGELOG.md              # Version history
├── AGENT.md                  # AI agent guidelines
├── .gitignore
│
├── backend/                  # Express.js Backend
│   ├── src/
│   │   ├── server.ts         # HTTP + Socket.io + MQTT
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API endpoints
│   │   ├── middlewares/      # Auth, validation, rate limit
│   │   ├── utils/            # JWT, password, push notification
│   │   └── iot/              # MQTT + Socket.io handlers
│   └── prisma/               # Database schema & migrations
│
├── mobile/                   # React Native/Expo App
│   ├── app/                  # Expo Router screens
│   │   ├── (auth)/           # Login, Register, Forgot Password
│   │   ├── (tabs)/           # Dashboard, History, Settings
│   │   ├── (setup)/          # First-time setup wizard
│   │   └── (features)/       # Elder, Device, Emergency, etc.
│   ├── components/           # Reusable UI components
│   ├── services/             # API & Socket.io services
│   ├── hooks/                # Custom React hooks
│   ├── store/                # Zustand state management
│   └── constants/            # Colors, Config, Thresholds
│
├── admin/                    # Vite + React Admin Panel
│   └── src/
│       ├── pages/            # Login, Dashboard, Users, Devices
│       ├── components/       # Reusable components
│       ├── context/          # Auth context
│       └── services/         # API services
│
├── arduino/                  # ESP32 Firmware (Future)
│
└── docs/                     # Documentation
    ├── architecture/         # System architecture docs
    ├── progress/             # Development progress
    └── references/           # External references
```

---

## Quick Start

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

### Admin

```bash
cd admin
npm install
npm run dev
```

---

## API Summary

| หมวด                  | Endpoints                                                 |
| --------------------- | --------------------------------------------------------- |
| **Auth**              | register, login, forgot-password, reset-password, profile |
| **Elder**             | CRUD, summary                                             |
| **Device**            | pair, unpair, wifi-config, status                         |
| **Event**             | list, summary, monthly report                             |
| **Emergency Contact** | CRUD, reorder                                             |
| **Notification**      | list, mark read, delete                                   |
| **Member**            | invite, list, remove, update role                         |
| **Feedback**          | create, list (admin), update status                       |
| **Admin**             | register device, dashboard, device list                   |

---

## Real-time Communication

### MQTT (IoT → Backend)

| Topic                   | เหตุการณ์      |
| ----------------------- | -------------- |
| `device/{id}/fall`      | ตรวจพบการล้ม   |
| `device/{id}/heartrate` | ค่าชีพจร       |
| `device/{id}/status`    | Online/Offline |

### Socket.io (Backend → Mobile)

| Event              | เหตุการณ์        |
| ------------------ | ---------------- |
| `fall:detected`    | แจ้งเตือนการล้ม  |
| `heartrate:update` | อัปเดตชีพจร      |
| `device:status`    | สถานะอุปกรณ์     |
| `notification:new` | การแจ้งเตือนใหม่ |

---

## Database Models

| Model              | คำอธิบาย                               |
| ------------------ | -------------------------------------- |
| `User`             | ผู้ใช้งาน (Caregiver/Admin)            |
| `Elder`            | ข้อมูลผู้สูงอายุ                       |
| `Device`           | อุปกรณ์ IoT                            |
| `DeviceConfig`     | ตั้งค่า Wi-Fi และ Threshold            |
| `Event`            | เหตุการณ์ (Fall, HR) - TimescaleDB     |
| `EmergencyContact` | ผู้ติดต่อฉุกเฉิน                       |
| `Notification`     | การแจ้งเตือน                           |
| `UserElderAccess`  | สิทธิ์การเข้าถึง (Owner/Editor/Viewer) |
| `Feedback`         | Feedback และ Repair Request            |

---

## IoT Hardware

| Component              | รุ่น             | หน้าที่        |
| ---------------------- | ---------------- | -------------- |
| **MCU**                | ESP32 DevKit V4  | ประมวลผลหลัก   |
| **Accelerometer/Gyro** | MPU6050          | ตรวจจับการล้ม  |
| **Pulse Sensor**       | XD-58C           | วัดชีพจร       |
| **Battery**            | LiPo 3.7V 450mAh | แหล่งพลังงาน   |
| **Charger**            | TP4056           | ชาร์จแบตเตอรี่ |
| **Speaker**            | Grove Speaker    | เสียงเตือน     |

---

**Last Updated:** December 13, 2025
