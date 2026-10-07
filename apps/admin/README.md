# FallHelp Admin

[English](README.md) · [ภาษาไทย](README.th.md)

React + Vite web admin panel for FallHelp device operations.

## Scope

- Device management view for registered ESP32 devices
- Admin authentication and protected routes
- API integration for device list, register, delete, and force-unpair workflows

## Quick Start

```bash
cd apps/admin
npm install
cp .env.example .env
npm run dev
```

Default local URL: `http://localhost:5173`  
Expected backend API URL: `http://localhost:3000/api`

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
npm run test:coverage
npm run preview
```

## Docker

It can be run through the root compose file at [`../../docker-compose.yml`](../../docker-compose.yml)

```bash
docker compose --env-file apps/backend-api/.env up -d --build --pull always admin
```

The default web URL for the container is `http://localhost:5173`

## Environment

Use `apps/admin/.env.example` as source of truth.

- `VITE_API_URL=http://localhost:3000/api`

## Data Layer

- `src/services/api.ts` is the shared Axios instance for the base URL, auth token, interceptors, and 401 handling
- `src/services/adminAuthService.ts` handles administrator login
- `src/services/adminDeviceService.ts` groups the Admin API fetch/mutation functions for device list, register, delete, and force-unpair
- `src/hooks/useAdminDevices.ts` owns the TanStack Query cache/state of the Devices page, such as `queryKey`, polling interval, and invalidation

## Verify Before PR

```bash
npm run build
npm run typecheck
npm run lint
npm run test
```

## Related Docs

- Root guide: [`../../README.md`](../../README.md)
- Documentation index: [`../../docs/README.md`](../../docs/README.md)
- Admin feature spec: [`../../docs/features/admin-panel.md`](../../docs/features/admin-panel.md)
