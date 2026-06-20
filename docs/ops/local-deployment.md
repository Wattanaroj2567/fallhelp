# Local Deployment Guide

## Doc Meta

- Audience: Backend/DevOps, QA
- Source of Truth: [apps/backend-api/](../../apps/backend-api), [docker-compose.yml](../../docker-compose.yml), [apps/backend-api/.env.example](../../apps/backend-api/.env.example)
- Status: Active
- Last Updated: June 20, 2026

---

## Overview

This runbook explains how to run FallHelp locally or for UAT using the current monorepo structure. It covers Backend API, Admin panel, PostgreSQL, MQTT, optional Cloudflare Tunnel, and mobile API configuration.

Use the root [README](../../README.md) for a short quick start. Use this file when you need the detailed step-by-step setup.

---

## Deployment Shape

```text
Mobile App / Admin Browser
  -> Backend API (localhost:3000 or HTTPS tunnel hostname)
      -> PostgreSQL
      -> MQTT broker (local Mosquitto or HiveMQ Cloud)
      -> Socket.io / Expo Push side effects

ESP32
  -> MQTT broker directly
```

For Cloudflare Tunnel UAT:

```text
Mobile App / Browser
  -> Cloudflare HTTPS hostname
      -> cloudflared tunnel
          -> backend container/service

ESP32
  -> MQTT broker directly (MQTT is not proxied through Cloudflare)
```

MQTT is not HTTP, so do not put ESP32 MQTT traffic behind the normal Cloudflare proxy. Use local Mosquitto on LAN, HiveMQ Cloud, or a self-hosted MQTT broker with TLS.

---

## 1. Choose A Run Mode

| Mode | Use When | Main Command |
| ---- | -------- | ------------ |
| Local terminal | You want hot reload and direct local debugging | `npm run dev:all` |
| Docker backend/admin | You want containerized backend + admin while PostgreSQL/MQTT run outside Docker | `docker compose up -d --build --pull always` |
| Docker + Cloudflare Tunnel | You want an HTTPS public/UAT endpoint without opening router ports | `docker compose --env-file apps/backend-api/.env --profile tunnel up -d --build --pull always` |
| Sensor Lab | You want Node-RED dashboard for sensor workflow testing and labeled data collection | `npm run sensor-lab -- node-red up` |

The rest of this guide walks through the setup in the order you should perform it.

---

## 2. Prerequisites

Required for all modes:

- Node.js 24.x
- npm 11.x from the project package manager baseline
- PostgreSQL 18.x
- MQTT broker: local Mosquitto, HiveMQ Cloud, or self-hosted MQTT
- Git

Required only for specific modes:

| Need | Requirement |
| ---- | ----------- |
| Docker mode | Docker Desktop or Docker Engine with Compose v2 |
| Tunnel mode | Cloudflare account + Named Tunnel token |
| Mobile builds | Expo account + project-local EAS CLI through `npm exec eas` |
| Firmware upload | Arduino IDE or `arduino-cli` with ESP32 core and required libraries |

---

## 3. Prepare Environment Files

From the repo root:

```bash
npm run env:setup
```

This copies local templates and tries to link root `.env` to `apps/backend-api/.env` so Docker Compose can read backend values automatically. If the symlink cannot be created on your OS, run Docker commands with `--env-file apps/backend-api/.env`.

Edit `apps/backend-api/.env` first. The most important values are:

```env
# Backend on host machine
DATABASE_URL="postgresql://username:password@localhost:5432/fallhelp_db?schema=public"

# Backend inside Docker container
DATABASE_URL_DOCKER="postgresql://username:password@host.docker.internal:5432/fallhelp_db?schema=public"

JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef"

PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:8081"
ADMIN_URL="http://localhost:5173"
ADMIN_VITE_API_URL="http://localhost:3000/api"

# Backend on host machine
MQTT_BROKER_URL="mqtt://localhost:1883"

# Backend inside Docker container
MQTT_BROKER_URL_DOCKER="mqtt://host.docker.internal:1883"
MQTT_USERNAME=""
MQTT_PASSWORD=""
MQTT_DISABLED="false"

# Optional Cloudflare named tunnel
TUNNEL_TOKEN=""
TUNNEL_PUBLIC_HOSTNAME="api.your-domain.com"
TUNNEL_ORIGIN_URL="http://backend:3000"
```

Do not commit real `.env` files or production credentials.

---

## 4. Set Up PostgreSQL

Create the database that matches `DATABASE_URL` and `DATABASE_URL_DOCKER`, then run:

```bash
npm run backend:db:setup
npm run backend:db:verify
```

