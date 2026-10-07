# การจับคู่อุปกรณ์และตั้งค่า WiFi (Device Pairing & WiFi Configuration)

[English](device-pairing.md) · [ภาษาไทย](device-pairing.th.md)

## Doc Meta

- Audience: Mobile/Backend/Hardware Dev, QA
- Source of Truth: `apps/mobile/app/(features)/(device)/` + [firmware/esp32/README.th.md](../../firmware/esp32/README.th.md), `apps/backend-api/src/routes/devicePairingRoutes.ts`, `apps/mobile/app/(features)/(device)/device-wifi-setup.tsx`, `apps/mobile/app/(features)/(device)/device-ble-wifi-setup.tsx`, `apps/mobile/app/(features)/(device)/device-wifi-reconfig.tsx`
- Status: Active
- Last Updated: May 21, 2026

---

คู่มือนี้อธิบาย Flow การจับคู่อุปกรณ์ ESP32 กับแอป (อัปเดต: พฤษภาคม 2026)

---

## ภาพรวม

การจับคู่อุปกรณ์มี 2 ขั้นตอนหลัก:

1. **Device Pairing** - ผูกอุปกรณ์กับผู้สูงอายุ
2. **WiFi Configuration** - ตั้งค่า WiFi ให้อุปกรณ์ผ่าน BLE (Bluetooth Low Energy)

ปัจจุบัน FallHelp ใช้ **Bluetooth Low Energy (BLE)** สำหรับการตั้งค่า WiFi ครั้งแรก (provisioning) แทน AP Mode ทำให้ประสบการณ์ใช้งานดีขึ้น เพราะการตั้งค่าทั้งหมดเกิดขึ้นภายในแอปมือถือ

สำหรับการจัดการอุปกรณ์หลัง setup แอปมือถือจะเข้า `device-wifi-setup.tsx` ก่อน แล้วจึงเลือกเส้นทางจริงตามสถานะของอุปกรณ์:

- อุปกรณ์ online → `device-wifi-reconfig.tsx` (เส้นทางส่งคำสั่งผ่าน backend/MQTT)
- อุปกรณ์ offline → `device-ble-wifi-setup.tsx` (เส้นทาง BLE provisioning)

---

## ความต้องการของฟีเจอร์

### Phase 1: Device Pairing (ผูกอุปกรณ์)

**Flow Diagram:**

```
Admin สร้างอุปกรณ์ → QR Code บนกล่อง → ผู้ใช้สแกน → อุปกรณ์ถูกผูก
```

**ขั้นตอน:**

| Step | Action                      | API                                                        |
| :--: | --------------------------- | ---------------------------------------------------------- |
|  1   | Admin สร้างอุปกรณ์ในระบบ    | `POST /api/admin/devices`                                  |
|  2   | ผู้ใช้สร้างข้อมูลผู้สูงอายุ | `POST /api/elders`                                         |
|  3   | ผู้ใช้สแกน QR Code จากกล่อง | `GET /api/devices/by-code/:code` เพื่อตรวจสอบข้อมูลอุปกรณ์ |
|  4   | แอปเรียก API ผูกอุปกรณ์     | `POST /api/device-pairings`                                |

#### รูปแบบ QR Code

```json
{
  "deviceCode": "FH-DEV-001",
  "serialNumber": "ESP32-XXXXXXXXXXXX"
}
```

### Phase 2: WiFi Configuration (ตั้งค่า WiFi ผ่าน BLE)

#### วิธีปัจจุบัน: BLE Provisioning

```
ผู้ใช้เปิด Step 3 → แอปสแกน BLE → เลือกอุปกรณ์ → เลือก WiFi → ส่งรหัสผ่าน → สำเร็จ
```

**ขั้นตอน:**

| Step | Action                                 | รายละเอียด                     |
| :--: | -------------------------------------- | ------------------------------ |
|  1   | ESP32 เริ่ม BLE advertising            | ชื่ออุปกรณ์: `FallHelp-XXXXXX` |
|  2   | ผู้ใช้เปิด Step 3 ในแอป                | แอปสแกนหา BLE อัตโนมัติ        |
|  3   | ผู้ใช้เลือกอุปกรณ์ที่ตรงกับรหัส        | ตรวจสอบจาก Device Code         |
|  4   | ผู้ใช้เลือก WiFi จากรายการ หรือกรอกเอง | รองรับสแกน WiFi ในแอป          |
|  5   | ผู้ใช้กรอกรหัสผ่าน WiFi                | ส่งผ่าน BLE ไปยัง ESP32        |
|  6   | ESP32 ทดสอบเชื่อมต่อจริง               | ใช้เวลา ~10 วินาที             |
|  7   | สำเร็จ → ESP32 Restart + Online        | ส่งสถานะไป Backend             |

