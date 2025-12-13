# Production Deployment Guide

# คู่มือการ Deploy Production

คู่มือนี้อธิบายขั้นตอนการเตรียม Backend สำหรับ Production

---

## Checklist ก่อน Deploy

- [ ] ลบ Simulator Code
- [ ] ตั้งค่า Environment Variables
- [ ] Setup MQTT Broker
- [ ] Setup Database
- [ ] Configure SSL/TLS

---

## 1. ลบ Simulator Code

### ไฟล์ที่ต้องลบ

```bash
# ลบ folder simulation
rm -rf backend/src/iot/simulation/

# ลบ simulator controller และ routes
rm backend/src/controllers/simulatorController.ts
rm backend/src/routes/simulatorRoutes.ts
```

### แก้ไข routes/index.ts

ลบบรรทัดเหล่านี้:

```typescript
import simulatorRoutes from "./simulatorRoutes"; // ← ลบ
router.use("/simulator", simulatorRoutes); // ← ลบ
```

### ไฟล์ที่ต้องเก็บไว้

| Folder         | ไฟล์                       | เหตุผล                  |
| -------------- | -------------------------- | ----------------------- |
| `iot/mqtt/`    | ทั้งหมด                    | รับข้อมูลจากอุปกรณ์จริง |
| `iot/socket/`  | ทั้งหมด                    | ส่งข้อมูล Real-time     |
| `controllers/` | ทั้งหมด (ยกเว้น simulator) | API Logic               |
| `services/`    | ทั้งหมด                    | Business Logic          |

---

## 2. Environment Variables

สร้างไฟล์ `.env.production`:

```env
# Database
DATABASE_URL="postgresql://user:password@your-db-host:5432/fallhelp"

# Server
PORT=3333
NODE_ENV=production

# Authentication
JWT_SECRET="your-very-long-secret-key-here"

# CORS
FRONTEND_URL="https://your-mobile-app-url"
ADMIN_URL="https://your-admin-panel-url"

# MQTT
MQTT_BROKER_URL="mqtt://your-mqtt-broker:1883"
MQTT_USERNAME="your-username"
MQTT_PASSWORD="your-password"

# Email (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

---

## 3. MQTT Topics

อุปกรณ์ IoT จะส่งข้อมูลผ่าน Topics เหล่านี้:

| Topic                         | Payload                                      | Description    |
| ----------------------------- | -------------------------------------------- | -------------- |
| `device/{deviceId}/fall`      | `{ "timestamp": "...", "severity": "HIGH" }` | Fall Detection |
| `device/{deviceId}/heartrate` | `{ "bpm": 75, "timestamp": "..." }`          | Heart Rate     |
| `device/{deviceId}/status`    | `{ "status": "ONLINE" }`                     | Device Status  |

---

## 4. Deploy Commands

### Build และ Start

```bash
# Build
npm run build

# Start with PM2 (recommended)
pm2 start dist/server.js --name fallhelp-api

# หรือ Start ธรรมดา
npm start
```

### ตรวจสอบ

```bash
# Health Check
curl http://localhost:3333/api/health

# ดู Logs
pm2 logs fallhelp-api
```

---

## 5. SSL/TLS (Recommended)

ใช้ Nginx เป็น Reverse Proxy:

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

---

## คำเตือนสำคัญ

> **อย่าลืม:**
>
> - เปลี่ยน `JWT_SECRET` ใน Production
> - ใช้ HTTPS สำหรับทุก endpoint
> - ตั้งค่า Rate Limiting
> - Backup Database อย่างสม่ำเสมอ

---

**Last Updated:** December 13, 2025
