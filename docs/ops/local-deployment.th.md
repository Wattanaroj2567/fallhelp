# คู่มือ Local Deployment

[English](local-deployment.md) · [ภาษาไทย](local-deployment.th.md)

## ข้อมูลเอกสาร

- ผู้อ่าน: Backend/DevOps, QA
- Source of Truth: [apps/backend-api/](../../apps/backend-api), [docker-compose.yml](../../docker-compose.yml), [apps/backend-api/.env.example](../../apps/backend-api/.env.example)
- สถานะ: Active
- อัปเดตล่าสุด: 20 มิถุนายน 2026

---

## ภาพรวม

runbook นี้อธิบายวิธีรัน FallHelp บนเครื่อง local หรือสำหรับ UAT ตามโครงสร้าง monorepo ปัจจุบัน ครอบคลุม Backend API, Admin panel, PostgreSQL, MQTT, Cloudflare Tunnel (ไม่บังคับ) และการตั้งค่า API ของแอป mobile

ถ้าต้องการ quick start แบบสั้น ให้ดู [README](../../README.th.md) ที่ root ส่วนไฟล์นี้ใช้เมื่อต้องการขั้นตอนการตั้งค่าแบบละเอียดทีละขั้น

---

## รูปแบบการ Deploy

```text
Mobile App / Admin Browser
  -> Backend API (localhost:3000 or HTTPS tunnel hostname)
      -> PostgreSQL
      -> MQTT broker (local Mosquitto or HiveMQ Cloud)
      -> Socket.io / Expo Push side effects

ESP32
  -> MQTT broker directly
```

สำหรับ UAT ผ่าน Cloudflare Tunnel:

```text
Mobile App / Browser
  -> Cloudflare HTTPS hostname
      -> cloudflared tunnel
          -> backend container/service

ESP32
  -> MQTT broker directly (MQTT is not proxied through Cloudflare)
```

MQTT ไม่ใช่ HTTP จึงห้ามนำ traffic MQTT ของ ESP32 ไปไว้หลัง Cloudflare proxy แบบปกติ ให้ใช้ Mosquitto บน LAN, HiveMQ Cloud หรือ MQTT broker ที่ self-host เองพร้อม TLS

---

## 1. เลือกโหมดการรัน

| โหมด | ใช้เมื่อ | คำสั่งหลัก |
| ---- | -------- | ------------ |
| Local terminal | ต้องการ hot reload และ debug บนเครื่องโดยตรง | `npm run dev:all` |
| Docker backend/admin | ต้องการรัน backend + admin ใน container โดยที่ PostgreSQL/MQTT รันนอก Docker | `docker compose up -d --build --pull always` |
| Docker + Cloudflare Tunnel | ต้องการ endpoint HTTPS สาธารณะ/UAT โดยไม่ต้องเปิด port ที่ router | `docker compose --env-file apps/backend-api/.env --profile tunnel up -d --build --pull always` |
| Sensor Lab | ต้องการ dashboard Node-RED สำหรับทดสอบ workflow ของ sensor และเก็บข้อมูลแบบมี label | `npm run sensor-lab -- node-red up` |

ส่วนที่เหลือของคู่มือนี้จะพาตั้งค่าตามลำดับที่ควรทำ

---

## 2. สิ่งที่ต้องมีก่อน

จำเป็นสำหรับทุกโหมด:

- Node.js 24.x
- npm 11.x ตาม baseline ของ package manager ในโปรเจกต์
- PostgreSQL 18.x
- MQTT broker: Mosquitto บนเครื่อง, HiveMQ Cloud หรือ MQTT ที่ self-host
- Git

จำเป็นเฉพาะบางโหมด:

| สิ่งที่ต้องการ | ข้อกำหนด |
| ---- | ----------- |
| โหมด Docker | Docker Desktop หรือ Docker Engine พร้อม Compose v2 |
| โหมด Tunnel | บัญชี Cloudflare + Named Tunnel token |
| Build แอป mobile | บัญชี Expo + EAS CLI ระดับโปรเจกต์ผ่าน `npm exec eas` |
| อัปโหลด firmware | Arduino IDE หรือ `arduino-cli` พร้อม ESP32 core และ library ที่จำเป็น |