**เงื่อนไขที่ต้องมี:**

- เปิด Bluetooth บนมือถือ
- Android ต้องเปิด Location เพื่อสแกน WiFi
- ESP32 อยู่ในระยะ BLE (ประมาณ 10-30 เมตร)

### Flow สถานะอุปกรณ์

```
UNPAIRED → PAIRED
```

> สถานะ **ออนไลน์/ออฟไลน์ของอุปกรณ์** ไม่ได้เก็บใน `Device.status` — คำนวณจาก `device.lastOnline` timestamp ใน backend เสมอ

| Status   | Description               |
| -------- | ------------------------- |
| UNPAIRED | ยังไม่ได้ผูกกับผู้สูงอายุ |
| PAIRED   | ผูกกับผู้สูงอายุแล้ว      |

**ความต่างระหว่าง `wifiStatus` และ `lastOnline`:**

- `wifiStatus` ใช้ตอบคำถามเรื่องการเชื่อม WiFi และ provisioning
  - `CONNECTED` = อุปกรณ์รายงานว่าเชื่อม WiFi ได้แล้ว
  - `DISCONNECTED` = อุปกรณ์ยังไม่เชื่อม WiFi หรือหลุดออกจาก WiFi
  - `CONFIGURING` = กำลังอยู่ใน flow ตั้งค่า WiFi
  - `ERROR` = flow ตั้งค่า WiFi ล้มเหลวหรือไม่ได้ ACK ตามที่คาด
- `lastOnline` ใช้ตอบคำถามเรื่อง presence
  - backend เห็นอุปกรณ์มีชีวิตล่าสุดเมื่อไร
  - ตอนนี้ UI ควรตีความว่า online หรือ offline
- สรุป:
  - ใช้ `wifiStatus` สำหรับข้อความแนว "กำลังตั้งค่า", "เชื่อม WiFi สำเร็จ", "ตั้งค่าไม่สำเร็จ"
  - ใช้ `lastOnline` สำหรับ badge หรือสถานะ `ออนไลน์ / ออฟไลน์`

---

## Flow การจับคู่ด้วย QR Code

### ขั้นตอนตั้งค่าแบบย่อ

#### 1. ตั้งค่า ESP32

```bash
1. Upload firmware to ESP32
2. ESP32 starts BLE advertising as "FallHelp-XXXXXX"
3. Check Serial Monitor for device code
```

(อัปโหลด firmware ลง ESP32 → ESP32 เริ่ม BLE advertising ในชื่อ "FallHelp-XXXXXX" → ดู device code ใน Serial Monitor)

#### 2. Admin Panel

```bash
1. Login to Admin Panel
2. Devices → Create New Device
3. Enter Serial Number from ESP32
4. Save device
```

(เข้าสู่ระบบ Admin Panel → Devices → Create New Device → กรอก Serial Number จาก ESP32 → บันทึกอุปกรณ์)

#### 3. ตั้งค่าในแอปมือถือ

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

(เปิดแอป FallHelp → เริ่ม Setup Wizard ไปที่ Step 3 → แอปสแกนหาอุปกรณ์ BLE อัตโนมัติ → เลือกอุปกรณ์ "FallHelp-XXXXXX" → เลือก WiFi จากรายการ หรือกรอก SSID เองหากเป็นเครือข่ายที่ซ่อนอยู่ → กรอกรหัสผ่าน WiFi → รอผล WiFi ผ่าน BLE แล้วรอ backend/socket ยืนยันว่า online (สูงสุด 20 วินาที) → สำเร็จ อุปกรณ์ online แล้ว)

#### 4. การยืนยัน ACK จาก Backend (Production)

```bash
1. Mobile sends WiFi credentials via BLE directly to ESP32
2. ESP32 writes WiFi credentials to NVS and connects to WiFi
3. ESP32 connects to MQTT Broker
4. ESP32 publishes Online status via MQTT
5. Backend updates device status and notifies Mobile app via Socket.io
```

