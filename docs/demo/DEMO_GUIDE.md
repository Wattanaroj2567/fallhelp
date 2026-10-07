# Demo Guide

[English](DEMO_GUIDE.md) · [ภาษาไทย](DEMO_GUIDE.th.md)

Show the full fall-alert flow without the ESP32: the web simulator plays the device, your laptop runs the backend, the phone runs the preview APK.

## 1. One-time setup

1. PostgreSQL running locally and `apps/backend-api/.env` configured (`npm run env:setup`).
2. Add `DEMO_PASSWORD=<at least 8 characters>` to `apps/backend-api/.env` yourself.
3. Mosquitto installed with its folder on PATH (`mosquitto -h` works).
4. Cloudflare Tunnel set up: [cloudflare-tunnel.md](cloudflare-tunnel.md).
5. `npm install` and `npm run backend:db:setup`.
6. Install the APK from [Releases](https://github.com/Wattanaroj2567/fallhelp/releases/latest) on the phone.

## 2. Before each presentation

1. Stop the Windows Mosquitto service (admin PowerShell): `net stop mosquitto`
2. Reset demo data: `npm run backend:db:seed:demo`
3. Terminal 1: `cloudflared tunnel run fallhelp-demo`
4. Terminal 2: `npm run demo:up`
5. Open the simulator: <http://127.0.0.1:5175>. The dot must be green.
6. On the phone: log in with `demo@fallhelp.app` and your `DEMO_PASSWORD` → dashboard.

## 3. Presentation script

1. **Online** → dashboard shows the device online.
2. Tick **Auto-send every 5 s**, move the BPM slider → heart rate updates live.
3. **Simulate Fall** → the phone shows the emergency alert and push notification.
4. Either acknowledge the alert on the phone (caregiver), **or** press **Acknowledge on device** within 15 s (wearer's false-alarm cancel) → event shows as cancelled.
5. Wait for the 30 s countdown before the next fall (the backend ignores repeats within 30 s).

## 4. Troubleshooting

| Symptom | Fix |
|---|---|
| `demo:up`: port 1883 in use | `net stop mosquitto` (admin PowerShell). |
| Simulator dot not green | Mosquitto not started with the demo config; check the `[MQTT]` lines of `demo:up`. |
| Phone: cannot connect / login fails | Tunnel not running; open `https://api.tawanlab.site/internal/health` on the phone. |
| Login works but lands on setup screens | Re-run `npm run backend:db:seed:demo`, log out and in again. |
| Fall pressed, nothing on phone | Serial in the simulator must be `ESP32-DE5000000001`; check `[API]` logs for "FALL". |
| No push notification | Allow notifications for FallHelp on the phone; the in-app alert still appears via Socket.io. |

## 5. After the demo

`Ctrl+C` in both terminals, then `net start mosquitto` if you need the service back.