---

## 3. เตรียมไฟล์ Environment

จาก root ของ repo:

```bash
npm run env:setup
```

คำสั่งนี้จะคัดลอก template สำหรับ local และพยายาม link `.env` ที่ root ไปยัง `apps/backend-api/.env` เพื่อให้ Docker Compose อ่านค่าของ backend ได้อัตโนมัติ ถ้า OS ของคุณสร้าง symlink ไม่ได้ ให้รันคำสั่ง Docker พร้อม `--env-file apps/backend-api/.env`

แก้ไข `apps/backend-api/.env` ก่อน ค่าที่สำคัญที่สุดคือ:

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

ห้าม commit ไฟล์ `.env` จริงหรือ credential ของ production

---

## 4. ตั้งค่า PostgreSQL

สร้าง database ให้ตรงกับ `DATABASE_URL` และ `DATABASE_URL_DOCKER` แล้วรัน:

```bash
npm run backend:db:setup
npm run backend:db:verify
```

ในโหมด Docker สามารถรัน migration และ seed ภายใน backend container หลัง `docker compose up` ได้เช่นกัน:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

สำหรับการตั้งค่า local ในงานประจำวัน ให้ใช้ script ที่ root เพราะมีการตรวจสอบ platform ของ workspace รวมอยู่ด้วย

---

## 5. ตั้งค่า MQTT

เลือก broker เพียงหนึ่งตัวเลือก

### ตัวเลือก A: Mosquitto บนเครื่อง (Dev/Lab)

Mosquitto รันเป็น native service บนเครื่อง host

Windows PowerShell แบบ Administrator:

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

ใช้ค่า env เหล่านี้:

```env
MQTT_BROKER_URL="mqtt://localhost:1883"
MQTT_BROKER_URL_DOCKER="mqtt://host.docker.internal:1883"
MQTT_USERNAME=""
MQTT_PASSWORD=""
```

สำหรับ ESP32 บน LAN ให้ตั้ง MQTT host ใน firmware เป็น LAN IP ของเครื่อง host ไม่ใช่ `localhost`

เปิด firewall สำหรับ MQTT บนเครื่อง ถ้า ESP32 เชื่อมต่อผ่าน LAN:

```powershell
New-NetFirewallRule -DisplayName "Mosquitto MQTT" -Direction Inbound -Protocol TCP -LocalPort 1883 -RemoteAddress LocalSubnet -Action Allow
```

```bash
sudo ufw allow from 192.168.0.0/16 to any port 1883
```

### ตัวเลือก B: HiveMQ Cloud (UAT)

ใช้เมื่อต้องการให้ ESP32 เชื่อมต่อผ่านอินเทอร์เน็ตด้วย TLS

1. สร้าง Serverless Cluster ที่ [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/)
2. สร้าง credential สำหรับ backend/ESP32
3. ตั้งค่า env ของ backend:

```env
MQTT_BROKER_URL="mqtts://your-cluster-id.hivemq.cloud:8883"
MQTT_BROKER_URL_DOCKER="mqtts://your-cluster-id.hivemq.cloud:8883"
MQTT_USERNAME="fallhelp-backend"
MQTT_PASSWORD="your-password"
```

DNS record เสริม (ไม่บังคับ) เพื่อให้อ่านง่าย:

```text
mqtt.your-domain.com -> CNAME -> your-cluster-id.hivemq.cloud
Cloudflare proxy: DNS Only
```

ตัวอย่างใน firmware:

```cpp
#define HIVEMQ_HOST "your-cluster-id.hivemq.cloud"
#define HIVEMQ_PORT 8883
```

### ตัวเลือก C: Mosquitto แบบ Self-Hosted + TLS

ใช้เฉพาะเมื่อมี VPS และต้องการ broker ของตัวเอง

```bash
sudo apt install mosquitto mosquitto-clients
sudo mosquitto_passwd -c /etc/mosquitto/passwd fallhelp-backend
sudo mosquitto_passwd /etc/mosquitto/passwd fallhelp-esp32
```

ตัวอย่าง config TLS ของ Mosquitto:

