# 🛠️ Backend Troubleshooting & Critical Fixes

> ⚠️ **Note to Future AI Agents & Developers:**
> This document records critical fixes and configuration details for the Backend.

---

## 🌐 API Configuration & Access

### 1. CORS Policy Error (Admin Panel Access)

**Problem:**
The Admin Panel (`http://localhost:5173`) was blocked by the Backend because the CORS policy only allowed `http://localhost:8081` (Mobile App).

**Solution:**
- Updated `src/app.ts` to allow multiple origins.
- Added `ADMIN_URL` to `.env` for flexibility.

**Code Reference (`src/app.ts`):**
```typescript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8081',
    process.env.ADMIN_URL || 'http://localhost:5173'
  ],
  credentials: true,
}));
```

---

**Last Updated:** December 2, 2025
