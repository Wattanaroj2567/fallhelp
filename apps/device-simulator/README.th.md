# Device Simulator

[English](README.md) · [ภาษาไทย](README.th.md)

เว็บแอปที่จำลองตัวเป็นอุปกรณ์สวมคอของ FallHelp โดย publish ไปยัง MQTT topic ชุดเดียวกับ ESP32 ผ่าน WebSocket listener ของ Mosquitto

| ปุ่ม | Topic | Payload |
|---|---|---|
| Online / Offline | `device/{serial}/status` (ส่งทุก 5 วินาทีขณะ online) | `online`, `signalStrength`, `wifiSSID`, `timestamp` |
| Send heart rate | `device/{serial}/heartrate` | `heartRate`, `confidence`, `timestamp` |
| Simulate Fall | `device/{serial}/event` | `type: "suspected_fall"` จากนั้นอีก 15 วินาทีส่ง `type: "fall_confirmed"` (`magnitude`, `postureDelta`, `bpm`) |
| Cancel on device (false alarm) | `device/{serial}/event` | `type: "fall_cancelled"` (เฉพาะภายในช่วง 15 วินาที) |

รันพร้อม demo stack ทั้งชุดด้วย `npm run demo:up` (ดู[คู่มือ demo](../../docs/demo/DEMO_GUIDE.th.md))
URL ของ broker ค่าปริยายคือ `ws://127.0.0.1:9001` เปลี่ยนได้ด้วย `VITE_MQTT_WS_URL`
สัญญา (contract) ของ payload ถูกตรึงไว้ด้วย `src/contract/fixtures.json` และถูกทดสอบทั้งที่นี่และใน backend
