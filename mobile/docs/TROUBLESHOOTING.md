# 🛠️ Mobile Troubleshooting & Critical Fixes

> ⚠️ **Note to Future AI Agents & Developers:**
> This document records critical fixes and temporary workarounds applied to the Mobile App.
> **Please read this before modifying authentication or navigation logic.**

---

## 📱 App Stability & Startup

### 1. Startup Errors (401 Unauthorized)

**Problem:**
The app was logging "Invalid or expired token" errors on startup because:

1. `usePushNotifications` tried to send a token before login.
2. `checkAuth` in `_layout.tsx` logged errors when the token was invalid.

**Solution:**

- **`hooks/usePushNotifications.ts`**: Added a check to suppress 401 errors. It now silently skips saving the token if the user is not logged in.
- **`app/_layout.tsx`**: Added a catch block to detect 401 errors, clear the token using `clearToken()`, and redirect to login without logging an error.

**Critical Logic (DO NOT REMOVE):**

```typescript
// Check for 401 Unauthorized
const status = error?.status || error?.response?.status;
const message = error?.message || "";
const isUnauthorized =
  status === 401 ||
  message.includes("401") ||
  JSON.stringify(error).includes("401");

if (isUnauthorized) {
  // Clear token and redirect
  await clearToken();
  router.replace("/(auth)/login");
  return;
}
```

### 2. App Crash on Logout/Session Expiry

**Problem:**
The app crashed with `TypeError: removeToken is not a function` when handling a 401 error.

**Solution:**

- Corrected the function name from `removeToken` to `clearToken` (imported from `services/tokenStorage`).

---

## 🚧 Development Workflows & Workarounds

### 3. Temporary Navigation Bypass (Step 1 -> Dashboard)

**Problem:**
The user needed to test internal dashboard features without completing the full setup flow (Step 2 & 3).

**Workaround:**

- Modified `app/(setup)/step1-elder-info.tsx` to redirect to `/(tabs)` (Dashboard) immediately after creating an elder.

**To Revert (When Testing Complete):**
Change this line in `handleNext`:

```typescript
// Current (Temporary):
router.replace("/(tabs)");

// Original (Restore this later):
// router.push('/(setup)/step2-device-pairing');
```

### 4. Push Notifications Not Received

**Problem:**
Notifications appear in the "History" tab but no pop-up alert is shown on the device.

**Solution:**

1. Check if the device has a valid Expo Push Token (`User.pushToken` in DB).
2. Verify that the app has requested permissions (`usePushNotifications` hook).
3. Ensure the channel ID is set correctly for Android (`default`).
4. **Note:** On iOS Simulator, push notifications may not appear visually but are received by the app. Use a physical device for full testing.

---

**Last Updated:** December 5, 2025
