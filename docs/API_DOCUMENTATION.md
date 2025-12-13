# API Documentation

# เอกสาร API ระบบ FallHelp

> เอกสารนี้รวบรวม **API Endpoints**, **Request/Response**, และ **Real-time Events** ทั้งหมดของระบบ FallHelp

---

## ภาพรวม

| รายการ               | จำนวน                   |
| -------------------- | ----------------------- |
| **API Endpoints**    | 47+                     |
| **Database Tables**  | 9                       |
| **MQTT Topics**      | 3                       |
| **Socket.io Events** | 6                       |
| **Base URL**         | `http://localhost:3333` |

---

## 1. Authentication - `/api/auth`

### 1.1 ลงทะเบียนผู้ใช้ใหม่

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `POST`               |
| **Endpoint** | `/api/auth/register` |
| **Auth**     | ไม่ต้อง              |

**Request Body:**

```json
{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "gender": "MALE",
  "phoneNumber": "0812345678",
  "email": "somchai@example.com",
  "password": "Password123!"
}
```

**Response (201):**

```json
{
  "message": "ลงทะเบียนสำเร็จ"
}
```

---

### 1.2 เข้าสู่ระบบ

| รายการ       | ค่า               |
| ------------ | ----------------- |
| **Method**   | `POST`            |
| **Endpoint** | `/api/auth/login` |
| **Auth**     | ไม่ต้อง           |

**Request Body:**

```json
{
  "email": "somchai@example.com",
  "password": "Password123!"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "somchai@example.com",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "role": "USER"
  }
}
```

---

### 1.3 ขอรหัส OTP (ลืมรหัสผ่าน)

| รายการ       | ค่า                     |
| ------------ | ----------------------- |
| **Method**   | `POST`                  |
| **Endpoint** | `/api/auth/request-otp` |
| **Auth**     | ไม่ต้อง                 |

**Request Body:**

```json
{
  "email": "somchai@example.com"
}
```

**Response (200):**

```json
{
  "message": "ส่ง OTP ไปยังอีเมลแล้ว"
}
```

---

### 1.4 ยืนยัน OTP

| รายการ       | ค่า                    |
| ------------ | ---------------------- |
| **Method**   | `POST`                 |
| **Endpoint** | `/api/auth/verify-otp` |
| **Auth**     | ไม่ต้อง                |

**Request Body:**

```json
{
  "email": "somchai@example.com",
  "otp": "123456"
}
```

**Response (200):**

```json
{
  "resetToken": "reset-token-uuid"
}
```

---

### 1.5 ตั้งรหัสผ่านใหม่

| รายการ       | ค่า                        |
| ------------ | -------------------------- |
| **Method**   | `POST`                     |
| **Endpoint** | `/api/auth/reset-password` |
| **Auth**     | ไม่ต้อง                    |

**Request Body:**

