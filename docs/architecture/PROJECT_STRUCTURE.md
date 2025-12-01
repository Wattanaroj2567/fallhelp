# FallHelp Project Structure

> 🎯 ระบบช่วยเหลือผู้สูงอายุด้วย IoT ตรวจจับการหกล้มและวัดอัตราการเต้นหัวใจแบบเรียลไทม์

---

## 📋 Tech Stack

- **Mobile:** Expo (React Native), TypeScript, Expo Router, Axios, Socket.io Client
- **Backend:** Node.js (Express), TypeScript, Prisma ORM, PostgreSQL + TimescaleDB, Socket.io, Expo Push API, MQTT
- **Admin Panel:** Vite + React + TypeScript + TailwindCSS + React Query
- **IoT Device:** ESP32 + MPU6050 (Fall Detection) + Pulse Sensor (Heart Rate)

---

## 🗂️ Project Structure

```
fallhelp/
├── README.md
├── UI_FEATURES.md                    # UI/UX Documentation (Figma Design)
├── PROJECT_STRUCTURE.md              # This file
│
├── backend/                          # Express.js + Prisma Backend
│   ├── .gitignore
│   ├── .env                          # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma.config.ts
│   │
│   ├── src/
│   │   ├── server.ts                 # Main server entry point (HTTP + Socket.io + MQTT)
│   │   ├── app.ts                    # Express app setup
│   │   ├── prisma.ts                 # Prisma client instance
│   │   │
│   │   ├── controllers/              # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── elderController.ts
│   │   │   ├── deviceController.ts
│   │   │   ├── eventController.ts
│   │   │   ├── emergencyContactController.ts
│   │   │   ├── userController.ts
│   │   │   └── adminController.ts
│   │   │
│   │   ├── services/                 # Business logic + Prisma ORM
│   │   │   ├── authService.ts
│   │   │   ├── elderService.ts
│   │   │   ├── deviceService.ts
│   │   │   ├── eventService.ts
│   │   │   ├── notificationService.ts
│   │   │   └── adminService.ts
│   │   │
│   │   ├── routes/                   # API Endpoints
│   │   │   ├── index.ts              # Router aggregation
│   │   │   ├── authRoutes.ts
│   │   │   ├── elderRoutes.ts
│   │   │   ├── deviceRoutes.ts
│   │   │   ├── eventRoutes.ts
│   │   │   ├── emergencyContactRoutes.ts
│   │   │   └── adminRoutes.ts
│   │   │
│   │   ├── middlewares/              # Express middlewares
│   │   │   ├── auth.ts               # JWT verification
│   │   │   ├── validation.ts         # Request validation
│   │   │   ├── errorHandler.ts       # Global error handler
│   │   │   └── rateLimit.ts          # Rate limiting
│   │   │
│   │   ├── utils/                    # Helper functions
│   │   │   ├── jwt.ts                # JWT token utilities
│   │   │   ├── password.ts           # bcrypt utilities
│   │   │   ├── time.ts               # Date/time helpers
│   │   │   ├── qrcode.ts             # QR code generation
│   │   │   └── pushNotification.ts   # Expo Push Notification
│   │   │
│   │   ├── iot/                      # IoT Integration
│   │   │   ├── mqtt/
│   │   │   │   ├── mqttClient.ts     # MQTT broker connection
│   │   │   │   ├── topics.ts         # Topic definitions
│   │   │   │   └── handlers/
│   │   │   │       ├── fallHandler.ts
│   │   │   │       ├── heartRateHandler.ts
│   │   │   │       └── statusHandler.ts
│   │   │   │
│   │   │   └── socket/
│   │   │       ├── socketServer.ts   # Socket.io server
│   │   │       └── events.ts         # Real-time event definitions
│   │   │
│   │   └── types/                    # TypeScript type definitions
│   │       ├── express.d.ts
│   │       └── models.ts
│   │
│   └── prisma/
│       ├── schema.prisma             # Database models
│       └── migrations/
│           └── ...
│
├── admin/                           # Vite + React Admin Panel
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   │
│   └── src/
│       ├── main.tsx                 # Entry point
│       ├── App.tsx                  # Main app component
│       │
│       ├── components/              # Reusable UI components
│       │
│       ├── context/                 # React Context
│       │   └── AuthContext.tsx
│       │
│       ├── layouts/                 # Page layouts
│       │   └── DashboardLayout.tsx
│       │
│       ├── pages/                   # Page components
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Users.tsx
│       │   ├── Elders.tsx
│       │   ├── Devices.tsx
│       │   └── Feedback.tsx
│       │
│       └── services/                # API services
│           └── api.ts
│
│
├── mobile/                           # React Native/Expo Mobile App
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json                      # Expo configuration
│   ├── expo-env.d.ts
│   │
│   ├── app/                          # Expo Router screens
│   │   ├── _layout.tsx               # Root layout
│   │   ├── +html.tsx
│   │   ├── +not-found.tsx
│   │   │
│   │   ├── (auth)/                   # Authentication flow
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   └── otp-verification.tsx
│   │   │
│   │   ├── (tabs)/                   # Main app tabs (Bottom Navigation)
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Dashboard Home
│   │   │   ├── history.tsx           # History & Reports
│   │   │   └── settings.tsx          # Settings
│   │   │
│   │   ├── (setup)/                  # First-time setup flow
│   │   │   ├── empty-state.tsx
│   │   │   ├── step1-elder-info.tsx
│   │   │   ├── step2-device-pairing.tsx
│   │   │   └── step3-wifi-setup.tsx
│   │   │
│   │   ├── (elder)/                  # Elder Management
│   │   │   ├── index.tsx             # Elder list
│   │   │   ├── [id].tsx              # Elder detail
│   │   │   ├── add.tsx
│   │   │   └── edit.tsx
│   │   │
│   │   ├── (device)/                 # Device Management
│   │   │   ├── pair-qr.tsx
│   │   │   ├── pair-manual.tsx
│   │   │   └── wifi-config.tsx
│   │   │
│   │   ├── (emergency)/              # Emergency Contacts
│   │   │   ├── index.tsx
│   │   │   ├── add.tsx
│   │   │   └── [id].tsx
│   │   │
│   │   ├── (events)/                 # Events & Reports
│   │   │   ├── history.tsx
│   │   │   ├── monthly-report.tsx
│   │   │   └── [id].tsx              # Event detail
│   │   │
│   │   ├── (profile)/                # Profile Management
│   │   │   ├── index.tsx
│   │   │   ├── edit.tsx
│   │   │   ├── edit-phone.tsx
│   │   │   ├── edit-email.tsx
│   │   │   └── edit-password.tsx
│   │   │
│   │   └── (members)/                # Multi-User Access
│   │       ├── index.tsx
│   │       ├── invite.tsx
│   │       └── [id].tsx
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatusCard.tsx
│   │   │   ├── ElderInfoCard.tsx
│   │   │   └── EmergencyButton.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── EventList.tsx
│   │   │   └── EventItem.tsx
│   │   │
│   │   └── Themed.tsx
│   │
│   ├── services/                     # API & WebSocket services
│   │   ├── api.ts                    # Axios instance
│   │   ├── authService.ts
│   │   ├── elderService.ts
│   │   ├── deviceService.ts
│   │   ├── eventService.ts
│   │   ├── socketService.ts          # Socket.io client
│   │   └── notificationService.ts    # Expo Push integration
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── useRealtime.ts
│   │   └── useNotifications.ts
│   │
│   ├── store/                        # State management (Zustand/Context)
│   │   ├── authStore.ts
│   │   ├── elderStore.ts
│   │   └── notificationStore.ts
│   │
│   ├── constants/                    # App constants
│   │   ├── Colors.ts
│   │   ├── Config.ts                 # API_URL, SOCKET_URL
│   │   └── Thresholds.ts             # Heart rate thresholds
│   │
│   ├── types/                        # TypeScript types
│   │   └── index.ts
│   │
│   ├── assets/                       # Static assets
│   │   ├── fonts/
│   │   └── images/
│   │
│   └── utils/                        # Utility functions
│       ├── formatters.ts
│       └── validators.ts
│
│
└── .git/                             # Git repository
```

