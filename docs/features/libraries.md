# Libraries & Dependencies

[English](libraries.md) · [ภาษาไทย](libraries.th.md)

## Doc Meta

- Audience: Developers, QA
- Source of Truth: [../../package.json](../../package.json), [../../package-lock.json](../../package-lock.json), [../../apps/backend-api/package.json](../../apps/backend-api/package.json), [../../apps/mobile/package.json](../../apps/mobile/package.json), [../../apps/admin/package.json](../../apps/admin/package.json)
- Status: Active
- Last Updated: May 25, 2026 (Removed stale mobile picker dependency from lockfiles and inventory)

---

## Overview

The libraries used in each module of the FallHelp system, with a description of what each one is used for in this project.

---

## Root Tooling

### Production Dependencies

| Library  | Version | What it does in this project                          |
| -------- | ------- | ----------------------------------------------------- |
| `dotenv` | ^17.3.1 | Loads environment variables for root-level scripts    |
| `mqtt`   | ^5.15.0 | MQTT client for root-level IoT scripts and tooling    |

### Dev Dependencies

| Library                        | Version | What it does                                                                                               |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------- |
| `@flowfuse/node-red-dashboard` | ^1.30.2 | Dashboard nodes for the Node-RED sensor-lab workflow                                                       |
| `concurrently`                 | ^9.1.0  | Runs multiple processes at once for root workflows                                                         |
| `expo`                         | ~55.0.26 | Root-level Expo package so hoisted Expo config plugins can resolve `expo/config-plugins` in the monorepo  |
| `kill-port`                    | ^2.0.1  | Stops the standard dev ports via `npm run dev:stop`                                                        |
| `markdownlint-cli2`            | ^0.21.0 | Checks Markdown quality of `README.md`, `AGENTS.md`, `CLAUDE.md`, and `docs/**/*.md` via the central root config |
| `node-red`                     | ^4.1.8  | Runtime for flows used in the sensor-lab and IoT testing                                                   |
| `nx`                           | 22.6.3  | Workspace/task orchestration in the monorepo                                                               |
| `patch-package`                | ^8.0.1  | Keeps project-specific patches to dependencies                                                             |
| `react`                        | 19.2.0  | Central version override so the workspace uses the same React                                             |
| `react-dom`                    | 19.2.0  | Central version override so web targets use the same React DOM                                            |
| `react-native-reanimated`      | 4.2.1   | Central version override so the mobile animation runtime matches Expo SDK 55                               |
| `react-test-renderer`          | 19.2.0  | Central version override for the React test renderer                                                       |
| `typescript`                   | ^6.0.3  | Central TypeScript compiler for root-level scripts/tools                                                   |

### Root Overrides

The root `package.json` uses `overrides` to pin the React family, Reanimated, Prisma, Vite/PostCSS, and security/compatibility-related transitive dependencies so the workspace resolves consistently. See the exact list in [../../package.json](../../package.json)

---

## Mobile (React Native + Expo SDK 55)

### Production Dependencies