```text
listener 8883
certfile /etc/letsencrypt/live/mqtt.your-domain.com/fullchain.pem
keyfile /etc/letsencrypt/live/mqtt.your-domain.com/privkey.pem
allow_anonymous false
password_file /etc/mosquitto/passwd
```

---

## 6. รัน Backend, Admin และ Mobile

### โหมด A: Local Terminal

จาก root ของ repo:

```bash
npm run install:all
npm run platform:check
npm run dev:all
```

คำสั่งนี้จะเริ่ม:

| Service | URL |
| ------- | --- |
| Backend API | `http://localhost:3000` |
| Mobile Expo | `http://localhost:8081` |
| Admin panel | `http://localhost:5173` |

ใช้ launcher ที่แคบลงเมื่อเหมาะสม:

```bash
npm run dev:backend-mobile
npm run dev:backend-admin
npm run dev:stop
```

### โหมด B: Docker Backend + Admin

PostgreSQL และ MQTT ยังคงรันนอก Docker เว้นแต่คุณตั้งใจ host ไว้ที่อื่น

```bash
docker compose up -d --build --pull always
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Admin ใช้ค่าเริ่มต้นเป็น `http://localhost:5173` และเรียก `http://localhost:3000/api` เว้นแต่จะ override `ADMIN_VITE_API_URL` ก่อน build

คำสั่ง Docker ที่มีประโยชน์:

| คำสั่ง | วัตถุประสงค์ |
| ------- | ------- |
| `docker compose logs -f backend` | ติดตาม log ของ backend |
| `docker compose logs -f admin` | ติดตาม log ของ admin |
| `docker compose down` | หยุด container |
| `docker compose down -v` | หยุด container และลบ volume |
| `docker builder prune -f` | ล้าง build cache ที่ไม่ได้ใช้ |
| `docker image prune -f` | ล้าง dangling image |

### โหมด C: Docker + Cloudflare Named Tunnel

ตั้งค่าเหล่านี้ใน `apps/backend-api/.env`:

```env
TUNNEL_TOKEN="your-cloudflare-named-tunnel-token"
TUNNEL_PUBLIC_HOSTNAME="api.your-domain.com"
TUNNEL_ORIGIN_URL="http://backend:3000"
ADMIN_VITE_API_URL="https://api.your-domain.com/api"
FRONTEND_URL="https://your-mobile-or-web-origin.example"
ADMIN_URL="https://admin.your-domain.com"
```

เริ่ม backend, admin และ profile tunnel:

```bash
docker compose --env-file apps/backend-api/.env --profile tunnel up -d --build --pull always
docker compose logs -f tunnel
```

tunnel container จะ forward ไปยัง `http://backend:3000` ภายใน Docker network ห้ามใช้ `localhost` เป็น tunnel origin จากภายใน tunnel container

---

## 7. ไม่บังคับ: Tunnel ผ่าน Cloudflared CLI

ใช้เฉพาะเมื่อคุณต้องการติดตั้ง `cloudflared` บนเครื่อง host แทนการใช้ Docker profile

ติดตั้งและยืนยันตัวตน:

```bash
cloudflared tunnel login
cloudflared tunnel create fallhelp
```

ตัวอย่าง `~/.cloudflared/config.yml`:

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

สร้าง DNS route:

```bash
cloudflared tunnel route dns fallhelp api.your-domain.com
cloudflared tunnel route dns fallhelp admin.your-domain.com
```

รันเพื่อทดสอบ:

```bash
cloudflared tunnel run fallhelp
```

ติดตั้งเป็น Linux service ถ้าจำเป็น:

```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## 8. ตรวจสอบการ Deploy

### Health ของ Backend

```bash
curl http://localhost:3000/internal/health
```

โหมด Tunnel:

```bash
curl https://api.your-domain.com/internal/health
```

response ที่คาดหวังต้องมี `status: ok`

### MQTT

```bash
npm run mqtt:check
```

สำหรับการสังเกต MQTT แบบละเอียด:

```bash
npm run mqtt:monitor:local
```

### Admin

เปิดอย่างใดอย่างหนึ่งต่อไปนี้:

- Local terminal / Docker: `http://localhost:5173`
- Tunnel: `https://admin.your-domain.com`