---

## 🗄️ Database Schema (Prisma)

> ⚠️ **สำคัญ:** ระบบไม่มีการลบข้อมูลผู้สูงอายุ (Hard Delete) - ใช้ `isActive = false` แทน (Soft Delete)

### Core Models

```prisma
// ==================== USER & AUTH ====================

model User {
  id                String              @id @default(uuid())
  email             String              @unique
  password          String
  firstName         String
  lastName          String
  phone             String?
  profileImage      String?
  role              UserRole            @default(CAREGIVER)
  isActive          Boolean             @default(true)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // Relations
  elders            UserElderAccess[]
  notifications     Notification[]
  authOtps          AuthOtp[]
  feedbacks         Feedback[]
}

enum UserRole {
  ADMIN
  CAREGIVER
}

model AuthOtp {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  code        String
  purpose     OtpPurpose
  expiresAt   DateTime
  isUsed      Boolean     @default(false)
  createdAt   DateTime    @default(now())
}

enum OtpPurpose {
  PASSWORD_RESET
  EMAIL_VERIFICATION
  PHONE_VERIFICATION
}

// ==================== ELDER & DEVICE ====================

model Elder {
  id                String              @id @default(uuid())
  firstName         String
  lastName          String
  dateOfBirth       DateTime?
  gender            Gender?
  weight            Float?              // kg
  height            Float?              // cm
  diseases          String[]            // โรคประจำตัว
  profileImage      String?
  bloodType         String?
  allergies         String[]
  medications       String[]
  notes             String?
  isActive          Boolean             @default(true)  // ⚠️ Soft Delete
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // Relations
  device            Device?
  caregivers        UserElderAccess[]
  emergencyContacts EmergencyContact[]
  events            Event[]
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

model Device {
  id              String        @id @default(uuid())
  deviceCode      String        @unique  // รหัสอุปกรณ์สำหรับ QR Code
  serialNumber    String        @unique
  elderId         String?       @unique
  elder           Elder?        @relation(fields: [elderId], references: [id], onDelete: SetNull)
  status          DeviceStatus  @default(INACTIVE)
  lastOnline      DateTime?
  firmwareVersion String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  config          DeviceConfig?
  events          Event[]
}

enum DeviceStatus {
  ACTIVE          // เชื่อมต่อแล้ว
  INACTIVE        // ไม่ได้เชื่อมต่อ
  MAINTENANCE     // อยู่ระหว่างซ่อม
  PAIRED          // ผูกกับผู้สูงอายุแล้ว
  UNPAIRED        // ยังไม่ได้ผูก
}

model DeviceConfig {
  id              String    @id @default(uuid())
  deviceId        String    @unique
  device          Device    @relation(fields: [deviceId], references: [id], onDelete: Cascade)

  // Wi-Fi Settings
  ssid            String?
  wifiPassword    String?   // เข้ารหัสก่อนเก็บ
  wifiStatus      WifiStatus @default(DISCONNECTED)
  ipAddress       String?

  // Sensor Thresholds
  fallThreshold   Float     @default(2.5)  // g-force threshold
  hrLowThreshold  Int       @default(50)   // BPM
  hrHighThreshold Int       @default(120)  // BPM

  // Notification Settings
  fallCancelTime  Int       @default(30)   // วินาที (ปุ่มยกเลิกภายใน 30 วินาที)

  updatedAt       DateTime  @updatedAt
}

enum WifiStatus {
  CONNECTED
  DISCONNECTED
  CONFIGURING
  ERROR
}

// ==================== EMERGENCY CONTACTS ====================

model EmergencyContact {
  id          String    @id @default(uuid())
  elderId     String
  elder       Elder     @relation(fields: [elderId], references: [id], onDelete: Cascade)
  name        String
  phone       String
  relationship String?  // เช่น "ลูก", "หลาน", "เพื่อนบ้าน"
  priority    Int       // 1 = สำคัญที่สุด, 2 = รอง, 3 = รองลงมา
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([elderId, priority])  // ห้ามมี priority ซ้ำในคนเดียวกัน
}

// ==================== EVENTS (TimescaleDB) ====================

model Event {
  id            String      @id @default(uuid())
  elderId       String
  elder         Elder       @relation(fields: [elderId], references: [id], onDelete: Cascade)
  deviceId      String
  device        Device      @relation(fields: [deviceId], references: [id], onDelete: Cascade)

  type          EventType
  severity      EventSeverity @default(NORMAL)
  value         Float?      // ค่า BPM (null ถ้าเป็น FALL)

  // Fall Detection Specific (ปุ่มยกเลิกภายใน 30 วินาที - ตาม UI_FEATURES.md)
  isCancelled   Boolean     @default(false)
  cancelledAt   DateTime?

  // Notification
  isNotified    Boolean     @default(false)
  notifiedAt    DateTime?

  // Sensor Raw Data (optional - สำหรับ ML analysis)
  accelerometerX Float?
  accelerometerY Float?
  accelerometerZ Float?
  gyroscopeX     Float?
  gyroscopeY     Float?
  gyroscopeZ     Float?

  metadata      Json?       // เก็บข้อมูลเพิ่มเติมแบบ flexible
  timestamp     DateTime    @default(now())

  // Relations
  notifications Notification[]

  @@index([elderId, timestamp(sort: Desc)])
  @@index([deviceId, timestamp(sort: Desc)])
  @@index([type, timestamp(sort: Desc)])
  // TimescaleDB hypertable for time-series data
}

enum EventType {
  FALL
  HEART_RATE_HIGH
  HEART_RATE_LOW
  HEART_RATE_NORMAL
  DEVICE_OFFLINE
  DEVICE_ONLINE
  SENSOR_ERROR
}

enum EventSeverity {
  CRITICAL    // ฉุกเฉิน (หกล้ม, HR สูง/ต่ำมาก)
  WARNING     // เตือน (HR เริ่มผิดปกติ)
  NORMAL      // ปกติ (HR ปกติ, เชื่อมต่อสำเร็จ)
  INFO        // ข้อมูลทั่วไป
}

// ==================== NOTIFICATIONS ====================

model Notification {
  id          String            @id @default(uuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventId     String?
  event       Event?            @relation(fields: [eventId], references: [id], onDelete: SetNull)

  type        NotificationType
  title       String
  message     String
  isRead      Boolean           @default(false)
  readAt      DateTime?

  // Expo Push Notification
  pushToken   String?
  isSent      Boolean           @default(false)
  sentAt      DateTime?

  createdAt   DateTime          @default(now())
}

enum NotificationType {
  FALL_DETECTED           // ตรวจพบการหกล้ม
  HEART_RATE_ALERT        // ชีพจรสูง/ต่ำกว่าปกติ
  DEVICE_OFFLINE          // อุปกรณ์ขาดการเชื่อมต่อ
  DEVICE_ONLINE           // อุปกรณ์เชื่อมต่อแล้ว
  SYSTEM_UPDATE           // แจ้งอัปเดตระบบ
  EMERGENCY_CONTACT_CALLED // มีการโทรฉุกเฉิน
}

// ==================== MULTI-USER ACCESS ====================

model UserElderAccess {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  elderId     String
  elder       Elder       @relation(fields: [elderId], references: [id], onDelete: Cascade)
  accessLevel AccessLevel @default(VIEWER)
  grantedAt   DateTime    @default(now())

  @@unique([userId, elderId])
}

enum AccessLevel {
  OWNER       // เจ้าของหลัก - เห็นทุกอย่าง แต่ห้ามลบผู้สูงอายุ (ใช้ soft delete แทน)
  VIEWER      // ดูได้อย่างเดียว - ตาม UI_FEATURES.md Section 8.3
}

// ==================== FEEDBACK ====================

model Feedback {
  id        String         @id @default(uuid())
  userId    String?
  user      User?          @relation(fields: [userId], references: [id], onDelete: SetNull)
  message   String
  status    FeedbackStatus @default(PENDING)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  @@map("feedbacks")
}

enum FeedbackStatus {
  PENDING
  REVIEWED
  RESOLVED
}
```

