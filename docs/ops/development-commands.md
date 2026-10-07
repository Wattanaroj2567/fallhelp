# Development Commands

[English](development-commands.md) · [ภาษาไทย](development-commands.th.md)

## Doc Meta

- Audience: Developers, QA
- Source of Truth: [package.json](../../package.json), app `package.json` files
- Status: Active
- Last Updated: October 7, 2026

---

## Root

### Core Scripts

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

### IoT & Hardware Scripts

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

### Demo Scripts (no hardware)

| Script | Description |
| ------ | ----------- |
| `npm run backend:db:seed:demo` | Create/reset the demo account, elder and paired simulator device (needs `DEMO_PASSWORD`) |
| `npm run demo:up` | Start Mosquitto (demo config), backend API and device simulator together |
| `npm run demo:tunnel` | Run the Cloudflare tunnel container against the host backend (`docker-compose.demo.yml`) |

See the [demo guide](../../docs/demo/DEMO_GUIDE.md).

## Backend

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

## Mobile

```bash
cd apps/mobile
```

| Script                 | Description                    |
| ---------------------- | ------------------------------ |
| `npx expo start`       | Start Expo dev server          |
| `npx expo run:android` | Run on Android device/emulator |
| `npx expo run:ios`     | Run on iOS simulator           |
| `npm run lint`         | ESLint check                   |

## Admin

```bash
cd apps/admin
```

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | ESLint check             |

## Cross-Platform Reinstall

```bash
# Reinstall all workspace dependencies when node_modules was generated on another OS
npm run install:all
```

Use this when `npm run dev:all`, `npm run admin:dev`, or `npm run platform:check`
reports an install-stamp mismatch after switching between Windows and WSL/Ubuntu.

## Fall Detection Sensor Lab (Optional)

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
