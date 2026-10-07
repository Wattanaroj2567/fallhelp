# ESP32 System Operation Guide

[English](Esp32SystemOperationGuide.md) · [ภาษาไทย](Esp32SystemOperationGuide.th.md)

## Doc Meta

- Audience: Hardware Dev, Backend Dev, QA
- Source of Truth: `firmware/esp32/src/main_firmware/`, backend MQTT/runtime contracts
- Status: Active
- Last Updated: June 17, 2026

---

## Overview

This file is the runbook for checking `main_firmware` as a full system, from boot, BLE provisioning, WiFi, MQTT, and sensor readiness through to the fall flow.

Use this file when:

1. Working with `main_firmware`
2. You need to prove the device can connect to mobile/backend
3. You need to confirm the flow `suspected_fall -> fall_cancelled / fall_confirmed`

Do not use this file as the Fall Detection Sensor Lab or sensor tuning manual.

---

## System Scope

`main_firmware` covers:

1. BLE provisioning when there is no WiFi config yet
2. WiFi and MQTT runtime connection
3. MPU6050 fall detection
4. XD-58C heart rate monitoring
5. GPIO27 cancel button
6. GPIO25 speaker alert sound

Runtime code is split across the `main_firmware/` folder:

| File | Runtime responsibility |
| ---- | ---------------------- |
| `main_firmware.ino` | Boot orchestration, shared state, Serial CLI |
| `BLEProvisioning.ino` | BLE GATT server, WiFi credential characteristics, mobile status notify |
| `WiFiConnectionManager.ino` | WiFi connect/retry, NVS credential persistence, pending config rollback |
| `DeviceMqttClient.ino` | MQTT transport setup, backend command handling, status/config ACK publish |

---

## Step 1 - Boot And Runtime Check

1. Upload `firmware/esp32/src/main_firmware/main_firmware.ino` (Arduino IDE will compile all `.ino` files in the folder together)
2. Open Serial Monitor at `115200`
3. Run `info`
4. Check the fall cancel timeout value in the `info` output

You should see:

1. The board boots successfully
2. Sensors initialize successfully
3. cancel timeout = `15000 ms`
4. WiFi provisioning attempts = `40`

---

## Step 2 - BLE Provisioning Path

Use when the device has no WiFi config in NVS yet:

1. The device enters BLE advertising/provisioning mode
2. The mobile app scans and finds the ESP32 service
3. The mobile app writes the SSID/password
4. The device leaves BLE provisioning and starts WiFi connect

If the device already has a WiFi config, it must skip BLE provisioning and start WiFi/MQTT auto-connect.

---

## Step 3 - WiFi And MQTT Check

Choose the MQTT profile in `firmware/esp32/src/main_firmware/mqtt_secrets.h` before uploading:

1. HiveMQ Cloud: `HIVEMQ_PORT 8883`, `FALLHELP_MQTT_USE_TLS 1`, set username/password
2. Local Mosquitto: `HIVEMQ_PORT 1883`, `FALLHELP_MQTT_USE_TLS 0`, for no-auth set username/password to `""`

Then check the connection:

1. Confirm that an IP address is obtained
2. Confirm that the MQTT broker connection succeeds
3. If using local tooling, open the MQTT monitor
4. Confirm that status/heartbeat is published on schedule

If MQTT does not come up, check:

1. broker host/port
2. TLS setting
3. username/password or the local no-auth profile
4. network route between the device and the broker

Do not commit real credentials to source or docs.

---

## Step 4 - Sensor Readiness

Check the sensors according to their owner docs:

| Component | Owner doc | What you should see |
| --- | --- | --- |
| MPU6050 | [../components/mpu6050.md](../components/mpu6050.md) | init passes, not in `mpu on` diagnostic mode during the fall test |
| XD-58C | [../components/pulse-sensor.md](../components/pulse-sensor.md) | raw/heart rate is not abnormally stuck |
| Cancel button | [../components/cancel-button.md](../components/cancel-button.md) | GPIO27 is ready |
| Speaker | [../components/speaker-alert.md](../components/speaker-alert.md) | AlertSystem init and output not stuck sounding |

---

## Step 5 - Fall Flow Check

Sequence to prove:

```text
suspected_fall
  -> local alert sound starts
  -> user cancels via GPIO27 within 15s -> fall_cancelled
  OR
  -> timeout without cancel -> fall_confirmed
```

Rules to preserve:

1. `Cancel` is a device-only action via GPIO27
2. The caregiver app can only acknowledge/reset the view
3. Push notifications that have already been sent are not retracted
4. `fall_cancelled` must come only from the device button flow

---

## Serial Commands

| Command | Purpose |
| --- | --- |
| `info` | Show runtime, WiFi, MQTT, cancel timeout, and WiFi provisioning attempts |
| `sensor status` | Check the sensor manager if the firmware build supports it |
| `sim fall` | Simulate the fall flow to check alert/cancel |
| `speaker` / `speaker status` | Test speaker output if the firmware build supports it |
| `reset_nvs` | Clear WiFi/MQTT config and reboot |
| `reboot` | Reboot the board |

The fall threshold values of `main_firmware` are compile-time values in `FallDetectionConfig.ino`; the `fall config` command exists in `sensor_tuning` for Sensor Lab rounds only.

---

## Pass / Fail Criteria

Passes when:

1. Boot is consistent
2. BLE provisioning works when there is no WiFi config
3. WiFi + MQTT actually connect
4. Sensor readiness passes
5. The fall flow is complete for both cancel and confirm

Does not pass yet when:

1. BLE hangs or provisioning fails
2. WiFi succeeds but MQTT does not come up
3. `suspected_fall` occurs but speaker/cancel are not consistent with it
4. Pressing GPIO27 does not produce `fall_cancelled`
5. Timeout does not produce `fall_confirmed`

---

## Evidence To Collect

1. Serial log of boot and `info`
2. Serial/MQTT log of WiFi + MQTT connect
3. Serial log of the fall flow
4. backend/mobile observation for system integration only

Fall Detection Sensor Lab CSV is not needed to prove `main_firmware`.

---

## Related Docs

- [PracticalOperationGuide.md](PracticalOperationGuide.md)
- [../components/mpu6050.md](../components/mpu6050.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.md)
- [../components/cancel-button.md](../components/cancel-button.md)
- [../components/speaker-alert.md](../components/speaker-alert.md)
