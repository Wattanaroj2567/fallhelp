# ESP32 Firmware Docs

[English](README.md) · [ภาษาไทย](README.th.md)

## Doc Meta

- Audience: Hardware Dev, Backend Dev, QA
- Source of Truth: Active
- Status: Active
- Last Updated: May 18, 2026

---

## Overview

This doc set is the central map of ESP32 work in FallHelp. It covers the main system firmware, the hardware tuning firmware, and the Sensor Lab.

Reading principles:

1. Start from this index page to choose the task you are about to do
2. Always open the `guide` that matches the operating mode first
3. Open a `component guide` only for the sensor or device you are actually touching
4. For the Fall Detection Sensor Lab, go to `fall_detection_sensor_lab/` for the detailed workflow
5. Only when you need to explain theoretical rationale or cite research, go to `references/`

---

## Reading Path By Goal

| Task | Open this file first | Continue when |
| --- | --- | --- |
| Start a field test round | [guides/PracticalOperationGuide.md](guides/PracticalOperationGuide.md) | You need to choose a firmware mode or prepare evidence |
| Connect the full system with backend/mobile | [guides/Esp32SystemOperationGuide.md](guides/Esp32SystemOperationGuide.md) | You need to check BLE, WiFi, MQTT, fall flow |
| Tune sensors without relying on the backend | [guides/SensorHardwareOnlyTuningGuide.md](guides/SensorHardwareOnlyTuningGuide.md) | You need to separate Pulse/MPU and collect before/after evidence |
| Collect Fall Detection Sensor Lab data | [../fall_detection_sensor_lab/README.md](../fall_detection_sensor_lab/README.md) | You need the Node-RED Dashboard, CSV, or the lab protocol |
| Tune fall detection from the MPU6050 | [components/mpu6050.md](components/mpu6050.md) | You need to understand SVM, postureDelta, threshold, or fall state |
| Tune heart rate from the XD-58C | [components/pulse-sensor.md](components/pulse-sensor.md) | You need to decide on signal quality or accepted rate |
| Check the cancel button | [components/cancel-button.md](components/cancel-button.md) | You need to prove `fall_cancelled` within 15 seconds |
| Check the alert sound | [components/speaker-alert.md](components/speaker-alert.md) | You need to prove the sound starts and stops at the right time |
| Find theoretical rationale or terminology | [references/README.md](references/README.md) | You need to cite a formula, metric, or research |

---

## Document Ownership

| Category | Role | Main files |
| --- | --- | --- |
| Runbook | Step-by-step real-world operating procedures | `guides/*.md` |
| Component Guide | How to test/tune each device | `components/*.md` |
| Reference | Theory, terminology, cited research | `references/*.md` |
| Sensor Lab | Fall Detection Sensor Lab data collection procedure and CSV pipeline | `../fall_detection_sensor_lab/` |

Rules:

- If you need to "do the work", start at `guides/`
- If you need to "tune/debug a device", go to `components/`
- If you need to "explain why this value is used", go to `references/`

---

## Step-by-Step Workflow

### Step 1 — Choose the work mode

1. `main_firmware` — the main prototype firmware for BLE, WiFi, MQTT, fall flow, heart rate, and alert sound
2. `sensor_tuning` — separate firmware for hardware tuning, reducing variables from backend/mobile
3. `fall_detection_sensor_lab` — lab module for Basic Activity Collection and the CSV pipeline
4. If unsure, start from [guides/PracticalOperationGuide.md](guides/PracticalOperationGuide.md)

### Step 2 — Open the right owner doc

1. Full system work → [guides/Esp32SystemOperationGuide.md](guides/Esp32SystemOperationGuide.md)
2. Hardware tuning work → [guides/SensorHardwareOnlyTuningGuide.md](guides/SensorHardwareOnlyTuningGuide.md)
3. Per-sensor work → the relevant component guide

### Step 3 — Prepare evidence

1. Use `capture_commands.md` to record every command
2. Use Serial/backend/mobile/MQTT logs according to the type of work
3. Use CSV from Node-RED only for Sensor Lab work or sensor_tuning work that needs tabular data
4. Use `session_notes.md` to summarize results and the reasons for tuning changes

### Step 4 — Summarize the round

1. Do not draw conclusions without raw logs
2. Only 1 value may be changed per round
3. If the criteria are not met, state clearly why it failed, not just "not good yet"

---

## Active Guides

### Runbooks

- [guides/PracticalOperationGuide.md](guides/PracticalOperationGuide.md)
- [guides/Esp32SystemOperationGuide.md](guides/Esp32SystemOperationGuide.md)
- [guides/SensorHardwareOnlyTuningGuide.md](guides/SensorHardwareOnlyTuningGuide.md)
- [guides/README.md](guides/README.md)

### Component Guides

- [components/mpu6050.md](components/mpu6050.md)
- [components/pulse-sensor.md](components/pulse-sensor.md)
- [components/cancel-button.md](components/cancel-button.md)
- [components/speaker-alert.md](components/speaker-alert.md)

### References

- [references/SensorTheoryReference.md](references/SensorTheoryReference.md)
- [references/TechnicalGlossary.md](references/TechnicalGlossary.md)
- [references/ProjectAlignedResearch.md](references/ProjectAlignedResearch.md)
- [references/README.md](references/README.md)

---

## Related Docs

- [../README.md](../README.md)
- [../START_HERE.md](../START_HERE.md)
- [../fall_detection_sensor_lab/README.md](../fall_detection_sensor_lab/README.md)
