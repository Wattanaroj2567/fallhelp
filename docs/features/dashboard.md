# Dashboard

[English](dashboard.md) · [ภาษาไทย](dashboard.th.md)

## Doc Meta

- **Audience**: Dev / QA / Stakeholder / Researcher
- **Source of Truth**: `apps/mobile/app/(tabs)/dashboard.tsx`
- **Status**: **Active** — implemented feature in real use
- Last Updated: May 31, 2026

## Overview

The main screen caregivers open every day. It shows the elder's status in real time — device status (Online/Offline), fall status, and pulse — together with a shortcut emergency call button. Data is updated in real time via Socket.io, with an API fetch as a fallback when no signal has been received yet.

## Users

- **Caregiver (family member)** — monitors status and responds to emergencies

## Features

### 1. Real-time Status Display

**Data updated in real time:**

- **Device status** — Online (green) / Offline (red) / Connecting (yellow)
- **Fall status** — Normal / Checking / Fall detected / Previous event
- **Heart rate** — real-time BPM value with abnormal-value alerts

### 2. User Actions

**Buttons and actions:**

- **Elder card** — tap to view more information
- **Device card** — tap to view device details
- **"รับทราบแล้ว" (Acknowledged) button** — acknowledges the event and returns the screen to normal (UI only)
- **Emergency call button** — opens the emergency call screen immediately
- **Notification bell icon** — opens the Notification Modal

## Related Screens

### Main Dashboard (Home Tab)

**File:** `(tabs)/dashboard.tsx`
**What the user sees:**

- **Header** — user profile picture + user name + notification bell icon (Badge with unread count)
- **Elder card** — name, age, gender, with a shortcut to view more information
- **Device status card** — Online/Offline/Connecting, with the device name
- **Fall status card** — Normal/Checking/Fall detected/Previous event
- **Heart rate card** — real-time BPM value with an abnormal-value Badge
- **Emergency call button** — floating button at the bottom
  **What the user can do:**
- Tap the elder card → go to Elder Profile
- Tap the device card → go to Device Details
- Tap the bell icon → open the Notification Modal
- Tap the "รับทราบแล้ว" (Acknowledged) button → acknowledge the event and return the screen to normal (UI only)
- Tap the emergency call button → go to Emergency Call

## Business Rules

| Topic                 | Details                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Normal HR             | 60–100 BPM                                                                                                           |
| Abnormally high HR    | > 100 BPM (Tachycardia)                                                                                              |
| Abnormally low HR     | < 60 BPM (Bradycardia)                                                                                               |
| HR expiry             | No new data for more than 60 seconds → show "--"                                                                     |
| Fall status expiry    | No new data for more than 10 minutes → treated as stale                                                              |
| Device online status  | Computed from `lastOnline` and the realtime signal (backend threshold 15 seconds)                                    |
| Signal Grace Period   | At startup a startup grace of about 8 seconds applies before deciding Offline                                        |
| "รับทราบแล้ว" (Acknowledged) | Changes the UI only — does not modify Event data in the Backend                                               |
| Bell Badge            | Shown from real unread notifications after the backend has created the record; it does not appear early from the realtime card |

## Related Docs

- [elder-profile.md](elder-profile.md) — elder information
- [emergency-contact.md](emergency-contact.md) — emergency call screen
- [event-history.md](event-history.md) — event history

---

**Note:** This document describes a feature that has been implemented and is in real use in the FallHelp system.

---

## UI/UX Guidelines

# FallHelp Mobile UI/UX Specification

## Doc Meta

- Audience: Mobile Dev, PM, QA, reviewers checking screen behavior against implementation
- Source of Truth: `apps/mobile/` screens, shared mobile components, and this screen-level UX specification
- Status: Active
- Last Updated: May 10, 2026

---

## Overview

This document is the owner doc for mobile UX/UI. It is derived from the actual implementation in `apps/mobile/` to explain how each screen should behave, not just how it looks.

The goals of this document are:

