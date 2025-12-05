# 🚀 Quick Start - FallHelp Mobile

## 1️⃣ Install & Setup

```bash
cd mobile
npm install
```

## 2️⃣ Run the App

### For Physical Device (iOS/Android)

```bash
# Terminal 1: Start Metro Bundler
npx expo start

# Then scan QR code with Expo Go app
```

### For Web Browser

```bash
npx expo start --web
```

### With Log Monitoring

```bash
bash monitor-logs.sh
```

## 3️⃣ Test These Scenarios ✅

### Scenario 1: Authentication

1. Open app → See login screen
2. Enter credentials → Click login
3. ✅ **Expected**: Redirect to **Home Dashboard (/(tabs))**
4. ❌ **NOT**: Should NOT go to Elder Info screen

### Scenario 2: Navigation

1. On home page → Click any tab
2. ✅ **Expected**: Tabs switch without crashing
3. ✅ **Expected**: No "GO_BACK not handled" errors

### Scenario 3: Real-time Updates

1. Check home dashboard
2. ✅ **Expected**: See heart rate and fall status
3. ✅ **Expected**: Values update in real-time

### Scenario 4: Error Handling

1. Intentionally disconnect network (if possible)
2. ✅ **Expected**: App shows error UI gracefully
3. ✅ **Expected**: Can retry actions

## 4️⃣ Check Console Logs

**Look for GOOD patterns:**

```
[INFO] 🚀 API Client Initialized
[DEBUG] Socket Connected
[INFO] Authenticating...
[WARN] Data stale: No heart rate update for 30s
```

**Avoid BAD patterns:**

```
console.log(...)
console.error(...)
GO_BACK not handled
TypeError: ...
Uncaught error
```

## 5️⃣ Report Issues

If you find any issues:

- ✅ Note the exact scenario
- ✅ Check console for errors
- ✅ Screenshot the error UI
- ✅ Include the log file

---

**All ready! Start testing now!** 🎉
