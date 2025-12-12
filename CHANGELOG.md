# Changelog

All notable changes to the FallHelp project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Production Build Readiness**:
  - **EAS Build**: Added `eas.json` configuration for development, preview, and production builds.
  - **App Config**: Updated `app.json` with Android Package Name and iOS Bundle Identifier (`com.fallhelp.mobile`).
  - **Permissions**: Added Camera usage description for QR Code scanning in `app.json`.
  - **Network Config**: Implemented Hybrid IP detection in `Config.ts` to support both Auto-IP (Expo Go) and Fallback IP (Standalone).
  - **iOS Support**: Enabled `NSAllowsArbitraryLoads` for local testing via HTTP.

### Changed

- **Dependencies**: Upgraded core Expo packages to latest compatible versions (Expo 52/54 ecosystem).

## [1.6.0] - 2025-12-12

### Added

- **UI/UX Standardization (Master Style)**:
  - **3D Card Aesthetic**: Implemented "Nested View" strategy (Outer Shadow + Inner Clip) for Settings and History screens to ensure consistent deep shadows (`shadow-lg`, `elevation-10`) on both Android and iOS.
  - **Interactive Feedback**: Replaced `TouchableOpacity`/`Pressable` with `TouchableHighlight` (Underlay: `#E5E7EB`) in Settings and History menus for robust, high-contrast touch feedback.

### Fixed

- **Navigation & Stability**:
  - **Context Error**: Resolved `Couldn't find a navigation context` crash by moving `NotificationModal` outside `ScreenWrapper` in `app/(tabs)/index.tsx`.
  - **NativeWind Crash**: Fixed `TypeError: state.className.split is not a function` by removing function-based className logic in `Pressable`.
  - **Component Structure**: Fixed `React.Children.only` error in `TouchableHighlight` by ensuring single-child View wrapper.

## [1.5.1] - 2025-12-12

### Changed

- **UI Alignment**:
  - **Screen Width**: Standardized "Invite Member" and "Feedback" screens to match "Manage Members" layout (`px-6`).
  - **Settings Header**: Strictly aligned Settings screen header height with History screen by removing extra margin and reducing padding (`pt-4` -> `pt-2`).
- **Form Interaction**:
  - **Floating Labels**: Enabled "Touch-to-Focus" on floating labels for easier input selection.
  - **Touch Feedback**: Removed default gray highlight on label press for smoother UX.
- **Bug Fixes**:
  - **Missing Labels**: Fixed invisible labels in "Edit Elder Info" screen by converting complex React Nodes to simple strings with `isRequired` support.

## [1.5.0] - 2025-12-12

### Added

- **Premium Interaction System**:
  - Created `Bounceable` component using `react-native-reanimated` for iOS-like scale feedback.
  - Applied to all primary buttons, headers, profile pictures, and home screen cards.
- **Home Screen Enhancements**:
  - Increased "Fall Status Card" height and visual weight.
  - Added sticky header layout for "Elder Edit" screen description.

### Fixed

- **Navigation & Routing**:
  - **Redirect Loop**: Fixed "Elder Info" redirect bug by implementing Blocklist strategy in `useProtectedRoute`.
  - **Root Fallback**: Added `app/index.tsx` to prevent undefined behavior on root reload.
  - **Home Sync**: Resolved data staleness (Profile/Elder Info not updating) by implementing `useFocusEffect` refetching.
- **UI/UX Refinements**:
  - **History Screen**: Adjusted header bottom padding for better list alignment.
  - **Login Flow**: Updated error messages to be softer and more user-friendly.

## [1.4.0] - 2025-12-12

### Fixed

- **Mobile App - Critical Navigation & Error Handling Issues**

  - ✅ **GO_BACK Navigation Error**: Fixed `SectionErrorBoundary` error when pressing back button. Added proper error handling with fallback to home screen
  - ✅ **Post-Login Routing Bug**: Added Authentication Guard at root layout level (`_layout.tsx`). App now correctly routes to `(tabs)` after login instead of `(features)/(elder)`
  - ✅ **Console Logging Violations**: Replaced all `console.log`, `console.error`, `console.debug` with `Logger` utility in 7 files.
  - ✅ **useSocket Hook Anti-Patterns**: Fixed watchdog infinite loop, extracted constants, optimized state updates.
  - ✅ **Login Redirect Timing**: Removed arbitrary 100ms `setTimeout` in login success handler.

