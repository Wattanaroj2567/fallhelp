# FallHelp ESP32 Firmware

[English](README.md) · [ภาษาไทย](README.th.md)

## Doc Meta

- Audience: Hardware Dev, Backend Dev, Mobile Dev, QA
- Source of Truth: `src/main_firmware/`, `src/sensor_tuning/`, and firmware runbooks under `docs/`
- Status: Active
- Last Updated: June 17, 2026

---

**Firmware Scope:** WiFi + MQTT + BLE Provisioning + Sensor Runtime

This document is the landing page for the Arduino side.
It focuses on only 3 things:

1. Getting started quickly
2. Knowing which file to read for each topic
3. Seeing the overall Arduino code file structure

---

## 1) Start Here

There are 2 ways to use it:

Before starting a real test round, follow the phases in
[START_HERE.md](START_HERE.md)

1. Full system integration (Backend + Mobile):
   - Open `firmware/esp32/src/main_firmware/main_firmware.ino`
   - Arduino IDE compiles every `.ino` file in `main_firmware/` together into a single sketch
   - Continue at [ESP32 System Operation Guide](docs/guides/Esp32SystemOperationGuide.md)
2. Test/tune the sensors before integrating with the system:
   - Open `firmware/esp32/src/sensor_tuning/sensor_tuning.ino`
   - Continue at [Sensor Hardware-Only Tuning Guide](docs/guides/SensorHardwareOnlyTuningGuide.md)

---

## 2) Which File to Read for Each Task

| Task                                                 | Owner Doc                                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| Runtime/BLE/WiFi/MQTT/NVS/system commands            | [ESP32 System Operation Guide](docs/guides/Esp32SystemOperationGuide.md)          |
| Hardware-only tuning (no backend yet)                | [Sensor Hardware-Only Tuning Guide](docs/guides/SensorHardwareOnlyTuningGuide.md) |
| Fall detection tuning (MPU6050)                      | [MPU6050 Fall Guide](docs/components/mpu6050.md)                                  |
| Pulse tuning (XD-58C / PPG)                          | [XD-58C Pulse Guide](docs/components/pulse-sensor.md)                             |
| Alert cancel button                                  | [False Alarm Cancel Button Guide](docs/components/cancel-button.md)               |
| Speaker/alert sound                                  | [Grove - Speaker Alert Guide](docs/components/speaker-alert.md)                   |
| Fall Detection Sensor Lab data collection (optional) | [Fall Detection Sensor Lab](fall_detection_sensor_lab/README.md)                  |
| ESP32 system check quickstart                        | [START_HERE](START_HERE.md)                                                       |
| Practical operation guide                            | [Practical Operation Guide](docs/guides/PracticalOperationGuide.md)               |

Notes:

- For runtime constants, serial commands, and system-side troubleshooting, treat `Esp32SystemOperationGuide.md` as the primary reference
- This README does not repeat the in-depth details

---

## 3) Arduino Code File Structure

```
firmware/esp32/
├── README.md                              ← Landing page (this file)
├── START_HERE.md                          ← Test phase order (ADL/Fall/Pulse)
├── docs/
│   ├── README.md                          ← Docs index
│   ├── guides/                           ← Operation guides (runbooks)
│   │   ├── Esp32SystemOperationGuide.md
│   │   ├── SensorHardwareOnlyTuningGuide.md
│   │   ├── PracticalOperationGuide.md
│   │   └── README.md
│   ├── devices/                           ← Per-device guides
│   │   ├── mpu6050.md
│   │   ├── pulse-sensor.md
│   │   ├── cancel-button.md
│   │   └── speaker-alert.md
│   └── references/                        ← Theory/reference documents

├── src/
│   ├── main_firmware/
│   │   ├── main_firmware.ino                  ← Main firmware entry
│   │   ├── BLEProvisioning.ino                ← BLE GATT Server & Provisioning
│   │   ├── WiFiConnectionManager.ino          ← WiFi connection & NVS Config
│   │   ├── DeviceMqttClient.ino               ← MQTT client & handlers
│   │   ├── (sensor log controls in `main_firmware.ino`)
│   │   ├── SensorManager.ino                  ← Orchestrate all sensors/modules
│   │   ├── FallDetectionConfig.ino            ← Fall thresholds & cancel window
│   │   ├── MPU6050_Sensor.ino                 ← Fall detection (IMU)
│   │   ├── PulseSensor.ino                    ← Heart-rate / PPG pipeline
│   │   ├── FalseAlarmCancelButton.ino         ← Cancel button logic (GPIO27)
│   │   ├── AlertSystem.ino                    ← Speaker alert system (GPIO25)
│   │   └── types.h                            ← Shared type definitions
│   └── sensor_tuning/
│       ├── sensor_tuning.ino            ← Hardware-only main entry
│       ├── build_profile.h                    ← single-sensor profile for tuning
│       ├── wifi_secrets.h                     ← WiFi credentials (not committed)
│       ├── SensorLogging.ino                  ← Advanced logging for tuning
│       └── (sensor modules same as main firmware but isolated mode)
├── fall_detection_sensor_lab/          ← Fall Detection Sensor Lab
│   ├── README.md / trial_protocol.md / csv_schema.md / selection_guide.md
│   ├── chapter_usage.md / notes.md
│   ├── examples/                      ← mock CSV/MD (format only)
│   ├── node-red/                      ← flow source + Dockerfile + runtime/
│   │   ├── flows/                     ← fall-detection-sensor-lab-flow.v2.json
│   │   └── runtime/                   ← Node-RED userDir (ignored)
│   ├── scripts/                       ← validate / summarize / generate (.mjs)
│   ├── runs/Sxx/                      ← raw/ + selected/ + session_notes.md
│   └── exports/                       ← Algorithm analysis experiment summary tables (generated)
└── README.md                              ← Landing page (this file)
```

