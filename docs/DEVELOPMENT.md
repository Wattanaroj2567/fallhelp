# Development Guide

Setting up, running and testing FallHelp locally. Demo without hardware: [demo guide](./demo/DEMO_GUIDE.md).

## Prerequisites

| Tool         | Version                       | Notes                                    |
| ------------ | ----------------------------- | ---------------------------------------- |
| Node.js      | 24.x LTS                      | Required for all services                |
| PostgreSQL   | 18.x                          |                                          |
| MQTT Broker  | Mosquitto 2.x or HiveMQ Cloud | Backend/device event transport           |
| Expo tooling | Project-local                 | Use `npx expo` or `npm run mobile:start` |
| EAS CLI      | Project-local                 | Use `cd apps/mobile && npm exec eas ...` |
| Arduino IDE  | 2.x                           | For ESP32 firmware development           |

> Prefer project-local CLIs when a package exists in the workspace. Avoid global installs for Expo/EAS so builds use the same version that the project declares.

## Getting Started

### Quick Start

```bash
git clone https://github.com/Wattanaroj2567/fallhelp.git
cd fallhelp
npm run install:all
npm run env:setup
npm run platform:check
npm run dev:all
```

`npm run dev:all` verifies the current OS install stamp, then starts Backend + Mobile + Admin together.

| Service       | URL                     |
| ------------- | ----------------------- |
| Backend API   | `http://localhost:3000` |
| Mobile (Expo) | `http://localhost:8081` |
| Admin Panel   | `http://localhost:5173` |
| MQTT Broker   | `mqtt://localhost:1883` |

### Database Setup

Run the backend database setup after environment files are configured:

```bash
npm run backend:db:setup
npm run backend:db:verify
```

### Cross-Platform Note

If you switch between Windows, WSL/Ubuntu, macOS, or Linux, reinstall dependencies on that OS first. Do not reuse `node_modules` across operating systems.

```bash
npm run install:all
npm run platform:check
```

### Docker Quick Path (Optional)

Use this path when you want the containerized backend/admin stack instead of running everything on the host:

```bash
docker compose up -d --build --pull always
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

To include the Cloudflare named tunnel, set `TUNNEL_TOKEN`, `TUNNEL_PUBLIC_HOSTNAME`, and `TUNNEL_ORIGIN_URL` in `apps/backend-api/.env`, then run:

```bash
docker compose --env-file apps/backend-api/.env --profile tunnel up -d --build --pull always
docker compose logs -f tunnel
```

Mosquitto MQTT should be running as a native service before starting Docker containers. See [Local Deployment](./ops/local-deployment.md) for full setup details.

### Sensor Lab (Optional)

The Fall Detection Sensor Lab is used to test the sensor workflow and collect labeled activity data. It is separate from the active app runtime:

```bash
npm run sensor-lab -- node-red up
npm run sensor-lab -- all
```

Dashboard UI: `http://localhost:1880/ui`.

## Development Commands

### Root

#### Core Scripts

| Script                                     | Description                                                         |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `npm run dev:all`                          | Start all services concurrently                                     |
| `npm run dev:backend-mobile`               | Start Backend + Mobile only                                         |
| `npm run dev:backend-admin`                | Start Backend + Admin only                                          |
| `npm run install:all`                      | Install root + package dependencies on the current OS               |
| `npm run platform:check`                   | Verify node_modules matches the current OS/arch                     |
| `npm run dev:stop`                         | Stop common local dev ports (3000, 8081, 5173, 5174)                |
| `npm run backend:dev`                      | Backend only                                                        |
| `npm run mobile:start`                     | Mobile only                                                         |
| `npm run admin:dev`                        | Admin only                                                          |
| `npm run env:setup`                        | Copy .env.example → .env (cross-platform)                           |
| `npm run docs:lint`                        | Lint root/docs Markdown using the shared markdownlint configuration |
| `npm run docs:lint:fix`                    | Auto-fix Markdown issues that can be fixed safely                   |
| `npm run audit:comments:strict`            | Enforce repo comment standard in strict mode                        |
| `npm run infra:scan`                       | Baseline runtime/docs/env consistency checks                        |
| `npm run infra:scan:strict`                | Adds lint + typecheck + integration checks                          |
| `npm run infra:scan:strict:no-integration` | Strict checks without integration DB tests                          |
| `npm run nx:show`                          | Show Nx-detected projects in this workspace                         |
| `npm run nx:graph`                         | Open the local Nx project graph                                     |
| `npm run affected:build`                   | Run build only on affected projects                                 |
| `npm run affected:lint`                    | Run lint only on affected projects                                  |
| `npm run affected:test`                    | Run test only on affected projects                                  |
| `npm run affected:typecheck`               | Run typecheck only on affected projects                             |

