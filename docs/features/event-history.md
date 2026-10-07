# Event History & Monthly Report

[English](event-history.md) · [ภาษาไทย](event-history.th.md)

## Doc Meta

- **Audience**: Dev / QA / Stakeholder / Researchers
- **Source of Truth**: `apps/mobile/app/(tabs)/history.tsx`, `apps/mobile/app/(features)/(report)/report-summary.tsx`
- **Status**: **Active** — feature implemented and in real use
- Last Updated: May 21, 2026

## Overview

Caregivers can view the past history of fall events and loss-of-balance events (the wearer cancelled in time), and view a monthly statistics summary report. Data updates in real time via Socket.io when a new event arrives.

## Users

- **Caregiver (family member)** — views event history and the summary report

## Features

### 1. Viewing Event History

**Displayed data:**

- List of events sorted from newest to oldest, including both CONFIRMED and CANCELLED
- Each item shows:
  - Icon and color by type:
    - 🔴 **Actual fall** (CONFIRMED) — warning icon on a red background, label "ตรวจพบเหตุหกล้ม" (Fall detected)
    - 🟡 **Loss of balance** (CANCELLED) — elderly icon on a yellow background, label "เสียการทรงตัว" (Loss of balance) + badge "กดยกเลิกทันเวลา" (Cancelled in time)
  - BPM value at the time of the event (CONFIRMED only — CANCELLED shows the text "ผู้สวมใส่กดยกเลิกการแจ้งเตือนทันเวลา" (The wearer cancelled the alert in time) instead)
  - Date and time (shown in the Buddhist Era, B.E.)

**Functions:**

- Item count filter: 25 / 50 / All
- Shortcut button "ดูรายงานสรุป" (View summary report) → goes to the Monthly Report screen
- Pull-to-Refresh data refresh
- Real-time updates when a new Event arrives

### 2. Viewing the Monthly Report

**Displayed data:**

- Month/year selector (swipe left-right or pick from the Picker), up to 12 months back
- **Most frequent incident time card** — shows the Peak Hour (e.g. 08:00 - 09:00)
- **Fall events card** — number of falls in that month (`fallCount`)
- **Loss of balance card** — number of times the sensor triggered and the wearer cancelled in time (`cancelledCount`); no BPM breakdown because the frequency count is the key metric
- **Heart rate at fall time card** — split into 3 boxes (CONFIRMED only):
  - High heart rate (> 100 BPM) — number of falls with a high heart rate (`heartRateAtFallHigh`)
  - Normal heart rate (60–100 BPM) — number of falls with a normal heart rate (`heartRateAtFallNormal`)
  - Low heart rate (< 60 BPM) — number of falls with a low heart rate (`heartRateAtFallLow`)
  - No heart rate data — cases where there was no HR cache at fall time (`heartRateAtFallUnknown`)

**Functions:**

- Swipe months left/right
- Pick a month from the Month Picker Modal
- Future months cannot be viewed (the right button is disabled once the current month is reached)
- Auto-refresh every 60 seconds for the current month's data

## Related Screens

### History Tab

**File:** `(tabs)/history.tsx`
**What the user sees:**

- List of events sorted from newest to oldest
- Item count filter: 25 / 50 / All
- Shortcut button "ดูรายงานสรุป" (View summary report)
  **What the user can do:**
- Pull down to refresh data (Pull-to-Refresh)
- Change the number of items displayed (25 / 50 / All)
- Tap the "ดูรายงานสรุป" (View summary report) button to open the monthly report screen

### Monthly Report Summary

**File:** `(features)/(report)/report-summary.tsx`
**What the user sees:**

- Month/year selector (swipe left-right or pick from the Picker)
- Most frequent incident time card (Peak Hour)
- Fall events card
- Heart rate at fall time card (High / Normal / Low / No data)
  **What the user can do:**
- Swipe months left/right
- Pick a month from the Month Picker Modal
- Future months cannot be viewed

## Business Rules

| Topic                  | Details                                                       |
| ----------------------- | ---------------------------------------------------------------- |
| Event types shown in History | `CONFIRMED` (actual fall) and `CANCELLED` (loss of balance) — clearly distinct visuals |
| Hide PENDING_CONFIRMATION events | Hide events that are not yet resolved; they are not part of the history |
| BPM in History | CONFIRMED only — shows BPM if a value exists, otherwise shows "ไม่มีข้อมูลชีพจร" (No heart rate data); CANCELLED shows the text "ผู้สวมใส่กดยกเลิกการแจ้งเตือนทันเวลา" (The wearer cancelled the alert in time) instead |
| BPM in Report | CONFIRMED only — CANCELLED shows only the count, no breakdown |
| cancelledCount in Report | Counted from `getMonthlySummary` — metric for near-fall frequency per month |
| Real-time updates  | Updates immediately when a new Event arrives                                    |
| Peak Hour time range      | Shows the time range with the most incidents                                |
| Month limit           | Future months cannot be viewed                                       |
| Refresh               | Auto-refresh every 60 seconds for the current month                    |

## Related Docs

- [dashboard.md](dashboard.md) — Dashboard screen showing real-time status
- [elder-profile.md](elder-profile.md) — Elder information
- [emergency-contact.md](emergency-contact.md) — Emergency contacts

---

**Note:** This document describes a feature that is implemented and in real use in the FallHelp system.