(แอปมือถือส่ง WiFi credentials ผ่าน BLE ตรงไปยัง ESP32 → ESP32 เขียน credentials ลง NVS แล้วเชื่อม WiFi → ESP32 เชื่อมต่อ MQTT Broker → ESP32 publish สถานะ Online ผ่าน MQTT → Backend อัปเดตสถานะอุปกรณ์และแจ้งแอปมือถือผ่าน Socket.io)

Flow สุดท้ายที่ใช้ในผลิตภัณฑ์:

`mobile -> BLE -> esp32 -> NVS -> esp32 Online -> backend socket`

แอปมือถือถือว่า BLE `CONNECTED (0x02)` หมายถึง "ESP32 เชื่อม WiFi ได้แล้ว" เท่านั้น ยังไม่ใช่ความสำเร็จขั้นสุดท้ายของแอป แอปจะเปิดหน้าจอ provisioning ค้างไว้จนกว่า Socket.io หรือ backend polling จะยืนยัน `wifiStatus=CONNECTED`/`isOnline=true` ภายใน **20 วินาที** ถ้ารหัสผ่านผิด ESP32 จะส่ง BLE `FAILED (0x03)` และแอปแสดง retry dialog — ผู้ใช้กรอกรหัสผ่านใหม่ได้ทันทีโดยไม่ต้องปิด-เปิดอุปกรณ์ เพราะตอนนี้ firmware รีเซ็ต BLE/WiFi provisioning session ให้อัตโนมัติเมื่อล้มเหลว หากลองใหม่แล้วยังไม่สำเร็จ ผู้ดูแลควรปิด-เปิดอุปกรณ์ก่อนเริ่มใหม่

_(หมายเหตุ: endpoint `PUT /api/devices/:id/wifi-config` ของ backend และ MQTT topic `device/{serial}/config` ใช้สำหรับการตั้งค่าใหม่จากระยะไกลผ่าน flow ของแอป/backend ไม่ใช่การตั้งค่า BLE ครั้งแรกจากแอปมือถือ)_

ใน implementation ปัจจุบันของแอปมือถือ หน้ารายละเอียดอุปกรณ์ควรพาผู้ดูแลไปที่ smart entrypoint `device-wifi-setup.tsx` ซึ่งจะไปต่อที่ BLE provisioning หรือการตั้งค่าใหม่ผ่าน backend ขึ้นอยู่กับว่าอุปกรณ์ online อยู่แล้วหรือไม่

---

## การตั้งค่า WiFi ผ่าน BLE

### ข้อกำหนด BLE Service

**Service UUID:**

```
4fafc201-1fb5-459e-8fcc-c5c9c331914b
```

**Characteristics:**

| Characteristic | UUID                                   | Type        | Description         |
| -------------- | -------------------------------------- | ----------- | ------------------- |
| **SSID**       | `4fafc202-1fb5-459e-8fcc-c5c9c331914b` | Write       | ชื่อเครือข่าย WiFi  |
| **Password**   | `4fafc203-1fb5-459e-8fcc-c5c9c331914b` | Write       | รหัสผ่าน WiFi       |
| **Status**     | `4fafc204-1fb5-459e-8fcc-c5c9c331914b` | Read/Notify | สถานะการเชื่อมต่อ   |

**ค่าสถานะ (Status Values):**

| Value  | Status     | Description                                                          |
| ------ | ---------- | -------------------------------------------------------------------- |
| `0x00` | IDLE       | รอรับ credentials                                                    |
| `0x01` | CONNECTING | กำลังพยายามเชื่อม WiFi                                               |
| `0x02` | CONNECTED  | ESP32 เชื่อม WiFi แล้ว แต่แอปมือถือยังรอ backend ยืนยันสถานะ online |
| `0x03` | FAILED     | เชื่อมต่อไม่สำเร็จ                                                   |
| `0x04` | INVALID    | credentials ไม่ถูกต้อง                                               |

### การตรวจจับ Offline (MQTT Last Will)

- ESP32 ตั้ง Last Will Testament เมื่อเชื่อมต่อ MQTT
- ถ้า ESP32 disconnect โดยไม่ graceful → MQTT broker ส่ง offline message
- Backend อัปเดต `lastOnline`/realtime state เพื่อให้ระบบคำนวณเป็น Offline อัตโนมัติ

