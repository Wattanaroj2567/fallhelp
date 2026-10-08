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
4. เปิด simulator: <http://127.0.0.1:5175> (เปิดเต็มจอจะเห็นชัดบนโปรเจกเตอร์) ป้าย **Broker** ต้องเป็นสีเขียว
5. บนมือถือ: login ด้วย `demo@fallhelp.app` และ `DEMO_PASSWORD` ที่ตั้งไว้ → เข้า dashboard

## 3. ลำดับการนำเสนอ

simulator เปิดมาเป็นภาษาไทย (สลับเป็นอังกฤษได้ที่ปุ่ม **EN** บน header)

1. กด **เปิดอุปกรณ์** → dashboard บนมือถือแสดงว่าอุปกรณ์ออนไลน์ simulator ส่ง status ซ้ำทุก 5 วินาทีเหมือนอุปกรณ์จริง
2. ชีพจรเริ่มส่งอัตโนมัติ (ทุก 5 วินาที ค่าขยับไม่กี่ BPM รอบ 75 BPM ขณะพัก เหมือนเซนเซอร์หนีบหู) → มือถืออัปเดตแบบ real-time ถ้าจะโชว์ชีพจรผิดปกติ กด **สูง** (~125) หรือ **ต่ำ** (~50) ค่าจะค่อยๆ ไต่ขึ้นหรือลงทีละไม่กี่ BPM ต่อรอบ และแอปแสดงว่าสูงหรือต่ำกว่าปกติ กด **ปกติ** เพื่อกลับสู่ปกติ
3. กด **จำลองการล้ม** → วงเปลี่ยนเป็นสีเหลืองอำพันและนับถอยหลังช่วงยกเลิก 15 วินาทีของอุปกรณ์ ถึง 0 จะเป็นสีแดง (**ยืนยันการล้ม — ส่งแจ้งเตือนแล้ว**) มือถือแสดงการแจ้งเตือนฉุกเฉินและ push notification และชีพจรจะสูงขึ้นประมาณ 1 นาที ผู้ดูแลกด**รับทราบ (Acknowledge)** ในแอป
4. ถ้าจะโชว์กรณีแจ้งเตือนผิดพลาด: กด **จำลองการล้ม** แล้วกด **ยกเลิกที่อุปกรณ์** ขณะวงยังเป็นสีเหลืองอำพัน → ไม่มีการแจ้งเตือน และประวัติแสดง event ที่ถูกยกเลิก
5. ก่อนล้มครั้งถัดไป รอให้วงกลับเป็น **พร้อม** (วงนับช่วงพักที่ backend กันเหตุการณ์ซ้ำ)

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
