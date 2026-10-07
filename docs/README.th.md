# เอกสาร FallHelp

[English](README.md) · [ภาษาไทย](README.th.md)

> สารบัญเอกสารฉบับรวมของโปรเจกต์ FallHelp
>
> **กลุ่มผู้อ่าน:** Developers, QA, PM  
> **ภาษา:** อังกฤษ / ไทย — เอกสารแต่ละฉบับมีทั้งภาษาอังกฤษ (`.md`) และภาษาไทย (`.th.md`) ยกเว้นเอกสาร AI context ใน `docs/ai/` ที่มีเฉพาะภาษาอังกฤษ  
> **สถานะ:** Active — อัปเดตล่าสุด: 7 ตุลาคม 2026

---

## เริ่มต้นอย่างรวดเร็ว (ลำดับการอ่าน)

เริ่มอ่านจากตรงนี้ตามบทบาทของคุณ:

| บทบาท            | ลำดับการอ่านที่แนะนำ                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend Dev**  | [System Design](architecture/system-design.th.md) → [API Reference](api/api-reference.th.md) → [API Verification](ops/api-verification.th.md) → [Local Deployment](ops/local-deployment.th.md) |
| **Mobile Dev**   | [Device Pairing](features/device-pairing.th.md) → [UI/UX Spec](features/dashboard.md#uiux-guidelines)                                                                                   |
| **Admin Dev**    | [Admin Panel](features/admin-panel.th.md) → [API Reference](api/api-reference.th.md)                                                                                                    |
| **Hardware Dev** | [Device Pairing (BLE)](features/device-pairing.th.md) → [Firmware README](../firmware/esp32/README.th.md) → [MPU6050 Guide](../firmware/esp32/docs/components/mpu6050.th.md)            |
| **QA / PM**      | [Functional Requirements](planning/functional-requirements.th.md) → [Development Plan](planning/development-plan.th.md)                                                                  |

---

## แผนผัง Source of Truth

ใช้ตารางนี้เป็นกติกาหลักเวลาเอกสารขัดแย้งกัน:

| Domain                        | Owner Doc                                                                    | ใช้เมื่อ                                                      | Supporting Docs                                                     |
| ----------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| ระบบภาพรวม                    | [architecture/system-design.md](architecture/system-design.th.md)            | ต้องการภาพรวมทั้งระบบและการเชื่อมกันของแต่ละโมดูล             | `architecture/project-structure.md`, `ai/system_overview.md`        |
| โครงสร้าง repo                | [architecture/project-structure.md](architecture/project-structure.th.md)    | ต้องการ tree ปัจจุบัน, entry points, package scope            | `ai/backend.md`, `ai/mobile.md`, `ai/admin.md`, `ai/firmware.md`    |
| REST API                      | [api/api-reference.md](api/api-reference.th.md)                              | ต้องการ endpoint, request/response, realtime payloads         | `architecture/data-model.md`                                        |
| Data model                    | [architecture/data-model.md](architecture/data-model.th.md)                  | ต้องการภาพรวม schema, relation, และ event lifecycle           | `ai/backend.md`                                                     |
| Event/Fall flow               | [features/fall-detection.md](features/fall-detection.th.md)                  | ต้องการ behavior ของ suspected/confirmed/cancelled            | `architecture/iot-mqtt.md`, `architecture/data-model.md`            |
| MQTT/IoT protocol             | [architecture/iot-mqtt.md](architecture/iot-mqtt.th.md)                      | ต้องการ topic, payload, dedup, RESET_WIFI flow                | `features/device-pairing.md`, `ai/firmware.md`                      |
| Mobile navigation/app shell   | [ai/mobile.md](ai/mobile.md)                                                 | ต้องการรู้ entry files, route groups, provider stack          | `features/*.md`, `features/dashboard.md#uiux-guidelines`            |
| Admin app                     | [ai/admin.md](ai/admin.md)                                                   | ต้องการรู้ route/page scope และ backend surface ที่ admin ใช้ | `features/admin-panel.md`                                           |
| Backend internals             | [ai/backend.md](ai/backend.md)                                               | ต้องการ controller/service/iot/socket structure               | `architecture/system-design.md`, `api/api-reference.md`             |
| Firmware                      | [ai/firmware.md](ai/firmware.md)                                             | ต้องการเข้าใจ firmware structure และ hardware flow            | `features/fall-detection.md`, `architecture/iot-mqtt.md`            |
| Authentication                | [features/auth.md](features/auth.th.md)                                      | ต้องการ auth user flow ปัจจุบัน                               | `api/api-reference.md`                                              |
| Device pairing                | [features/device-pairing.md](features/device-pairing.th.md)                  | ต้องการ flow การผูกอุปกรณ์และ setup                           | `architecture/iot-mqtt.md`                                          |
| User account lifecycle        | [features/user-account.md](features/user-account.th.md)                      | ต้องการ profile/password/push-token flow ปัจจุบัน             | `api/api-reference.md`                                              |
| Local development environment | [ops/cross-platform-development.md](ops/cross-platform-development.th.md)    | ต้องการกติกา Windows/Ubuntu/WSL และการ reinstall              | `README.md`, `package.json`                                         |
| Product requirements          | [planning/functional-requirements.md](planning/functional-requirements.th.md) | ต้องการขอบเขต product ปัจจุบัน                               | `planning/development-plan.md`, `features/*.md`                     |
| UI behavior                   | [features/dashboard.md](features/dashboard.th.md)                            | ต้องการดู state/interaction ระดับหน้าจอ                       | `features/*.md`                                                     |

### กติกาสถานะเอกสาร

- `Active`: อธิบาย behavior ปัจจุบัน ต้องตรงกับโค้ดและโครงสร้างจริง
- `Planned`: เป็นงานในอนาคตหรือ roadmap ยังใช้เป็น source of truth สำหรับ runtime ปัจจุบันไม่ได้
- `Historical`: เป็นบันทึกการเปลี่ยนแปลงหรือ migration note ใช้อ้างอิงบริบทย้อนหลังเท่านั้น

---

## โครงสร้างไดเรกทอรี

```
docs/
├── architecture/    # ARCHITECTURE — system design, data model, MQTT/IoT
├── features/        # FEATURES — feature specs, tech notes, and UI/UX (merged)
├── api/             # API — REST API reference
├── planning/        # PLANNING — requirements & development roadmap
├── backlog/         # BACKLOG — future features, not yet implemented
├── ops/             # OPS — deployment, troubleshooting, security
├── testing/         # TESTING — glossary & test strategy
├── ai/              # AI — agent context memory
```

---

## หน้าที่ของแต่ละโฟลเดอร์

ใช้กติกานี้เวลาจะสร้างไฟล์ใหม่หรือย้ายไฟล์เดิม:

| โฟลเดอร์        | หน้าที่หลัก                                                 | ใส่ไว้ที่นี่เมื่อ                                                                                             |
| --------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `architecture/` | ภาพรวมระบบและโครงสร้างข้ามโมดูล                             | เอกสารอธิบาย system design, data model, integration boundary, event flow ระดับระบบ                            |
| `features/`     | owner docs ของฟีเจอร์, implementation notes, และ UI/UX spec | เอกสารตอบว่า feature ทำงานอย่างไร ทั้งมุมผู้ใช้, เทคนิค, protocol, constraint, invariant, และ screen behavior |
| `api/`          | canonical API contract                                      | เอกสารที่เป็น truth หลักของ endpoint, payload, request/response                                               |
| `planning/`     | งานที่ยังไม่ปิดและ roadmap                                  | เอกสารที่พูดถึง milestone, remaining work, requirements                                                       |
| `backlog/`      | ฟีเจอร์ในอนาคตที่ยังไม่ implement                           | feature spec ของฟีเจอร์ที่วางแผนไว้แต่ไม่ได้ทำในโปรเจกต์นี้                                                   |
| `ops/`          | runbook และแนวทางด้าน operation                             | setup, verification, deployment, troubleshooting, กติกาของ environment                                        |
| `testing/`      | ความรู้ด้านการทดสอบที่ยังใช้ได้ต่อเนื่อง                    | glossary, strategy, กติกาการทดสอบ, แนวทาง QA ที่นำกลับมาใช้ซ้ำได้                                             |
| `ai/`           | AI agent context memory                                     | persona/router/deep context สำหรับ agent ไม่ใช่ owner doc ของ product behavior                               |

### กติกาการวางไฟล์

- ถ้าไม่แน่ใจว่าไฟล์เป็น owner doc หรือ supporting doc ให้ตัดสินจากคำถามนี้: "ทีมควรเชื่อไฟล์นี้เป็นตัวจริงของ behavior ปัจจุบันหรือไม่"

---

## `docs/ai/` — AI Context Memory

> **กลุ่มผู้อ่าน:** AI agents, Developers

| เอกสาร                                        | คำอธิบาย                                        |
| --------------------------------------------- | ----------------------------------------------- |
| [INDEX.md](ai/INDEX.md)                       | ภาพรวมการใช้ชุดเอกสาร AI context                |
| [AI_MODULE_ROUTER.md](ai/AI_MODULE_ROUTER.md) | เลือก persona ตามโมดูลที่กำลังแตะ               |
| [agent-reference.md](ai/agent-reference.md)   | Quick reference สำหรับ tree, commands, hardware |
| [system_overview.md](ai/system_overview.md)   | ภาพรวม cross-module และ shared invariants       |
| [backend.md](ai/backend.md)                   | Backend deep context                            |
| [mobile.md](ai/mobile.md)                     | Mobile deep context                             |
| [admin.md](ai/admin.md)                       | Admin deep context                              |
| [firmware.md](ai/firmware.md)                 | Firmware deep context                           |

---

## `docs/architecture/` — สถาปัตยกรรมระบบ

> **กลุ่มผู้อ่าน:** Backend Dev, IoT Dev, Architects

| เอกสาร                                                       | คำอธิบาย                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| [system-design.md](architecture/system-design.th.md)         | สถาปัตยกรรมระดับสูง, component flow, providers            |
| [project-structure.md](architecture/project-structure.th.md) | โครงสร้างโฟลเดอร์ + รายละเอียด tech stack                 |
| [data-model.md](architecture/data-model.th.md)               | ERD diagram, cascade rules, indexes, event lifecycle, TEXT fields ที่มีข้อจำกัดค่า |
| [iot-mqtt.md](architecture/iot-mqtt.th.md)                   | MQTT topics, fall detection แบบ 2 ขั้น, deduplication     |

---

## `docs/features/` — ฟีเจอร์, Tech Notes และ UI/UX

> **กลุ่มผู้อ่าน:** PM, Mobile Dev, Backend Dev, Hardware Dev, QA

| เอกสาร                                                   | คำอธิบาย                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| [auth.md](features/auth.th.md)                           | JWT, OTP, flow Register / Login + implementation notes            |
| [user-account.md](features/user-account.th.md)           | Profile, การจัดการ push token + implementation notes              |
| [device-pairing.md](features/device-pairing.th.md)       | การจับคู่อุปกรณ์ + BLE WiFi provisioning + implementation contract |
| [fall-detection.md](features/fall-detection.th.md)       | Pipeline หลัก: Sensor → MQTT → Alert → Cancel (timeout 15 วินาที) |
| [notifications.md](features/notifications.th.md)         | Logic การแจ้งเตือนแบบ Push + Socket + in-app + คู่มือ Expo Push    |
| [realtime.md](features/realtime.th.md)                   | Socket.io events, rooms, connection flow, payloads                |
| [dashboard.md](features/dashboard.th.md)                 | หน้า Dashboard หลัก + Full UI/UX specification & screen flows     |
| [elder-profile.md](features/elder-profile.th.md)         | จัดการข้อมูลผู้สูงอายุ (ดู/แก้ไข)                                |
| [event-history.md](features/event-history.th.md)         | ประวัติเหตุการณ์ + รายงานสรุปรายเดือน                             |
| [emergency-contact.md](features/emergency-contact.th.md) | CRUD, priority, การจัดลำดับเบอร์ติดต่อฉุกเฉิน                     |
| [admin-panel.md](features/admin-panel.th.md)             | Flow ของ admin panel + ขอบเขตฟีเจอร์                              |
| [libraries.md](features/libraries.th.md)                 | รายการ dependency แยกตามโมดูล                                    |

---

## `docs/backlog/` — ฟีเจอร์ในอนาคต

> **กลุ่มผู้อ่าน:** Developer, PM
> ฟีเจอร์ที่วางแผนไว้แต่ยังไม่ได้ implement ในโปรเจกต์นี้

| เอกสาร                                                    | คำอธิบาย                                     |
| --------------------------------------------------------- | -------------------------------------------- |
| [multi-user-access.md](backlog/multi-user-access.th.md)   | เชิญสมาชิกครอบครัวดูแลร่วม (Multi-Caregiver) |
| [account-deletion.md](backlog/account-deletion.th.md)     | ลบบัญชีผู้ใช้                                |
| [health-data-export.md](backlog/health-data-export.th.md) | ส่งออกรายงานสุขภาพ PDF/CSV (ประกอบพบแพทย์)   |

---

## `docs/api/` — API Reference

> **กลุ่มผู้อ่าน:** Backend Dev, Mobile Dev, Admin Dev

| เอกสาร                                      | คำอธิบาย                                |
| ------------------------------------------- | --------------------------------------- |
| [api-reference.md](api/api-reference.th.md) | เอกสารอ้างอิง REST API endpoint ฉบับสมบูรณ์ |

---

## `docs/planning/` — Requirements และ Roadmap

> **กลุ่มผู้อ่าน:** PM, Backend Dev, QA

| เอกสาร                                                               | คำอธิบาย                                       |
| -------------------------------------------------------------------- | ---------------------------------------------- |
| [functional-requirements.md](planning/functional-requirements.th.md) | FR สำหรับ Caregiver และ Admin + use case หลัก  |
| [development-plan.md](planning/development-plan.th.md)               | Roadmap + การติดตาม milestone                  |

---

## `docs/ops/` — Deployment, Security และ Troubleshooting

> **กลุ่มผู้อ่าน:** DevOps, QA, Project Manager

| เอกสาร                                                                | คำอธิบาย                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------ |
| [api-verification.md](ops/api-verification.th.md)                     | Runbook สำหรับ smoke test แบบ local/API พร้อม Postman collection |
| [cross-platform-development.md](ops/cross-platform-development.th.md) | กติกาการพัฒนาแบบ local บน Windows/Ubuntu/WSL                 |
| [development-commands.md](ops/development-commands.th.md)             | รวมคำสั่งสำหรับการพัฒนาทั้งหมด (root, apps, firmware, sensor lab) |
| [local-deployment.md](ops/local-deployment.th.md)                     | คู่มือ deploy แบบ local ทีละขั้นตอน                          |

---

## `docs/demo/` — Demo และการนำเสนอ

> **กลุ่มผู้อ่าน:** ผู้นำเสนอ, ผู้ตรวจผลงาน

| เอกสาร | คำอธิบาย |
| --- | --- |
| [DEMO_GUIDE.th.md](demo/DEMO_GUIDE.th.md) | รัน demo โดยไม่ต้องมีฮาร์ดแวร์ (seed, demo stack, simulator, ลำดับการนำเสนอ) |
| [cloudflare-tunnel.th.md](demo/cloudflare-tunnel.th.md) | เปิด backend บนโน้ตบุ๊กเป็น `api.tawanlab.site` ให้ preview APK ใช้ |
| [SCREENSHOTS.th.md](SCREENSHOTS.th.md) | ภาพหน้าจอทุกหน้าของแอปมือถือและ admin panel |

## `docs/testing/` — การทดสอบ

> **กลุ่มผู้อ่าน:** QA, Developers

| เอกสาร                                                                | คำอธิบาย                                                             |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [feature-test-checklist.md](testing/feature-test-checklist.th.md)     | Feature coverage matrix และ checklist ตรวจสอบก่อน release            |
| [e2e-critical-path.md](testing/e2e-critical-path.th.md)               | กลยุทธ์ E2E สำหรับ flow ของ fall, pairing, mobile, admin และ hardware |
| [running-tests.md](testing/running-tests.th.md)                       | คำสั่งรัน test ทุกชุด (backend, mobile, admin, simulator, infra scan) |
| [simulator-guide.md](testing/simulator-guide.th.md)                   | คำสั่ง backend simulator สำหรับข้อมูล fall, push และ event           |
| [testing-glossary.md](testing/testing-glossary.th.md)                 | ศัพท์ด้านการทดสอบ (Unit / Integration / E2E / UAT / V&V)             |

## เอกสารที่เกี่ยวข้อง (นอก `docs/`)

| ตำแหน่ง                                                                                                   | คำอธิบาย                                                       |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [firmware/esp32/README.md](../firmware/esp32/README.th.md)                                                | ภาพรวม firmware ESP32 + BLE provisioning                       |
| [firmware/esp32/docs/README.md](../firmware/esp32/docs/README.th.md)                                      | สารบัญเอกสารฮาร์ดแวร์ของ firmware                              |
| [firmware/esp32/docs/guides/](../firmware/esp32/docs/guides/)                                             | Runbook ของ firmware (workflow การใช้งาน/การจูน)               |
| [firmware/esp32/docs/components/](../firmware/esp32/docs/components/)                                     | Owner docs ของ component ในอุปกรณ์ (MPU/Pulse/Button/Speaker) |
| [apps/backend-api/docs/api/postman_collection.json](../apps/backend-api/docs/api/postman_collection.json) | Postman collection                                             |
| [AGENTS.md](../AGENTS.md)                                                                                 | คู่มือ AI copilot ของโปรเจกต์นี้                               |

---

## มาตรฐานเอกสาร

เอกสารทุกฉบับในโปรเจกต์นี้ใช้ template ต่อไปนี้:

```markdown
# Title

## Doc Meta

- Audience: ...
- Source of Truth: <link to relevant source code>
- Status: Active / Planned / Historical
- Last Updated: May 21, 2026

## Overview

Short description of scope and purpose.

## [Main Content]

...

## Related Docs

- `Link to related document: ../features/<owner-doc>.md`
```

**การตั้งชื่อไฟล์:** `kebab-case.md` (เช่น `fall-detection.md`)

**กติกาการลิงก์:** ใช้ relative path เสมอ เพื่อให้ลิงก์ทำงานได้ใน Markdown viewer ทุกตัว

**การแก้ข้อขัดแย้ง:** ถ้าเอกสารสองฉบับขัดแย้งกัน ให้ยึด owner document เป็นหลัก แล้วแก้ cross-links ให้สอดคล้องกัน