### ฟีเจอร์ในแอปมือถือ

**WiFi Scanner:**

- ✅ สแกนเครือข่าย WiFi อัตโนมัติเมื่อเปิดหน้า
- ✅ แสดงความแรงสัญญาณ (แยกสี)
- ✅ แสดงประเภทความปลอดภัย (WPA3/WPA2/WPA/WEP/Open)
- ✅ เรียงตามความแรงสัญญาณ
- ✅ ระบุเครือข่ายที่ใช้อยู่
- ✅ ปุ่ม "Scan Again"
- ✅ กรอกเองได้เป็น fallback

**การเชื่อมต่อ BLE:**

- ✅ เชื่อมต่ออัตโนมัติตาม device code
- ✅ กรองอุปกรณ์
- ✅ ติดตามสถานะแบบ Real-time
- ✅ จัดการ timeout: **20 วินาที** สำหรับการยืนยัน online หลัง provisioning
- ✅ เชื่อม BLE ใหม่แบบเงียบเมื่อ retry (ไม่กระพริบกลับไปหน้า ble-connecting)
- ✅ ข้อความ error ชัดเจน
- ✅ กดปุ่มย้อนกลับได้ระหว่างขั้นสแกน BLE และเลือก WiFi

---

## Technical Implementation

### สัญญาของ Pairing Layer

```
Admin creates device → caregiver scans QR → backend validates deviceCode → pair to elder
```

- device lookup ใช้ `GET /api/devices/by-code/:deviceCode` และคืนข้อมูลอุปกรณ์สำหรับ pairing
- การผูกจริงใช้ `POST /api/device-pairings`
- การยกเลิกการผูกใช้ `DELETE /api/device-pairings/:deviceId`
- เมื่อ pair สำเร็จ backend ต้อง clear retained config command ของ serial นั้นแบบ best-effort
  เพื่อกันคำสั่ง `RESET_WIFI` ที่ค้างจากรอบ unpair ก่อนหน้าถูกส่งหลัง provisioning รอบใหม่
- เมื่อ unpair แล้ว backend ต้องส่ง `RESET_WIFI` ไปที่ `device/{serial}/config` แบบ retained พร้อม `requestId`
  เพื่อให้อุปกรณ์ที่ offline ตอนกด unpair ได้รับคำสั่งล้าง WiFi/NVS ทันทีเมื่อกลับมา online
- เมื่อ firmware ตอบ `config/ack` ด้วย `reason: "RESET_WIFI_ACCEPTED"` backend ต้อง clear retained config command
  เพื่อไม่ให้คำสั่ง reset ค้างไปกระทบการผูกครั้งถัดไป

### สัญญาของ Provisioning Layer

```
BLE scan → connect → send WiFi credentials → device joins WiFi/MQTT → backend observes online status
```

- provisioning transport คือ BLE
- การตั้งค่า WiFi สำเร็จจริงเมื่อ device เชื่อม WiFi/MQTT ได้ ไม่ใช่แค่ส่ง credential สำเร็จ
- ฝั่ง backend ใช้ MQTT `config` และ `config/ack` สำหรับบางคำสั่งควบคุม เช่น `RESET_WIFI`

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

หมายเหตุ:

- ต้องมี `requestId` เพื่อใช้จับคู่คำสั่งกับคำตอบ (correlation)
- `success=false` ควรมี `reason` ด้วย
- `success=true` หมายถึง config ถูกบันทึกลงอุปกรณ์ (NVS) แล้ว ไม่ใช่การยืนยันขั้นสุดท้ายว่า WiFi online
- Backend ถือว่า timeout/offline/publish error เป็นความล้มเหลว และตั้ง `wifiStatus=ERROR`
- Backend คง `wifiStatus=CONFIGURING` ไว้หลังได้ ACK แล้วให้ status topic อัปเดตเป็น `CONNECTED`/`DISCONNECTED`
- Backend ไม่เก็บ `ssid` หรือ `wifiPassword`; credentials อยู่ใน NVS ของ ESP32 เท่านั้น

### ความหมายของสถานะอุปกรณ์

`Device.status` หมายถึง pairing state เท่านั้น:

| Field      | Meaning            |
| ---------- | ------------------ |
| `UNPAIRED` | ยังไม่ผูกกับ elder |
| `PAIRED`   | ผูกกับ elder แล้ว  |