| Library                                     | Version  | What it does in this project                                                   |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `expo`                                      | ~55.0.26 | Main Expo SDK — runtime, build pipeline, and managed workflow                  |
| `expo-router`                               | ~55.0.16 | File-based routing for every screen in the `app/` directory                    |
| `react`                                     | 19.2.0   | Core React                                                                     |
| `react-native`                              | 0.83.6   | Core React Native                                                              |
| `react-dom`                                 | 19.2.0   | React DOM for the web target (Expo web)                                        |
| `@tanstack/react-query`                     | ^5.90.21 | Data fetching, caching, and invalidation for every API call in the app         |
| `axios`                                     | ^1.16.0  | HTTP client for the backend API (`services/`)                                  |
| `socket.io-client`                          | ^4.8.3   | Receives real-time events from the backend — fall alert, heart rate update, device status |
| `zustand`                                   | ^5.0.12  | Global state for realtime stores and lightweight runtime state                 |
| `nativewind`                                | ^4.2.2   | Tailwind CSS for React Native (`className` used on components on every screen) |
| `tailwindcss`                               | ^3.4.17  | Utility class engine for NativeWind                                            |
| `expo-font`                                 | ~55.0.8  | Loads Kanit and Material Symbols Outlined (`components/MaterialSymbol.tsx`)    |
| `expo-secure-store`                         | ~55.0.14 | Stores the JWT token securely                                                  |
| `@react-native-async-storage/async-storage` | 2.2.0    | Persistent storage for non-sensitive data such as preferences                  |
| `expo-notifications`                        | ~55.0.23 | Receives and handles Expo Push Notifications (fall alert)                      |
| `expo-device`                               | ~55.0.17 | Checks that the app runs on a real physical device before requesting a push token |
| `expo-constants`                            | ~55.0.16 | Reads app config such as `expoConfig` for builds                               |
| `react-native-ble-manager`                  | ^12.4.5  | BLE for provisioning the ESP32 device via the pairing wizard                   |
| `react-native-wifi-reborn`                  | ^4.13.6  | Scans nearby WiFi networks in the mobile BLE WiFi provisioning flow            |
| `expo-camera`                               | ~55.0.19 | Scans QR codes during device pairing                                           |
| `react-native-safe-area-context`            | ~5.6.2   | SafeArea insets for the notch and nav bar                                      |
| `expo-navigation-bar`                       | ~55.0.13 | Hides/controls the Android navigation bar                                      |
| `expo-system-ui`                            | ~55.0.18 | Sets the system UI background color                                            |
| `react-native-screens`                      | ~4.23.0  | Native screen optimization together with expo-router                           |
| `react-native-gesture-handler`              | ~2.30.0  | Basic gesture recognition (swipe, tap)                                         |
| `react-native-reanimated`                   | 4.2.1    | Animation engine (used with gestures and layout animation)                     |
| `react-native-worklets`                     | 0.7.4    | Worklet runtime required by Reanimated 4                                       |
| `react-native-draggable-flatlist`           | ^4.0.3   | Drag-to-reorder emergency contacts list                                        |
| `react-native-keyboard-aware-scroll-view`   | ^0.9.5   | Scroll view that moves up automatically when the keyboard opens                |
| `react-native-paper`                        | ^5.15.0  | Some UI components that use Material Design                                    |
| `react-native-toast-message`                | ^2.3.3   | Success/error toasts in various flows                                          |
| `expo-image`                                | ~55.0.11 | Optimized image display with caching                                           |
| `expo-image-picker`                         | ^55.0.20 | Picks/edits the profile picture via Expo Image Picker                          |
| `expo-splash-screen`                        | ~55.0.21 | Keeps the splash screen visible until fonts/auth finish loading                |
| `expo-status-bar`                           | ~55.0.6  | Controls the status bar color                                                  |
| `expo-linking`                              | ~55.0.15 | Deep links for push notification taps                                          |
| `expo-web-browser`                          | ~55.0.16 | Opens URLs in an in-app browser                                                |
| `expo-build-properties`                     | ~55.0.14 | Sets native build config (minSdk, NSUsage strings)                             |
| `expo-dev-client`                           | ~55.0.35 | Dev build client for custom native modules                                     |
| `react-native-web`                          | ~0.21.2  | Web compatibility layer for the Expo web target                                |
| `@react-navigation/native`                  | ^7.1.8   | Navigation core (used together with expo-router)                               |
| `@react-navigation/native-stack`            | ^7.3.16  | Native stack navigator                                                         |

### Expo-Bundled Dependencies Used Directly

| Library              | Resolved Version | What it does in this project                                                                                        |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `@expo/vector-icons` | 15.1.1           | Icons from Ionicons, MaterialIcons, and MaterialCommunityIcons for UI that needs an explicit glyph map, e.g. the WiFi list |

### Dev Dependencies

| Library                             | Version  | What it does                                |
| ----------------------------------- | -------- | ------------------------------------------- |
| `typescript`                        | ~5.9.2   | Type checking for Expo SDK 55               |
| `eslint`                            | ^9.30.1  | Linting                                     |
| `@eslint/eslintrc`                  | ^3.3.5   | ESLint flat-config compatibility            |
| `@eslint/js`                        | ^9.39.4  | ESLint recommended JavaScript rules         |
| `eslint-config-expo`                | ~55.0.1  | Expo ESLint preset                          |
| `eslint-config-prettier`            | ^10.1.8  | Disables ESLint rules that conflict with Prettier |
| `eslint-import-resolver-typescript` | ^4.4.4   | Resolves TypeScript imports in ESLint       |
| `eslint-plugin-prettier`            | ^5.5.5   | Runs Prettier through ESLint                |
| `eslint-plugin-unused-imports`      | ^4.4.1   | Detects unused imports                      |
| `@typescript-eslint/eslint-plugin`  | ^8.56.1  | TypeScript lint rules                       |
| `@typescript-eslint/parser`         | ^8.56.1  | TypeScript parser for ESLint                |
| `prettier`                          | ^3.8.1   | Code formatting                             |
| `jest`                              | ~29.7.0  | Test runner                                 |
| `jest-expo`                         | ~55.0.18 | Jest preset for Expo projects               |
| `@testing-library/react-native`     | ^13.3.3  | Component testing utilities                 |
| `@testing-library/jest-native`      | ^5.4.3   | Custom matchers for React Native            |
| `@types/jest`                       | 29.5.14  | Jest type definitions                       |
| `@types/react`                      | ~19.2.10 | React type definitions                      |
| `react-test-renderer`               | 19.2.0   | Renders components in tests                 |
| `@expo/ngrok`                       | ^4.1.3   | Tunnel support for `expo start --tunnel`    |
| `knip`                              | ^6.0.5   | Dead-code scan of the mobile package        |
| `patch-package`                     | ^8.0.1   | Patches node_modules bugs without forking   |

