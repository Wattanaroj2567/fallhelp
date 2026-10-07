# Selection Guide for the AI Agent

[English](selection_guide.md) · [ภาษาไทย](selection_guide.th.md)

This document defines how the AI Agent selects data from `runs/Sxx/raw/` into `runs/Sxx/selected/`.

## Goals

| Used for | What kind of data is needed |
|---|---|
| Algorithm and decision | Examples that clearly explain the computation |
| Experimental results summary | Sample test results for each activity |

## Input

| Source | Details |
|---|---|
| `runs/Sxx/raw/*.csv` | Raw CSV from Node-RED |
| `runs/Sxx/session_notes.md` | Session notes |
| `notes.md` | Overall Lab problems |

## Output

| Output | Details |
|---|---|
| `runs/Sxx/selected/*.csv` | Selected CSVs |
| `exports/selected_values_table.csv` | Combined table of test summary values |
| `exports/examples_for_fall_detection_sensor_lab.md` | Algorithm calculation examples |
| `exports/examples_for_chapter_5.md` | Experimental results summary report tables |

## Trial Selection Criteria

| Criterion | Condition |
|---|---|
| Correct activity | `activity_label` matches the activity actually performed |
| Complete data | Has impact and decision data |
| Readable values | Has clear `svm_filtered_g` and `posture_delta_deg` |
| Usable for writing | The decision reasoning can be explained |
| No serious problems | No note saying MQTT dropped or the device came loose |

## Trials to Select

| Type | Select at least |
|---|---:|
| Fall case | 2–3 examples |
| Non-fall case | 2–3 examples |
| False-alarm candidate | 1–2 examples |
| Running case | 1 example |
| Normal activity | 1 example |

## Selection Examples

| Activity | Why it should be selected |
|---|---|
| `side_fall_left` | Clear peak impact, and postureDelta exceeds the threshold |
| `sit_hard` | High magnitude, but postureDelta is below the threshold |
| `running_light` | Magnitude fluctuates, but the decision is not fall |
| `standing_still` | Magnitude close to baseline and no fall event |

## Rules for Picking Values from raw → selected (Important)

The raw CSVs in this round use Manual Stop, so each trial has multiple rows (`imu_sample` along the way,
`imu_impact`, `imu_decision`) and may include movement from getting up/walking back to press Stop.
**Never use late post-action values as the main values in the results summary table**

| Field | Value selection rule |
|---|---|
| `magnitude_g` | Use `svm_filtered_g` from the `imu_impact` row (if there are several rows, use the maximum); if there is no impact, use the peak `svm_filtered_g` in the trial |
| `posture_delta_deg` | Use the value from the `imu_decision` row |
| `decision` | Use the value from the `imu_decision` row |
| non-fall sample-only | May have no `imu_decision` — use the peak `svm_filtered_g` of `imu_sample` as the magnitude |
| late post-action | Not used as a main value (it is only the getting up/walking back period) |

`scripts/summarize_selected.mjs` applies these rules automatically (format-aware: raw multi-row
files with a `type` column use impact/peak; single-row aggregated files are read directly)

## File Naming in selected

```text
fall_side_left_T05.csv
fall_forward_T11.csv
non_fall_sit_hard_T04.csv
non_fall_running_light_T03.csv
normal_standing_T01.csv
```
