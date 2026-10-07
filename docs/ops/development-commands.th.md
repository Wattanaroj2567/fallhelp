# คำสั่งสำหรับการพัฒนา (Development Commands)

[English](development-commands.md) · [ภาษาไทย](development-commands.th.md)

## ข้อมูลเอกสาร

- ผู้อ่าน: Developers, QA
- แหล่งข้อมูลอ้างอิงหลัก: [package.json](../../package.json), ไฟล์ `package.json` ของแต่ละ app
- สถานะ: ใช้งานอยู่
- อัปเดตล่าสุด: 7 ตุลาคม 2026

---

## Root

### Scripts หลัก

| Script                                     | คำอธิบาย                                                            |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `npm run dev:all`                          | เปิดทุก service พร้อมกัน                                             |
| `npm run dev:backend-mobile`               | เปิดเฉพาะ Backend + Mobile                                          |
| `npm run dev:backend-admin`                | เปิดเฉพาะ Backend + Admin                                           |
| `npm run install:all`                      | ติดตั้ง dependencies ของ root + package บน OS ปัจจุบัน               |
| `npm run platform:check`                   | ตรวจว่า node_modules ตรงกับ OS/arch ปัจจุบัน                         |
| `npm run dev:stop`                         | ปิด port ที่ใช้พัฒนาในเครื่องบ่อย ๆ (3000, 8081, 5173, 5174)          |
| `npm run backend:dev`                      | เฉพาะ Backend                                                       |
| `npm run mobile:start`                     | เฉพาะ Mobile                                                        |
| `npm run admin:dev`                        | เฉพาะ Admin                                                         |
| `npm run env:setup`                        | คัดลอก .env.example → .env (ใช้ได้ทุกแพลตฟอร์ม)                     |
| `npm run docs:lint`                        | lint Markdown ทั้งโปรเจกต์ (root, docs, apps, firmware) และตรวจว่าเอกสาร EN/TH ทุกคู่ตรงกัน |
| `npm run docs:lint:fix`                    | แก้ปัญหา Markdown ที่แก้อัตโนมัติได้อย่างปลอดภัย                      |
| `npm run audit:comments:strict`            | บังคับมาตรฐาน comment ของ repo ในโหมด strict                        |
| `npm run infra:scan`                       | ตรวจความสอดคล้องพื้นฐานของ runtime/docs/env                         |
| `npm run infra:scan:strict`                | เพิ่มการตรวจ lint + typecheck + integration                         |
| `npm run infra:scan:strict:no-integration` | ตรวจแบบ strict โดยไม่รัน integration DB tests                       |
| `npm run nx:show`                          | แสดง projects ที่ Nx ตรวจพบใน workspace นี้                          |
| `npm run nx:graph`                         | เปิด Nx project graph ในเครื่อง                                     |
| `npm run affected:build`                   | รัน build เฉพาะ projects ที่ได้รับผลกระทบ                           |
| `npm run affected:lint`                    | รัน lint เฉพาะ projects ที่ได้รับผลกระทบ                            |
| `npm run affected:test`                    | รัน test เฉพาะ projects ที่ได้รับผลกระทบ                            |
| `npm run affected:typecheck`               | รัน typecheck เฉพาะ projects ที่ได้รับผลกระทบ                       |

หมายเหตุ: ตอนนี้เปิดใช้ Nx แบบระมัดระวัง โดยตั้งค่า project แบบ explicit ให้ `backend-api` และ `admin` ก่อน ส่วนแอป `mobile` ยังพึ่ง npm scripts เป็นหลักเพื่อเลี่ยงความเสี่ยงเรื่องความเข้ากันได้ของ plugin React Native/Expo ถ้า cache/state ของ Nx ในเครื่องเริ่มไม่เสถียร หรือคำสั่ง graph ค้าง ให้รัน `npm exec nx reset` ก่อน `npm exec nx show` หรือ `npm exec nx affected`

### Scripts สำหรับ IoT และ Hardware

| Script                     | คำอธิบาย                                                  |
| -------------------------- | --------------------------------------------------------- |
| `npm run sensor-lab -- node-red up` | เปิด Node-RED Docker service ของ Fall Detection Sensor Lab |
| `npm run sensor-lab -- node-red rebuild` | build และสร้าง Node-RED lab service ใหม่ |
| `node scripts/iot/node-red-launch.mjs` | ทางเลือกสำรองบน host สำหรับ debug Node-RED ในเครื่อง |
| `node scripts/iot/firmware-doctor.mjs` | ตรวจ arduino-cli, ESP32 core, libraries และ serial port |
| `node scripts/iot/firmware-arduino-cli.mjs deps` | ติดตั้ง Arduino libraries ที่จำเป็น                        |
| `node scripts/iot/firmware-arduino-cli.mjs compile main` | compile firmware หลัก                                     |
| `node scripts/iot/firmware-arduino-cli.mjs upload main` | upload firmware หลัก                                      |
| `node scripts/iot/firmware-monitor.mjs` | เปิด serial monitor ของ firmware (ใช้ arduino-cli)         |

