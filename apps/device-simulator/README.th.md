# Device Simulator

[English](README.md) · [ภาษาไทย](README.th.md)

Dashboard เว็บแบบเต็มจอที่จำลองตัวเป็นอุปกรณ์สวมคอของ FallHelp โดย publish ไปยัง MQTT topic ชุดเดียวกับ ESP32 ผ่าน WebSocket listener ของ Mosquitto

มี 3 แผง: **อุปกรณ์ (Device)** (ออนไลน์/ออฟไลน์), **สถานการณ์การล้ม (Fall scenario)** (วงนับถอยหลังขนาดใหญ่: สีเหลืองอำพัน = ช่วงยกเลิก 15 วินาที, สีแดง = ยืนยันการหกล้ม, สีเทา = ถูกยกเลิก จากนั้นวงจะนับช่วงพักที่ backend กันเหตุการณ์ซ้ำ) และ **ชีพจร (Heart rate)** (ค่าปัจจุบัน กราฟแนวโน้มที่ไหลต่อเนื่อง และปุ่มเลือกสถานการณ์ **ต่ำ / ปกติ / สูง (Low / Normal / High)**) มีธีมสว่างและมืดแบบเดียวกับ admin panel (ปุ่มสลับอยู่ที่ header) หน้าจอเป็นภาษาไทยโดยค่าเริ่มต้น สลับเป็นอังกฤษได้ด้วยปุ่ม **TH | EN** ที่ header (payload MQTT และ JSON ใน log ไม่เปลี่ยน) ชื่อปุ่มในตารางด้านล่างเขียนแบบ ไทย (English) สีสถานะมีความหมายเดียวกันทุกจุด: เขียว ออนไลน์/ปกติ, เหลืองอำพัน รอ, แดง ล้ม/ผิดพลาด, เทา ออฟไลน์, ฟ้า ชีพจร

| ปุ่ม | Topic | Payload |
|---|---|---|
| เปิดอุปกรณ์ / ปิดอุปกรณ์ (Go online / Go offline) | `device/{serial}/status` (ส่งทุก 5 วินาทีขณะ online) | `online`, `signalStrength`, `wifiSSID`, `timestamp` |
| ชีพจร (ส่งอัตโนมัติทุก 5 วินาทีขณะออนไลน์) | `device/{serial}/heartrate` | `heartRate`, `confidence`, `timestamp` ค่าขยับ ±8 BPM รอบค่าเป้าหมายของสถานการณ์ (ต่ำ ~50, ปกติ ~75, สูง ~125) เปลี่ยนรอบละไม่เกิน 6 BPM จึงค่อยๆ ไต่ขึ้นลง และสูงขึ้นประมาณ 25 BPM หลังยืนยันการหกล้ม |
| จำลองการล้ม (Simulate fall; อุปกรณ์ต้องออนไลน์) | `device/{serial}/event` | `type: "suspected_fall"` จากนั้นอีก 15 วินาทีส่ง `type: "fall_confirmed"` (`magnitude`, `postureDelta`, `bpm`) |
| ยกเลิกที่อุปกรณ์ (Cancel on device) | `device/{serial}/event` | `type: "fall_cancelled"` (เฉพาะภายในช่วง 15 วินาที) |

รันพร้อม demo stack ทั้งชุดด้วย `npm run demo:up` (ดู[คู่มือ demo](../../docs/demo/DEMO_GUIDE.th.md))
URL ของ broker ค่าปริยายคือ `ws://127.0.0.1:9001` เปลี่ยนได้ด้วย `VITE_MQTT_WS_URL`
สัญญา (contract) ของ payload ถูกตรึงไว้ด้วย `src/contract/fixtures.json` และถูกทดสอบทั้งที่นี่และใน backend
