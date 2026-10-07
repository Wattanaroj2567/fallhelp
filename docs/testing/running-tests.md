# Running Tests

[English](running-tests.md) · [ภาษาไทย](running-tests.th.md)

## Doc Meta

- Audience: Developers, QA
- Source of Truth: [package.json](../../package.json), app `package.json` files, [scripts/audit/infra-scan.mjs](../../scripts/audit/infra-scan.mjs)
- Status: Active
- Last Updated: October 7, 2026

---

## Backend

```bash
cd apps/backend-api
npm test -- --watchman=false
npm run test:ci
npm run test:coverage
npm run test:integration
npm run test:all
```

| Script                         | Description                             |
| ------------------------------ | --------------------------------------- |
| `npm test -- --watchman=false` | Unit tests                              |
| `npm run test:ci`              | Watchman-safe mode (sandbox/CI)         |
| `npm run test:coverage`        | Unit tests with coverage report         |
| `npm run test:integration`     | Integration tests (requires running DB) |
| `npm run test:all`             | Unit + Integration                      |

## Mobile

```bash
cd apps/mobile
npm test -- --watchman=false
npm run test:light -- --watchman=false
npm run test:light -- --runInBand --watchman=false
npm run test:coverage
```

| Script                                               | Description                     |
| ---------------------------------------------------- | ------------------------------- |
| `npm test -- --watchman=false`                       | All tests                       |
| `npm run test:light -- --watchman=false`             | Fast smoke tests only           |
| `npm run test:light -- --runInBand --watchman=false` | Watchman-safe mode (sandbox/CI) |
| `npm run test:coverage`                              | With coverage report            |

## Admin

```bash
cd apps/admin
npm test
npm run test:coverage
```

## Device Simulator

```bash
npx nx run device-simulator:test
```

Unit tests for payload builders, fall sequence timing, connection status and log helpers. The MQTT
payload contract (`apps/device-simulator/src/contract/fixtures.json`) is also checked on the backend
side by `apps/backend-api/src/__tests__/unit/iot/simulatorContract.test.ts`.

## Infra Scan

```bash
npm run infra:scan
npm run infra:scan:strict
npm run infra:scan:strict:no-integration
```

- `infra:scan`: runtime + docs/env consistency baseline
- `infra:scan:strict`: baseline + lint/typecheck (apps/backend-api, apps/mobile, apps/admin) + backend integration tests (DB required)
- `infra:scan:strict:no-integration`: strict mode without integration tests (useful in sandbox/dev without DB)

## Sensor-Lab

`firmware/esp32/fall_detection_sensor_lab/` is the **Fall Detection Sensor Lab Basic Activity
Collection** lab module — not required for the active FallHelp runtime to function,
but used for sensor workflow testing and labeled data collection.

It is independent from `main_firmware` (production) and `sensor_tuning` (hardware
calibration). The lab runs Node-RED with FlowFuse Dashboard 2.0 to record labeled
IMU activity CSV trials from the ESP32 `sensor_tuning` firmware.
