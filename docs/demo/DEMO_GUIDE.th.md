# คู่มือ Demo

[English](DEMO_GUIDE.md) · [ภาษาไทย](DEMO_GUIDE.th.md)

โชว์ flow แจ้งเตือนการหกล้มครบทั้งระบบโดยไม่ต้องใช้ ESP32: web simulator ทำหน้าที่แทนอุปกรณ์ laptop รัน backend และมือถือรัน preview APK

## 1. ติดตั้งครั้งแรก

1. รัน PostgreSQL บนเครื่อง และตั้งค่า `apps/backend-api/.env` แล้ว (`npm run env:setup`)
2. ตั้ง `DEMO_PASSWORD` (อย่างน้อย 8 ตัวอักษร) ใน `apps/backend-api/.env` ดูตัวอย่างได้ที่ `apps/backend-api/.env.example` หัวข้อ `DEMO SEED`
3. ติดตั้ง Mosquitto และเพิ่มโฟลเดอร์ลง PATH (คำสั่ง `mosquitto -h` ต้องทำงานได้)
4. ตั้งค่า Cloudflare Tunnel: [cloudflare-tunnel.md](cloudflare-tunnel.md)
5. `npm install` และ `npm run backend:db:setup`
6. ติดตั้ง APK จาก [Releases](https://github.com/Wattanaroj2567/fallhelp/releases/latest) บนมือถือ

## 2. ก่อนนำเสนอทุกครั้ง

1. รีเซ็ตข้อมูล demo: `npm run backend:db:seed:demo`
2. Terminal 1: `npm run demo:up`
3. Terminal 2: `npm run demo:tunnel` (ต้องเปิด Docker Desktop ไว้)
4. เปิด simulator: <http://127.0.0.1:5175> จุดสถานะต้องเป็นสีเขียว
5. บนมือถือ: login ด้วย `demo@fallhelp.app` และ `DEMO_PASSWORD` ที่ตั้งไว้ → เข้า dashboard

## 3. ลำดับการนำเสนอ

1. กด **Online** → dashboard แสดงว่าอุปกรณ์ออนไลน์ (simulator ส่ง status ซ้ำทุก 5 วินาทีเหมือนอุปกรณ์จริง)
2. ติ๊ก **Auto-send every 5 s** แล้วเลื่อน slider BPM → ชีพจรอัปเดตแบบ real-time ถ้าเปลี่ยนเกิน 50 BPM ค่าจะขึ้นในรอบถัดไป (ประมาณ 5 วินาที) เพราะแอปข้ามค่าที่กระโดดครั้งเดียว
3. กด **Simulate Fall** → อุปกรณ์รายงานว่าสงสัยว่าหกล้ม และเริ่มนับช่วงยกเลิก 15 วินาที ครบ 15 วินาทีจะยืนยันการหกล้ม มือถือแสดงการแจ้งเตือนฉุกเฉินและ push notification ผู้ดูแลกด**รับทราบ (Acknowledge)** ในแอป
4. ถ้าจะโชว์กรณีแจ้งเตือนผิดพลาด: กด **Simulate Fall** แล้วกด **Cancel on device (false alarm)** ภายใน 15 วินาที → ไม่มีการแจ้งเตือน และประวัติแสดง event ที่ถูกยกเลิก
5. รอให้ countdown บนปุ่ม Fall หมดก่อนกดครั้งต่อไป (backend ไม่รับ fall ซ้ำในช่วงสั้นๆ)

## 4. แก้ปัญหา

| อาการ | วิธีแก้ |
|---|---|
| `demo:up` แจ้งว่า port 1884 ถูกใช้อยู่ | `demo:up` รอบก่อนยังรันอยู่ ปิดก่อน (Mosquitto service ที่ 1883 เปิดไว้ได้) |
| จุดสถานะใน simulator ไม่เป็นสีเขียว | Mosquitto ไม่ได้เปิดด้วย demo config ดูบรรทัด `[MQTT]` ของ `demo:up` |
| มือถือเชื่อมต่อไม่ได้ หรือ login ไม่ผ่าน | Tunnel ไม่ได้รัน ลองเปิด `https://api.tawanlab.site/internal/health` บนมือถือ |
| Login ได้แต่ไปค้างที่หน้า setup | รัน `npm run backend:db:seed:demo` ใหม่ แล้ว logout และ login อีกครั้ง |
| กด Fall แล้วมือถือไม่มีอะไรขึ้น | Serial ใน simulator ต้องเป็น `ESP32-DE5000000001` และดู log `[API]` ว่ามีคำว่า "FALL" |
| ไม่มี push notification | อนุญาตการแจ้งเตือนของ FallHelp บนมือถือ การแจ้งเตือนในแอปยังขึ้นผ่าน Socket.io |

## 5. หลังนำเสนอ

กด `Ctrl+C` ในทั้งสอง terminal แล้วรัน `net start mosquitto` ถ้าต้องการเปิด service กลับมา
