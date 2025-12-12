# Functional Requirements

![Functional Requirements Overview]

## 3 Actors

### 1. ผู้สูงอายุ (Elder / Device User)

**คำอธิบาย:** ผู้สูงอายุที่สวมใส่อุปกรณ์ตรวจจับการหกล้ม

**Functional Requirements:**

1. ผู้ใช้งานสามารถสวมใส่อุปกรณ์เพื่อให้ระบบตรวจจับและแจ้งเตือนได้ทันที
2. ผู้ใช้งานสามารถกดปุ่มบนอุปกรณ์เพื่อยกเลิกการแจ้งเตือนที่ผิดพลาด (False Alarm) ได้ภายในระยะเวลาที่กำหนด (30 วินาที)

---

### 2. ญาติผู้ดูแล (Caregiver)

**คำอธิบาย:** ญาติหรือผู้ดูแลผู้สูงอายุที่ใช้แอปพลิเคชันมือถือ

**Functional Requirements:**

**2.1 ฟีเจอร์หลัก (Core Features)**

1. ญาติผู้ดูแลสามารถลงทะเบียนและดูแลผู้สูงอายุได้หลายคนในบัญชีเดียว (เช่น พ่อ, แม่, ญาติผู้ใหญ่)
2. ญาติผู้ดูแลสามารถเข้าสู่ระบบและออกจากระบบได้
3. ญาติผู้ดูแลสามารถเพิ่ม ดู แก้ไข ข้อมูลผู้สูงอายุ เช่น ชื่อ, เพศ, อายุ, ส่วนสูง, น้ำหนัก, โรคประจำตัว, และข้อมูลที่อยู่
4. ญาติผู้ดูแลสามารถเพิ่มหรือยกเลิกการเชื่อมต่ออุปกรณ์ (Pair/Unpair) ได้ (รองรับ 1 อุปกรณ์ต่อผู้สูงอายุ 1 ท่าน)
5. ญาติผู้ดูแลสามารถอัปเดตการตั้งค่า Wi-Fi ให้กับอุปกรณ์ได้ (กรณีเปลี่ยนรหัส Wi-Fi หรือย้ายสถานที่)
6. ญาติผู้ดูแลสามารถเพิ่ม แก้ไข ลบ หรือจัดลำดับ ตัวเลือกผู้ติดต่อฉุกเฉินได้
7. ญาติผู้ดูแลสามารถดูสถานะการเชื่อมต่อของอุปกรณ์ การหกล้ม และอัตราการเต้นหัวใจของ ผู้สูงอายุได้ (Real-time Monitoring)
8. ญาติผู้ดูแลจะได้รับการแจ้งเตือน Push Notification เมื่อเกิดการหกล้ม, อัตราการเต้นหัวใจผิดปกติ, หรืออุปกรณ์มีการเปลี่ยนแปลงสถานะ (Online/Offline)

**2.2 ฟีเจอร์เสริม (Support Features)**

9. ญาติผู้ดูแลสามารถจัดการข้อมูลส่วนตัว (Personal Profile) เช่น ชื่อ-นามสกุล, เบอร์โทรศัพท์ และเปลี่ยนอีเมลและรหัสผ่าน
10. ญาติผู้ดูแลสามารถ **ลบบัญชีผู้ใช้** (Delete Account) ได้
11. ญาติผู้ดูแลสามารถดูประวัติการแจ้งเตือนย้อนหลัง (Notification History) จัดการสถานะการอ่าน และลบการแจ้งเตือนได้
12. ญาติผู้ดูแล (Level: Owner) สามารถเชิญสมาชิกครอบครัวอื่นเข้าร่วมดูแลได้ (Invite Member) พร้อมกำหนดสิทธิ์ (Editor: แก้ไขได้, Viewer: ดูได้อย่างเดียว)
13. ญาติผู้ดูแลสามารถดูรายงานสรุปสุขภาพรายเดือน (Monthly Health Report) ซึ่งแสดง:

    - ช่วงเวลาที่เกิดเหตุบ่อยที่สุด (Peak Time Range)
    - สรุปประวัติการหกล้มรายเดือน
    - จำนวนครั้งที่ชีพจรเต้นผิดปกติ (สูง/ต่ำ)

