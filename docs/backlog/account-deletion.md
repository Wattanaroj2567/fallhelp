# Account Deletion

[English](account-deletion.md) · [ภาษาไทย](account-deletion.th.md)

## Doc Meta

- **Audience**: Dev / QA / Stakeholder / Researcher
- **Source of Truth**: Not yet developed (Planned Feature)
- **Status**: **Planned** — a feature planned for future development
- Last Updated: May 31, 2026

## Overview

Account deletion is a necessary feature for protecting users' personal data. It lets users delete their own personal data and account from within the application, in line with modern personal data protection principles.

**Note**: This feature has not been developed yet; it is part of the system's future development plan.

## Current System Constraint

The current system has no `deletedAt` or soft-delete lifecycle in the `User`/`Elder` schema,
and the main relations use cascade delete (`User -> Elder -> Event/Notification`) as the baseline behavior.
This feature therefore has to start with a separate migration/retention design before implementation.

## Users

- **Caregiver (family member)** — wants to delete their account and personal data
- **Admin** — reviews and manages data deletion

## Features

### 1. Soft Delete Account Deletion

**Process flow:**

1. The user goes to **Settings** → taps the "Delete Account" button
2. A **warning message** explains what will happen
3. The user confirms with their **current password** (prevents accidental deletion)
4. The system performs a **Soft Delete** (schema support must be added first):
   - Sets the `deletedAt` timestamp
   - Revokes the active JWT Token
   - Clears the Push Token (stops notifications)
5. **30-day Grace Period** — the user can restore the account by contacting an Admin
6. After 30 days → **Hard Delete** removes the data permanently

### 2. Handling Deleted Data

| Data type                            | Handling method          | Note                                      |
| ------------------------------------ | ------------------------ | ----------------------------------------- |
| User data (name, email, phone)       | Permanent (Hard Delete)  | Cannot be restored                        |
| Elder data                           | Permanent (Cascade)      | Deletes all related data                  |
| Emergency contacts                   | Permanent (Cascade)      | Deletes all related data                  |
| Event history                        | Anonymize                | Keeps statistics, removes identifying data |
| Device pairing                       | Unpair the device        | Returns to UNPAIRED status                |
| Push Token                           | Deleted immediately      | Stops notifications immediately           |

## Related Screens

### Profile Screen

**File:** `(features)/(profile)/profile-info.tsx`
**What the user sees:**

- A "Delete Account" button in the high-security section
- A red warning message when the button is tapped
  **What the user can do:**
- Tap the button to start the account deletion process

### Account Deletion Confirmation Screen

**File:** `(features)/(profile)/delete-account.tsx` (to be created in the future)
**What the user sees:**

- A detailed warning about the data that will be deleted
- A password field
- Confirm and cancel buttons
  **What the user can do:**
- Enter their password to verify identity
- Tap confirm to proceed with account deletion

## Business Rules

| Topic                 | Details                                                  |
| --------------------- | -------------------------------------------------------- |
| Grace Period          | 30 days from the date the account is deleted             |
| Account recovery      | Must contact an Admin directly                           |
| Data deletion         | Soft Delete first, then Hard Delete                      |
| Notification          | Sends an account deletion confirmation email             |
| Retained data         | Event history is Anonymized for analysis                 |

---

**Important note:** This document is part of the system's future development plan (Future Roadmap). It has not been implemented yet, but serves as guidance for further development.
