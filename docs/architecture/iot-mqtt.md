# IoT & MQTT Architecture

[English](iot-mqtt.md) · [ภาษาไทย](iot-mqtt.th.md)

## Doc Meta

- Audience: Backend Dev / IoT Dev
- Source of Truth: [mqttClient.ts](../../apps/backend-api/src/iot/mqttClient.ts), [topics.ts](../../apps/backend-api/src/iot/topics.ts), [handlers/](../../apps/backend-api/src/iot/handlers)
- Status: Active
- Last Updated: June 17, 2026

---

## Overview

FallHelp uses the **MQTT Protocol** as the main communication channel between the ESP32 IoT Device and the Backend Server for sending real-time Sensor data (Fall Detection, Heart Rate, Device Status).

---

## System Architecture

The backbone of the system is `ESP32 -> MQTT Broker -> Backend API -> Socket.io / Push / PostgreSQL`

- Firmware sends unified events, status, and config ACKs over MQTT
- The Backend is the hub for validation, dedup, persistence, realtime broadcast, and push notification
- Mobile receives both Socket.io and push, depending on the event type
- Admin reads data through the backend and refreshes device/event status with polling/invalidation

---

## MQTT Topic Structure

### Subscribe Topics (Backend ← Device)

| Topic Pattern         | Handler              | Description                                                                |
| :-------------------- | :------------------- | :------------------------------------------------------------------------- |
| `device/+/fall`       | `fallHandler`        | Fall detection event via direct topic                                      |
| `device/+/heartrate`  | `heartRateHandler`   | Heart rate reading                                                         |
| `device/+/status`     | `statusHandler`      | Device online/offline status                                               |
| `device/+/event`      | `handleUnifiedEvent` | Unified event format (primary — suspected/confirmed/cancelled/hr)          |
| `device/+/config/ack` | `handleConfigAck`    | Config update acknowledgement (WiFi provisioning ACK)                      |
| `device/+/lwt`        | `statusHandler`      | Last Will & Testament — sent by the Broker when a device drops abnormally  |
| `events/+`            | `handleUnifiedEvent` | Alternative unified event topic                                            |

### Publish Topics (Backend → Device)

| Topic                      | Purpose                                              |
| :------------------------- | :--------------------------------------------------- |
| `device/{deviceId}/config` | Sends WiFi config or a reset command to the Device   |

> **Note:** `+` in a topic pattern is the MQTT Wildcard that captures the `deviceId` (the ESP32 Serial Number)

---

## Message Payloads

### Fall Detection Payload

Fields the firmware actually sends (`publishFallLifecycleEvent` in `MPU6050_Sensor.ino`):

```json
{
  "type": "suspected_fall",
  "timestamp": 123456999,
  "magnitude": 9.95,
  "postureDelta": 45.2
}
```

> - The `main_firmware` payload only sends processed snapshots such as `magnitude` and `postureDelta`
> - The backend can still map some aliases of `postureDelta` to support older payloads
> - The Backend always uses **Server Time** when persisting, even if the payload sends a `millis()` `timestamp`

### Heart Rate Payload

Fields the firmware actually sends (from `topics.ts - HeartRatePayload`):

```json
{
  "heartRate": 85,
  "zone": "normal",
  "confidence": "high",
  "isAbnormal": false,
  "alertType": null
}
```

> - `zone`: `"low"` | `"normal"` | `"high"` — heart rate zone
> - `confidence`: `"none"` | `"low"` | `"medium"` | `"high"` — reliability of the PPG signal
> - `alertType`: `"LOW"` | `"HIGH"` | `null` — only sent when abnormal
> - `timestamp` from the ESP32 is `millis()` — the backend always uses **Server Time** instead
> - `confidence: "none"` → Mobile shows `--` instead of the BPM (unreliable signal)

### Device Status Payload

```json
{
  "online": true,
  "signalStrength": -45,
  "firmwareVersion": "1.2.0",
  "ip": "192.168.1.105"
}
```

