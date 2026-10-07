# Using the Data in the Analysis Summary Report

[English](chapter_usage.md) · [ภาษาไทย](chapter_usage.th.md)

This document explains how data from the Sensor Lab is used in the analysis summary report.

## Overview

| Section | Data is used to |
|---|---|
| Algorithm and decision | Explain how the system computes and decides |
| Experimental results summary | Show test results from simulated falls and basic activities |

## Algorithm and Decision (Algorithm Logic)

| Data | Used to write about |
|---|---|
| `ax_g`, `ay_g`, `az_g` | Where `magnitude` comes from |
| `svm_filtered_g` | Impact value used to decide impact |
| `impact_threshold_g` | Impact detection threshold |
| `pitch_before_deg`, `roll_before_deg` | Posture before the event |
| `pitch_after_deg`, `roll_after_deg` | Posture after the event |
| `posture_delta_deg` | Where `postureDelta` comes from |
| `posture_threshold_deg` | Posture change detection threshold |
| `decision` | The system's decision |

## Sensor Processing Pattern

```text
read ax, ay, az
→ compute magnitude
→ compare with impact threshold
→ read Pitch/Roll before and after the event
→ compute postureDelta
→ compare with posture threshold
→ conclude decision
```

## Experimental Results Summary (Experimental Results)

| Data | Used to write about |
|---|---|
| `activity_label` | Which activity was tested |
| `expected_type` | The activity type |
| `magnitude_g` | Impact value (peak) from `selected_values_table.csv` |
| `posture_delta_deg` | The posture change |
| `decision` | What the system decided |
| Test activity photos | Supporting the test results |

## Activity Test Results Summary Table

| Trial | Basic activity tested | Type | Magnitude | Posture Delta | System detection result | Summary |
|---|---|---|---|---|---|---|
| T01 | Standing still | Non-fall | - | - | - | - |
| T02 | Light running | Non-fall | - | - | - | - |
| T03 | Sitting down hard | Non-fall | - | - | - | - |
| T04 | Fall to the left side | Fall | - | - | - | - |

## Summary Table Mapping

| Column | Source |
|---|---|
| Trial | `trial_id` |
| Basic activity tested | `activity_label` translated to Thai |
| Type | `expected_type` translated to Thai |
| Magnitude | `magnitude_g` from `selected_values_table.csv` |
| Posture Delta | `posture_delta_deg` (from the `imu_decision` row) |
| System detection result | `decision` translated to Thai |
| Summary | The AI Agent summarizes from the Log values |

`magnitude_g` is produced by `scripts/summarize_selected.mjs`; it is not the raw `svm_filtered_g`:

- raw multi-row log: use the peak `svm_filtered_g` of the `imu_impact` rows first
  (if there is no impact, use the peak `svm_filtered_g` across all rows in the trial)
- non-fall sample-only log: use the peak `svm_filtered_g` within the trial
- `posture_delta_deg` / `decision` come from the `imu_decision` row
- late post-action values (getting up/walking back to press Stop) are not used as the main value

## Decision Translation

| decision | Shown in the report as (Thai) |
|---|---|
| `ignored` | ไม่พบการล้ม (no fall detected) |
| `suspected_fall` | ตรวจพบการล้ม (fall detected) |
| `fall_confirmed` | ยืนยันการล้ม (fall confirmed) |
| `fall_cancelled` | ยกเลิกการแจ้งเตือน (alert cancelled) |