```json
{
  "resetToken": "reset-token-uuid",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**

```json
{
  "message": "ตั้งรหัสผ่านใหม่สำเร็จ"
}
```

---

### 1.6 ดูข้อมูลผู้ใช้ปัจจุบัน

| รายการ       | ค่า            |
| ------------ | -------------- |
| **Method**   | `GET`          |
| **Endpoint** | `/api/auth/me` |
| **Auth**     | Bearer Token   |

**Response (200):**

```json
{
  "id": "uuid",
  "email": "somchai@example.com",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "phoneNumber": "0812345678",
  "gender": "MALE",
  "profileImage": "https://...",
  "role": "USER"
}
```

---

## 2. Users - `/api/users`

### 2.1 ดูโปรไฟล์ผู้ใช้

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `GET`                |
| **Endpoint** | `/api/users/profile` |
| **Auth**     | Bearer Token         |

**Response (200):**

```json
{
  "id": "uuid",
  "email": "somchai@example.com",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "phoneNumber": "0812345678",
  "gender": "MALE",
  "profileImage": "https://..."
}
```

---

### 2.2 แก้ไขโปรไฟล์ผู้ใช้

| รายการ           | ค่า                   |
| ---------------- | --------------------- |
| **Method**       | `PUT`                 |
| **Endpoint**     | `/api/users/profile`  |
| **Auth**         | Bearer Token          |
| **Content-Type** | `multipart/form-data` |

**Request Body:**

```json
{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "gender": "MALE",
  "profileImage": "(file)"
}
```

**Response (200):**

```json
{
  "success": true,
  "user": { ... }
}
```

---

### 2.3 เปลี่ยนรหัสผ่าน

| รายการ       | ค่า                   |
| ------------ | --------------------- |
| **Method**   | `PUT`                 |
| **Endpoint** | `/api/users/password` |
| **Auth**     | Bearer Token          |

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**

```json
{
  "message": "เปลี่ยนรหัสผ่านสำเร็จ"
}
```

---

### 2.4 อัปเดต Push Token

| รายการ       | ค่า                     |
| ------------ | ----------------------- |
| **Method**   | `PUT`                   |
| **Endpoint** | `/api/users/push-token` |
| **Auth**     | Bearer Token            |

**Request Body:**

```json
{
  "pushToken": "ExponentPushToken[xxxx]"
}
```

**Response (200):**

```json
{
  "success": true
}
```

---

### 2.5 ลบบัญชีผู้ใช้

| รายการ       | ค่า          |
| ------------ | ------------ |
| **Method**   | `DELETE`     |
| **Endpoint** | `/api/users` |
| **Auth**     | Bearer Token |

**Response (200):**

```json
{
  "message": "ลบบัญชีสำเร็จ"
}
```

---

## 3. Elders - `/api/elders`

### 3.1 สร้างข้อมูลผู้สูงอายุ

| รายการ           | ค่า                   |
| ---------------- | --------------------- |
| **Method**       | `POST`                |
| **Endpoint**     | `/api/elders`         |
| **Auth**         | Bearer Token          |
| **Content-Type** | `multipart/form-data` |

**Request Body:**

```json
{
  "name": "นางสมศรี ใจดี",
  "gender": "FEMALE",
  "birthDate": "1958-05-15",
  "height": 155,
  "weight": 50,
  "medicalCondition": "เบาหวาน ความดันโลหิตสูง",
  "address": "123 ถ.สุขุมวิท กรุงเทพฯ",
  "profileImage": "(file)"
}
```

**Response (201):**

```json
{
  "success": true,
  "elder": {
    "id": "uuid",
    "name": "นางสมศรี ใจดี",
    "age": 66,
    ...
  }
}
```

---

### 3.2 ดูรายการผู้สูงอายุทั้งหมด

| รายการ       | ค่า           |
| ------------ | ------------- |
| **Method**   | `GET`         |
| **Endpoint** | `/api/elders` |
| **Auth**     | Bearer Token  |

**Response (200):**

```json
{
  "elders": [
    {
      "id": "uuid",
      "name": "นางสมศรี ใจดี",
      "gender": "FEMALE",
      "age": 66,
      "profileImage": "https://...",
      "accessLevel": "OWNER",
      "devices": [...]
    }
  ]
}
```

---

### 3.3 ดูข้อมูลผู้สูงอายุ

| รายการ       | ค่า               |
| ------------ | ----------------- |
| **Method**   | `GET`             |
| **Endpoint** | `/api/elders/:id` |
| **Auth**     | Bearer Token      |

**Response (200):**

```json
{
  "id": "uuid",
  "name": "นางสมศรี ใจดี",
  "gender": "FEMALE",
  "birthDate": "1958-05-15",
  "age": 66,
  "height": 155,
  "weight": 50,
  "medicalCondition": "เบาหวาน",
  "address": "123 ถ.สุขุมวิท",
  "profileImage": "https://...",
  "devices": [...],
  "emergencyContacts": [...],
  "accessLevel": "OWNER"
}
```

---

### 3.4 แก้ไขข้อมูลผู้สูงอายุ

| รายการ       | ค่า                         |
| ------------ | --------------------------- |
| **Method**   | `PUT`                       |
| **Endpoint** | `/api/elders/:id`           |
| **Auth**     | Bearer Token (Owner/Editor) |

**Request Body:** (เหมือน 3.1)

**Response (200):**

```json
{
  "success": true,
  "elder": { ... }
}
```

---

### 3.5 ลบผู้สูงอายุ

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `DELETE`             |
| **Endpoint** | `/api/elders/:id`    |
| **Auth**     | Bearer Token (Owner) |

**Response (200):**

```json
{
  "message": "ลบข้อมูลผู้สูงอายุสำเร็จ"
}
```

---

### 3.6 ดูรายชื่อสมาชิกผู้ดูแล

| รายการ       | ค่า                       |
| ------------ | ------------------------- |
| **Method**   | `GET`                     |
| **Endpoint** | `/api/elders/:id/members` |
| **Auth**     | Bearer Token              |

**Response (200):**

```json
{
  "members": [
    {
      "userId": "uuid",
      "email": "member@example.com",
      "firstName": "สมหญิง",
      "lastName": "รักดี",
      "accessLevel": "VIEWER",
      "grantedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3.7 เชิญสมาชิกผู้ดูแล

| รายการ       | ค่า                       |
| ------------ | ------------------------- |
| **Method**   | `POST`                    |
| **Endpoint** | `/api/elders/:id/members` |
| **Auth**     | Bearer Token (Owner)      |

**Request Body:**

```json
{
  "email": "member@example.com"
}
```

**Response (201):**

```json
{
  "message": "เชิญสมาชิกสำเร็จ"
}
```

---

### 3.8 ลบสมาชิกผู้ดูแล

| รายการ       | ค่า                               |
| ------------ | --------------------------------- |
| **Method**   | `DELETE`                          |
| **Endpoint** | `/api/elders/:id/members/:userId` |
| **Auth**     | Bearer Token (Owner)              |

**Response (200):**

```json
{
  "message": "ลบสมาชิกสำเร็จ"
}
```

---

## 4. Devices - `/api/devices`

### 4.1 สร้างอุปกรณ์ใหม่ (Admin)

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `POST`               |
| **Endpoint** | `/api/devices`       |
| **Auth**     | Bearer Token (Admin) |

**Request Body:**

```json
{
  "deviceId": "FH-001",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "deviceName": "FallHelp Device 001"
}
```

**Response (201):**

```json
{
  "success": true,
  "device": {
    "id": "uuid",
    "deviceId": "FH-001",
    "code": "ABC123"
  },
  "qrCode": "data:image/png;base64,..."
}
```

---

### 4.2 ดู QR Code สำหรับ Pairing

| รายการ       | ค่า                     |
| ------------ | ----------------------- |
| **Method**   | `GET`                   |
| **Endpoint** | `/api/devices/:code/qr` |
| **Auth**     | ไม่ต้อง                 |

**Response (200):**

```json
{
  "qrCode": "data:image/png;base64,..."
}
```

---

### 4.3 จับคู่อุปกรณ์กับผู้สูงอายุ

| รายการ       | ค่า                 |
| ------------ | ------------------- |
| **Method**   | `POST`              |
| **Endpoint** | `/api/devices/pair` |
| **Auth**     | Bearer Token        |

**Request Body:**

```json
{
  "qrData": "encoded-qr-data",
  "elderId": "elder-uuid"
}
```

หรือ:

```json
{
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "elderId": "elder-uuid"
}
```

**Response (200):**

```json
{
  "success": true,
  "device": {
    "id": "uuid",
    "deviceId": "FH-001",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "status": "PAIRED"
  }
}
```

---

### 4.4 ยกเลิกการจับคู่อุปกรณ์

| รายการ       | ค่า                   |
| ------------ | --------------------- |
| **Method**   | `DELETE`              |
| **Endpoint** | `/api/devices/unpair` |
| **Auth**     | Bearer Token          |

**Request Body:**

```json
{
  "deviceId": "uuid"
}
```

**Response (200):**

```json
{
  "message": "ยกเลิกการจับคู่สำเร็จ"
}
```

---

### 4.5 สร้าง WiFi QR Code

| รายการ       | ค่า                 |
| ------------ | ------------------- |
| **Method**   | `POST`              |
| **Endpoint** | `/api/devices/wifi` |
| **Auth**     | Bearer Token        |

**Request Body:**

```json
{
  "ssid": "MyWiFi",
  "password": "wifi-password",
  "deviceId": "device-uuid"
}
```

**Response (200):**

```json
{
  "success": true,
  "qrCode": "data:image/png;base64,..."
}
```

---

## 5. Events - `/api/events`

### 5.1 ดูรายการเหตุการณ์

| รายการ       | ค่า                                       |
| ------------ | ----------------------------------------- |
| **Method**   | `GET`                                     |
| **Endpoint** | `/api/events`                             |
| **Auth**     | Bearer Token                              |
| **Query**    | `?elderId=uuid&type=FALL&page=1&limit=20` |

**Response (200):**

```json
{
  "events": [
    {
      "id": "uuid",
      "type": "FALL",
      "severity": "HIGH",
      "bpm": 120,
      "timestamp": "2024-12-13T10:05:00Z",
      "cancelled": false,
      "elderName": "นางสมศรี"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

### 5.2 ดูเหตุการณ์ล่าสุด (24 ชม.)

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `GET`                |
| **Endpoint** | `/api/events/recent` |
| **Auth**     | Bearer Token         |

**Response (200):**

```json
{
  "events": [...]
}
```

---

### 5.3 ดูรายละเอียดเหตุการณ์

| รายการ       | ค่า               |
| ------------ | ----------------- |
| **Method**   | `GET`             |
| **Endpoint** | `/api/events/:id` |
| **Auth**     | Bearer Token      |

**Response (200):**

```json
{
  "id": "uuid",
  "type": "FALL",
  "severity": "HIGH",
  "bpm": 120,
  "timestamp": "2024-12-13T10:05:00Z",
  "cancelled": false,
  "cancelledAt": null,
  "resolvedBy": null,
  "elder": { ... },
  "device": { ... }
}
```

---

### 5.4 ยกเลิกการแจ้งเตือนการหกล้ม

| รายการ       | ค่า                      |
| ------------ | ------------------------ |
| **Method**   | `POST`                   |
| **Endpoint** | `/api/events/:id/cancel` |
| **Auth**     | Bearer Token             |
| **หมายเหตุ** | ต้องกดภายใน 30 วินาที    |

**Response (200):**

```json
{
  "success": true,
  "message": "ยกเลิกการแจ้งเตือนสำเร็จ"
}
```

---

### 5.5 สรุปรายวัน (7 วัน)

| รายการ       | ค่า                         |
| ------------ | --------------------------- |
| **Method**   | `GET`                       |
| **Endpoint** | `/api/events/summary/daily` |
| **Auth**     | Bearer Token                |
| **Query**    | `?elderId=uuid`             |

**Response (200):**

```json
{
  "summary": [
    { "date": "2024-12-13", "fallCount": 2, "avgBpm": 85 },
    { "date": "2024-12-12", "fallCount": 0, "avgBpm": 78 }
  ]
}
```

---

### 5.6 สรุปรายเดือน

| รายการ       | ค่า                                |
| ------------ | ---------------------------------- |
| **Method**   | `GET`                              |
| **Endpoint** | `/api/events/summary/monthly`      |
| **Auth**     | Bearer Token                       |
| **Query**    | `?elderId=uuid&month=12&year=2024` |

**Response (200):**

```json
{
  "month": "ธันวาคม",
  "year": 2024,
  "totalFallEvents": 3,
  "peakTimeRange": "16:00 - 18:00 น.",
  "heartRateAnomalies": { "high": 2, "low": 1 }
}
```

---

## 6. Emergency Contacts - `/api/elders/:elderId/contacts`

### 6.1 เพิ่มเบอร์ติดต่อฉุกเฉิน

| รายการ       | ค่า                             |
| ------------ | ------------------------------- |
| **Method**   | `POST`                          |
| **Endpoint** | `/api/elders/:elderId/contacts` |
| **Auth**     | Bearer Token (Owner/Editor)     |

**Request Body:**

```json
{
  "name": "นายสมชาย ใจดี",
  "phoneNumber": "0812345678"
}
```

**Response (201):**

```json
{
  "success": true,
  "contact": {
    "id": "uuid",
    "name": "นายสมชาย ใจดี",
    "phoneNumber": "0812345678",
    "priority": 1
  }
}
```

---

### 6.2 ดูรายการเบอร์ติดต่อฉุกเฉิน

| รายการ       | ค่า                             |
| ------------ | ------------------------------- |
| **Method**   | `GET`                           |
| **Endpoint** | `/api/elders/:elderId/contacts` |
| **Auth**     | Bearer Token                    |

**Response (200):**

```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "นายสมชาย",
      "phoneNumber": "0812345678",
      "priority": 1
    },
    {
      "id": "uuid",
      "name": "นางสมหญิง",
      "phoneNumber": "0898765432",
      "priority": 2
    }
  ]
}
```

---

### 6.3 แก้ไขเบอร์ติดต่อฉุกเฉิน

| รายการ       | ค่า                                 |
| ------------ | ----------------------------------- |
| **Method**   | `PUT`                               |
| **Endpoint** | `/api/elders/:elderId/contacts/:id` |
| **Auth**     | Bearer Token (Owner/Editor)         |

**Request Body:**

```json
{
  "name": "นายสมชาย ใจดี (บิดา)",
  "phoneNumber": "0811111111"
}
```

---

### 6.4 ลบเบอร์ติดต่อฉุกเฉิน

| รายการ       | ค่า                                 |
| ------------ | ----------------------------------- |
| **Method**   | `DELETE`                            |
| **Endpoint** | `/api/elders/:elderId/contacts/:id` |
| **Auth**     | Bearer Token (Owner/Editor)         |

---

### 6.5 จัดเรียงลำดับเบอร์ติดต่อ

| รายการ       | ค่า                                     |
| ------------ | --------------------------------------- |
| **Method**   | `PATCH`                                 |
| **Endpoint** | `/api/elders/:elderId/contacts/reorder` |
| **Auth**     | Bearer Token (Owner/Editor)             |

**Request Body:**

```json
{
  "orderedIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

## 7. Notifications - `/api/notifications`

### 7.1 ดูรายการแจ้งเตือน

| รายการ       | ค่า                   |
| ------------ | --------------------- |
| **Method**   | `GET`                 |
| **Endpoint** | `/api/notifications`  |
| **Auth**     | Bearer Token          |
| **Query**    | `?page=1&pageSize=20` |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "FALL_DETECTED",
      "title": "ตรวจพบการหกล้ม!",
      "message": "นางสมศรี อาจหกล้ม",
      "isRead": false,
      "createdAt": "2024-12-13T10:05:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 2
}
```

---

### 7.2 ดูจำนวนแจ้งเตือนที่ยังไม่อ่าน

| รายการ       | ค่า                               |
| ------------ | --------------------------------- |
| **Method**   | `GET`                             |
| **Endpoint** | `/api/notifications/unread-count` |
| **Auth**     | Bearer Token                      |

**Response (200):**

```json
{
  "count": 5
}
```

---

### 7.3 ทำเครื่องหมายว่าอ่านแล้ว

| รายการ       | ค่า                           |
| ------------ | ----------------------------- |
| **Method**   | `PATCH`                       |
| **Endpoint** | `/api/notifications/:id/read` |
| **Auth**     | Bearer Token                  |

---

### 7.4 ทำเครื่องหมายว่าอ่านแล้วทั้งหมด

| รายการ       | ค่า                           |
| ------------ | ----------------------------- |
| **Method**   | `PATCH`                       |
| **Endpoint** | `/api/notifications/read-all` |
| **Auth**     | Bearer Token                  |

---

### 7.5 ลบแจ้งเตือนทั้งหมด

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `DELETE`             |
| **Endpoint** | `/api/notifications` |
| **Auth**     | Bearer Token         |

---

## 8. Feedback - `/api/feedback`

### 8.1 ส่ง Feedback

| รายการ       | ค่า             |
| ------------ | --------------- |
| **Method**   | `POST`          |
| **Endpoint** | `/api/feedback` |
| **Auth**     | Bearer Token    |

**Request Body:**

```json
{
  "type": "BUG",
  "message": "พบปัญหาเมื่อกดปุ่มยกเลิก"
}
```

**Response (201):**

```json
{
  "success": true,
  "feedback": {
    "id": "uuid",
    "ticketId": "REP-001",
    "status": "PENDING"
  }
}
```

---

## 9. Admin - `/api/admin`

> **สำหรับผู้ดูแลระบบเท่านั้น (Admin Role)**

### 9.1 Dashboard ภาพรวม

| รายการ       | ค่า                    |
| ------------ | ---------------------- |
| **Method**   | `GET`                  |
| **Endpoint** | `/api/admin/dashboard` |
| **Auth**     | Bearer Token (Admin)   |

**Response (200):**

```json
{
  "totalUsers": 150,
  "activeUsers": 120,
  "totalElders": 200,
  "totalDevices": 180,
  "activeDevices": 165,
  "todayEvents": 5
}
```

---

### 9.2 ดูรายชื่อผู้ใช้ทั้งหมด

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `GET`                |
| **Endpoint** | `/api/admin/users`   |
| **Auth**     | Bearer Token (Admin) |

---

### 9.3 ดูรายชื่อผู้สูงอายุทั้งหมด

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `GET`                |
| **Endpoint** | `/api/admin/elders`  |
| **Auth**     | Bearer Token (Admin) |

---

### 9.4 ดูรายการอุปกรณ์ทั้งหมด

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `GET`                |
| **Endpoint** | `/api/admin/devices` |
| **Auth**     | Bearer Token (Admin) |

---

### 9.5 ดูรายการเหตุการณ์ทั้งหมด

| รายการ       | ค่า                  |
| ------------ | -------------------- |
| **Method**   | `GET`                |
| **Endpoint** | `/api/admin/events`  |
| **Auth**     | Bearer Token (Admin) |

---

### 9.6 ดู Feedback ทั้งหมด

| รายการ       | ค่า                   |
| ------------ | --------------------- |
| **Method**   | `GET`                 |
| **Endpoint** | `/api/admin/feedback` |
| **Auth**     | Bearer Token (Admin)  |

---

### 9.7 อัปเดตสถานะ Feedback

| รายการ       | ค่า                              |
| ------------ | -------------------------------- |
| **Method**   | `PATCH`                          |
| **Endpoint** | `/api/admin/feedback/:id/status` |
| **Auth**     | Bearer Token (Admin)             |

**Request Body:**

```json
{
  "status": "REVIEWED"
}
```

---

## 10. Real-time Communication

### 10.1 MQTT Topics (IoT → Backend)

| Topic                | คำอธิบาย                      |
| -------------------- | ----------------------------- |
| `device/+/fall`      | ตรวจจับการหกล้ม               |
| `device/+/heartrate` | ส่งค่าชีพจร                   |
| `device/+/status`    | สถานะอุปกรณ์ (Online/Offline) |

---

### 10.2 Socket.io Events (Backend → Mobile)

| Event                  | คำอธิบาย            | Payload                                                |
| ---------------------- | ------------------- | ------------------------------------------------------ |
| `fall_detected`        | แจ้งเตือนการหกล้ม   | `{ eventId, elderId, elderName, severity, timestamp }` |
| `heart_rate_alert`     | ชีพจรผิดปกติ        | `{ elderId, bpm, status, timestamp }`                  |
| `heart_rate_update`    | อัปเดตชีพจรปกติ     | `{ elderId, bpm, status, timestamp }`                  |
| `device_status_update` | สถานะอุปกรณ์เปลี่ยน | `{ deviceId, status, timestamp }`                      |
| `event_status_changed` | ยกเลิกการแจ้งเตือน  | `{ eventId, status, cancelledBy }`                     |

---

## 11. Database Schema

| ตาราง            | คำอธิบาย                                             |
| ---------------- | ---------------------------------------------------- |
| User             | ผู้ดูแล (Caregiver) และ Admin                        |
| Elder            | ผู้สูงอายุที่ถูกดูแล                                 |
| UserElder        | ความสัมพันธ์ผู้ดูแล-ผู้สูงอายุ (Owner/Editor/Viewer) |
| Device           | อุปกรณ์ IoT (ESP32)                                  |
| Event            | เหตุการณ์ (TimescaleDB hypertable)                   |
| Notification     | ประวัติการแจ้งเตือน                                  |
| EmergencyContact | เบอร์ติดต่อฉุกเฉิน                                   |
| Otp              | รหัส OTP                                             |
| Feedback         | Feedback และแจ้งซ่อม                                 |

---

## 12. Security

| ฟีเจอร์              | รายละเอียด                                     |
| -------------------- | ---------------------------------------------- |
| **Authentication**   | JWT (หมดอายุ 7 วัน)                            |
| **Password**         | bcrypt hashing                                 |
| **Rate Limiting**    | API: 100/15นาที, Auth: 5/15นาที, OTP: 3/10นาที |
| **Access Control**   | Role-based (Owner/Editor/Viewer)               |
| **Input Validation** | express-validator                              |

---

## 13. Error Responses

```json
{
  "error": true,
  "message": "ข้อความแสดงข้อผิดพลาด",
  "statusCode": 400
}
```

| Status Code | ความหมาย                            |
| :---------: | ----------------------------------- |
|     400     | Bad Request - ข้อมูลไม่ถูกต้อง      |
|     401     | Unauthorized - ไม่ได้ Login         |
|     403     | Forbidden - ไม่มีสิทธิ์เข้าถึง      |
|     404     | Not Found - ไม่พบข้อมูล             |
|     429     | Too Many Requests - เกิน Rate Limit |
|     500     | Internal Server Error               |

---

**Last Updated:** December 13, 2025
