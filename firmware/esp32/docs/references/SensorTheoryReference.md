# Sensor Theory Reference

[English](SensorTheoryReference.md) · [ภาษาไทย](SensorTheoryReference.th.md)

## Doc Meta

- Audience: Dev, QA, Stakeholder, researchers
- Source of Truth: firmware source, component owner docs, curated references
- Status: Active
- Last Updated: May 18, 2026

---

## Overview

This file explains the principles of IMU fall detection and PPG signal processing in FallHelp.

This file is not a runbook and is not where current test-round results are announced.

---

## Firmware Values vs Research Values

Keep the meanings clearly separate:

| Value type | Meaning |
| --- | --- |
| Firmware value | The value the source code actually uses |
| Research/reference value | A value from the literature or a theoretical baseline |
| Tuning candidate | A value proposed for trial in a tuning round |
| Full-study result | A conclusion from a full dataset/protocol, which is not yet in the scope of the Fall Detection Sensor Lab |

Values actually in use must always be cited from the firmware source first.

---

## MPU6050 Fall Detection Concepts

SVM:

```text
SVM = sqrt(ax^2 + ay^2 + az^2)
```

Used to measure the magnitude of the resultant force from the accelerometer.

Posture change:

```text
postureDelta = angle difference around impact window
```

Used to separate forceful non-fall activities from posture changes that qualify as a fall.

Fall detection in the firmware is a threshold-based hybrid approach:

```text
impact magnitude gate
  + duration/stabilization gate
  + postureDelta gate
  -> suspected_fall
  -> cancel/confirm layer
```

Current prototype values in the owner docs:

| Value | Meaning |
| --- | --- |
| `2.0g` | default impact threshold |
| `1500 ms` | default duration/stabilization threshold |
| `45 deg` | default posture threshold |
| `15000 ms` | cancel window |

---

## Complementary Filter

FallHelp uses a complementary filter to combine the accelerometer and gyroscope for pitch/roll.

Concept:

1. The gyroscope responds quickly but can drift
2. The accelerometer can reference gravity but is disturbed during impacts
3. The complementary filter blends the two data sources to make the angle more stable

Conceptual formula:

```cpp
pitch = 0.98f * (pitch + gyroX * dt) + 0.02f * accelPitch;
roll = 0.98f * (roll + gyroY * dt) + 0.02f * accelRoll;
```

Check the actual source before citing implementation details:

1. `firmware/esp32/src/main_firmware/MPU6050_Sensor.ino`
2. `firmware/esp32/src/sensor_tuning/MPU6050_Sensor.ino`

---

## PPG Concepts

PPG measures pulse from changes in light that correlate with blood volume.

Main limitations:

1. motion artifact
2. contact pressure of the ear clip
3. ambient light / sensor placement
4. perfusion at the measurement site

The firmware therefore uses guardrails such as:

| Value | Purpose |
| --- | --- |
| `PULSE_THRESHOLD_10BIT` | waveform threshold |
| `VALID_BPM_MIN` / max | Reject implausible BPM |
| `SIGNAL_AMP_MIN/MAX` | Quality gate based on amplitude |
| `HEART_RATE_STALE_TIMEOUT_MS` | Reset when there is no new beat |

Pulse data is used for monitoring, not medical diagnosis.

---

## Noise Reduction Principles

1. Tune 1 value at a time
2. Keep MPU, Pulse, and system integration in separate rounds
3. Collect raw logs before summaries
4. Compare results with rounds under similar conditions
5. Do not assume lab results equal real-world results

---

## Interpretation Boundaries

1. The Fall Detection Sensor Lab is IMU-only Basic Activity Collection
2. Do not present statistical conclusions as current results
3. Quantitative Pulse work is future work, separate from the Fall Detection Sensor Lab
4. FallHelp is a monitoring system, not a medical diagnostic device

---

## Related Docs

- [ProjectAlignedResearch.md](ProjectAlignedResearch.md)
- [TechnicalGlossary.md](TechnicalGlossary.md)
- [../components/mpu6050.md](../components/mpu6050.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.md)
- [../guides/SensorHardwareOnlyTuningGuide.md](../guides/SensorHardwareOnlyTuningGuide.md)
