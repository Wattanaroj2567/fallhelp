# Production Deployment Guide

## ⚠️ การลบ Simulator Code ก่อน Deploy

เอกสารนี้อธิบายขั้นตอนการลบ IoT Simulator Code ออกจากระบบเมื่อพร้อม Deploy กับอุปกรณ์ IoT จริง

---

## 📋 สิ่งที่ต้องลบออก

### 1. **ไฟล์ Simulator ทั้งหมด**

ลบโฟลเดอร์และไฟล์เหล่านี้:

```bash
# ลบโฟลเดอร์ simulation ทั้งหมด
rm -rf backend/src/iot/simulation/

# รายละเอียดไฟล์ที่จะถูกลบ:
# - backend/src/iot/simulation/index.ts
# - backend/src/iot/simulation/deviceSimulator.ts
# - backend/src/iot/simulation/fallSimulator.ts
# - backend/src/iot/simulation/heartRateSimulator.ts
```

### 2. **Simulator Controller**

ลบไฟล์:

```bash
rm backend/src/controllers/simulatorController.ts
```

### 3. **Simulator Routes**

ลบไฟล์:

```bash
rm backend/src/routes/simulatorRoutes.ts
```

### 4. **ลบ Route Registration**

แก้ไขไฟล์ `backend/src/routes/index.ts`:

**ลบบรรทัดเหล่านี้:**

```typescript
import simulatorRoutes from "./simulatorRoutes"; // ← ลบบรรทัดนี้

// ... (โค้ดอื่นๆ)

router.use("/simulator", simulatorRoutes); // ← ลบบรรทัดนี้
```

---

## 🔧 สิ่งที่ต้องเก็บไว้ (ไม่ต้องลบ)

### ✅ MQTT Client & Handlers

**เก็บไว้** - ระบบจะใช้รับข้อมูลจากอุปกรณ์จริง:

```
backend/src/iot/mqtt/
├── mqttClient.ts          ✅ เก็บไว้
├── topics.ts              ✅ เก็บไว้
└── handlers/
    ├── fallHandler.ts     ✅ เก็บไว้
    ├── heartRateHandler.ts ✅ เก็บไว้
    └── statusHandler.ts    ✅ เก็บไว้
```

### ✅ Socket.io Server

**เก็บไว้** - ใช้ส่งข้อมูล Real-time ไปยัง Dashboard/Mobile:

```
backend/src/iot/socket/
├── socketServer.ts        ✅ เก็บไว้
└── events.ts              ✅ เก็บไว้
```

### ✅ Services, Controllers, Routes อื่นๆ

**เก็บไว้ทั้งหมด** - เป็น Business Logic หลักของระบบ:

```
backend/src/
├── controllers/  ✅ เก็บไว้ทั้งหมด (ยกเว้น simulatorController.ts)
├── services/     ✅ เก็บไว้ทั้งหมด
├── routes/       ✅ เก็บไว้ทั้งหมด (ยกเว้น simulatorRoutes.ts)
├── middlewares/  ✅ เก็บไว้ทั้งหมด
└── utils/        ✅ เก็บไว้ทั้งหมด
```

---

## 📝 Checklist สำหรับ Production

### ก่อน Deploy ให้ตรวจสอบ:

- [ ] ลบโฟลเดอร์ `backend/src/iot/simulation/` ทั้งหมดแล้ว
- [ ] ลบไฟล์ `backend/src/controllers/simulatorController.ts` แล้ว
- [ ] ลบไฟล์ `backend/src/routes/simulatorRoutes.ts` แล้ว
- [ ] ลบ import และ route registration ใน `backend/src/routes/index.ts` แล้ว
- [ ] ตรวจสอบว่า MQTT Client เชื่อมต่อกับ MQTT Broker ของอุปกรณ์จริงแล้ว
- [ ] ตั้งค่า Environment Variables สำหรับ Production (ดูด้านล่าง)
- [ ] ทดสอบ MQTT Topics ว่าตรงกับอุปกรณ์จริง
- [ ] ทดสอบ Socket.io ว่าส่งข้อมูลไปยัง Dashboard/Mobile ได้

