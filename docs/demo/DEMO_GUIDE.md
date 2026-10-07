# Demo Guide

[English](DEMO_GUIDE.md) · [ภาษาไทย](DEMO_GUIDE.th.md)

Show the full fall-alert flow without the ESP32: the web simulator plays the device, your laptop runs the backend, the phone runs the preview APK.

## 1. One-time setup

1. PostgreSQL running locally and `apps/backend-api/.env` configured (`npm run env:setup`).
2. Set `DEMO_PASSWORD` (at least 8 characters) in `apps/backend-api/.env`; the template line is in `apps/backend-api/.env.example` under `DEMO SEED`.
3. Mosquitto installed with its folder on PATH (`mosquitto -h` works).
4. Cloudflare Tunnel set up: [cloudflare-tunnel.md](cloudflare-tunnel.md).
5. `npm install` and `npm run backend:db:setup`.
6. Install the APK from [Releases](https://github.com/Wattanaroj2567/fallhelp/releases/latest) on the phone.

## 2. Before each presentation

1. Reset demo data: `npm run backend:db:seed:demo`
2. Terminal 1: `cloudflared tunnel run fallhelp-demo`
3. Terminal 2: `npm run demo:up`
4. Open the simulator: <http://127.0.0.1:5175>. The dot must be green.
5. On the phone: log in with `demo@fallhelp.app` and your `DEMO_PASSWORD` → dashboard.

## 3. Presentation script

1. **Online** → dashboard shows the device online (the simulator keeps sending status every 5 s, like the device).
2. Tick **Auto-send every 5 s**, move the BPM slider → heart rate updates live.
3. **Simulate Fall** → the device reports a suspected fall and starts its 15 s cancel window. After 15 s the fall is confirmed and the phone shows the emergency alert and push notification. The caregiver taps **Acknowledge** in the app.
4. To show a false alarm: press **Simulate Fall**, then **Cancel on device (false alarm)** within 15 s → no alert; history shows a cancelled event.
5. Wait for the countdown on the Fall button before the next fall (the backend ignores repeats for a short time).

## 4. Troubleshooting

| Symptom | Fix |
|---|---|
| `demo:up`: port 1884 in use | An earlier `demo:up` is still running; close it. The Mosquitto service on 1883 can stay on. |
| Simulator dot not green | Mosquitto not started with the demo config; check the `[MQTT]` lines of `demo:up`. |
| Phone: cannot connect / login fails | Tunnel not running; open `https://api.tawanlab.site/internal/health` on the phone. |
| Login works but lands on setup screens | Re-run `npm run backend:db:seed:demo`, log out and in again. |
| Fall pressed, nothing on phone | Serial in the simulator must be `ESP32-DE5000000001`; check `[API]` logs for "FALL". |
| No push notification | Allow notifications for FallHelp on the phone; the in-app alert still appears via Socket.io. |

## 5. After the demo

`Ctrl+C` in both terminals, then `net start mosquitto` if you need the service back.
