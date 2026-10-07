# Development Plan: 4 Phases

[English](development-plan.md) · [ภาษาไทย](development-plan.th.md)

## Doc Meta

- Audience: PM/Dev/QA
- Source of Truth: Roadmap + codebase
- Status: Active
- Last Updated: May 21, 2026

---

## Overview

This development plan is split into 2 main parts: **Software** (Mobile App + Backend + Admin) and **Hardware** (IoT Device). It shows the order of remaining work and the project's readiness from a roadmap perspective.

## Progress Overview

| Part           | Done | Total |    Status     |
| -------------- | :--: | :---: | :-----------: |
| **Software**   |  27  |  27   | ✅ **100.0%** |
| **Hardware**   |  27  |  27   | ✅ **100.0%** |
| **Total**      |  54  |  54   | ✅ **100.0%** |

> In short: the project is complete for the demonstration (Demo Scope) — all Software + Hardware core features ✅

### Completed Software (27/27):

**Core Features:**

- ✅ Auth
- ✅ Elder (Add/View/Edit)
- ✅ Emergency Call
- ✅ Device Pairing
- ✅ WiFi Config
- ✅ Dashboard Real-time

**Monitoring & Alerts:**

- ✅ Push Notification
- ✅ Monthly Report
- ✅ Notification History
- ✅ False Alarm Handling

**Admin & Quality:**

- ✅ Admin Devices (with stats — Dashboard merged into Devices page)
- ✅ Security Audit (24 fixes)
- ✅ Unit Tests (196)
- ✅ Integration Tests (44)

### Completed Hardware — Demo Scope (27/27)

> **Note:** Hardware core features are complete for the demonstration, 27 items in total, not counting production variants (PCB manufacturing, mass production setup, etc.)

**Connectivity & Provisioning:**

- ✅ ESP32 Wi-Fi + MQTT
- ✅ BLE WiFi Configuration

**Sensing & Detection:**

- ✅ MPU6050 Accel/Gyro readout
- ✅ SMV + Complementary Filter
- ✅ Pulse Sensor HR readout
- ✅ Fall Detection Algorithm (threshold-based)

**Alert & Event Flow:**

- ✅ Grove Speaker
- ✅ JSON over MQTT
- ✅ False Alarm cancel via button

**Power & Hardware Build:**

- ✅ LiPo battery + TP4056
- ✅ Step-Up 5V
- ✅ Working push button
- ✅ Prototype assembly complete
- ✅ PCB/enclosure design
- ✅ Slide Switch
- ✅ Neck strap/Earclip

---

## ⚡ Remaining Work

> Updated: May 10, 2026 — the confirmed core Device/Integration work is complete; only demo presentation preparation remains

### Priority Order

| #   | Task                                                                  | Part      | Priority | Status |
| --- | --------------------------------------------------------------------- | --------- | :------: | :----: |
| 1   | **Demo/Presentation** — prepare the demo for advisors/committee       | All parts |  🟢 Low  |   ⏳   |

### Task Details

#### 1. Real Fall Test

```
To do:
- Test real falls in a safe environment
- Cover the main postures: Forward Fall, Backward Fall, Side Fall
- Check that the device sends the event and alerts correctly
- Record the test results

Expected outcome:
- Confirm that the system detects and sends fall events
- Confirm that the False Alarm cancel button still works normally
```

#### 2. Heart Rate Readout Check

```
To do:
- Confirm that the Pulse Sensor XD-58C reads HR from the real device
- Check that the BPM value is sent into the system and attached to the FALL event when data is available
- Tune the Band-Pass Filter only if the signal is unreadable or very noisy

Expected outcome:
- HR can be read from the real device
- BPM is attached to the FALL event when data is available
```

#### 3. System Integration Test (End-to-End)

