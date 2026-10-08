# Device Simulator

[English](README.md) · [ภาษาไทย](README.th.md)

Full-screen web dashboard that pretends to be the FallHelp neck device. It publishes to the same MQTT topics as the ESP32 through Mosquitto's WebSocket listener.

Three panels: **Device** (online/offline), **Fall scenario** (large countdown ring: amber = 15 s cancel window, red = fall confirmed, grey = cancelled; the ring then counts the backend cooldown) and **Heart rate** (live value, flowing trend chart and a **Low / Normal / High** scenario switch). Light and dark themes match the admin panel (toggle in the header). The UI is in Thai by default; switch to English with **TH | EN** in the header (MQTT payloads and the message log JSON stay unchanged). Status colours mean the same everywhere: green online/OK, amber pending, red fall/error, grey offline, blue heart rate.

| Button | Topic | Payload |
|---|---|---|
| Go online / Go offline | `device/{serial}/status` (every 5 s while online) | `online`, `signalStrength`, `wifiSSID`, `timestamp` |
| Heart rate (automatic every 5 s while online) | `device/{serial}/heartrate` | `heartRate`, `confidence`, `timestamp`; drifts ±8 BPM around the scenario target (Low ~50, Normal ~75, High ~125), changes at most 6 BPM per reading so it ramps gradually, and rises ~25 BPM after a confirmed fall |
| Simulate fall (device must be online) | `device/{serial}/event` | `type: "suspected_fall"`, then after 15 s `type: "fall_confirmed"` (`magnitude`, `postureDelta`, `bpm`) |
| Cancel on device | `device/{serial}/event` | `type: "fall_cancelled"` (only during the 15 s window) |

Run with the whole demo stack: `npm run demo:up` (see [demo guide](../../docs/demo/DEMO_GUIDE.md)).
Broker URL defaults to `ws://127.0.0.1:9001`; override with `VITE_MQTT_WS_URL`.
The payload contract is pinned by `src/contract/fixtures.json`, tested here and in the backend.