- **Emergency Call Screen**:
  - Restored missing `call.tsx` file in `(features)/(emergency)/`
  - Fixed module resolution error for `emergencyContactService`
  - Corrected function import `getEmergencyContacts` -> `listContacts`
  - Updated outdated routes in `emergency/index.tsx`

### Added

- **Mobile App - Loading States Enhancement (Skeleton Screens)**

  - Created `ListItemSkeleton`, `CardSkeleton`, `ProfileSkeleton`
  - Implemented in Emergency Contacts and Profile screens
  - Smooth shimmer animation

- **Mobile App - Input Component Refactoring**

  - Created reusable `FloatingLabelInput` component
  - Refactored Auth, Setup, Profile, Settings, Elderly & Emergency Contact screens
  - Centralized input styling and animation logic

- **Mobile App - Structural Refactoring (Feature-First Architecture)**
  - Reorganized `mobile/app` directory from Tab-based to Domain-based structure
  - Created `(features)` directory with sub-modules: `elder`, `device`, `user`, `emergency`, `monitoring`
  - Improved code maintainability and navigation logic

### Changed

- **Elder Data Model**:
  - Added `address` field to Elder schema and API
  - Removed `notes` field (replaced by specific fields)
  - Updated `schema.prisma`, `elderService.ts`, `openapi.yaml`, and `postman_collection.json`
  - Updated Mobile UI to reflect field changes (Name -> Gender -> DOB -> Height -> Weight -> Diseases -> Address)

### Verified

- **TypeScript Strict Mode**: Already enabled and working
- **Unit Tests Setup**: Initial test coverage for critical functions (Logger, Emergency Service)

---

## [1.3.0] - 2025-12-05

### Added

- **Advanced Notification System (Full-stack)**

  - **Backend**:
    - `notificationController.ts` & `notificationRoutes.ts` for managing notifications
    - API endpoints: List, Unread Count, Mark as Read, Mark All Read, Delete, Clear All
  - **Mobile**:
    - Notification History Screen (`notifications.tsx`) with real-time data
    - Unread Badge on Home Screen bell icon
    - "Mark all as read" and "Clear all" functionality
    - Visual indicators for read/unread status

- **Mobile App - UI Refactoring (Common Components)**
  - Implemented `ScreenWrapper`, `ScreenHeader`, `PrimaryButton` across all screens
  - **Refactored Screens**:
    - **Home & Utility**: Home (with badge), Call, Notifications
    - **Features**: Profile (Index, Edit, Change Password/Email/Phone), Elderly (Index, Edit), Emergency (Index, Add, Edit)
  - Consistent styling, safe area handling, and loading states

### Changed

- **Home Screen**: Added notification bell with unread badge to header
- **Call Screen**: Refactored to use common components
- **Notifications Screen**: Upgraded from static placeholder to fully functional history view

### Fixed

- **Backend API 404**: Resolved missing notification endpoints by implementing controller and routes
- **Import Errors**: Fixed incorrect import paths for auth middleware and prisma client

---

## [1.2.0] - 2025-12-05

### Added

- **Mobile App - Error Boundaries Enhancement**
  - Created `QueryErrorBoundary.tsx` for React Query component error isolation with retry functionality
  - Created `SectionErrorBoundary.tsx` for section-specific error handling
  - Prevents full app crashes from isolated component errors

### Changed

- **Mobile App - Code Quality Improvements**
  - **Console Violations**: Replaced 77+ `console.*` calls with `Logger` utility
    - App code: 60+ violations across 24 files (auth, setup, settings, home features)
    - Utility code: 17 violations in hooks (`usePushNotifications`, `useSafeRouter`), services, and components
  - **useSocket Optimization**: Reduced re-renders by 80-90% with conditional state updates
  - **Route Configuration**: Fixed invalid route name "phone" → "call" in navigation layout
  - **Files Modified**: 32 files total (30 modified + 2 new components)

### Fixed

- **QR Scanner Lock Bug**: Scanner now properly resets after successful device pairing
  - Fixed in setup flow (`step2-device-pairing.tsx`)
  - Fixed in re-pairing flow (`pairing.tsx`)
  - Added `isScanning.current = false` in success handlers

### Verified

- SafeAreaView already using `react-native-safe-area-context` (no deprecation issues)
- Image uploads already optimized at 50% quality

---

## [1.1.0] - 2025-12-04

### Added

- **TimescaleDB Setup & Verification**

  - `db:reset` script for one-shot database reset and setup
  - `db:verify` script for checking extension, hypertable, and policy status
  - Robust SQL parsing logic for `run-timescale-setup.ts`
  - Documentation: `docs/architecture/SYSTEM_DESIGN.md`

