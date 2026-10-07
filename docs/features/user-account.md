# User Account Lifecycle

[English](user-account.md) · [ภาษาไทย](user-account.th.md)

## Doc Meta

- Audience: Backend Dev / Mobile Dev
- Source of Truth: [userService.ts](../../apps/backend-api/src/services/userService.ts)
- Status: Active
- Last Updated: May 21, 2026

---

## Overview

The FallHelp user account system supports **Profile Management** and **Push Token Management**.

---

## Feature Requirements

### Account States

This document set describes only the lifecycle that actually exists in the current runtime:

- An account in normal use (`Active`)
- Logging out (`Logout`), which clears `users.pushToken` on the backend

There is no user deletion / deactivate flow enabled as a feature in the current system.

### Profile Management

**Editable data:**

| Field        | Type   | Validation            |
| :----------- | :----- | :-------------------- |
| firstName    | string | Required              |
| lastName     | string | Required              |
| phone        | string | Optional              |
| email        | string | Unique check          |
| profileImage | string | URL                   |
| gender       | string | MALE / FEMALE / OTHER |

### Change Password

`currentPassword` must be provided to verify identity before changing:

```
PUT /api/users/me/password
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**Validation:**

- The new password must pass the Strong Password Check
- The old password must match the DB

### Push Token Management

The Mobile App updates the Push Token every time the app opens:

```
PUT /api/users/me/push-token
{
  "pushToken": "ExponentPushToken[xxxxx]"
}
```

- The token is stored in `users.pushToken`
- Used for Expo Push Notification

### User's Elder

Fetches the current user's single Elder through the elder domain; mobile calls:

```
GET /api/elders/current
```

**The elder response includes:**

- Basic information (name, age, underlying conditions)
- The bound device (`device`)

---

## Technical Implementation

### Scope That Actually Exists

The current API supports only:

- Viewing and editing the profile
- Changing the password
- Updating the Expo push token
- Viewing the elder that belongs to the user

**Important limitations:**

- There is no endpoint to delete a user account yet
- There is no deactivate/reactivate user lifecycle in the runtime yet
- Do not claim a `Deleted` state or user soft-delete unless the flow exists in the code

### Profile Update Contract

- Uses `GET /api/users/me` and `PATCH /api/users/me`
- Editable fields must match the backend validation, e.g. `firstName`, `lastName`, `phone`, `email`, `profileImage`, `gender`

### Password Change Contract

```
PUT /api/users/me/password
{
  "currentPassword": "...",
  "newPassword": "..."
}
```

- `currentPassword` must always be checked first
- `newPassword` must pass the same password policy as the auth flow

### Push Token Contract

```
PUT /api/users/me/push-token
{
  "pushToken": "ExponentPushToken[...]"
}
```

- The token is stored in `users.pushToken`
- Used for caregiver-side Expo push notifications

### Logout Push Cleanup

- Mobile calls `POST /api/auth/logout` before clearing the local JWT
- The backend clears `users.pushToken` to stop sending Expo Push Notifications to the logged-out session

### User's Elder Contract

- Mobile uses `GET /api/elders/current` via `elderService.getCurrentElder()`
- The response is `Elder | null` for the single elder bound to the current caregiver
- The response must reflect the user's actual ownership, not elder data for the whole system

---

## Flows

```
View Profile:    GET /api/users/me
Edit Profile:    PATCH /api/users/me (firstName, lastName, phone, email, profileImage, gender)
Change Password: PUT /api/users/me/password (currentPassword + newPassword)
Push Token:      PUT /api/users/me/push-token (ExponentPushToken)
User's Elder:    GET /api/elders/current → Elder | null
```

---

## API Endpoints

| Method | Endpoint                   | Description            | Auth |
| :----- | :------------------------- | :--------------------- | :--- |
| GET    | `/api/users/me`            | View profile           | ✅   |
| PATCH  | `/api/users/me`            | Edit profile           | ✅   |
| PUT    | `/api/users/me/password`   | Change password        | ✅   |
| GET    | `/api/elders`              | View the user's Elder list | ✅   |
| PUT    | `/api/users/me/push-token` | Update Push Token      | ✅   |

---

## Related Docs

- [Authentication System](auth.md)
- [API Reference](../api/api-reference.md)
- [Mobile AI Context](../ai/mobile.md)
