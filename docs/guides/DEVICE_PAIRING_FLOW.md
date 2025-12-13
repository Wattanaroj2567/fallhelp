# Device Pairing & WiFi Configuration

# ขั้นตอนการจับคู่อุปกรณ์และตั้งค่า WiFi

คู่มือนี้อธิบาย Flow การจับคู่อุปกรณ์ ESP32 กับแอป

---

## Overview

การจับคู่อุปกรณ์มี 2 ขั้นตอนหลัก:

1. **Device Pairing** - ผูกอุปกรณ์กับผู้สูงอายุ
2. **WiFi Configuration** - ตั้งค่า WiFi ให้อุปกรณ์

---

## Phase 1: Device Pairing (ผูกอุปกรณ์)

### Flow Diagram

```
Admin สร้างอุปกรณ์ → QR Code บนกล่อง → ผู้ใช้สแกน → อุปกรณ์ถูกผูก
```

### ขั้นตอน

| Step | Action                      | API                         |
| :--: | --------------------------- | --------------------------- |
|  1   | Admin สร้างอุปกรณ์ในระบบ    | `POST /admin/devices`       |
|  2   | ผู้ใช้สร้างข้อมูลผู้สูงอายุ | `POST /elders`              |
|  3   | ผู้ใช้สแกน QR Code จากกล่อง | -                           |
|  4   | แอปเรียก API ผูกอุปกรณ์     | `POST /devices/{code}/pair` |

### QR Code Format

```json
{
  "deviceCode": "FH-DEV-001",
  "serialNumber": "ESP32-1764126167230-1"
}
```

### API: Pair Device

```
POST /api/devices/{deviceCode}/pair
```

**Request:**

```json
{
  "elderId": "uuid-of-elder"
}
```

**Response:**

```json
{
  "success": true,
  "device": {
    "id": "device-uuid",
    "deviceCode": "FH-DEV-001",
    "status": "OFFLINE",
    "elderId": "elder-uuid"
  }
}
```

---

## Phase 2: WiFi Configuration (ตั้งค่า WiFi)

### วิธีที่แนะนำ: ESP32 Access Point Mode

```
ESP32 เปิด AP → ผู้ใช้เชื่อมต่อ → ส่ง WiFi Config → ESP32 เชื่อม WiFi บ้าน
```

### ขั้นตอน

| Step | Action                         | Device/App                    |
| :--: | ------------------------------ | ----------------------------- |
|  1   | ESP32 เปิด Access Point        | SSID: `FallHelp-{deviceCode}` |
|  2   | ผู้ใช้เชื่อมต่อ WiFi ของ ESP32 | Password: `fallhelp123`       |
|  3   | แอปแสดงหน้าเลือก WiFi บ้าน     | แสดงรายการ WiFi               |
|  4   | ผู้ใช้ใส่รหัส WiFi บ้าน        | -                             |
|  5   | แอปส่ง Config ไป ESP32         | HTTP POST to `192.168.4.1`    |
|  6   | ESP32 เชื่อมต่อ WiFi บ้าน      | ปิด AP Mode                   |
|  7   | ESP32 ส่งสถานะไป Backend       | MQTT: `device/{id}/status`    |

### ESP32 Access Point

```
SSID: FallHelp-FH-DEV-001
Password: fallhelp123
IP: 192.168.4.1
```

### Config Endpoint (ESP32)

```
POST http://192.168.4.1/config
```

**Request:**

```json
{
  "ssid": "Home_WiFi",
  "password": "wifi_password",
  "deviceCode": "FH-DEV-001"
}
```

---

## Device Status Flow

```
UNPAIRED → OFFLINE → ONLINE
```

| Status   | Description                     |
| -------- | ------------------------------- |
| UNPAIRED | ยังไม่ได้ผูกกับผู้สูงอายุ       |
| OFFLINE  | ผูกแล้ว แต่ยังไม่เชื่อมต่อ WiFi |
| ONLINE   | เชื่อมต่อและทำงานปกติ           |

---

## Mobile App Implementation

### QR Scanner

```typescript
import { BarCodeScanner } from "expo-barcode-scanner";

const handleScan = async ({ data }) => {
  const { deviceCode } = JSON.parse(data);

  const response = await api.post(`/devices/${deviceCode}/pair`, {
    elderId: selectedElderId,
  });

  if (response.success) {
    router.push("/wifi-config");
  }
};
```

### WiFi Config Screen

```typescript
const sendWiFiConfig = async () => {
  // ส่งไปยัง ESP32 โดยตรง
  await fetch("http://192.168.4.1/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ssid: selectedWifi,
      password: wifiPassword,
      deviceCode: deviceCode,
    }),
  });

  router.replace("/(tabs)");
};
```

---

## Troubleshooting

| ปัญหา                  | วิธีแก้ไข                   |
| ---------------------- | --------------------------- |
| ไม่เห็น WiFi ของ ESP32 | รอ 30 วินาทีหลังเปิดอุปกรณ์ |
| เชื่อมต่อ ESP32 ไม่ได้ | รีสตาร์ทอุปกรณ์             |
| Status ยังเป็น OFFLINE | ตรวจสอบรหัส WiFi ถูกต้อง    |
| QR Scan ไม่ได้         | ตรวจสอบ Camera Permission   |

---

**Last Updated:** December 13, 2025  
**Status:** Backend & Mobile Implementation Complete
