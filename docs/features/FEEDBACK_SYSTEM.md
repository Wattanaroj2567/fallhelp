# Feedback System Documentation

ระบบ Feedback สำหรับรับความคิดเห็นจากผู้ใช้

---

## ภาพรวม

```
Mobile App (Caregiver)    →    Backend API    →    Admin Panel
     ส่ง Feedback                เก็บ DB              ดู/จัดการ
```

---

## User Flow

### Caregiver (Mobile App)

1. เข้า Settings → "ส่งความคิดเห็น"
2. พิมพ์ข้อความ
3. กดส่ง
4. เห็น Success Message

### Admin (Web Panel)

1. เข้า Feedback Page
2. ดูรายการ Feedback
3. อัปเดตสถานะ

---

## Status Workflow

| สถานะ        | สี  | คำอธิบาย           |
| ------------ | :-: | ------------------ |
| **PENDING**  | 🟡  | ใหม่ ยังไม่ได้อ่าน |
| **REVIEWED** | 🔵  | Admin อ่านแล้ว     |
| **RESOLVED** | 🟢  | ดำเนินการเสร็จแล้ว |

---

## API Endpoints

| Method  | Endpoint                   | ผู้ใช้    |
| ------- | -------------------------- | --------- |
| `POST`  | `/api/feedback`            | Caregiver |
| `GET`   | `/api/feedback`            | Admin     |
| `PATCH` | `/api/feedback/:id/status` | Admin     |

---

## Database Model

| Field     | Type     | คำอธิบาย                    |
| --------- | -------- | --------------------------- |
| id        | UUID     | Primary Key                 |
| userId    | UUID?    | ผู้ส่ง (optional)           |
| message   | String   | ข้อความ                     |
| status    | Enum     | PENDING, REVIEWED, RESOLVED |
| createdAt | DateTime | เวลาสร้าง                   |

---

## Future Enhancements

- [ ] Anonymous feedback
- [ ] Categories (Bug, Feature, General)
- [ ] Admin reply to feedback
- [ ] Email notification

---

**Last Updated:** December 13, 2025
