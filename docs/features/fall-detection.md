# Fall Detection System

[English](fall-detection.md) · [ภาษาไทย](fall-detection.th.md)

## Doc Meta

- Audience: Hardware/Backend/Mobile Dev, QA
- Source of Truth: [main_firmware/](../../firmware/esp32/src/main_firmware/), [fallHandler.ts](../../apps/backend-api/src/iot/handlers/fallHandler.ts), [eventService.ts](../../apps/backend-api/src/services/eventService.ts)
- Status: Active
- Last Updated: June 17, 2026

---

## Overview

The Fall Detection system is the Core Feature of FallHelp. It works by reading values from the Sensor on the ESP32 device and sending data to the Server to alert caregivers.

---

## 1. Hardware Detection (Edge)

The ESP32 device uses an MPU6050 (Accelerometer + Gyroscope) for detection.

- **Algorithm:** Threshold-based (impact strength from SVM + angle change from a Complementary Filter)
- **Logic:**
  1. If the SVM (Signal Vector Magnitude) strength > the prototype's impact threshold (e.g. 2.0g) → **Possible Fall (Impact Spike)**
  2. Wait for the user to become still (Stabilization Window of about 1.5 seconds)
  3. Check the angle change (Posture Delta) computed by the Complementary Filter
  4. If the angle change passes the prototype's posture delta threshold (> 45 degrees) → send an MQTT msg

### MQTT Payload (`device/{id}/event`)

Fields the firmware actually sends (`publishFallLifecycleEvent` in `MPU6050_Sensor.ino`):

```json
{
  "type": "suspected_fall",
  "timestamp": 123456789,
  "magnitude": 2.15,
  "postureDelta": 45.2
}
```

> - The firmware sends only the processed evidence that the backend actually uses: `magnitude` and `postureDelta`
> - The backend stores them in the DB as direct fields on the event: `fallStage`, `magnitude`, `postureDelta`
> - The backend uses **Server Time** as the persisted `timestamp`, even though the payload also carries a `timestamp`

---

## 2. Backend Processing

Source: `apps/backend-api/src/iot/handlers/fallHandler.ts`

### Deduplication

To prevent duplicate submissions (Network Jitter / Retries), the system checks:

- **Suspected Fall:** 15 seconds
- **Confirmed Fall:** 30 seconds
- These values are not the 15-second cancel timeout; they serve a different purpose

### Event States

The current core system uses a 2-stage lifecycle:

1. **Suspected:** The device sends `suspected_fall` first → Backend creates an Event with `fallStage=PENDING_CONFIRMATION`
2. **Confirmed:** If not cancelled → the device sends `fall_confirmed` → Backend updates the same event to `fallStage=CONFIRMED` and sends a push notification

> If there is no existing pending event, the backend still has a fallback that creates a new confirmed event, for compatibility with older firmware/flows

### Lifecycle Rule

For this project's documentation and logic, treat `fallStage` as the source of truth for fall status.

- `PENDING_CONFIRMATION` = still within the confirmation window
- `CONFIRMED` = fall confirmed
- `CANCELLED` = the wearer cancelled using the button on the device

Other fields are supplementary:

- `cancelledAt` = time the cancellation actually happened
- `magnitude`, `postureDelta` = detection evidence

### Cancel Window (Firmware Constant)

- Value used in `main_firmware`: `15000 ms` from `FallDetectionConfig.ino`
- This is a firmware/business-flow rule and is no longer persisted to the event row

---

## 3. False Alarm Cancellation

> **Fixed definitions:**
>
> - **Cancel** = only the wearer **pressing the button on the device (GPIO27)** within 15 seconds → actually changes `cancelledAt` in the DB
> - **Acknowledge (in the app)** = the caregiver has acknowledged the event → **only returns the app's screen view to normal**; does not change the event outcome in the DB

The system has **2 paths** after a `suspected_fall`:

### Flow A: The wearer confirms they did not fall — Cancel (press the device button within 15 s)

1. The wearer presses the cancel button (GPIO27) within 15 seconds
2. The alarm sound stops immediately — the device sends MQTT to topic `device/{serial}/event` with payload `type = "fall_cancelled"`
3. Backend (`fallCancelledHandler.ts`): finds the latest Event still in `PENDING_CONFIRMATION` → updates `cancelledAt` and `fallStage = CANCELLED`
4. Backend sends `event_status_changed/FALL_CANCELLED` so mobile clears its pending guard, but no Push Notification is sent because the lifecycle ended before confirmation

If `fall_cancelled` arrives late after the event has already changed to `CONFIRMED`, the backend must ignore it to prevent rolling back the status after Socket/Push has already been sent.

### Flow B: Button not pressed → system confirms the fall → caregiver Acknowledges in the app

1. After 15 seconds → the device sends `fall_confirmed` → Backend updates `fallStage = CONFIRMED` → sends Push Notification + Socket (`fall_detected` and `event_status_changed/FALL_CONFIRMED`)
2. **The FALL status stays on the app** until the caregiver taps "รับทราบแล้ว" (Acknowledged) themselves
3. The caregiver taps Acknowledge (`รับทราบแล้ว`) → only the app view returns to normal (Alert overlay closes) — **`cancelledAt` in the DB is not changed**

> ⚠️ **Push notifications already sent are not retracted**, whether or not the caregiver Acknowledges. Acknowledging only updates the in-app status.

---

## 4. Mobile Alert Handling

Source: `apps/mobile/hooks/useSocketConnection.ts` + `apps/mobile/store/useFallAlertStore.ts`

### Realtime Fall Lifecycle (Current)

Mobile changes its main fall alert state only from the Socket `fall_detected` event, which means the fall has been confirmed.
`suspected_fall` and `fall_cancelled` are sent as `event_status_changed` to manage the internal pending guard, but they do not show a caregiver alert and do not create a Push Notification.

When the `FALL` status is received:

- **Foreground:** pops up a Full-screen Alert (Overlay) with a siren sound
- **Background:** shows a Push Notification → tapping it opens the Alert screen
- **Action:**
- **Acknowledge:** acknowledged — only closes the Alert overlay in the app; **does not change `cancelledAt` in the DB**
  - **Call:** call the elder/emergency number
  - **Navigate:** view location (Map)

---

## 5. Heart Rate at Fall Time

The BPM at the moment of the fall is stored directly in `Event.bpm` (Int?) of the `FALL` event.
In other words, the backend stores it as the same fall event, but attaches the heart rate at the time of the incident when the sensor was able to read it in time.

- `bpm != null` → heart rate data from the device at fall time is available
- `bpm == null` → no heart rate data (sensor not ready, or old firmware)
- Threshold: Low < 60 BPM, Normal 60–100 BPM, High > 100 BPM
- The monthly report shows the HR distribution (high/normal/low/unknown) from FALL events only
- There is no longer a standalone HR notification

---

## Edge Cases

- **Device Offline:** If the device breaks during a fall → no event (online/offline is checked from `lastOnline`; `wifiStatus` is used to describe WiFi/provisioning status)
- **Single-Caregiver Model:** Currently 1 User ↔ 1 Elder, so the alert flow is sent only to the elder's single owner
- **Internet Loss:** If the device cannot connect to the internet, it will retry sending (Retain msg or send once reconnected)

---

## Related Docs

- [IoT MQTT Architecture](../architecture/iot-mqtt.md)
- [Data Model](../architecture/data-model.md)
- [Firmware AI Context](../ai/firmware.md)
- [Notification System](notifications.md)