- To serve as a shared reference between Dev, PM, and QA when checking whether a screen flow matches its intent
- To summarise the shell, interaction patterns, and state behavior reused across the whole app
- To clearly distinguish the setup flow, auth flow, monitoring flow, and settings/profile flow

---

## 1. Mobile Experience Principles

### 1.1 Core Design Principles

- This is a caregiver app, so it prioritises `fast reading`, `fast response`, and `reducing wrong decisions` over flashiness
- Most screens use a white background, rounded cards, and a calm text hierarchy so Thai text is easy to read
- Critical states such as a fall alert must stand out through color and wording, but must not make the caregiver think they can "cancel the event from the app"
- The setup flow must guide the user one step at a time, reduce branching, and reduce the need to remember context on their own

### 1.2 Terminology the UI Must Preserve

- `Cancel` is reserved for the device side only
- The caregiver app uses `รับทราบแล้ว` (Acknowledged) as the primary term and avoids wording that implies changing the real state of the event
- The fall flow in the UI must reflect 3 main phases:
  - `SUSPECTED`
  - `FALL`
  - `NORMAL` after resolve/cancelled

### 1.3 Layout Direction

- Every main screen uses a base horizontal padding of `24px` via [ScreenWrapper.tsx](../../apps/mobile/components/ScreenWrapper.tsx)
- The app's shared header uses [AppScreenHeader.tsx](../../apps/mobile/components/AppScreenHeader.tsx)
- Onboarding setup uses [WizardLayout.tsx](../../apps/mobile/components/WizardLayout.tsx) so the progress bar, header, and spacing stay consistent across all 3 steps

---

## 2. App Shell & Shared Layout

### 2.1 Screen Wrapper

All main screens in the app sit on [ScreenWrapper.tsx](../../apps/mobile/components/ScreenWrapper.tsx), which defines the following shared behavior:

- Safe area by default
- Main background color is `white`
- Uses `KeyboardAwareScrollView` by default for form screens
- Has 3 modes:
  - `useScrollView=true` for forms or long-content screens
  - `useScrollView=false + keyboardAvoiding=true` for fixed layouts where tapping the background dismisses the keyboard
  - `useScrollView=false + keyboardAvoiding=false` for specialised interaction screens such as lists or fullscreen content

As a result, users feel the screens "belong to the same app" even across different flows.

### 2.2 App Screen Header

The shared header lives in [AppScreenHeader.tsx](../../apps/mobile/components/AppScreenHeader.tsx)

Main behavior:

- Screen title is centered
- Back button is on the left and uses `Bounceable`
- The right slot is open for additional actions
- Has 2 modes:
  - normal: white background + rounded bottom
  - transparent: used with wizard/camera/special backgrounds

Key rules:

- Every screen that is not a tab root should use the same shared header so padding and touch targets do not drift
- Screen titles should be short and fit on 1 line

### 2.3 Wizard Layout

[WizardLayout.tsx](../../apps/mobile/components/WizardLayout.tsx) is the shell dedicated to onboarding setup

It enforces the following to be identical across every step:

- the same header style
- a 3-step progress bar
- the label of each step:
  - `กรอกข้อมูลผู้สูงอายุ` (Enter elder information)
  - `ติดตั้งอุปกรณ์` (Install device)
  - `ตั้งค่าอินเทอร์เน็ต` (Set up internet)
- spacing between header/progress/content

UX intent:

- Reduce the feeling of being "lost"
- Keep the original context visible during back navigation
- Make it clear which steps are done and which step is in progress

---

## 3. Visual Language

### 3.1 Color Roles

Colors used in mobile are not purely abstract design tokens; they have fairly fixed roles derived from the implementation:

| Role                  | Color               | Usage                                                        |
| --------------------- | ------------------- | ------------------------------------------------------------ |
| Primary action        | `#16AD78`           | primary buttons, active state, success emphasis              |
| Critical / fall       | Red family          | fall confirmed, destructive confirmation, emergency emphasis |
| Warning / suspected   | Yellow/Amber family | suspected fall, transitional warning state                   |
| Info / low heart rate | Blue family         | informational monitoring state, low alert                    |
| Neutral surface       | White + Gray scale  | card, text hierarchy, border                                 |

