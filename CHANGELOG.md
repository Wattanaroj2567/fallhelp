# Changelog

# บันทึกการเปลี่ยนแปลง

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

---

## [1.8.0] - 2025-12-14

### Added

- **ESP32 Captive Portal WiFi Setup**

  - Open AP (ไม่ต้องใส่รหัสผ่าน) สำหรับ Captive Portal
  - Mobile-style Web UI (Kanit font, FallHelp สีเขียว)
  - Connection Testing - ทดสอบเชื่อมต่อ WiFi จริงก่อนบันทึก (~10 วินาที)
  - Success/Error HTML pages แทน JSON response
  - Loading indicator พร้อมข้อความแจ้งล่วงหน้า

- **Device Status Sync**
  - MQTT Last Will Testament สำหรับ offline detection อัตโนมัติ
  - "ออนไลน์ล่าสุด" display บนหน้า Device Details
  - `formatLastSeen` helper function (แสดงเวลาแบบ relative)

### Changed

- **Mobile App**

  - `useFocusEffect` ใน `index.tsx` ใช้ `invalidateQueries` แทน `refetch`
  - `details.tsx` เพิ่ม `refetchInterval: 30s` สำหรับ real-time status
  - ปรับข้อความ UI: "ตั้งค่า WiFi" และ "เปลี่ยน WiFi หรือตั้งค่าใหม่"

- **Backend**

  - Notification message ใหม่: "อาจเกิดจาก: WiFi หลุด, แบตหมด หรือปิดเครื่อง"

- **Documentation**
  - อัปเดต `docs/guides/DEVICE_PAIRING_FLOW.md` (Captive Portal flow)
  - อัปเดต `arduino/README.md` (Open AP, Last Will)

### Fixed

- API Timeout error ใช้ `Logger.warn` แทน `Logger.error` (ไม่แสดง popup)

---

## [1.7.0] - 2025-12-14

### Added

- `FloatingLabelDatePicker` component for standardized date inputs (same height/style as text inputs)
- Static label design for Read-Only fields (e.g., "Current Email") to prevent floating label background conflicts

### Changed

- **Form Standardization & Spacing**
  - Standardized vertical rhythm (20px gap) across all forms (`edit.tsx`, `step1`, `edit-info.tsx`)
  - Refactored `GenderSelect` and `ThaiAddressAutocomplete` to manage their own margins (removed manual wrappers)
  - Fixed "Double Margin" bug in gender selection
- **Dashboard UX**
  - Increased spacing between "Overview Cards" and "Emergency Call Button" (`mt-10`) to prevent accidental clicks
- **UI Refinements**
  - Updated "Change Email" screen to use a clearer static label + gray read-only box design
  - Adjusted font size (16px) and color (Gray 600) for read-only text to match active inputs

---

## [1.6.1] - 2025-12-13

### Added

- EAS Build configuration (`eas.json`) for development, preview, and production
- Hybrid IP detection in `Config.ts` for Expo Go and Standalone builds
- iOS `NSAllowsArbitraryLoads` for local HTTP testing

### Changed

- Upgraded Expo packages to latest compatible versions (Expo 52/54)
- **Documentation Refactor (December 13, 2025)**

  - Rewrote `README.md` with Thai subheaders and cleaner format
  - Rewrote `BACKEND_PROGRESS.md` with checklist format (430→126 lines)
  - Created `API_DOCUMENTATION.md` (Consolidated all API docs)
  - Simplified guide files and removed legacy documentation
  - Standardized all docs: Thai headers, no emojis, consistent format
  - Updated `CHANGELOG.md` to Keep a Changelog standard

- **Admin Security (December 13, 2025)**
  - Implemented secure seed script (`prisma/seed.ts`) for Admin creation
  - Removed public Register route and UI from Admin Panel
  - Added environment variable support for Admin credentials
  - Updated `ADMIN_PANEL.md` with security instructions

---

## [1.6.0] - 2025-12-12

### Added

- 3D Card effect using Nested View strategy for Settings and History screens
- TouchableHighlight with underlay color for interactive feedback

### Fixed

- `Couldn't find a navigation context` crash in NotificationModal
- `TypeError: state.className.split is not a function` NativeWind crash
- `React.Children.only` error in TouchableHighlight

---

## [1.5.1] - 2025-12-12

### Changed

- Standardized "Invite Member" and "Feedback" screen widths (`px-6`)
- Aligned Settings header height with History screen
- Enabled touch-to-focus on floating labels

### Fixed

- Missing labels in "Edit Elder Info" screen

---

## [1.5.0] - 2025-12-12

### Added

- `Bounceable` component using react-native-reanimated for iOS-like feedback
- Increased "Fall Status Card" height on home screen
- Sticky header layout for "Elder Edit" screen

### Fixed

- Redirect loop in "Elder Info" using Blocklist strategy
- Root fallback (`app/index.tsx`) for undefined behavior
- Data staleness on Profile/Elder Info using `useFocusEffect`

