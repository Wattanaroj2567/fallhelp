# Backend Documentation

# เอกสาร Backend

> **หมายเหตุ:** เอกสารถูกรวมไว้ที่ส่วนกลางแล้ว

เอกสารทั้งหมดอยู่ที่: **[docs/README.md](../../docs/README.md)**

---

## Quick Links

- [Project Structure](../../docs/architecture/PROJECT_STRUCTURE.md)
- [System Design](../../docs/architecture/SYSTEM_DESIGN.md)
- [Implementation Summary](../../docs/progress/IMPLEMENTATION_SUMMARY.md)
- [Backend Progress](../../docs/progress/BACKEND_PROGRESS.md)

---

## API Documentation

- [OpenAPI Spec](api/openapi.yaml) - Swagger/OpenAPI 3.0
- [Postman Collection](api/postman_collection.json) - API testing

---

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Server runs at: `http://localhost:3333`

Swagger UI: `http://localhost:3333/docs`