UX rules:

- Green = an action that proceeds or succeeds
- Red = an emergency event or a destructive decision
- Yellow = a state awaiting confirmation or at risk, but not yet a confirmed event
- Purple must not be used as the system's main accent

### 3.2 Typography

The main font is `Kanit` via [KanitText.tsx](../../apps/mobile/components/KanitText.tsx)

Usage principles:

- Use Kanit for all main system text
- Thai must be clearly readable, especially lines with tone marks
- Express importance through size/weight rather than many colors

Hierarchy actually found in the app:

- `text-3xl` to `text-2xl` for important titles and key values
- `text-xl` to `text-lg` for section titles and highlighted information
- `text-base` for normal body text
- `text-sm` and `text-xs` for secondary/helper/meta text

### 3.3 Shape & Spacing

The overall mobile style uses fairly rounded cards:

- main cards: large radius of `24px` to `28px`
- button/input: smaller radius, but still clearly rounded
- standard horizontal whitespace: `24px`
- spacing between blocks is usually `12px`, `16px`, or `24px`

UX effect:

- Gives a soft/safe feel suitable for a health care app
- Helps separate information blocks without many lines

---

## 4. Shared Interaction Patterns

### 4.1 Buttons

Primary buttons in the app use [PrimaryButton.tsx](../../apps/mobile/components/PrimaryButton.tsx)

Behavior users should get consistently:

- disabled/loading state must be clearly visible
- primary buttons are green
- destructive buttons are red
- secondary buttons use an outline or white background

### 4.2 Press Feedback

Many touch targets for important actions use `Bounceable`

UX intent:

- Give immediate feedback on tap
- Reduce overly fast repeated taps
- Make cards/actions on mobile feel responsive without jumping too hard

### 4.3 Dialog vs Toast

The app separates feedback into 2 levels:

- `showDialog(...)`
  - used for validation errors
  - used for confirmations
  - used when the user must "stop and read first"
- `showSuccessToast(...)` / `showErrorToast(...)`
  - used for short tasks that should not interrupt the flow
  - e.g. saved successfully, view reset successfully

Rules:

- If a decision from the user is required, use a dialog
- If it is feedback after an action, a toast is fine

### 4.4 Form Behavior

Forms in mobile follow very similar patterns:

- use `FloatingLabelInput`
- validation happens before firing the mutation
- if data is incomplete or incorrectly formatted, use a dialog that explains it directly
- entered values can persist in some setup steps via storage

### 4.5 Navigation Safety

Navigation goes through [safeRouter.ts](../../apps/mobile/utils/safeRouter.ts)

UX intent:

- Prevent double navigation
- Reduce race conditions between auth/setup transitions
- Prevent users from seeing screens bounce back and forth while state has not finished resolving

---

## 5. Screen-by-Screen UX

### 5.1 Auth Flow

Owner screens:

- `apps/mobile/app/(auth)/login.tsx`
- `apps/mobile/app/(auth)/register.tsx`
- `apps/mobile/app/(auth)/forgot-password.tsx`
- `apps/mobile/app/(auth)/verify-otp.tsx`
- `apps/mobile/app/(auth)/reset-password.tsx`
- `apps/mobile/app/(auth)/success.tsx`

UX characteristics:

- A form-first flow
- Uses slightly wider spacing than the tab screens
- Minimises distractions so the user focuses on one task per screen

Important details:

- `login`
  - credential or validation errors use a dialog
  - must navigate to the next flow reliably via the safe router
- `verify-otp`
  - uses a hidden input + 6 OTP boxes
  - has countdowns for both expiry and resend cooldown
  - focuses on reducing user confusion when the OTP fails
- `success`
  - is the closing screen of the flow
  - uses positive visual feedback and a single CTA to continue

### 5.2 Setup Entry

Owner screen:

- `apps/mobile/app/(setup)/empty-state.tsx`

Role:

- The starting point of the wizard when the user has no elder/device setup yet
- Explains the steps ahead in an easy-to-understand way
- If an elder already exists in the system, skip out of setup automatically

