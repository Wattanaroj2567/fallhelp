# Functional Requirements

[English](functional-requirements.md) · [ภาษาไทย](functional-requirements.th.md)

## Doc Meta

- Audience: Product/Dev/QA
- Source of Truth: [apps/mobile/app/](../../apps/mobile/app), [apps/backend-api/src/](../../apps/backend-api/src), [apps/admin/src/](../../apps/admin/src)
- Status: Active
- Last Updated: May 21, 2026

---

## Overview

This document summarises the functional requirements of the FallHelp system based on the current code. It focuses on 2 primary actors, Caregiver and Admin, with 1 supporting actor, the Elder (the elderly person wearing the device), and 1 external system actor, the IoT Device, under the Single-Caregiver model (1 family caregiver : 1 elder).

## Terminology (Standard Terms)

- Account registration: creating a new account for a system user (Caregiver/Admin) for their first sign-in
- Device registration: adding a new device to the system, done by the Admin
- Device pairing: linking a registered device to an elder via a QR Code in the Caregiver app

---

## Actors & Requirements

### 1) Caregiver (Family Member)

A mobile app user who looks after an elder and follows important events

|  ID    | Requirement                                                                                       |
| :----: | ------------------------------------------------------------------------------------------------- |
| FR-C01 | The caregiver can register a user account, sign in, and sign out                                  |
| FR-C02 | The caregiver can recover a forgotten password and set a new password via OTP                     |
| FR-C03 | The caregiver can edit personal information, change password, change email, change phone number, and upload a profile picture |
| FR-C04 | The caregiver can add, view, and edit elder information                                           |
| FR-C05 | The caregiver can pair a device by scanning a QR Code                                             |
| FR-C06 | The caregiver can configure the device's Wi-Fi connection                                         |
| FR-C07 | The caregiver can disconnect the device (Unpair)                                                  |
| FR-C08 | The caregiver can view the Dashboard to follow device status, fall events, and pulse readings in real time |
| FR-C09 | The caregiver receives a Push Notification when a fall occurs, showing the pulse reading at the moment of the fall |
| FR-C10 | The caregiver can tap the "รับทราบแล้ว" (Acknowledged) button in the app to Acknowledge the event and return the fall event card on the Dashboard to normal |
| FR-C11 | The caregiver can add, edit, delete, or reorder the priority of emergency contacts                |
| FR-C12 | The caregiver can tap an emergency contact to open the phone's dialer app and call immediately    |
| FR-C13 | The caregiver can view fall event history and monthly event summary reports                      |
| FR-C14 | The caregiver can view past notification history, mark notifications as read one by one, or mark all as read at once |

### 2) Admin

The system administrator who works through the web-based Admin Panel

|  ID    | Requirement                                                                                                                                                 |
| :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-A01 | The admin can sign in to and sign out of the admin system                                                                                                   |
| FR-A02 | The admin can review an overview of device status in the system: total number of devices, number of paired devices (linked to an elder), and number of unpaired devices (ready for pairing) |
| FR-A03 | The admin can view the device list and status (paired/unpaired, online/offline/waiting for WiFi connection) to track device readiness                       |
| FR-A04 | The admin can register new devices, generate access QR codes, force-unpair devices, and delete unpaired devices from the system                             |

### 3) Elder Wearing the Device (Elder - Supporting Actor)

The person who wears the neck-worn device and interacts through the physical button on the device (not a direct app user)

|  ID    | Requirement                                                                                                   |
| :----: | ------------------------------------------------------------------------------------------------------------- |
| FR-E01 | The elder can press the button on the device to cancel a false alarm                                          |

### 4) Fall Detection Device (IoT Device - External System Actor)

An external device system that works with the Backend via MQTT and BLE provisioning

|  ID    | Requirement                                                                                 |
| :----: | ------------------------------------------------------------------------------------------- |
| FR-I01 | The device can detect fall events and send data to the system via the MQTT protocol         |
| FR-I02 | The device can measure the wearer's pulse rate and send it to the system in real time       |
| FR-I03 | The device can sound an audible alarm when a fall is detected                               |
| FR-I04 | The device can receive a cancel signal from its button and send the cancellation to the system |
| FR-I05 | The device can send its own connection status to the system                                 |

---

## Hardware Reference (Non-Actor)

Hardware specifications used as reference information, not classified as a primary actor

