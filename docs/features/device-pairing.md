# Device Pairing & WiFi Configuration

[English](device-pairing.md) · [ภาษาไทย](device-pairing.th.md)

## Doc Meta

- Audience: Mobile/Backend/Hardware Dev, QA
- Source of Truth: `apps/mobile/app/(features)/(device)/` + [firmware/esp32/README.md](../../firmware/esp32/README.md), `apps/backend-api/src/routes/devicePairingRoutes.ts`, `apps/mobile/app/(features)/(device)/device-wifi-setup.tsx`, `apps/mobile/app/(features)/(device)/device-ble-wifi-setup.tsx`, `apps/mobile/app/(features)/(device)/device-wifi-reconfig.tsx`
- Status: Active
- Last Updated: May 21, 2026

---

This guide describes the flow for pairing an ESP32 device with the app (updated: May 2026).

---

## Overview

Device pairing has 2 main stages:

1. **Device Pairing** - bind the device to the elder
2. **WiFi Configuration** - set up WiFi for the device via BLE (Bluetooth Low Energy)

FallHelp now uses **Bluetooth Low Energy (BLE)** for first-time WiFi provisioning instead of AP Mode. This provides a better user experience with all setup happening within the mobile app.

For device management after setup, mobile enters `device-wifi-setup.tsx` first and then chooses the actual path from device state:

- device online → `device-wifi-reconfig.tsx` (backend/MQTT command path)
- device offline → `device-ble-wifi-setup.tsx` (BLE provisioning path)

---

## Feature Requirements

### Phase 1: Device Pairing (Bind the Device)

**Flow Diagram:**

```
Admin creates device → QR Code on the box → user scans → device is paired
```

**Steps:**

| Step | Action                                  | API                                                          |
| :--: | --------------------------------------- | ------------------------------------------------------------ |
|  1   | Admin creates the device in the system  | `POST /api/admin/devices`                                    |
|  2   | User creates the elder record           | `POST /api/elders`                                           |
|  3   | User scans the QR Code from the box     | `GET /api/devices/by-code/:code` to check the device details |
|  4   | App calls the pairing API               | `POST /api/device-pairings`                                  |

#### QR Code Format

```json
{
  "deviceCode": "FH-DEV-001",
  "serialNumber": "ESP32-XXXXXXXXXXXX"
}
```

### Phase 2: WiFi Configuration (WiFi Setup via BLE)

#### Current Method: BLE Provisioning

```
User opens Step 3 → app scans BLE → selects device → selects WiFi → sends password → success
```

**Steps:**

| Step | Action                                             | Details                             |
| :--: | -------------------------------------------------- | ----------------------------------- |
|  1   | ESP32 starts BLE advertising                       | Device name: `FallHelp-XXXXXX`      |
|  2   | User opens Step 3 in the app                       | App scans for BLE automatically     |
|  3   | User selects the device matching the code          | Checked against the Device Code     |
|  4   | User selects WiFi from the list or enters it manually | In-app WiFi scanning supported   |
|  5   | User enters the WiFi password                      | Sent via BLE to the ESP32           |
|  6   | ESP32 tests the real connection                    | Takes ~10 seconds                   |
|  7   | Success → ESP32 Restart + Online                   | Sends status to the Backend         |

**Prerequisites:**

- Bluetooth enabled on the phone
- Android requires Location to be enabled to scan WiFi
- ESP32 within BLE range (about 10-30 meters)

### Device Status Flow

```
UNPAIRED → PAIRED
```

> The device's **online/offline status** is not stored in `Device.status` — it is always computed from the `device.lastOnline` timestamp in the backend

| Status   | Description                   |
| -------- | ----------------------------- |
| UNPAIRED | Not yet paired with an elder  |
| PAIRED   | Paired with an elder          |

**Difference between `wifiStatus` and `lastOnline`:**

- `wifiStatus` answers questions about the WiFi connection and provisioning
  - `CONNECTED` = the device reports that it has connected to WiFi
  - `DISCONNECTED` = the device has not connected to WiFi yet, or has dropped off WiFi
  - `CONFIGURING` = currently in the WiFi setup flow
  - `ERROR` = the WiFi setup flow failed or did not receive the expected ACK
- `lastOnline` answers questions about presence
  - when the backend last saw the device alive
  - whether the UI should currently interpret it as online or offline
