# Fall Detection Sensor Lab

[English](README.md) · [ภาษาไทย](README.th.md)

This folder is used to collect logs and analyze values from the MPU6050 sensor to calibrate and tune the fall detection thresholds (Sensor Calibration & Threshold Tuning).

## Goals

| Topic | Details |
|---|---|
| Purpose | Collect data from the wearable device to analyze and tune the fall detection thresholds |
| Algorithm and decision | Explains where `magnitude` and `postureDelta` come from |
| Experimental results and comparison | Summarizes test results from simulated falls and basic activities |
| Firmware used | `firmware/esp32/src/sensor_tuning/` |
| MQTT Topic | `device/{deviceSerial}/lab/imu` |
| Output | CSV per trial |

## How It Works

```text
MPU6050
→ read ax, ay, az, gx, gy, gz
→ compute magnitude / SVM
→ check impact threshold
→ compute Pitch / Roll
→ compute postureDelta
→ decide the result
→ send Log to Node-RED
→ write CSV
```

## Fall Detection Sensor Lab Dashboard (Node-RED)

The flow `node-red/flows/fall-detection-sensor-lab-flow.v2.json` has a Web UI (@flowfuse/node-red-dashboard) at `/ui`.
The Dashboard page is named **Fall Detection Sensor Lab**.
It is designed for single-person data collection with minimal manual entry:

The main path for this round is the Docker service:

```bash
npm run sensor-lab -- node-red up
```

Common Docker commands:

```bash
npm run sensor-lab -- node-red build
npm run sensor-lab -- node-red rebuild
npm run sensor-lab -- node-red down       # Stop the Node-RED service when the lab is not in use
npm run sensor-lab -- node-red clean      # Clear old runtime files for a fresh start
npm run sensor-lab -- node-red logs
npm run sensor-lab -- node-red sync-flow
```

The host fallback for developers is `node scripts/iot/node-red-launch.mjs`, but the main Lab
workflow relies on Docker/env/secrets so the MQTT config is not embedded in the flow JSON

| Part | Function |
|---|---|
| Session ID input | Set once, e.g. `S01` (accepts only digits or S##; the system automatically creates the `raw/`, `selected/` folders and `session_notes.md`, and resets the form) |
| Next Trial | Shows the next `trialId`, auto-incremented |
| Trial Control | Buttons split into 2 sides: Normal / Daily Activities and Fall Simulations |
| 9 activity buttons | Pressing one sets `activityLabel` + `expectedType` automatically; normal activities are on the left and falls on the right |
| Countdown | 10-second countdown before recording starts (no sound in the dashboard) |
| Stop Trial | Stop recording manually (manual, no auto-stop) |
| System / Trial Info | Operator-style multiline status with visible status dots for MQTT, Device, IMU sample, optional Warning, Last seen, Last seen age, Current activity/expected type, Next trial ID, Topic `device/+/lab/imu`, and trial metadata (updated every 1 s) |
| Current Trial Metadata | Shows `sessionId`, `trialId`, `activityLabel`, `expectedType`, `recordingState`, and `Last Saved CSV` in the same box as System / Trial Info |
| Recording State | Ready / Countdown / Recording / Stopped / CSV Saved / Countdown cancelled |
| Live Sensor | Grouped into Acceleration, Gyroscope, Impact, Posture, Decision |
| Live Charts | Chart A = Impact Magnitude (SVM) from payload `svmFiltered` with `impactThreshold`; Chart B = Attitude & Posture Delta from `pitch`, `roll`, `postureDelta` with `postureThreshold`; X axis uses `Time`, Y axis uses `SVM Filtered (g)` and `Degrees (deg)` |

The MQTT runtime config is read from env:

| Env | Purpose |
|---|---|
| `MQTT_BROKER_HOST` | broker host, e.g. `host.docker.internal` (local service) or a cloud MQTT host |
| `MQTT_BROKER_PORT` | broker port, e.g. `1883` or `8883` |
| `MQTT_USE_TLS` | `true` for TLS, `false` for local no-TLS |
| `MQTT_USERNAME` | username from the real `.env`, or empty for local no-auth |
| `MQTT_PASSWORD` | password from the real `.env`, or empty for local no-auth |

Never commit real `.env` values or MQTT credentials into the flow/docs

Readiness thresholds: Device Online = lab message ≤ 3s, Stale = > 3–10s,
Offline = none / > 10s; Sensor Receiving = `imu_sample` ≤ 3s

Steps: set the Session → press an activity button → 10 s Countdown → perform the activity → press Stop →
get `{sessionId}_{trialId}_{activityLabel}.csv` in `runs/Sxx/raw/` (1 Trial = 1 CSV)

Names used at each data layer:

| Data layer | Name used |
|---|---|
| Live payload / Dashboard chart | `svmFiltered`, shown as `Impact Magnitude (SVM)` and series `Magnitude (SVM)` |
| Raw CSV | `svm_filtered_g` |
| Export summary | `magnitude_g` |

> The raw CSV may contain post-action movement (getting up/walking back to press Stop).
> That is why this workflow stores the raw log first, then uses `selection_guide.md` to pick the main event window afterwards

> The `sensor_tuning` firmware sends `imu_sample` periodically (every ~300ms) so that non-fall activities
> with no impact still have sensor data; Node-RED controls the recording window.
> It publishes only on the lab topic, does not affect the production event flow, and does not modify `main_firmware`

## Test the Pipeline (No Hardware Needed)

```bash
npm run sensor-lab -- test
```

Simulates the sensor publishing `device/+/lab/imu` exactly like the real `publishLabImuLog()` →
runs the functions of the committed Node-RED flow → all 24 trials →
validate / summarize / generate + checks the firmware↔flow↔schema contract.
It writes only to a temp dir and never touches the real `runs/`

## Key Rules

| Rule | Details |
|---|---|
| 1 Trial | Perform only 1 activity |
| 1 Trial | Produces 1 CSV file |
| Metadata | Filled in by Node-RED |
| Firmware | Sends only sensor values and computed results |
| Raw Data | Kept in `runs/Sxx/raw/` |
| Selected Data | The AI Agent picks them into `runs/Sxx/selected/` |
| Export | Used to prepare tables and analysis summaries |

## Data Structure

| Folder/File | Function |
|---|---|
| `trial_protocol.md` | Session/trial procedure and the list of activities to collect |
| `csv_schema.md` | Meaning of each CSV column and number formats |
| `selection_guide.md` | How the AI Agent selects data |
| `chapter_usage.md` | How the data is used in the results report |
| `session_notes.md` | Notes on problems and observations for each session |
| `node-red/` | Node-RED flow source, Dockerfile, entrypoint, and runtime |
| `node-red/flows/` | Source flow committed to Git |
| `node-red/runtime/` | Node-RED runtime userDir; ignored, not source |
| `runs/Sxx/raw/` | Raw CSV |
| `runs/Sxx/selected/` | Selected CSV |
| `exports/` | Tables/sample analysis summary reports |

## Important Note

Files in `examples/` are mock data to show the **format only**; they are not real test results.
Do not claim they are real test results until there are real CSVs from data collection