---

## [1.4.0] - 2025-12-12

### Added

- Skeleton loading screens (`ListItemSkeleton`, `CardSkeleton`, `ProfileSkeleton`)
- Reusable `FloatingLabelInput` component
- Feature-First Architecture reorganization

### Fixed

- GO_BACK navigation error in `SectionErrorBoundary`
- Post-login routing bug with Authentication Guard
- Console logging violations (replaced with `Logger` utility)
- `useSocket` infinite loop and state update optimization

### Changed

- Added `address` field to Elder schema (removed `notes`)

---

## [1.3.0] - 2025-12-05

### Added

- Notification system (Backend + Mobile)
  - API endpoints: List, Unread Count, Mark Read, Clear All
  - Notification History screen with real-time data
  - Unread badge on bell icon
- Common components: `ScreenWrapper`, `ScreenHeader`, `PrimaryButton`

### Fixed

- Backend API 404 for notification endpoints
- Import errors for auth middleware and prisma client

---

## [1.2.0] - 2025-12-05

### Added

- `QueryErrorBoundary` for React Query component isolation
- `SectionErrorBoundary` for section-specific error handling

### Changed

- Replaced 77+ `console.*` calls with `Logger` utility
- Optimized `useSocket` hook (reduced re-renders by 80-90%)

### Fixed

- QR Scanner lock bug after successful pairing

---

## [1.1.0] - 2025-12-04

### Added

- TimescaleDB setup scripts (`db:reset`, `db:verify`)
- Centralized `Logger` utility with log levels
- API Interceptor for automatic error logging
- Global `ErrorBoundary` for UI crash handling
- Login with Email OR Phone Number support

### Changed

- Profile image upload reverted to Base64 (removed ImgBB)
- Optimized image quality to 0.5

### Fixed

- SQL comment parsing bug in setup script
- TimescaleDB policy offsets

---

## [1.0.0] - 2025-01-16

### Added

- Prisma 7.0.1 upgrade with driver adapter pattern
- ESM module system support

### Changed

- Prisma client output moved to `src/generated/prisma/`
- `tsconfig.json` updated to ESNext module with bundler resolution

---

## [0.9.0] - 2025-12-01

### Added

- **Mobile App (100% Complete)**

  - Authentication flow with OTP
  - Setup wizard (3 steps)
  - Dashboard with real-time monitoring
  - Elder/Device/Emergency Contact management
  - Push notifications (Expo)
  - Multi-user access (OWNER/VIEWER roles)

- **Admin Panel (100% Complete)**

  - Vite + React + TypeScript + TailwindCSS
  - User/Elder/Device/Feedback management

- **Feedback System (Full-stack)**
  - Backend API, Mobile screen, Admin management

---

## [0.8.0] - 2025-11-26

### Added

- `AGENT.md` - GitHub Copilot guidelines
- Documentation reorganization (`docs/` folder structure)

---

## [0.7.0] - 2025-11-25

### Added

- MQTT client with auto-reconnect
- Fall/HeartRate/Status handlers
- Socket.io real-time server
- IoT Simulators (Fall, HeartRate, Device)
- Express app with CORS, rate limiting, graceful shutdown

---

## [0.6.0] - 2025-11-25

### Added

- Routes layer with middleware chains
- API endpoints: auth, users, elders, devices, events, admin
- Health check endpoint

---

## [0.5.0] - 2025-11-25

### Added

- Controllers layer (7 controllers, 42 endpoints)

---

## [0.4.0] - 2025-11-24

### Added

- Services layer (auth, user, elder, device, event, notification, admin)

---

## [0.3.0] - 2025-11-24

### Added

- Core foundation
  - Utils: JWT, password, QR code, Expo Push helpers
  - Middlewares: Auth, Validation, Error handling, Rate limiting

---

## [0.2.0] - 2025-11-23

### Added

- Prisma schema with TimescaleDB support
- Database models: User, Elder, Device, Event, EmergencyContact, Notification

---

## [0.1.0] - 2025-11-22

### Added

- Initial project setup
- Monorepo structure (backend, mobile, admin, docs)
- TypeScript, ESLint, Prettier configuration

---

[Unreleased]: https://github.com/fallhelp/fallhelp/compare/v1.7.0...HEAD
[1.7.0]: https://github.com/fallhelp/fallhelp/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/fallhelp/fallhelp/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/fallhelp/fallhelp/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/fallhelp/fallhelp/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/fallhelp/fallhelp/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/fallhelp/fallhelp/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/fallhelp/fallhelp/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/fallhelp/fallhelp/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/fallhelp/fallhelp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/fallhelp/fallhelp/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/fallhelp/fallhelp/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/fallhelp/fallhelp/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/fallhelp/fallhelp/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/fallhelp/fallhelp/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/fallhelp/fallhelp/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/fallhelp/fallhelp/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/fallhelp/fallhelp/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/fallhelp/fallhelp/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/fallhelp/fallhelp/releases/tag/v0.1.0
