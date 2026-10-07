# Practical Operation Guide

[English](PracticalOperationGuide.md) · [ภาษาไทย](PracticalOperationGuide.th.md)

## Doc Meta

- Audience: Hardware Dev, QA, PM
- Source of Truth: `firmware/esp32/src/`, `firmware/esp32/docs/`
- Status: Active
- Last Updated: May 30, 2026

---

## Overview

This file is the central dispatcher before starting ESP32 work. Use it to choose the firmware, evidence, and definition of done that match the task.

---

## Step 1 - Choose One Work Mode

Choose one per round:

| Work mode | Firmware / module | Use when |
| --- | --- | --- |
| System Integration | `main_firmware` | You need to prove BLE, WiFi, MQTT, fall flow, backend/mobile |
| MPU Calibration / Tuning | `sensor_tuning` | You need to look at calibration, SVM, postureDelta, threshold |
| Pulse Rest / Motion | `sensor_tuning` | You need to look at PPG signal, BPM, reject reason |
| Fall Detection Sensor Lab | `sensor_tuning` + Node-RED lab | You need to collect IMU trials as CSV |

Rules:

1. 1 round = 1 goal
2. 1 round = only 1 value may be changed
3. Do not mix system integration, sensor tuning, and the Sensor Lab in the same session

---

## Step 2 - Select Firmware

| Task | Main file |
| --- | --- |
| System Integration | `firmware/esp32/src/main_firmware/main_firmware.ino` plus sibling `.ino` modules |
| Sensor tuning | `firmware/esp32/src/sensor_tuning/sensor_tuning.ino` |
| Fall Detection Sensor Lab | `firmware/esp32/fall_detection_sensor_lab/` |

For System Integration, keep responsibilities separated: `BLEProvisioning.ino` handles BLE status/credentials, `WiFiConnectionManager.ino` handles WiFi/NVS/pending rollback, and `DeviceMqttClient.ino` handles MQTT commands and publishes.

If using `sensor_tuning`:

1. Open `firmware/esp32/src/sensor_tuning/build_profile.h`
2. Select `FALLHELP_SINGLE_SENSOR_MPU6050` or `FALLHELP_SINGLE_SENSOR_PULSE`
3. Check the build profile before every compile

---

## Step 3 - Pre-Flight Checklist

Must pass before starting a round:

1. The correct firmware is uploaded
2. Open Serial Monitor at `115200`
3. Run `info`
4. Run `profile` if the firmware supports it
5. For MPU, place/wear the device still for 3-5 seconds after boot
6. If using the Local Mosquitto service, run `npm run mqtt:check` before flash/provision to confirm that Mosquitto is running and the ESP32 can reach the host LAN IP on port `1883`
7. For the Fall Detection Sensor Lab, open Node-RED per [../../fall_detection_sensor_lab/README.md](../../fall_detection_sensor_lab/README.md)
8. Prepare notes/log files that match the task

---

## Step 4 - Choose Evidence

| Work mode | Primary evidence | Supplementary evidence |
| --- | --- | --- |
| System Integration | Serial + backend/mobile observation | MQTT monitor |
| MPU Calibration / Tuning | Serial log | CSV only for rounds that need a tabular comparison |
| Pulse Rest / Motion | Serial log | CSV only for rounds that need a tabular comparison |
| Fall Detection Sensor Lab | Node-RED CSV | Serial log, session notes |

Node-RED CSV is not the default for every task. It is the primary evidence only for the Fall Detection Sensor Lab.

---

## Step 5 - Run The Right Guide

| Work mode | Guide |
| --- | --- |
| System Integration | [Esp32SystemOperationGuide.md](Esp32SystemOperationGuide.md) |
| MPU Calibration / Tuning | [SensorHardwareOnlyTuningGuide.md](SensorHardwareOnlyTuningGuide.md) + [../components/mpu6050.md](../components/mpu6050.md) |
| Pulse Rest / Motion | [SensorHardwareOnlyTuningGuide.md](SensorHardwareOnlyTuningGuide.md) + [../components/pulse-sensor.md](../components/pulse-sensor.md) |
| Fall Detection Sensor Lab | [../../fall_detection_sensor_lab/README.md](../../fall_detection_sensor_lab/README.md) |

---

## Step 6 - Close The Round

Before closing the round, you must be able to answer:

1. Which firmware/module was used in this round
2. Which value was changed in this round, or whether nothing was changed
3. Where the primary evidence is
4. Whether the result got better, worse, or is still inconclusive, and why
5. Whether the next round should keep the current values or change which 1 value

---

## Definition Of Done

The round can be closed when:

1. The log or CSV can actually be opened and read
2. The notes fully describe the conditions of that round
3. Multiple values were not changed at once in a way that cannot be traced back
4. If the full system was touched, the cancel/confirm flow must not change meaning

---

## Related Docs

- [Esp32SystemOperationGuide.md](Esp32SystemOperationGuide.md)
- [SensorHardwareOnlyTuningGuide.md](SensorHardwareOnlyTuningGuide.md)
- [../components/mpu6050.md](../components/mpu6050.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.md)
- [../../fall_detection_sensor_lab/README.md](../../fall_detection_sensor_lab/README.md)