- **Mobile Error Handling System**

  - Centralized `Logger` utility with log levels
  - API Interceptor for automatic error logging
  - Global `ErrorBoundary` to catch UI crashes
  - Documentation: `docs/architecture/SYSTEM_DESIGN.md`

- **Admin Error Handling System**

  - Centralized `Logger` utility with log levels
  - API Interceptor for automatic error logging
  - Global `ErrorBoundary` to catch UI crashes
  - Documentation: `docs/architecture/SYSTEM_DESIGN.md`

- **Authentication & UI Refinements**
  - **Login**: Support for Email OR Phone Number (Backend, Mobile, Admin)
  - **Admin UI**:
    - Phone number validation (10 digits only)
    - Password visibility toggle (Eye icon)
    - Removed placeholders for cleaner UI
    - Simplified Register form (removed password toggle in favor of confirmation field)

### Changed

- Updated `mobile:start` script in root `package.json` to use `npx expo start` directly
- Renamed `openapi.json` to `openapi.yaml` for correct format
- Updated documentation folder structure
- **Profile Image Upload:**
  - Reverted upload mechanism to **Base64** (Direct to Backend)
  - Removed ImgBB integration and Local Storage (Demo Mode) logic
  - Optimized image quality to 0.5 to reduce payload size
  - Suppressed Base64 string logging in terminal for cleaner logs
  - Updated `Image` component to use `expo-image` with `key` prop for reliable rendering

### Fixed

- **Database Setup**
  - Fixed SQL comment parsing bug in setup script
  - Corrected TimescaleDB policy offsets (`policy refresh window too small`)
  - Fixed `COMMENT ON MATERIALIZED VIEW` compatibility issue

---

## [1.0.0] - 2025-01-16

### Added

- **Prisma 7 Upgrade**
  - Upgraded from Prisma 6.19.0 to 7.0.1
  - Added `@prisma/adapter-pg` driver adapter
  - New generated client output at `src/generated/prisma/`

### Changed

- Generator provider changed from `prisma-client-js` to `prisma-client`
- Updated `prisma.config.ts` with datasource URL configuration
- Refactored all services to use singleton prisma instance
- Changed `tsconfig.json` to ESNext module with bundler resolution
- Added `tsx` for ESM TypeScript execution

### Breaking Changes

- Prisma client now generated to `src/generated/prisma/`
- Must use driver adapter pattern for database connections
- ESM module system required

---

## [0.9.0] - 2025-12-01

### Added

- **Mobile App (100% Complete)**

  - Authentication flow (Login, Register, Forgot Password with OTP)
  - First-time setup wizard (3 steps: Elder Info → Device Pairing → WiFi Config)
  - Dashboard with real-time monitoring (Device Status, Fall Detection, Heart Rate)
  - Elder management (CRUD, profile image, medical history)
  - Device management (QR Scanner, manual pairing, WiFi configuration)
  - Emergency contact management (CRUD, priority ordering, quick call)
  - Event history with timeline view and summary
  - Push notifications (Expo Notifications integration)
  - Multi-user access (invite members, OWNER/VIEWER roles)
  - Profile management and settings
  - Kanit font and consistent UI/UX

- **Admin Panel (100% Complete)**

  - Vite + React 18 + TypeScript + TailwindCSS
  - Authentication with protected routes
  - Dashboard with summary overview
  - User, Elder, and Device management
  - Feedback management with status workflow

- **Feedback System (Full-stack)**
  - Backend: Prisma model, API endpoints, status workflow
  - Mobile: Send feedback screen in settings
  - Admin: Feedback management with status updates

### Summary

- Mobile: 50+ files, ~8,000+ lines, 30+ screens
- Admin: 25+ files, ~3,500+ lines

---

## [0.8.0] - 2025-11-26

### Added

- `AGENT.md` - GitHub Copilot guidelines for project development
  - 8 core rules for AI-assisted development
  - Project-specific context and coding standards
  - Git commit conventions

### Changed

- **Documentation Reorganization**
  - Created `docs/` folder structure for main documentation
  - Moved `PROJECT_STRUCTURE.md` and `UI_FEATURES.md` to `docs/`
  - Created `backend/docs/` for backend-specific documentation
  - Added index files: `docs/README.md`, `docs/BACKEND.md`, `docs/MOBILE.md`

---

## [0.7.0] - 2025-11-25