สิ่งที่ไม่ควรสับสน:

- online/offline ไม่ได้เก็บใน `Device.status`
- สถานะ online คำนวณจาก `lastOnline` freshness เท่านั้น ส่วน `wifiStatus` ใช้อธิบาย WiFi/provisioning state
- offline แบบกะทันหันอาจมาจาก MQTT Last Will (`device/+/lwt`)

### ข้อจำกัดข้ามโมดูล

- Mobile ต้องจัดการ BLE permission และ cleanup ของ connection/scan ให้ครบทุกครั้ง
- Backend ต้อง reject event จากอุปกรณ์ที่ `UNPAIRED` และส่ง retained `RESET_WIFI` กลับไปได้
- Firmware ต้องรักษา flow BLE provisioning และ MQTT reconnect ให้สอดคล้องกับ topic contract ปัจจุบัน
- Firmware ต้องล้างทั้ง confirmed WiFi credentials (`ssid/password`) และ pending credentials (`pending_ssid/pending_pass`)
  เมื่อรับ `RESET_WIFI`

### Permissions ที่ต้องใช้

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

**หมายเหตุ:** บน Android ต้องเปิด Location Services จึงจะสแกน WiFi ได้

**iOS:**

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>FallHelp ต้องการใช้ Bluetooth เพื่อตั้งค่า WiFi ให้กับอุปกรณ์</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>FallHelp ต้องการตำแหน่งเพื่อสแกนหา WiFi networks</string>
```

### ข้อพิจารณาด้านความปลอดภัย

**Implementation ปัจจุบัน:**

- WiFi credentials ถูกส่งผ่าน BLE แบบ plaintext
- อาศัยระยะสั้นของ BLE (10-30m) เป็นมาตรการความปลอดภัย
- ไม่มีการเข้ารหัสและไม่ต้อง pairing
- Mock trigger web server ควบคุมด้วย firmware flag (`ENABLE_MOCK_TRIGGERS`)

**แนวปฏิบัติที่ดี:**

- ✅ ตั้งค่า WiFi ในพื้นที่ส่วนตัว
- ✅ ตรวจให้แน่ใจว่าไม่มีอุปกรณ์ที่ไม่ได้รับอนุญาตอยู่ใกล้ ๆ
- ✅ ตรวจสอบว่า device code ตรงกับ ESP32
- ⚠️ อย่าตั้งค่าในที่สาธารณะ

**การปรับปรุงในอนาคต:**

- BLE pairing ด้วย PIN code
- เข้ารหัส credentials
- ยืนยันตัวตนอุปกรณ์ผ่าน QR code

**หมายเหตุสำหรับการพัฒนา:**

หาก QA ต้องการจำลอง event ให้เปิด mock triggers เองใน firmware โดยตั้งค่า:

`#define ENABLE_MOCK_TRIGGERS true`

### Implementation ฝั่งแอปมือถือ

```typescript
// หน้าจอตั้งค่า WiFi ผ่าน BLE
// เมื่อ BLE ส่งสถานะ CONNECTED แล้ว
const handleComplete = () => {
  router.replace("/(tabs)");
};
```

---

## การแก้ไขปัญหา

| ปัญหา                    | วิธีแก้ไข                                       |
| ------------------------ | ----------------------------------------------- |
| ไม่พบอุปกรณ์ BLE         | เปิด Bluetooth, เข้าใกล้อุปกรณ์, รีสตาร์ท ESP32 |
| เชื่อมต่อ BLE ไม่ได้     | ตรวจสอบ permission, ปิด/เปิด Bluetooth ใหม่     |
| ไม่พบ WiFi ในรายการ      | เปิด Location (Android), เปิด WiFi แล้วสแกนใหม่ |
| เชื่อมต่อ WiFi ไม่สำเร็จ | ตรวจสอบรหัสผ่านและระยะสัญญาณ WiFi               |
| อุปกรณ์ Offline อยู่ตลอด | ตรวจสอบ MQTT Server ทำงาน                       |

### ESP32 ไม่แสดงใน BLE Scan

**สาเหตุ:**

- ESP32 ไม่ได้เปิด BLE advertising
- อยู่นอกระยะ Bluetooth (>30m)
- Bluetooth ปิดอยู่บนมือถือ

**วิธีแก้:**