For Docker mode, migrations and seed can also run inside the backend container after `docker compose up`:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Use the root scripts for day-to-day local setup because they include the workspace platform checks.

---

## 5. Set Up MQTT

Choose one broker option.

### Option A: Local Mosquitto (Dev/Lab)

Mosquitto runs as a native service on the host machine.

Windows PowerShell as Administrator:

```powershell
choco install mosquitto
Copy-Item "config\mosquitto\mosquitto.conf" "C:\Program Files\mosquitto\mosquitto.conf"
net stop mosquitto; net start mosquitto
npm run mqtt:check
```

Linux:

```bash
sudo apt install mosquitto mosquitto-clients
sudo cp config/mosquitto/mosquitto.conf /etc/mosquitto/conf.d/fallhelp.conf
sudo systemctl enable --now mosquitto
npm run mqtt:check
```

Use these env values:

```env
MQTT_BROKER_URL="mqtt://localhost:1883"
MQTT_BROKER_URL_DOCKER="mqtt://host.docker.internal:1883"
MQTT_USERNAME=""
MQTT_PASSWORD=""
```

For ESP32 on LAN, set the firmware MQTT host to the host machine's LAN IP, not `localhost`.

Open firewall for local MQTT if ESP32 connects over LAN:

```powershell
New-NetFirewallRule -DisplayName "Mosquitto MQTT" -Direction Inbound -Protocol TCP -LocalPort 1883 -RemoteAddress LocalSubnet -Action Allow
```

```bash
sudo ufw allow from 192.168.0.0/16 to any port 1883
```

### Option B: HiveMQ Cloud (UAT)

Use this when the ESP32 should connect over the internet with TLS.

1. Create a Serverless Cluster at [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/).
2. Create credentials for backend/ESP32 use.
3. Set backend env values:

```env
MQTT_BROKER_URL="mqtts://your-cluster-id.hivemq.cloud:8883"
MQTT_BROKER_URL_DOCKER="mqtts://your-cluster-id.hivemq.cloud:8883"
MQTT_USERNAME="fallhelp-backend"
MQTT_PASSWORD="your-password"
```

Optional DNS record for readability:

```text
mqtt.your-domain.com -> CNAME -> your-cluster-id.hivemq.cloud
Cloudflare proxy: DNS Only
```

Firmware example:

```cpp
#define HIVEMQ_HOST "your-cluster-id.hivemq.cloud"
#define HIVEMQ_PORT 8883
```

### Option C: Self-Hosted Mosquitto + TLS

Use this only when you have a VPS and need your own broker.

```bash
sudo apt install mosquitto mosquitto-clients
sudo mosquitto_passwd -c /etc/mosquitto/passwd fallhelp-backend
sudo mosquitto_passwd /etc/mosquitto/passwd fallhelp-esp32
```

Example Mosquitto TLS config:

```text
listener 8883
certfile /etc/letsencrypt/live/mqtt.your-domain.com/fullchain.pem
keyfile /etc/letsencrypt/live/mqtt.your-domain.com/privkey.pem
allow_anonymous false
password_file /etc/mosquitto/passwd
```

---

## 6. Run Backend, Admin, And Mobile

### Mode A: Local Terminal

From repo root:

```bash
npm run install:all
npm run platform:check
npm run dev:all
```

This starts:

| Service | URL |
| ------- | --- |
| Backend API | `http://localhost:3000` |
| Mobile Expo | `http://localhost:8081` |
| Admin panel | `http://localhost:5173` |

Use narrower launchers when useful:

```bash
npm run dev:backend-mobile
npm run dev:backend-admin
npm run dev:stop
```

### Mode B: Docker Backend + Admin

PostgreSQL and MQTT still run outside Docker unless you intentionally host them elsewhere.

```bash
docker compose up -d --build --pull always
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Admin defaults to `http://localhost:5173` and calls `http://localhost:3000/api` unless `ADMIN_VITE_API_URL` is overridden before build.

Useful Docker commands:

| Command | Purpose |
| ------- | ------- |
| `docker compose logs -f backend` | Follow backend logs |
| `docker compose logs -f admin` | Follow admin logs |
| `docker compose down` | Stop containers |
| `docker compose down -v` | Stop containers and remove volumes |
| `docker builder prune -f` | Clear unused build cache |
| `docker image prune -f` | Clear dangling images |

### Mode C: Docker + Cloudflare Named Tunnel

Set these values in `apps/backend-api/.env`:

```env
TUNNEL_TOKEN="your-cloudflare-named-tunnel-token"
TUNNEL_PUBLIC_HOSTNAME="api.your-domain.com"
TUNNEL_ORIGIN_URL="http://backend:3000"
ADMIN_VITE_API_URL="https://api.your-domain.com/api"
FRONTEND_URL="https://your-mobile-or-web-origin.example"
ADMIN_URL="https://admin.your-domain.com"
```

