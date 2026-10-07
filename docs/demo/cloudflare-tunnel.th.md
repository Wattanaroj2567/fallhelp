# Cloudflare Tunnel สำหรับ demo API

[English](cloudflare-tunnel.md) · [ภาษาไทย](cloudflare-tunnel.th.md)

เปิด backend บนโน้ตบุ๊ก (`http://localhost:3000`) ออกสู่ภายนอกเป็น `https://api.tawanlab.site` ซึ่งเป็น API URL ที่ฝังไว้ใน preview APK ใช้ได้กับทุกเครือข่ายที่โทรศัพท์ต่ออยู่ (Wi-Fi หรือ 4G) ส่วน MQTT broker **ไม่ได้**ถูกเปิดออกไป (demo broker listen เฉพาะ `127.0.0.1`)

Demo ใช้ project tunnel `fallhelp-backend` ตัวเดิม (ตัวเดียวกับที่ `docker compose --profile tunnel` ใช้) โดย public hostname `api.tawanlab.site` จะ forward ไปที่ `http://backend:3000` และ `docker-compose.demo.yml` ทำให้ชื่อ `backend` resolve ไปที่เครื่อง host ดังนั้น tunnel จึงเข้าถึง backend ที่เปิดด้วย `npm run demo:up` ได้โดยไม่ต้องรัน backend ใน Docker

## ตั้งค่าครั้งแรก

1. ติดตั้ง Docker Desktop
2. ตั้งค่า `TUNNEL_TOKEN` ของ `fallhelp-backend` ใน `apps/backend-api/.env` (template: ส่วน `CLOUDFLARE TUNNEL` ใน `apps/backend-api/.env.example`) หาค่าได้จาก Cloudflare Zero Trust → Networks → Tunnels → `fallhelp-backend` → Configure

ไม่ต้องแก้ DNS หรือ dashboard ใดๆ

## ทุกครั้งที่ demo

เปิด `npm run demo:up` ก่อน แล้วในอีก terminal หนึ่งรัน:

```powershell
npm run demo:tunnel
```

รอจนเห็นบรรทัด `Registered tunnel connection` ครบสี่บรรทัด แล้วตรวจสอบด้วย:

```powershell
curl.exe -s -w "`nHTTP %{http_code}`n" https://api.tawanlab.site/internal/health
```

หยุดด้วย `Ctrl+C` แล้วรัน `docker compose --profile tunnel down` ส่วน Socket.io (WebSocket) จะถูก proxy ให้อัตโนมัติ

## การแก้ปัญหา

| อาการ | วิธีแก้ |
|---|---|
| `HTTP 502`, log แสดง `lookup backend ... no such host` | เปิดโดยไม่มี override ให้ใช้ `npm run demo:tunnel` แทน `docker compose --profile tunnel up` เปล่าๆ |
| `HTTP 502`, log แสดง `connection refused` | Backend ไม่ได้รันอยู่: เปิด `npm run demo:up` |
| `HTTP 530` / `error code: 1033` | Tunnel ไม่ได้เชื่อมต่อ: ตรวจ `TUNNEL_TOKEN` และ log ของ tunnel container |
| App login ได้แต่ไม่มี realtime updates | ตรวจว่าเปิด WebSockets ให้ zone แล้ว (Cloudflare dashboard → Network → WebSockets: On) |