UX patterns:

- Uses 4 step cards to summarise the flow
- A single primary button `เริ่มลงทะเบียน` (Start registration)
- `ออกจากระบบ` (Log out) as a secondary action

### 5.3 Setup Step 1 — Elder Information

Owner screen:

- `apps/mobile/app/(setup)/step1-elder-info.tsx`

Role:

- Collects the elder information the system requires
- Supports both creating new data and resuming/editing existing data

UX rules:

- The form is long, so it must scroll well and the keyboard must not cover it
- Validation must be short, clear, and say which field to fix
- Entered data must not be lost easily if the user goes back or the app changes state

Field groups clearly visible in the implementation:

- First name / last name
- Gender
- Date of birth
- Height / weight
- Medical conditions
- House number / village number (moo) / village / address via picker

### 5.4 Setup Step 2 — Device Pairing

Owner screen:

- `apps/mobile/app/(setup)/step2-device-pairing.tsx`

Role:

- Pairs the device via QR scan or manual code
- The point that connects the physical device world to the user/elder

UX rules:

- Camera scan is the main happy path
- Manual entry is the fallback
- If a device is found to be already paired, the user must be told clearly that they can:
  - continue to the next step
  - or replace it with a new device

Important behavior:

- Prevent scanning repeatedly
- If the QR scan yields `deviceCode` + `serialNumber`, keep enough of it for the next step
- Back from step 2 must actually return to step 1

### 5.5 Setup Step 3 — WiFi Setup via BLE

Owner screen:

- `apps/mobile/app/(setup)/step3-wifi-setup.tsx`

Role:

- Sets up WiFi for the ESP32 via BLE provisioning
- The most complex step in the setup flow

Actual sub-steps in the screen:

- `initializing`
- `bluetooth-check`
- `ble-connecting`
- `wifi-scanning`
- `wifi-list`
- `wifi-password`
- `provisioning`
- `success`

UX rules:

- Always explain what is currently happening
- If Bluetooth or WiFi is off, clearly tell the user how to proceed
- Provisioning must show progress messages as time passes
- If the socket has not come back yet, it can fall back to polling without the user needing to know implementation details

Principles:

- The user must know that "the system is still working" even if provisioning takes a long time
- Error messages must be actionable rather than just "failed"

### 5.6 Setup Success

Owner screen:

- `apps/mobile/app/(setup)/saved-success.tsx`

Role:

- Closes the setup flow
- Confirms that setup is complete
- Takes the user into the main tabs in a ready-to-use state

UX rules:

- Use a full-screen positive confirmation
- A single CTA `ไปที่หน้าหลัก` (Go to home)
- There should be no secondary actions that confuse the user

### 5.7 Dashboard / Home

Owner screen:

- `apps/mobile/app/(tabs)/dashboard.tsx`

Role:

- The hub of realtime information for the caregiver
- Must let the caregiver read the elder's status as fast as possible

Information priority:

1. fall status
2. heart rate / abnormality
3. device connectivity
4. elder summary / navigation to other features

UX rules:

- The fall critical card must be the most prominent
- Suspected and confirmed must look clearly different
- The `รับทราบแล้ว` (Acknowledged) button on the home screen only returns the in-app view to normal
- Emergency-related actions must be separate from the normal monitoring state

State intent:

- `NORMAL` = stable/calm
- `SUSPECTED` = needs watching
- `FALL` = emergency
- A stale state must not be mistaken for always-fresh realtime data

### 5.8 History

Owner screen:

- `apps/mobile/app/(tabs)/history.tsx`

Role:

- Lets the caregiver view past events
- Focuses on reading the timeline and understanding the latest status

UX rules:

- Items must be easy to read and tappable for more detail
- The latest item should be highlighted
- There is a shortcut to the monthly summary
- An unconfirmed fall should not be shown as if it were a full event

### 5.9 Device Feature Flow

Owner screens:

