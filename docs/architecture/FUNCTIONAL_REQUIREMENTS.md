# Functional Requirements

![Functional Requirements Overview](C:/Users/tawan/.gemini/antigravity/brain/3111ad31-05f3-4d35-922d-0cb13a0646ed/uploaded_image_1764572684487.png)

## 3 Actors

### 1. ผู้ใช้งานทั่วไป (General User)

**คำอธิบาย:** ผู้สูงอายุที่สวมใส่อุปกรณ์ตรวจจับการหกล้ม

**Functional Requirements:**

1. ผู้ใช้งานสามารถสวมใส่อุปกรณ์และเข้าสู่ระบบได้

---

### 2. ญาติผู้ดูแล (Caregiver)

**คำอธิบาย:** ญาติหรือผู้ดูแลผู้สูงอายุที่ใช้แอปพลิเคชันมือถือ

**Functional Requirements:**

1. ญาติผู้ดูแลสามารถเข้าสู่ระบบและออกจากระบบได้
2. ญาติผู้ดูแลสามารถลงทะเบียนผู้ใช้งานใหม่ได้ แม้ยังไม่มีอุปกรณ์ก็ตาม และจำกัดให้ดูแลผู้ป่วยได้เพียง 1 คน
3. ญาติผู้ดูแลสามารถเพิ่ม ดู แก้ไข ข้อมูลผู้สูงอายุ แม่ ยัง แบบ น้ำหนัก ส่วนสูง และโรคประจำตัวได้
4. ญาติผู้ดูแลสามารถดูสถานะการเชื่อมต่อของอุปกรณ์ การหกล้ม และอัตราการเต้นหัวใจของ ผู้สูงอายุได้
5. ญาติผู้ดูแลสามารถเพิ่มหรือลดจำนวนผู้ปกครอง IoT ผ่านการแสกน QR Code
6. ญาติผู้ดูแลสามารถดูข้อมูลการเชื่อมต่อ Wi-Fi ของอุปกรณ์ IoT ได้
7. ญาติผู้ดูแลสามารถเพิ่มหรือลบสมาชิกร้องของผู้ปกครองเว็บ สำหรับผู้ดูแลจากคนอื่นเพิ่มอีกคน
8. ญาติผู้ดูแลสามารถเพิ่ม แก้ไข ลบ หรือจัดลำดับ ตัวเลือกผู้ติดต่อฉุกเฉินได้ได้
9. ญาติผู้ดูแลจะได้รับการแจ้งเตือน Push Notification เมื่อเกิดการหกล้มหรือเกิดหรืออัตราการเต้นหัวใจผิดปกติหรือเครื่องตัดการเชื่อมต่อได้
10. ญาติผู้ดูแลสามารถดูประวัติการหกล้มและอัตราการเต้นหัวใจของผู้สูงอายุได้
11. ญาติผู้ดูแลสามารถส่งความคิดเห็นหรือข้อเสนอแนะเกี่ยวกับระบบได้

---

### 3. ผู้ดูแลระบบ (Admin)

**คำอธิบาย:** ผู้ดูแลระบบที่ใช้ Admin Panel บนเว็บไซต์

**Functional Requirements:**

1. ผู้ดูแลระบบสามารถเข้าสู่ระบบและออกจากระบบได้โดยใช้บัญชี QR Code สำหรับเข้าใช้งานได้
2. ผู้ดูแลระบบสามารถดูสถิติและข้อมูลภาพรวมของระบบทั้งหมดผ่าน Dashboard ได้ เช่น จำนวนผู้ใช้ จำนวนอุปกรณ์ เหตุการณ์ล่าสุด
3. ผู้ดูแลระบบสามารถดูและจัดการความคิดเห็นจากผู้ใช้งาน และอัปเดตสถานะการดำเนินการได้

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

### Admin Panel Features (Admin)

- ✅ Authentication (Login, Register)
- ✅ Dashboard (Statistics Overview)
  - Total Users
  - Total Elders
  - Total Devices
  - Recent Events
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
- ✅ Event Statistics (Daily/Monthly Reports)

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

**Last Updated:** December 1, 2025
