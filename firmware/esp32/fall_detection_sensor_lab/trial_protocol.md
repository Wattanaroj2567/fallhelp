# Trial Protocol

[English](trial_protocol.md) · [ภาษาไทย](trial_protocol.th.md)

This document defines the procedure for collecting logs from the wearable device using `sensor_tuning` and Node-RED.

## Data-Collection Scope

This data collection is a set of basic activities (Basic Activity Collection) used to explain how the prototype system works.

| Rule | Details |
|---|---|
| 1 Trial | Perform only 1 activity |
| 1 Trial | Produces 1 CSV file |
| Number of rounds | Equal to the number of Trials |
| Firmware | Uses `sensor_tuning` |
| Sensor | MPU6050 |
| Metadata | Filled in by Node-RED |
| Illustrations | Take photos of the test activities for the results report |

## Steps Before Starting a Session

| Step | Procedure |
|---:|---|
| 1 | Upload the `sensor_tuning` firmware |
| 2 | Check that the device can connect to Wi-Fi / MQTT |
| 3 | Start Node-RED, primarily via Docker: `npm run sensor-lab -- node-red up` |
| 4 | Open the `Fall Detection Sensor Lab` Dashboard at `/ui` and enter the `Session ID`, e.g. `1`, `01`, or `S01`; the system creates the folders automatically (enter it once per round) |
| 5 | Check System / Trial Info: MQTT, Device, IMU sample, and Recording statuses shown as clear colored dots/badges, Last seen age below 3s, and no `Warning: No recent IMU sample` before starting collection |
| 6 | Wear the device in the same position every time |
| 7 | Check that the CSV will be saved in `runs/S01/raw/` |
| 8 | Prepare the test area; fall activities must be done on a cushion or mattress |

Node-RED uses FlowFuse Dashboard 2.0 and the flow `fall-detection-sensor-lab-flow.v2.json`,
reading the MQTT broker from env (`MQTT_BROKER_HOST`, `MQTT_BROKER_PORT`,
`MQTT_USE_TLS`, `MQTT_USERNAME`, `MQTT_PASSWORD`). Never put the real host/credentials in the flow JSON

## Steps per Trial

The tester works alone, mainly using the Dashboard; press a single activity button and the metadata is set automatically

| Step | Procedure |
|---:|---|
| 1 | Press the button for the activity to collect in the Dashboard (normal activities are on the Normal / Daily Activities side, falls on the Fall Simulations side) — `activityLabel`, `expectedType`, `trialId` are set automatically |
| 2 | The Dashboard starts a **10-second Countdown**; use it to walk to the test position/get ready on the cushion |
| 3 | Countdown ends → status "Recording: action" → recording starts |
| 4 | Stay still for 2–3 seconds (baseline), then perform the 1 assigned activity |
| 5 | Hold the post-event posture for 3–5 seconds |
| 6 | Press **Stop Trial** yourself (no auto-stop in this round) |
| 7 | Check that the CSV was created, Current Trial Metadata shows the latest `Last Saved CSV`, and the Dashboard automatically advances Next Trial to the next round |
| 8 | Write a `note` if anything abnormal happened |
| 9 | Take a photo of the test activity for the results report, if there is none yet |

> **Manual Stop note:** Because the tester works alone, after performing the activity/falling they may need to get up or walk back to press Stop.
> Post-action data (getting up/walking back) may end up in the raw CSV — this is acceptable, because the workflow
> goes raw → selected → exports and only the main event window is selected afterwards (see `selection_guide.md`)

## File Naming Pattern

```text
S01_T01_standing_still.csv
S01_T02_walking_normal.csv
S01_T03_running_light.csv
S01_T04_sit_hard.csv
S01_T05_side_fall_left.csv
```

| Part | Meaning |
|---|---|
| S01 | Session 01 |
| T01 | Trial 01 |
| standing_still | Activity performed |
| .csv | Log file |

## Basic Activities to Collect

| Activity Label | Meaning | Expected Type | Number of Trials |
|---|---|---|---:|
| standing_still | Standing still | non_fall | 2 |
| walking_normal | Normal walking | non_fall | 2 |
| running_light | Light running | non_fall | 3 |
| sit_normal | Sitting down normally | non_fall | 2 |
| sit_hard | Sitting down hard | non_fall | 3 |
| side_fall_left | Fall to the left side | fall | 3 |
| side_fall_right | Fall to the right side | fall | 3 |
| forward_fall | Forward fall | fall | 3 |
| backward_fall | Backward fall | fall | 3 |

**24 Trials in total**

## Test Activity Descriptions

| Activity Label | Brief method |
|---|---|
| standing_still | Stand still for 10–15 seconds |
| walking_normal | Walk normally for 10–15 seconds |
| running_light | Run lightly for 10–15 seconds |
| sit_normal | Stand → sit down normally → hold 3–5 seconds |
| sit_hard | Stand → sit down harder than normal → hold 3–5 seconds |
| side_fall_left | Simulated fall to the left onto the cushion |
| side_fall_right | Simulated fall to the right onto the cushion |
| forward_fall | Simulated forward fall onto the cushion |
| backward_fall | Simulated backward fall onto the cushion |

## Photos to Take

| Photo | Used to illustrate |
|---|---|
| Worn device | Test environment |
| Standing still | Normal activity |
| Normal walking | Normal activity |
| Light running | Activity with movement force |
| Sitting down hard | Fall-like activity |
| Fall to the left/right | Side falls |
| Forward fall | Forward fall |
| Backward fall | Backward fall |
| Alert screen | Result after the system detects the event |
