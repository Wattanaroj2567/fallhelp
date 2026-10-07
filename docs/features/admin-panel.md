# Admin Panel

[English](admin-panel.md) · [ภาษาไทย](admin-panel.th.md)

## Doc Meta

- **Audience**: Dev / QA / Stakeholder / Researchers
- **Source of Truth**: `apps/admin/src/`, `apps/backend-api/src/routes/adminRoutes.ts`
- **Status**: **Active** — feature implemented and in real use
- **Last Updated**: May 21, 2026

## Overview

The Admin Panel is the system for administrators (Admin) to manage the fall detection devices in the system. Access is restricted and there is no public registration.

## Users

- **Administrator (Admin)** — has access to the whole system
- **Developer** — develops and maintains the system

## Features

### 1. Authentication

**Operating rules:**

- No public registration (No public register/reset)
- Admin accounts are created only via the seed script
- Uses JWT auth, storing the token in `sessionStorage`
- If the JWT expires → automatically redirects back to `/login`

### 2. Data Management

**Available functions:**

- **Devices** — create (Register), view the list (List), force unpair (Force Unpair), and delete devices (Delete), with live status checks

### 3. Device Management

**Capabilities:**

- **Register Device** — create a new device in the system with a Serial Number
- **List Devices** — view all devices in the system
- **Device Status** — shows the pairing status with an elder (`UNPAIRED` / `PAIRED` in the DB)
- **Online State** — computes Online/Offline status from `lastOnline` (based on the device's latest heartbeat/event)
- **Unpair Device** — force unpair a device from the admin panel
- **Delete Device** — permanently delete a device that is not paired from the system

## Related Screens

### Login Screen

**File:** `src/pages/Login.tsx`
**What the user sees:**

- Login form (email + password)
- No Register or Forgot Password button
**What the user can do:**
- Enter credentials and log in to use the system

### Devices Management Screen (main screen of the system)

**File:** `src/pages/Devices.tsx`
**What the user sees:**

- Summary metrics: total devices, paired devices, unpaired devices
- Device list table
- Register Device (add a new device), Unpair, and Delete (delete an unpaired device) buttons
- Pairing status (status: ผูกแล้ว (Paired) / ยังไม่ผูก (Unpaired)) and connection status (ออนไลน์ (Online) / ออฟไลน์ (Offline) / รอเชื่อมต่อ WiFi (Waiting for WiFi))
- Button to view/print the QR Code for each device, to give to the user (Caregiver) to scan and pair in the mobile app
**What the user can do:**
- Register a new device with a Serial Number (format `ESP32-XXXXXXXXXXXX`)
- View device details and status
- Force unpair a device, or delete a device
- Print a QR Code label for the device

## Business Rules

| Topic          | Details                                           |
| -------------- | ------------------------------------------------- |
| Admin creation | Only via the seed script                          |
| Admin permissions | Can access every page in the system            |
| Device status  | `UNPAIRED` / `PAIRED` is the pairing state in the system |
| Data deletion  | Must be confirmed via a Modal every time          |
| Logging out    | Auto-logout when the JWT expires                  |

## Related Docs

- [device-pairing.md](device-pairing.md) — device pairing steps and how the device works from the administrator's and general user's perspective

---

**Note:** This document describes the Admin Panel features currently in real use in the FallHelp system.
