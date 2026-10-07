# XD-58C Pulse Sensor Guide

[English](pulse-sensor.md) · [ภาษาไทย](pulse-sensor.th.md)

## Doc Meta

- Audience: Hardware Dev, QA
- Source of Truth: `firmware/esp32/src/main_firmware/PulseSensor.ino`, `firmware/esp32/src/sensor_tuning/PulseSensor.ino`
- Status: Active
- Last Updated: May 18, 2026

---

## Overview

The XD-58C measures heart rate from the PPG signal at the ear clip position of the FallHelp device.

This document is the owner doc for the pulse sensor and PPG signal quality. It is not a Fall Detection Sensor Lab document, because the Fall Detection Sensor Lab collects only IMU Basic Activity Collection data.

---

## Scope

This file covers:

1. Facts about the XD-58C and GPIO/ADC
2. Runtime values used to filter beats
3. How to separate Rest, Motion, and signal quality issues
4. A checklist for testing hardware readiness

This file does not cover:

1. Statistical summaries of pulse results
2. Changing the backend event contract
3. Using pulse data as a Fall Detection Sensor Lab metric
4. Tuning the fall detection threshold

---

## Hardware Facts

| Item | Value |
| --- | --- |
| Component | XD-58C Pulse Sensor + Easy Earclip Mount |
| Input pin | `GPIO34` (`ADC1_CH6`) |
| ADC scale | 10-bit, `0..1023` |
| ADC attenuation | `ADC_11db` |
| Library | `PulseSensorPlayground` |

GPIO34 is an input-only pin, suitable for an analog sensor, but watch out for loose wires and noise from body movement.

---

## Firmware Ownership

| Firmware | Role of the pulse sensor |
| --- | --- |
| `main_firmware` | Reads heart rate for the runtime device state and the snapshot attached to fall events |
| `sensor_tuning` | Tests Rest/Motion separately and shows reject reasons, reducing variables from backend/mobile |

Main values shared in the current firmware:

| Value | Current | Purpose |
| --- | --- | --- |
| `PULSE_THRESHOLD_10BIT` | `480` | Base threshold of the waveform |
| `VALID_BPM_MIN` | `40` | Lowest accepted BPM |
| BPM max | `180` | Highest accepted BPM (`HR_VALID_BPM_MAX` or `VALID_BPM_MAX` depending on variant) |
| `SIGNAL_AMP_MIN` | `15` | Lowest amplitude to accept a beat |
| `SIGNAL_AMP_MAX` | `400` | Highest amplitude before it is treated as noise/invalid |
| `HEART_RATE_STALE_TIMEOUT_MS` | `1500 ms` | Reset heart rate when there is no new beat |

---

## Runtime Behavior

PPG pipeline in brief:

```text
raw ADC sample
  -> smoothing / library sample path
  -> PulseSensorPlayground beat detection
  -> amplitude / IBI / BPM gates
  -> accepted beat or rejected beat
  -> heartRate + confidence / abnormal state
```

Reject reasons to watch:

1. `signal_quality` — amplitude too low/high
2. `ibi` — interval between beats is not plausible
3. `bpm_range` — BPM outside the accepted range
4. `bpm_jump` — value changes abnormally fast

Interpretation notes:

1. Rest sessions are used to look at the sensor baseline and clip position
2. Motion sessions are used to look at motion artifact
3. Pulse data is a monitoring signal, not a medical diagnostic tool
4. Quantitative pulse work is a separate future task, not a result of the Fall Detection Sensor Lab

---

## Test Checklist

### Basic Readiness

1. Set `sensor_tuning` to `FALLHELP_SINGLE_SENSOR_PULSE`
2. Upload `sensor_tuning.ino`
3. Open Serial Monitor at `115200`
4. Clip the ear clip firmly in the real usage position
5. Wait for the signal to settle before reading results

### Rest Check

1. Have the wearer stay still for 1-2 minutes
2. Look at raw, smoothed value, BPM, confidence, and reject reason in Serial
3. Confirm that BPM is not stuck and does not swing abnormally
4. If you need a tabular comparison, also collect CSV per that round's runbook

### Motion Check

1. Start with light motion, not intense activity right away
2. See how much motion artifact increases rejects
3. Compare with Rest before deciding whether the problem lies with the sensor, clip, or threshold

---

## Evidence To Collect

| Task | Evidence |
| --- | --- |
| Hardware readiness | Serial log showing init success, raw, voltage, threshold |
| Rest check | Serial log during 1-2 minutes of staying still |
| Motion check | Serial log showing reject reasons during movement |
| Tuning decision | Original value, proposed value, and rationale from the log |

CSV is supplementary evidence only for rounds that intentionally collect tabular data. It is not the default for every pulse session.

---

## Troubleshooting

### No Beat or BPM stays at 0 too long

Check:

1. Is the ear clip firm and in the same position?
2. Does raw ADC change with the actual pulse?
3. Is `PULSE_THRESHOLD_10BIT` too high/low?
4. Has the sensor come off the skin, or is there light interference?

### Rejected Due To Signal Quality

Check:

1. Is the amplitude below `SIGNAL_AMP_MIN` or above `SIGNAL_AMP_MAX`?
2. Is the ADC wire loose or being pulled?
3. Is there more motion artifact than the session intends to test?
4. Is the clip pressing too tight or too shallow?

### Implausible BPM

Check:

1. Is BPM outside the `40..180` range?
2. Is IBI out of range?
3. Is there a sudden jump from motion or noise?
4. Does the stale timeout reset the value quickly per `1500 ms`?

### Rest Passes, But Motion Fails

This means the main problem is likely motion artifact, not baseline sensor failure.

Approach:

1. Adjust the clip position before adjusting the threshold
2. Reduce movement that is outside the scope of that round
3. Collect before/after comparison logs with one variable per round

---

## Related Docs

- [../guides/SensorHardwareOnlyTuningGuide.md](../guides/SensorHardwareOnlyTuningGuide.md)
- [../guides/PracticalOperationGuide.md](../guides/PracticalOperationGuide.md)
- [../references/SensorTheoryReference.md](../references/SensorTheoryReference.md)