---

## Backend (Node.js 24 + Express v5)

### Production Dependencies

| Library              | Version | What it does in this project                                                  |
| -------------------- | ------- | ----------------------------------------------------------------------------- |
| `express`            | ^5.2.1  | Main HTTP server — routing, middleware, error handling                        |
| `@prisma/client`     | 7.8.0   | ORM client for querying PostgreSQL                                            |
| `@prisma/adapter-pg` | 7.8.0   | Prisma adapter for the pg driver                                              |
| `mqtt`               | ^5.15.0 | MQTT client connecting to HiveMQ Cloud — receives fall/heartrate/status from the ESP32 |
| `socket.io`          | ^4.8.3  | Real-time server that sends events to the mobile app                          |
| `jsonwebtoken`       | ^9.0.3  | Creates and verifies JWT auth tokens                                          |
| `bcryptjs`           | ^3.0.3  | Hashes passwords before storing them in the DB                                |
| `resend`             | ^6.9.2  | Sends email OTPs for the forgot password flow                                 |
| `pg`                 | ^8.20.0 | PostgreSQL driver used by the Prisma adapter to connect to the database       |
| `express-rate-limit` | ^8.2.1  | Rate limiting against brute force on auth endpoints                           |
| `cors`               | ^2.8.6  | CORS middleware allowing the mobile app and admin panel                       |
| `debug`              | ^4.4.3  | Namespaced logging (`fallhelp:mqtt`, `fallhelp:socket`, etc.) instead of console.log |
| `dotenv`             | ^17.3.1 | Loads every environment variable from `.env`                                  |

### Dev Dependencies

| Library                            | Version | What it does                                           |
| ---------------------------------- | ------- | ------------------------------------------------------ |
| `prisma`                           | 7.8.0   | CLI — migrate, generate, seed, studio                  |
| `typescript`                       | ^6.0.3  | Type checking (strict mode)                            |
| `typescript-eslint`                | ^8.56.1 | Shared TypeScript ESLint tooling                       |
| `tsx`                              | ^4.21.0 | Runs TypeScript directly with hot reload during dev    |
| `ts-node-dev`                      | ^2.0.0  | Legacy TypeScript dev runner still in the package      |
| `eslint`                           | ^9.30.1 | Linting                                                |
| `@eslint/js`                       | ^9.30.1 | ESLint recommended JavaScript rules                    |
| `eslint-config-prettier`           | ^10.1.8 | Disables ESLint rules that conflict with Prettier      |
| `eslint-plugin-prettier`           | ^5.5.5  | Runs Prettier through ESLint                           |
| `eslint-plugin-unused-imports`     | ^4.4.1  | Detects unused imports                                 |
| `@typescript-eslint/eslint-plugin` | ^8.56.1 | TypeScript lint rules                                  |
| `@typescript-eslint/parser`        | ^8.56.1 | TypeScript parser for ESLint                           |
| `prettier`                         | ^3.8.1  | Code formatting                                        |
| `jest`                             | 30.2.0  | Test runner                                            |
| `ts-jest`                          | ^29.4.6 | TypeScript transformer for Jest                        |
| `supertest`                        | ^7.2.2  | HTTP integration tests against the Express app         |
| `cross-env`                        | ^10.1.0 | Sets environment variables cross-platform (Windows/Linux) |
| `concurrently`                     | ^9.2.1  | Runs several scripts at once (dev:all)                 |
| `knip`                             | ^6.0.4  | Dead-code scan of the backend package                  |
| `@types/cors`                      | ^2.8.19 | Type definitions for CORS                              |
| `@types/debug`                     | ^4.1.12 | Type definitions for debug                             |
| `@types/express`                   | ^5.0.6  | Type definitions for Express v5                        |
| `@types/jest`                      | ^30.0.0 | Type definitions for Jest                              |
| `@types/jsonwebtoken`              | ^9.0.10 | Type definitions for jsonwebtoken                      |
| `@types/node`                      | ^25.3.0 | Type definitions for Node.js                           |
| `@types/pg`                        | ^8.16.0 | Type definitions for the PostgreSQL driver             |
| `@types/supertest`                 | ^6.0.3  | Type definitions for Supertest                         |

---

## Admin (React 19 + Vite)

### Production Dependencies

