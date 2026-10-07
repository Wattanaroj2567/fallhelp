# FallHelp Documentation

[English](README.md) · [ภาษาไทย](README.th.md)

> Comprehensive documentation index for the FallHelp project.
>
> **Audience:** Developers, QA, PM  
> **Language:** English / Thai — each document is available in English (`.md`) and Thai (`.th.md`); AI context docs in `docs/ai/` are English only  
> **Status:** Active — Last Updated: October 7, 2026

---

## Quick Start (Reading Flow)

Start here depending on your role:

| Role             | Recommended Reading Path                                                                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend Dev**  | [System Design](architecture/system-design.md) → [API Reference](api/api-reference.md) → [API Verification](ops/api-verification.md) → [Local Deployment](ops/local-deployment.md) |
| **Mobile Dev**   | [Device Pairing](features/device-pairing.md) → [UI/UX Spec](features/dashboard.md#uiux-guidelines)                                                                                      |
| **Admin Dev**    | [Admin Panel](features/admin-panel.md) → [API Reference](api/api-reference.md)                                                                                                          |
| **Hardware Dev** | [Device Pairing (BLE)](features/device-pairing.md) → [Firmware README](../firmware/esp32/README.md) → [MPU6050 Guide](../firmware/esp32/docs/components/mpu6050.md)                     |
| **QA / PM**      | [Functional Requirements](planning/functional-requirements.md) → [Development Plan](planning/development-plan.md)                                                                        |

---

## Source Of Truth Map

Use this table as the primary rule when documents conflict:

| Domain                        | Owner Doc                                                              | Use When                                                      | Supporting Docs                                                     |
| ----------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| System overview               | [architecture/system-design.md](architecture/system-design.md)         | You need the whole-system picture and how the modules connect | `architecture/project-structure.md`, `ai/system_overview.md`        |
| Repo structure                | [architecture/project-structure.md](architecture/project-structure.md) | You need the current tree, entry points, package scope        | `ai/backend.md`, `ai/mobile.md`, `ai/admin.md`, `ai/firmware.md`    |
| REST API                      | [api/api-reference.md](api/api-reference.md)                           | You need endpoints, request/response, realtime payloads       | `architecture/data-model.md`                                        |
| Data model                    | [architecture/data-model.md](architecture/data-model.md)               | You need the schema overview, relations, and event lifecycle  | `ai/backend.md`                                                     |
| Event/Fall flow               | [features/fall-detection.md](features/fall-detection.md)               | You need suspected/confirmed/cancelled behavior               | `architecture/iot-mqtt.md`, `architecture/data-model.md`            |
| MQTT/IoT protocol             | [architecture/iot-mqtt.md](architecture/iot-mqtt.md)                   | You need topics, payloads, dedup, RESET_WIFI flow             | `features/device-pairing.md`, `ai/firmware.md`                      |
| Mobile navigation/app shell   | [ai/mobile.md](ai/mobile.md)                                           | You need entry files, route groups, provider stack            | `features/*.md`, `features/dashboard.md#uiux-guidelines`            |
| Admin app                     | [ai/admin.md](ai/admin.md)                                             | You need the route/page scope and the backend surface admin uses | `features/admin-panel.md`                                        |
| Backend internals             | [ai/backend.md](ai/backend.md)                                         | You need the controller/service/iot/socket structure          | `architecture/system-design.md`, `api/api-reference.md`             |
| Firmware                      | [ai/firmware.md](ai/firmware.md)                                       | You need to understand the firmware structure and hardware flow | `features/fall-detection.md`, `architecture/iot-mqtt.md`          |
| Authentication                | [features/auth.md](features/auth.md)                                   | You need the current auth user flow                           | `api/api-reference.md`                                              |
| Device pairing                | [features/device-pairing.md](features/device-pairing.md)               | You need the device pairing and setup flow                    | `architecture/iot-mqtt.md`                                          |
| User account lifecycle        | [features/user-account.md](features/user-account.md)                   | You need the current profile/password/push-token flow         | `api/api-reference.md`                                              |
| Local development environment | [ops/cross-platform-development.md](ops/cross-platform-development.md) | You need the Windows/Ubuntu/WSL rules and reinstall steps     | `README.md`, `package.json`                                         |
| Product requirements          | [planning/functional-requirements.md](planning/functional-requirements.md) | You need the current product scope                        | `planning/development-plan.md`, `features/*.md`                     |
| UI behavior                   | [features/dashboard.md](features/dashboard.md)                         | You need screen-level state/interaction                       | `features/*.md`                                                     |

### Document Status Rules

- `Active`: describes current behavior; must match the actual code and structure
- `Planned`: future work or roadmap; cannot be used as the source of truth for the current runtime
- `Historical`: change log or migration note; use only for historical context

---

## Directory Structure

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

## Folder Responsibilities

Use these rules when creating a new file or moving an existing one:

| Folder          | Primary Responsibility                                      | Put It Here When                                                                                              |
| --------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `architecture/` | System overview and cross-module structure                  | The doc explains system design, data model, integration boundaries, or system-level event flow                |
| `features/`     | Feature owner docs, implementation notes, and UI/UX spec    | The doc answers how a feature works — from the user, technical, protocol, constraint, invariant, and screen-behavior angles |
| `api/`          | Canonical API contract                                      | The doc is the main truth for endpoints, payloads, request/response                                           |
| `planning/`     | Open work and roadmap                                       | The doc covers milestones, remaining work, requirements                                                       |
| `backlog/`      | Future features not yet implemented                         | Feature specs for features that are planned but not built in this project                                     |
| `ops/`          | Runbooks and operational guidance                           | setup, verification, deployment, troubleshooting, environment rules                                           |
| `testing/`      | Test knowledge that stays relevant over time                | glossary, strategy, testing rules, reusable QA guidance                                                       |
| `ai/`           | AI agent context memory                                     | persona/router/deep context for agents, not an owner doc for product behavior                                 |

### Placement Rules

- If you are unsure whether a file is an owner doc or a supporting doc, decide with this question: "Should the team trust this file as the real source of current behavior?"

---

## `docs/ai/` — AI Context Memory

> **Audience:** AI agents, Developers

| Document                                      | Description                                     |
| --------------------------------------------- | ----------------------------------------------- |
| [INDEX.md](ai/INDEX.md)                       | Overview of how to use the AI context doc set   |
| [AI_MODULE_ROUTER.md](ai/AI_MODULE_ROUTER.md) | Pick a persona based on the module you touch    |
| [agent-reference.md](ai/agent-reference.md)   | Quick reference for tree, commands, hardware    |
| [system_overview.md](ai/system_overview.md)   | Cross-module overview and shared invariants     |
| [backend.md](ai/backend.md)                   | Backend deep context                            |
| [mobile.md](ai/mobile.md)                     | Mobile deep context                             |
| [admin.md](ai/admin.md)                       | Admin deep context                              |
| [firmware.md](ai/firmware.md)                 | Firmware deep context                           |

---

## `docs/architecture/` — System Architecture

> **Audience:** Backend Dev, IoT Dev, Architects

| Document                                                  | Description                                        |
| --------------------------------------------------------- | -------------------------------------------------- |
| [system-design.md](architecture/system-design.md)         | High-level architecture, component flow, providers |
| [project-structure.md](architecture/project-structure.md) | Folder layout + tech stack breakdown               |
| [data-model.md](architecture/data-model.md)               | ERD diagram, cascade rules, indexes, event lifecycle, constrained TEXT fields |
| [iot-mqtt.md](architecture/iot-mqtt.md)                   | MQTT topics, 2-stage fall detection, deduplication |

---

## `docs/features/` — Features, Tech Notes & UI/UX

> **Audience:** PM, Mobile Dev, Backend Dev, Hardware Dev, QA

| Document                                              | Description                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| [auth.md](features/auth.md)                           | JWT, OTP, Register / Login flow + implementation notes           |
| [user-account.md](features/user-account.md)           | Profile, push token management + implementation notes            |
| [device-pairing.md](features/device-pairing.md)       | Device pairing + BLE WiFi provisioning + implementation contract |
| [fall-detection.md](features/fall-detection.md)       | Core pipeline: Sensor → MQTT → Alert → Cancel (15s timeout)      |
| [notifications.md](features/notifications.md)         | Push + Socket + in-app notification logic + Expo Push guide      |
| [realtime.md](features/realtime.md)                   | Socket.io events, rooms, connection flow, payloads               |
| [dashboard.md](features/dashboard.md)                 | Main Dashboard screen + Full UI/UX specification & screen flows  |
| [elder-profile.md](features/elder-profile.md)         | Manage elder information (view/edit)                             |
| [event-history.md](features/event-history.md)         | Event history + monthly summary report                           |
| [emergency-contact.md](features/emergency-contact.md) | CRUD, priority, reorder emergency contacts                       |
| [admin-panel.md](features/admin-panel.md)             | Admin panel flows + feature scope                                |
| [libraries.md](features/libraries.md)                 | Dependency inventory by module                                   |

---

## `docs/backlog/` — Future Features

> **Audience:** Developer, PM
> Features that are planned but not yet implemented in this project

| Document                                               | Description                                  |
| ------------------------------------------------------ | -------------------------------------------- |
| [multi-user-access.md](backlog/multi-user-access.md)   | Invite family members to co-care (Multi-Caregiver) |
| [account-deletion.md](backlog/account-deletion.md)     | Delete a user account                        |
| [health-data-export.md](backlog/health-data-export.md) | Export health reports as PDF/CSV (for doctor visits) |

---

## `docs/api/` — API Reference

> **Audience:** Backend Dev, Mobile Dev, Admin Dev

| Document                                 | Description                          |
| ---------------------------------------- | ------------------------------------ |
| [api-reference.md](api/api-reference.md) | Complete REST API endpoint reference |

---

## `docs/planning/` — Requirements & Roadmap

> **Audience:** PM, Backend Dev, QA

| Document                                                          | Description                                  |
| ----------------------------------------------------------------- | -------------------------------------------- |
| [functional-requirements.md](planning/functional-requirements.md) | FR for Caregiver & Admin + primary use cases |
| [development-plan.md](planning/development-plan.md)               | Roadmap + milestone tracking                 |

---

## `docs/ops/` — Deployment, Security & Troubleshooting

> **Audience:** DevOps, QA, Project Manager

| Document                                                           | Description                                          |
| ------------------------------------------------------------------ | ---------------------------------------------------- |
| [api-verification.md](ops/api-verification.md)                     | Local/API smoke test runbook with Postman collection |
| [cross-platform-development.md](ops/cross-platform-development.md) | Windows/Ubuntu/WSL local development rules           |
| [development-commands.md](ops/development-commands.md) | Full development command reference (root, apps, firmware, sensor lab) |
| [local-deployment.md](ops/local-deployment.md)                     | Step-by-step local deployment guide                  |

---

## `docs/demo/` — Demo & Showcase

> **Audience:** Presenters, Reviewers

| Document | Description |
| --- | --- |
| [DEMO_GUIDE.md](demo/DEMO_GUIDE.md) | Run the demo without hardware (seed, demo stack, simulator, presentation script) |
| [cloudflare-tunnel.md](demo/cloudflare-tunnel.md) | Expose the laptop backend as `api.tawanlab.site` for the preview APK |
| [SCREENSHOTS.md](SCREENSHOTS.md) | Screenshots of every mobile screen and the admin panel |

## `docs/testing/` — Testing

> **Audience:** QA, Developers

| Document                                                           | Description                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [feature-test-checklist.md](testing/feature-test-checklist.md)     | Feature coverage matrix and release verification checklist         |
| [e2e-critical-path.md](testing/e2e-critical-path.md)               | E2E strategy for fall, pairing, mobile, admin, and hardware flows  |
| [running-tests.md](testing/running-tests.md) | Commands for every test suite (backend, mobile, admin, simulator, infra scan) |
| [simulator-guide.md](testing/simulator-guide.md)                   | Backend simulator commands for fall, push, and event data          |
| [testing-glossary.md](testing/testing-glossary.md)                 | Testing terminology (Unit / Integration / E2E / UAT / V&V)         |

## Related Documentation (Outside `docs/`)

| Location                                                                                                  | Description                                            |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [firmware/esp32/README.md](../firmware/esp32/README.md)                                                   | ESP32 firmware overview + BLE provisioning             |
| [firmware/esp32/docs/README.md](../firmware/esp32/docs/README.md)                                         | Firmware hardware documentation index                  |
| [firmware/esp32/docs/guides/](../firmware/esp32/docs/guides/)                                             | Firmware runbooks (operation/tuning workflow)          |
| [firmware/esp32/docs/components/](../firmware/esp32/docs/components/)                                     | Device component owner docs (MPU/Pulse/Button/Speaker) |
| [apps/backend-api/docs/api/postman_collection.json](../apps/backend-api/docs/api/postman_collection.json) | Postman collection                                     |
| [AGENTS.md](../AGENTS.md)                                                                                 | AI copilot guide for this project                      |

---

## Document Standard

All documents in this project follow this template:

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

**File naming:** `kebab-case.md` (e.g., `fall-detection.md`)

**Linking rule:** Always use relative paths so links work in any Markdown viewer.

**Conflict resolution:** If two documents conflict, the owner document wins — fix cross-links accordingly.
