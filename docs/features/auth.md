# Authentication System

[English](auth.md) · [ภาษาไทย](auth.th.md)

## Doc Meta

- Audience: Backend Dev / Mobile Dev
- Source of Truth: [authService.ts](../../apps/backend-api/src/services/authService.ts), [jwt.ts](../../apps/backend-api/src/utils/jwt.ts), [password.ts](../../apps/backend-api/src/utils/password.ts)
- Status: Active
- Last Updated: June 3, 2026

---

## Overview

FallHelp's authentication system uses **JWT (JSON Web Token)** for session management and **OTP (One-Time Password)** for password resets. It supports 2 user types: **Caregiver** (Mobile App) and **Admin** (Backoffice).

---

## Feature Requirements

### Registration (User Account Registration)

| Field     | Required | Validation                    |
| :-------- | :------- | :---------------------------- |
| email     | ✅       | Unique, Valid format          |
| password  | ✅       | Strong password (min 8 chars) |
| firstName | ✅       | -                             |
| lastName  | ✅       | -                             |
| phone     | ❌       | Optional                      |
| gender    | ❌       | MALE / FEMALE / OTHER         |

### Login

- Look up the User by Email or Phone
- Compare the Password with `bcrypt.compare()`
- Create a JWT Token with the Payload

### Password Reset

**OTP Details:**

- **Format:** 6 digits (e.g., `482931`)
- **Reference Code:** 4 letters (e.g., `XPQL`) — lets the User confirm that the OTP came from our system
- **Expiry:** 5 minutes
- **Single use:** `verify-otp` checks the code before entering the new-password screen, and once `reset-password` succeeds the system deletes that OTP from the DB immediately
- **OTP Purpose:** `PASSWORD_RESET` only

### Admin Access

The Admin system uses a single role: `ADMIN`

- There is no `OWNER` / `OPERATOR`
- A user with `role = ADMIN` can access all admin endpoints
- The JWT does not include `adminRole`

---

## Technical Implementation

### Registration Flow

```
Request → validation → hash password → create user(role=CAREGIVER) → return JWT
```

- Only caregiver registration is supported
- The backend creates a JWT and responds immediately after the user is created successfully

**What happens when a user registers an account:**

- The Password is hashed with `bcrypt` before being stored in the DB
- The User gets the default Role `CAREGIVER`
- The system creates a JWT Token and returns it immediately

### Login Flow

```
Email/Phone + Password → find user → compare hash → return JWT
```

- The user can be looked up by email or phone
- The current JWT payload contains `userId`, `email`, `role`
- The Admin Panel uses a separate endpoint `POST /api/auth/admin-login` so the backend checks `role = ADMIN` before returning a JWT

**JWT Payload:**

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "CAREGIVER"
}
```

### Password Reset Flow

```
request-otp → verify-otp → reset-password
```

- The OTP is used for `PASSWORD_RESET` only
- The OTP is a 6-digit code with a 4-letter reference code
- `verify-otp` checks the code before entering the new-password screen, and once `reset-password` succeeds the system deletes that OTP from the DB immediately
- The scheduler in `apps/backend-api/src/schedulers/otpScheduler.ts` periodically deletes expired OTPs
- If Resend fails to send the email, the backend returns the error `email_send_failed` instead of a success response, so the client knows the code was not actually sent

### Logout Flow

- Uses `POST /api/auth/logout`
- Mobile calls this endpoint before clearing the local JWT so the backend can still authenticate the request
- The backend sets `users.pushToken = null` to stop Expo Push Notifications to the logged-out session
- If the backend is unreachable, mobile must still clear the local session on a best-effort basis so the user is not stuck in the old session

---

## Flows

### Authentication Flow Diagram

```
Registration: User fills in data → Validate Email/Password → Hash Password → Create User → Return JWT
Login:        User sends Email/Phone + Password → Find User → Compare Password → Return JWT
Reset:        request-otp → [OTP via email] → verify-otp → reset-password → delete OTP
```

---

## Security Notes

| Measure / Concern | Details                                              |
| :---------------- | :--------------------------------------------------- |
| Password Hashing  | `bcrypt` (auto-salt) with salt                       |
| Password Strength | Minimum 8 characters, checked by the backend helper  |
| JWT Expiry        | Set in config (default: 7 days)                      |
| JWT scope         | Carries a single role (`ADMIN` or `CAREGIVER`)       |
| OTP expiry        | Short-lived 5 minutes and single use                 |
| OTP Cleanup       | Cron Job periodically deletes expired OTPs           |
| Admin access      | No `OWNER` / `OPERATOR`; a single `ADMIN` role       |

---

## API Endpoints

| Method | Endpoint                   | Description                         | Auth |
| :----- | :------------------------- | :---------------------------------- | :--- |
| POST   | `/api/auth/register`       | Create a caregiver account          | ❌   |
| POST   | `/api/auth/login`          | Get a JWT session                   | ❌   |
| POST   | `/api/auth/admin-login`    | Get a JWT session for Admin         | ❌   |
| GET    | `/api/users/me`            | Read the current profile            | ✅   |
| POST   | `/api/auth/request-otp`    | Request an OTP for reset            | ❌   |
| POST   | `/api/auth/verify-otp`     | Verify the OTP before reset         | ❌   |
| POST   | `/api/auth/reset-password` | Change the password via OTP         | ❌   |
| POST   | `/api/auth/logout`         | Log out and clear the pushToken     | ✅   |

---

## Related Docs

- [API Reference](../api/api-reference.md)
- [Backend AI Context](../ai/backend.md)
- [Mobile AI Context](../ai/mobile.md)
- [User Account Lifecycle](user-account.md)