### Device WiFi Config Payload (Backend → Device)

```json
{
  "wifiSSID": "HomeWiFi",
  "wifiPassword": "<redacted>",
  "requestId": "uuid-for-ack"
}
```

Fall detection thresholds are compile-time firmware values in `FallDetectionConfig.ino`; they are not sent through MQTT config payloads.

### Device Reset Command Payload (Backend → Device)

```json
{
  "action": "RESET_WIFI",
  "deviceSerial": "ESP32-ABCDEF123456",
  "requestId": "uuid-for-ack"
}
```

### Config ACK Payload (Device → Backend)

```json
{
  "requestId": "uuid-for-ack",
  "success": true,
  "timestamp": 123456789,
  "reason": "WIFI_PENDING_VERIFY",
  "ip": "192.168.1.105"
}
```

---

## Unified Event Format

The ESP32 sends Events through a single Topic (`device/{id}/event` or `events/{id}`):

```json
{
  "type": "fall" | "suspected_fall" | "fall_confirmed" | "heart_rate" | "fall_cancelled",
  "event": "low" | "high" | "critical",
  "bpm": 85,
  "magnitude": 9.95,
  "postureDelta": 45.2
}
```

**Backend Route Logic:**

| `type`                              | Handler                   | Action                                |
| :---------------------------------- | :------------------------ | :------------------------------------ |
| `fall`, `fall_confirmed`            | `fallHandler` (confirmed) | Creates a CRITICAL Event + Notify     |
| `suspected_fall`                    | `fallHandler` (suspected) | Creates a WARNING Event (pending)     |
| `heart_rate`, `hr`                  | `heartRateHandler`        | Sends realtime BPM                    |
| `heart_rate_high`, `heart_rate_low` | `heartRateHandler`        | Sends realtime abnormal BPM           |
| `fall_cancelled`, `fall_cancel`     | `fallCancelledHandler`    | Cancels the latest Fall Event         |

---

## 2-Stage Fall Confirmation

**Cancel Window:**

- Firmware constant: `15000 ms` (`FALLHELP_FALL_CANCEL_TIMEOUT_MS`)
- Source of Truth: `firmware/esp32/src/main_firmware/FallDetectionConfig.ino`
- It is a business/firmware invariant and is not persisted to the event row

### Cancel vs Acknowledge Definition (Fixed)

| Action          | Actor     | Trigger                                    | Changes DB                                   |
| --------------- | --------- | ------------------------------------------ | -------------------------------------------- |
| **Cancel**      | Wearer    | Presses the GPIO27 button within 15 s      | ✅ Sets `cancelledAt`                        |
| **Acknowledge** | Caregiver | Taps `รับทราบแล้ว` (Acknowledged) in the app | ❌ No change (only returns the UI to normal) |

> `fall_cancelled` in the DB **must come from the MQTT device flow only** — neither the Caregiver nor the Backend can set `cancelledAt` directly

### Backend -> Mobile Realtime Status

Once the backend receives unified fall events, it sends a caregiver alert only for confirmed incidents; `event_status_changed` is an internal lifecycle signal for mobile:

1. `suspected_fall` → records `PENDING_CONFIRMATION` and sends `event_status_changed/FALL_SUSPECTED`; no Push
2. `fall_confirmed` → updates to `CONFIRMED` and sends `fall_detected` + `event_status_changed/FALL_CONFIRMED` + Push
3. `fall_cancelled` → updates to `CANCELLED` and sends `event_status_changed/FALL_CANCELLED`; no Push

---

## Heart Rate Realtime Behavior (Current)

### Normal BPM Streaming

The firmware continuously sends `heart_rate` with `event=normal` so the app can show live BPM in the normal state:

- Sent immediately when the zone returns to `normal`
- Sent continuously about every 5 seconds while in `normal`

### Abnormal BPM