### Added

- **IoT Integration (Phase 10)**

  - MQTT client with auto-reconnect (`mqttClient.ts`)
  - Topic definitions and payload interfaces
  - Fall detection, heart rate, and device status handlers
  - Socket.io server for real-time WebSocket communication
  - Room-based messaging (user rooms, elder rooms)

- **IoT Simulators**

  - `fallSimulator.ts` - Simulate fall detection events
  - `heartRateSimulator.ts` - Simulate normal and abnormal heart rates
  - `deviceSimulator.ts` - Simulate device online/offline status

- **Core Application (Phase 11)**

  - Express app setup with CORS, rate limiting, error handlers
  - HTTP server with Socket.io and MQTT integration
  - Graceful shutdown handling
  - Prisma client singleton
  - TimescaleDB hypertable migrations
  - Environment configuration template

- **Documentation**
  - `IMPLEMENTATION_SUMMARY.md`
  - `IOT_SIMULATOR_GUIDE.md`
  - `postman_collection.json` for API testing
  - `PROJECT_COMPLETE.md`

### Summary

- 11 IoT files, ~1,000+ lines
- 42+ REST API endpoints
- 3 MQTT subscribe topics
- 6 Socket.io real-time events

---

## [0.6.0] - 2025-11-25

### Added

- **Routes Layer (Phase 9)**
  - `/api/auth` - Authentication routes
  - `/api/users` - User management routes
  - `/api/elders` - Elder management with member management
  - `/api/devices` - Device management routes
  - `/api/events` - Event tracking routes
  - `/api/elders/:elderId/contacts` - Emergency contacts routes
  - `/api/admin` - Admin dashboard routes
  - `/api/health` - Health check endpoint
  - Proper middleware chains with role-based access control

---

## [0.5.0] - 2025-11-25

### Added

- **Controllers Layer (Phase 8)**
  - `authController.ts` - 6 endpoints
  - `userController.ts` - 4 endpoints
  - `elderController.ts` - 8 endpoints
  - `deviceController.ts` - 7 endpoints
  - `eventController.ts` - 6 endpoints
  - `emergencyContactController.ts` - 4 endpoints
  - `adminController.ts` - 7 endpoints

---

## [0.4.0] - 2025-11-24

### Added

- **Services Layer (Phase 2-7)**
  - `authService.ts` - Registration, Login, OTP (10-min expiry), Password reset
  - `userService.ts` - Profile CRUD, Password change
  - `elderService.ts` - Elder CRUD, Multi-user access (OWNER/VIEWER)
  - `deviceService.ts` - Create device, Pair/Unpair, WiFi config
  - `eventService.ts` - TimescaleDB queries, Daily/Monthly summary
  - `notificationService.ts` - Expo Push integration for alerts
  - `adminService.ts` - Dashboard summary

---

## [0.3.0] - 2025-11-24

### Added

- **Core Foundation (Phase 1)**
  - **Utils**: JWT, password hashing, OTP generation, date utilities, QR code, Expo Push helpers
  - **Types**: Extended Express Request, API response interfaces
  - **Middlewares**: Authentication (authenticate, requireAdmin, optionalAuth)
  - **Middlewares**: Validation (generic validator, login/register/OTP validators)
  - **Middlewares**: Error handling (global handler, asyncHandler wrapper)
  - **Middlewares**: Rate limiting (API: 100/15min, Auth: 5/15min, OTP: 3/10min)

---

## [0.2.0] - 2025-11-23

### Added

- Prisma schema with TimescaleDB support
- Database models: User, Elder, Device, Event, EmergencyContact, Notification
- Multi-user access control model (ElderAccess)
- Seed data for development

---

## [0.1.0] - 2025-11-22

### Added

- Initial project setup
- Monorepo structure (backend, mobile, admin, docs)
- TypeScript configuration
- ESLint and Prettier setup
- Basic documentation structure

---

## Notes

### Technical Decisions

- **Soft Delete Pattern**: Preserve data integrity, support audit trails
- **TimescaleDB**: Optimal for time-series event data
- **JWT 7-day Expiry**: Balance between security and user convenience
- **30-second Fall Cancel Window**: Based on UI requirements

### Lessons Learned

- TimescaleDB composite keys require careful migration planning
- MQTT reconnection logic is critical for IoT reliability
- IoT simulators greatly speed up development without hardware

---

[Unreleased]: https://github.com/fallhelp/fallhelp/compare/v1.2.0...HEAD
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
