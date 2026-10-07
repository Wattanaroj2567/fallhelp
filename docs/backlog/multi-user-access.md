# Multi-User Access

[English](multi-user-access.md) · [ภาษาไทย](multi-user-access.th.md)

## Doc Meta

- **Audience**: Dev / QA / Stakeholder / Researcher
- **Source of Truth**: Not yet developed (Planned Feature)
- **Status**: **Planned** — a feature planned for future development
- Last Updated: May 10, 2026

## Overview

Multi-user access extends the system to support multiple caregivers (Family Members) who can care for the same elder. The system currently uses a **1 caregiver : 1 elder** model, but in practice families often have several members who want to follow the elder's status at the same time.

**Note**: This feature has not been developed yet; it is part of the system's future development plan.

## Current System Constraint

The current schema is a single-caregiver model: `Elder.userId` is required + unique, and there is no join table for family members.
Building this feature requires a schema/API migration first, e.g. a relation for `ElderMember`/permissions, along with simultaneous changes to ownership checks, Socket rooms, Push notification fan-out, and the admin UI.

## Users

- **Primary caregiver (Owner)** — creates the account and invites family members
- **Secondary caregiver (Family Member)** — an invited family member
- **Admin** — manages the system and audits access

## Features

### 1. Family Member Management (for the Owner)

**Capabilities:**

- **Invite members** — send an invite link or code via email/app
- **Assign permissions** — grant the Owner or Viewer role
- **Remove members** — revoke access
- **View history** — review members' access

### 2. Member Access (for Family Members)

**Capabilities:**

- **View dashboard** — follow the elder's status in Real-time
- **Receive alerts** — get a Push Notification when an emergency occurs
- **View history** — see event history and summary reports
- **Restricted permissions** — cannot edit core data

### 3. Permissions and Roles

| Action                      | Owner | Viewer |
| --------------------------- | ----- | ------ |
| View Dashboard              | ✅    | ✅     |
| Receive alerts              | ✅    | ✅     |
| View event history          | ✅    | ✅     |
| Edit elder information      | ✅    | ❌     |
| Manage devices              | ✅    | ❌     |
| Manage emergency contacts   | ✅    | ❌     |
| Invite/remove members       | ✅    | ❌     |
| View summary reports        | ✅    | ✅     |
| Export data                 | ✅    | ❌     |

## Related Screens

### Family Member Management Screen

**File:** `(features)/(profile)/family-members.tsx` (to be created in the future)
**What the user sees:**

- The current member list with roles
- An "Invite new member" button
- A permission management button for each person
  **What the user can do:**
- Invite new members via email or invite code
- Change roles between Owner/Viewer
- Remove members from the team

### Accept Invitation Screen

**File:** `(features)/(profile)/accept-invite.tsx` (to be created in the future)
**What the user sees:**

- Information about the elder they will care for
- The inviter's name and relationship
- "Accept" and "Decline" buttons
  **What the user can do:**
- Accept the invitation to join the team
- Decline the invitation if it is not convenient

## Business Rules

| Topic             | Details                                     |
| ----------------- | ------------------------------------------- |
| Member count      | Up to 10 people per elder                   |
| Owner role        | Only 1 person (the account creator)         |
| Inviting members  | Must be approved by the Owner               |
| Notifications     | Sent to every member with permission        |
| Security          | Identity must be verified before joining    |
| Removal           | The Owner can revoke a member's access      |

---

**Important note:** This document is part of the system's future development plan (Future Roadmap). It has not been implemented yet, but serves as guidance for further development.
