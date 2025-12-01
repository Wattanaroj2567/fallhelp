# Changelog

All notable changes to the FallHelp project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Socket.io test console v2.0 with Alpine.js + Tailwind CSS
- Project structure reorganization (docs, scripts, test folders)

### Changed

- Renamed `openapi.json` to `openapi.yaml` for correct format
- Updated documentation folder structure

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
  - Event history with timeline view and statistics
  - Push notifications (Expo Notifications integration)
  - Multi-user access (invite members, OWNER/VIEWER roles)
  - Profile management and settings
  - Kanit font and consistent UI/UX

- **Admin Panel (100% Complete)**

  - Vite + React 18 + TypeScript + TailwindCSS
  - Authentication with protected routes
  - Dashboard with statistics overview
  - User, Elder, and Device management
  - Feedback management with status workflow

- **Feedback System (Full-stack)**
  - Backend: Prisma model, API endpoints, status workflow
  - Mobile: Send feedback screen in settings
  - Admin: Feedback management with status updates

### Stats

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

### Stats

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
  - `eventService.ts` - TimescaleDB queries, Daily/Monthly stats
  - `notificationService.ts` - Expo Push integration for alerts
  - `adminService.ts` - Dashboard statistics

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

[Unreleased]: https://github.com/fallhelp/fallhelp/compare/v1.0.0...HEAD
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
