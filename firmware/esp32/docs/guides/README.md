# ESP32 Guides Index

[English](README.md) · [ภาษาไทย](README.th.md)

## Doc Meta

- Audience: Hardware Dev, QA, AI Agents
- Source of Truth: `firmware/esp32/docs/guides/`, `firmware/esp32/docs/components/`
- Status: Active
- Last Updated: May 18, 2026

---

## Overview

`guides/` is the runbook layer for working with the ESP32 in the correct mode.

Read in this order:

1. Start at [PracticalOperationGuide.md](PracticalOperationGuide.md) to choose the task and evidence
2. For the full system, go to [Esp32SystemOperationGuide.md](Esp32SystemOperationGuide.md)
3. For sensor tuning, go to [SensorHardwareOnlyTuningGuide.md](SensorHardwareOnlyTuningGuide.md)
4. If you need per-device details, open the relevant component guide

---

## Choose Your Guide

| Situation | Document to open | Expected outcome |
| --- | --- | --- |
| Not sure what this task is yet | [PracticalOperationGuide.md](PracticalOperationGuide.md) | Able to choose firmware, evidence, and definition of done |
| Check BLE, WiFi, MQTT, fall flow with backend/mobile | [Esp32SystemOperationGuide.md](Esp32SystemOperationGuide.md) | system integration checklist |
| Tune MPU or Pulse while reducing variables from backend/mobile | [SensorHardwareOnlyTuningGuide.md](SensorHardwareOnlyTuningGuide.md) | hardware-only tuning workflow |
| Collect Fall Detection Sensor Lab data | [../../fall_detection_sensor_lab/README.md](../../fall_detection_sensor_lab/README.md) | lab workflow, protocol, CSV pipeline |

---

## Component Follow-Up

After choosing a guide, open the per-device owner doc when needed:

- [../components/mpu6050.md](../components/mpu6050.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.md)
- [../components/cancel-button.md](../components/cancel-button.md)
- [../components/speaker-alert.md](../components/speaker-alert.md)

---

## Boundaries

1. `main_firmware` is used for system integration and the runtime prototype flow
2. `sensor_tuning` is used for hardware tuning and lab collection
3. The Fall Detection Sensor Lab is Basic Activity Collection, not sensor log collection
4. Node-RED CSV is the primary evidence only for the Sensor Lab or rounds that intentionally collect CSV

---

## Related Docs

- [../README.md](../README.md)
- [../references/README.md](../references/README.md)
- [../../fall_detection_sensor_lab/README.md](../../fall_detection_sensor_lab/README.md)
