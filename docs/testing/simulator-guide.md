# Simulator Guide

[English](simulator-guide.md) · [ภาษาไทย](simulator-guide.th.md)

## Doc Meta

- Audience: Developer, QA
- Source of Truth: `apps/backend-api/scripts/sim-*.ts`
- Status: Active
- Last Updated: October 7, 2026

---

## Overview

FallHelp has simulator scripts for testing the fall pipeline manually without waiting for signals from a real device.
All scripts live in `apps/backend-api/scripts/` and run through the npm scripts of `apps/backend-api`.

If you want web buttons instead of the CLI (good for presentations), use the [device simulator](../../apps/device-simulator/README.md) following the steps in the [demo guide](../demo/DEMO_GUIDE.md).

Simulator scripts are QA/development helpers for creating test data, testing Push/Socket, and checking the pipeline in a controlled way. They are not firmware runtime and do not replace testing with a real device before a demo or release.

---

## Which Script?

```
What do you want to test?
│
├─ Monthly Report / Event History pages (historical data across many days)
│    └─→ sim:events
│
├─ Push Notification + notification page (quick test, no waiting)
│    └─→ sim:push
│
└─ Full 2-stage pipeline with a real cancel window
     ├─ No device / don't want the device to wake up
     │    └─→ sim:fall  (default)
     └─ Device is online and you want to test real firmware
          └─→ sim:fall --hardware
```

---

## sim:events — Seed Historical Data

**File:** `scripts/sim-events.ts`

Creates FALL events spread across the current month (Thai time UTC+7) for testing the Monthly Report and Event History.

### Requires

| What must be running | Required |
|---|---|
| Database (PostgreSQL) | ✅ |
| Backend server | ❌ |
| MQTT broker | ❌ |
| ESP32 device | ❌ |

### Commands

```bash
# seed 10 events (6 CRITICAL + 4 WARNING)
npm run sim:events

# clear all test data in the current month
npm run sim:events -- --clear
```

### Events Created

| Type | Severity | Count | Purpose |
|---|---|---|---|
| FALL + high heart rate (>100 BPM) | CRITICAL | 3 | Test the red HR badge |
| FALL + normal heart rate (60–100) | CRITICAL | 2 | Test the green HR badge |
| FALL + low heart rate (<60) | CRITICAL | 1 | Test the blue HR badge |
| FALL (suspected) | WARNING | 4 | Test peak hour (02:xx) |

> **Note:** WARNING events are not shown on the Event History page (they are filtered out), but they are used to test the peak hour in the Monthly Report.

---

## sim:push — Push Notification (Bypass Hardware)

**File:** `scripts/sim-push.ts`

Creates a FALL CRITICAL event directly in the DB and sends a Push Notification immediately, without going through MQTT or the 2-stage flow.

### Requires

| What must be running | Required |
|---|---|
| Database (PostgreSQL) | ✅ |
| Backend server | ❌ |
| MQTT broker | ❌ |
| ESP32 device | ❌ |

### Commands

```bash
# create a FALL event + send Push (random BPM 85–124)
npm run sim:push

# set the BPM yourself
npm run sim:push -- --bpm 120
```

---

## sim:fall — Full 2-Stage Pipeline

**File:** `scripts/sim-fall.ts`

Simulates the full fall pipeline end to end with a cancel window. Supports 2 modes.

---

### Mode 1: No-Hardware (default)

Sends MQTT events directly to the broker in place of the ESP32; the script simulates the 2 stages itself.

**Topic used:** `device/{serialNumber}/event` — this is a topic the ESP32 *publishes*, not one it subscribes to.
So even if a real device is connected and has battery, **the device will not wake up or do anything**.

#### Requires

| What must be running | Required |
|---|---|
| Database (PostgreSQL) | ✅ |
| Backend server | ✅ |
| MQTT broker | ✅ |
| ESP32 device | ❌ (no effect if connected) |

#### Commands

```bash
# run the pipeline with a 15s cancel window (same as real)
npm run sim:fall

# speed up — 3s cancel window (for dev)
npm run sim:fall -- --fast

# set the cancel window yourself (unit: seconds)
npm run sim:fall -- --timeout 8

# simulate pressing cancel (Cancel mode) - sends fall_cancelled instead of confirmed
npm run sim:fall -- --cancel

# specify the serialNumber yourself (skip the DB query)
npm run sim:fall -- --serial ESP32-XXXXXXXXXXXX
```

#### Flow

```
script
  │
  ├─ [1/2] publish suspected_fall ──→ broker ──→ backend fallHandler
  │                                              └─ create PENDING_CONFIRMATION event
  │                                              └─ emit event_status_changed / FALL_SUSPECTED
  │                                              └─ no caregiver alert / push
  │
  ├─ ⏱  wait for cancel window (15s / --fast 3s / --timeout N)
  │
  └─ [2/2] publish fall_confirmed ──→ broker ──→ backend fallHandler
                                                 └─ update to CRITICAL event
                                                 └─ create Notification record
                                                 └─ send Push Notification
                                                 └─ emit fall_detected + event_status_changed / FALL_CONFIRMED
                                                 
  *(if run with --cancel)*
  └─ [2/2] publish fall_cancelled ──→ broker ──→ backend fallCancelledHandler
                                                 └─ update Event to CANCELLED
                                                 └─ emit event_status_changed / FALL_CANCELLED
                                                 └─ ❌ no Push Notification sent
```

---

### Mode 2: Hardware (`--hardware`)

Sends `{ cmd: "sim_fall" }` to the ESP32 and lets the firmware handle the 2-stage pipeline itself.

**Topic used:** `device/{serialNumber}/cmd` — the ESP32 subscribes to it → the firmware wakes up and actually runs.

#### Requires

| What must be running | Required |
|---|---|
| Database (PostgreSQL) | ✅ |
| Backend server | ✅ |
| MQTT broker | ✅ |
| ESP32 device | ✅ (must be online) |

#### Commands

```bash
npm run sim:fall -- --hardware

# specify the serial yourself
npm run sim:fall -- --hardware --serial ESP32-XXXXXXXXXXXX
```

---

## Comparison Summary

| | sim:events | sim:push | sim:fall | sim:fall --hardware |
|---|---|---|---|---|
| Requires backend server | ❌ | ❌ | ✅ | ✅ |
| Requires MQTT broker | ❌ | ❌ | ✅ | ✅ |
| Requires ESP32 online | ❌ | ❌ | ❌ | ✅ |
| Does a connected device wake up? | ❌ | ❌ | ❌ | ✅ |
| Goes through the real fallHandler | ❌ | ❌ | ✅ | ✅ |
| Socket lifecycle emit works | ❌ | ❌ | ✅ | ✅ |
| Push Notification | ❌ | ✅ | ✅ | ✅ |
| Has a real cancel window | ❌ | ❌ | ✅ | ✅ |
| Best for | Monthly Report / History | Push / Notification UI | Pipeline + Socket + Push | Real end-to-end |

---

## Running Scripts from the Root (Alternative)

```bash
# only sim:fall is exposed at the root
npm run iot:sim-fall               # = sim:fall (no-hardware)
npm run iot:sim-fall -- --hardware # = sim:fall --hardware
```

---

## Related

- [Testing Glossary](./testing-glossary.md)
- [Feature Test Checklist](./feature-test-checklist.md)
- [E2E Critical Path Strategy](./e2e-critical-path.md)
- Script source: `apps/backend-api/scripts/sim-*.ts`