14. ญาติผู้ดูแลสามารถดูเหตุการณ์ย้อนหลัง (Event History) โดยแสดงรายการเหตุการณ์สำคัญ (หกล้ม, ชีพจรผิดปกติ) และกรองจำนวนรายการที่แสดงได้ (25, 50, หรือทั้งหมด)
15. ญาติผู้ดูแลสามารถส่งความคิดเห็น (Feedback) หรือแจ้งซ่อม (Repair Request) ซึ่งระบบจะออกหมายเลข Ticket (REP-XXX) เพื่อติดตามสถานะ
16. ญาติผู้ดูแลสามารถกดโทรออกฉุกเฉิน (Manual Emergency Call) ผ่านแอปพลิเคชันได้ทันที รวมถึงปุ่มลัดสำหรับโทร 1669

---

### 3. ผู้ดูแลระบบ (Admin)

**คำอธิบาย:** ผู้ดูแลระบบที่ใช้ Admin Panel บนเว็บไซต์

**Functional Requirements:**

1. ผู้ดูแลระบบสามารถเข้าสู่ระบบและออกจากระบบได้โดยใช้อีเมลและรหัสผ่าน (Email & Password)
2. ผู้ดูแลระบบสามารถดูข้อมูลสรุปภาพรวมของระบบ (System Overview) ผ่าน Dashboard ได้ เช่น จำนวนผู้ใช้, จำนวนผู้สูงอายุ, และจำนวนอุปกรณ์ที่ใช้งาน พร้อมแสดงตาราง Registered Users และ Elders
3. ผู้ดูแลระบบสามารถลงทะเบียนอุปกรณ์ใหม่และสร้าง QR Code สำหรับการจับคู่อุปกรณ์ได้
4. ผู้ดูแลระบบสามารถดูรายการอุปกรณ์ทั้งหมด ลบอุปกรณ์ และยกเลิกการจับคู่อุปกรณ์ (Force Unpair) ได้
5. ผู้ดูแลระบบสามารถดูและจัดการความคิดเห็นทั่วไป (General Feedback) และคำร้องขอแจ้งซ่อม (Repair Requests) พร้อมอัปเดตสถานะ (Pending → Reviewed → Resolved)
   - กรณีแจ้งซ่อม ระบบจะแสดงหมายเลข Ticket (REP-XXX) เพื่อให้ติดตามงานได้ง่าย

---

## System Features by Actor

### Mobile App Features (Caregiver)

- ✅ Authentication (Login, Register, Forgot Password)
- ✅ First-time Setup (3 Steps: Elder Info → Device Pairing → WiFi Config)
- ✅ Dashboard with Real-time Monitoring
  - Device Status Card
  - Fall Detection Status Card
  - Heart Rate Monitoring Card
  - Elder Info Card
- ✅ Elder Management (Add, View, Edit)
- ✅ Device Pairing (QR Code Scanner + Manual Entry)
- ✅ WiFi Configuration (WiFi Scanner + Manual Input)
- ✅ Emergency Contact Management (Add, Edit, Delete, Reorder Priority)
- ✅ Event History (Fall Detection, Heart Rate Anomalies)
- ✅ Push Notifications (Fall Detection, Heart Rate Alerts, Device Offline)
- ✅ Multi-User Access (Invite Members, Manage Access Levels)
- ✅ Profile Management
- ✅ Settings (Re-pair Device, Re-configure WiFi, Logout)
- ✅ Send Feedback
- ✅ Notification History (View, Mark as Read, Clear All)

### Admin Panel Features (Admin)

- ✅ Authentication (Login, Register)
- ✅ Dashboard (System Overview)
  - Total & Active Users
  - Total & Active Elders
  - Active Devices
  - Daily Fall Summary
- ✅ User Management (View Users, View Caregivers)
- ✅ Elder Management (View Elders with Caregivers)
- ✅ Device Management
  - Register New Device
  - Generate QR Code
  - View Device List
  - Delete Device
- ✅ Feedback Management
  - View User Feedback
  - Update Feedback Status (Pending → Reviewed → Resolved)

### Backend API Features

- ✅ RESTful API (45+ endpoints)
- ✅ Real-time Communication (Socket.io)
- ✅ IoT Integration (MQTT)
- ✅ Push Notifications (Expo Push API)
- ✅ Time-series Database (TimescaleDB)
- ✅ Authentication & Authorization (JWT, Role-based Access Control)
- ✅ Rate Limiting & Security
- ✅ Event Summary Reports (Daily/Monthly)
- ✅ Notification Management API (List, Read, Delete, Unread Count)

---

## Use Cases

### UC-1: Caregiver Registers and Sets Up System

1. Caregiver registers account via mobile app
2. Caregiver adds elder information
3. Caregiver pairs device using QR code
4. Caregiver configures WiFi for device
5. System is ready for monitoring

