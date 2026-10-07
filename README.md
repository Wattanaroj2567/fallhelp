# FallHelp

[English](README.md) · [ภาษาไทย](README.th.md)

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="./apps/mobile/assets/images/logoicon.png" alt="FallHelp logo" width="240" />
</p>
<!-- markdownlint-enable MD033 -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/Wattanaroj2567/fallhelp?include_prereleases)](https://github.com/Wattanaroj2567/fallhelp/releases/latest)

**A neck-worn fall detection device with a caregiver mobile app.** The device detects falls with an IMU, attaches heart rate from a PPG ear-clip sensor, and alerts caregivers instantly. The wearer can cancel a false alarm on the device within 15 seconds.

## Try the demo

- 📱 **Android APK:** [download the latest preview build](https://github.com/Wattanaroj2567/fallhelp/releases/latest)
- 🧪 **No hardware?** The [device simulator](apps/device-simulator) sends the same MQTT messages as the real device. See the [demo guide](docs/demo/DEMO_GUIDE.md).

## Features

- 🔴 Real-time fall detection (forward, backward, side, chair falls) via MPU6050 IMU
- 💓 Heart rate at fall time via XD-58C PPG ear-clip sensor
- 🔔 Instant push and in-app alerts; caregivers **acknowledge** confirmed alerts
- 🛡️ False-alarm cancel on the device button within 15 s
- 📊 Monthly fall history and reports
- 🌐 Admin panel for device management

## Architecture

```mermaid
flowchart LR
  D["ESP32 neck device<br/>or Web Simulator"] -- MQTT --> B[(Mosquitto)]
  B --> API["backend-api<br/>Express + Prisma"]
  API --> DB[(PostgreSQL)]
  API -- "Socket.io / Expo Push" --> M[Mobile app]
  API --> A[Admin panel]
```

More detail: [project overview](docs/PROJECT_OVERVIEW.md).

<!-- markdownlint-disable MD033 -->
<details>
<summary>📸 Screenshots</summary>

<table>
  <tr>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_01_auth_login.jpg" width="220" alt="Login" /><br /><sub>Login</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_22_dashboard_online_normal_bpm.jpg" width="220" alt="Dashboard" /><br /><sub>Dashboard</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_23_dashboard_fall_alert.jpg" width="220" alt="Fall alert" /><br /><sub>Fall alert</sub></td>
  </tr>
  <tr>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_24_dashboard_fall_detail_modal.jpg" width="220" alt="Fall details" /><br /><sub>Fall details</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_26_history_event_list.jpg" width="220" alt="History" /><br /><sub>History</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_27_report_summary_with_data.jpg" width="220" alt="Monthly report" /><br /><sub>Monthly report</sub></td>
  </tr>
  <tr>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_11_setup_pairing_qr_scan.jpg" width="220" alt="Pair device (QR)" /><br /><sub>Pair device (QR)</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_36_device_info_online.jpg" width="220" alt="Device" /><br /><sub>Device</sub></td>
    <td align="center" valign="top"><img src="docs/screenshots/mobile/m_53_emergency_call_with_contacts.jpg" width="220" alt="Emergency call" /><br /><sub>Emergency call</sub></td>
  </tr>
</table>

All 58 app screens and the admin panel: [docs/SCREENSHOTS.md](docs/SCREENSHOTS.md)

</details>
<!-- markdownlint-enable MD033 -->

## Tech stack

| Area | Stack |
|---|---|
| Mobile | React Native (Expo 55), NativeWind |
| Backend | Node.js, Express 5, Prisma, PostgreSQL, MQTT, Socket.io |
| Admin | React 19, Vite, TailwindCSS |
| Firmware | ESP32 (Arduino/C++), MPU6050, XD-58C |
| Tooling | Nx monorepo |

## Project structure

| Path | What |
|---|---|
| `apps/mobile` | Caregiver app (Expo) |
| `apps/backend-api` | REST API, MQTT handlers, realtime |
| `apps/admin` | Device management panel |
| `apps/device-simulator` | Web device simulator for demos |
| `firmware/esp32` | Device firmware |

## Quick start (developers)

```bash
npm install
npm run env:setup
npm run backend:db:setup
npm run dev:all
```

Full guide: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) · Hardware: [docs/HARDWARE.md](docs/HARDWARE.md)

## License

[MIT](LICENSE) © 2026 Wattanaroj Butdee

## Acknowledgments

This project took part in the 28th National Software Contest (NSC 2026).

> โครงการ แอปพลิเคชันและอุปกรณ์ตรวจจับการหกล้มสำหรับดูแลผู้สูงอายุแบบคล้องคอ ได้รับทุนอุดหนุนการทำกิจกรรมส่งเสริมและสนับสนุนการวิจัยและนวัตกรรมจากสำนักงานการวิจัยแห่งชาติ และสำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ
>
> This research and innovation activity is funded by National Research Council of Thailand (NRCT) and National Science and Technology Development Agency (NSTDA).
