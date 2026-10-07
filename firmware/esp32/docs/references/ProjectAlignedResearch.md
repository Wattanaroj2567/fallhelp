# Project-Aligned Research References

[English](ProjectAlignedResearch.md) · [ภาษาไทย](ProjectAlignedResearch.th.md)

## Doc Meta

- Audience: Dev, QA, Stakeholder, researchers
- Source of Truth: cited papers + current firmware owner docs
- Status: Active
- Last Updated: May 18, 2026

---

## Overview

This file collects the references that support the design of FallHelp's ESP32 firmware.

Use this file to:

1. Cite research in reports
2. Explain the limitations of sensor placement and motion artifact
3. Separate the future full-study scope from the current Fall Detection Sensor Lab

---

## Fall Detection References

1. Bagala F, et al. (2012). _Accelerometer-based fall detection algorithms on real-world falls_. PLOS ONE. DOI: `10.1371/journal.pone.0037062`
   Link: <https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0037062>
   Used to cite the difference between lab conditions and real-world falls, including the importance of false alarm tracking

2. Wang FT, et al. (2018). _Threshold-based fall detection using a hybrid of tri-axial accelerometer and gyroscope_. Physiological Measurement. DOI: `10.1088/1361-6579/aae0eb`
   Link: <https://pubmed.ncbi.nlm.nih.gov/30207983/>
   Used to support the threshold-based hybrid method that combines acceleration with gyroscope/posture information

3. Harari Y, et al. (2021). _A smartphone-based online system for fall detection with alert notifications and contextual information of real-life falls_. J Neuroeng Rehabil. DOI: `10.1186/s12984-021-00918-z`
   Link: <https://pubmed.ncbi.nlm.nih.gov/34376199/>
   Used to cite the concept of online fall detection + alert notification and the burden of false alarms

---

## Sensor Placement Reference

1. Teng S, et al. (2024). _Analyzing Optimal Wearable Motion Sensor Placement for Accurate Classification of Fall Directions_. Sensors. DOI: `10.3390/s24196432`
   Link: <https://pmc.ncbi.nlm.nih.gov/articles/PMC11479374/>
   Used as a limitation of FallHelp: the project chose a neck-mounted device because IMU + PPG must be combined in a single device, even though the neck is not the optimal IMU position in the literature

---

## MPU6050 Implementation References

1. Hsieh ST, Lin CL. (2020). _Fall Detection Algorithm Based on MPU6050 and Long-Term Short-Term Memory network_. CACS 2020. DOI: `10.1109/CACS50047.2020.9289769`  
   Link: <https://www.researchgate.net/publication/347691533_Fall_Detection_Algorithm_Based_on_MPU6050_and_Long-Term_Short-Term_Memory_network>  
   Used to cite that the MPU6050 is a practical sensor in fall-detection research, but FallHelp does not use LSTM in the current firmware

2. Kulkarni, et al. (2016). _Design and Implementation of Fall Detection System Using MPU6050 Arduino_. ResearchGate.  
   Link: <https://www.researchgate.net/publication/303404955_Design_and_Implementation_of_Fall_Detection_System_Using_MPU6050_Arduino>  
   Used to cite the MPU6050 + microcontroller approach and threshold-based implementation

3. MPU6050 Arduino library (i2cdevlib): <https://github.com/jrowberg/i2cdevlib/tree/master/Arduino/MPU6050>

4. MPU-6000/6050 Datasheet: <https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf>

5. MPU-6000/6050 Register Map: <https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Register-Map1.pdf>

---

## PPG References

1. Allen J. (2007). _Photoplethysmography and its application in clinical physiological measurement_. Physiological Measurement. DOI: `10.1088/0967-3334/28/3/R01`  
   Link: <https://pubmed.ncbi.nlm.nih.gov/17322588/>  
   Used as the PPG foundation

2. Hartmann V, et al. (2019). _Quantitative Comparison of Photoplethysmographic Waveform Characteristics: Effect of Measurement Site_. Front Physiol. DOI: `10.3389/fphys.2019.00198`  
   Link: <https://pubmed.ncbi.nlm.nih.gov/30890959/>  
   Used to explain the effect of measurement site on waveform quality

3. Warren KM, et al. (2016). _Improving Pulse Rate Measurements during Random Motion Using a Wearable Multichannel Reflectance Photoplethysmograph_. Sensors. DOI: `10.3390/s16030342`  
   Link: <https://pubmed.ncbi.nlm.nih.gov/26959034/>  
   Used to cite the motion artifact problem in PPG

4. PulseSensorPlayground ESP32 example: <https://github.com/WorldFamousElectronics/PulseSensorPlayground/blob/master/examples/PulseSensor_ESP32/PulseSensor_ESP32.ino>

5. PulseSensor XIAO ESP32S3 Tutorial: <https://pulsesensor.com/pages/pulsesensor_xiao_esp32s3>

---

## Current Boundary

The current Fall Detection Sensor Lab is Basic Activity Collection:

1. Collects IMU trials to show examples of `decision`, `magnitude`, and `postureDelta`
2. It is not a full-study dataset
3. It does not report statistical results as current results
4. Future full-study work must have a protocol and dataset sufficient to support it

---

## How To Use These References

1. Use the firmware source as the primary reference for the values the system actually uses
2. Use papers to explain rationale, limitations, and the future full-study scope
3. Do not change a threshold because a paper recommends a particular value without a FallHelp tuning round
4. Always state that FallHelp is a monitoring system, not a medical diagnostic device

---

## Related Docs

- [SensorTheoryReference.md](SensorTheoryReference.md)
- [TechnicalGlossary.md](TechnicalGlossary.md)
- [../components/mpu6050.md](../components/mpu6050.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.md)
