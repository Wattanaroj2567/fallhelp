# Device Simulator

[English](README.md) · [ภาษาไทย](README.th.md)

Web app that pretends to be the FallHelp neck device. It publishes to the same MQTT topics as the ESP32 through Mosquitto's WebSocket listener.

| Button | Topic | Payload |
|---|---|---|
| Online / Offline | `device/{serial}/status` (every 5 s while online) | `online`, `signalStrength`, `wifiSSID`, `timestamp` |
| Send heart rate | `device/{serial}/heartrate` | `heartRate`, `confidence`, `timestamp` |
| Simulate Fall | `device/{serial}/event` | `type: "suspected_fall"`, then after 15 s `type: "fall_confirmed"` (`magnitude`, `postureDelta`, `bpm`) |
| Cancel on device (false alarm) | `device/{serial}/event` | `type: "fall_cancelled"` (only during the 15 s window) |

Run with the whole demo stack: `npm run demo:up` (see [demo guide](../../docs/demo/DEMO_GUIDE.md)).
Broker URL defaults to `ws://127.0.0.1:9001`; override with `VITE_MQTT_WS_URL`.
The payload contract is pinned by `src/contract/fixtures.json`, tested here and in the backend.
