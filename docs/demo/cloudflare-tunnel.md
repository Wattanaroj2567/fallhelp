# Cloudflare Tunnel for the demo API

Exposes the backend on your laptop (`http://localhost:3000`) as `https://api.tawanlab.site`, which is the API URL baked into the preview APK. Works on any network the phone uses (Wi-Fi or 4G). The MQTT broker is **not** exposed.

## One-time setup

1. Install `cloudflared` (check: `cloudflared --version`).
2. Log in and pick the `tawanlab.site` zone:

   ```powershell
   cloudflared tunnel login
   ```

3. Create the tunnel:

   ```powershell
   cloudflared tunnel create fallhelp-demo
   ```

   Note the tunnel ID and the credentials file path it prints.
4. Point the hostname at the tunnel. If `api.tawanlab.site` already has a DNS record, this replaces it:

   ```powershell
   cloudflared tunnel route dns --overwrite-dns fallhelp-demo api.tawanlab.site
   ```

5. Create `%USERPROFILE%\.cloudflared\config.yml`:

   ```yaml
   tunnel: fallhelp-demo
   credentials-file: C:\Users\<you>\.cloudflared\<TUNNEL-ID>.json
   ingress:
     - hostname: api.tawanlab.site
       service: http://localhost:3000
     - service: http_status:404
   ```

## Every demo

```powershell
cloudflared tunnel run fallhelp-demo
```

Check: open `https://api.tawanlab.site/internal/health` in a phone browser. Socket.io (WebSocket) is proxied automatically.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `502 Bad Gateway` | Backend not running: start `npm run demo:up`. |
| DNS error on the phone | Wait 1–2 min after `route dns`; check the CNAME in the Cloudflare dashboard. |
| App logs in but no realtime updates | Ensure WebSockets are enabled for the zone (Cloudflare dashboard → Network → WebSockets: On). |
