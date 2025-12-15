# Commit Groups สำหรับ FallHelp Project

## วิธีใช้
1. ดูไฟล์ที่เปลี่ยนแปลง: `git status --short`
2. จัดกลุ่มตาม feature/refactor ด้านล่าง
3. Commit แยกตามกลุ่ม

---

## 📋 กลุ่มการ Commit

### 1. Documentation & Configuration
**Type:** `docs`, `chore`
```
AGENT.md
CHANGELOG.md
docs/**/*
*.md
.gitignore
package.json
package-lock.json
```

### 2. Mobile - Error Handling Refactor
**Type:** `refactor(mobile)`
```
mobile/services/api.ts
mobile/utils/errorHelper.ts
mobile/app/**/*.tsx (ที่แก้ error handling)
```

### 3. Mobile - Type Safety Improvements
**Type:** `refactor(mobile)`
```
mobile/hooks/useSafeRouter.ts
mobile/components/Bounceable.tsx
```

### 4. Mobile - Security & State Management
**Type:** `refactor(mobile)`
```
mobile/context/AuthContext.tsx
mobile/hooks/useProtectedRoute.ts
```

### 5. Mobile - Components Standardization
**Type:** `refactor(mobile)`
```
mobile/app/(features)/(user)/(profile)/change-email.tsx
mobile/app/(features)/(user)/(profile)/change-password.tsx
mobile/app/(tabs)/index.tsx
mobile/app/(setup)/empty-state.tsx
mobile/app/(features)/(user)/(profile)/index.tsx
```

### 6. Backend - Core Services
**Type:** `refactor(backend)`
```
backend/src/services/*.ts
backend/src/controllers/*.ts
backend/src/middlewares/*.ts
```

### 7. Backend - IoT Integration
**Type:** `feat(backend)` หรือ `refactor(backend)`
```
backend/src/iot/**/*
```

### 8. Backend - Routes
**Type:** `refactor(backend)`
```
backend/src/routes/*.ts
backend/src/app.ts
backend/src/server.ts
```

### 9. Backend - Tests
**Type:** `test(backend)`
```
backend/src/__tests__/**/*
```

### 10. Admin - New Components
**Type:** `feat(admin)`
```
admin/src/components/EmptyState.tsx
admin/src/components/LoadingSkeleton.tsx
admin/src/components/StatusBadge.tsx
```

### 11. Admin - Custom Hooks
**Type:** `feat(admin)`
```
admin/src/hooks/useAdminDashboard.ts
admin/src/hooks/useAdminDevices.ts
admin/src/hooks/useAdminElders.ts
admin/src/hooks/useAdminFeedback.ts
admin/src/hooks/useAdminUsers.ts
```

### 12. Admin - Pages & Services
**Type:** `refactor(admin)` หรือ `feat(admin)`
```
admin/src/pages/*.tsx
admin/src/services/api.ts
admin/src/context/AuthContext.tsx
```

### 13. Arduino
**Type:** `feat(arduino)` หรือ `refactor(arduino)`
```
arduino/**/*
```

---

## 🎯 Commit Message Template

### สำหรับ Error Handling Refactor:
```
refactor(mobile): unify error handling across app

- Enhance toApiError() to handle network/timeout errors with Thai fallback
- Make errorHelper.ts a thin wrapper using toApiError()
- Standardize components to use showErrorMessage() instead of Alert.alert()

Files changed:
- mobile/services/api.ts
- mobile/utils/errorHelper.ts
- mobile/app/(features)/(user)/(profile)/change-email.tsx
- mobile/app/(features)/(user)/(profile)/change-password.tsx
- mobile/app/(tabs)/index.tsx
- mobile/app/(setup)/empty-state.tsx
- mobile/app/(features)/(user)/(profile)/index.tsx
```

### สำหรับ Admin New Features:
```
feat(admin): add shared components and custom hooks

- Add EmptyState, LoadingSkeleton, StatusBadge components
- Create custom hooks for admin data fetching (useAdminDashboard, useAdminDevices, etc.)
- Improve code reusability and maintainability

Files added:
- admin/src/components/EmptyState.tsx
- admin/src/components/LoadingSkeleton.tsx
- admin/src/components/StatusBadge.tsx
- admin/src/hooks/useAdmin*.ts
```

---

## ⚠️ ข้อควรระวัง

1. **อย่า commit ไฟล์ที่ generate:** `dist/`, `node_modules/`, `*.tsbuildinfo`
2. **ตรวจสอบ .gitignore:** ไฟล์ที่ควร ignore ต้องอยู่ใน .gitignore
3. **Commit แยกตาม feature:** อย่า commit ทุกอย่างในครั้งเดียว
4. **Review ก่อน commit:** ใช้ `git diff --staged` ดูการเปลี่ยนแปลง

---

## 🔧 Quick Commands

```bash
# ดูไฟล์ที่เปลี่ยนแปลง
git status --short

# ดู diff ของไฟล์ที่ staged
git diff --staged

# Commit ตามกลุ่ม
git add mobile/services/api.ts mobile/utils/errorHelper.ts
git commit -F .gitmessage

# หรือใช้ template
git commit -m "refactor(mobile): unify error handling" \
  -m "- Enhance toApiError() to handle network/timeout errors" \
  -m "- Make errorHelper.ts a thin wrapper"
```

