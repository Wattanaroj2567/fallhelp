# การพัฒนาข้ามแพลตฟอร์ม (Cross-Platform Development)

[English](cross-platform-development.md) · [ภาษาไทย](cross-platform-development.th.md)

## ข้อมูลเอกสาร

- ผู้อ่าน: Developers, QA
- แหล่งข้อมูลอ้างอิงหลัก: `../../package.json`, `../../apps/backend-api/package.json`, `../../apps/mobile/package.json`, `../../apps/admin/package.json`, `../../scripts/dev/dev-all.mjs`, `../../scripts/iot/node-red-launch.mjs`, `../../scripts/iot/firmware-monitor.mjs`
- สถานะ: ใช้งานอยู่
- อัปเดตล่าสุด: 21 พฤษภาคม 2026

## ภาพรวม

repository นี้ออกแบบให้ใช้ได้ทั้งบน Windows และ Linux Ubuntu โดยใช้ source tree ชุดเดียวกัน

กฎหลักมีข้อเดียว: แชร์โค้ดได้ แต่อย่าแชร์สิ่งที่ติดตั้งแล้วข้ามระบบปฏิบัติการ แต่ละ OS ต้องติดตั้ง dependencies, caches และ native binaries ของตัวเองในเครื่อง

repo นี้ใช้ npm workspaces ร่วมกับกลยุทธ์การติดตั้งแบบ nested ที่ตั้งค่าไว้ใน [`.npmrc`](../../.npmrc)

## แพลตฟอร์มที่รองรับ

### เป้าหมายการพัฒนาในเครื่องที่ตั้งใจรองรับอย่างเป็นทางการ

- Windows 10/11
- Ubuntu 24.04 LTS หรือใหม่กว่า

หมายเหตุเรื่อง WSL:

- ถ้าเปิด repo จากฝั่ง Windows ผ่าน `\\wsl.localhost\Ubuntu\...` ให้ใช้ launcher ของ repo เป็นหลัก (`install:all`, `platform:check`, `dev:all`, `infra:scan`)
- ถ้าทำงานใน WSL shell ให้ถือว่าเป็น Linux และติดตั้ง dependencies ใหม่ในฝั่งนั้น

### ข้อจำกัดที่ควรรู้

- Linux รัน iOS Simulator ไม่ได้ บน Ubuntu ให้ใช้ Android หรือ Expo web
- ชื่อ serial device ต่างกันตาม OS:
  - Windows: `COMx`
  - Ubuntu: `/dev/ttyUSBx` หรือ `/dev/ttyACMx`
- native optional packages อย่าง Rollup, esbuild และ Lightning CSS จะถูกติดตั้งแยกตาม OS ตอนรัน `npm install` หรือ `npm ci`

## ขั้นตอนการตั้งค่า

### 1. ติดตั้ง Prerequisites ที่ใช้ร่วมกัน

- Node.js 24.x
- npm 10.x หรือใหม่กว่า
- Git

### 2. ติดตั้ง Prerequisites ของ Service ตามการใช้งาน

- รัน Backend และ full-stack ในเครื่อง:
  - PostgreSQL 18
  - Mosquitto 2.x
- Mobile บน Android:
  - Android Studio + Android SDK
- งาน Arduino:
  - `arduino-cli` หรือ Arduino IDE 2.x
- flow ของ Node-RED sensor lab:
  - ติดตั้ง `node-red` ใน repo (รัน `npm install` ที่ root)

### 3. Clone และติดตั้งบน OS ปัจจุบัน

ติดตั้งใหม่แบบสะอาดบนทุกเครื่องและทุก OS:

```bash
npm run install:all
npm run platform:check
```

ถ้ายังมี scope ที่ไม่ผ่าน `platform:check` ให้ติดตั้ง dependencies ของทุก workspace ใหม่บน OS ปัจจุบัน:

```bash
npm run install:all
```

## กฎข้ามแพลตฟอร์มที่ต้องทำตามเสมอ

- ห้ามคัดลอก `node_modules/` จาก Windows ไป Ubuntu
- ห้ามคัดลอก `node_modules/` จาก Ubuntu ไป Windows
- ห้าม commit build output หรือโฟลเดอร์ cache ที่ผูกกับ OS
- ติดตั้ง dependencies ใหม่ทุกครั้งหลังเปลี่ยน OS, สถาปัตยกรรม CPU หรือ Node เวอร์ชันหลัก
- สำหรับ automation ที่ใช้ร่วมกัน ให้ใช้ script ที่เขียนด้วย Node มากกว่า script ที่ผูกกับ shell
- รัน `npm run platform:check` ก่อนเริ่ม debug ปัญหา native package แปลก ๆ

