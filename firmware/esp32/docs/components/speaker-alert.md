# Grove - Speaker Alert Guide

[English](speaker-alert.md) · [ภาษาไทย](speaker-alert.th.md)

## Doc Meta

- Audience: Hardware Dev, QA
- Source of Truth: `firmware/esp32/src/main_firmware/AlertSystem.ino`, `firmware/esp32/src/sensor_tuning/AlertSystem.ino`
- Status: Active
- Last Updated: May 18, 2026

---

## Overview

The speaker output alerts the wearer when the firmware enters the fall alert flow, and it must stop at the right moment when cancel or a state reset succeeds.

This document uses the terms `speaker`, `alert sound`, or `device sound behavior` following the repo terminology.

---

## Scope

This file covers:

1. Facts about the speaker output
2. Differences between `main_firmware` and `sensor_tuning`
3. Device sound behavior that must be preserved
4. A checklist for testing the alert sound

This file does not cover:

1. Changing the fall detection threshold
2. Changing the cancel timeout
3. Adding sound to the Node-RED Dashboard or mobile app
4. Changing the payload or alert flow

---

## Hardware Facts

| Item | Value |
| --- | --- |
| Component | Grove - Speaker |
| Output pin | `GPIO25` |
| Firmware API | `AlertSystem` |
| Output type | PWM tone through the speaker |
| Boot safety | Forces output LOW / duty 0 at startup |

Variant-specific values:

| Firmware | Fall tone | Repeat interval | Default speaker state |
| --- | --- | --- | --- |
| `main_firmware` | `1800 Hz` | `800 ms` | enabled |
| `sensor_tuning` | `800 Hz` | `1500 ms` | controlled by tuning build/profile |

The values above come from the current source. Do not collapse them into a single shared value for both firmware variants.

---

## Firmware Ownership

| Firmware | Role of the speaker |
| --- | --- |
| `main_firmware` | Alert sound of the prototype runtime flow |
| `sensor_tuning` | Used to turn sound on/off during hardware tuning and simulation |

`sensor_tuning` has a runtime command to turn the speaker output on/off during testing, to avoid noise in tuning rounds that do not need sound.

---

## Runtime Behavior

### Fall Alert

```text
suspected_fall
  -> AlertSystem starts alert sound
  -> speaker repeats pattern while alert state is active
```

### Cancel

```text
GPIO27 cancel within timeout
  -> fall_cancelled
  -> AlertSystem stops speaker output
  -> output returns LOW / duty 0
```

### Confirm / Reset

When the firmware ends the alert state or resets the pending fall state, the speaker must not keep sounding.

Cautions:

1. The speaker is local device feedback, not a backend notification
2. There is no dashboard audio in the Fall Detection Sensor Lab
3. Changing the sound must not change the fall detection decision or the MQTT payload

---

## Test Checklist

### Basic Output Check

1. Upload the firmware variant you want to test
2. Open Serial Monitor at `115200`
3. Confirm that speaker init succeeded
4. If it is `sensor_tuning` and sound is off, turn it on with the `speaker` command or the command the firmware shows in help

### Fall Alert Sound Check

1. Run `sim fall`
2. Confirm that the alert sound starts when entering the fall alert state
3. Confirm that the pattern repeats according to the firmware variant in use

### Stop Sound Check

1. While the alert sound is playing, press cancel within 15 seconds
2. Confirm that the sound stops immediately when cancel succeeds
3. Test again by letting it time out, and check that the sound does not persist after the state reset

---

## Evidence To Collect

| Task | Evidence |
| --- | --- |
| Init | Serial log stating speaker/AlertSystem is ready |
| Start alert | Serial log + observation that the sound starts on `suspected_fall` |
| Stop on cancel | Serial log + observation that the sound stops on `fall_cancelled` |
| No stuck output | Observation after state reset that GPIO25 is not stuck sounding |

Node-RED CSV is not needed to prove speaker behavior, unless that round is a Sensor Lab round that already collects data separately.

---

## Troubleshooting

### No sound

Check:

1. Is the speaker correctly wired to `GPIO25`?
2. Does the firmware variant have speaker output enabled?
3. Is the device actually in the alert state?
4. Did PWM attach succeed?
5. Is the power supply sufficient for the speaker?

### Sound does not stop

Check:

1. Does the cancel flow actually work?
2. Did `AlertSystem` receive the stop or reset state command?
3. Was PWM set back to tone 0 / duty 0?
4. Is a simulation or alert state still active?

### Wrong pattern or frequency

Check:

1. Are you testing `main_firmware` or `sensor_tuning`?
2. Use the frequency values of that firmware variant, not those of the other variant
3. Was `AlertSystem.ino` changed without syncing docs/tests?

### Sound at boot

Check:

1. Is GPIO25 forced LOW during setup?
2. Does PWM duty start at 0?
3. Does the speaker wiring or module have a floating input?

---

## Related Docs

- [../guides/Esp32SystemOperationGuide.md](../guides/Esp32SystemOperationGuide.md)
- [../guides/PracticalOperationGuide.md](../guides/PracticalOperationGuide.md)
- [cancel-button.md](cancel-button.md)
- [mpu6050.md](mpu6050.md)
