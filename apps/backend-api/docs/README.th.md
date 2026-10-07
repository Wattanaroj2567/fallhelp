# เอกสาร Backend

[English](README.md) · [ภาษาไทย](README.th.md)

> **หมายเหตุ:** เอกสารถูกรวมไว้ที่ส่วนกลางแล้ว

เอกสารทั้งหมดอยู่ที่: **[docs/README.th.md](../../../docs/README.th.md)**

---

## ลิงก์ด่วน

- [โครงสร้างโปรเจกต์ (Project Structure)](../../../docs/architecture/project-structure.th.md)
- [การออกแบบระบบ (System Design)](../../../docs/architecture/system-design.th.md)
- [การ deploy บนเครื่อง (Local Deployment)](../../../docs/ops/local-deployment.th.md)
- [การตรวจสอบ API (API Verification)](../../../docs/ops/api-verification.th.md)

---

## เอกสาร API

- [Postman Collection](api/postman_collection.json) - สำหรับทดสอบ API

---

## เริ่มต้นใช้งานอย่างรวดเร็ว

```bash
cd apps/backend-api
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Server จะรันที่: `http://localhost:3000`
