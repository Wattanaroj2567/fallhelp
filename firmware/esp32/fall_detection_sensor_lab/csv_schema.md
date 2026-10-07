# CSV Schema

[English](csv_schema.md) · [ภาษาไทย](csv_schema.th.md)

This document explains the meaning of the columns used in the CSV files from Node-RED.

## Metadata

| Column | Meaning | Example |
|---|---|---|
| `session_id` | Data-collection session ID | `S01` |
| `trial_id` | Trial ID | `T01` |
| `activity_label` | Activity actually performed | `side_fall_left` |
| `expected_type` | Activity type | `fall` |
| `timestamp_ms` | Device time (millis uptime) | `123456` |
| `note` | Note | `fall on mattress` |

## Sensor Raw Data

| Column | Meaning | Unit |
|---|---|---|
| `ax_g` | X-axis acceleration | g |
| `ay_g` | Y-axis acceleration | g |
| `az_g` | Z-axis acceleration | g |
| `gx_dps` | X-axis angular velocity | deg/s |
| `gy_dps` | Y-axis angular velocity | deg/s |
| `gz_dps` | Z-axis angular velocity | deg/s |

## Impact Data

| Column | Meaning | Purpose |
|---|---|---|
| `svm_raw_g` | SVM before filtering | View the raw impact |
| `svm_filtered_g` | SVM after filtering | Compared with the impact threshold |
| `impact_threshold_g` | Impact threshold | Used to decide impact |

## Posture Data

| Column | Meaning | Purpose |
|---|---|---|
| `pitch_deg` | Current Pitch angle | View posture |
| `roll_deg` | Current Roll angle | View posture |
| `pitch_before_deg` | Pitch before/at impact | Compute delta |
| `roll_before_deg` | Roll before/at impact | Compute delta |
| `pitch_after_deg` | Pitch after waiting for stabilization | Compute delta |
| `roll_after_deg` | Roll after waiting for stabilization | Compute delta |
| `pitch_delta_deg` | Pitch change | Used to derive postureDelta |
| `roll_delta_deg` | Roll change | Used to derive postureDelta |
| `posture_delta_deg` | Maximum posture change | Compared with the posture threshold |
| `posture_threshold_deg` | Posture threshold | Used to decide posture |

## Decision Data

| Column | Meaning | Example |
|---|---|---|
| `type` | Log type | `imu_sample`, `imu_impact`, `imu_decision` |
| `state` | Fall detection state | `IDLE`, `POSTURE_CHECK` |
| `decision` | The system's decision | `sample`, `pending`, `suspected_fall`, `ignored` |
| `stabilize_ms` | Time to wait for the posture to settle | `1500` |

> `imu_sample` = periodic snapshot from `sensor_tuning` (every ~300ms) so that non-fall activities
> with no impact still have sensor data. A non-fall activity may have only `imu_sample`
> rows and no `imu_decision` — this is considered correct

## Number Formatting

Decimal rounding applies only to the Sensor Lab path (sensor_tuning lab payload + Dashboard +
summarize/export scripts). It does not affect main_firmware / production payload / DB schema.
Values stay numeric (number)

| Field | Decimals |
|---|---|
| `ax_g`, `ay_g`, `az_g` | 3 |
| `gx_dps`, `gy_dps`, `gz_dps` | 2 |
| `svm_raw_g`, `svm_filtered_g` | 3 |
| `magnitude_g` (export `selected_values_table.csv`) | 2 |
| `pitch_deg`, `roll_deg`, `pitch_before_deg`, `roll_before_deg`, `pitch_after_deg`, `roll_after_deg`, `pitch_delta_deg`, `roll_delta_deg`, `posture_delta_deg` | 2 |
| `impact_threshold_g`, `posture_threshold_deg` | 2 |
| `timestamp_ms`, `stabilize_ms` | integer |