```
Test flows to cover:

Flow A — Fall Detection:
  Sensors (MPU6050 + Pulse Sensor) read data → ESP32 processes → detects fall
  → MQTT → Backend → Push Notification → Mobile shows alert → Event History records

Flow B — False Alarm Cancel:
  Sensors detect fall → ESP32 sends values → elder presses the cancel button within 15 seconds
  → MQTT fall_cancelled → Backend updates the event to CANCELLED without notifying Mobile

Flow C — Heart Rate at Fall:
  Pulse Sensor measures HR → ESP32 detects fall + caches BPM → MQTT → Backend attaches the latest BPM (cache ≤ 5 minutes) to FALL event.bpm
  → Mobile shows the BPM at the time of the fall on the Fall Alert screen

Flow D — Device Status:
  ESP32 powers on → MQTT status ONLINE → Backend updates → Mobile shows Online
  ESP32 powers off → timeout → Backend updates OFFLINE → Mobile shows Offline
```

---

# Part 1: Development Plan

## Software Development Plan

### Summary for Presentation

| Phase | Stage                             | Period          |  Status  |
| :---: | --------------------------------- | --------------- | :------: |
|   1   | Core Functions                    | Sep-Nov 2025    | ✅ 100%  |
|   2   | Secondary Functions               | Nov-Dec 2025    | ✅ 100%  |
|   3   | Full Functions                    | Dec 2025-Jan 2026 | ✅ 100%  |
|   4   | Testing & Deployment              | Feb-Mar 2026    | 🔄 66.7% |

**Phase 3 remaining (0 items):**

- None (fully complete)

**Phase 4 main tasks (3 items):**

- ✅ **System Integration:** tested the full Mobile ↔ Backend ↔ ESP32 loop
- ✅ **Sensor Calibration:** tuned fall detection and confirmed pulse readout from the real device
- ⏳ **Demo/Presentation:** prepare the demo for advisors/committee

**Done so far (Phase 4):**

- ✅ System Integration (Mobile ↔ Backend ↔ ESP32)
- ✅ Sensor Calibration (Fall + HR Readout)
- ✅ Deployment (student scope): EAS Build Preview (Mobile), Backend Docker + Cloudflare, Admin Local, MQTT HiveMQ Cloud
- ✅ Security Audit (3 rounds, 24 fixes)
- ✅ Unit Tests (196 tests)
- ✅ Integration Tests (44 tests)

#### Phase 1: Core Functions

**Goal:** users can register, manage elder information, and make emergency calls (before IoT connection)

**Functions (Caregiver):**

- Register/Sign in (Register, Login)
- Manage elder information (Elder Profile)
- Manage emergency contacts (Emergency Contacts)
- Emergency call (Emergency Call)
- Empty Dashboard (Empty State)

**Functions (Admin):**

- Sign in/Sign out (Admin Login/Logout)
- Manage and delete devices (Device List & Management)

#### Phase 2: Secondary Functions

**Goal:** users can pair a device and track Online/Offline status

**Functions (Caregiver):**

- Connect a device (Device Pairing) via QR Code
- Dashboard shows Online/Offline status
- View past events (Event History)

**Functions (Admin):**

- Register devices and generate QR Codes (Register Device)
- List/delete/unpair devices (Device Management)
- Dashboard shows a system overview (System Overview)

#### Phase 3: Full Functions

**Goal:** users receive real-time Sensor data and are notified when abnormal events occur

**Functions (Caregiver):**

- Show Heart Rate and Fall Status in Real-time
- Push Notifications (Fall only, with BPM at time of fall)
- Monthly health report (Monthly Report)
- View notification history (Notification History)

#### Phase 4: Testing & Deployment

**Goal:** the system is integration-tested with the real Hardware and ready for the demo

**Steps:**

- System Integration Testing (Mobile + Backend + Hardware working together)
- Sensor Calibration (real fall tests and pulse readout confirmation)
- Demo Preparation

---

## Hardware Development Plan

### Summary for Presentation

| Phase | Stage                             | Period              |  Status  |
| :---: | --------------------------------- | ------------------- | :-----: |
|   1   | Core Functions                    | Nov 2025 - Jan 2026 | ✅ 100% |
|   2   | Secondary Functions               | Nov 2025 - Jan 2026 | ✅ 100% |
|   3   | Full Functions                    | Dec 2025 - Jan 2026 | ✅ 100% |
|   4   | Testing & Validation              | Feb-Mar 2026        | ✅ 100% |

> **Update May 10, 2026:** the hardware has been fully assembled and is ready for real testing