---

## 🌐 Environment Variables สำหรับ Production

สร้างไฟล์ `.env.production`:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/fallhelp_prod"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# MQTT Broker (อุปกรณ์จริง)
MQTT_BROKER_URL="mqtt://your-iot-broker.com:1883"
MQTT_USERNAME="your-mqtt-username"
MQTT_PASSWORD="your-mqtt-password"

# Socket.io
SOCKET_PORT="3001"  # หรือใช้ port เดียวกับ Express

# Server
PORT="3000"
NODE_ENV="production"
```

---

## 🚀 คำสั่ง Deploy

### 1. Build TypeScript

```bash
cd backend
npm run build
```

### 2. Run Production

```bash
npm run start
```

หรือใช้ PM2:

```bash
pm2 start dist/server.js --name fallhelp-backend
pm2 save
pm2 startup
```

---

## 🔍 การทดสอบหลัง Deploy

### ทดสอบ MQTT Connection

ตรวจสอบ Log ว่า MQTT Client เชื่อมต่อสำเร็จ:

```
✅ MQTT Client connected to broker
```

### ทดสอบรับข้อมูลจากอุปกรณ์

ส่งข้อมูลทดสอบจากอุปกรณ์จริง ตรวจสอบว่า:

- [ ] Heart Rate Handler รับข้อมูลได้
- [ ] Fall Detection Handler รับข้อมูลได้
- [ ] Device Status Handler รับข้อมูลได้
- [ ] Socket.io broadcast ข้อมูลไป Dashboard/Mobile ได้

### ทดสอบ API Endpoints

```bash
# ทดสอบ Health Check
curl http://your-server.com/api/health

# ตรวจสอบว่า Simulator Routes ถูกลบแล้ว (ต้อง 404)
curl http://your-server.com/api/simulator/status
# Expected: 404 Not Found
```

---

## 📊 MQTT Topics ที่อุปกรณ์จริงต้องใช้

อุปกรณ์ IoT ต้องส่งข้อมูลมาตาม Topics เหล่านี้:

### 1. Heart Rate

```
Topic: fallhelp/device/{deviceId}/heartrate
Payload: {
  "timestamp": "2025-11-26T10:30:00.000Z",
  "heartRate": 75,
  "isAbnormal": false
}
```

### 2. Fall Detection

```
Topic: fallhelp/device/{deviceId}/fall
Payload: {
  "timestamp": "2025-11-26T10:30:00.000Z",
  "detected": true,
  "severity": "high",
  "latitude": 13.7563,
  "longitude": 100.5018
}
```

### 3. Device Status

```
Topic: fallhelp/device/{deviceId}/status
Payload: {
  "timestamp": "2025-11-26T10:30:00.000Z",
  "isOnline": true,
  "signalStrength": -45,
  "firmwareVersion": "1.2.3"
}
```

---

## ⚠️ คำเตือนสำคัญ

### ❌ อย่าลบสิ่งเหล่านี้:

- MQTT Client (`mqttClient.ts`)
- MQTT Handlers (`handlers/`)
- Socket.io Server (`socketServer.ts`)
- Services, Controllers, Routes หลักของระบบ

### ✅ ลบเฉพาะ:

- Simulator Code ทั้งหมด
- Simulator Controller
- Simulator Routes

---

## 📞 Support

หากมีปัญหาในการ Deploy:

1. ตรวจสอบ Error Logs ใน `pm2 logs` หรือ Console
2. ตรวจสอบ MQTT Connection
3. ตรวจสอบ Database Connection
4. ตรวจสอบว่าลบ Simulator Code ถูกต้องแล้ว

---

**อัพเดทล่าสุด:** 26 พฤศจิกายน 2568

**หมายเหตุ:** เอกสารนี้สำหรับการ Deploy Production เท่านั้น สำหรับ Development/Testing ให้ใช้ Simulator Code ได้ตามปกติ
