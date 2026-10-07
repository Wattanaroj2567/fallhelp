# Firmware References Index

[English](README.md) · [ภาษาไทย](README.th.md)

## Doc Meta

- Audience: Hardware Dev, QA, AI Agents, researchers
- Source of Truth: component owner docs, firmware source, cited references
- Status: Active
- Last Updated: May 18, 2026

---

## Overview

`references/` is the layer for rationale, theory, terminology, and cited sources. It is not a runbook for hands-on field testing.

If you need to do the work, go back to:

1. [../guides/README.md](../guides/README.md)
2. [../components/mpu6050.md](../components/mpu6050.md)
3. [../components/pulse-sensor.md](../components/pulse-sensor.md)

---

## Included References

| File | Use when |
| --- | --- |
| [SensorTheoryReference.md](SensorTheoryReference.md) | You need to explain formulas, threshold rationale, signal processing, or interpretation limits |
| [TechnicalGlossary.md](TechnicalGlossary.md) | You need to define terms used in firmware/backend/research docs |
| [ProjectAlignedResearch.md](ProjectAlignedResearch.md) | You need to cite a paper or implementation reference |

---

## Boundaries

1. Reference docs do not declare current statistical results
2. The Fall Detection Sensor Lab is Basic Activity Collection only
3. Values from the firmware source are the source of truth for the values the system actually uses
4. Papers are used as rationale or limitation, not as justification for changing a threshold without a test round

---

## Related Docs

- [../README.md](../README.md)
- [../guides/PracticalOperationGuide.md](../guides/PracticalOperationGuide.md)
- [../components/mpu6050.md](../components/mpu6050.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.md)