**Phase 3 remaining (0 items):**

- None (fully complete)

**Phase 4 remaining (all):**

- None (all planned core testing is done)

**Achieved in Phase 4:**

- Real fall tests: Forward/Backward/Side Fall in a safe area
- Pulse readout check: HR read from the Pulse Sensor on the real device
- Basic connectivity: verified that Wi-Fi/MQTT keep working in real use

#### Phase 1: Core Functions

**Goal:** develop the basic hardware so it can detect movement and communicate with the Backend

**Functions:**

- ESP32 + MPU6050 reading Accelerometer/Gyroscope
- Wi-Fi + MQTT connection
- BLE support for Wi-Fi setup

#### Phase 2: Secondary Functions

**Goal:** add a pulse Sensor and a portable power system

**Functions:**

- Pulse Sensor XD-58C pulse measurement
- LiPo Battery + TP4056 charging
- Grove Speaker audible alarm

#### Phase 3: Full Functions

**Goal:** develop the fall detection Algorithm and a complete alert system

**Functions:**

- Fall Detection (Threshold-based)
- JSON over MQTT
- PCB/enclosure and neck strap design

#### Phase 4: Testing & Validation

**Goal:** test real falls and confirm pulse readout from the real device

**Steps:**

- Real fall tests (Forward/Backward/Side Fall)
- Check HR readout and attaching BPM to the FALL event
- Check Wi-Fi/MQTT connectivity in normal use

---

# Part 2: Task Tracking Checklist

## Software Development Tracker

### Phase 1: Core Functions

**Goal:** users can register, manage elder information, and make emergency calls (before IoT connection)

**Actor: Caregiver (family member):**

- [x] Develop user account registration (Register), sign-in (Login), and personal information management
- [x] Develop adding, viewing, and editing elder information (Elder Profile)
- [x] Develop emergency contact list management (Emergency Contacts): add/delete/reorder
- [x] Develop emergency calling (Emergency Call), supporting both manual dialing and dialing from an alert
- [x] Develop the empty Dashboard (Empty State) to support getting started

**Actor: Admin:**

- [x] Develop admin sign-in (Admin Login) and admin account management
- [x] Develop the device status overview: total number of devices, number of paired devices, and unpaired devices

---

### Phase 2: Secondary Functions

**Goal:** users can pair a device and track Online/Offline status

**Actor: Caregiver (family member):**

- [x] Develop device connection (Device Pairing) via QR Code and Manual Entry
- [x] Develop updating the device's Wi-Fi settings (WiFi Update)
- [x] Develop the Dashboard showing device Online/Offline status in Real-time
- [x] Develop viewing past events (Event History) with filters (25, 50, all)

**Actor: Admin:**

- [x] Develop registering devices in the system (Register Device) and generating QR Codes
- [x] Develop viewing the list of all devices and their connection status

---

### Phase 3: Full Functions

**Goal:** users receive real-time Sensor data and are notified when abnormal events occur

**Actor: Elder:**

- [x] Develop cancelling a false alarm (False Alarm) via the button on the device (False Alarm Cancel Button)

**Actor: Caregiver (family member):**

- [x] Develop showing real-time health data (Heart Rate, Fall Status) on the Dashboard
- [x] Develop notifications (Push Notifications) for falls (`fall_confirmed` with BPM at the time of the fall)
- [x] Develop the monthly health report (Monthly Health Report) and summary data
- [x] Develop viewing notification history (Notification History) with status management and item deletion
**Actor: Admin:**

- [x] Develop the Dashboard showing a summary overview of the system (System Overview)
  - Shows the total number of devices, paired devices, and unpaired devices

---

### Phase 4: Testing & Deployment - Feb-Mar 2026

**Goal:** the system is integration-tested with the real Hardware and ready for the demo

**Actor: Development and Testing Team (Dev & QA Team):**

- [x] **System Integration:** test the whole system working together (Mobile - Backend - Firmware)
- [x] **Sensor Calibration:** tune the accuracy of fall detection and pulse measurement
- [x] **Deployment (Student Scope):** live use via EAS Preview + Backend Docker/Cloudflare + Admin Local + HiveMQ Cloud
- [ ] **Demo/Presentation:** prepare the demo for advisors/committee

