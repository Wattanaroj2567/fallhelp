# 📱 Device Pairing & WiFi Configuration Flow

> **Updated:** November 26, 2025  
> **Realistic UX Design** - No QR Code, Real-world Device Setup

---

## 🎯 Overview

การออกแบบ Flow การผูกอุปกรณ์และตั้งค่า WiFi แบบสมจริง โดยใช้ประสบการณ์ที่ใกล้เคียงกับอุปกรณ์ IoT จริง เช่น Smart Plug, Smart Bulb

---

## 📋 Complete Flow

### Phase 1: Device Pairing (ผูกอุปกรณ์)

```
┌─────────────┐
│   Admin     │
│ Creates     │ 1. Admin สร้างอุปกรณ์ในระบบ
│ Device      │    POST /admin/devices
└──────┬──────┘    Body: { serialNumber, firmwareVersion }
       │
       ▼
┌─────────────────────────────────────┐
│ Device Status: UNPAIRED             │
│ deviceCode: FH-DEV-001             │
│ serialNumber: ESP32-1764126167230-1 │
└─────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Caregiver    │ 2. ผู้ดูแลเข้าแอป → เพิ่มผู้สูงอายุ
│ Creates      │    POST /elders
│ Elder        │    Body: { firstName, lastName, gender, dob, ... }
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Elder Created                       │
│ elderId: d9901f7a-7fcb-4a60-81e2... │
└─────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Pair Device  │ 3. ผู้ดูแลสแกน QR Code จากกล่องอุปกรณ์
│ Scan QR      │    (QR มีข้อมูล JSON: deviceCode, serialNumber)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Mobile App   │ 4. แอปอ่าน deviceCode → เรียก API
│ Calls API    │    POST /devices/{deviceCode}/pair
└──────┬───────┘    Body: { elderId }
       │
       ▼
┌─────────────────────────────────────┐
│ Device Status: OFFLINE              │
│ elderId: d9901f7a-... (paired!)     │
└─────────────────────────────────────┘
```

---

### Phase 2: WiFi Configuration (ตั้งค่า WiFi)

**Option A: ESP32 Access Point Mode** (สมจริงที่สุด - แนะนำ)

```
┌──────────────┐
│   ESP32      │ 1. อุปกรณ์เปิด AP Mode
│ Opens AP     │    WiFi SSID: "FallHelp-FH-DEV-001"
│ Mode         │    Password: "fallhelp123"
└──────┬───────┘    IP: 192.168.4.1
       │
       ▼
┌──────────────┐
│ User         │ 2. ผู้ใช้เชื่อมต่อ WiFi ของ ESP32
│ Connects to  │    Settings → WiFi → "FallHelp-FH-DEV-001"
│ ESP32 WiFi   │    ใส่รหัส: fallhelp123
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Mobile App   │ 3. แอปตรวจจับว่าเชื่อม ESP32 WiFi แล้ว
│ Auto-detects │    → แสดงหน้า WiFi Configuration
│ AP Mode      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ User Selects │ 4. ผู้ใช้เลือก WiFi บ้านจากรายการ
│ Home WiFi    │    (แอปดึงรายการ WiFi จากมือถือ)
└──────┬───────┘    เลือก: "ฐานลับ"
       │              ใส่รหัส: "Tawan@123456"
       ▼
┌──────────────┐
│ Send Config  │ 5. แอปส่งข้อมูลไปยัง ESP32 โดยตรง
│ to ESP32     │    HTTP POST http://192.168.4.1/wifi-config
└──────┬───────┘    Body: { ssid, password }
       │
       ▼
┌──────────────┐
│   ESP32      │ 6. ESP32 รับ config → บันทึก → Restart
│ Saves Config │    → เปลี่ยนเป็น Station Mode
│ & Restarts   │    → เชื่อมต่อ WiFi "ฐานลับ"
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   ESP32      │ 7. ESP32 เชื่อม WiFi สำเร็จ
│ Connects to  │    ได้ IP: 192.168.1.xxx
│ Home WiFi    │    → เชื่อมต่อ MQTT Broker
└──────┬───────┘    → เชื่อมต่อ Backend
       │
       ▼
┌──────────────┐
│ Backend      │ 8. Backend รับ MQTT connection
│ Receives     │    Topic: device/FH-DEV-001/status
│ MQTT         │    Payload: { status: "online", ip: "192.168.1.xxx" }
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Device Status: ONLINE               │
│ wifiStatus: CONNECTED               │
│ ipAddress: 192.168.1.xxx            │
└─────────────────────────────────────┘
```