## หมายเหตุตามแพลตฟอร์ม

### Root Scripts

launcher และ utility script ที่ใช้ร่วมกันเขียนให้แยกการทำงานตามแพลตฟอร์มเมื่อจำเป็น:

- `../../scripts/dev/dev-all.mjs`
- `../../scripts/iot/node-red-launch.mjs`
- `../../scripts/iot/firmware-monitor.mjs`

ให้ใช้ launcher ของ repo เป็นชุดคำสั่งหลักในทุก OS

### หมายเหตุสำหรับ Windows

- firmware helpers จะลอง `arduino-cli board list` ก่อนเพื่อหา port ของบอร์ดอัตโนมัติ
- ถ้าหาอัตโนมัติไม่เจอ จะใช้ port สำรองเป็น `COM3`
- override port ใน PowerShell:

```powershell
$env:FIRMWARE_PORT = "COM5"
node scripts/iot/firmware-arduino-cli.mjs upload main
```

- override port ของ serial monitor ใน PowerShell:

```powershell
$env:MONITOR_PORT = "COM5"
node scripts/iot/firmware-monitor.mjs
```

- ถ้า terminal ยังค้าง child process ไว้หลังกด Ctrl+C ให้ใช้ launcher script ของ repo แทนการต่อคำสั่ง shell เอง

### หมายเหตุสำหรับ Ubuntu

- firmware helpers จะลอง `arduino-cli board list` ก่อนเพื่อหา port ของบอร์ดอัตโนมัติ
- ถ้าหาอัตโนมัติไม่เจอ จะใช้ port สำรองเป็น `/dev/ttyUSB0`
- user ที่รันเครื่องมือ Arduino อาจต้องมีสิทธิ์เข้าถึง serial:

```bash
sudo usermod -aG dialout $USER
```

- logout แล้ว login ใหม่หลังเปลี่ยนกลุ่ม serial

### หมายเหตุสำหรับ Mobile

- ทั้ง Windows และ Ubuntu รันเครื่องมือพัฒนาของ Expo ได้
- บน Ubuntu ให้ใช้ Android หรือ web เป็นเป้าหมาย
- การพัฒนา iOS ยังทำได้บน macOS เท่านั้น

### หมายเหตุเรื่อง Database และ MQTT

- ถ้าเป็นไปได้ ให้ใช้ Docker หรือการตั้งค่า service ในเครื่องที่มีเอกสารกำกับ เพื่อให้ Windows และ Ubuntu ใช้ service เวอร์ชันเดียวกัน
- ให้ค่าใน `.env` เป็นกลางต่อ OS ยกเว้น path หรือ serial port ที่จำเป็นต้องต่างกัน

## การตรวจสอบ

หลังติดตั้งใหม่บน OS ปัจจุบัน ให้ตรวจ toolchain ในเครื่องด้วยคำสั่งที่เกี่ยวกับ scope ของงาน:

```bash
npm run platform:check
npm run backend:build
npm run admin:build
npm run --prefix apps/mobile typecheck
npm run infra:scan
```

สำหรับงานที่แก้เฉพาะเอกสารหรือ config ซึ่ง runtime services ยังไม่พร้อม ให้ใช้ strict scan รุ่นที่ตรงกับ environment ปัจจุบัน และรายงาน integration coverage ที่ข้ามไปให้ชัดเจน

## การแก้ปัญหา

### Native Module หายหลังย้ายข้าม OS

อาการที่พบบ่อยคือ optional packages ของ Rollup, esbuild หรือ Lightning CSS หายไป

วิธีแก้:

1. ติดตั้ง dependencies ใหม่บน OS ปัจจุบัน
2. รัน `npm run platform:check`
3. รันคำสั่งของ package นั้นอีกครั้ง

### Firmware Monitor เปิด Port บน Ubuntu ไม่ได้

ตรวจสอบ:

1. serial path ถูกต้อง เช่น `/dev/ttyUSB0`
2. สาย USB และไฟเลี้ยงบอร์ด
3. การเป็นสมาชิกกลุ่ม `dialout`

### คำสั่ง Node-RED ล้มเหลว

ติดตั้ง Node-RED ก่อน แล้วรัน:

```bash
node scripts/iot/node-red-launch.mjs
```

## เอกสารที่เกี่ยวข้อง

- `Local deployment: ./local-deployment.th.md`
- `API verification: ./api-verification.th.md`
- `Local deployment: ./local-deployment.th.md`
- `Project structure: ../architecture/project-structure.th.md`
- `System design: ../architecture/system-design.th.md`