### 🔐 Data Protection Rules

**1. ห้ามลบข้อมูลผู้สูงอายุ (No Hard Delete on Elder)**

```typescript
// ❌ ห้าม: DELETE FROM elders WHERE id = ?
// ✅ ใช้ Soft Delete แทน
await prisma.elder.update({
  where: { id: elderId },
  data: { isActive: false },
});

// ดึงข้อมูลเฉพาะที่ active
const elders = await prisma.elder.findMany({
  where: { isActive: true },
});
```

**2. Cascade Delete Protection**

- ลบ User → ลบ AuthOtp, Notification, UserElderAccess (ไม่กระทบ Elder)
- ลบ Device → ลบ DeviceConfig, Event (ไม่กระทบ Elder)
- ลบ Elder → ใช้ soft delete (`isActive = false`) เท่านั้น

**3. Access Level Control**

- `OWNER`: ญาติหลัก - ทำทุกอย่างได้ ยกเว้นการลบผู้สูงอายุ
- `VIEWER`: สมาชิกที่ถูกเชิญ - ดูข้อมูลอย่างเดียว (ตาม UI_FEATURES.md)

---## 🔌 API Endpoints Summary

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### Elder Management

- `GET /api/elders`
- `POST /api/elders`
- `GET /api/elders/:id`
- `PUT /api/elders/:id`
- `DELETE /api/elders/:id`