| Library                 | Version  | What it does in this project                                 |
| ----------------------- | -------- | ------------------------------------------------------------ |
| `react`                 | 19.2.0   | Core React                                                   |
| `react-dom`             | 19.2.0   | DOM renderer                                                 |
| `react-router-dom`      | ^7.13.1  | Client-side routing for every page in the Admin panel        |
| `@tanstack/react-query` | ^5.90.21 | Data fetching, caching, invalidation for all API calls       |
| `axios`                 | ^1.16.0  | HTTP client for the backend API                              |
| `@heroicons/react`      | ^2.2.0   | Icons throughout the Admin UI                                |
| `qrcode.react`          | ^4.2.0   | Displays QR codes for device pairing in the admin pages      |
| `sonner`                | ^2.0.7   | Toast notifications (success/error)                          |

### Dev Dependencies

| Library                       | Version  | What it does                                        |
| ----------------------------- | -------- | --------------------------------------------------- |
| `vite`                        | ^7.3.1   | Bundler and dev server                              |
| `@vitejs/plugin-react`        | ^5.1.4   | Vite plugin for React (Fast Refresh)                |
| `tailwindcss`                 | ^4.2.2   | Utility-first CSS styling throughout Admin          |
| `@tailwindcss/vite`           | ^4.2.2   | Tailwind v4 integration with Vite                   |
| `postcss`                     | ^8.5.6   | CSS transformation pipeline                         |
| `typescript`                  | ^6.0.3   | Type checking                                       |
| `typescript-eslint`           | ^8.56.1  | Shared TypeScript ESLint tooling                    |
| `eslint`                      | ^9.39.1  | Linting                                             |
| `@eslint/js`                  | ^9.39.1  | ESLint recommended JavaScript rules                 |
| `eslint-config-prettier`      | ^10.1.8  | Disables ESLint rules that conflict with Prettier   |
| `eslint-plugin-prettier`      | ^5.5.5   | Runs Prettier through ESLint                        |
| `eslint-plugin-react-hooks`   | ^7.0.1   | Checks React Hooks rules                            |
| `eslint-plugin-react-refresh` | ^0.5.2   | Checks Fast Refresh constraints                     |
| `globals`                     | ^17.3.0  | Browser/test globals for the ESLint config          |
| `prettier`                    | ^3.8.1   | Code formatting                                     |
| `jest`                        | ^30.2.0  | Test runner                                         |
| `ts-jest`                     | ^29.4.6  | TypeScript transformer for Jest                     |
| `jest-environment-jsdom`      | ^30.2.0  | Browser environment for component tests             |
| `@testing-library/dom`        | ^10.4.1  | DOM testing utilities used by React Testing Library |
| `@testing-library/react`      | ^16.3.2  | Component testing utilities                         |
| `@testing-library/jest-dom`   | ^6.9.1   | Custom DOM matchers                                 |
| `@types/jest`                 | ^30.0.0  | Type definitions for Jest                           |
| `@types/node`                 | ^25.3.0  | Type definitions for Node.js                        |
| `@types/react`                | ^19.2.14 | Type definitions for React                          |
| `@types/react-dom`            | ^19.2.3  | Type definitions for React DOM                      |
| `knip`                        | ^6.0.5   | Dead-code scan of the admin package                 |

---

## Arduino (ESP32 Firmware)

### External Libraries (installed via the Arduino Library Manager)

| Library                 | What it does in this project                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `ArduinoJson`           | Serialize/deserialize JSON for the MQTT payload of every topic (fall, heartrate, status, config) |
| `PubSubClient`          | MQTT client on the ESP32 — publish/subscribe with HiveMQ Cloud over TLS                    |
| `PulseSensorPlayground` | Reads heart rate from the XD-58C pulse sensor (GPIO34) with interrupt-based sampling       |
| `I2Cdev`                | I2C abstraction layer for reading the MPU6050                                              |
| `MPU6050`               | Driver that reads the accelerometer and gyroscope (GPIO21/22 SDA/SCL) for fall detection   |

### Built-in ESP32 Arduino Core (no separate install needed)

| Library                                            | What it does in this project                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `WiFi`                                             | Connects to WiFi and handles automatic reconnect                             |
| `WiFiClientSecure`                                 | TLS client for MQTT over TLS port 8883 (HiveMQ Cloud)                        |
| `BLEDevice` / `BLEServer` / `BLEUtils` / `BLE2902` | BLE GATT server for provisioning WiFi credentials via the app during pairing |
| `Preferences`                                      | Stores WiFi SSID/password and device config in NVS flash (survives restarts) |
| `Wire`                                             | I2C communication bus for the MPU6050 (GPIO21=SDA, GPIO22=SCL)               |
| `stdarg.h`                                         | Variadic arguments for printf-style debug logging                            |

---

## Related Docs

- [Project Structure](../architecture/project-structure.md)
- [Cross-Platform Development](../ops/cross-platform-development.md)
- [Firmware AI Context](../ai/firmware.md)