- Summary:
  - use `wifiStatus` for messages like "กำลังตั้งค่า" (Configuring), "เชื่อม WiFi สำเร็จ" (WiFi connected), "ตั้งค่าไม่สำเร็จ" (Setup failed)
  - use `lastOnline` for the badge or the `ออนไลน์ / ออฟไลน์` (Online / Offline) status

---

## QR Code Pairing Flow

### Quick Setup Flow

#### 1. ESP32 Setup

```bash
1. Upload firmware to ESP32
2. ESP32 starts BLE advertising as "FallHelp-XXXXXX"
3. Check Serial Monitor for device code
```

#### 2. Admin Panel

```bash
1. Login to Admin Panel
2. Devices → Create New Device
3. Enter Serial Number from ESP32
4. Save device
```

#### 3. Mobile App Setup

```bash
1. Open FallHelp Mobile App
2. Start Setup Wizard → Step 3
3. App auto-scans for BLE devices
4. Select your "FallHelp-XXXXXX" device
5. Choose WiFi network from list, or enter the SSID manually when the network is hidden
6. Enter WiFi password
7. Wait for BLE WiFi result, then backend/socket online confirmation (up to 20 seconds)
8. Success! Device is online
```

#### 4. Backend ACK Verification (Production)

```bash
1. Mobile sends WiFi credentials via BLE directly to ESP32
2. ESP32 writes WiFi credentials to NVS and connects to WiFi
3. ESP32 connects to MQTT Broker
4. ESP32 publishes Online status via MQTT
5. Backend updates device status and notifies Mobile app via Socket.io
```

Final flow used in product:

`mobile -> BLE -> esp32 -> NVS -> esp32 Online -> backend socket`

Mobile treats BLE `CONNECTED (0x02)` as "ESP32 connected to WiFi" only, not final app success. The app keeps the provisioning screen open until Socket.io or backend polling confirms `wifiStatus=CONNECTED`/`isOnline=true` within **20 seconds**. If the password is wrong, ESP32 sends BLE `FAILED (0x03)` and the app shows a retry dialog — the user can re-enter the password immediately without needing to power-cycle the device, since the firmware now resets the BLE/WiFi provisioning session automatically on failure. If retry still fails, the caregiver should power-cycle the device before starting again.

_(Note: The backend `PUT /api/devices/:id/wifi-config` endpoint and `device/{serial}/config` MQTT topic are for remote reconfiguration from app/backend flows, not the initial Mobile BLE setup.)_

In current mobile implementation, device details should route caregivers to the `device-wifi-setup.tsx` smart entrypoint. That entrypoint may continue to BLE provisioning or backend reconfiguration depending on whether the device is already online.

---

## BLE WiFi Provisioning

### BLE Service Specification

**Service UUID:**

```
4fafc201-1fb5-459e-8fcc-c5c9c331914b
```

**Characteristics:**

| Characteristic | UUID                                   | Type        | Description       |
| -------------- | -------------------------------------- | ----------- | ----------------- |
| **SSID**       | `4fafc202-1fb5-459e-8fcc-c5c9c331914b` | Write       | WiFi network name |
| **Password**   | `4fafc203-1fb5-459e-8fcc-c5c9c331914b` | Write       | WiFi password     |
| **Status**     | `4fafc204-1fb5-459e-8fcc-c5c9c331914b` | Read/Notify | Connection status |

**Status Values:**

| Value  | Status     | Description                                                                 |
| ------ | ---------- | --------------------------------------------------------------------------- |
| `0x00` | IDLE       | Waiting for credentials                                                     |
| `0x01` | CONNECTING | Attempting WiFi connection                                                  |
| `0x02` | CONNECTED  | ESP32 connected to WiFi; Mobile still waits for backend online confirmation |
| `0x03` | FAILED     | Connection failed                                                           |
| `0x04` | INVALID    | Invalid credentials                                                         |

### Offline Detection (MQTT Last Will)

- The ESP32 sets a Last Will Testament when it connects to MQTT
- If the ESP32 disconnects ungracefully → the MQTT broker sends an offline message
- The Backend updates `lastOnline`/realtime state so the system automatically computes the device as Offline

### Mobile App Features

**WiFi Scanner:**

- ✅ Auto-scan WiFi networks on page load
- ✅ Display signal strength (color-coded)
- ✅ Show security type (WPA3/WPA2/WPA/WEP/Open)
- ✅ Sort by signal strength
- ✅ Indicate current network
- ✅ "Scan Again" button
- ✅ Manual input fallback

**BLE Connection:**