---

**Option B: Mobile App WiFi Configuration** (สำหรับ Demo/Development)

> **หมายเหตุ:** Flow นี้ตรงกับ UI ที่ออกแบบไว้แล้วใน UI_FEATURES.md  
> ใช้สำหรับ Demo ให้อาจารย์ดู โดยไม่ต้องมีอุปกรณ์ ESP32 จริง

```
┌──────────────┐
│ User Pairs   │ 1. ผู้ใช้ผูกอุปกรณ์เรียบร้อยแล้ว (จาก Phase 1)
│ Device       │    POST /devices/{deviceCode}/pair
└──────┬───────┘    Response: Device Status = OFFLINE
       │
       ▼
┌──────────────┐
│ Auto-Navigate│ 2. แอป Navigate ไป Step 3 อัตโนมัติ
│ to Step 3    │    (ไม่มี Prompt - เป็นส่วนหนึ่งของ Setup Wizard)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ WiFi Setup   │ 3. หน้า Setup_Step3_Wifi
│ Screen       │    Header: "ตั้งค่าเครือข่าย WiFi สำหรับอุปกรณ์"
│ (Step 3)     │
└──────┬───────┘    คำอธิบาย: "เลือก WiFi จากรายการ หรือกรอกด้วยตนเอง"
       │
       │            🔍 Mode 1: WiFi Scanner List (แสดงรายการ WiFi)
       │            ┌─────────────────────────────────────┐
       │            │ 📶 ฐานลับ      🔒 WPA2        [>] │
       │            │ 📶 TrueMove    🔒 WPA2        [>] │
       │            │ 📶 AIS_Fiber   🔓 Open        [>] │
       │            │ ➕ กรอก WiFi ด้วยตนเอง            │
       │            └─────────────────────────────────────┘
       │
       │            ✍️ Mode 2: Manual Input (สำหรับ WiFi ที่ซ่อน SSID)
       │            - Input: ชื่อเครือข่าย (SSID)
       │            - Input: รหัสผ่าน WiFi
       ▼
┌──────────────┐
│ User Selects │ 4. ผู้ใช้เลือก WiFi หรือกรอก Manual
│ or Enters    │
│ WiFi         │    Case A: เลือกจากรายการ → คลิก WiFi
└──────┬───────┘    Case B: กรอก Manual → กรอก SSID + Password
       │
       │            ถ้าเลือก WiFi ที่มีรหัส 🔒
       │            → แสดง Modal กรอก Password
       │
       │            Modal:
       │            ┌────────────────────────────────┐
       │            │ เชื่อมต่อกับ "ฐานลับ"        │
       │            │ [รหัสผ่าน WiFi]  👁️          │
       │            │   [ยกเลิก]  [เชื่อมต่อ]      │
       │            └────────────────────────────────┘
       ▼
┌──────────────┐
│ Send to      │ 5. แอปส่งข้อมูลไปยัง Backend
│ Backend      │    POST /devices/{deviceCode}/wifi-config
└──────┬───────┘    Body: { ssid, password }
       │
       ▼
┌──────────────┐
│ Backend      │ 6. Backend บันทึก config
│ Saves Config │    UPDATE device_config
└──────┬───────┘    SET wifiStatus = "CONFIGURING"
       │
       ▼
┌──────────────┐
│ Loading      │ 7. แอปแสดง Loading State
│ State        │    "กำลังเชื่อมต่อ WiFi กับอุปกรณ์..."
└──────┬───────┘    Spinner Animation
       │            Timeout: 30 วินาที
       ▼
┌──────────────┐
│   ESP32      │ 8. อุปกรณ์ดึง Config จาก Backend
│ Fetches      │
│ Config       │    Method A: MQTT Subscribe
└──────┬───────┘    Topic: device/{deviceCode}/wifi-config
       │            Payload: { ssid, password, timestamp }
       │
       │            Method B: HTTP Polling (fallback)
       │            GET /devices/{deviceCode}/config
       │            Every 5 seconds
       ▼
┌──────────────┐
│   ESP32      │ 9. ESP32 รับ config → พยายามเชื่อมต่อ WiFi
│ Connects to  │    WiFi.begin(ssid, password)
│ WiFi         │
└──────┬───────┘    Success → ได้ IP address
       │            Failed → Retry 3 times
       ▼
┌──────────────┐
│   ESP32      │ 10. ESP32 ส่ง status update กลับ
│ Sends Status │
│ Update       │     Method A: MQTT Publish
└──────┬───────┘     Topic: device/{deviceCode}/status
       │             Payload: {
       │               status: "online",
       │               wifiStatus: "connected",
       │               ip: "192.168.1.xxx"
       │             }
       ▼
┌──────────────┐
│ Backend      │ 11. Backend รับ status update
│ Updates DB   │     UPDATE device
└──────┬───────┘     SET status = "ONLINE",
       │                 wifiStatus = "CONNECTED",
       │                 ipAddress = "192.168.1.xxx"
       │
       │             Emit Socket.io Event:
       │             socket.emit("device:status", {...})
       ▼
┌──────────────┐
│ Mobile App   │ 12. แอปรับ Socket.io Event
│ Receives     │     Event: "device:status"
│ Update       │     Payload: { status: "online", ... }
└──────┬───────┘
       │             หรือ Polling: GET /devices/{deviceCode}/status
       ▼
┌──────────────┐
│ Success      │ 13. แอปแสดงหน้า Success
│ Screen       │     ✅ "เชื่อมต่อ WiFi ให้เครื่องเรียบร้อยแล้ว"
└──────┬───────┘     "รอสักครู่ ! ระบบกำลังโหลด.."
       │
       │             Auto-redirect (3 วินาที)
       ▼
┌─────────────────────────────────────┐
│        Dashboard Home               │
│                                     │
│ สถานะของอุปกรณ์: "เชื่อมต่อแล้ว" 🟢 │
│ สถานะการหกล้ม: "ปกติ" 🔵           │
│ สถานะของชีพจร: "90 BPM" ❤️          │
│ สถานะของอุปกรณ์: "เชื่อมต่อแล้ว" 🟢 │
│ สถานะการหกล้ม: "ปกติ" 🔵           │
│ สถานะของชีพจร: "90 BPM" ❤️          │
└─────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Notification │ 14. แจ้งเตือน Push Notification
│ Alert        │     "อุปกรณ์ของ แม่ทองดี ออนไลน์แล้ว"
└──────────────┘     (Type: DEVICE_ONLINE)
```