---

## Hardware Development Tracker

### Phase 1: Core Functions - May 2026 to Jul 2026

**Goal:** develop the basic hardware so it can detect movement and communicate with the Backend

**Basics (ESP32 + MPU6050):**

- [x] The ESP32-DevKitC V4 can read Accelerometer and Gyroscope values from the MPU6050 via I²C
- [x] Write code to compute the Signal Magnitude Vector (SMV) from 3-axis Accelerometer data
- [x] Use a Complementary Filter to combine Accelerometer and Gyroscope signals to estimate Pitch/Roll angles

**Connectivity:**

- [x] The ESP32 connects to Wi-Fi and successfully sends basic data (e.g. "Hello World") to the MQTT Broker
- [x] Support BLE for Wi-Fi setup via the Mobile App

**User Interaction:**

- [x] The push button (Large Push Button) works and detects HIGH/LOW states correctly

---

### Phase 2: Secondary Functions - May 2026 to Jul 2026

**Goal:** add a pulse Sensor and a portable power system

**Additional Sensor (Pulse Sensor XD-58C):**

- [x] Add the Pulse Sensor (XD-58C) connected via GPIO34 (Analog)
- [x] Write code to read the PPG signal and compute heart rate (BPM)
- [x] Use a Band-Pass Filter (0.5-5 Hz) to filter motion noise (already tuned for real use)

**Power System:**

- [x] Build the basic circuit with a LiPo 3.7V 450mAh battery
- [x] Install the TP4056 charging module with overcharge and over-discharge protection
- [x] Use a Power Module (Step-Up Boost 3.7V → 5V) to power the ESP32

**Alert System:**

- [x] Add the Grove Speaker module for audible alarms
- [x] Write code to produce an alarm sound when an abnormal event is detected

---

### Phase 3: Full Functions - Jun 2026 to Aug 2026

**Goal:** develop the fall detection Algorithm and a complete alert system

**Fall Detection Algorithm:**

- [x] Develop and tune the fall detection Algorithm using Threshold-based Analysis
- [x] Set Threshold values for:
  - Total acceleration (SMV) ≈ 2.5g-3.2g to detect Impact
  - Rotation rate ≈ 250-300 °/s to detect loss of balance
  - Stillness period after Impact (Post-Fall Phase) 0.5-1 seconds
- [x] Use Orientation Features (Pitch/Roll) to confirm posture after the fall

**Alerts (MQTT Messaging):**

- [x] Write code to send structured JSON data to the MQTT Broker when detecting:
  - A fall (Fall Detection)
  - Pulse (HR) values, cached to attach to the FALL event (if a fall happens within 5 minutes)
- [x] Support cancelling a false alarm (False Alarm) via the button within 15 seconds (False Alarm Cancel Button)

**Physical Design:**

- [x] Start designing and assembling the device on a PCB or a suitable enclosure
- [x] Install the SS12D00 Slide Switch for powering the device on/off
- [x] Design the neck strap (Neck Strap) and the mounting position of the Easy Earclip for the Pulse Sensor

> **Note:** the Prototype has been assembled on a proto board, and **the PCB/enclosure design for the final version is complete**

---

### Phase 4: Testing & Validation - Feb-Mar 2026

**Goal:** test real falls and confirm pulse readout from the real device

**Real Fall Test:**

- [x] Test the fall detection Algorithm in a safe environment:
  - Forward fall (Forward Fall)
  - Backward fall (Backward Fall)
  - Sideways fall (Side Fall)
- [x] Confirm that the device sends the event and alerts correctly

**Heart Rate Readout:**

- [x] Check that the Pulse Sensor reads HR from the real device
- [x] Check that BPM is attached to the FALL event when data is available

**Basic Validation:**

- [x] Check Wi-Fi and MQTT connectivity in normal use

---

## Related Docs

- [Functional Requirements](functional-requirements.md)
- [Local Deployment Guide](../ops/local-deployment.md)
- [Firmware Practical Operation Guide](../../firmware/esp32/docs/guides/PracticalOperationGuide.md)