- `low` / `high` / `critical` are also routed through `heartRateHandler`, but do not create a DB event
- Every BPM value (normal and abnormal) is emitted the same way as `heart_rate_update` to mobile
- If a fall happens around the same time, the latest BPM from the in-memory cache (`latestHeartRateByDevice`) is attached to the FALL event's `bpm` field

---

## Safety Mechanisms

### 1. Ghost Device Prevention

A device that has been Unpaired but still sends data (Ghost Device):

```
Device UNPAIRED → MQTT message received → REJECT + Send RESET_WIFI command
```

### 2. Deduplication

Prevents MQTT QoS 1 retransmission from creating duplicate Events:

| Mode        | Dedup Window | Source (`fallHandler.ts`)      |
| :---------- | :----------- | :----------------------------- |
| `suspected` | 15 seconds   | `FALL_PENDING_DEDUP_PERIOD_MS` |
| `confirmed` | 30 seconds   | `FALL_DEDUP_PERIOD_MS`         |

> ℹ️ The dedup period is a guard against MQTT QoS-1 retransmits — **it is unrelated to the 15-second cancel timeout for pressing the button on the device**

### 3. Config ACK with Timeout

When Config is sent to the Device, the backend waits for an ACK in return:

- **Timeout:** 15 seconds (default hardcoded in `waitForConfigAck()`, unrelated to the fall cancel timeout)
- No ACK → Reject the Promise
- MQTT Disconnect → Reject every Pending ACK

---

## Connection Management

**MQTTClientManager** is a Singleton:

| Feature              | Details                                            |
| :------------------- | :------------------------------------------------- |
| Auto-reconnect       | `reconnectPeriod: 2000ms`                          |
| Connect Timeout      | `15000ms` (Cloud handshake)                        |
| QoS Level            | 1 (At Least Once)                                  |
| Clean Session        | `true`                                             |
| TLS                  | `rejectUnauthorized: true` (HiveMQ Cloud only)     |
| Credential Redaction | WiFi SSID/Password masked in Logs                  |

### Dev Tools

```bash
# Check that the Mosquitto service is running
npm run mqtt:check

# Monitor MQTT messages from the ESP32 in realtime (no backend needed)
npm run mqtt:monitor           # reads MQTT_BROKER_URL from apps/backend-api/.env
npm run mqtt:monitor:local     # Mosquitto localhost:1883
npm run mqtt:monitor -- --topic "device/+/heartrate"  # filter topic
npm run mqtt:monitor -- --verbose   # raw JSON for every message
```

### Local Mosquitto Service For ESP32

Mosquitto runs as a **native service** on the host machine — Docker is not used

**Install:**

```bash
# Windows (Chocolatey)
choco install mosquitto
# Then copy config\mosquitto\mosquitto.conf → C:\Program Files\mosquitto\mosquitto.conf
# and restart the service in Services.msc or: net stop mosquitto && net start mosquitto

# Linux (Debian/Ubuntu)
sudo apt install mosquitto
sudo cp config/mosquitto/mosquitto.conf /etc/mosquitto/conf.d/fallhelp.conf
sudo systemctl enable --now mosquitto
```

**Verify:**

```bash
npm run mqtt:check
```

**The ESP32 uses the host machine's LAN IP directly** (port 1883) — Mosquitto already binds `0.0.0.0`.
Set `HIVEMQ_HOST` in `mqtt_secrets.h` to the machine's actual LAN IP.

**Firewall — allow inbound TCP 1883 for the LAN subnet:**

```powershell
# Windows (PowerShell as Admin)
New-NetFirewallRule -DisplayName "Mosquitto MQTT" -Direction Inbound -Protocol TCP -LocalPort 1883 -RemoteAddress LocalSubnet -Action Allow
```

```bash
# Linux
sudo ufw allow from 192.168.0.0/16 to any port 1883
```

---

## Related Docs

- [System Design](system-design.md)
- [Fall Detection System](../features/fall-detection.md)
- [BLE WiFi Provisioning](../features/device-pairing.md)
- [Firmware AI Context](../ai/firmware.md)