### Device Management

- `POST /api/devices/pair`
- `POST /api/devices/:deviceId/wifi`
- `GET /api/devices/:deviceId/status`
- `DELETE /api/devices/:deviceId`

### Events

- `GET /api/elders/:elderId/events`
- `GET /api/elders/:elderId/events/summary`
- `PUT /api/events/:eventId/resolve`

### Emergency Contacts

- `GET /api/elders/:elderId/emergency-contacts`
- `POST /api/elders/:elderId/emergency-contacts`
- `PUT /api/emergency-contacts/:contactId`
- `DELETE /api/emergency-contacts/:contactId`

### Multi-User Access

- `POST /api/elders/:elderId/invite`
- `GET /api/elders/:elderId/members`
- `DELETE /api/elders/:elderId/members/:userId`

### Admin

- `POST /api/admin/devices/register`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/devices/list`

---

## 📡 Real-time Communication

### MQTT Topics (IoT → Backend)

```
device/{deviceId}/fall
device/{deviceId}/heartrate
device/{deviceId}/status
device/{deviceId}/battery
```

### Socket.io Events (Backend → Mobile)

```javascript
// Server emits
socket.emit("fall:detected", { elderId, timestamp, data });
socket.emit("heartrate:update", { elderId, bpm, timestamp });
socket.emit("device:status", { deviceId, status });
socket.emit("notification:new", { notification });

