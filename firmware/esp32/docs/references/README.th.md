# Firmware References Index

[English](README.md) · [ภาษาไทย](README.th.md)

## Doc Meta

- ผู้อ่าน: Hardware Dev, QA, AI Agents, ผู้วิจัย
- Source of Truth: component owner docs, firmware source, cited references
- สถานะ: Active
- อัปเดตล่าสุด: 18 พฤษภาคม 2026

---

## ภาพรวม

`references/` คือชั้นอธิบายเหตุผล ทฤษฎี คำศัพท์ และแหล่งอ้างอิง ไม่ใช่ runbook สำหรับลงมือทดสอบหน้างาน

ถ้าต้องลงมือทำ ให้กลับไปที่:

1. [../guides/README.md](../guides/README.th.md)
2. [../components/mpu6050.md](../components/mpu6050.th.md)
3. [../components/pulse-sensor.md](../components/pulse-sensor.th.md)

---

## เอกสารอ้างอิงในชุดนี้

| ไฟล์ | ใช้เมื่อ |
| --- | --- |
| [SensorTheoryReference.md](SensorTheoryReference.th.md) | ต้องอธิบายสูตร, เหตุผลของ threshold, signal processing หรือข้อจำกัดในการตีความ |
| [TechnicalGlossary.md](TechnicalGlossary.th.md) | ต้องนิยามคำศัพท์ที่ใช้ในเอกสาร firmware/backend/research |
| [ProjectAlignedResearch.md](ProjectAlignedResearch.th.md) | ต้องอ้าง paper หรือ implementation reference |

---

## ขอบเขต

1. Reference docs ไม่ประกาศผลเชิงสถิติปัจจุบัน
2. Fall Detection Sensor Lab เป็น Basic Activity Collection เท่านั้น
3. ค่าจาก firmware source เป็น source of truth สำหรับค่าที่ระบบใช้จริง
4. Paper ใช้เป็นเหตุผลประกอบ (rationale) หรือข้อจำกัด (limitation) ไม่ใช่ข้ออ้างให้เปลี่ยน threshold โดยไม่มีรอบทดสอบ

---

## เอกสารที่เกี่ยวข้อง

- [../README.md](../README.th.md)
- [../guides/PracticalOperationGuide.md](../guides/PracticalOperationGuide.th.md)
- [../components/mpu6050.md](../components/mpu6050.th.md)
- [../components/pulse-sensor.md](../components/pulse-sensor.th.md)
