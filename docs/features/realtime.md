# Socket.io Real-time System

[English](realtime.md) · [ภาษาไทย](realtime.th.md)

## Doc Meta

- Audience: Backend Dev / Mobile Dev
- Source of Truth: [socketServer.ts](../../apps/backend-api/src/realtime/socketServer.ts)
- Status: Active
- Last Updated: May 10, 2026

---

## Overview

FallHelp uses **Socket.io** for Real-time communication between the Backend and the Mobile App so caregivers receive alerts immediately while the app is open (< 1 second).

---

## Connection Flow

```text
Client connect -> emit authenticate(token, elderId) -> JWT verify -> join user/elder rooms -> receive realtime events
```

**Authentication:**

- The client connects the socket first, then sends the `authenticate` event
- The current payload is `{ token, elderId }`
- The server verifies the JWT before allowing it into any room
- If the token is invalid → the socket receives `authenticated: { success: false }`

**Room System:**

- Every client is bound to room `user:{userId}` after authenticating successfully
- If `elderId` is sent and the ownership check passes, it joins room `elder:{elderId}`
- The current system enforces 1 user = 1 primary active socket session; if the user logs in again, the old session is disconnected

---

## Events Reference

### fall_detected

**When:** A fall is detected (Confirmed)

```typescript
{
  eventId: string;
  elderId: string;
  elderName: string; // "สมชาย ใจดี"
  deviceId: string;
  deviceCode: string; // "8E5D02FB"
  timestamp: string; // ISO timestamp
  accelerationMagnitude: number; // 12.5 (g-force)
  bpm?: number | null;
}
```

**Mobile Action:** Opens the red Full-Screen Fall Alert screen

---

### event_status_changed

**When:** The backend changes the fall event lifecycle between suspected / confirmed / cancelled

```typescript
{
  eventId?: string;
  elderId: string;
  deviceId: string;
  deviceCode: string;
  status: "FALL_SUSPECTED" | "FALL_CONFIRMED" | "FALL_CANCELLED";
  timestamp: string; // ISO timestamp
  bpm?: number | null;
}
```

**Mobile Action:** Used as an internal guard while waiting for confirmed/cancelled and to clear the pending guard after the flow ends; not used in place of `fall_detected` for the main caregiver alert

---

### heart_rate_update

**When:** Normal heart rate (updates the value on the Dashboard)

```typescript
{
  elderId: string;
  elderName: string;
  deviceId: string;
  deviceCode: string;
  timestamp: string; // ISO timestamp
  heartRate: number; // 72 BPM
  confidence?: "none" | "low" | "medium" | "high";
}
```

**Mobile Action:** Updates the BPM value on the Dashboard (no Alert shown)

---

### device_status_update

**When:** Device goes Online/Offline

```typescript
{
  deviceId: string;
  deviceCode: string;
  elderId: string;
  elderName: string;
  online: boolean;
  signalStrength?: number;    // RSSI (dBm)
  wifiSSID?: string;
  timestamp: string; // ISO timestamp
  source?: string;
  serverTimestamp?: string;
  deviceTimestamp?: number | null;
}
```

**Mobile Runtime Filter:** `apps/mobile/hooks/useSocketConnection.ts` uses this event as the realtime device truth only when `source === "mqtt_status_update"` and `serverTimestamp` can be parsed, to prevent old snapshots or packets without server time from changing the current online/offline status

---

### system_message

**When:** Broadcast messages from the system (e.g. Maintenance Notice)

```typescript
{
  message: string;
  data?: unknown;
  timestamp: string; // ISO timestamp
}
```

---

## CORS Configuration

```typescript
origin: (origin, callback) => {
  if (isAllowedClientOrigin(origin)) {
    callback(null, true);
  }
};
```

- **Mobile App:** no Origin header → allowed automatically
- **Development:** allows `localhost:*`, `127.0.0.1:*`, LAN IPs (`192.168.*`, `10.*`) and the Expo scheme
- **Production:** uses an allowlist from `FRONTEND_URL`, `ADMIN_URL`, and `API_BASE_URL`