Note: Nx is currently enabled conservatively with explicit project configuration for `backend-api` and `admin` first. The `mobile` app still relies mainly on npm scripts to avoid React Native/Expo plugin compatibility risk. If local Nx cache/state becomes unstable or graph commands hang, run `npm exec nx reset` before `npm exec nx show` or `npm exec nx affected`.

#### IoT & Hardware Scripts

| Script                     | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `npm run sensor-lab -- node-red up` | Start the Fall Detection Sensor Lab Node-RED Docker service |
| `npm run sensor-lab -- node-red rebuild` | Rebuild and recreate the Node-RED lab service |
| `node scripts/iot/node-red-launch.mjs` | Optional host fallback for local Node-RED debugging |
| `node scripts/iot/firmware-doctor.mjs` | Check arduino-cli, ESP32 core, libraries, and serial port |
| `node scripts/iot/firmware-arduino-cli.mjs deps` | Install required Arduino libraries                        |
| `node scripts/iot/firmware-arduino-cli.mjs compile main` | Compile main firmware                                     |
| `node scripts/iot/firmware-arduino-cli.mjs upload main` | Upload main firmware                                      |
| `node scripts/iot/firmware-monitor.mjs` | Open firmware serial monitor (uses arduino-cli)           |

### Backend

```bash
cd apps/backend-api
```

| Script                   | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `npm run dev`            | Start API server (hot-reload, uses external MQTT broker) |
| `npm run build`          | Compile TypeScript                                       |
| `npm run prisma:migrate` | Run database migrations                                  |
| `npm run prisma:studio`  | Open Prisma Studio UI                                    |
| `npm run prisma:seed`    | Seed initial data (admin user, test devices)             |
| `npm run db:reset`       | Full DB reset + schema setup                             |
| `npm run db:verify`      | Verify PostgreSQL schema objects required by the backend |
| `npm run test:ci`        | Unit tests in CI/sandbox-safe mode                       |
| `npm run lint`           | ESLint check                                             |
| `npm run format`         | Prettier format                                          |

### Mobile

```bash
cd apps/mobile
```

| Script                 | Description                    |
| ---------------------- | ------------------------------ |
| `npx expo start`       | Start Expo dev server          |
| `npx expo run:android` | Run on Android device/emulator |
| `npx expo run:ios`     | Run on iOS simulator           |
| `npm run lint`         | ESLint check                   |

### Admin

```bash
cd apps/admin
```

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | ESLint check             |

### Cross-Platform Reinstall

```bash
# Reinstall all workspace dependencies when node_modules was generated on another OS
npm run install:all
```

Use this when `npm run dev:all`, `npm run admin:dev`, or `npm run platform:check`
reports an install-stamp mismatch after switching between Windows and WSL/Ubuntu.

### Fall Detection Sensor Lab (Optional)

Sensor Lab module for testing the sensor workflow and collecting labeled MPU6050 IMU activity
CSV files from the `sensor_tuning` firmware via Node-RED FlowFuse Dashboard 2.0.
The root README only maps the module; detailed lab workflow, CSV schema, and dashboard
operation steps live in `firmware/esp32/fall_detection_sensor_lab/`.

**Start Node-RED Dashboard:**

```bash
# Docker primary path — includes @flowfuse/node-red-dashboard automatically
npm run sensor-lab -- node-red up

# Rebuild and reload the lab flow/container
npm run sensor-lab -- node-red rebuild

# Optional host fallback for quick developer use
node scripts/iot/node-red-launch.mjs
```

Dashboard UI: `http://localhost:1880/ui`; flow source:
`firmware/esp32/fall_detection_sensor_lab/node-red/flows/fall-detection-sensor-lab-flow.v2.json`.
MQTT config comes from Docker/env values such as `MQTT_BROKER_HOST`,
`MQTT_BROKER_PORT`, `MQTT_USE_TLS`, `MQTT_USERNAME`, and `MQTT_PASSWORD`.
Never commit real `.env` values or credentials.

**Data pipeline scripts:**

```bash
# Validate collected raw CSV against the schema
npm run sensor-lab -- validate

# Summarize selected trials into exports/selected_values_table.csv
npm run sensor-lab -- summarize

# Generate Markdown summaries from the selected trial table
npm run sensor-lab -- chapters

# Run all three in order
npm run sensor-lab -- all
```

## Environment Variables

Create environment files from the provided templates:

```bash
npm run env:setup
```

