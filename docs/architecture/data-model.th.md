# Data Model

[English](data-model.md) · [ภาษาไทย](data-model.th.md)

## ข้อมูลเอกสาร

- ผู้อ่าน: Backend Dev / Data Analyst / ผู้ตรวจปริญญานิพนธ์
- แหล่งอ้างอิงหลัก (Source of Truth): [schema.prisma](../../apps/backend-api/prisma/schema.prisma), [eventService.ts](../../apps/backend-api/src/services/eventService.ts)
- สถานะ: Active
- อัปเดตล่าสุด: 21 พฤษภาคม 2026

---

## ภาพรวม

FallHelp ใช้ **PostgreSQL** เป็น Database หลักสำหรับ Event และข้อมูลเชิงสัมพันธ์ โดยมี 7 Models หลักที่เชื่อมโยงกัน

---

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Elder : "ดูแล"
    User ||--o{ Notification : "ได้รับ"
    User ||--o{ AuthOtp : "มี OTP"

    Elder ||--o| Device : "จับคู่กับ"
    Elder ||--o{ EmergencyContact : "มีผู้ติดต่อ"
    Elder ||--o{ Event : "มีเหตุการณ์"

    Device ||--o{ Event : "สร้าง"

    User {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        string gender
        string phone
        string profileImage
        string pushToken
        string role
    }

    Elder {
        string id PK
        string firstName
        string lastName
        string gender
        datetime dateOfBirth
        int height
        float weight
        string diseases
        string phone
        string houseNumber
        string villageNumber
        string villageName
        string subdistrict
        string district
        string province
        string zipcode
        string userId FK_UK
    }

    Device {
        string id PK
        string deviceCode UK
        string serialNumber UK
        string status
        string wifiStatus
        datetime lastOnline
        datetime updatedAt
        string elderId FK_UK
    }

    Event {
        string id PK
        string fallStage
        int bpm
        float magnitude
        float postureDelta
        datetime cancelledAt
        datetime timestamp
        string elderId FK
        string deviceId FK
    }

    EmergencyContact {
        string id PK
        string name
        string phone
        string relationship
        int priority
        string elderId FK
    }

    Notification {
        string id PK
        string title
        string message
        boolean isRead
        datetime readAt
        datetime createdAt
        string userId FK
        string eventId FK
    }

    AuthOtp {
        string id PK
        string code
        datetime expiresAt
        datetime createdAt
        string userId FK
    }
```

## หมายเหตุความสัมพันธ์ Notification -> Event

`notifications` ใช้ FK แบบ required ผ่าน `eventId -> events.id`:

1. Notification ทุกตัวใน phase ปัจจุบันต้องมาจาก event จริง
2. Query relation จาก Notification ไป Event ได้ตรงด้วย relational model
3. ถ้า Event ถูกลบ ให้ลบ Notification ตามด้วย `onDelete: Cascade` เพื่อไม่ทิ้ง record ที่ไม่มีต้นทาง

## หมายเหตุความสัมพันธ์ User -> Elder

ความสัมพันธ์ `User -> Elder` ใน schema ปัจจุบันควรอ่านเป็น **1 Mandatory to 1 Optional**
ไม่ใช่ `1 to 1` แบบบังคับทั้งสองฝั่ง ด้วยเหตุผลดังนี้:

1. `Elder.userId` เป็น required และ unique
   - แปลว่า Elder ทุกคนต้องมี User เจ้าของแน่ ๆ 1 คน
2. ฝั่ง `User` ยังเป็น optional
   - แปลว่า User 1 คนอาจยังไม่มี Elder ก็ได้ในระดับ schema
3. เหตุผลเชิงระบบ:
   - รองรับช่วง onboarding ที่สมัครบัญชีก่อนกรอกข้อมูลผู้สูงอายุ
   - รองรับบัญชี `ADMIN` ที่ไม่ได้ผูกกับ Elder

ดังนั้นให้แยกความเข้าใจ 2 ระดับ:

- **Schema truth:** `User` อาจมี Elder 0 หรือ 1 คน
- **Business expectation:** ผู้ใช้บทบาท `CAREGIVER` ควรมี Elder ครบเมื่อ setup เสร็จแล้ว

สรุป:

- ฝั่ง `Elder` -> `User` = mandatory
- ฝั่ง `User` -> `Elder` = optional

---

## กฎ Cascade และการลบข้อมูล

เมื่อลบ Record หลัก → Record ที่เชื่อมโยงจะทำอย่างไร:

| Parent     | Child            | Rule      | ผลลัพธ์                            |
| :--------- | :--------------- | :-------- | :--------------------------------- |
| **Elder**  | Event            | `Cascade` | ลบประวัติเหตุการณ์ทั้งหมด          |
| **Elder**  | EmergencyContact | `Cascade` | ลบผู้ติดต่อฉุกเฉินทั้งหมด          |
| **Elder**  | Device           | `SetNull` | ยกเลิกการผูกอุปกรณ์ (ไม่ลบ Device) |
| **User**   | Elder            | `Cascade` | ลบ Elder ที่ดูแลทั้งหมด            |
| **User**   | Notification     | `Cascade` | ลบแจ้งเตือนทั้งหมด                 |
| **User**   | AuthOtp          | `Cascade` | ลบ OTP ทั้งหมด                     |
| **Device** | Event            | `Cascade` | ลบ Events ทั้งหมด                  |

---

## ค่าที่อนุญาตของฟิลด์ TEXT

| ฟิลด์                | ค่าที่อนุญาต                                | การใช้งาน                                                                          |
| :------------------- | :------------------------------------------ | :--------------------------------------------------------------------------------- |
| `users.role`         | ADMIN, CAREGIVER                            | บทบาทของผู้ใช้ในระบบ                                                               |
| `users.gender`       | MALE, FEMALE, OTHER                         | เพศของผู้ใช้                                                                       |
| `elders.gender`      | MALE, FEMALE, OTHER                         | เพศของผู้สูงอายุ                                                                   |
| `devices.status`     | PAIRED, UNPAIRED                            | สถานะการจับคู่อุปกรณ์ (ไม่ใช่ online/offline — ดู `lastOnline` + `isDeviceOnline()`) |
| `devices.wifiStatus` | CONNECTED, DISCONNECTED, CONFIGURING, ERROR | สถานะ WiFi                                                                         |
| `events.fallStage`   | PENDING_CONFIRMATION, CONFIRMED, CANCELLED  | Source of truth ของ lifecycle การล้ม                                               |

---

## Indexes

### Performance Indexes

| ตาราง           | Index                              | วัตถุประสงค์                        |
| :-------------- | :--------------------------------- | :---------------------------------- |
| `events`        | `(elderId, timestamp DESC)`        | Query events ตาม elder              |
| `events`        | `(deviceId, timestamp DESC)`       | Query events ตาม device             |
| `events`        | `(deviceId, fallStage, cancelledAt, timestamp DESC)` | Query lifecycle การล้มตาม device |
| `events`        | `(fallStage, timestamp DESC)`      | กรองตาม fall stage                  |
| `events`        | `(timestamp DESC)`                 | Query ช่วงเวลาทั่วไป                |
| `notifications` | `(userId, isRead, createdAt DESC)` | แจ้งเตือนที่ยังไม่ได้อ่าน           |
| `notifications` | `(eventId)`                        | ค้นหาความสัมพันธ์กับ Event          |
| `auth_otps`     | `(userId, expiresAt)`              | ค้นหา OTP                           |

### Unique Constraints

| ตาราง                | Constraint            | วัตถุประสงค์                     |
| :------------------- | :-------------------- | :------------------------------- |
| `users`              | `email`               | ป้องกัน Email ซ้ำ                |
| `users`              | `phone`               | ป้องกันเบอร์โทรซ้ำ               |
| `elders`             | `userId`              | 1 User : 1 Elder                 |
| `devices`            | `deviceCode`          | QR Code ไม่ซ้ำ                   |
| `devices`            | `serialNumber`        | Serial Number ไม่ซ้ำ             |
| `devices`            | `elderId`             | 1 Elder : 1 Device               |
| `emergency_contacts` | `(elderId, priority)` | Priority ไม่ซ้ำใน Elder เดียวกัน |

---

## Event Data Model

ระบบ Event เป็นหัวใจของการเก็บข้อมูลจากอุปกรณ์ IoT บน **PostgreSQL** โดยออกแบบดัชนีตามเวลาเพื่อรองรับการ Query ข้อมูลย้อนหลังเป็นรายวัน/รายเดือน

### Prisma Schema

```prisma
model Event {
  id           String   @id @default(uuid())
  elderId      String
  deviceId     String
  fallStage    String   // PENDING_CONFIRMATION | CONFIRMED | CANCELLED
  bpm          Int?     // ค่า BPM ณ ขณะหกล้ม (null ถ้าไม่มีข้อมูลชีพจร)
  magnitude    Float?   // ค่าความแรงจาก processed evidence
  postureDelta Float?   // ค่าการเปลี่ยนท่าทางจาก processed evidence
  cancelledAt  DateTime?
  timestamp    DateTime @default(now())
}
```

### กลยุทธ์การ Query Event

Events Table ใช้ **Primary Key** แบบเดี่ยวที่ `id` และอาศัย index `timestamp` สำหรับ time-range queries:

- **ข้อดี:** Query by ID และ relation ทำได้ตรงไปตรงมา
- **ข้อดี:** Time-range query ยังเร็วจากดัชนี `timestamp`
- **ข้อสังเกต:** ไม่ต้องส่ง `timestamp` คู่กับ `id` ตอนเรียกดู event รายตัว

### กลยุทธ์การอ้างอิงของ Notification

`Notification` ใช้ Foreign Key แบบ required ผ่าน `eventId -> events.id`

- Notification ทุกตัวใน phase ปัจจุบันต้องมาจาก event จริง
- สามารถ join จาก notifications ไป events ได้ตรงโดย relational constraint
- ถ้า event ถูกลบ ระบบลบ notification ตามด้วย `onDelete: Cascade`

---

## ขอบเขตของ Event

ระบบ Event ใน phase ปัจจุบันใช้สำหรับ **fall event เท่านั้น**
จึงไม่เก็บ `type` แยกอีกชั้น และไม่เก็บ `severity` ไว้ในฐานข้อมูลโดยตรง

- ถ้าต้องตัดสิน lifecycle ของเหตุการณ์ ให้ดู `fallStage`
- ถ้าหน้า UI อยากแสดงระดับความรุนแรง สามารถ derive ได้จาก `fallStage`
  - `PENDING_CONFIRMATION` -> `WARNING`
  - `CONFIRMED` -> `CRITICAL`
  - `CANCELLED` -> ไม่ถือเป็น active alert แล้ว

---

## ขั้นตอนของ Fall Event

Fall Detection ใช้ **การยืนยัน 2 ขั้นตอน (2-Stage Confirmation):**

```text
Suspected (fallStage=PENDING_CONFIRMATION)
  -> Confirmed (fallStage=CONFIRMED)
  -> Cancelled (fallStage=CANCELLED, cancelledAt != null)
```

| Stage     | `fallStage`             | `cancelledAt` |
| :-------- | :---------------------- | :------------ |
| Suspected | `PENDING_CONFIRMATION`  | `null`        |
| Confirmed | `CONFIRMED`             | `null`        |
| Cancelled | `CANCELLED`             | เวลาที่ยกเลิก |

### `fallStage` ในฐานะ Source of Truth

สำหรับ flow การล้มปัจจุบัน ให้ถือว่า `fallStage` คือ **source of truth** ของ lifecycle เหตุการณ์
ส่วน field อื่นทำหน้าที่เป็นข้อมูลประกอบเท่านั้น:

- `fallStage` บอกสถานะหลักของเหตุการณ์ว่าอยู่ในช่วง `PENDING_CONFIRMATION`, `CONFIRMED`, หรือ `CANCELLED`
- `cancelledAt` ใช้เก็บเวลาเมื่อผู้สวมใส่กดปุ่มยกเลิกจริง ไม่ใช่ตัวตัดสินสถานะหลัก
- `magnitude` และ `postureDelta` เป็น evidence ประกอบการตรวจจับ ไม่ใช่ตัวบอก lifecycle

กติกาการตีความที่ควรใช้ทั้งระบบ:

| `fallStage` | ความหมาย | UI state | พฤติกรรม Notification | พฤติกรรม Socket |
| :---------- | :-------- | :------- | :-------------------- | :-------------- |
| `PENDING_CONFIRMATION` | ตรวจพบการล้มเบื้องต้นและกำลังรอยืนยัน | ไม่เปลี่ยน Mobile UI | ยังไม่ส่ง push/in-app notification | ส่ง `event_status_changed` ด้วย `FALL_SUSPECTED` เป็น internal guard |
| `CONFIRMED` | ยืนยันการล้มแล้ว | `FALL` | ส่ง push + in-app notification | ส่ง `fall_detected` และ `event_status_changed` ด้วย `FALL_CONFIRMED` |
| `CANCELLED` | ผู้สวมใส่กดยกเลิกที่อุปกรณ์ทันเวลา | ไม่เปลี่ยน Mobile UI | ไม่ส่ง notification เพิ่ม | ส่ง `event_status_changed` ด้วย `FALL_CANCELLED` เพื่อ clear pending guard |

**แหล่งที่มาของการยกเลิก (อนุญาตเพียงแหล่งเดียว):**

- **ปุ่มบนอุปกรณ์เท่านั้น:** ผู้สวมใส่กดปุ่ม GPIO27 ภายใน 15 วินาที → ESP32 ส่ง MQTT `fall_cancelled` → Backend อัปเดต `cancelledAt`
- **State Guard:** backend ยอมเปลี่ยนเป็น `CANCELLED` เฉพาะ event ที่ยังเป็น `PENDING_CONFIRMATION` เท่านั้น ถ้า event เป็น `CONFIRMED` แล้ว late `fall_cancelled` ต้องถูก ignore

> ⚠️ **Caregiver ยกเลิก fall event ไม่ได้** — ฝั่ง caregiver ทำได้เพียง **กดรับทราบ (Acknowledge) ในแอป** เพื่อคืนมุมมองเป็นปกติ ซึ่งไม่เปลี่ยน `cancelledAt` ใน DB

### ฟิลด์ Evidence ของการล้ม

สำหรับ 2-stage flow จะเก็บ evidence สำคัญใน event โดยตรง:

- `magnitude`: ค่า SVM/impact evidence
- `postureDelta`: ค่าการเปลี่ยนท่าทางหลังเกิดเหตุ

### การแมปสถานะแบบ Realtime (Socket -> Mobile)

Mobile เปลี่ยน fall alert state หลักจาก Socket `fall_detected` เท่านั้น ซึ่งหมายถึงเหตุล้มถูกยืนยันแล้ว
`PENDING_CONFIRMATION` และ `CANCELLED` ถูกส่งเป็น `event_status_changed` เพื่อให้ mobile จัดการ pending guard ภายใน แต่ไม่แสดง caregiver alert และไม่สร้าง notification

---

## Query Functions

### getEventsByElder

ดึง Events ตาม Elder พร้อม Pagination และ Filter:

```
GET /api/events?elderId=elder-uuid&startDate=2026-01-01&endDate=2026-02-01&page=1&limit=20
```

- **สิทธิ์เข้าถึง:** เจ้าของ elder เท่านั้น (single-caregiver model ปัจจุบัน)
- **การเรียงลำดับเริ่มต้น:** `timestamp DESC` (ล่าสุดก่อน)

### getMonthlySummary

สรุปเหตุการณ์รายเดือน:

```
GET /api/events/summary/monthly?elderId=elder-uuid&year=2026&month=2
```

## การควบคุมสิทธิ์ (Access Control)

| การดำเนินการ      | OWNER                       | VIEWER |
| :---------------- | :-------------------------- | :----- |
| ดู Events         | ✅                          | ✅     |
| ยกเลิก Fall Event | ❌ (device-only via GPIO27) | ❌     |
| ดู Summary        | ✅                          | ✅     |
| สร้าง Event       | ❌ (System/IoT only)        | ❌     |

> **หมายเหตุ:** `cancelledAt` ใน DB เปลี่ยนได้จาก MQTT `fall_cancelled` เท่านั้น (device button GPIO27) — ฝั่ง caregiver ทำได้เพียง UI-only reset (รับทราบ) ไม่เปลี่ยน DB

---

## การลบแบบ Cascade

เมื่อลบ Elder → Events ทั้งหมดของ Elder จะถูกลบอัตโนมัติ (`onDelete: Cascade`)

---

## เอกสารที่เกี่ยวข้อง

- [System Design](system-design.th.md)
- [Backend AI Context](../ai/backend.md)
- [API Reference](../api/api-reference.th.md)
- [Fall Detection System](../features/fall-detection.th.md)