- ✅ Auto-connect by device code
- ✅ Device filtering
- ✅ Real-time status monitoring
- ✅ Timeout handling: **20 seconds** for provisioning online confirmation
- ✅ Silent BLE reconnect on retry (no flashing to ble-connecting screen)
- ✅ Clear error messages
- ✅ Back button accessible during BLE scan and WiFi selection steps

---

## Technical Implementation

### Pairing Layer Contract

```
Admin creates device → caregiver scans QR → backend validates deviceCode → pair to elder
```

- Device lookup uses `GET /api/devices/by-code/:deviceCode` and returns the device data for pairing
- The actual pairing uses `POST /api/device-pairings`
- Unpairing uses `DELETE /api/device-pairings/:deviceId`
- When pairing succeeds, the backend must clear the retained config command for that serial on a best-effort basis
  to prevent a leftover `RESET_WIFI` command from a previous unpair from being delivered after the new provisioning round
- After unpairing, the backend must send `RESET_WIFI` to `device/{serial}/config` as retained, with a `requestId`,
  so that a device that was offline at unpair time receives the command to wipe WiFi/NVS as soon as it comes back online
- When the firmware replies on `config/ack` with `reason: "RESET_WIFI_ACCEPTED"`, the backend must clear the retained config command
  so the reset command does not linger and affect the next pairing

### Provisioning Layer Contract

```
BLE scan → connect → send WiFi credentials → device joins WiFi/MQTT → backend observes online status
```

- The provisioning transport is BLE
- WiFi setup is truly successful only when the device can connect to WiFi/MQTT, not merely when the credentials are sent successfully
- The backend uses MQTT `config` and `config/ack` for some control commands, such as `RESET_WIFI`

### MQTT Config ACK Protocol

**Config Command (Backend -> ESP32):**

Topic: `device/{serial}/config`

Payload:

```json
{
  "wifiSSID": "HomeWiFi",
  "wifiPassword": "password123",
  "requestId": "uuid-v4"
}
```

**Config ACK (ESP32 -> Backend):**

Topic: `device/{serial}/config/ack`

Payload:

```json
{
  "requestId": "uuid-v4",
  "success": true,
  "timestamp": 12345678,
  "reason": "WIFI_CONFIG_SAVED",
  "ip": "192.168.1.101"
}
```

Notes:

- `requestId` is required for correlation
- `success=false` should include `reason`
- `success=true` means config persisted on device (NVS), not final WiFi online confirmation
- Backend treats timeout/offline/publish error as failure and sets `wifiStatus=ERROR`
- Backend keeps `wifiStatus=CONFIGURING` after ACK; status topic updates it to `CONNECTED`/`DISCONNECTED`
- Backend does not persist `ssid` or `wifiPassword`; credentials stay on ESP32 NVS only

### Device State Semantics

`Device.status` refers to pairing state only:

| Field      | Meaning                    |
| ---------- | -------------------------- |
| `UNPAIRED` | Not yet paired with elder  |
| `PAIRED`   | Paired with elder          |

Things not to confuse:

- online/offline is not stored in `Device.status`
- Online status is computed only from `lastOnline` freshness, while `wifiStatus` describes the WiFi/provisioning state
- A sudden offline may come from the MQTT Last Will (`device/+/lwt`)

### Cross-Module Constraints

- Mobile must handle BLE permissions and clean up connections/scans fully every time
- Backend must reject events from `UNPAIRED` devices and be able to send a retained `RESET_WIFI` back
- Firmware must keep the BLE provisioning flow and MQTT reconnect consistent with the current topic contract
- Firmware must clear both the confirmed WiFi credentials (`ssid/password`) and the pending credentials (`pending_ssid/pending_pass`)
  when it receives `RESET_WIFI`

### Permissions Required

**Android:**

```xml
<!-- Android 12+ -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- WiFi Scanner -->
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
```

**Note:** Location Services must be enabled for WiFi scanning on Android.

**iOS:**

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>FallHelp ต้องการใช้ Bluetooth เพื่อตั้งค่า WiFi ให้กับอุปกรณ์</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>FallHelp ต้องการตำแหน่งเพื่อสแกนหา WiFi networks</string>
```

(The iOS permission strings are the Thai text shown to users: "FallHelp needs Bluetooth to set up WiFi for the device" and "FallHelp needs location to scan for WiFi networks".)

### Security Considerations

**Current Implementation:**

- WiFi credentials sent over BLE in plaintext
- Relies on BLE's short range (10-30m) for security
- No encryption or pairing required
- Mock trigger web server is controlled by firmware flag (`ENABLE_MOCK_TRIGGERS`)

**Best Practices:**

- ✅ Configure WiFi in private location
- ✅ Ensure no unauthorized devices nearby
- ✅ Verify device code matches ESP32
- ⚠️ Don't configure in public places

**Future Enhancements:**

- BLE pairing with PIN code
- Credential encryption
- Device authentication via QR code

**Development Note:**

If QA needs simulated events, enable mock triggers manually in firmware by setting:

`#define ENABLE_MOCK_TRIGGERS true`