Start backend, admin, and tunnel profile:

```bash
docker compose --env-file apps/backend-api/.env --profile tunnel up -d --build --pull always
docker compose logs -f tunnel
```

The tunnel container forwards to `http://backend:3000` inside the Docker network. Do not use `localhost` as the tunnel origin from inside the tunnel container.

---

## 7. Optional: Cloudflared CLI Tunnel

Use this only if you prefer installing `cloudflared` on the host instead of the Docker profile.

Install and authenticate:

```bash
cloudflared tunnel login
cloudflared tunnel create fallhelp
```

Example `~/.cloudflared/config.yml`:

```yaml
tunnel: a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx
credentials-file: /home/tawan/.cloudflared/a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

ingress:
  - hostname: api.your-domain.com
    service: http://localhost:3000
  - hostname: admin.your-domain.com
    service: http://localhost:5173
  - service: http_status:404
```

Create DNS routes:

```bash
cloudflared tunnel route dns fallhelp api.your-domain.com
cloudflared tunnel route dns fallhelp admin.your-domain.com
```

Run for testing:

```bash
cloudflared tunnel run fallhelp
```

Install as a Linux service if needed:

```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## 8. Verify The Deployment

### Backend Health

```bash
curl http://localhost:3000/internal/health
```

Tunnel mode:

```bash
curl https://api.your-domain.com/internal/health
```

Expected response includes `status: ok`.

### MQTT

```bash
npm run mqtt:check
```

For verbose MQTT observation:

```bash
npm run mqtt:monitor:local
```

### Admin

Open one of these:

- Local terminal / Docker: `http://localhost:5173`
- Tunnel: `https://admin.your-domain.com`

### Simulator Helpers

Simulator scripts are active QA/development helpers. They do not replace firmware validation.

```bash
npm run iot:sim-fall
npm run iot:sim-fall -- --cancel
npm run sim:events --prefix apps/backend-api
npm run sim:push --prefix apps/backend-api
```

See [Simulator Guide](../testing/simulator-guide.md) for exact behavior and safety notes.

---

## 9. Optional: Sensor Lab Node-RED

The Fall Detection Sensor Lab is for sensor workflow testing and labeled activity data collection. It is independent from the active backend/admin/mobile runtime.

```bash
npm run sensor-lab -- node-red up
```

Dashboard UI: `http://localhost:1880/ui`

To validate and summarize collected files:

```bash
npm run sensor-lab -- validate
npm run sensor-lab -- summarize
npm run sensor-lab -- chapters
npm run sensor-lab -- all
```

---

## 10. Mobile UAT Build

Use EAS Build for Android APK/AAB generation.

```bash
cd apps/mobile
npm exec eas login
npm exec eas build --profile preview --platform android
```

For preview/UAT, point the mobile app to the reachable backend URL. Prefer environment configuration when available instead of hardcoding values.

```bash
npm exec eas env:create --name EXPO_PUBLIC_API_URL --value https://api.your-domain.com --environment preview
```

Use project-local Expo/EAS commands. Do not install global Expo tooling just for this project.

---

## 11. Production Notes

These notes are not required for local development.

### Admin Static Hosting

Cloudflare Pages is suitable for the admin static build:

```bash
cd apps/admin
npm run build
npx wrangler pages deploy dist --project-name=fallhelp-admin
```

### Backend Process Manager

If you deploy backend directly on a server instead of Docker:

```bash
cd apps/backend-api
npm run build
pm2 start dist/server.js --name fallhelp-api
pm2 logs fallhelp-api
```

### Nginx Alternative

Use Nginx only when you are not using Cloudflare Tunnel.

```nginx
server {
    listen 443 ssl;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

---

## 12. Security Checklist

- Use a strong `JWT_SECRET` with at least 32 characters.
- Keep `JWT_EXPIRES_IN="7d"` unless the product explicitly changes the auth policy.
- Use HTTPS for public API/admin access.
- Keep rate limiting enabled in the backend.
- Do not commit `.env`, `.env.production`, firmware secrets, tunnel tokens, or database passwords.
- MQTT must use TLS (`mqtts://`, port 8883) for internet-facing deployments.
- Back up PostgreSQL before production-like demos or destructive database resets.

---

## Related Docs

- [Cross-Platform Development](cross-platform-development.md)
- [API Verification](api-verification.md)
- [Simulator Guide](../testing/simulator-guide.md)
- [Project Structure](../architecture/project-structure.md)
- [Backend AI Context](../ai/backend.md)
