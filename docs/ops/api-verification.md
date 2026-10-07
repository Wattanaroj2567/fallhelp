# API Verification Runbook

[English](api-verification.md) · [ภาษาไทย](api-verification.th.md)

## Doc Meta

- Audience: QA, Backend Dev, Mobile Dev
- Source of Truth: [../../apps/backend-api/src/routes](../../apps/backend-api/src/routes) + [../../apps/backend-api/docs/api/postman_collection.json](../../apps/backend-api/docs/api/postman_collection.json)
- Status: Active
- Last Updated: May 21, 2026

---

## Overview

This runbook is used to verify that the FallHelp REST API still works end to end after code changes or documentation updates, using the project's shared Postman collection as the baseline.

This runbook focuses on 3 things:

1. Preparing the environment before calling the API
2. Using the same Postman collection that the real documentation is based on
3. Checking a minimal set of flows that catch regressions quickly

---

## Required Inputs

You need the following values before testing the related flows:

- `baseUrl`
  - Local default: `http://localhost:3000/api`
- `authToken`
  - Obtained from `POST /auth/login`
- `elderId`
  - Obtained from `POST /elders` or `GET /elders/current`
- `deviceId`
  - Obtained from `GET /devices/by-code/:deviceCode`, `POST /device-pairings`, or `GET /admin/devices`
- `deviceCode`
  - Used in the pairing flow
- `eventId`
  - Used to call `GET /events/:id`
- `contactId`, `notificationId`
  - Taken from the response of each section before sending the next request

---

## Pre-check

Before opening Postman, run at least the following check:

```bash
npm run infra:scan
```

To test the local backend:

```bash
npm run backend:dev
```

To run the backend through Docker:

```bash
docker compose --env-file apps/backend-api/.env up -d --build --pull always backend
```

---

## Collection Source

Use this file as the primary source:

- [../../apps/backend-api/docs/api/postman_collection.json](../../apps/backend-api/docs/api/postman_collection.json)

And use this document alongside it when you need to inspect request/response details:

- [../api/api-reference.md](../api/api-reference.md)

### Auto-Captured Variables

The current Postman collection has `Tests` scripts on some requests that capture values from the response automatically, which reduces manual copying while testing sequential flows.

Requests that capture values automatically:

- `POST /auth/login` → `authToken`, `userId`
- `POST /elders` → `elderId`
- `GET /devices/by-code/:deviceCode` → `deviceId`, `deviceCode`
- `POST /device-pairings` → `deviceId`, `deviceCode`
- `GET /events` → `eventId`
- `GET /notifications` → `notificationId`, `eventId`

Rules for these scripts:

- If the response does not contain the required data, the whole collection does not fail
- A script sets a variable only when the required field actually exists

---

## Recommended Smoke Flow

This order gives the best value for a quick regression check:

1. `GET /internal/health`
   - Check that the backend responds and the DB is not down
2. `POST /auth/login`
   - Put the `token` into `authToken`
3. `GET /users/me`
   - Check JWT and the auth middleware
4. `GET /users/me`
   - Check the user profile flow
5. `GET /elders/current`
   - Check the caregiver → elder relationship
6. `GET /notifications`
   - Check pagination and event attachment
7. `GET /events?elderId={{elderId}}&page=1&limit=10`
   - Check the paginated event read flow
8. `GET /admin/devices`
   - Use an admin token only, to check the admin device-management surface

---

## Feature Flows

### Auth

Use this order:

1. `POST /auth/register`
2. `POST /auth/login`
3. `POST /auth/request-otp`
4. `POST /auth/verify-otp`
5. `POST /auth/reset-password`
6. `POST /auth/logout`

### Elder + Device Pairing

Use this order:

1. `POST /elders`
2. `GET /devices/by-code/:deviceCode`
3. `POST /device-pairings`
4. `PUT /devices/:id/wifi-config`
5. `GET /devices/:id/wifi-config`
6. `DELETE /device-pairings/:deviceId`

### Emergency Contacts

Use this order:

1. `POST /elders/:elderId/emergency-contacts`
2. `GET /elders/:elderId/emergency-contacts`
3. `PATCH /elders/:elderId/emergency-contacts/:contactId`
4. `PATCH /elders/:elderId/emergency-contacts/order`
5. `DELETE /elders/:elderId/emergency-contacts/:contactId`

### Events + Notifications

Use this order:

1. `GET /events?elderId={{elderId}}&page=1&limit=20`
2. `GET /events/:id`
3. `GET /events/summary/monthly`
4. `GET /notifications`
5. `GET /notifications/unread-count`
6. `PATCH /notifications/:id` (body: `{ isRead: true }`)
7. `PATCH /notifications` (body: `{ action: "mark_all_read" }`)

### Admin

Use an admin token:

1. `GET /admin/devices`
2. `POST /admin/devices`
3. `POST /admin/devices/:id/unpair`
4. `DELETE /admin/devices/:id`

---

## Known Constraints

- `Notification.eventId`
  - Is a required FK to `events.id`
- `fall_cancelled`
  - Must come from the device flow only
- `Device.status`
  - Means pairing state, not online/offline
- `online/offline`
  - Is computed from `lastOnline`

---

## Common Failure Checks

If a request fails, check the following in order:

1. `401 Unauthorized`
   - The token has expired, or `authToken` has not been set
2. `403 Forbidden`
   - The token belongs to a different role, or the caller does not own the resource
3. `404 Not Found`
   - An old `id` is being used after data was deleted/reset
4. `400 Validation Error`
   - The body still uses old fields such as `adminResponse` (renamed to `adminNote`), `qrData`, `orderedIds`
5. `GET /events/:id` fails
   - Check that the `eventId` still actually exists in the system
6. `PUT /devices/:id/wifi-config` hangs
   - The backend responds, but the device does not ACK or MQTT is not ready

---

## Exit Criteria

The API baseline is considered working when:

- `GET /internal/health` passes
- The auth flow passes at least `login -> me`
- The user flow passes at least `profile -> current elder`
- The event flow passes at least `recent -> detail -> summary`
- The notification flow passes at least `list -> unread-count`
- The admin flow passes at least `GET /admin/devices`

---

## Related Docs

- [../api/api-reference.md](../api/api-reference.md)
- [../architecture/system-design.md](../architecture/system-design.md)
- [../architecture/data-model.md](../architecture/data-model.md)
- [../../apps/backend-api/docs/api/postman_collection.json](../../apps/backend-api/docs/api/postman_collection.json)
