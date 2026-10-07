# FallHelp API Reference

[English](api-reference.md) · [ภาษาไทย](api-reference.th.md)

## Doc Meta

- **Audience**: Backend/Mobile/Admin Dev, QA
- **Source of Truth**: [routes/](../../apps/backend-api/src/routes)
- **Status**: Active
- Last Updated: June 3, 2026

---

> This document collects all **API Endpoints**, **Request/Response** formats, and **Real-time Events** of the FallHelp system.

## Table of Contents

1. [Authentication](#1-authentication---apiauth)
2. [Users - `/api/users`](#2-users---apiusers)
3. [Elders - `/api/elders`](#3-elders---apielders)
4. [Devices - `/api/devices`](#4-devices---apidevices)
5. [Device Pairings - `/api/device-pairings`](#5-device-pairings---apidevice-pairings)
6. [Events - `/api/events`](#6-events---apievents)
7. [Emergency Contacts - `/api/elders/:elderId/emergency-contacts`](#7-emergency-contacts---apielderselderidemergency-contacts)
8. [Notifications - `/api/notifications`](#8-notifications---apinotifications)
9. [Admin - `/api/admin`](#9-admin---apiadmin)
10. [Health Check - `/internal/health`](#10-health-check---internalhealth)
11. [Real-time Communication](#11-real-time-communication)
12. [Database Schema](#12-database-schema)
13. [Security](#13-security)
14. [Error Responses](#14-error-responses)

---

---

## Overview

| Item               | Value                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| **Base URL**       | `http://localhost:3000`                                                   |
| **Auth Model**     | JWT Bearer Token                                                          |
| **Primary Actors** | `CAREGIVER`, `ADMIN`                                                      |
| **Event Storage**  | `events` uses PostgreSQL with a single PK (`id`) and a time index (`timestamp`) |

---

## 1. Authentication - `/api/auth`

### 1.1 Register a New User

| Item         | Value                 |
| ------------ | -------------------- |
| **Method**   | `POST`               |
| **Endpoint** | `/api/auth/register` |
| **Auth**     | None                 |

**Request Body:**

```json
{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "gender": "MALE",
  "phone": "0812345678",
  "email": "somchai@example.com",
  "password": "Password123!"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "somchai@example.com",
      "firstName": "สมชาย",
      "lastName": "ใจดี",
      "phone": "0812345678",
      "gender": "MALE",
      "role": "CAREGIVER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.2 Log In

| Item         | Value              |
| ------------ | ----------------- |
| **Method**   | `POST`            |
| **Endpoint** | `/api/auth/login` |
| **Auth**     | None              |

**Request Body:**

```json
{
  "identifier": "somchai@example.com",
  "password": "Password123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "somchai@example.com",
      "firstName": "สมชาย",
      "lastName": "ใจดี",
      "phone": "0812345678",
      "role": "CAREGIVER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.3 Admin Login

| Item         | Value                    |
| ------------ | ----------------------- |
| **Method**   | `POST`                  |
| **Endpoint** | `/api/auth/admin-login` |
| **Auth**     | None                    |

**Request Body:**

```json
{
  "email": "admin@fallhelp.com",
  "password": "Password123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@fallhelp.com",
      "firstName": "ผู้ดูแล",
      "lastName": "ระบบ",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (403):** `role_not_allowed` when the signed-in account is not `ADMIN`

---

### 1.4 Request an OTP (Forgot Password)

| Item         | Value                    |
| ------------ | ----------------------- |
| **Method**   | `POST`                  |
| **Endpoint** | `/api/auth/request-otp` |
| **Auth**     | None                    |

**Request Body:**

```json
{
  "email": "somchai@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "OTP sent to somchai@example.com",
    "referenceCode": "XPQL",
    "expiresInMinutes": 5
  }
}
```

**Error (500):** `email_send_failed` when the backend fails to send the OTP via Resend

---

### 1.5 Verify OTP

| Item         | Value                   |
| ------------ | ---------------------- |
| **Method**   | `POST`                 |
| **Endpoint** | `/api/auth/verify-otp` |
| **Auth**     | None                   |

**Request Body:**

```json
{
  "email": "somchai@example.com",
  "code": "123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "OTP verified successfully"
  }
}
```

---

### 1.6 Reset Password

| Item         | Value                       |
| ------------ | -------------------------- |
| **Method**   | `POST`                     |
| **Endpoint** | `/api/auth/reset-password` |
| **Auth**     | None                       |

**Request Body:**

```json
{
  "email": "somchai@example.com",
  "code": "123456",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

### 1.7 Get Current User (Canonical Route)

| Item         | Value            |
| ------------ | --------------- |
| **Method**   | `GET`           |
| **Endpoint** | `/api/users/me` |
| **Auth**     | Bearer Token    |

> This route has moved out of `auth` to the `users/me` resource, but it is still listed under auth so the session-related flow is shown in full.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "somchai@example.com",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678",
    "gender": "MALE",
    "profileImage": "https://...",
    "role": "CAREGIVER"
  }
}
```

---

### 1.8 Log Out

| Item         | Value               |
| ------------ | ------------------ |
| **Method**   | `POST`             |
| **Endpoint** | `/api/auth/logout` |
| **Auth**     | Bearer Token       |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

> Clears the push token from the DB to stop sending Expo Push Notifications to that device.

---

## 2. Users - `/api/users`

### 2.1 Get Current User Profile

| Item         | Value            |
| ------------ | --------------- |
| **Method**   | `GET`           |
| **Endpoint** | `/api/users/me` |
| **Auth**     | Bearer Token    |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "somchai@example.com",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678",
    "gender": "MALE",
    "profileImage": "https://..."
  }
}
```

---

### 2.2 Update Current User Profile

| Item         | Value            |
| ------------ | --------------- |
| **Method**   | `PATCH`         |
| **Endpoint** | `/api/users/me` |
| **Auth**     | Bearer Token    |

**Request Body:**

```json
{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "phone": "0812345678",
  "email": "somchai@example.com",
  "gender": "MALE",
  "profileImage": "https://example.com/uploads/profiles/abc.webp"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "somchai@example.com",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678",
    "gender": "MALE",
    "profileImage": "https://example.com/uploads/profiles/abc.webp"
  }
}
```

---

### 2.3 Change Password

| Item         | Value                     |
| ------------ | ------------------------ |
| **Method**   | `PUT`                    |
| **Endpoint** | `/api/users/me/password` |
| **Auth**     | Bearer Token             |

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

### 2.4 Update Push Token

| Item         | Value                       |
| ------------ | -------------------------- |
| **Method**   | `PUT`                      |
| **Endpoint** | `/api/users/me/push-token` |
| **Auth**     | Bearer Token               |

**Request Body:**

```json
{
  "pushToken": "ExponentPushToken[xxxx]"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Push token updated successfully"
  }
}
```

---

## 3. Elders - `/api/elders`

### 3.1 Create an Elder

| Item         | Value          |
| ------------ | ------------- |
| **Method**   | `POST`        |
| **Endpoint** | `/api/elders` |
| **Auth**     | Bearer Token  |

> `dateOfBirth` uses the `YYYY-MM-DD` format, and the API responds in the same format.

**Request Body:**

```json
{
  "firstName": "สมศรี",
  "lastName": "ใจดี",
  "gender": "FEMALE",
  "dateOfBirth": "1958-05-15",
  "height": 155,
  "weight": 50,
  "diseases": "เบาหวาน, ความดันโลหิตสูง",
  "houseNumber": "123",
  "villageNumber": "2",
  "villageName": "สุขุมวิทวิลล์",
  "subdistrict": "คลองตัน",
  "district": "วัฒนา",
  "province": "กรุงเทพมหานคร",
  "zipcode": "10110"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "สร้างผู้สูงอายุใหม่สำเร็จ",
  "data": {
    "id": "uuid",
    "firstName": "สมศรี",
    "lastName": "ใจดี",
    "gender": "FEMALE",
    "dateOfBirth": "1958-05-15",
    "diseases": "เบาหวาน, ความดันโลหิตสูง"
  }
}
```

---

### 3.2 Get Current Elder

| Item         | Value                  |
| ------------ | --------------------- |
| **Method**   | `GET`                 |
| **Endpoint** | `/api/elders/current` |
| **Auth**     | Bearer Token          |

Used with the single-caregiver model to fetch the one elder linked to the current user. If there is no elder yet, it returns `data: null`.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "สมศรี",
    "lastName": "ใจดี",
    "gender": "FEMALE",
    "device": {
      "deviceCode": "AB12CD34",
      "pairingStatus": "PAIRED",
      "onlineStatus": "OFFLINE",
      "isOnline": false,
      "wifiStatus": "CONNECTED"
    }
  }
}
```

---

### 3.3 Get Elder by id

| Item         | Value              |
| ------------ | ----------------- |
| **Method**   | `GET`             |
| **Endpoint** | `/api/elders/:id` |
| **Auth**     | Bearer Token      |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "สมศรี",
    "lastName": "ใจดี",
    "gender": "FEMALE",
    "dateOfBirth": "1958-05-15",
    "height": 155,
    "weight": 50,
    "diseases": "เบาหวาน",
    "houseNumber": "123",
    "villageNumber": "2",
    "villageName": "สุขุมวิทวิลล์",
    "district": "วัฒนา",
    "province": "กรุงเทพมหานคร",
    "device": {
      "deviceCode": "AB12CD34",
      "pairingStatus": "PAIRED",
      "onlineStatus": "ONLINE",
      "wifiStatus": "CONNECTED"
    },
    "emergencyContacts": []
  }
}
```

---

### 3.4 Update Elder

| Item         | Value              |
| ------------ | ----------------- |
| **Method**   | `PUT`             |
| **Endpoint** | `/api/elders/:id` |
| **Auth**     | Bearer Token      |

**Request Body:** Same as 3.1, but you may send only the fields you want to change

**Response (200):**

```json
{
  "success": true,
  "message": "อัปเดตผู้สูงอายุสำเร็จ",
  "data": {
    "id": "uuid",
    "firstName": "สมศรี",
    "lastName": "ใจดี"
  }
}
```

---

## 4. Devices - `/api/devices`

### 4.1 Look Up a Device by Device Code

| Item         | Value                               |
| ------------ | ---------------------------------- |
| **Method**   | `GET`                              |
| **Endpoint** | `/api/devices/by-code/:deviceCode` |
| **Auth**     | Bearer Token                       |

Used to check device details after the user has scanned the QR code. The backend does not return a ready-made QR image.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "device-uuid",
    "deviceCode": "AB12CD34",
    "serialNumber": "ESP32-6C689BDAF380",
    "status": "UNPAIRED"
  }
}
```

---

### 4.2 Configure Device WiFi

| Item         | Value                           |
| ------------ | ------------------------------ |
| **Method**   | `PUT`                          |
| **Endpoint** | `/api/devices/:id/wifi-config` |
| **Auth**     | Bearer Token                   |

**Request Body:**

```json
{
  "ssid": "MyWiFi",
  "wifiPassword": "wifi-password"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "ส่งค่า WiFi ให้อุปกรณ์แล้ว (รอสถานะการเชื่อมต่อ)",
  "data": {
    "config": {
      "deviceId": "device-uuid",
      "wifiStatus": "CONFIGURING"
    },
    "ack": {
      "requestId": "req-001",
      "timestamp": 1742012345678
    }
  }
}
```

---

### 4.3 Get Device WiFi Configuration

| Item         | Value                           |
| ------------ | ------------------------------ |
| **Method**   | `GET`                          |
| **Endpoint** | `/api/devices/:id/wifi-config` |
| **Auth**     | Bearer Token                   |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "deviceId": "device-uuid",
    "wifiStatus": "CONNECTED",
    "updatedAt": "2026-03-15T08:30:00.000Z"
  }
}
```

---

## 5. Device Pairings - `/api/device-pairings`

### 5.1 Pair a Device with an Elder

| Item         | Value                   |
| ------------ | ---------------------- |
| **Method**   | `POST`                 |
| **Endpoint** | `/api/device-pairings` |
| **Auth**     | Bearer Token           |

**Request Body:**

```json
{
  "deviceCode": "AB12CD34",
  "elderId": "elder-uuid"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "จับคู่อุปกรณ์สำเร็จ",
  "data": {
    "id": "uuid",
    "deviceCode": "AB12CD34",
    "serialNumber": "ESP32-6C689BDAF380",
    "elderId": "elder-uuid",
    "status": "PAIRED"
  }
}
```

---

### 5.2 Unpair a Device

| Item         | Value                             |
| ------------ | -------------------------------- |
| **Method**   | `DELETE`                         |
| **Endpoint** | `/api/device-pairings/:deviceId` |
| **Auth**     | Bearer Token                     |

**Response (200):**

```json
{
  "success": true,
  "message": "ยกเลิกการจับคู่สำเร็จ",
  "data": {
    "id": "uuid",
    "status": "UNPAIRED",
    "elderId": null
  }
}
```

---

## 6. Events - `/api/events`

### 6.1 List Events

| Item         | Value                                                                |
| ------------ | ------------------------------------------------------------------- |
| **Method**   | `GET`                                                               |
| **Endpoint** | `/api/events`                                                       |
| **Auth**     | Bearer Token                                                        |
| **Query**    | `?elderId=uuid&startDate=...&endDate=...&page=1&limit=20` |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fallStage": "PENDING_CONFIRMATION",
      "bpm": null,
      "magnitude": 9.95,
      "postureDelta": 45.2,
      "timestamp": "2026-05-10T10:05:00Z",
      "cancelledAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### 6.2 Get Event Details

| Item         | Value              |
| ------------ | ----------------- |
| **Method**   | `GET`             |
| **Endpoint** | `/api/events/:id` |
| **Auth**     | Bearer Token      |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fallStage": "CONFIRMED",
    "bpm": 82,
    "magnitude": 9.95,
    "postureDelta": 45.2,
    "timestamp": "2026-05-10T10:05:00Z",
    "cancelledAt": null,
    "elder": { "...": "..." },
    "device": { "...": "..." }
  }
}
```

---

> ⚠️ **Facts about Cancel vs Acknowledge in the app:**

| Action          | Actor                                 | DB Change                | Result                                                      |
| --------------- | ------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| **Cancel**      | Wearer — presses the GPIO27 button within 15 s | ✅ Sets `cancelledAt` | Actually cancels the event                     |
| **Acknowledge** | Caregiver — taps Acknowledge in the app | ❌ No change          | `setFallStatus('NORMAL')` local state only — no API call   |

> 🔒 **Current rule:** Caregivers can only **Acknowledge in the app** — `fall_cancelled` must come from the MQTT device flow only

---

### 6.3 Monthly Summary

| Item         | Value                               |
| ------------ | ---------------------------------- |
| **Method**   | `GET`                              |
| **Endpoint** | `/api/events/summary/monthly`      |
| **Auth**     | Bearer Token                       |
| **Query**    | `?elderId=uuid&month=12&year=2026` |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 12,
    "fallCount": 3,
    "heartRateAtFallHigh": 1,
    "heartRateAtFallNormal": 1,
    "heartRateAtFallLow": 0,
    "heartRateAtFallUnknown": 1,
    "peakHour": 16
  }
}
```

> **Note:** The `heartRateAtFall*` fields show the BPM distribution for confirmed FALL events only (thresholds: Low < 60, Normal 60–100, High > 100 BPM; Unknown = no HR data)

---

## 7. Emergency Contacts - `/api/elders/:elderId/emergency-contacts`

> **⚠️ API Refactored (May 2026):**
> Endpoints changed from flat routes (`/api/emergency-contacts`) to nested under elders (`/api/elders/:elderId/emergency-contacts`)
> **Reason:** RESTful resource hierarchy — contacts belong to an elder
> **Note:** `elderId` comes from the URL path parameter

### 7.1 Add an Emergency Contact

| Item         | Value                                      |
| ------------ | ----------------------------------------- |
| **Method**   | `POST`                                    |
| **Endpoint** | `/api/elders/:elderId/emergency-contacts` |
| **Auth**     | Bearer Token (Required)                   |

**Request Body:**

```json
{
  "name": "นายสมชาย ใจดี",
  "phone": "0812345678",
  "relationship": "ญาติ"
}
```

**Required:** `name`, `phone`
**Optional:** `relationship` — describes the relationship to the elder, e.g. `ครอบครัว` (family), `ญาติ` (relative), `เพื่อนบ้าน` (neighbor), `ผู้ดูแล` (caregiver), `เพื่อน` (friend), or any term the user enters
**Priority:** Auto-assigned (first contact = 1, increments automatically)

**Response (201):**

```json
{
  "success": true,
  "message": "เพิ่มเบอร์ติดต่อฉุกเฉินสำเร็จ",
  "data": {
    "id": "contact-001",
    "name": "นายสมชาย ใจดี",
    "phone": "0812345678",
    "relationship": "ญาติ",
    "priority": 1
  }
}
```

---

### 7.2 List Emergency Contacts

| Item         | Value                                      |
| ------------ | ----------------------------------------- |
| **Method**   | `GET`                                     |
| **Endpoint** | `/api/elders/:elderId/emergency-contacts` |
| **Auth**     | Bearer Token (Required)                   |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "contact-001",
      "name": "นายสมชาย",
      "phone": "0812345678",
      "relationship": "ญาติ",
      "priority": 1
    },
    {
      "id": "contact-002",
      "name": "นางสมหญิง",
      "phone": "0898765432",
      "relationship": "ผู้ดูแล",
      "priority": 2
    }
  ]
}
```

---

### 7.3 Update an Emergency Contact

| Item         | Value                                                 |
| ------------ | ---------------------------------------------------- |
| **Method**   | `PATCH`                                              |
| **Endpoint** | `/api/elders/:elderId/emergency-contacts/:contactId` |
| **Auth**     | Bearer Token (Required)                              |

**Request Body:**

```json
{
  "name": "นายสมชาย ใจดี",
  "phone": "0811111111",
  "relationship": "เพื่อนบ้าน"
}
```

**Optional:** Any field can be updated (omitted fields stay unchanged)

**Response (200):**

```json
{
  "success": true,
  "message": "อัปเดตเบอร์ติดต่อฉุกเฉินสำเร็จ",
  "data": {
    "id": "contact-001",
    "priority": 1
  }
}
```

---

### 7.4 Delete an Emergency Contact

| Item         | Value                                                 |
| ------------ | ---------------------------------------------------- |
| **Method**   | `DELETE`                                             |
| **Endpoint** | `/api/elders/:elderId/emergency-contacts/:contactId` |
| **Auth**     | Bearer Token (Required)                              |

**Response (200):**

```json
{
  "success": true,
  "message": "ลบเบอร์ติดต่อฉุกเฉินสำเร็จ"
}
```

---

### 7.5 Reorder Emergency Contacts

| Item         | Value                                            |
| ------------ | ----------------------------------------------- |
| **Method**   | `PATCH`                                         |
| **Endpoint** | `/api/elders/:elderId/emergency-contacts/order` |
| **Auth**     | Bearer Token (Required)                         |

**Request Body:**

```json
{
  "contactIds": ["contact-002", "contact-001", "contact-003"]
}
```

**Notes:**

- Priority is assigned sequentially: 1st contact = priority 1, 2nd = 2, etc.
- Minimum 2 contacts required to reorder
- Uses database transaction to prevent race conditions

**Response (200):**

```json
{
  "success": true,
  "message": "จัดลำดับเบอร์ติดต่อฉุกเฉินสำเร็จ"
}
```

---

## 8. Notifications - `/api/notifications`

### 8.1 List Notifications

| Item         | Value                  |
| ------------ | --------------------- |
| **Method**   | `GET`                 |
| **Endpoint** | `/api/notifications`  |
| **Auth**     | Bearer Token          |
| **Query**    | `?page=1&pageSize=20` |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "ตรวจพบการหกล้ม!",
      "message": "นางสมศรี อาจหกล้ม",
      "isRead": false,
      "eventId": "event-uuid",
      "event": {
        "id": "event-uuid",
        "fallStage": "CONFIRMED",
        "timestamp": "2026-05-10T10:05:00Z"
      },
      "createdAt": "2026-05-10T10:05:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 20,
  "totalPages": 2
}
```

> `Notification` references `Event` through a required FK (`eventId -> events.id`)
> The API maps `event` back on every list read, so mobile/admin can always trace back to the source event

---

### 8.2 Get Unread Notification Count

| Item         | Value                              |
| ------------ | --------------------------------- |
| **Method**   | `GET`                             |
| **Endpoint** | `/api/notifications/unread-count` |
| **Auth**     | Bearer Token                      |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### 8.3 Mark as Read

| Item         | Value                     |
| ------------ | ------------------------ |
| **Method**   | `PATCH`                  |
| **Endpoint** | `/api/notifications/:id` |
| **Auth**     | Bearer Token             |

**Request Body:**

```json
{
  "isRead": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Notification updated"
}
```

---

### 8.4 Mark All as Read

| Item         | Value                 |
| ------------ | -------------------- |
| **Method**   | `PATCH`              |
| **Endpoint** | `/api/notifications` |
| **Auth**     | Bearer Token         |

**Request Body:**

```json
{
  "action": "mark_all_read"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 9. Admin - `/api/admin`

> **For system administrators only (Admin Role)**

### 9.1 Register a New Device (Admin)

| Item         | Value                 |
| ------------ | -------------------- |
| **Method**   | `POST`               |
| **Endpoint** | `/api/admin/devices` |
| **Auth**     | Bearer Token (Admin) |

**Request Body:**

```json
{
  "serialNumber": "ESP32-6C689BDAF380"
}
```

`serialNumber` must use the format `ESP32-XXXXXXXXXXXX`, where `X` is 12 hexadecimal digits matching the serial the firmware builds from the ESP32 chip ID

**Response (201):**

```json
{
  "success": true,
  "message": "Device created successfully",
  "data": {
    "id": "device-uuid",
    "deviceCode": "AB12CD34",
    "serialNumber": "ESP32-6C689BDAF380",
    "status": "UNPAIRED"
  }
}
```

---

### 9.2 List All Devices

| Item         | Value                 |
| ------------ | -------------------- |
| **Method**   | `GET`                |
| **Endpoint** | `/api/admin/devices` |
| **Auth**     | Bearer Token (Admin) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "device-uuid",
      "deviceCode": "AB12CD34",
      "serialNumber": "ESP32-6C689BDAF380",
      "status": "PAIRED",
      "onlineStatus": "ONLINE",
      "isOnline": true,
      "lastOnline": "2026-04-10T09:20:00.000Z",
      "elderId": "elder-uuid"
    }
  ]
}
```

---

### 9.3 Delete a Device

| Item         | Value                     |
| ------------ | ------------------------ |
| **Method**   | `DELETE`                 |
| **Endpoint** | `/api/admin/devices/:id` |
| **Auth**     | Bearer Token (Admin)     |

**Response (200):**

```json
{
  "success": true,
  "message": "Device deleted successfully"
}
```

---

### 9.4 Force-Unpair a Device

| Item         | Value                            |
| ------------ | ------------------------------- |
| **Method**   | `POST`                          |
| **Endpoint** | `/api/admin/devices/:id/unpair` |
| **Auth**     | Bearer Token (Admin)            |

**Response (200):**

```json
{
  "success": true,
  "message": "Device unpaired successfully"
}
```

---

## 10. Health Check - `/internal/health`

### 10.1 Check System Status

| Item         | Value               |
| ------------ | ------------------ |
| **Method**   | `GET`              |
| **Endpoint** | `/internal/health` |
| **Auth**     | None               |

**Response (200 / 503):**

```json
{
  "status": "ok",
  "timestamp": "2026-03-15T08:30:00.000Z",
  "uptime": "2h 15m",
  "responseTimeMs": 12,
  "services": {
    "database": "connected",
    "mqtt": "connected"
  },
  "version": "1.0.0"
}
```

---

## 11. Real-time Communication

### 11.1 MQTT Topics (IoT → Backend)

| Topic                 | Description                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `device/+/event`      | Main unified event from the current firmware, e.g. `suspected_fall`, `fall_confirmed`, `fall_cancelled`, `heart_rate_*` |
| `device/+/fall`       | Legacy fall payload compatibility                                                                                 |
| `device/+/heartrate`  | Legacy heart-rate payload compatibility                                                                           |
| `device/+/status`     | Device status / WiFi / heartbeat                                                                                   |
| `device/+/config/ack` | ACK after the device receives a config command                                                                          |
| `device/+/lwt`        | Broker notice that the device disconnected unexpectedly                                                                          |
| `events/+`            | Mock events compatibility for some test flows                                                                    |

---

### 11.2 Socket.io Events (Backend → Mobile)

| Event                  | Description                                                                   | Payload                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `fall_detected`        | Confirmed fall alert (stage 2A / CRITICAL)                            | `{ eventId, elderId, elderName, deviceId, deviceCode, timestamp, accelerationMagnitude, bpm? }`     |
| `event_status_changed` | Internal lifecycle signal for the mobile pending guard, not the main caregiver alert | `{ eventId?, elderId, deviceId, deviceCode, status, timestamp, bpm? }`                              |
| `heart_rate_update`    | Real-time heart rate update                                            | `{ elderId, elderName, deviceId, deviceCode, heartRate, confidence?, timestamp }`                   |
| `device_status_update` | Device online/offline status, sent to the caregiver's elder room              | `{ deviceId, deviceCode, elderId, elderName, online, signalStrength?, wifiSSID?, timestamp, source?, serverTimestamp?, deviceTimestamp? }` |
| `system_message`       | System-wide broadcast message                                                    | `{ message, data?, timestamp }`                                                                     |

`suspected_fall` and `fall_cancelled` still do not create a caregiver alert or Push Notification, but the backend sends `event_status_changed` so mobile can use it as an internal guard while waiting for confirmation/cancellation

---

## 12. Database Schema

| Table            | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| User             | Caregivers and Admins                                            |
| AuthOtp          | OTP codes for forgot password (auto-deleted after expiry)                 |
| Elder            | Elder under care — 1 User ↔ 1 Elder (direct FK, no junction table) |
| Device           | IoT device (ESP32), pairing state, `wifiStatus`, and `lastOnline`       |
| Event            | Fall event with a BPM snapshot taken at the time of the incident (PK: id, indexed by timestamp) |
| Notification     | Notification history from confirmed events — required FK to Event via `eventId` |
| EmergencyContact | Emergency contacts                                                       |

---

## 13. Security

| Feature              | Details                                                                    |
| -------------------- | -------------------------------------------------------------------------- |
| **Authentication**   | JWT (expires in 7 days)                                                    |
| **Password**         | bcrypt hashing                                                             |
| **Rate Limiting**    | API: 100/15 min, Auth: 5/15 min, OTP: 3/10 min                          |
| **Access Control**   | JWT + ownership check + `requireAdmin` per route                           |
| **Input Validation** | custom `validate(ValidationRule[])` factory in `middlewares/validation.ts` |

---

## 14. Error Responses

```json
{
  "error": true,
  "message": "ข้อความแสดงข้อผิดพลาด",
  "statusCode": 400
}
```

| Status Code | Meaning                             |
| :---------: | ----------------------------------- |
|     400     | Bad Request - Invalid data        |
|     401     | Unauthorized - Not logged in      |
|     403     | Forbidden - Access denied         |
|     404     | Not Found - Data not found        |
|     429     | Too Many Requests - Rate limit exceeded |
|     500     | Internal Server Error               |

---

## Related Docs

- [System Design](../architecture/system-design.md)
- [Data Model](../architecture/data-model.md)
- [Backend AI Context](../ai/backend.md)
- [Admin AI Context](../ai/admin.md)
