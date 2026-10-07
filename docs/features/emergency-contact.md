# Emergency Contact System

[English](emergency-contact.md) · [ภาษาไทย](emergency-contact.th.md)

## Doc Meta

- **Audience**: Dev / QA / Stakeholder / Researcher
- **Source of Truth**: `apps/mobile/app/(features)/(emergency)/`, `apps/backend-api/src/services/emergencyContactService.ts`
- **Status**: **Active** — implemented feature in real use
- Last Updated: May 10, 2026

## Overview

The emergency contact system stores the list of people who should be contacted when an emergency happens to the elder (e.g. a fall or an abnormal pulse). It includes a **Priority** system to rank the importance of each contact.

## Users

- **Caregiver (family member)** — manages the emergency contact list

## Features

### 1. Contact List Management (CRUD Operations)

**Capabilities:**

- **Add a new contact** — the system calculates the Priority automatically (after the last position)
- **View all contacts** — sorted by Priority in ascending order (1 = most important)
- **Edit a contact** — edit the name, phone number, relationship, or Priority
- **Delete a contact** — remove the contact from the list
- **Relationship to the elder** — uses shared options such as family, relative, neighbour, caregiver, friend, and allows free text when "อื่น ๆ" (Other) is selected

### 2. Reordering

**How it works:**

- The user can drag to reorder emergency contacts
- The system uses a **Transaction** to prevent Unique Constraint Violations:
  - Step 1: Shift every priority += 1000 (avoid unique conflicts)
  - Step 2: Set the new priorities in the order received (1, 2, 3, ...)

### 3. Cascade Management

**Rules:**

- When an Elder is deleted → all of their emergency contacts are deleted automatically (`onDelete: Cascade`)
- Prevents orphaned or inconsistent data after deletion

### 4. Access Control

**Policy:**

- Single-Caregiver system — only the Elder's owner (from `elder.userId`) can access any of the APIs
- Other users receive 403 Forbidden
- Permissions are checked before every operation

## Related Screens

### Emergency Contacts Screen

**File:** `(features)/(emergency)/contacts.tsx`
**What the user sees:**

- The list of emergency contacts sorted by priority
- A "เพิ่มผู้ติดต่อใหม่" (Add new contact) button
- "แก้ไข" (Edit) and "ลบ" (Delete) buttons for each item
  **What the user can do:**
- Tap the add-new-contact button to open the add screen
- Drag to reorder items
- Tap edit or delete on each contact

### Add/Edit Contact Screen

**File:** `(features)/(emergency)/add.tsx`, `(features)/(emergency)/edit.tsx`
**What the user sees:**

- A contact information form (name, phone number, relationship to the elder)
- A Priority field (shows the current value, or the next value automatically)
- "บันทึก" (Save) and "ยกเลิก" (Cancel) buttons
  **What the user can do:**
- Fill in the information and save a new contact
- Edit an existing contact's information
- Cancel the operation

## Business Rules

| Topic          | Details                                            |
| -------------- | -------------------------------------------------- |
| Priority       | 1 = most important, 2 = next, ...                  |
| Reordering     | Uses Drag & Drop                                   |
| Validation     | Phone number format is checked before saving       |
| Deletion       | Must be confirmed before deleting                  |
| Relationship   | Shown for clarity (e.g. child, grandchild)         |

## Related Docs

- [dashboard.md](dashboard.md) — dashboard screen that shows alerts
- [elder-profile.md](elder-profile.md) — related elder information
- [event-history.md](event-history.md) — event history that may notify contacts
- [../api/api-reference.md](../api/api-reference.md) — APIs for the Emergency Contact system

---

**Note:** This document describes a feature that has been implemented and is in real use in the FallHelp system.
