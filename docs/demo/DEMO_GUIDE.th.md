# คู่มือ Demo

[English](DEMO_GUIDE.md) · [ภาษาไทย](DEMO_GUIDE.th.md)

โชว์ flow แจ้งเตือนการหกล้มครบทั้งระบบโดยไม่ต้องใช้ ESP32: web simulator ทำหน้าที่แทนอุปกรณ์ laptop รัน backend และมือถือรัน preview APK

## 1. ติดตั้งครั้งแรก

1. รัน PostgreSQL บนเครื่อง และตั้งค่า `apps/backend-api/.env` แล้ว (`npm run env:setup`)
2. เพิ่ม `DEMO_PASSWORD=<อย่างน้อย 8 ตัวอักษร>` ใน `apps/backend-api/.env` ด้วยตัวเอง
3. ติดตั้ง Mosquitto และเพิ่มโฟลเดอร์ลง PATH (คำสั่ง `mosquitto -h` ต้องทำงานได้)
4. ตั้งค่า Cloudflare Tunnel: [cloudflare-tunnel.md](cloudflare-tunnel.md)
5. `npm install` และ `npm run backend:db:setup`
6. ติดตั้ง APK จาก [Releases](https://github.com/Wattanaroj2567/fallhelp/releases/latest) บนมือถือ

## 2. ก่อนนำเสนอทุกครั้ง

1. หยุด Mosquitto service ของ Windows (PowerShell แบบ admin): `net stop mosquitto`
2. รีเซ็ตข้อมูล demo: `npm run backend:db:seed:demo`
3. Terminal 1: `cloudflared tunnel run fallhelp-demo`
4. Terminal 2: `npm run demo:up`
5. เปิด simulator: <http://127.0.0.1:5175> จุดสถานะต้องเป็นสีเขียว
6. บนมือถือ: login ด้วย `demo@fallhelp.app` และ `DEMO_PASSWORD` ที่ตั้งไว้ → เข้า dashboard

## 3. ลำดับการนำเสนอ

1. กด **Online** → dashboard แสดงว่าอุปกรณ์ออนไลน์
2. ติ๊ก **Auto-send every 5 s** แล้วเลื่อน slider BPM → ชีพจรอัปเดตแบบ real-time
3. กด **Simulate Fall** → มือถือแสดงการแจ้งเตือนฉุกเฉินและ push notification
4. ผู้ดูแลกด**รับทราบ (Acknowledge)** บนมือถือ **หรือ** กด **Acknowledge on device** ภายใน 15 วินาที (ผู้สวมใส่ยกเลิกจากอุปกรณ์เพราะแจ้งเตือนผิดพลาด) → event แสดงว่าถูกยกเลิก
5. รอ countdown 30 วินาทีก่อนกด fall ครั้งต่อไป (backend ไม่รับ fall ซ้ำภายใน 30 วินาที)

## 4. แก้ปัญหา

| อาการ | วิธีแก้ |
|---|---|
| `demo:up` แจ้งว่า port 1883 ถูกใช้อยู่ | `net stop mosquitto` (PowerShell แบบ admin) |
| จุดสถานะใน simulator ไม่เป็นสีเขียว | Mosquitto ไม่ได้เปิดด้วย demo config ดูบรรทัด `[MQTT]` ของ `demo:up` |
| มือถือเชื่อมต่อไม่ได้ หรือ login ไม่ผ่าน | Tunnel ไม่ได้รัน ลองเปิด `https://api.tawanlab.site/internal/health` บนมือถือ |
| Login ได้แต่ไปค้างที่หน้า setup | รัน `npm run backend:db:seed:demo` ใหม่ แล้ว logout และ login อีกครั้ง |
| กด Fall แล้วมือถือไม่มีอะไรขึ้น | Serial ใน simulator ต้องเป็น `ESP32-DE5000000001` และดู log `[API]` ว่ามีคำว่า "FALL" |
| ไม่มี push notification | อนุญาตการแจ้งเตือนของ FallHelp บนมือถือ การแจ้งเตือนในแอปยังขึ้นผ่าน Socket.io |

## 5. หลังนำเสนอ

กด `Ctrl+C` ในทั้งสอง terminal แล้วรัน `net start mosquitto` ถ้าต้องการเปิด service กลับมา