### UC-2: Fall Detection and Emergency Response

1. Elder falls down
2. IoT device detects fall via accelerometer
3. Backend receives MQTT message
4. Backend sends push notification to all caregivers
5. Caregiver receives notification on mobile app
6. Caregiver can cancel false alarm within 30 seconds
7. If not cancelled, system calls emergency contacts in priority order

### UC-3: Admin Registers New Device

1. Admin logs into Admin Panel
2. Admin navigates to Device Management
3. Admin clicks "Register New Device"
4. System generates unique device code and QR code
5. Admin prints QR code label for device
6. Device is ready to be paired by caregivers

### UC-4: Caregiver Invites Family Member

1. Caregiver navigates to Member Management
2. Caregiver enters email of family member
3. System sends invitation
4. Family member registers and accepts invitation
5. Family member can now view elder's data (VIEWER role)

---

## Non-Functional Requirements

### Performance

- Real-time updates within 100ms
- API response time < 500ms
- Support 1000+ concurrent users

### Security

- JWT token authentication
- Password hashing (bcrypt)
- Rate limiting (API, Auth, OTP)
- HTTPS/TLS encryption
- Role-based access control

### Reliability

- 99.9% uptime
- Auto-reconnect for MQTT and Socket.io
- Graceful error handling
- Data backup and recovery

### Scalability

- Horizontal scaling support
- Database partitioning (TimescaleDB)
- Load balancing ready
- Microservices architecture ready

### Usability

- Mobile-first design
- Thai language support
- Intuitive UI/UX
- Accessibility features

---

# Development Plan: 4 Phases (การพัฒนา 4 ระยะ)

หมายเหตุ: แผนการพัฒนานี้จัดทำขึ้นใหม่โดยจัดกลุ่มฟีเจอร์ตามลำดับความสำคัญและการเกี่ยวข้องกันของระบบ (Logical Dependency)

## - พัฒนาฟังก์ชัน ระยะที่ 1: รากฐานและการจัดการข้อมูล (Foundation & Data Management)

**เป้าหมาย:** สร้างโครงสร้างพื้นฐานของระบบ เตรียมฐานข้อมูล และระบบจัดการผู้ใช้งานหลัก

### Actor: ญาติผู้ดูแล (Caregiver)

- พัฒนาฟังก์ชันการลงทะเบียนบัญชีผู้ใช้ (Register) เข้าสู่ระบบ (Login) และจัดการข้อมูลส่วนตัว
- พัฒนาฟังก์ชันการเพิ่ม ดู แก้ไข ข้อมูลผู้สูงอายุ (Elder Profile) เช่น ชื่อ, เพศ, อายุ, ส่วนสูง, น้ำหนัก, โรคประจำตัว, และข้อมูลที่อยู่
- พัฒนาฟังก์ชันการจัดการรายชื่อผู้ติดต่อฉุกเฉิน (Emergency Contacts) เพิ่ม/ลบ/จัดลำดับ
- พัฒนาฟังก์ชันแสดงหน้า Dashboard เปล่า (Empty State) รองรับการเริ่มใช้งาน

### Actor: ผู้ดูแลระบบ (Admin)

- พัฒนาฟังก์ชันเข้าสู่ระบบ (Admin Login) และจัดการบัญชีผู้ดูแล
- พัฒนาฟังก์ชันดูรายชื่อผู้ใช้งาน (User Management) และรายชื่อผู้สูงอายุ (Elder Management) ทั้งหมดในระบบ

---

## - พัฒนาฟังก์ชัน ระยะที่ 2: การเชื่อมต่อและการติดตามผล (Connectivity & Monitoring)

**เป้าหมาย:** เชื่อมต่ออุปกรณ์ IoT เข้ากับระบบ และเริ่มแสดงผลข้อมูลสุขภาพแบบ Real-time

### Actor: ญาติผู้ดูแล (Caregiver)

- พัฒนาฟังก์ชันเชื่อมต่ออุปกรณ์ (Device Pairing) ผ่าน QR Code และ Manual Entry
- พัฒนาฟังก์ชันอัปเดตการตั้งค่า Wi-Fi ให้กับอุปกรณ์ (WiFi Update)
- พัฒนาฟังก์ชัน Dashboard แสดงสถานะอุปกรณ์ Online/Offline แบบ Real-time
- พัฒนาฟังก์ชันแสดงข้อมูลสุขภาพ Real-time (Heart Rate, Fall Status) บน Dashboard
- พัฒนาฟังก์ชันดูเหตุการณ์ย้อนหลัง (Event History) พร้อมตัวกรอง (25, 50, ทั้งหมด)