---

## Client Implementation Notes

### Connection (React Native)

```typescript
import { io } from "socket.io-client";

const socket = io(SOCKET_URL, {
  transports: ["polling", "websocket"],
  upgrade: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.5,
  timeout: 10000,
});

socket.on("connect", () => {
  socket.emit("authenticate", {
    token: jwtToken,
    elderId: "elder-uuid",
  });
});

socket.on("fall_detected", (data) => {
  // Show full-screen alert
});

socket.on("event_status_changed", (data) => {
  // Maintain internal fall pending guard
});

socket.on("heart_rate_update", (data) => {
  // Update dashboard BPM display
});
```

### Reconnection

Socket.io already has auto-reconnect in the transport layer, but the current app adds extra logic in `apps/mobile/hooks/useSocketConnection.ts` for:

- re-authenticating after reconnect
- a stale watchdog that marks the device offline when realtime activity is older than 15 seconds
- debouncing the offline mark to prevent connection flapping
- an 8-second grace period after authenticate before accepting the first offline event

### Device Online / Offline Timing

The current realtime device status values use the heartbeat as the primary signal and MQTT LWT as a supplementary signal:

| Layer | Timing | Purpose |
| :---- | :----- | :------ |
| Firmware status heartbeat | Sends `device/{serial}/status` every 5 seconds | Primary source for confirming the device is still online |
| Mobile watchdog | Checks every 1 second and marks offline when realtime activity has been missing for more than 15 seconds | Lets the app switch to offline based on the latest heartbeat/heart-rate, not on socket disconnect alone |
| Backend / Admin freshness | Treated as offline when `lastOnline` is older than 15 seconds | Central threshold for API/Admin and for cases without a live socket |
| MQTT LWT | Used immediately when the broker triggers it | Supplementary fast signal, but not used as the sole source because trigger timing depends on the broker/keepalive/network |

Hardware test results on 2026-04-28:

| Case | Observed Timing | Notes |
| :--- | :-------------- | :---- |
| Steady online heartbeat | status arrives about every 5.0 seconds | MQTT verbose shows `15:44:39.670`, `15:44:44.669`, `15:44:49.679`, `15:44:54.688`, `15:44:59.704`, `15:45:04.700`, `15:45:09.692`, `15:45:14.696`, `15:45:19.703`, `15:45:24.707` |
| Power/reboot to MQTT online | about 5.5 seconds from the boot banner to the first online status | Serial `15:44:04.143` → MQTT status `15:44:09.647`; counting from `SW_CPU_RESET` it is about 7.1 seconds |
| WiFi connected to MQTT online | about 1.8 seconds | Serial WiFi connected `15:44:07.841` → MQTT status `15:44:09.647` |
| Mobile expected offline after power-off | about 15-16 seconds after the latest realtime activity | Latest MQTT status `15:45:24.707` → mobile watchdog should mark offline around `15:45:39.707` to `15:45:40.707` given the 1-second check cycle |
| Backend/Admin expected offline after power-off | about 15 seconds after the latest status | Latest MQTT status `15:45:24.707` → backend/admin threshold around `15:45:39.707` |
| LWT trigger after short reconnect | about 24.2 seconds after the latest status | Latest MQTT status `15:39:04.793` → LWT `15:39:28.970`; a signal from the broker, not the primary one |
| LWT trigger after power-off | about 46.1 seconds after the latest status | Latest MQTT status `15:45:24.707` → LWT `15:46:10.822`; slower than the heartbeat timeout, so used only as a fallback |

Expected UX:

- The app should show offline within about 15-16 seconds after the latest realtime activity stops
- Backend/Admin should reflect offline within about 15 seconds after the latest status
- When the device is powered back on, if WiFi/MQTT is ready, the app should return to online after the backend receives the first status; in this hardware test round that was around 5-6 seconds from boot under normal conditions

---

## Related Docs

- [Notification System](notifications.md)
- [API Reference](../api/api-reference.md)
- [Backend AI Context](../ai/backend.md)
- [Mobile AI Context](../ai/mobile.md)
