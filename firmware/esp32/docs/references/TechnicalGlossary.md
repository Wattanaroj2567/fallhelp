# Technical Glossary

[English](TechnicalGlossary.md) · [ภาษาไทย](TechnicalGlossary.th.md)

## Doc Meta

- Audience: Hardware Dev, Backend Dev, QA, AI Agents
- Source of Truth: firmware source, backend contract docs, component owner docs
- Status: Active
- Last Updated: May 21, 2026

---

## Fall Detection

| Term | Meaning |
| --- | --- |
| `MPU6050` | IMU with an accelerometer and gyroscope |
| `SVM` | Signal Vector Magnitude, the combined magnitude of acceleration |
| `Posture Delta` | Change in body/device angle around the impact window |
| `Impact Threshold` | Impact gate based on SVM |
| `Duration Threshold` | Time/stabilization window gate |
| `Posture Threshold` | Gate on degrees of posture change |
| `suspected_fall` | Firmware has detected a preliminary fall-like event |
| `fall_confirmed` | No cancel within the time limit, so the fall is confirmed |
| `fall_cancelled` | The wearer pressed GPIO27 within the cancel window |

---

## Cancel vs Acknowledge

| Term | Actor | Effect |
| --- | --- | --- |
| `Cancel` | The wearer via GPIO27 | Changes the event to `fall_cancelled` / `CANCELLED` |
| `Acknowledge` | caregiver in the app | Acknowledges or resets the UI-side view; does not change the DB fall stage |
| `Cancel Timeout` | firmware runtime | `15000 ms` in the current prototype |

---

## Pulse / PPG

| Term | Meaning |
| --- | --- |
| `PPG` | Photoplethysmography, measuring pulse from a light signal |
| `BPM` | beats per minute |
| `IBI` | inter-beat interval |
| `Signal Amplitude` | peak-to-trough amplitude used by the quality gate |
| `Beat accepted` | A beat that passes the gates and can be used in calculation |
| `Beat rejected` | A beat that fails a gate, such as amplitude, IBI, BPM range |
| `Stale Timeout` | The time without a new beat after which the firmware resets heart rate |

---

## MQTT / Runtime Topics

| Topic / Term | Meaning |
| --- | --- |
| `device/+/event` | Main MQTT event of the runtime device flow |
| `device/<serial>/heartrate` | heart rate runtime publish path |
| `device/<serial>/status` | device online/status publish path |
| `device/<serial>/config` | backend sends config to the device |
| `device/<serial>/config/ack` | device acknowledges the config |
| `device/<serial>/lab/imu` | lab IMU topic from `sensor_tuning` for the Fall Detection Sensor Lab |

---

## Fall Detection Sensor Lab Terms

| Term | Meaning |
| --- | --- |
| Basic Activity Collection | Collecting IMU activity samples to calibrate criteria and record reported results; not sensor log collection |
| Trial | 1 activity attempt = 1 CSV |
| `imu_sample` | periodic IMU sample in the lab flow |
| `imu_impact` | snapshot at impact |
| `imu_decision` | snapshot at the decision after the posture check |
| `selected_values_table.csv` | Table of selected rows from `npm run sensor-lab -- summarize` |

Do not interpret the Fall Detection Sensor Lab as current statistical results.

---

## Backend Event Terms

| Term | Meaning |
| --- | --- |
| `fallStage` | DB stage such as `PENDING_CONFIRMATION`, `CONFIRMED`, `CANCELLED` |
| `cancelledAt` | Time at which the device cancel succeeded |
| `fall_detected` | socket event after a fall is confirmed |
| `Dedup` | Preventing duplicate events from MQTT retransmission |
| `Pending Fall Event` | A fall event awaiting confirmation |
| `Confirmed Fall Event` | A fall event that has been confirmed |

---

## Related Docs

- [SensorTheoryReference.md](SensorTheoryReference.md)
- [ProjectAlignedResearch.md](ProjectAlignedResearch.md)
- [../components/mpu6050.md](../components/mpu6050.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.md)
- [../../../../docs/architecture/iot-mqtt.md](../../../../docs/architecture/iot-mqtt.md)