---

### 📱 React Native WiFi Scanner Implementation

**Technologies:**

- **Android:** [react-native-wifi-reborn](https://github.com/JuanSeBestia/react-native-wifi-reborn) - รองรับการแสกน WiFi ได้เต็มรูปแบบ
- **iOS:** [react-native-network-info](https://github.com/pusherman/react-native-network-info) - จำกัด (iOS 13+ ต้องขอ Permission Location)

**Installation:**

```bash
npm install react-native-wifi-reborn
npm install @react-native-community/netinfo
```

**Example Code:**

```typescript
// WiFi Scanner Component
import WifiManager from "react-native-wifi-reborn";
import NetInfo from "@react-native-community/netinfo";

// Android: แสกนรายการ WiFi
async function scanWiFi() {
  const wifiList = await WifiManager.reScanAndLoadWifiList();
  return wifiList.map((wifi) => ({
    ssid: wifi.SSID,
    level: wifi.level, // -50 = แรง, -70 = อ่อน
    security: wifi.capabilities, // WPA2, Open
  }));
}

// iOS: ได้เฉพาะ WiFi ที่เชื่อมต่ออยู่
async function getCurrentWiFi() {
  const state = await NetInfo.fetch();
  return {
    ssid: state.details.ssid,
    isConnected: state.isConnected,
  };
}

// UI Component
function WiFiSetupScreen({ deviceCode }) {
  const [wifiList, setWifiList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWiFiList = async () => {
    setLoading(true);
    try {
      if (Platform.OS === "android") {
        const list = await scanWiFi();
        setWifiList(list.sort((a, b) => b.level - a.level)); // เรียงตามสัญญาณแรง
      } else {
        // iOS: แสดงเฉพาะ WiFi ปัจจุบัน + Manual option
        const current = await getCurrentWiFi();
        setWifiList([{ ssid: current.ssid, level: -50, current: true }]);
      }
    } catch (error) {
      Alert.alert("Error", "ไม่สามารถแสกน WiFi ได้");
    }
    setLoading(false);
  };

  const selectWiFi = async (ssid, security) => {
    if (security.includes("WPA") || security.includes("WEP")) {
      // แสดง Modal กรอก Password
      const password = await promptPassword();
      await sendWiFiConfig(deviceCode, ssid, password);
    } else {
      // Open Network - ยืนยันแล้วเชื่อมต่อ
      await sendWiFiConfig(deviceCode, ssid, "");
    }
  };

  return (
    <View>
      <Button title="รีเฟรชรายการ WiFi" onPress={loadWiFiList} />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={wifiList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selectWiFi(item.ssid, item.security)}
            >
              <View style={styles.wifiItem}>
                <Text>
                  {getSignalIcon(item.level)} {item.ssid}
                </Text>
                <Text>{item.security.includes("WPA") ? "🔒" : "🔓"}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <Button title="➕ กรอก WiFi ด้วยตนเอง" onPress={showManualInput} />
    </View>
  );
}

function getSignalIcon(level) {
  if (level >= -50) return "📶"; // 4 bars
  if (level >= -60) return "📶"; // 3 bars
  if (level >= -70) return "📶"; // 2 bars
  return "📶"; // 1 bar
}
```

---

### สำหรับ Demo/Development (ไม่มีอุปกรณ์จริง)

**Mock Behavior:**

```javascript
// Backend: Auto-simulate device connection after WiFi config
POST /devices/{deviceCode}/wifi-config
  ↓
Backend saves config
  ↓
Simulate delay (5 seconds)
  ↓
Auto-update device status to ONLINE
  ↓
Emit Socket.io event: device:status
  ↓
Mobile App receives update → Success Screen
```

**Implementation:**

```typescript
// backend/src/services/deviceService.ts
export const configureWiFi = async (...) => {
  // Save config
  const config = await prisma.deviceConfig.upsert({...});

  // For Demo: Auto-simulate device coming online after 5s
  if (process.env.DEMO_MODE === 'true') {
    setTimeout(async () => {
      await prisma.device.update({
        where: { id: deviceId },
        data: {
          status: 'ONLINE',
          lastOnline: new Date(),
        }
      });

      // Update config
      await prisma.deviceConfig.update({
        where: { deviceId },
        data: {
          wifiStatus: 'CONNECTED',
          ipAddress: '192.168.1.100' // Mock IP
        }
      });

      // Emit Socket.io event
      io.to(userId).emit('device:status', {
        deviceId,
        status: 'ONLINE',
        wifiStatus: 'CONNECTED',
        ipAddress: '192.168.1.100'
      });
    }, 5000);
  }

  return { config };
};
```

---

## 🔧 Technical Implementation

### Backend API Endpoints

```typescript
// 1. Pair Device
POST /api/devices/:deviceCode/pair
Authorization: Bearer <token>
Body: {
  "elderId": "uuid"
}
Response: {
  "success": true,
  "message": "Device paired successfully",
  "data": {
    "deviceCode": "FH-DEV-001",
    "status": "OFFLINE",
    "elderId": "d9901f7a-..."
  }
}

// 2. Configure WiFi (Option B)
POST /api/devices/:deviceCode/wifi-config
Authorization: Bearer <token>
Body: {
  "ssid": "ฐานลับ",
  "password": "Tawan@123456"
}
Response: {
  "success": true,
  "message": "WiFi configured successfully",
  "data": {
    "config": {
      "ssid": "ฐานลับ",
      "wifiStatus": "CONFIGURING"
    }
  }
}

// 3. Get Device Config (for ESP32)
GET /api/devices/:deviceCode/config
Authorization: Device-Token <esp32-token>
Response: {
  "success": true,
  "data": {
    "ssid": "ฐานลับ",
    "password": "Tawan@123456",  // Encrypted in production
    "fallThreshold": 2.5,
    "hrLowThreshold": 50,
    "hrHighThreshold": 120
  }
}
```

---

### ESP32 Implementation (Option A - Recommended)

```cpp
// 1. AP Mode Setup
void setupAPMode() {
  String apSSID = "FallHelp-" + deviceCode;
  WiFi.softAP(apSSID.c_str(), "fallhelp123");
  Serial.println("AP Mode started: " + apSSID);
  Serial.println("IP: " + WiFi.softAPIP().toString());

  // Start HTTP server for receiving WiFi config
  server.on("/wifi-config", HTTP_POST, handleWiFiConfig);
  server.begin();
}

// 2. Receive WiFi Config from Mobile App
void handleWiFiConfig() {
  String ssid = server.arg("ssid");
  String password = server.arg("password");

  // Save to EEPROM/SPIFFS
  saveWiFiConfig(ssid, password);

  server.send(200, "application/json", "{\"success\":true}");

  // Restart in Station Mode
  delay(1000);
  ESP.restart();
}

// 3. Connect to Home WiFi
void connectToWiFi() {
  String ssid = loadSSID();
  String password = loadPassword();

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), password.c_str());

  // Wait for connection...
  connectToMQTT();
  sendStatusUpdate("online");
}
```

---

### Mobile App Implementation (React Native / Expo)

```typescript
// Option A: Direct ESP32 Communication
async function configureWiFiViaESP32(deviceCode: string) {
  // 1. Check if connected to ESP32 AP
  const currentWiFi = await NetInfo.fetch();
  if (!currentWiFi.ssid.startsWith("FallHelp-")) {
    Alert.alert("Please connect to device WiFi first");
    return;
  }

  // 2. Get available WiFi networks (Android/iOS)
  const wifiList = await WifiManager.loadWifiList();

  // 3. User selects home WiFi
  const selectedSSID = await showWiFiPicker(wifiList);
  const password = await promptPassword();

  // 4. Send config directly to ESP32
  const response = await fetch("http://192.168.4.1/wifi-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ssid: selectedSSID, password }),
  });

  if (response.ok) {
    Alert.alert("WiFi configured! Device will restart...");
    // Reconnect to home WiFi
    await WifiManager.connectToProtectedSSID(selectedSSID, password, false);
  }
}

// Option B: Backend Proxy (Simpler)
async function configureWiFiViaBackend(deviceCode: string) {
  // 1. Auto-detect current WiFi
  const currentWiFi = await NetInfo.fetch();
  const ssid = currentWiFi.ssid;

  // 2. User enters password
  const password = await promptPassword();

  // 3. Send to backend
  const response = await api.post(`/devices/${deviceCode}/wifi-config`, {
    ssid,
    password,
  });

  Alert.alert("WiFi config sent to device!");
}
```

---

## 📱 Mobile App User Experience

### Screen Flow

```
1. [Add Elder Screen]
   ↓ User fills elder info
   ↓ Tap "Next"

2. [Pair Device Screen]
   "Scan QR code on device box"
   [Scan QR] button
   ↓ Scans QR → deviceCode detected

3. [Pairing...] (Loading)
   "Pairing device..."
   ↓ API call success

4. [WiFi Setup Screen]
   "Connect FH-DEV-001 to WiFi"

   Option A:
   [Instructions]
   1. Connect to WiFi: "FallHelp-FH-DEV-001"
   2. Password: fallhelp123
   [I'm Connected] button
   ↓
   [Select Home WiFi]
   - ฐานลับ (current)
   - WiFi_Guest
   - Neighbor_5G
   ↓ Select → Enter password
   [Configure] button

   Option B:
   [Auto-detected WiFi]
   SSID: ฐานลับ ✓
   Password: [__________]
   [Configure] button

5. [Configuring...] (Loading)
   "Sending WiFi credentials..."
   ↓

6. [Success!]
   "Device configured successfully!"
   "Waiting for device to come online..."
   [Device Status: 🟡 Connecting...]
   ↓ (WebSocket updates)
   [Device Status: 🟢 Online]
   [Done] button
```

---

## 🎯 Advantages of This Flow

### Option A (ESP32 AP Mode) - ⭐ Recommended

✅ **Most Realistic**

- Matches real-world IoT devices (Smart Plugs, Bulbs)
- User familiar with this UX pattern
- No backend dependency during initial setup

✅ **Secure**

- WiFi credentials sent directly to device
- No plaintext passwords stored on backend

✅ **Works Offline**

- Can configure even without internet
- Only needs local network

❌ **Slightly Complex**

- Requires user to switch WiFi networks
- iOS has restrictions on WiFi management

---

### Option B (Backend Proxy) - 🔄 Alternative

✅ **Simpler UX**

- No WiFi switching required
- One-tap configuration
- Better for iOS (no WiFi management needed)

✅ **Centralized**

- Backend has full control
- Easy to implement retry logic
- Can queue configuration if device offline

❌ **Less Secure**

- Passwords stored on backend (encrypt required)
- Depends on backend availability

❌ **Less Realistic**

- Not how most IoT devices work
- User expects direct device communication

---

## 🚀 Recommendation

**Use Option A (ESP32 AP Mode)** for production because:

1. Industry standard (same as Xiaomi, TP-Link devices)
2. Better security (credentials never touch backend)
3. More realistic for IoT demo/presentation
4. Professional user experience

**Use Option B** only if:

- Time constraints (faster implementation)
- iOS-only app (WiFi management restrictions)
- Demo environment (simplicity over realism)

---

## 📝 Implementation Checklist

### Backend (Current Status)

- ✅ Device pairing API
- ✅ WiFi config storage
- ✅ MQTT connection handling
- ✅ Device status updates
- ✅ Removed WiFi QR code generation
- ⏳ ESP32 HTTP endpoint for config fetch

### ESP32 Firmware (TODO)

- ⏳ AP Mode implementation
- ⏳ HTTP server for WiFi config
- ⏳ EEPROM/SPIFFS config storage
- ⏳ Station Mode connection
- ⏳ MQTT client with reconnect logic

### Mobile App (TODO)

- ⏳ QR code scanner for device pairing
- ⏳ WiFi network detection
- ⏳ WiFi list picker (Option A)
- ⏳ Auto-fill current WiFi (Option B)
- ⏳ WebSocket for real-time status updates
- ⏳ Guided setup wizard UI

---

**Last Updated:** December 5, 2025  
**Status:** Backend & Mobile Implementation Complete
