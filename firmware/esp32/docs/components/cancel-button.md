# False Alarm Cancel Button Guide

[English](cancel-button.md) · [ภาษาไทย](cancel-button.th.md)

## Doc Meta

- Audience: Hardware Dev, Backend Dev, QA
- Source of Truth: `firmware/esp32/src/main_firmware/FalseAlarmCancelButton.ino`, `firmware/esp32/src/sensor_tuning/FalseAlarmCancelButton.ino`, `FallDetectionConfig.ino`
- Status: Active
- Last Updated: May 30, 2026

---

## Overview

The cancel button has a single job: let the wearer cancel a `suspected_fall` within the device's cancel window.

This document is the owner doc for the GPIO27 button. It is not a backend, mobile UI, or Sensor Lab document.

---

## Scope

This file covers:

1. Facts about the button and pin
2. The cancel vs acknowledge rule
3. Runtime behavior of the button in the fall flow
4. A checklist for testing the button and the evidence to collect

This file does not cover:

1. Changing the cancel timeout
2. Changing the payload or DB schema
3. Making the caregiver app the one that cancels a fall event
4. Analysis of Fall Detection Sensor Lab CSV

---

## Hardware Facts

| Item | Value |
| --- | --- |
| Component | Large Push Button Module |
| Pin | `GPIO27` |
| Input mode | `INPUT_PULLUP` |
| Press logic | pressed = `LOW`, released = `HIGH` |
| Debounce | `50 ms` |
| Cancel window | `15000 ms` |

`GPIO27` must be wired so the button actually pulls it down to GND, because the firmware uses the internal pull-up.

---

## Firmware Ownership

| Firmware | Role of the button |
| --- | --- |
| `main_firmware` | Used in the main system flow: `suspected_fall -> fall_cancelled / fall_confirmed` |
| `sensor_tuning` | Used to test the MPU-side fall flow and simulation without relying on the full backend/mobile system |

Values that must not change without a cross-stack review:

1. `GPIO27`
2. `50 ms` debounce
3. `15000 ms` cancel timeout
4. The meaning of `fall_cancelled`

---

## Runtime Behavior

Sequence:

```text
suspected_fall
  -> open a 15-second cancel window
  -> wearer presses GPIO27 in time
  -> local alert sound stops
  -> firmware publishes fall_cancelled if MQTT is ready
  -> reset pending fall state
```

If pressed after the cancel window:

```text
suspected_fall
  -> cancel window times out
  -> fall_confirmed
  -> pressing the button after that is not fall_cancelled for this event
```

Business rules:

1. `Cancel` comes only from the wearer via the GPIO27 button
2. The caregiver app can only acknowledge/reset the view on the UI side
3. Cancel does not retract a push notification that has already been sent
4. `fall_cancelled`, `fallStage = CANCELLED`, and `cancelledAt` must come only from the device button flow

---

## Test Checklist

### Basic Hardware Check

1. Upload firmware that supports the fall flow
2. Open Serial Monitor at `115200`
3. Run `info`
4. Confirm that the cancel button is ready and the timeout is `15000 ms`

### Cancel-In-Window Check

1. Start a simulated fall with `sim fall`
2. Wait until it enters `suspected_fall`
3. Press the GPIO27 button within 15 seconds
4. Confirm that the local alert sound stops
5. If MQTT is ready, confirm that `fall_cancelled` is present

### Timeout Check

1. Start a simulated fall with `sim fall`
2. Do not press the button until more than 15 seconds have passed
3. Confirm that the flow goes to `fall_confirmed`
4. Pressing the button after the timeout must not turn the same event back into a cancel

---

## Evidence To Collect

| Task | Evidence |
| --- | --- |
| Hardware check | Serial log showing the button is ready |
| Cancel-in-window | Serial log with the sequence `suspected_fall -> fall_cancelled` |
| Backend path | MQTT/backend monitor showing `fall_cancelled` |
| Timeout path | Serial log with the sequence `suspected_fall -> fall_confirmed` |

For system integration, also collect observations from backend/mobile, but Node-RED Sensor Lab CSV is not needed.

---

## Troubleshooting

### Pressing has no effect

Check:

1. Is the button correctly wired to `GPIO27` and GND?
2. Is the device actually in the `suspected_fall` state?
3. Was it pressed within 15 seconds?
4. Does the uploaded firmware support the fall flow?

### One press is counted multiple times

Check:

1. The condition of the button and signal wiring
2. Whether debounce is still `50 ms`
3. Whether there is noise or a loose wire causing the state to flicker

### Local Cancel works, but the Backend does not see it

Check:

1. Is MQTT connected?
2. Is the firmware's topic publish path working?
3. Is the backend MQTT consumer online?
4. Does the backend log show a validation error?

### Timeout is not exactly 15 seconds

Check:

1. `getFallCancelTimeoutMs()` in the firmware variant in use
2. Whether the cancel timeout was changed without syncing docs/tests

---

## Related Docs

- [../guides/Esp32SystemOperationGuide.md](../guides/Esp32SystemOperationGuide.md)
- [../guides/PracticalOperationGuide.md](../guides/PracticalOperationGuide.md)
- [mpu6050.md](mpu6050.md)
- [speaker-alert.md](speaker-alert.md)
