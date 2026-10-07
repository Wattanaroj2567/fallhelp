# Elder Profile

[English](elder-profile.md) · [ภาษาไทย](elder-profile.th.md)

## Doc Meta

- **Audience**: Dev / QA / Stakeholder / Researcher
- **Source of Truth**: `apps/mobile/app/(features)/(elder)/`, `apps/mobile/app/(setup)/step1-elder-info.tsx`
- **Status**: **Active** — implemented feature in real use
- Last Updated: May 10, 2026

## Overview

Functions for managing elder information in the FallHelp system. The system uses a **1 caregiver : 1 elder** model — one user can have one elder in their care. Elder information is added only once during the initial setup (Setup Flow); after that the user can view and edit it.

## Users

- **Caregiver (family member)** — adds, views, and edits elder information

## Features

### 1. Creating the Elder Record for the First Time

**Purpose:**

- Happens only once in the Setup Flow after registration
- Requires the user to fill in basic information before continuing
- Validates the data before saving

### 2. Managing Elder Information

**Capabilities:**

- **View information** — shows all information on a single screen
- **Edit information** — edit every field except the ID
- **Refresh information** — fetch the latest data from the Backend
- **Validation** — validation before saving

### 3. Address Management

**Special capabilities:**

- **Thai Address Autocomplete** — type a subdistrict/district/province and pick from the list
- **Standard address format** — subdistrict, district, province, postal code
- **Year conversion** — supports both the Gregorian (CE) and Buddhist (BE) calendars with automatic conversion

## Related Screens

### Initial Setup Screen: Enter Elder Information (Setup Step 1)

**File:** `(setup)/step1-elder-info.tsx`
**What the user sees:**

- A form for the elder's basic information
- A "ถัดไป" (Next) button to go to the device pairing step
  **What the user can do:**
- Fill in basic information and continue to the next step

### Elder Information Screen (Elder Info)

**File:** `(features)/(elder)/elder-info.tsx`
**What the user sees:**

- First and last name
- Gender (male / female / other)
- Date of birth (shown in the Buddhist calendar, BE) with automatically calculated age
- Height (cm) and weight (kg)
- Medical conditions (shown as a comma-separated list)
- Address (house number shown as-is, followed by village number (moo) / village / subdistrict / district / province / postal code)
  **What the user can do:**
- Pull down to refresh the data (Pull-to-Refresh)
- Tap the "แก้ไขข้อมูล" (Edit information) button to open the edit screen

### Edit Elder Information Screen (Edit Elder)

**File:** `(features)/(elder)/edit.tsx`
**What the user sees:**

- A form to edit every field
- Thai Address Autocomplete for the address
- "บันทึก" (Save) and "ยกเลิก" (Cancel) buttons
  **What the user can do:**
- Edit every field and save the data
- Use Auto-complete for the address

## Business Rules

| Topic             | Details                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Required fields   | First name, last name, gender, date of birth, height, weight, house number, village number (moo), address |
| Optional fields   | Medical conditions                                                                              |
| Warning           | Shows a warning when there are unsaved changes                                                  |
| Year conversion   | Supports both CE and BE with automatic conversion                                               |
| Validation        | Data validation before saving                                                                   |
| Age display       | Calculated automatically from the date of birth                                                 |

## Related Docs

- [dashboard.md](dashboard.md) — dashboard screen that shows elder information
- [emergency-contact.md](emergency-contact.md) — the elder's emergency contacts
- [event-history.md](event-history.md) — the elder's event history

---

**Note:** This document describes a feature that has been implemented and is in real use in the FallHelp system.