- `apps/mobile/app/(features)/(device)/device-pairing.tsx`
- `apps/mobile/app/(features)/(device)/device-wifi-setup.tsx`
- `apps/mobile/app/(features)/(device)/device-wifi-reconfig.tsx`
- `apps/mobile/app/(features)/(device)/device-ble-wifi-setup.tsx`
- `apps/mobile/app/(features)/(device)/device-info.tsx`

Role:

- View device status
- Pair a new device
- Set up/change WiFi via a smart entrypoint that chooses BLE or backend reconfig based on online status
- Handle repair/replacement cases

UX rules:

- This flow must be clear about the "current device" versus the "new device"
- The BLE/WiFi flow in feature mode must use wording similar to setup step 3 to reduce cognitive load

### 5.10 Elder & Emergency Contacts

Owner screens:

- `apps/mobile/app/(features)/(elder)/elder-info.tsx`
- `apps/mobile/app/(features)/(elder)/edit.tsx`
- `apps/mobile/app/(features)/(emergency)/contacts.tsx`
- `apps/mobile/app/(features)/(emergency)/add.tsx`
- `apps/mobile/app/(features)/(emergency)/edit.tsx`
- `apps/mobile/app/(features)/(emergency)/call.tsx`

UX intent:

- This is supporting care information, not the main monitoring screen
- Must be easy to read and straightforward to edit
- The emergency contact flow must reduce mistakes when adding/editing/reordering

### 5.11 Notification & Report Supporting Screens

Owner screens:

- `apps/mobile/app/(features)/(notification)/notifications.tsx`
- `apps/mobile/app/(features)/(report)/report-summary.tsx`

UX rules:

- notifications = a log that can be read retrospectively
- report summary = a summarised overview, not a realtime screen
- Users must be able to tell "summary" apart from "live events"

### 5.12 User Profile & Feedback

Owner screens:

- `apps/mobile/app/(features)/(profile)/profile-info.tsx`
- `apps/mobile/app/(features)/(profile)/edit-info.tsx`
- `apps/mobile/app/(features)/(profile)/change-email.tsx`
- `apps/mobile/app/(features)/(profile)/change-password.tsx`
- `apps/mobile/app/(features)/(profile)/edit-phone.tsx`

UX rules:

- Profile screens must be a straightforward settings-style flow
- Success feedback after saving should be short and clear

---

## 6. Realtime UX Rules

### 6.1 Socket-Driven Monitoring

The main realtime data comes from `useSocketConnection` and the Zustand stores (`useSensorStore`, `useFallAlertStore`)

What the UI must preserve:

- When status changes, update quickly but without random flickering
- Stale thresholds must help "clear non-fresh values" from the UI
- Falling back from realtime to cached/query state must not make the screen jump

### 6.2 Offline / Stale Handling

The mobile implementation has core thresholds for data freshness

UX meaning:

- If status is not fresh → do not show it as if the device is definitely still online
- If heart rate is not fresh → do not show a stale value as if it was just measured
- If a fall is an old event → make it clear to the user that it is a historical state, not an active emergency

### 6.3 Acknowledged Button Behavior

On mobile, pressing `รับทราบแล้ว` (Acknowledged) only has an effect within the app

It must not be interpreted as:

- cancel event in the backend
- retract push notification
- change `cancelledAt` in the DB

---

## 7. QA Checklist for UI Review

When reviewing mobile screens, check at least:

- whether the screen shell matches its role (`ScreenWrapper`, `AppScreenHeader`, `WizardLayout`)
- whether spacing/padding still follows the same standard
- whether the primary action stands out more than secondary ones
- whether error/success feedback uses dialog/toast at the right level
- whether the wording for the device cancel button and the `รับทราบแล้ว` (Acknowledged) button is correct
- whether the step flow and back navigation avoid getting the user lost
- whether realtime state honestly shows fresh/stale status
- whether the setup and device flows explain hardware permission / BLE / WiFi failures in an actionable way

---

## Related Docs (UI/UX section)

- [Mobile AI Context](../ai/mobile.md)
- [System Overview](../ai/system_overview.md)
- [Fall Detection System](fall-detection.md)
- [API Reference](../api/api-reference.md)
- [AGENTS.md](../../AGENTS.md)