### Scripts สำหรับ Demo (ไม่ใช้ hardware)

| Script | คำอธิบาย |
| ------ | ----------- |
| `npm run backend:db:seed:demo` | สร้าง/รีเซ็ตบัญชี demo, ผู้สูงอายุ และอุปกรณ์ simulator ที่ pair ไว้ (ต้องมี `DEMO_PASSWORD`) |
| `npm run demo:up` | เปิด Mosquitto (config สำหรับ demo), backend API และ device simulator พร้อมกัน |
| `npm run demo:tunnel` | รัน Cloudflare tunnel container ชี้ไปที่ backend บน host (`docker-compose.demo.yml`) |

ดู [คู่มือ demo](../../docs/demo/DEMO_GUIDE.th.md)

## Backend

```bash
cd apps/backend-api
```

| Script                   | คำอธิบาย                                                 |
| ------------------------ | -------------------------------------------------------- |
| `npm run dev`            | เปิด API server (hot-reload, ใช้ MQTT broker ภายนอก)      |
| `npm run build`          | compile TypeScript                                       |
| `npm run prisma:migrate` | รัน database migrations                                  |
| `npm run prisma:studio`  | เปิดหน้า Prisma Studio                                   |
| `npm run prisma:seed`    | seed ข้อมูลตั้งต้น (admin user, อุปกรณ์ทดสอบ)              |
| `npm run db:reset`       | รีเซ็ต DB ทั้งหมด + ตั้งค่า schema                         |
| `npm run db:verify`      | ตรวจ schema objects ของ PostgreSQL ที่ backend ต้องใช้     |
| `npm run test:ci`        | unit tests ในโหมดที่ปลอดภัยสำหรับ CI/sandbox              |
| `npm run lint`           | ตรวจ ESLint                                              |
| `npm run format`         | จัดรูปแบบด้วย Prettier                                   |

## Mobile

```bash
cd apps/mobile
```

| Script                 | คำอธิบาย                        |
| ---------------------- | ------------------------------ |
| `npx expo start`       | เปิด Expo dev server           |
| `npx expo run:android` | รันบนอุปกรณ์/emulator Android   |
| `npx expo run:ios`     | รันบน iOS simulator            |
| `npm run lint`         | ตรวจ ESLint                    |

## Admin

```bash
cd apps/admin
```

| Script            | คำอธิบาย                  |
| ----------------- | ------------------------ |
| `npm run dev`     | เปิด Vite dev server     |
| `npm run build`   | build สำหรับ production  |
| `npm run preview` | preview build production |
| `npm run lint`    | ตรวจ ESLint              |

## ติดตั้งใหม่เมื่อสลับแพลตฟอร์ม

```bash
# Reinstall all workspace dependencies when node_modules was generated on another OS
npm run install:all
```

ใช้คำสั่งนี้เมื่อ `npm run dev:all`, `npm run admin:dev` หรือ `npm run platform:check`
แจ้งว่า install-stamp ไม่ตรงกันหลังสลับระหว่าง Windows กับ WSL/Ubuntu

## Fall Detection Sensor Lab (ไม่บังคับ)

โมดูล Sensor Lab สำหรับทดสอบ workflow ของเซนเซอร์และเก็บไฟล์ CSV กิจกรรมจาก IMU MPU6050
ที่ติด label แล้ว จาก firmware `sensor_tuning` ผ่าน Node-RED FlowFuse Dashboard 2.0
README ที่ root แค่ชี้ตำแหน่งของโมดูล ส่วนรายละเอียด workflow ของ lab, CSV schema และขั้นตอน
ใช้งาน dashboard อยู่ใน `firmware/esp32/fall_detection_sensor_lab/`

**เปิด Node-RED Dashboard:**

```bash
# Docker primary path — includes @flowfuse/node-red-dashboard automatically
npm run sensor-lab -- node-red up

# Rebuild and reload the lab flow/container
npm run sensor-lab -- node-red rebuild

# Optional host fallback for quick developer use
node scripts/iot/node-red-launch.mjs
```

Dashboard UI: `http://localhost:1880/ui`; ไฟล์ flow:
`firmware/esp32/fall_detection_sensor_lab/node-red/flows/fall-detection-sensor-lab-flow.v2.json`
config ของ MQTT มาจากค่าใน Docker/env เช่น `MQTT_BROKER_HOST`,
`MQTT_BROKER_PORT`, `MQTT_USE_TLS`, `MQTT_USERNAME` และ `MQTT_PASSWORD`
ห้าม commit ค่า `.env` จริงหรือ credentials

**Scripts สำหรับ data pipeline:**

```bash
# Validate collected raw CSV against the schema
npm run sensor-lab -- validate

# Summarize selected trials into exports/selected_values_table.csv
npm run sensor-lab -- summarize

# Generate Markdown summaries from the selected trial table
npm run sensor-lab -- chapters

# Run all three in order
npm run sensor-lab -- all
```
