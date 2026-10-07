# FallHelp

[English](README.md) · [ภาษาไทย](README.th.md)

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="./apps/mobile/assets/images/logoicon.png" alt="โลโก้แอป FallHelp" width="320" />
</p>
<!-- markdownlint-enable MD033 -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/Wattanaroj2567/fallhelp?include_prereleases)](https://github.com/Wattanaroj2567/fallhelp/releases/latest)

**ต้นแบบอุปกรณ์สวมใส่แบบคล้องคอสำหรับตรวจจับการหกล้ม คู่กับแอปมือถือสำหรับผู้ดูแล** ตรวจจับการหกล้มแบบ real-time ด้วยเซนเซอร์ IMU บันทึกอัตราการเต้นของหัวใจขณะล้มด้วยเซนเซอร์ PPG แบบหนีบหู แจ้งเตือนผ่าน push notification ทันที และมีช่วงเวลา 15 วินาทีให้ยกเลิกการแจ้งเตือนผิดพลาด

---

## ลองใช้งาน Demo

- 📱 **Android APK:** [ดาวน์โหลด preview build ล่าสุด](https://github.com/Wattanaroj2567/fallhelp/releases/latest)
- 🧪 **ไม่มีฮาร์ดแวร์?** [Device simulator](apps/device-simulator/README.th.md) ส่งข้อความ MQTT แบบเดียวกับอุปกรณ์จริง ดูขั้นตอนที่[คู่มือ Demo](docs/demo/DEMO_GUIDE.th.md)

---

## สารบัญ

- [ลองใช้งาน Demo](#ลองใช้งาน-demo)
- [ภาพรวม](#ภาพรวม)
- [สถานะโปรเจกต์](#สถานะโปรเจกต์)
- [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
- [ภาพหน้าจอ](#ภาพหน้าจอ)
- [ส่วนประกอบฮาร์ดแวร์](#ส่วนประกอบฮาร์ดแวร์)
- [ภาพรวมการเดินสายฮาร์ดแวร์](#ภาพรวมการเดินสายฮาร์ดแวร์)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [สิ่งที่ต้องเตรียม](#สิ่งที่ต้องเตรียม)
- [เริ่มต้นใช้งาน](#เริ่มต้นใช้งาน)
- [คำสั่งสำหรับพัฒนา](#คำสั่งสำหรับพัฒนา)
- [ตัวแปรสภาพแวดล้อม](#ตัวแปรสภาพแวดล้อม)
- [การทดสอบ](#การทดสอบ)
- [เอกสาร](#เอกสาร)
- [แนวทางการพัฒนา](#แนวทางการพัฒนา)
- [การมีส่วนร่วม](#การมีส่วนร่วม)
- [สัญญาอนุญาต](#สัญญาอนุญาต)
- [กิตติกรรมประกาศ](#กิตติกรรมประกาศ)

---

## ภาพรวม

FallHelp ตอบโจทย์ความปลอดภัยที่สำคัญของสังคมไทยซึ่งกำลังเข้าสู่สังคมสูงวัยอย่างรวดเร็ว การหกล้มของผู้สูงอายุส่วนใหญ่เกิดบนพื้นราบภายในบ้าน (ห้องน้ำ ห้องครัว บันได ห้องนั่งเล่น ห้องนอน) การล้มแต่ละครั้งอาจทำให้บาดเจ็บรุนแรง เช่น สะโพกหัก หรือศีรษะได้รับการกระทบกระเทือน จนผู้สูงอายุอาจกลายเป็นผู้ป่วยติดเตียง

ระบบประกอบด้วยอุปกรณ์สวมใส่ ESP32 แอปมือถือสำหรับผู้ดูแล และ admin panel:

**หลักการทำงาน:**

1. ผู้สูงอายุสวมอุปกรณ์ IoT แบบคล้องคอขณะอยู่ในบ้าน (ต้องอยู่ในพื้นที่ที่มี WiFi)
2. เซนเซอร์ MPU6050 ตรวจจับการหกล้มด้วย **Threshold-based Analysis** จากข้อมูล acceleration และ gyroscope
3. เมื่อสงสัยว่าเกิดการหกล้ม อุปกรณ์จะส่งเสียงเตือนและเปิด **ช่วงเวลายกเลิก 15 วินาที**
4. หากผู้สูงอายุกดปุ่มยกเลิกบนอุปกรณ์ภายใน 15 วินาที → ยกเลิกการแจ้งเตือนผิดพลาด
5. หากไม่ยกเลิก → backend ส่ง alert แบบ realtime ผ่าน Socket.io สร้างประวัติการแจ้งเตือน และส่ง Expo Push notification
6. ผู้ดูแลดูประวัติการหกล้ม รับการแจ้งเตือนการหกล้มที่ยืนยันแล้ว กด**รับทราบ (Acknowledge)** การแจ้งเตือนในแอป และโทรหาผู้ติดต่อฉุกเฉินได้โดยตรง

**ฟีเจอร์หลัก:**

- 🔴 ตรวจจับการหกล้มแบบ real-time (ล้มไปข้างหน้า ล้มไปข้างหลัง ล้มด้านข้าง ล้มจากเก้าอี้) ด้วย MPU6050 IMU
- 💓 บันทึกอัตราการเต้นของหัวใจขณะล้มด้วยเซนเซอร์ PPG XD-58C (ติดตั้งแบบ Easy Earclip) ค่า BPM จะแนบไปกับเหตุการณ์หกล้มและแสดงในรายงานรายเดือน
- 📱 แอปมือถือสำหรับผู้ดูแล (iOS และ Android) พร้อม dashboard แบบ real-time
- 🔔 แจ้งเตือนทันทีทั้ง push notification และในแอปเมื่อตรวจพบการหกล้ม (แนบค่า BPM ขณะล้มถ้ามี)
- 🛡️ ยกเลิกการแจ้งเตือนผิดพลาดได้ด้วยปุ่มบนอุปกรณ์**เท่านั้น** (ภายใน 15 วินาที) ผู้ดูแลกดรับทราบการแจ้งเตือนที่ยืนยันแล้วในแอป
- 📊 รายงานประวัติการหกล้มรายเดือนและสรุปเหตุการณ์
- 🌐 Admin panel สำหรับจัดการอุปกรณ์และดูแลการทำงานของระบบ

---

## สถานะโปรเจกต์

FallHelp เป็นต้นแบบจากโปรเจกต์จบการศึกษา (senior project) ที่ยังอยู่ระหว่างการพัฒนา ขอบเขตปัจจุบันเน้นการ deploy แบบ local/development ของอุปกรณ์สวมใส่ ESP32, backend API, แอปมือถือสำหรับผู้ดูแล และ admin dashboard

ข้อสังเกตสำคัญเกี่ยวกับขอบเขต:

- อัลกอริทึมตรวจจับการหกล้มเป็น workflow ต้นแบบแบบ threshold-based สำหรับการประเมินผลโปรเจกต์ ไม่ใช่อุปกรณ์การแพทย์ที่ได้รับการรับรอง
- ในเฟสปัจจุบัน บัญชีผู้ดูแลหนึ่งบัญชีจัดการโปรไฟล์ผู้สูงอายุได้หนึ่งคนและอุปกรณ์ที่จับคู่ได้หนึ่งเครื่อง
- การยกเลิกการแจ้งเตือนผิดพลาดทำได้เฉพาะผู้สวมใส่อุปกรณ์ โดยกดปุ่ม GPIO27 บนอุปกรณ์ภายใน 15 วินาที
- ผู้ดูแลกดรับทราบการแจ้งเตือนที่ยืนยันแล้วในแอป การรับทราบจะรีเซ็ตมุมมองในแอป แต่ไม่แก้ไขข้อมูลเหตุการณ์หกล้ม

---

## สถาปัตยกรรมระบบ

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="./docs/assets/readme/system-architecture.png" alt="แผนภาพสถาปัตยกรรมระบบ FallHelp" width="920" />
</p>
<!-- markdownlint-enable MD033 -->

FallHelp เชื่อมอุปกรณ์สวมใส่ ESP32, MQTT broker, Express backend, ฐานข้อมูล PostgreSQL, แอปมือถือสำหรับผู้ดูแล, push notification และ admin dashboard เข้าเป็น event pipeline เดียวกัน

**ลำดับการทำงานขณะรันระบบ:**

1. ESP32 publish สถานะอุปกรณ์และ event ตลอด lifecycle ของการหกล้มผ่าน MQTT
2. Backend ตรวจสอบ payload ที่เข้ามา บันทึกข้อมูล lifecycle ของการหกล้มลง PostgreSQL และส่งอัปเดตแบบ realtime ผ่าน Socket.io เมื่อการหกล้มได้รับการยืนยัน
3. ผู้ดูแลบนแอปมือถือได้รับ alert ในแอปแบบ realtime และ Expo Push notification
4. Admin dashboard จัดการข้อมูลอุปกรณ์และสถานะการจับคู่ผ่าน backend API

**Pipeline การตรวจจับการหกล้ม:**

```text
MPU6050 (Accelerometer + Gyroscope)
  -> Threshold-Based Analysis
    -> suspected_fall
      -> 15s cancel timeout
        |-- Button pressed (GPIO27, device wearer only) -> fall_cancelled
        `-- Timeout -> fall_confirmed -> MQTT publish -> Backend -> Alert caregivers
```

---

## ภาพหน้าจอ

<!-- markdownlint-disable MD033 -->
<details>
<summary>📸 ภาพหน้าจอ</summary>

<table>
  <tr>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_01_auth_login.jpg" width="220" alt="เข้าสู่ระบบ" /><br /><sub>เข้าสู่ระบบ</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_22_dashboard_online_normal_bpm.jpg" width="220" alt="Dashboard" /><br /><sub>Dashboard</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_23_dashboard_fall_alert.jpg" width="220" alt="แจ้งเตือนการหกล้ม" /><br /><sub>แจ้งเตือนการหกล้ม</sub></td>
  </tr>
  <tr>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_24_dashboard_fall_detail_modal.jpg" width="220" alt="รายละเอียดการหกล้ม" /><br /><sub>รายละเอียดการหกล้ม</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_26_history_event_list.jpg" width="220" alt="ประวัติ" /><br /><sub>ประวัติ</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_27_report_summary_with_data.jpg" width="220" alt="รายงานรายเดือน" /><br /><sub>รายงานรายเดือน</sub></td>
  </tr>
  <tr>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_11_setup_pairing_qr_scan.jpg" width="220" alt="จับคู่อุปกรณ์ (QR)" /><br /><sub>จับคู่อุปกรณ์ (QR)</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_36_device_info_online.jpg" width="220" alt="อุปกรณ์" /><br /><sub>อุปกรณ์</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_53_emergency_call_with_contacts.jpg" width="220" alt="โทรฉุกเฉิน" /><br /><sub>โทรฉุกเฉิน</sub></td>
  </tr>
</table>

ภาพทุกหน้าของแอป (58 หน้า) และ admin panel: [docs/SCREENSHOTS.th.md](docs/SCREENSHOTS.th.md)

</details>
<!-- markdownlint-enable MD033 -->

---

## ส่วนประกอบฮาร์ดแวร์

### ไมโครคอนโทรลเลอร์และเซนเซอร์

| ส่วนประกอบ | รุ่น | หน้าที่ |
| --------------- | ---------------------------------- | ------------------------------------------ |
| Microcontroller | ESP32-DevKitC V4 (ESP32-WROOM-32U) | หน่วยประมวลผลหลัก, WiFi, BLE |
| IMU Sensor | GY-521 MPU6050 | ตรวจจับการหกล้ม (Accelerometer + Gyroscope) |
| Pulse Sensor | XD-58C | วัดอัตราการเต้นของหัวใจ (PPG) |

### ระบบไฟฟ้า

| ส่วนประกอบ | รุ่น | หน้าที่ |
| --------------- | ----------------------- | -------------------------------------- |
| Battery | LiPo 3.7V 1200mAh | แหล่งพลังงานหลัก |
| Charging Module | TP4056 LiPo | ชาร์จผ่าน USB พร้อมไฟ LED แสดงสถานะ |
| Power Module | Step-Up Boost 3.7V → 5V | แปลงแรงดันสำหรับอุปกรณ์ที่ใช้ไฟ 5V |

### อุปกรณ์ต่อพ่วง

| ส่วนประกอบ | หน้าที่ |
| ------------------------------- | --------------------------------------- |
| Large Push Button Module | ยกเลิกการแจ้งเตือนผิดพลาด (ภายใน 15 วินาที) |
| Grove - Speaker | ส่งเสียงเตือนเมื่อตรวจพบการหกล้ม |
| Slide Switch SS12D00 G4 (3-Pin) | เปิด/ปิดอุปกรณ์ |
| Easy Earclip Mount | ยึดเซนเซอร์ PPG ที่ติ่งหูให้มั่นคง |
| PCB Circuit Board | รวมวงจรของส่วนประกอบทั้งหมด |
| Neck Strap | สายคล้องคอให้ผู้สูงอายุสวมใส่ได้ |

### อุปกรณ์ Passive และอุปกรณ์ป้องกัน

> อุปกรณ์กลุ่มนี้สำคัญต่อการ**ลดสัญญาณรบกวน (noise)** และ**ป้องกันความเสียหายของอุปกรณ์** bypass capacitor ช่วยกดแรงดันกระชาก (voltage spike) จาก power module แบบ switching ส่วน bulk capacitor ช่วยรักษาแรงดันของ rail ให้คงที่เมื่อโหลดเปลี่ยนกะทันหัน ตัวต้านทาน pull-down ป้องกันการ trigger ผิดพลาดจากสัญญาณลอย (floating) บนขา SIG ของ Grove - Speaker และวัสดุฉนวน/กาวช่วยป้องกัน PCB จากการลัดวงจรที่เกิดจากแบตเตอรี่ LiPo

| ส่วนประกอบ | ค่า / สเปก | ตำแหน่งติดตั้ง |
| ----------------------- | ------------------------ | -------------------------------------------------- |
| Electrolytic Capacitor | 1000 µF 16V | ใกล้ขา VIN / GND ของ ESP32 |
| Electrolytic Capacitor | 470 µF 16V | ใกล้ขา VCC ของ Grove - Speaker Module |
| Ceramic Capacitor (104) | 0.1 µF (100 nF) | Bypass — ใกล้ขา IC ของ ESP32, MPU6050 |
| Resistor | 10 kΩ | Pull-down จาก SIG ของ Grove - Speaker ลง GND |
| Kapton Tape | ฉนวนทนความร้อน | ติดบนผิว PCB ก่อนวางแบตเตอรี่ |
| Double-sided Tape | ตัวยึดแบบกาว | ยึดแบตเตอรี่ LiPo เข้ากับบอร์ด |

### ฮาร์ดแวร์สำหรับพัฒนาและทดสอบ

| ฮาร์ดแวร์ | สเปก |
| ----------- | ---------------------------------------------------------------------- |
| Dev Machine | Acer Nitro V 15, Intel i5-13420H, 32GB RAM, RTX 2050, Ubuntu 24.04 LTS |
| Test Phone | OPPO A31 2020, Android 9.0, 4GB RAM |

---

## ภาพรวมการเดินสายฮาร์ดแวร์

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="./docs/assets/readme/iot-device-wiring.png" alt="แผนภาพการเดินสายอุปกรณ์ IoT ของ FallHelp" width="860" />
</p>
<!-- markdownlint-enable MD033 -->

การเดินสายของอุปกรณ์ต้นแบบประกอบด้วย ESP32, MPU6050 IMU, เซนเซอร์ชีพจร XD-58C, Grove speaker module, ปุ่มยกเลิกที่ใช้ได้เฉพาะผู้สวมใส่, แบตเตอรี่ LiPo, charging module, step-up converter และอุปกรณ์รักษาเสถียรภาพ/ป้องกันวงจร

---

## เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Backend** | Node.js 24, Express v5.2, TypeScript 6.x |
| **Database** | PostgreSQL 18, Prisma ORM 7.8 |
| **Real-time** | MQTT (Mosquitto 2.x / HiveMQ Cloud), Socket.io 4.8 |
| **Mobile** | React Native 0.83.6, Expo SDK 55, Expo Router 55, NativeWind 4, TypeScript 5.9 ผ่าน Expo |
| **Admin** | React 19, Vite 7, TailwindCSS v4, Heroicons, sonner |
| **Firmware** | C++ บน Arduino IDE 2.x, ESP32-DevKitC V4 |
| **Fall Algorithm** | Threshold-Based Analysis (Accelerometer + Gyroscope) |
| **Auth** | JWT, เข้าสู่ระบบด้วยอีเมล/เบอร์โทรศัพท์, OTP ทางอีเมลสำหรับลืมรหัสผ่าน (ใช้ Resend เท่านั้น) |
| **Push** | Expo Push Notifications |
| **CI/CD** | GitHub Actions, Nx Cloud (remote cache + self-healing) |
| **Testing** | Jest, React Native Testing Library, Supertest |
| **Design** | Figma (UI/UX mockups) |

---

## โครงสร้างโปรเจกต์

```text
fallhelp/
├── apps/
│   ├── backend-api/   # Express v5 + Prisma backend, MQTT, Socket.io, push notifications
│   ├── mobile/        # Expo caregiver mobile app, BLE provisioning, realtime dashboard
│   ├── admin/         # Vite + React admin dashboard for device operations
│   └── device-simulator/ # Web device simulator for demos without hardware
├── firmware/esp32/    # ESP32 production firmware, sensor tuning, and sensor-lab workflow
├── docs/              # Architecture, feature docs, API docs, ops guides, AI context
├── scripts/           # Repo automation for dev, env, audit, Docker, IoT helpers
├── config/            # Shared infrastructure configuration
└── .agent/            # FallHelp-owned AI workflow skills and references
```

คู่มือ (runbook) ของแต่ละโมดูลอยู่ที่:

| ส่วน | ลิงก์ |
| -------- | ----------------------------------------- |
| Backend | [apps/backend-api/README.th.md](./apps/backend-api/README.th.md) |
| Mobile | [apps/mobile/README.th.md](./apps/mobile/README.th.md) |
| Admin | [apps/admin/README.th.md](./apps/admin/README.th.md) |
| Firmware | [firmware/esp32/README.th.md](./firmware/esp32/README.th.md) |
| สารบัญเอกสาร | [docs/README.th.md](./docs/README.th.md) |

---

## สิ่งที่ต้องเตรียม

| เครื่องมือ | เวอร์ชัน | หมายเหตุ |
| ------------ | ----------------------------- | ---------------------------------------- |
| Node.js | 24.x LTS | จำเป็นสำหรับทุก service |
| PostgreSQL | 18.x | |
| MQTT Broker | Mosquitto 2.x หรือ HiveMQ Cloud | ใช้รับส่ง event ระหว่าง backend กับอุปกรณ์ |
| Expo tooling | ติดตั้งในโปรเจกต์ | ใช้ `npx expo` หรือ `npm run mobile:start` |
| EAS CLI | ติดตั้งในโปรเจกต์ | ใช้ `cd apps/mobile && npm exec eas ...` |
| Arduino IDE | 2.x | สำหรับพัฒนา firmware ของ ESP32 |

> ควรใช้ CLI ที่ติดตั้งในโปรเจกต์เมื่อมี package นั้นอยู่ใน workspace หลีกเลี่ยงการติดตั้ง Expo/EAS แบบ global เพื่อให้ build ใช้เวอร์ชันเดียวกับที่โปรเจกต์กำหนดไว้

---

## เริ่มต้นใช้งาน

### เริ่มต้นอย่างรวดเร็ว

```bash
git clone https://github.com/Wattanaroj2567/fallhelp.git
cd fallhelp
npm run install:all
npm run env:setup
npm run platform:check
npm run dev:all
```

`npm run dev:all` จะตรวจสอบ install stamp ของ OS ปัจจุบันก่อน แล้วจึงเริ่ม Backend + Mobile + Admin พร้อมกัน

| Service | URL |
| ------------- | ----------------------- |
| Backend API | `http://localhost:3000` |
| Mobile (Expo) | `http://localhost:8081` |
| Admin Panel | `http://localhost:5173` |
| MQTT Broker | `mqtt://localhost:1883` |

### ตั้งค่าฐานข้อมูล

หลังตั้งค่าไฟล์ environment แล้ว ให้รันการตั้งค่าฐานข้อมูลของ backend:

```bash
npm run backend:db:setup
npm run backend:db:verify
```

### หมายเหตุสำหรับการสลับระบบปฏิบัติการ

หากสลับไปมาระหว่าง Windows, WSL/Ubuntu, macOS หรือ Linux ให้ติดตั้ง dependency ใหม่บน OS นั้นก่อนเสมอ ห้ามใช้ `node_modules` ร่วมกันข้ามระบบปฏิบัติการ

```bash
npm run install:all
npm run platform:check
```

### เส้นทางลัดด้วย Docker (ไม่บังคับ)

ใช้วิธีนี้เมื่อต้องการรัน backend/admin แบบ container แทนการรันทุกอย่างบนเครื่องโดยตรง:

```bash
docker compose up -d --build --pull always
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

หากต้องการใช้ Cloudflare named tunnel ด้วย ให้ตั้งค่า `TUNNEL_TOKEN`, `TUNNEL_PUBLIC_HOSTNAME` และ `TUNNEL_ORIGIN_URL` ใน `apps/backend-api/.env` แล้วรัน:

```bash
docker compose --env-file apps/backend-api/.env --profile tunnel up -d --build --pull always
docker compose logs -f tunnel
```

Mosquitto MQTT ควรรันเป็น native service ก่อนเริ่ม Docker container ดูรายละเอียดการตั้งค่าทั้งหมดได้ที่ [Local Deployment](docs/ops/local-deployment.th.md)

### Sensor Lab (ไม่บังคับ)

Fall Detection Sensor Lab ใช้ทดสอบ workflow ของเซนเซอร์และเก็บข้อมูลกิจกรรมที่ติด label แล้ว โดยแยกจาก runtime ของแอปที่ใช้งานจริง:

```bash
npm run sensor-lab -- node-red up
npm run sensor-lab -- all
```

Dashboard UI: `http://localhost:1880/ui`

---

## คำสั่งสำหรับพัฒนา

คำสั่งที่ใช้บ่อย (รันจาก root ของ repo):

| คำสั่ง | คำอธิบาย |
| ------- | ----------- |
| `npm run install:all` | ติดตั้งทุก workspace |
| `npm run env:setup` | สร้างไฟล์ env จาก template |
| `npm run backend:db:setup` | Migrate และ seed ฐานข้อมูล |
| `npm run dev:all` | เริ่ม backend, mobile และ admin |
| `npm run test:all` | รันเทสต์ทั้งหมด |
| `npm run demo:up` | เริ่ม demo stack (ไม่ต้องใช้ฮาร์ดแวร์) |

รายการคำสั่งทั้งหมด (backend, mobile, admin, firmware, sensor lab, การติดตั้งใหม่ข้ามแพลตฟอร์ม): [docs/ops/development-commands.th.md](docs/ops/development-commands.th.md)

---

## ตัวแปรสภาพแวดล้อม

สร้างไฟล์ environment จาก template ที่เตรียมไว้:

```bash
npm run env:setup
```

ไฟล์ secret ทุกไฟล์มี template ที่ commit ไว้พร้อมค่า placeholder ให้คัดลอก template แล้วใส่ค่าจริง และห้าม commit ไฟล์จริงเด็ดขาด:

| Template | คัดลอกไปที่ | ใช้โดย |
| -------- | ------- | ------- |
| `apps/backend-api/.env.example` | `apps/backend-api/.env` | Backend API, Prisma seeds (`ADMIN_*`, `DEMO_PASSWORD`) |
| `apps/mobile/.env.example` | `apps/mobile/.env` | แอปมือถือ (`EXPO_PUBLIC_*`) |
| `apps/admin/.env.example` | `apps/admin/.env` | Admin panel (`VITE_API_URL`) |
| `apps/device-simulator/.env.example` | `apps/device-simulator/.env` | Device simulator (ไม่บังคับ, `VITE_MQTT_WS_URL`) |
| `firmware/esp32/src/main_firmware/mqtt_secrets.h.example` | `mqtt_secrets.h` (โฟลเดอร์เดียวกัน) | MQTT broker ของ firmware หลัก (HiveMQ Cloud หรือ Mosquitto บนเครื่อง) |
| `firmware/esp32/src/sensor_tuning/wifi_secrets.h.example` | `wifi_secrets.h` (โฟลเดอร์เดียวกัน) | Wi-Fi + MQTT บนเครื่องของ firmware สำหรับ sensor tuning |

`npm run env:setup` จะสร้างไฟล์ `.env` ของ backend, mobile และ admin ส่วนไฟล์อื่นให้คัดลอกเอง

ตัวแปรสำคัญของ backend:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/fallhelp_db?schema=public"

# Auth
JWT_SECRET="your-secret-key-min-32-characters"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# MQTT
MQTT_BROKER_URL="mqtt://localhost:1883"
MQTT_USERNAME=""
MQTT_PASSWORD=""
MQTT_DISABLED="false"

# Node-RED Sensor Lab MQTT runtime
MQTT_BROKER_HOST=host.docker.internal
MQTT_BROKER_PORT=1883
MQTT_USE_TLS=false
NODE_RED_PORT=1880

# Email (set DISABLE_EMAIL=true for local dev to skip sending)
DISABLE_EMAIL=true
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="FallHelp <noreply@your-domain.com>"
```

> ⚠️ ห้าม commit `.env`, `mqtt_secrets.h` หรือ `wifi_secrets.h` (ทั้งหมดอยู่ใน gitignore แล้ว) ไฟล์ template (`*.example`) มีเฉพาะค่า placeholder เท่านั้น

---

## การทดสอบ

| คำสั่ง | คำอธิบาย |
| ------- | ----------- |
| `npm run test:all` | รัน unit test ของทุกโปรเจกต์ (Nx) |
| `npm run backend:test:integration` | Integration test ของ backend (ต้องมี PostgreSQL) |
| `npm run infra:scan:strict` | Gate เต็มรูปแบบ: lint, typecheck, tests, integration tests |

คำสั่งของแต่ละแอป, coverage, โหมดของ infra-scan และ sensor lab: [docs/testing/running-tests.th.md](docs/testing/running-tests.th.md)

---

## เอกสาร

เอกสารทุกฉบับมีทั้งภาษาอังกฤษ (`.md`) และภาษาไทย (`.th.md`) ยกเว้นเอกสาร AI context ใน `docs/ai/`

ใช้ `npm run docs:lint` เพื่อตรวจสอบเอกสาร Markdown ใน repository นี้ (รวมถึงตรวจว่าแต่ละคู่ `X.md` / `X.th.md` มี heading, code block และตารางตรงกัน) และใช้
`npm run docs:lint:fix` เพื่อแก้ปัญหาระยะห่างและบรรทัดว่างอัตโนมัติเท่าที่ทำได้

| เอกสาร | คำอธิบาย |
| ---------------------------------------------------------------------------------------- | --------------------------------------------- |
| [AGENTS.md](./AGENTS.md) | คู่มือ AI copilot, กฎการเขียนโค้ด, agent workflow |
| [docs/README.th.md](./docs/README.th.md) | สารบัญเอกสารทั้งหมด |
| [apps/backend-api/README.th.md](./apps/backend-api/README.th.md) | คู่มือโมดูล Backend |
| [apps/mobile/README.th.md](./apps/mobile/README.th.md) | คู่มือโมดูล Mobile |
| [apps/admin/README.th.md](./apps/admin/README.th.md) | คู่มือโมดูล Admin |
| [docs/architecture/system-design.th.md](./docs/architecture/system-design.th.md) | ภาพรวมสถาปัตยกรรมระบบ |
| [docs/planning/functional-requirements.th.md](./docs/planning/functional-requirements.th.md) | Functional requirements |
| [docs/features/fall-detection.th.md](./docs/features/fall-detection.th.md) | Pipeline การตรวจจับการหกล้ม (IoT → MQTT → App) |
| [docs/features/device-pairing.th.md](./docs/features/device-pairing.th.md) | ขั้นตอนตั้งค่า WiFi ผ่าน BLE และ provisioning protocol |
| [docs/api/api-reference.th.md](./docs/api/api-reference.th.md) | REST API reference ฉบับเต็ม |
| [docs/ops/local-deployment.th.md](./docs/ops/local-deployment.th.md) | คู่มือ deploy บนเครื่อง local |
| [docs/ops/cross-platform-development.th.md](./docs/ops/cross-platform-development.th.md) | คู่มือพัฒนาบน Windows + Ubuntu |
| [docs/ops/development-commands.th.md](./docs/ops/development-commands.th.md) | รายการคำสั่งสำหรับพัฒนาทั้งหมด |
| [docs/testing/running-tests.th.md](./docs/testing/running-tests.th.md) | วิธีรันเทสต์ทุกชุด |
| [docs/demo/DEMO_GUIDE.th.md](./docs/demo/DEMO_GUIDE.th.md) | Demo โดยไม่ใช้ฮาร์ดแวร์ (simulator + tunnel) |
| [firmware/esp32/README.th.md](./firmware/esp32/README.th.md) | ภาพรวม firmware ของ ESP32 |
| [firmware/esp32/docs/components/mpu6050.th.md](./firmware/esp32/docs/components/mpu6050.th.md) | คู่มือปรับจูน MPU6050 สำหรับตรวจจับการหกล้ม |

---

## แนวทางการพัฒนา

โปรเจกต์นี้พัฒนาด้วย workflow แบบ multi-agent ที่มี AI ช่วยในทุกขั้นตอน ตั้งแต่การวางแผน การ implement การ refactor การเขียนเอกสาร การทดสอบ และการรีวิว

Workflow นี้ได้รับการสนับสนุนจากเครื่องมืออย่าง Codex, Claude Code, GitHub Copilot และ AI coding assistant อื่น ๆ ในแต่ละช่วงของการพัฒนา

เครื่องมือ AI ถูกใช้เพื่อเร่งการพัฒนาและเพิ่มความสม่ำเสมอ แต่การตัดสินใจด้านสถาปัตยกรรม การตรวจสอบความถูกต้อง และความเป็นเจ้าของโปรเจกต์ยังคงเป็นของผู้พัฒนาโปรเจกต์

---

## การมีส่วนร่วม

1. ใช้ `main` เป็น branch หลักสำหรับการพัฒนาตามปกติแบบคนเดียว
2. ใช้รูปแบบ [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(mobile): add fall history export`
   - `fix(backend): prevent duplicate fall event on MQTT reconnect`
   - `docs(firmware): clarify MPU6050 threshold tuning guide`
3. รันการตรวจสอบที่ขอบเขตของการเปลี่ยนแปลงกำหนดก่อน commit
4. Commit บนเครื่อง แล้ว push ตรงไปที่ `main`
5. ใช้ GitHub Actions บน `main` เป็นการยืนยันผลผ่าน CI ฝั่ง remote
6. เปิด branch ชั่วคราวและ pull request เฉพาะเมื่อจำเป็นต้องให้คนอื่นรีวิว ทดลองสิ่งที่มีความเสี่ยง หรือทำงานร่วมกับผู้อื่น

---

## สัญญาอนุญาต

[MIT](LICENSE) © 2026 Wattanaroj Butdee

---

## กิตติกรรมประกาศ

โครงการนี้เข้าร่วมการแข่งขันพัฒนาโปรแกรมคอมพิวเตอร์แห่งประเทศไทย ครั้งที่ 28 (NSC 2026)

> โครงการ แอปพลิเคชันและอุปกรณ์ตรวจจับการหกล้มสำหรับดูแลผู้สูงอายุแบบคล้องคอ ได้รับทุนอุดหนุนการทำกิจกรรมส่งเสริมและสนับสนุนการวิจัยและนวัตกรรมจากสำนักงานการวิจัยแห่งชาติ และสำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ
>
> This research and innovation activity is funded by National Research Council of Thailand (NRCT) and National Science and Technology Development Agency (NSTDA).

---

**สถานะ:** 🧪 อยู่ระหว่างการพัฒนา &nbsp;|&nbsp; **อัปเดตล่าสุด:** 7 ตุลาคม 2026