Key backend variables:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/fallhelp_db?schema=public"

# Auth
JWT_SECRET="your-secret-key-min-32-characters"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# MQTT
MQTT_BROKER_URL="mqtt://localhost:1883"
MQTT_USERNAME=""
MQTT_PASSWORD=""
MQTT_DISABLED="false"

# Node-RED Sensor Lab MQTT runtime
MQTT_BROKER_HOST=host.docker.internal
MQTT_BROKER_PORT=1883
MQTT_USE_TLS=false
NODE_RED_PORT=1880

# Email (set DISABLE_EMAIL=true for local dev to skip sending)
DISABLE_EMAIL=true
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="FallHelp <noreply@your-domain.com>"
```

> ⚠️ Never commit `.env` files. Use `.env.example` as a template only.

## Testing

### Backend

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

### Mobile

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

### Admin

```bash
cd apps/admin
npm test
npm run test:coverage
```

### Infra Scan

```bash
npm run infra:scan
npm run infra:scan:strict
npm run infra:scan:strict:no-integration
```

- `infra:scan`: runtime + docs/env consistency baseline
- `infra:scan:strict`: baseline + lint/typecheck (apps/backend-api, apps/mobile, apps/admin) + backend integration tests (DB required)
- `infra:scan:strict:no-integration`: strict mode without integration tests (useful in sandbox/dev without DB)

### Sensor-Lab

`firmware/esp32/fall_detection_sensor_lab/` is the **Fall Detection Sensor Lab Basic Activity
Collection** lab module — not required for the active FallHelp runtime to function,
but used for sensor workflow testing and labeled data collection.

It is independent from `main_firmware` (production) and `sensor_tuning` (hardware
calibration). The lab runs Node-RED with FlowFuse Dashboard 2.0 to record labeled
IMU activity CSV trials from the ESP32 `sensor_tuning` firmware.

## Documentation

Use `npm run docs:lint` to validate the main Markdown docs in this repository, and use
`npm run docs:lint:fix` to auto-fix spacing and blank-line issues where possible.

| Document                                                                                 | Description                                   |
| ---------------------------------------------------------------------------------------- | --------------------------------------------- |
| [AGENTS.md](../AGENTS.md)                                                                 | AI copilot guide, code rules, agent workflows |
| [docs/README.md](./README.md)                                                       | Full documentation index                      |
| [apps/backend-api/README.md](../apps/backend-api/README.md)                               | Backend module runbook                        |
| [apps/mobile/README.md](../apps/mobile/README.md)                                         | Mobile module runbook                         |
| [apps/admin/README.md](../apps/admin/README.md)                                           | Admin module runbook                          |
| [docs/architecture/system-design.md](./architecture/system-design.md)               | System architecture overview                  |
| [docs/planning/functional-requirements.md](./planning/functional-requirements.md)   | Functional requirements                       |
| [docs/features/fall-detection.md](./features/fall-detection.md)                     | Fall detection pipeline (IoT → MQTT → App)    |
| [docs/features/device-pairing.md](./features/device-pairing.md)                     | BLE WiFi setup wizard & provisioning protocol |
| [docs/api/api-reference.md](./api/api-reference.md)                                 | Full REST API reference                       |
| [docs/ops/local-deployment.md](./ops/local-deployment.md)                           | Local deployment guide                        |
| [docs/ops/cross-platform-development.md](./ops/cross-platform-development.md)       | Windows + Ubuntu local development guide      |
| [firmware/esp32/README.md](../firmware/esp32/README.md)                                   | ESP32 firmware overview                       |
| [firmware/esp32/docs/components/mpu6050.md](../firmware/esp32/docs/components/mpu6050.md) | MPU6050 fall detection tuning guide           |

## Development Approach

This project was developed using a multi-agent AI-assisted workflow across planning, implementation, refactoring, documentation, testing, and review.

The workflow included support from tools such as Codex, Claude Code, GitHub Copilot, and other AI coding assistants during different phases of development.

AI tools were used to accelerate development and improve consistency, but final architectural decisions, validation, and project ownership remain with the project author.

## Contributing

1. Use `main` as the default working branch for normal solo development
2. Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(mobile): add fall history export`
   - `fix(backend): prevent duplicate fall event on MQTT reconnect`
   - `docs(firmware): clarify MPU6050 threshold tuning guide`
3. Run validation required by the change scope before committing
4. Commit locally, then push directly to `main`
5. Use GitHub Actions on `main` as the remote CI confirmation
6. Open a temporary branch and pull request only when external review, risky experimentation, or collaboration is explicitly needed
