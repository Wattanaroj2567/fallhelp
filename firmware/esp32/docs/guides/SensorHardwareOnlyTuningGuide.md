# Sensor Hardware-Only Tuning Guide

[English](SensorHardwareOnlyTuningGuide.md) · [ภาษาไทย](SensorHardwareOnlyTuningGuide.th.md)

## Doc Meta

- Audience: Hardware Dev, QA
- Source of Truth: `firmware/esp32/src/sensor_tuning/`, component owner docs
- Status: Active
- Last Updated: May 18, 2026

---

## Overview

This file is the runbook for `sensor_tuning`, used to tune the MPU6050 or XD-58C while reducing variables from backend/mobile.

It is not the runbook for `main_firmware`, and it is not the detailed lab manual of the Fall Detection Sensor Lab.

---

## Scope

Use this file when:

1. You need to calibrate the MPU6050
2. You need to look at SVM, postureDelta, or threshold in `sensor_tuning`
3. You need to look at PPG rest/motion and reject reasons
4. You need to prepare values to move back to `main_firmware`

Go directly to the Sensor Lab when:

1. You need to collect 24 trials
2. You need to use the Node-RED Dashboard as the main tool
3. You need to validate/summarize/generate analysis exports

---

## Step 1 - Select Sensor Build

Open `firmware/esp32/src/sensor_tuning/build_profile.h`

Choose one:

```cpp
#define FALLHELP_SINGLE_SENSOR FALLHELP_SINGLE_SENSOR_MPU6050
// or
#define FALLHELP_SINGLE_SENSOR FALLHELP_SINGLE_SENSOR_PULSE
```

Rules:

1. Do not tune MPU and Pulse together in the same round
2. If you are switching sensors, close the current round first
3. Record the build profile used in that round's notes

---

## Step 2 - MPU Calibration Path

Use when there are no `MPU_CAL_*` values yet that match the current mounting position.

1. Set `SOFTWARE_CALIBRATION_MODE true`
2. Upload `sensor_tuning.ino`
3. Wear the device in the real position
4. Stand still during warmup and sample collection
5. Collect 400 samples
6. Pick the round whose magnitude is closest to `1.0g`
7. Copy the `MPU_CAL_*` values into `sensor_tuning`
8. Set `SOFTWARE_CALIBRATION_MODE false`
9. Copy the same values to `main_firmware` only when the evidence is complete

For sensor details, see [../components/mpu6050.md](../components/mpu6050.md)

---

## Step 3 - Tuning Evidence

Choose evidence according to the task:

| Task | Primary evidence | Supplementary evidence |
| --- | --- | --- |
| MPU calibration | Serial output of `MPU_CAL_*` | notes on pose/sample count |
| MPU threshold tuning | Serial log of SVM/postureDelta/gate | CSV only for rounds that need a tabular comparison |
| Pulse rest/motion | Serial log of BPM/reject reason | CSV only for rounds that need a tabular comparison |
| Fall Detection Sensor Lab | Node-RED CSV | Serial log and session notes |

---

## Step 4 - Run Sensor Workflow

### MPU Tuning

1. Confirm `FALLHELP_SINGLE_SENSOR_MPU6050`
2. Confirm `SOFTWARE_CALIBRATION_MODE false`
3. Upload `sensor_tuning.ino`
4. Open Serial Monitor at `115200`
5. Run `info`
6. Look at the gates in the log: SVM, duration, postureDelta
7. Change only 1 value at a time

### Pulse Rest / Motion

1. Confirm `FALLHELP_SINGLE_SENSOR_PULSE`
2. Upload `sensor_tuning.ino`
3. Clip the ear clip in the real usage position
4. Collect Rest before Motion
5. Look at BPM, confidence, amplitude, IBI, and reject reason
6. Change only 1 value at a time

### Fall Detection Sensor Lab

1. Use the workflow in [../../fall_detection_sensor_lab/README.md](../../fall_detection_sensor_lab/README.md)
2. Open the Node-RED Dashboard at `/ui`
3. Collect 1 trial = 1 CSV
4. Run `npm run sensor-lab -- validate`

The Fall Detection Sensor Lab is Basic Activity Collection, not sensor log collection.

---

## Step 5 - Move Values Back To main_firmware

Only move values back to `main_firmware` when:

1. You have the raw logs of the latest round
2. You know which single value was changed
3. You can explain the before/after results
4. For MPU, it must not change the meaning of the cancel/confirm flow
5. For Pulse, it must not make the runtime UI interpret heart rate differently from the existing contract

`main_firmware` is not a place to try out values during tuning.

---

## Troubleshooting

### MQTT / Node-RED Not Arriving

Applies only to tasks that intentionally collect through Node-RED, such as the Fall Detection Sensor Lab.

Check:

1. Is Node-RED running?
2. Is the broker/env config correct?
3. Does the firmware build profile match the sensor?
4. Is calibration mode turned off?

### MPU Not Detecting

Check:

1. Are you in `sensor_tuning` with the MPU build selected?
2. Is `mpu on` diagnostic mode left enabled?
3. Which SVM or postureDelta gate is blocking?
4. Does the calibration match the real worn position?

### Many Pulse Rejects

Check:

1. ear clip
2. ADC wire
3. amplitude range
4. motion artifact

---

## Related Docs

- [PracticalOperationGuide.md](PracticalOperationGuide.md)
- [../components/mpu6050.md](../components/mpu6050.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.md)
- [../../fall_detection_sensor_lab/README.md](../../fall_detection_sensor_lab/README.md)
