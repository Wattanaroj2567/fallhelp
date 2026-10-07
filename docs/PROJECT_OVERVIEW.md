# Project Overview

Background, current status, architecture and structure of FallHelp. Short version: [README](../README.md).

## Overview

FallHelp addresses a critical safety need in Thailand's rapidly aging society, where the majority of falls among the elderly occur on flat ground inside the home (bathroom, kitchen, stairs, living room, bedroom). Each fall can cause severe injuries — hip fractures, head trauma — that may leave elderly individuals bedridden.

The system combines a wearable ESP32 device with a caregiver mobile app and an admin panel:

**How it works:**

1. The elderly person wears the neck-worn IoT device at home (WiFi coverage required)
2. The MPU6050 sensor detects fall events using **Threshold-based Analysis** of acceleration and gyroscope data
3. On a suspected fall, the device sounds an audible alert and allows a **15-second cancellation period**
4. If the elderly person presses the physical cancel button within 15 seconds → false alarm dismissed
5. If not cancelled → the backend emits realtime Socket.io alerts, creates notification history, and sends Expo Push notifications
6. Caregivers can view fall history, receive confirmed fall alerts, acknowledge the alert in the app, and call emergency contacts directly

**Key Features:**

- 🔴 Real-time fall detection (forward, backward, side, chair falls) via MPU6050 IMU
- 💓 Heart rate captured at fall time via XD-58C PPG pulse sensor (Easy Earclip mount) — BPM is attached to fall events and shown in monthly reports
- 📱 Mobile caregiver app (iOS & Android) with real-time dashboard
- 🔔 Instant push notifications and in-app alerts on fall detection (includes BPM at time of fall if available)
- 🛡️ False alarm cancellation — physical button on device **only** (within 15s); caregivers acknowledge the confirmed alert in the app
- 📊 Monthly fall history reports and event summaries
- 🌐 Admin panel for device management and operational oversight

## Project Status

FallHelp is an academic senior-project prototype in active development. The current scope focuses on a local/development deployment of the wearable ESP32 device, backend API, caregiver mobile app, and admin dashboard.

Important scope notes:

- The fall-detection algorithm is a prototype threshold-based workflow for senior-project evaluation, not a certified medical device.
- One caregiver account currently manages one elder profile and one paired device in the active product phase.
- A false alarm can only be cancelled by the device wearer using the physical GPIO27 button within 15 seconds.
- Caregivers acknowledge confirmed alerts in the app; acknowledgement resets the app view but does not rewrite the fall event.

## System Architecture

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="./assets/readme/system-architecture.png" alt="FallHelp system architecture diagram" width="920" />
</p>
<!-- markdownlint-enable MD033 -->

FallHelp connects the wearable ESP32 device, MQTT broker, Express backend, PostgreSQL database, caregiver mobile app, push notifications, and admin dashboard into one event pipeline.

**Runtime flow:**

1. ESP32 publishes device status and fall lifecycle events through MQTT.
2. Backend validates incoming payloads, stores fall lifecycle data in PostgreSQL, and emits realtime Socket.io updates when a fall is confirmed.
3. Mobile caregivers receive realtime in-app alerts and Expo Push notifications.
4. Admin dashboard manages device records and operational pairing state through the backend API.

**Fall Detection Pipeline:**

```text
MPU6050 (Accelerometer + Gyroscope)
  -> Threshold-Based Analysis
    -> suspected_fall
      -> 15s cancel timeout
        |-- Button pressed (GPIO27, device wearer only) -> fall_cancelled
        `-- Timeout -> fall_confirmed -> MQTT publish -> Backend -> Alert caregivers
```

## Tech Stack

| Layer              | Technology                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Backend**        | Node.js 24, Express v5.2, TypeScript 6.x                                                   |
| **Database**       | PostgreSQL 18, Prisma ORM 7.8                                                              |
| **Real-time**      | MQTT (Mosquitto 2.x / HiveMQ Cloud), Socket.io 4.8                                         |
| **Mobile**         | React Native 0.83.6, Expo SDK 55, Expo Router 55, NativeWind 4, TypeScript 5.9 via Expo    |
| **Admin**          | React 19, Vite 7, TailwindCSS v4, Heroicons, sonner                                        |
| **Firmware**       | C++ on Arduino IDE 2.x, ESP32-DevKitC V4                                                   |
| **Fall Algorithm** | Threshold-Based Analysis (Accelerometer + Gyroscope)                                       |
| **Auth**           | JWT, login via email/phone identifier, OTP via email for Forgot Password (Resend only)     |
| **Push**           | Expo Push Notifications                                                                    |
| **CI/CD**          | GitHub Actions, Nx Cloud (remote cache + self-healing)                                     |
| **Testing**        | Jest, React Native Testing Library, Supertest                                              |
| **Design**         | Figma (UI/UX mockups)                                                                      |

## Project Structure

```text
fallhelp/
├── apps/
│   ├── backend-api/   # Express v5 + Prisma backend, MQTT, Socket.io, push notifications
│   ├── mobile/        # Expo caregiver mobile app, BLE provisioning, realtime dashboard
│   └── admin/         # Vite + React admin dashboard for device operations
├── firmware/esp32/    # ESP32 production firmware, sensor tuning, and sensor-lab workflow
├── docs/              # Architecture, feature docs, API docs, ops guides, AI context
├── scripts/           # Repo automation for dev, env, audit, Docker, IoT helpers
├── config/            # Shared infrastructure configuration
└── .agent/            # FallHelp-owned AI workflow skills and references
```

Detailed module runbooks live in:

| Area     | Link                                      |
| -------- | ----------------------------------------- |
| Backend  | [apps/backend-api/README.md](../apps/backend-api/README.md) |
| Mobile   | [apps/mobile/README.md](../apps/mobile/README.md)           |
| Admin    | [apps/admin/README.md](../apps/admin/README.md)             |
| Firmware | [firmware/esp32/README.md](../firmware/esp32/README.md)     |
| Docs map | [docs/README.md](./README.md)                         |
