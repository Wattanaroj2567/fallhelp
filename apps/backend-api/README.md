# FallHelp Backend

[English](README.md) · [ภาษาไทย](README.th.md)

Express v5 + TypeScript API for FallHelp, including MQTT ingestion, Socket.io realtime events, and PostgreSQL persistence.

**Last Updated:** June 20, 2026

## Scope

- REST API for mobile/admin clients
- MQTT handlers for IoT events (`fall`, `fall_cancelled`, `heartrate`, `status`)
- Socket.io realtime broadcasting
- Prisma data access and migrations

## Source Layout

```text
src/
├── app.ts
├── server.ts
├── controllers/
├── services/
├── routes/
├── middlewares/
├── iot/
│   ├── mqttClient.ts
│   ├── topics.ts
│   ├── payloadValidator.ts
│   ├── eventNormalizer.ts
│   └── handlers/
│       ├── fallHandler.ts
│       ├── fallCancelledHandler.ts
│       ├── heartRateHandler.ts
│       └── statusHandler.ts
└── realtime/
    └── socketServer.ts
```

Runtime note: confirmed fall handling updates the event first, emits Socket.io realtime alerts, then creates notification history and sends Expo Push.

## Quick Start

```bash
cd apps/backend-api
npm install
cp .env.example .env

# Update .env before running:
# DATABASE_URL, DATABASE_URL_DOCKER, JWT_SECRET, ENCRYPTION_KEY, MQTT_BROKER_URL

npm run prisma:migrate
npm run prisma:seed
npm run db:verify
npm run dev
```

Default local URLs:

- API: `http://localhost:3000`
- Health (internal): `http://localhost:3000/internal/health`

## Docker Compose

The root [`../../docker-compose.yml`](../../docker-compose.yml) file can bring up `backend`, `admin`, and `tunnel` together (Mosquitto runs separately as a native service).
`npm run env:setup` creates the root `.env` as a symlink to `apps/backend-api/.env`
so Docker Compose can read the secrets/local config automatically.

```bash
docker compose up -d --build --pull always
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Defaults:

- Backend: `http://localhost:3000`
- Admin: `http://localhost:5173`

Current runtime notes:

- The backend Docker image runs from `dist/server.js`; it no longer runs `tsx src/server.ts` inside the container
- The image is slimmed down by installing only the backend's production dependencies in the runtime stage
- `docker compose exec backend npx prisma migrate deploy` is still supported as before
- If you need the Cloudflare named tunnel, add `--profile tunnel`

The Admin Docker image takes `ADMIN_VITE_API_URL` from Compose and passes it to Vite as the `VITE_API_URL` build arg.
To override it at build time, set `ADMIN_VITE_API_URL` before running `docker compose up --build`.

Common cleanup commands:

```bash
docker builder prune -f
docker image prune -f
```

To check the current image sizes:

```bash
docker image ls fallhelp-backend fallhelp-admin
docker system df
```

## Commands

```bash
npm run dev                  # API only (hot reload, uses external MQTT broker)
npm run dev:server           # API only (hot reload)
npm run build                # TypeScript build
npm run typecheck            # TypeScript check (no emit)
npm run lint                 # ESLint
npm run lint:fix             # ESLint autofix
npm run test:ci              # Unit tests (CI/sandbox-safe, no watchman)
npm run test -- --watchman=false
npm run db:test:setup        # Create/recreate fallhelp_test schema from current Prisma schema history
npm run test:integration     # Auto-prepare fallhelp_test, then run integration tests
npm run test:integration:raw # Run integration tests without re-preparing the test DB
npm run db:reset             # Reset DB + schema setup
npm run db:verify            # Verify PostgreSQL schema objects required by runtime
npm run prisma:studio        # Prisma Studio
```

## Environment

Use `apps/backend-api/.env.example` as source of truth. Important groups:

- Database: `DATABASE_URL`, `DATABASE_URL_DOCKER`
- Auth: `JWT_SECRET`, `JWT_EXPIRES_IN`
- Server: `PORT`, `NODE_ENV`, `LOG_LEVEL`
- MQTT: `MQTT_BROKER_URL`, `MQTT_USERNAME`, `MQTT_PASSWORD`, `MQTT_DISABLED`
- Runtime tuning: `DEVICE_ONLINE_THRESHOLD_MS`, `WIFI_CONFIGURING_STALE_MS`
- Security: `ENCRYPTION_KEY` (32 chars exactly)

## Verify Before PR

```bash
npm run build
npm run typecheck
npm run lint
npm run test:ci
npm run test -- --watchman=false
```

If integration environment is ready (DB + broker):

```bash
npm run test:integration
```

`test:integration` derives the URL from `apps/backend-api/.env`, creates the `fallhelp_test` database if it does not exist, then recreates the test DB's `public` schema before applying the current migration history every time.
This prevents the "test DB exists but the schema is incomplete" problem without touching the main dev DB.

## Related Docs

- Root guide: [`../../README.md`](../../README.md)
- API docs package: [`./docs/README.md`](./docs/README.md)
- API reference: [`../../docs/api/api-reference.md`](../../docs/api/api-reference.md)
- Postman collection: [`./docs/api/postman_collection.json`](./docs/api/postman_collection.json)
- MQTT technical notes: [`../../docs/architecture/iot-mqtt.md`](../../docs/architecture/iot-mqtt.md)
- Project documentation index: [`../../docs/README.md`](../../docs/README.md)