---

## 4) Hardware Mapping (Current)

| Component     | Pin            | Purpose                       |
| ------------- | -------------- | ----------------------------- |
| MPU6050       | SDA=21, SCL=22 | Fall detection (accel + gyro) |
| XD-58C Pulse  | GPIO34 (ADC)   | Heart-rate / PPG              |
| Cancel Button | GPIO27         | Cancel suspected fall         |
| Grove - Speaker | GPIO25 (PWM)   | Local alert                   |

---

## 5) Required Libraries

- BLEDevice / BLEServer / BLEUtils / BLE2902 (ESP32 BLE)
- PubSubClient (MQTT)
- ArduinoJson
- I2Cdev + MPU6050
- PulseSensorPlayground
- Wire (I2C)
- Built-in: WiFi, Preferences

---

## 6) Build Verify (Before Real Use)

Run from the project root:

```bash
# Check the environment first (arduino-cli, core, libraries, and serial port)
node scripts/iot/firmware-doctor.mjs

# Install the Arduino libraries the firmware uses (first time or after moving to a new machine)
node scripts/iot/firmware-arduino-cli.mjs deps

# Main firmware
node scripts/iot/firmware-arduino-cli.mjs compile main

# Hardware-only tuning firmware
node scripts/iot/firmware-arduino-cli.mjs compile tuning
```

Notes:

- `main_firmware` exceeds the size limit with `PartitionScheme=default` (1.2MB APP)
- For real use, use `PartitionScheme=huge_app` (3MB APP)
- The repo's default FQBN is `esp32:esp32:esp32`
- The helper looks for `arduino-cli` on `PATH` first, then falls back to each OS's standard path
- If you do not set the port yourself, the helper first tries to auto-detect it from `arduino-cli board list`, then falls back to `/dev/ttyUSB0` on Unix or `COM3` on Windows
- If monitor/upload/compile gets stuck because the machine is not ready yet, start with `node scripts/iot/firmware-doctor.mjs`
- To upload, use `node scripts/iot/firmware-arduino-cli.mjs upload main` or `node scripts/iot/firmware-arduino-cli.mjs upload tuning`
- If the port is not the default, override it with `FIRMWARE_PORT=/dev/ttyUSB0` or `FIRMWARE_PORT=COM5`
- In PowerShell use `$env:FIRMWARE_PORT='COM5'; node scripts/iot/firmware-arduino-cli.mjs upload main`
- In PowerShell, for the monitor use `$env:MONITOR_PORT='COM5'; node scripts/iot/firmware-monitor.mjs`

---

## 7) Quick End-to-End Flow

1. Upload firmware to ESP32
2. Admin creates the device from the ESP32 serial
3. Mobile performs BLE provisioning (sends SSID/Password)
4. ESP32 connects to WiFi and MQTT
5. Test the sensor/alert flows following each device guide

For step-by-step details:

- [ESP32 System Operation Guide](docs/guides/Esp32SystemOperationGuide.md)
- [Practical Operation Guide](docs/guides/PracticalOperationGuide.md)

---

## 8) Documentation

- [Arduino Docs Index](docs/README.md)
- [ESP32 System Operation Guide](docs/guides/Esp32SystemOperationGuide.md)
- [Practical Operation Guide](docs/guides/PracticalOperationGuide.md)
- [Sensor Hardware-Only Tuning Guide](docs/guides/SensorHardwareOnlyTuningGuide.md)
- [MPU6050 Fall Guide](docs/components/mpu6050.md)
- [XD-58C Pulse Guide](docs/components/pulse-sensor.md)
- [False Alarm Cancel Button Guide](docs/components/cancel-button.md)
- [Grove - Speaker Alert Guide](docs/components/speaker-alert.md)

---

## 9) Glossary

| Term                | Meaning in this project                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `ESP32 Firmware`    | Code that runs on the FallHelp ESP32 board                                      |
| `BLE Provisioning`  | Configuring WiFi over Bluetooth from the phone                                  |
| `MQTT`              | Messaging protocol between the device and the backend                           |
| `Runtime Constants` | Runtime constants such as the cancel window and retry budget                    |
| `Sensor Runtime`    | How the sensors work together while the system is running                      |
| `Owner Doc`         | The primary document for each topic, treated as the source of truth             |
| `Sensor Lab`        | Workflow for collecting sensor values and checking logs to help tune the system |
| `NVS`               | Persistent storage on the ESP32 that survives reboots                           |

---

**Last Updated:** May 30, 2026
**Status:** Active (Owner-doc structure enabled)