// Client subscribes
socket.on("fall:detected");
socket.on("heartrate:update");
socket.on("device:status");
```

---

## 🚀 Setup Instructions

### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
npm run start
```

### Environment Variables

**Backend (.env)**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fallhelp_db"
JWT_SECRET="your-secret-key"
MQTT_BROKER_URL="mqtt://localhost:1883"
FIREBASE_SERVICE_ACCOUNT="path/to/serviceAccountKey.json"
```

**Mobile (constants/Config.ts)**

```typescript
export const API_URL = "http://localhost:3000";
export const SOCKET_URL = "http://localhost:3000";
```

---

## 📝 Development Workflow

### Phase 1: Backend + Database (Day 1)

- ✅ Setup Prisma schema
- ✅ Implement all API endpoints
- ✅ Setup MQTT client
- ✅ Setup Socket.io server
- ✅ ESP32 Firmware with Arduino IDE

### Phase 2: Mobile App (Day 2-3)

- Setup Expo Router structure
- Implement Authentication flow
- Connect to backend APIs
- Implement real-time updates
- Add notifications

### Phase 3: Admin Panel (Day 4)

- Setup Retool dashboard
- Connect to backend APIs
- Implement device registration
- Create analytics views

### Phase 4: Testing & Integration (Day 5)

- End-to-end testing
- Performance optimization
- Bug fixes

---

## 🔧 IoT Hardware

ESP32 Firmware สำหรับอุปกรณ์จริง ดูรายละเอียดที่ `arduino/README.md`

**Hardware Components:**

- ESP32 DevKit V1
- MPU6050 (Accelerometer + Gyroscope)
- XD-58C Pulse Sensor

**Features:**

- AP Mode สำหรับ WiFi Configuration
- Serial Number อัตโนมัติจาก ESP32 Chip ID
- MQTT connection รับจาก Mobile App

---

Last Updated: December 1, 2025
