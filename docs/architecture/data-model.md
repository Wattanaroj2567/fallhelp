# Data Model

[English](data-model.md) · [ภาษาไทย](data-model.th.md)

## Doc Meta

- Audience: Backend Dev / Data Analyst / Thesis Reviewer
- Source of Truth: [schema.prisma](../../apps/backend-api/prisma/schema.prisma), [eventService.ts](../../apps/backend-api/src/services/eventService.ts)
- Status: Active
- Last Updated: May 21, 2026

---

## Overview

FallHelp uses **PostgreSQL** as the main database for Events and relational data, with 7 core Models linked together.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Elder : "cares for"
    User ||--o{ Notification : "receives"
    User ||--o{ AuthOtp : "has OTPs"

    Elder ||--o| Device : "paired with"
    Elder ||--o{ EmergencyContact : "has contacts"
    Elder ||--o{ Event : "has events"

    Device ||--o{ Event : "generates"

    User {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        string gender
        string phone
        string profileImage
        string pushToken
        string role
    }

    Elder {
        string id PK
        string firstName
        string lastName
        string gender
        datetime dateOfBirth
        int height
        float weight
        string diseases
        string phone
        string houseNumber
        string villageNumber
        string villageName
        string subdistrict
        string district
        string province
        string zipcode
        string userId FK_UK
    }

    Device {
        string id PK
        string deviceCode UK
        string serialNumber UK
        string status
        string wifiStatus
        datetime lastOnline
        datetime updatedAt
        string elderId FK_UK
    }

    Event {
        string id PK
        string fallStage
        int bpm
        float magnitude
        float postureDelta
        datetime cancelledAt
        datetime timestamp
        string elderId FK
        string deviceId FK
    }

    EmergencyContact {
        string id PK
        string name
        string phone
        string relationship
        int priority
        string elderId FK
    }

    Notification {
        string id PK
        string title
        string message
        boolean isRead
        datetime readAt
        datetime createdAt
        string userId FK
        string eventId FK
    }

    AuthOtp {
        string id PK
        string code
        datetime expiresAt
        datetime createdAt
        string userId FK
    }
```

## Notification -> Event Relation Note

`notifications` uses a required FK via `eventId -> events.id`:

1. Every Notification in the current phase must originate from a real event
2. The relation from Notification to Event can be queried directly through the relational model
3. If an Event is deleted, its Notifications are deleted too via `onDelete: Cascade`, so no orphaned records are left behind

## User -> Elder Relation Note

The `User -> Elder` relationship in the current schema should be read as **1 Mandatory to 1 Optional**,
not a `1 to 1` that is mandatory on both sides, for these reasons:

1. `Elder.userId` is required and unique
   - Every Elder must have exactly 1 owning User
2. The `User` side is still optional
   - A User may have no Elder yet at the schema level
3. System-level reasons:
   - Supports the onboarding period where an account is registered before the elder's information is filled in
   - Supports `ADMIN` accounts that are not linked to any Elder

So keep two levels of understanding separate:

- **Schema truth:** a `User` may have 0 or 1 Elder
- **Business expectation:** a user with the `CAREGIVER` role should have an Elder once setup is complete

Summary:

- `Elder` -> `User` side = mandatory
- `User` -> `Elder` side = optional

---

## Cascade & Deletion Rules

What happens to linked records when a parent record is deleted:

| Parent     | Child            | Rule      | Result                                          |
| :--------- | :--------------- | :-------- | :---------------------------------------------- |
| **Elder**  | Event            | `Cascade` | Deletes all event history                       |
| **Elder**  | EmergencyContact | `Cascade` | Deletes all emergency contacts                  |
| **Elder**  | Device           | `SetNull` | Unpairs the device (the Device is not deleted)  |
| **User**   | Elder            | `Cascade` | Deletes all Elders under their care             |
| **User**   | Notification     | `Cascade` | Deletes all notifications                       |
| **User**   | AuthOtp          | `Cascade` | Deletes all OTPs                                |
| **Device** | Event            | `Cascade` | Deletes all Events                              |

---

## Constrained TEXT Reference

| Field                | Allowed Values                              | Usage                                                                             |
| :------------------- | :------------------------------------------ | :-------------------------------------------------------------------------------- |
| `users.role`         | ADMIN, CAREGIVER                            | User role in system                                                               |
| `users.gender`       | MALE, FEMALE, OTHER                         | User gender                                                                       |
| `elders.gender`      | MALE, FEMALE, OTHER                         | Elder gender                                                                      |
| `devices.status`     | PAIRED, UNPAIRED                            | Device pairing state (not online/offline — see `lastOnline` + `isDeviceOnline()`) |
| `devices.wifiStatus` | CONNECTED, DISCONNECTED, CONFIGURING, ERROR | WiFi state                                                                        |
| `events.fallStage`   | PENDING_CONFIRMATION, CONFIRMED, CANCELLED  | Fall lifecycle source of truth                                                    |

---

## Indexes

### Performance Indexes

| Table           | Index                              | Purpose                  |
| :-------------- | :--------------------------------- | :----------------------- |
| `events`        | `(elderId, timestamp DESC)`        | Query events by elder    |
| `events`        | `(deviceId, timestamp DESC)`       | Query events by device   |
| `events`        | `(deviceId, fallStage, cancelledAt, timestamp DESC)` | Query fall lifecycle by device |
| `events`        | `(fallStage, timestamp DESC)`      | Filter by fall stage     |
| `events`        | `(timestamp DESC)`                 | General time-range query |
| `notifications` | `(userId, isRead, createdAt DESC)` | Unread notifications     |
| `notifications` | `(eventId)`                        | Event relation lookup    |
| `auth_otps`     | `(userId, expiresAt)`              | OTP lookup               |

### Unique Constraints

| Table                | Constraint            | Purpose                                   |
| :------------------- | :-------------------- | :---------------------------------------- |
| `users`              | `email`               | Prevents duplicate emails                 |
| `users`              | `phone`               | Prevents duplicate phone numbers          |
| `elders`             | `userId`              | 1 User : 1 Elder                          |
| `devices`            | `deviceCode`          | Unique QR Code                            |
| `devices`            | `serialNumber`        | Unique Serial Number                      |
| `devices`            | `elderId`             | 1 Elder : 1 Device                        |
| `emergency_contacts` | `(elderId, priority)` | Unique priority within the same Elder     |

---

## Event Data Model

The Event system is the core of data collection from IoT devices on **PostgreSQL**, with time-based indexes designed to support daily/monthly historical queries.

### Prisma Schema

```prisma
model Event {
  id           String   @id @default(uuid())
  elderId      String
  deviceId     String
  fallStage    String   // PENDING_CONFIRMATION | CONFIRMED | CANCELLED
  bpm          Int?     // BPM at the time of the fall (null if no pulse data)
  magnitude    Float?   // Impact strength from processed evidence
  postureDelta Float?   // Posture change from processed evidence
  cancelledAt  DateTime?
  timestamp    DateTime @default(now())
}
```

### Event Query Strategy

The Events table uses a single-column **Primary Key** on `id` and relies on the `timestamp` index for time-range queries:

- **Pro:** Queries by ID and by relation are straightforward
- **Pro:** Time-range queries stay fast thanks to the `timestamp` index
- **Note:** There is no need to pass `timestamp` together with `id` when fetching an individual event

### Notification Reference Strategy

`Notification` uses a required Foreign Key via `eventId -> events.id`

- Every Notification in the current phase must originate from a real event
- notifications can be joined directly to events through the relational constraint
- If an event is deleted, the system deletes its notifications too via `onDelete: Cascade`

---

## Event Scope

In the current phase, the Event system is used for **fall events only**,
so there is no separate `type` layer, and `severity` is not stored in the database directly.

- To determine an event's lifecycle, look at `fallStage`
- If the UI wants to show a severity level, it can be derived from `fallStage`
  - `PENDING_CONFIRMATION` -> `WARNING`
  - `CONFIRMED` -> `CRITICAL`
  - `CANCELLED` -> no longer considered an active alert

---

## Fall Event Stages

Fall Detection uses **2-Stage Confirmation:**

```text
Suspected (fallStage=PENDING_CONFIRMATION)
  -> Confirmed (fallStage=CONFIRMED)
  -> Cancelled (fallStage=CANCELLED, cancelledAt != null)
```

| Stage     | `fallStage`             | `cancelledAt`        |
| :-------- | :---------------------- | :------------------- |
| Suspected | `PENDING_CONFIRMATION`  | `null`               |
| Confirmed | `CONFIRMED`             | `null`               |
| Cancelled | `CANCELLED`             | Time of cancellation |

### `fallStage` as Source of Truth

For the current fall flow, treat `fallStage` as the **source of truth** of the event lifecycle.
Other fields serve only as supporting data:

- `fallStage` gives the main state of the event: `PENDING_CONFIRMATION`, `CONFIRMED`, or `CANCELLED`
- `cancelledAt` records the time when the wearer actually pressed the cancel button; it does not decide the main state
- `magnitude` and `postureDelta` are supporting detection evidence, not lifecycle indicators

Interpretation rules to use across the whole system:

| `fallStage` | Meaning | UI state | Notification behavior | Socket behavior |
| :---------- | :-------- | :------- | :-------------------- | :-------------- |
| `PENDING_CONFIRMATION` | Initial fall detected, awaiting confirmation | No Mobile UI change | No push/in-app notification yet | Sends `event_status_changed` with `FALL_SUSPECTED` as an internal guard |
| `CONFIRMED` | Fall confirmed | `FALL` | Sends push + in-app notification | Sends `fall_detected` and `event_status_changed` with `FALL_CONFIRMED` |
| `CANCELLED` | The wearer pressed cancel on the device in time | No Mobile UI change | No additional notification | Sends `event_status_changed` with `FALL_CANCELLED` to clear the pending guard |

**Cancellation Source (only one source allowed):**

- **Device Button only:** the wearer presses the GPIO27 button within 15 seconds → ESP32 sends MQTT `fall_cancelled` → Backend updates `cancelledAt`
- **State Guard:** the backend only allows a change to `CANCELLED` for events that are still `PENDING_CONFIRMATION`. If the event is already `CONFIRMED`, a late `fall_cancelled` must be ignored

> ⚠️ **Caregivers cannot cancel a fall event** — the caregiver can only **Acknowledge in the app** to return the view to normal, which does not change `cancelledAt` in the DB

### Fall Evidence Fields

For the 2-stage flow, the key evidence is stored directly on the event:

- `magnitude`: SVM/impact evidence value
- `postureDelta`: posture change after the incident

### Realtime Status Mapping (Socket -> Mobile)

Mobile changes its main fall alert state only from the Socket `fall_detected` event, which means the fall has been confirmed.
`PENDING_CONFIRMATION` and `CANCELLED` are sent as `event_status_changed` so mobile can manage its internal pending guard, but they do not show a caregiver alert and do not create a notification.

---

## Query Functions

### getEventsByElder

Fetches Events by Elder with Pagination and Filters:

```
GET /api/events?elderId=elder-uuid&startDate=2026-01-01&endDate=2026-02-01&page=1&limit=20
```

- **Access:** the elder's owner only (current single-caregiver model)
- **Default Sort:** `timestamp DESC` (newest first)

### getMonthlySummary

Monthly event summary:

```
GET /api/events/summary/monthly?elderId=elder-uuid&year=2026&month=2
```

## Access Control

| Operation           | OWNER                       | VIEWER |
| :------------------ | :-------------------------- | :----- |
| View Events         | ✅                          | ✅     |
| Cancel a Fall Event | ❌ (device-only via GPIO27) | ❌     |
| View Summary        | ✅                          | ✅     |
| Create Event        | ❌ (System/IoT only)        | ❌     |

> **Note:** `cancelledAt` in the DB can only be changed by MQTT `fall_cancelled` (device button GPIO27) — the caregiver can only do a UI-only reset (Acknowledge), which does not change the DB

---

## Cascade Delete

When an Elder is deleted → all of that Elder's Events are deleted automatically (`onDelete: Cascade`)

---

## Related Docs

- [System Design](system-design.md)
- [Backend AI Context](../ai/backend.md)
- [API Reference](../api/api-reference.md)
- [Fall Detection System](../features/fall-detection.md)