### Mobile App Implementation

```typescript
// WiFi setup screen via BLE
// Once BLE has reported the CONNECTED status
const handleComplete = () => {
  router.replace("/(tabs)");
};
```

---

## Troubleshooting

| Problem                       | Solution                                                    |
| ----------------------------- | ----------------------------------------------------------- |
| BLE device not found          | Turn on Bluetooth, move closer to the device, restart ESP32 |
| Cannot connect via BLE        | Check permissions, turn Bluetooth off and on again          |
| WiFi not shown in the list    | Turn on Location (Android), turn on WiFi and scan again     |
| WiFi connection unsuccessful  | Check the password and WiFi signal range                    |
| Device stays Offline          | Check that the MQTT Server is running                       |

### ESP32 Not Showing in BLE Scan

**Causes:**

- The ESP32 has not started BLE advertising
- Out of Bluetooth range (>30m)
- Bluetooth is off on the phone

**Solution:**

1. Check the Serial Monitor that BLE advertising has started
2. Move closer to the ESP32 (within 10m)
3. Turn on Bluetooth on the phone
4. Restart the ESP32 and try again

### Cannot Connect via BLE

**Solution:**

1. Check BLE permissions in Settings
2. Turn Bluetooth off and on again
3. Restart ESP32
4. Restart Mobile App

### WiFi Connection Failed

**Solution:**

1. Check the WiFi password and tap **ลองใหม่** (Retry) — the device automatically resets the BLE session after a WiFi failure
2. Check that the ESP32 is within WiFi range
3. Try a different WiFi network
4. Check the Serial Monitor to see the error
5. If several retries still fail, power-cycle the device and start setup again

### WiFi Scanner Not Showing Networks

**Solution:**

1. Turn on Location Services (Android)
2. Allow the Location Permission
3. Turn on WiFi
4. Tap "Scan Again"

---

## Comparison: BLE vs AP Mode

| Feature         | AP Mode (Old) | BLE (New)        |
| --------------- | ------------- | ---------------- |
| WiFi Switching  | ❌ Required   | ✅ Not required  |
| In-App Setup    | ❌ No         | ✅ Yes           |
| WiFi Scanner    | ❌ No         | ✅ Yes           |
| Android UX      | ❌ Poor       | ✅ Good          |
| iOS UX          | ⚠️ OK         | ✅ Good          |
| Setup Time      | ~2-3 min      | ~30 sec          |
| Error Handling  | ❌ Limited    | ✅ Comprehensive |
| Status Feedback | ❌ No         | ✅ Real-time     |

---

## Testing Checklist

### ESP32

- [ ] BLE advertising starts on boot
- [ ] Device name shows correct code
- [ ] Accepts WiFi credentials via BLE
- [ ] Connects to WiFi successfully
- [ ] Sends status updates
- [ ] Connects to MQTT after WiFi

### Mobile App

- [ ] BLE permissions requested
- [ ] Device scan works
- [ ] Device filtering by code works
- [ ] WiFi scanner shows networks
- [ ] Network selection works
- [ ] Manual input works
- [ ] Status updates display
- [ ] Error messages clear
- [ ] Timeout handling works

### End-to-End

- [ ] Fresh ESP32 → Setup → Online
- [ ] Wrong password → Retry dialog (password can be re-entered immediately, no device reset needed)
- [ ] Retry reconnects BLE silently (does not flash back to the BLE scan screen)
- [ ] Provisioning timeout 20s → dialog appears, background stays white
- [ ] Out of range → Timeout error
- [ ] Multiple devices → Correct selection
- [ ] Online device enters backend/MQTT reconfiguration path successfully
- [ ] Offline device enters BLE provisioning path successfully

---

## Related Docs

- [IoT MQTT Architecture](../architecture/iot-mqtt.md)
- [Firmware README](../../firmware/esp32/README.md)
- [Mobile AI Context](../ai/mobile.md)
