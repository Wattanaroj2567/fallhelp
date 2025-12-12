# Admin Panel Documentation

## Overview

The FallHelp Admin Panel is a web-based dashboard for system administrators to manage devices, view system overview, and monitor user feedback.

**Technology Stack:**

- Vite + React 18
- TypeScript
- TailwindCSS
- React Query (@tanstack/react-query)
- React Router DOM
- Axios

**Status:** ✅ Complete (December 1, 2025)

---

## Features

### 1. Authentication

- **Login Page:** Admin login with email and password
- **Register Page:** Create new admin accounts
- **Auth Context:** Global authentication state management
- **Protected Routes:** Automatic redirect to login for unauthenticated users
- **Token Management:** JWT token stored in localStorage

**API Endpoints:**

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

---

### 2. Dashboard

**System Overview:**

- Total Users count
- Total Elders count
- Total Devices count
- Recent Events list

**API Endpoint:**

- `GET /api/admin/dashboard`

---

### 3. User Management

**Features:**

- View all users
- View caregivers
- User details (name, email, role, created date)
- Search and filter functionality

**API Endpoints:**

- `GET /api/admin/users`
- `GET /api/admin/elders` (to see caregivers)

---

### 4. Elder Management

**Features:**

- View all elders
- Elder details with caregiver information
- Medical history display
- Search and filter functionality

**API Endpoint:**

- `GET /api/admin/elders`

---

### 5. Device Management

**Features:**

- Register new device
- Generate QR code for device pairing
- View device list (with status, serial number, paired elder)
- Delete device
- Print device label (receipt style)

**API Endpoints:**

- `POST /api/admin/devices`
- `GET /api/admin/devices`
- `DELETE /api/admin/devices/:id`
- `GET /api/devices/:code/qr`

---

### 6. Feedback Management

**Features:**

- View all user feedback
- Update feedback status (PENDING → REVIEWED → RESOLVED)
- Filter by status
- User information display (name, email)
- Timestamp display

**API Endpoints:**

- `GET /api/feedback`
- `PATCH /api/feedback/:id/status`

---

### 7. Notification Management

**Features:**

- View all system notifications
- Filter by type (Fall, Heart Rate, System)
- View notification status (Sent, Read)

**API Endpoints:**

- `GET /api/admin/notifications` (if implemented)
- `GET /api/notifications` (General list)

---

## UI Components

### Layout

- **DashboardLayout:** Main layout with sidebar and content area
- **Sidebar:** Collapsible navigation menu
- **Header:** Page title and user info

### Common Components

- **Loading States:** Spinner animations
- **Empty States:** Friendly messages when no data
- **Error Handling:** Toast notifications for errors
- **Responsive Design:** Mobile-friendly layout

---

## Quick Start

### Installation

```bash
cd admin
npm install
```

### Development

```bash
npm run dev
# Access at http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Configuration

### API Base URL

Located in `src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: "http://localhost:3000/api",
});
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## File Structure

```
admin/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context (Auth)
│   ├── layouts/          # Page layouts
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Elders.tsx
│   │   ├── Devices.tsx
│   │   └── Feedback.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Authentication Flow

1. User enters email and password
2. Frontend sends `POST /api/auth/login`
3. Backend validates credentials
4. Backend returns JWT token + user data
5. Frontend stores token in localStorage
6. Frontend sets auth context
7. User is redirected to dashboard

**Auto-logout on 401:**

- API interceptor detects 401 responses
- Clears localStorage
- Redirects to login page

---

## Deployment

### Build

```bash
npm run build
```

Output: `dist/` directory

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Screenshots

### Dashboard

![Dashboard](../assets/screenshots/admin-dashboard.png)

### Device Management

![Devices](../assets/screenshots/admin-devices.png)

### Feedback Management

![Feedback](../assets/screenshots/admin-feedback.png)

---

**Last Updated:** December 5, 2025
