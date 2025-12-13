# Backend Troubleshooting

# การแก้ไขปัญหา Backend

รวบรวมปัญหาที่พบบ่อยและวิธีแก้ไขสำหรับ Backend

---

## รายการปัญหา

| #   | ปัญหา                     | สาเหตุ                |
| --- | ------------------------- | --------------------- |
| 1   | CORS Policy Error         | Admin Panel ถูก block |
| 2   | MQTT Connection Failed    | ไม่มี Broker          |
| 3   | Database Connection Error | PostgreSQL ไม่ทำงาน   |

---

## 1. CORS Policy Error

**อาการ:**  
Admin Panel (`http://localhost:5173`) ถูก block เพราะ CORS

**วิธีแก้ไข:**

1. แก้ไข `src/app.ts`:

```typescript
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8081",
      process.env.ADMIN_URL || "http://localhost:5173",
    ],
    credentials: true,
  })
);
```

2. เพิ่มใน `.env`:

```env
ADMIN_URL=http://localhost:5173
```

---

## 2. MQTT Connection Failed

**อาการ:**  
Console แสดง `MQTT connection failed` หรือ `connect ECONNREFUSED`

**วิธีแก้ไข:**

1. ติดตั้งและเริ่ม MQTT Broker:

```bash
# Windows (ต้องติดตั้ง Mosquitto ก่อน)
net start mosquitto

# หรือติดตามจาก: https://mosquitto.org/download/
```

2. ตรวจสอบ `.env`:

```env
MQTT_BROKER_URL=mqtt://localhost:1883
```

> **หมายเหตุ:** Backend ยังทำงานได้แม้ไม่มี MQTT แต่จะไม่รับข้อมูลจาก IoT

---

## 3. Database Connection Error

**อาการ:**  
`Error: P1001: Can't reach database server`

**วิธีแก้ไข:**

1. ตรวจสอบว่า PostgreSQL กำลังทำงาน:

```bash
# Windows
net start postgresql

# หรือตรวจสอบใน pgAdmin
```

2. ตรวจสอบ `DATABASE_URL` ใน `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fallhelp"
```

3. รัน migration:

```bash
npx prisma migrate dev
```

---

**Last Updated:** December 13, 2025