### Simulator Helpers

simulator script เป็นเครื่องมือช่วยสำหรับ QA/development ที่ยังใช้งานอยู่ แต่ไม่ได้ใช้แทนการ validate firmware

```bash
npm run iot:sim-fall
npm run iot:sim-fall -- --cancel
npm run sim:events --prefix apps/backend-api
npm run sim:push --prefix apps/backend-api
```

ดูพฤติกรรมที่แน่นอนและข้อควรระวังด้านความปลอดภัยได้ที่ [Simulator Guide](../testing/simulator-guide.th.md)

---

## 9. ไม่บังคับ: Sensor Lab Node-RED

Fall Detection Sensor Lab ใช้สำหรับทดสอบ workflow ของ sensor และเก็บข้อมูลกิจกรรมแบบมี label โดยแยกอิสระจาก runtime ของ backend/admin/mobile ที่ใช้งานจริง

```bash
npm run sensor-lab -- node-red up
```

Dashboard UI: `http://localhost:1880/ui`

เพื่อ validate และสรุปไฟล์ที่เก็บมา:

```bash
npm run sensor-lab -- validate
npm run sensor-lab -- summarize
npm run sensor-lab -- chapters
npm run sensor-lab -- all
```

---

## 10. Build แอป Mobile สำหรับ UAT

ใช้ EAS Build เพื่อสร้าง Android APK/AAB

```bash
cd apps/mobile
npm exec eas login
npm exec eas build --profile preview --platform android
```

สำหรับ preview/UAT ให้ชี้แอป mobile ไปยัง backend URL ที่เข้าถึงได้ ควรใช้การตั้งค่าผ่าน environment เมื่อทำได้ แทนการ hardcode ค่า

```bash
npm exec eas env:create --name EXPO_PUBLIC_API_URL --value https://api.your-domain.com --environment preview
```

ใช้คำสั่ง Expo/EAS ระดับโปรเจกต์ ไม่ต้องติดตั้ง Expo tooling แบบ global เพียงเพื่อโปรเจกต์นี้

---

## 11. หมายเหตุสำหรับ Production

หมายเหตุเหล่านี้ไม่จำเป็นสำหรับการพัฒนาบนเครื่อง local

### Static Hosting ของ Admin

Cloudflare Pages เหมาะสำหรับ static build ของ admin:

```bash
cd apps/admin
npm run build
npx wrangler pages deploy dist --project-name=fallhelp-admin
```

### Process Manager ของ Backend

ถ้าคุณ deploy backend ลงบน server โดยตรงแทนการใช้ Docker:

```bash
cd apps/backend-api
npm run build
pm2 start dist/server.js --name fallhelp-api
pm2 logs fallhelp-api
```

### ทางเลือก Nginx

ใช้ Nginx เฉพาะเมื่อไม่ได้ใช้ Cloudflare Tunnel

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

- ใช้ `JWT_SECRET` ที่แข็งแรง ยาวอย่างน้อย 32 ตัวอักษร
- คง `JWT_EXPIRES_IN="7d"` ไว้ เว้นแต่ผลิตภัณฑ์จะเปลี่ยนนโยบาย auth อย่างชัดเจน
- ใช้ HTTPS สำหรับการเข้าถึง API/admin แบบสาธารณะ
- เปิด rate limiting ใน backend ไว้เสมอ
- ห้าม commit `.env`, `.env.production`, firmware secret, tunnel token หรือรหัสผ่าน database
- MQTT ต้องใช้ TLS (`mqtts://`, port 8883) สำหรับการ deploy ที่เปิดสู่อินเทอร์เน็ต
- สำรองข้อมูล PostgreSQL ก่อนการ demo ที่ใกล้เคียง production หรือก่อน reset database แบบทำลายข้อมูล

---

## เอกสารที่เกี่ยวข้อง

- [Cross-Platform Development](cross-platform-development.th.md)
- [API Verification](api-verification.th.md)
- [Simulator Guide](../testing/simulator-guide.th.md)
- [Project Structure](../architecture/project-structure.th.md)
- [Backend AI Context](../ai/backend.md)