1. ตรวจสอบ Serial Monitor ว่า BLE advertising เริ่มแล้ว
2. เข้าใกล้ ESP32 (ภายใน 10m)
3. เปิด Bluetooth บนมือถือ
4. Restart ESP32 และลองใหม่

### ไม่สามารถเชื่อมต่อ BLE

**วิธีแก้:**

1. ตรวจสอบ BLE permissions ใน Settings
2. ปิด Bluetooth แล้วเปิดใหม่
3. Restart ESP32
4. Restart Mobile App

### เชื่อมต่อ WiFi ไม่สำเร็จ

**วิธีแก้:**

1. ตรวจสอบรหัสผ่าน WiFi และลองกด **ลองใหม่** — อุปกรณ์จะรีเซ็ต BLE session อัตโนมัติหลัง WiFi fail
2. ตรวจสอบว่า ESP32 อยู่ในระยะ WiFi
3. ลองใช้ WiFi network อื่น
4. ตรวจสอบ Serial Monitor เพื่อดู error
5. หากลองใหม่หลายครั้งแล้วยังไม่สำเร็จ ให้ปิด-เปิดอุปกรณ์แล้วเริ่ม setup ใหม่

### WiFi Scanner ไม่แสดง Networks

**วิธีแก้:**

1. เปิด Location Services (Android)
2. อนุญาต Location Permission
3. เปิด WiFi
4. กด "Scan Again"

---

## เปรียบเทียบ: BLE กับ AP Mode

| Feature            | AP Mode (เดิม) | BLE (ใหม่)       |
| ------------------ | -------------- | ---------------- |
| การสลับ WiFi       | ❌ ต้องสลับ    | ✅ ไม่ต้องสลับ   |
| ตั้งค่าในแอป       | ❌ ไม่ได้      | ✅ ได้           |
| WiFi Scanner       | ❌ ไม่มี       | ✅ มี            |
| Android UX         | ❌ ไม่ดี       | ✅ ดี            |
| iOS UX             | ⚠️ พอใช้       | ✅ ดี            |
| เวลาในการตั้งค่า   | ~2-3 นาที      | ~30 วินาที       |
| การจัดการ Error    | ❌ จำกัด       | ✅ ครอบคลุม      |
| Feedback สถานะ     | ❌ ไม่มี       | ✅ Real-time     |

---

## Testing Checklist

### ESP32

- [ ] BLE advertising เริ่มทำงานเมื่อบูต
- [ ] ชื่ออุปกรณ์แสดง code ถูกต้อง
- [ ] รับ WiFi credentials ผ่าน BLE ได้
- [ ] เชื่อม WiFi สำเร็จ
- [ ] ส่ง status updates
- [ ] เชื่อม MQTT ได้หลังเชื่อม WiFi

### แอปมือถือ

- [ ] ขอ BLE permissions
- [ ] สแกนอุปกรณ์ได้
- [ ] กรองอุปกรณ์ตาม code ได้
- [ ] WiFi scanner แสดงเครือข่าย
- [ ] เลือกเครือข่ายได้
- [ ] กรอกเองได้
- [ ] แสดง status updates
- [ ] ข้อความ error ชัดเจน
- [ ] จัดการ timeout ได้

### End-to-End

- [ ] ESP32 ใหม่ → Setup → Online
- [ ] รหัสผ่านผิด → Retry dialog (กรอกรหัสใหม่ได้ทันที ไม่ต้องรีเซ็ตอุปกรณ์)
- [ ] Retry เชื่อม BLE ใหม่แบบเงียบ (ไม่กระพริบไปหน้าสแกน BLE)
- [ ] Provisioning timeout 20s → dialog ขึ้น, background ขาว
- [ ] อยู่นอกระยะ → Timeout error
- [ ] มีหลายอุปกรณ์ → เลือกได้ถูกต้อง
- [ ] อุปกรณ์ที่ online เข้าเส้นทาง backend/MQTT reconfiguration ได้สำเร็จ
- [ ] อุปกรณ์ที่ offline เข้าเส้นทาง BLE provisioning ได้สำเร็จ

---

## เอกสารที่เกี่ยวข้อง

- [สถาปัตยกรรม IoT MQTT](../architecture/iot-mqtt.th.md)
- [Firmware README](../../firmware/esp32/README.th.md)
- [Mobile AI Context](../ai/mobile.md)