|  ID    | Requirement                                                         |
| :----: | ------------------------------------------------------------------- |
| FR-D01 | The device detects falls using an Accelerometer and Gyroscope       |
| FR-D02 | The device measures pulse (Pulse/PPG)                               |
| FR-D03 | The device sends data to the Backend via MQTT                       |
| FR-D04 | The device supports Wi-Fi setup via BLE (Bluetooth Low Energy)      |
| FR-D05 | The device has a button for cancelling a False Alarm (False Alarm Cancel Button) |
| FR-D06 | The device sounds an alarm when a fall is detected                  |

---

## Primary Flows (Use Cases)

### UC-1: Forgot Password via OTP

1. The caregiver requests an OTP with their email
2. The system sends the OTP by email
3. The caregiver enters the OTP and sets a new password
4. Sign in with the new password

### UC-2: Device Pairing + Wi-Fi Setup (BLE)

1. The caregiver scans the QR Code to pair the device with the elder
2. The caregiver selects a WiFi network and sends the settings via BLE
3. The device connects and reports its status back

### UC-3: Fall Detection — 2 Paths

**Main path (Fall Flow):**

1. The device detects a fall → sends `suspected_fall` via MQTT
2. The device sounds an alarm — opening a **15-second** confirmation window
3. Backend receives the event → creates a `PENDING_CONFIRMATION` event in the DB and sends the internal Socket `event_status_changed/FALL_SUSPECTED`; no Push/alert is sent to the caregiver yet
4. 15 seconds pass without a button press → the device sends `fall_confirmed` → Backend updates to `CONFIRMED` → sends a Push Notification + Socket (`fall_detected` and `event_status_changed/FALL_CONFIRMED`)
5. The fall event card on the Dashboard shows **FALL** until the caregiver taps "รับทราบแล้ว" (Acknowledged) themselves after checking that the wearer is safe — this only returns the fall event card on the Dashboard to normal (`setFallStatus('NORMAL')`); it does not call the API and does not change `cancelledAt` in the DB

**False Alarm path (Pre-Confirmation):**

4b. The wearer presses the cancel button (GPIO27) within 15 seconds → the device sends `fall_cancelled` → Backend only updates `cancelledAt`/`CANCELLED` in the DB; no Socket or Push is sent

**Note:** Push Notifications are sent only for `fall_confirmed`, and a push that has already been sent is not revoked when the caregiver Acknowledges the event in the app

### UC-4: Admin Manages Devices

1. Admin signs in
2. Registers a device and generates a QR Code
3. Checks device status
4. Force-unpairs or deletes unused devices

---

## 3.2.2 Non-Functional Requirements

### Performance

- The system must deliver notifications of important events to the caregiver in real time
- The system must automatically detect offline device status and raise notifications

### Reliability

- The system must Auto-reconnect MQTT and Socket.io to keep communication continuous

### Security

- The system must authenticate users with JWT Authentication on every Request
- The system must hash passwords with Bcrypt before storing them in the database
- The system must enforce role-based access control (RBAC), split into ADMIN and CAREGIVER
- The system must limit the number of Requests per unit of time (Rate Limiting), separately per Endpoint type
- The system must control cross-origin access (CORS), allowing only configured Origins

### Usability

- The application must run on the Android operating system

### Operating Constraints

- The system must operate only in areas with Wi-Fi coverage

### Quantitative Metrics (Being Defined)

- Notification of important events reaches the caregiver within 2 seconds
- Offline/disconnected device status detected within 1 minute
- API response time for general use < 500ms (P95)
- Real-time updates via Socket/MQTT within 500ms (P95)
- BLE provisioning must succeed within 1 attempt
- System Availability >= 99.9%

---

## Validation Targets (Plain Language)

- Must notify within 2 seconds when a fall happens
- Should not raise false alarms more than once per week per user
- Must not miss a fall (target 100%)
- Test with real scenarios at least 50 times
- Use multiple datasets to help set a baseline that matches the system's sensor

**Note:** This section is the validation target for the full future system, not the current Accuracy result of the Fall Detection Sensor Lab

---

## Related Docs

- [`../architecture/system-design.md`](../architecture/system-design.md)
- [`../architecture/project-structure.md`](../architecture/project-structure.md)
- [`../features/device-pairing.md`](../features/device-pairing.md)
- [`../api/api-reference.md`](../api/api-reference.md)
- [`../../firmware/esp32/docs/components/FallDetectionGuide.md`](../../firmware/esp32/docs/components/mpu6050.md)

---