### Actor: ผู้ดูแลระบบ (Admin)

- พัฒนาฟังก์ชันลงทะเบียนอุปกรณ์เข้าระบบ (Register Device) และสร้าง QR Code
- พัฒนาฟังก์ชันดูรายการอุปกรณ์ทั้งหมดและสถานะการเชื่อมต่อ

---

## - พัฒนาฟังก์ชัน ระยะที่ 3: ความปลอดภัยขั้นสูงและสังคม (Advanced Safety & Collaboration)

**เป้าหมาย:** เพิ่มขีดความสามารถในการแจ้งเตือน การช่วยเหลือฉุกเฉิน และการดูแลร่วมกัน

### Actor: ผู้สูงอายุ (Elder)

- พัฒนาฟังก์ชันการยกเลิกการแจ้งเตือน (False Alarm) ผ่านปุ่มบนอุปกรณ์

### Actor: ญาติผู้ดูแล (Caregiver)

- พัฒนาฟังก์ชันการแจ้งเตือน (Push Notifications) สำหรับการหกล้ม, ชีพจรผิดปกติ, และอุปกรณ์ Offline
- พัฒนาฟังก์ชันโทรฉุกเฉิน (Emergency Call) รองรับทั้งการกดเองและผ่านการแจ้งเตือน
- พัฒนาฟังก์ชันการเชิญสมาชิกครอบครัว (Multi-User Access) และกำหนดสิทธิ์ (Editor, Viewer)
- พัฒนาฟังก์ชันรายงานสุขภาพรายเดือน (Monthly Health Report) และข้อมูลสรุป
- พัฒนาฟังก์ชันส่งความคิดเห็น (Feedback) หรือแจ้งซ่อม (Repair Request) พร้อมติดตามสถานะ Ticket (REP-XXX)
- พัฒนาฟังก์ชันดูประวัติการแจ้งเตือน (Notification History) จัดการสถานะและลบรายการได้
- พัฒนาฟังก์ชันการลบบัญชีผู้ใช้ (Delete Account)

### Actor: ผู้ดูแลระบบ (Admin)

- พัฒนาฟังก์ชัน Dashboard แสดงข้อมูลสรุปภาพรวมของระบบ (System Overview)

  - แสดงจำนวนผู้ใช้งาน (Total Users) และผู้ใช้งานที่กำลังใช้งาน (Active Users)
  - แสดงจำนวนผู้สูงอายุ (Total Elders) และผู้สูงอายุที่เปิดใช้งาน (Active Elders)
  - แสดงจำนวนอุปกรณ์ (Active Devices)
  - แสดงสรุปจำนวนการหกล้มวันนี้ (Today's Falls)

- พัฒนาฟังก์ชันจัดการความคิดเห็นทั่วไป (General Feedback) และคำร้องขอแจ้งซ่อม (Repair Requests) พร้อมอัปเดตสถานะ

---

## - พัฒนาฟังก์ชัน ระยะที่ 4: การตรวจสอบและการส่งมอบ (Testing & Deployment)

**เป้าหมาย:** ตรวจสอบความเสถียร ความแม่นยำ และประสิทธิภาพของระบบก่อนใช้งานจริง

### Actor: ทีมพัฒนาและทดสอบ (Dev & QA Team)

- **System Integration:** ทดสอบการทำงานร่วมกันทั้งระบบ (Mobile - Backend - Firmware)
- **Sensor Calibration:** ปรับจูนความแม่นยำในการตรวจจับการหกล้มและวัดชีพจร
- **Load Testing:** ทดสอบการรองรับการเชื่อมต่อพร้อมกันจำนวนมาก
- **User Acceptance Testing (UAT):** ทดสอบความพึงพอใจการใช้งานจริง
- **Deployment:** ติดตั้งระบบขึ้น Server จริงและปล่อยแอปพลิเคชัน

---

---

### 6. Hardware & Future Improvements

- [ ] **Smart Device Health Check (Self-Diagnosis)**
  - **Concept:** Device runs a self-test on startup (MPU6050 connection, Pulse Sensor signal).
  - **Action:** If sensors fail, Device publishes `status: { "error": "SENSOR_FAIL" }` to MQTT.
  - **UI Result:** Mobile App changes status from "Online" (Green) to "Maintenance Needed" (Orange).
  - **Goal:** Users should know if the device is connected but not protecting them.

**Last Updated:** December 12, 2025
