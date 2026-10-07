# Cloudflare Tunnel for the demo API

Exposes the backend on your laptop (`http://localhost:3000`) as `https://api.tawanlab.site`, which is the API URL baked into the preview APK. Works on any network the phone uses (Wi-Fi or 4G). The MQTT broker is **not** exposed (the demo broker only listens on `127.0.0.1`).

The demo reuses the project tunnel `fallhelp-backend` (the same one `docker compose --profile tunnel` uses). Its public hostname `api.tawanlab.site` forwards to `http://backend:3000`. `docker-compose.demo.yml` makes `backend` resolve to the host machine, so the tunnel reaches the backend started by `npm run demo:up` without running the backend in Docker.

## One-time setup

1. Docker Desktop installed.
2. `TUNNEL_TOKEN` for `fallhelp-backend` set in `apps/backend-api/.env` (template: `CLOUDFLARE TUNNEL` section of `apps/backend-api/.env.example`). Get it from Cloudflare Zero Trust → Networks → Tunnels → `fallhelp-backend` → Configure.

No DNS or dashboard changes are needed.

## Every demo

Start `npm run demo:up` first, then in another terminal:

```powershell
npm run demo:tunnel
```

Wait for four `Registered tunnel connection` lines, then check:

```powershell
curl.exe -s -w "`nHTTP %{http_code}`n" https://api.tawanlab.site/internal/health
```

Stop with `Ctrl+C`, then `docker compose --profile tunnel down`. Socket.io (WebSocket) is proxied automatically.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `HTTP 502`, log shows `lookup backend ... no such host` | Started without the override. Use `npm run demo:tunnel`, not plain `docker compose --profile tunnel up`. |
| `HTTP 502`, log shows `connection refused` | Backend not running: start `npm run demo:up`. |
| `HTTP 530` / `error code: 1033` | Tunnel not connected: check `TUNNEL_TOKEN` and the tunnel container log. |
| App logs in but no realtime updates | Ensure WebSockets are enabled for the zone (Cloudflare dashboard → Network → WebSockets: On). |
