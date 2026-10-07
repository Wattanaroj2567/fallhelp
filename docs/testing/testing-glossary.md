# Testing Glossary

[English](testing-glossary.md) · [ภาษาไทย](testing-glossary.th.md)

## Doc Meta

- Audience: QA, Developers, PM
- Source of Truth: testing strategy, CI/local verification flow, and feature reports generated from the testing workflow
- Status: Active
- Last Updated: May 10, 2026

---

## Overview

This document is the shared glossary of testing terms used in the FallHelp project, so the team interprets Unit, Integration, E2E, UAT, Smoke, Regression, and V&V the same way before reading test reports or asking AI to help assess coverage.

---

## Core Terms

| Term | Meaning in FallHelp | Example in repo |
| --- | --- | --- |
| Unit Test | Tests a function, hook, helper, or service in isolation with controlled dependencies | backend service tests, payload validator tests |
| Integration Test | Tests how multiple layers within the same module work together | Express route + service + DB test doubles |
| End-to-End (E2E) | Tests a flow across multiple systems, from trigger to final outcome | ESP32 -> MQTT -> Backend -> Socket -> Mobile alert |
| Smoke Test | A short test set to check the system still boots/runs after a change | `infra:scan`, build, light tests |
| Regression Test | Tests that prevent existing behavior from breaking after a refactor/fix | auth flow, event history, notification read state |
| UAT | Users or stakeholders try the system following real scenarios | caregiver pairing, dashboard monitoring, feedback flow |
| Verification | Checks that the implementation matches the spec or runtime contract | API response shape, payload validation, docs in sync with code |
| Validation | Checks that what was built meets users' real needs | alert readability, pairing usability, incident handling |

---

## V&V in This Project's Context

| Term | Deciding question | Example |
| --- | --- | --- |
| Verification | "Did we build the system as designed?" | route returns the correct status code, MQTT payload passes the validator, docs in sync with code |
| Validation | "Does what we built meet real users' needs?" | caregiver understands the alert flow, hardware setup can be done by following the runbook, UAT passes |

---

## Recommended Evidence By Scope

| Change | Minimum evidence required |
| --- | --- |
| Docs, config, path updates | `npm run docs:lint`, `npm run infra:scan -- --skip-runtime-checks` |
| Backend logic | typecheck, lint, relevant Jest tests, `infra:scan:strict` |
| Mobile UI or state flow | typecheck, lint/light tests according to scope, flow notes in owner docs |
| Firmware docs or operator runbook | docs lint + cross-check against the current firmware path/runbook |

---

## Feature Report Boundary

To summarize test results per feature, use the template from `.agent/skills/testing-expert/references/feature-report-template.md` as a separate feature report. Do not put run-specific results into this glossary.

---

## Related Docs

- [Functional Requirements](../planning/functional-requirements.md)
- [System Design](../architecture/system-design.md)
- [Testing Expert Skill Template](../../.agent/skills/testing-expert/references/feature-report-template.md)
