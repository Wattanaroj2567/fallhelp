# System Design & Architecture

This document consolidates the technical design details for key system components: Database, Mobile App, and Admin Panel.

---

## 1. Database Architecture (TimescaleDB)

We use TimescaleDB to store and analyze time-series data from IoT devices (Fall Detection & Heart Rate).

### 1.1 Setup & Reset

We have a "one-shot" command to reset the database, apply Prisma migrations, and configure TimescaleDB extensions/hypertables.

**Command:**

```bash
npm run db:reset --prefix backend
```

**What it does:**

1.  **Wipes Database**: Drops the schema and all data.
2.  **Prisma Migrations**: Re-applies all migrations from `prisma/migrations`.
3.  **Timescale Setup**: Runs `scripts/run-timescale-setup.ts` which executes `prisma/timescale-setup.sql`.

### 1.2 Verification

To ensure the database is correctly configured, use the verification script.

**Command:**

```bash
npm run db:verify --prefix backend
```

**Checks Performed:**

- **Extension**: Confirms `timescaledb` is installed.
- **Hypertable**: Checks if `events` is a valid hypertable.
- **Continuous Aggregates**: Verifies `events_daily_stats` view existence.
- **Jobs/Policies**: Lists active background jobs (Compression, Refresh).

---

## 2. Mobile App Architecture

### 2.1 Centralized Error Handling

To ensure robustness and ease of debugging, the mobile app implements a centralized error handling strategy.

#### Components:

1.  **Logger Utility** (`mobile/utils/logger.ts`):

    - Wraps `console` methods with timestamps and log levels (DEBUG, INFO, WARN, ERROR).
    - Usage: `Logger.info('Message', data)`

2.  **API Interceptor** (`mobile/services/api.ts`):

    - Automatically catches all API errors.
    - Logs failed requests (Method, URL) and error details.
    - Rejects promises with standardized `ApiError` objects.

3.  **Global Error Boundary** (`mobile/components/ErrorBoundary.tsx`):

    - Catches unhandled JavaScript errors in the component tree (UI crashes).
    - Displays a user-friendly "Something went wrong" fallback UI.
    - Logs the crash stack trace.

4.  **Integration**:
    - Root Layout (`mobile/app/_layout.tsx`) wraps the app with `<CustomErrorBoundary>`.

---

## 3. Admin Panel Architecture

### 3.1 Centralized Error Handling

The Admin Panel mirrors the Mobile App's error handling strategy for consistency.

#### Components:

1.  **Logger Utility** (`admin/src/utils/logger.ts`):

    - Centralized logging with timestamps and levels.
    - Only logs DEBUG level in development mode.

2.  **API Interceptor** (`admin/src/services/api.ts`):

    - Logs API errors automatically.
    - **Auto-Redirect**: Handles `401 Unauthorized` errors by clearing the token and redirecting to `/login`.

3.  **Global Error Boundary** (`admin/src/components/ErrorBoundary.tsx`):

    - Catches UI crashes (White Screen of Death).
    - Displays a fallback UI with a "Reload" button.
    - Shows expandable error details in Development mode.

4.  **Integration**:
    - Root Entry (`admin/src/App.tsx`) wraps the app with `<ErrorBoundary>`.

---

## 4. Notification System Architecture

### 4.1 Overview

The Notification System is designed to provide real-time alerts and a persistent history of events for caregivers. It bridges the IoT events (Fall, Heart Rate) with user engagement via Push Notifications and an in-app History view.

### 4.2 Components

#### **Backend**

1.  **Notification Controller** (`backend/src/controllers/notificationController.ts`):

    - Manages CRUD operations for notifications.
    - Handles "Mark as Read" and "Clear All" logic.
    - Provides unread counts for badges.

2.  **Notification Routes** (`backend/src/routes/notificationRoutes.ts`):

    - `GET /api/notifications`: List paginated notifications.
    - `GET /api/notifications/unread-count`: Get unread badge count.
    - `PATCH /api/notifications/:id/read`: Mark specific item as read.
    - `PATCH /api/notifications/read-all`: Mark all as read.
    - `DELETE /api/notifications`: Clear all notifications.

3.  **Prisma Model**:
    - `Notification` model links to `User` and optional `Event`.
    - Tracks `isRead`, `readAt`, and `pushToken` status.

#### **Mobile App**

1.  **Notification Service** (`mobile/services/notificationService.ts`):

    - Client-side wrapper for API endpoints.
    - Handles Expo Push Token registration.

2.  **Notification Screen** (`mobile/app/(home-features)/notifications.tsx`):

    - Displays history list with pull-to-refresh.
    - Supports "Tap to Read" and "Swipe to Delete" (future).
    - "Mark All as Read" and "Clear All" actions.

3.  **Unread Badge**:
    - Integrated into the Home Screen (`(tabs)/index.tsx`) bell icon.
    - Polls `getUnreadCount` every 30 seconds.
