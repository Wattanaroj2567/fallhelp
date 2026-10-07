# START HERE — Fall Detection Sensor Lab Data-Collection Quickstart

[English](START_HERE.md) · [ภาษาไทย](START_HERE.th.md)

> This file is for collecting **Fall Detection Sensor Lab** data.
> It is not a mandatory runbook for the main FallHelp system; skip it if you are not collecting a dataset.
>
> Full documentation: `fall_detection_sensor_lab/README.md` + `trial_protocol.md`

---

## What This File Is For

Use it when you:

- Need to collect baseline activity data (9 activities, 24 trials) for Record 3 and Record 5
- Need logs from `sensor_tuning` written into `fall_detection_sensor_lab/runs/`

Not needed when you want to:

- Test the functional prototype end-to-end
- Demo the fall detection / BPM / notification pipeline
- Develop mobile / backend / admin / main firmware following the normal flow

---

## Overview: What to Do, in Order

```
Step 1: Prepare the device + Node-RED Dashboard (/ui)
Step 2: Press an activity button in the Dashboard → Countdown 10s → Stop manually (1 Trial = 1 CSV)
Step 3: validate raw CSV
Step 4: pick selected → summarize → generate analysis reports
```

Activity set: standing_still, walking_normal, running_light, sit_normal, sit_hard,
side_fall_left, side_fall_right, forward_fall, backward_fall — 24 trials in total
(see the count per activity in `trial_protocol.md`)

---

## Step 1 — Prepare the Device Before Every Session

### 1.1 Configure the firmware

Open `sensor_tuning/build_profile.h`:

```cpp
#define FALLHELP_SINGLE_SENSOR FALLHELP_SINGLE_SENSOR_MPU6050
```

Upload the firmware → open Serial Monitor (115200 baud)

### 1.2 Always check before starting

```
info          ← check that WiFi and MQTT are connected
profile       ← confirm cancel timeout = 15000ms
fall config   ← note the current thresholds
sensor status ← check that MPU6050 is ready
```

### 1.3 Open the Node-RED Dashboard (keep it open for the whole session)

```bash
npm run sensor-lab -- node-red up
```

When testing is done, or if you want to stop the Node-RED service:

```bash
npm run sensor-lab -- node-red down
```

If you need the host fallback for developers:

```bash
npm install
node scripts/iot/node-red-launch.mjs
```

Open `http://localhost:1880`; the source flow is at
`fall_detection_sensor_lab/node-red/flows/fall-detection-sensor-lab-flow.v2.json`.
Then open the Dashboard at `http://localhost:1880/ui` (the main workflow is the Dashboard;
there is no manual inject anymore)

> Set the broker credentials in the Node-RED editor/env (`MQTT_USERNAME`/`MQTT_PASSWORD`) — do not commit them into the flow JSON
> `mosquitto_sub` can be used for live viewing, but it does not replace the main files

### 1.4 Wear the ESP32 around the neck

- Center of the neck, strap neither too loose nor too tight, same position every trial
- Do not let it swing freely
- Fall activities must be done on a cushion/mattress, with a clear area of ≥ 2×2 meters

---

## Step 2 — Collect Data One Trial at a Time

Use the Dashboard at `/ui` as the single workflow (one tester, minimal clicks).
1 Trial = 1 activity = 1 CSV:

1. Enter the **Session ID** in the Dashboard, e.g. `S01` (set once per round)
2. Press the button for the activity to record (1 of 9 buttons) — `activityLabel`, `expectedType`, `trialId`
   are set automatically (do not guess the activity — press the button that matches the activity actually performed)
3. Wait for the **10-second Countdown** (walk to the test position/get ready on the cushion)
4. Countdown ends → status "Recording: action" → perform the activity → hold for 3–5 seconds
5. Press **Stop Trial** yourself (manual, no auto-stop)
6. Check that the file `Sxx_Txx_activity.csv` was created in `fall_detection_sensor_lab/runs/Sxx/raw/`
   and that the Dashboard advances to the Next Trial automatically
7. Write a `note` if anything abnormal happens; take a photo of the test activity for the results report
8. Complete all 24 trials following `trial_protocol.md`

> The raw CSV may contain movement from getting up/walking back to press Stop — this is acceptable; the scripts select
> only the values around the main event (impact/peak + imu_decision). See `selection_guide.md`

After the session ends: fill in `runs/Sxx/session_notes.md` and `notes.md` right away

---

## Step 3 — Validate raw CSV

```bash
npm run sensor-lab -- validate
```

Checks required columns / metadata / presence of an `imu_decision` row — prints PASS/FAIL per file.
FAIL files: check the cause, fix/re-collect before selecting

---

## Step 4 — Pick Selected Trials and Generate Exports

1. Copy representative trials into `runs/Sxx/selected/` following the criteria in `selection_guide.md`
2. Combine them into tables:

```bash
npm run sensor-lab -- summarize
```

3. Generate the markdown analysis summary reports:

```bash
npm run sensor-lab -- chapters
```

The output is in `fall_detection_sensor_lab/exports/`

> example/export = layout format only. Do not claim real results until there are real CSVs from log collection

---

## Quick Reference — Common Commands

| Command                   | Use when                 |
| ------------------------- | ------------------------ |
| `info`                    | Check overall status     |
| `fall config`             | View current thresholds  |
| `sensor status`           | Check MPU6050 is ready   |
| `mpu test`                | Toggle test mode         |
| `sim fall`                | Test the flow without actually falling |
| `npm run sensor-lab -- validate` | Check raw CSV            |
| `npm run sensor-lab -- all`    | validate+summarize+chapters |

---

## Document Order (For Further Reading)

| What you need                | Open this file                                           |
| ---------------------------- | -------------------------------------------------------- |
| workflow + data-collection rules | `fall_detection_sensor_lab/README.md`                |
| session/trial procedure      | `fall_detection_sensor_lab/trial_protocol.md`            |
| CSV column meanings          | `fall_detection_sensor_lab/csv_schema.md`                |
| selected-trial criteria      | `fall_detection_sensor_lab/selection_guide.md`           |
| using the data in reports    | `fall_detection_sensor_lab/chapter_usage.md`             |
| detailed fall method per activity | `docs/components/FallDetectionGuide.md` → Section 6.3 |
| MQTT/sensor troubleshooting  | `docs/guides/Esp32SystemOperationGuide.md` → Section 7   |
