# FallHelp - UI Features Documentation

# เอกสาร UI และ UX ฟีเจอร์ทั้งหมด

> **🎨 ถอดแบบจาก Figma Mockups:** `mobile/Mockup-UI-Figma/`  
> Mobile App UI Flow และ Feature Requirements จาก Figma Design

---

## Table of Contents

**👥 USER FEATURES (Sections 1-9)**

1. [Authentication](#1-authentication)
2. [Device Setup & Pairing](#2-device-setup--pairing)
3. [Dashboard & Real-time Monitoring](#3-dashboard--real-time-monitoring)
4. [Elder Management](#4-elder-management)
5. [Emergency Contact Management](#5-emergency-contact-management)
6. [Profile Management](#6-profile-management)
7. [History & Reports](#7-history--reports)
8. [Settings](#8-settings)
   - 8.1 Setting Menu
   - 8.2 Logout Confirmation
   - 8.3 Multi-User Access & Member Management
9. [Admin Panel (Retool)](#9-admin-panel-retool)

**🔔 BEHAVIOR & STATES (Sections 10-13)**

10. [Notifications & Alerts](#10-notifications--alerts)
11. [Emergency Call Behavior](#11-emergency-call-behavior)
12. [Empty States](#12-empty-states)
13. [Success States](#13-success-states)

**📊 TECHNICAL SPECIFICATIONS**

14. [API Requirements](#api-requirements) → ดูที่ [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)

---

## 1. Authentication

### 1.1 Login Screen

**UI Components:**

- **Logo:** "FallHelp" (สีเขียว) แสดงกลางหน้าจอ ควรมีโฟลเดอร์เก็บ icon ได้จะได้เปลี่ยนได้ตลอด
- **Input Fields:**
  - อีเมล (placeholder: "อีเมล")
  - รหัสผ่าน (placeholder: "รหัสผ่าน") พร้อมไอคอนแสดง/ซ่อนรหัสผ่าน (👁️)
- **Links:**
  - "ลืมรหัสผ่าน ?" (ขวาบน ใต้ช่องรหัสผ่าน)
  - "ยังไม่มีบัญชี ? **สมัครสมาชิก**" (สีแดง #EB6A6A - ด้านล่างปุ่ม)
- **Buttons:**
  - ปุ่ม "เข้าสู่ระบบ" (สีเขียว #16AD78, มุมโค้งมน)

---

### 1.2 Register Screen (สมัครสมาชิก)

**UI Components:**

- **Header:** "ลงทะเบียน" พร้อมปุ่ม Back (←)
- **คำอธิบาย:** "กรุณากรอกรายละเอียดของคุณเพื่อเข้าใช้งาน"
- **Input Fields:**
  - ชื่อ + นามสกุล (2 ช่อง แนวนอน)
  - เพศ: Dropdown (ชาย/หญิง/อื่นๆ)
  - เบอร์โทรศัพท์
  - อีเมล
  - รหัสผ่าน (พร้อมไอคอน 👁️)
- **Password Requirements (แสดงใต้ช่องรหัสผ่าน):**
  - ใช้ตัวอักษร 8 ตัวขึ้นไป
  - มีตัวเลขอย่างน้อย 1 ตัวและตัวพิเศษอื่นๆ
- **Buttons:**
  - ปุ่ม "ลงทะเบียน" (สีเขียว #16AD78)
  - "มีบัญชีอยู่แล้ว ? **เข้าสู่ระบบ**" (สีแดง #EB6A6A)

**Flow After Register:**

1. กดลงทะเบียน → แสดงหน้า "ลงทะเบียนสำเร็จ"
2. ระบบพาไปหน้า Empty State (First-time User) อัตโนมัติ

---

### 1.3 Forgot Password Flow (ลืมรหัสผ่าน)

**Screen 1: Enter Email**

- **Header:** "ลืมรหัสผ่าน" พร้อมปุ่ม Back
- **คำอธิบาย:** "กรุณากรอกอีเมลที่ตรงกับบัญชีของผู้ใช้งาน ระบบจะส่งรหัส OTP ไปยังอีเมลของคุณเพื่อ"
- **Input:** อีเมล
- **Button:** "ส่งรหัส OTP" (สีแดง #EB6A6A)

**Screen 2: OTP Verification**

- **Header:** "OTP"
- **คำอธิบาย:** "เราได้ส่งหมายเลข OTP ไปยังอีเมลของคุณ wattanaroj.bu.66@ubu.ac.th"
- **OTP Input:** 6 ช่อง (แยกกัน)
- **Countdown:** "ไม่ได้รับ OTP ? ส่งคำขอใหม่ใน 0:15 น."
- **Button:** "ยืนยันรหัสผ่าน" (สีแดง #EB6A6A)

**Screen 3: Set New Password**

- **Header:** "ตั้งรหัสผ่านใหม่"
- **คำอธิบาย:** "ตั้งรหัสผ่านใหม่ของคุณอยู่ เพื่อคุณจะสามารถเข้าสู่ระบบได้"
- **Input Fields:**
  - รหัสผ่านใหม่ (พร้อมไอคอน 👁️)
  - ยืนยันรหัสผ่าน (พร้อมไอคอน 👁️)
- **Password Requirements:**
  - ใช้ตัวอักษร 8 ตัวขึ้นไป
  - มีตัวเลขอย่างน้อย 1 ตัวและตัวพิเศษอื่นๆ
- **Button:** "ยืนยันรหัสผ่านใหม่" (สีแดง #EB6A6A)

**Screen 4: Success**

- **Icon:** ✅ เขียว
- **Message:** "**ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว**"
- **Sub-text:** "รอสักครู่ ! ระบบกำลังพาท่านไปหน้าเข้าสู่ระบบ"
- Auto-redirect หรือ Manual "เข้าสู่ระบบ"

---

## 2. Device Setup & Pairing

> **Flow สำหรับผู้ใช้ครั้งแรก (First-time Setup):**  
> Login Success → Empty State → 3-Step Setup (Elder Info → Device Pairing → WiFi Config)

---

### 2.0 Empty State (First-time User)

**หน้า: Empty State**

- **Header:** "ยินดีต้อนรับสู่ FallHelp"
- **Logo:** "Fall:Help" (สีเขียว + สีดำ)
- **ข้อความ:**
  - "ยินดีต้อนรับสู่ FallHelp"
  - "คุณยังไม่มีข้อมูลในระบบ"
- **Icon:** ⊕ (Plus icon ในวงกลม)
- **Button:**
  - ปุ่ม "เพิ่มอุปกรณ์และเริ่มต้นใช้งาน" (สีเขียว #00A86B)

**Navigation:**

- แสดง Bottom Navigation Bar:
  - 🏠 **หน้าหลัก** (Active - สีฟ้า)

**Behavior:**

- เมื่อกดปุ่ม "เพิ่มอุปกรณ์และเริ่มต้นใช้งาน" → ไปหน้า **Step 1: กรอกข้อมูลผู้สูงอายุ**

---

### 2.1 Setup Flow (3 Steps)

**Step Progress Indicator:**

```
     [1] ───────── [2] ──────  [3]
กรอกข้อมูลผู้สูงอายุ  ติดตั้งอุปกรณ์   ตั้งค่า WiFi
```

---

#### **Step 1: กรอกข้อมูลผู้สูงอายุ**

**หน้า: Setup_Step1_Elderly Info**

- **Header:** "Steps" พร้อมปุ่ม Back (←)
- **Progress Bar:**

  - [1] ──── 2 ──── 3
  - กรอกข้อมูลผู้สูงอายุ (Active - สีน้ำเงิน #164F9E )
  - ติดตั้งอุปกรณ์ (Inactive - สีเทา #ACBCC8)
  - ตั้งค่า WiFi (Inactive - สีเทา #ACBCC8)

- **Input Fields:**

  - **ชื่อผู้สูงอายุ** (Text input)
  - **เพศ** (Dropdown: ชาย / หญิง / อื่นๆ)
  - **วัน/เดือน/ปีเกิด** (Date picker: 3 ช่อง แยกกัน - วัน/เดือน/ปีพ.ศ.)
  - **ส่วนสูง** (Number input + "cm") + **น้ำหนัก** (Number input + "kg") แนวนอนแถวเดียวช่องกรอก
  - **โรคประจำตัว หรือ เคยป่วย (ถ้ามี)** (Text area - optional)
  - **ที่อยู่** (Text area - multi-line)

- **หมายเหตุ:**

  - "เพื่อให้เป็นข้อมูลส่วนตัวของคุณใรการติดตามผู้สูงอายุ่และเพิ่งตั้น"

- **Button:**
  - ปุ่ม "ถัดไป" (สีเขียว #16AD78) - ไปยัง Step 2

**Validation:**

- ชื่อผู้สูงอายุ: Required
- เพศ: Required
- วันเกิด: Required (must be valid date)
- ส่วนสูง/น้ำหนัก: Optional (ต้องเป็นตัวเลขเท่านั้น)

---

#### **Step 2: ติดตั้งอุปกรณ์ (Scan QR Code หรือเพิ่มแบบ Manual)**

**หน้า: Setup_Device_Step2_ScanQR**

- **Header:** "Steps" พร้อมปุ่ม Back (←)
- **Progress Bar:**

  - 1 ──── [2] ──── 3
  - กรอกข้อมูลผู้สูงอายุ (Completed - ✓ สีเขียว #16AD78)
  - **ติดตั้งอุปกรณ์** (Active - สีน้ำเงิน #164F9E)
  - ตั้งค่า WiFi (Inactive - สีเทา #ACBCC8)

- **Header Text:** "เชื่อมต่ออุปกรณ์"
- **QR Code Scanner:**

  - แสดงกรอบสี่เหลี่ยม QR Scanner (Camera View)
  - ข้อความ: "กรุณาสแกน QR Code บนอุปกรณ์"
  - ข้อความ: "เพื่อเริ่มเชื่อมต่ออุปกรณ์ให้ทำงานกับระบบของคุณ"

- **ลิงก์ Alternative:**
  - "ไม่พบอุปกรณ์ของคุณ? **กรอกรหัสอุปกรณ์ด้วยตนเอง**" (สีแดง #EB6A6A)
  - → คลิกแล้วไปหน้า **Manual Device Entry**

**Success State:**

- Scan สำเร็จ → แสดง Modal/Screen:
  - ✅ ไอคอนสีเขียว
  - "เชื่อมต่ออุปกรณ์เรียบร้อยแล้ว"
  - Auto-redirect (2 วินาที) → Step 3: ตั้งค่า WiFi

---

**หน้า: Setup_Device_Step2_Manual** (กรณี Scan QR ไม่ได้)

- **Header:** "รหัสอุปกรณ์" พร้อมปุ่ม Back (←)
- **Progress Bar:** เหมือนหน้า Scan QR
- **คำอธิบาย:**

  - "กรุณากรอกรหัส MAC Address 12 หลัก"
  - "ที่ติดบนสติ๊กเกอร์ของอุปกรณ์"
  - **ตัวอย่าง:** "3C:71:BF:8A:F0:B4"

- **Input Fields:**

  - **รหัสอุปกรณ์** (Text input - MAC Address format: XX:XX:XX:XX:XX:XX)
    - Placeholder: "3C:71:BF:8A:F0:B4"
    - Auto-format with colons (:) ทุก 2 ตัว

- **Button:**
  - ปุ่ม "ยืนยัน" (สีเขียว #16AD78) - Verify and pair device

**Success State:**

- ✅ "เชื่อมต่ออุปกรณ์เรียบร้อยแล้ว"
- → Step 3: ตั้งค่า WiFi

**Error Handling:**

- MAC Address ไม่ถูกต้อง: "รูปแบบรหัสไม่ถูกต้อง กรุณากรอกใหม่"
- Device ไม่พบในระบบ: "ไม่พบอุปกรณ์นี้ในระบบ กรุณาตรวจสอบรหัสอีกครั้ง"
- Device ถูกใช้งานแล้ว: "อุปกรณ์นี้ถูกใช้งานแล้ว"

---

#### **Step 3: ตั้งค่า WiFi (แบบ Scan List หรือ Manual)**

**หน้า: Setup_Step3_Wifi**

- **Header:** "Steps" พร้อมปุ่ม Back (←)
- **Progress Bar:**

  - 1 ──── 2 ──── [3]
  - กรอกข้อมูลผู้สูงอายุ (Completed - ✓ สีเขียว #16AD78)
  - ติดตั้งอุปกรณ์ (Completed - ✓ สีเขียว #16AD78)
  - **ตั้งค่า WiFi** (Active - สีน้ำเงิน #164F9E)

- **Header Text:** "ตั้งค่าเครือข่าย WiFi สำหรับอุปกรณ์"
- **คำอธิบาย:**
  - "เลือก WiFi จากรายการ หรือกรอกด้วยตนเองสำหรับเครือข่ายที่ซ่อน SSID"
  - **สิทธิ์การเข้าถึง:** Owner และ Editor เท่านั้นที่สามารถตั้งค่า WiFi ได้

---

**🔍 Mode 1: รายการ WiFi ที่พบ (WiFi Scanner List)**

> **เทคโนโลยี React Native WiFi Scanner:**
>
> - **iOS:** ใช้ [react-native-network-info](https://github.com/pusherman/react-native-network-info) หรือ [react-native-wifi-reborn](https://github.com/JuanSeBestia/react-native-wifi-reborn)
> - **Android:** รองรับการแสกน WiFi ผ่าน WiFi Manager API
> - **ข้อจำกัด iOS:** ตั้งแต่ iOS 13+ ไม่สามารถดึงรายการ WiFi ได้โดยตรง (เว้นแต่จะเปิด Hotspot/Location Permission)
> - **แนะนำ:** ใช้ร่วมกับ Manual Input สำหรับ iOS ที่ไม่อนุญาต

- **UI Components:**

  - **ปุ่ม Refresh:** "รีเฟรชรายการ WiFi" (ไอคอน 🔄) - อยู่มุมขวาบน
  - **WiFi List (Scrollable):**

    ```
    ┌─────────────────────────────────────┐
    │ 📶 ฐานลับ           🔒 WPA2   [>] │ <- ระดับสัญญาณเต็ม (สีเขียว)
    ├─────────────────────────────────────┤
    │ 📶 TrueMove_5GHz    🔒 WPA2   [>] │ <- สัญญาณปานกลาง (สีเหลือง)
    ├─────────────────────────────────────┤
    │ 📶 AIS_Fiber_2.4G   🔓 Open   [>] │ <- สัญญาณอ่อน (สีแดง)
    ├─────────────────────────────────────┤
    │ ➕ กรอก WiFi ด้วยตนเอง              │ <- ลิงก์ไปหน้า Manual
    └─────────────────────────────────────┘
    ```

  - **การแสดงผล:**
    - **SSID Name** (ชื่อ WiFi) - ตัวหนา
    - **Signal Strength Icon:**
      - 📶 เต็ม 4 ขีด (สีเขียว) = -50 dBm หรือสูงกว่า
      - 📶 3 ขีด (สีเหลือง) = -60 ถึง -50 dBm
      - 📶 2 ขีด (สีส้ม) = -70 ถึง -60 dBm
      - 📶 1 ขีด (สีแดง) = ต่ำกว่า -70 dBm
    - **Security Type:** 🔒 WPA2/WPA3 หรือ 🔓 Open
    - **Chevron (>)** - คลิกเพื่อเชื่อมต่อ

- **Behavior:**

  1. **Load Screen:** แสดง Spinner "กำลังค้นหาเครือข่าย WiFi..."
  2. **แสกนสำเร็จ:** แสดงรายการ WiFi เรียงตาม Signal Strength (แรงสุดก่อน)
  3. **คลิกเลือก WiFi:**
     - **ถ้ามี Password (🔒):** แสดง Modal กรอก Password
     - **ถ้า Open (🔓):** เชื่อมต่อทันที (ยืนยันก่อน)
  4. **Refresh:** กดปุ่ม 🔄 แสกนใหม่ (Animation หมุน)

- **Modal: กรอกรหัสผ่าน WiFi (เมื่อเลือก WiFi ที่มีรหัส)**

  ```
  ┌────────────────────────────────────┐
  │  เชื่อมต่อกับ "ฐานลับ"            │
  ├────────────────────────────────────┤
  │  [รหัสผ่าน WiFi]  👁️              │
  │  Placeholder: "กรอกรหัสผ่าน"      │
  ├────────────────────────────────────┤
  │       [ยกเลิก]    [เชื่อมต่อ]     │
  └────────────────────────────────────┘
  ```

  - **Input:** Password input พร้อมไอคอน 👁️ แสดง/ซ่อน
  - **Button:**
    - ยกเลิก (สีเทา) - ปิด Modal
    - เชื่อมต่อ (สีเขียว #16AD78) - ส่ง SSID + Password ไป Backend

---

**✍️ Mode 2: กรอก WiFi ด้วยตนเอง (Manual Input)**

> **ใช้สำหรับ:**
>
> - WiFi ที่ซ่อน SSID (Hidden Network)
> - iOS ที่ไม่อนุญาตให้แสกน WiFi
> - กรณีไม่พบ WiFi ที่ต้องการในรายการ

- **Input Fields:**

  - **ชื่อ WiFi (SSID)** (Text input)
    - Placeholder: "ชื่อเครือข่าย WiFi ของคุณ"
  - **รหัสผ่าน WiFi** (Password input พร้อมไอคอน 👁️ แสดง/ซ่อน)
    - Placeholder: "รหัสผ่าน WiFi"

- **Button:**
  - ปุ่ม "เชื่อมต่อ" (สีเขียว #16AD78)

**Success State:**

- ✅ ไอคอนสีเขียว
- **ข้อความ:**
  - "เชื่อมต่อ WiFi ให้เครื่องเรียบร้อยแล้ว"
  - "บันทึกข้อมูลสูงอายุสำเร็จ"
  - "และเชื่อมต่ออุปกรณ์เข้ากับเครื่องเรียบร้อยแล้ว"
  - "ระบบกำลังโหลด.."
- Auto-redirect (3 วินาที) → **Dashboard Home**

**Loading State:**

- แสดง Spinner + "กำลังเชื่อมต่อ WiFi กับอุปกรณ์..."
- Timeout: 30 วินาที (ถ้าไม่สำเร็จ → Error Message)

**Error Handling:**

- WiFi Connection Failed: "ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบชื่อและรหัสผ่าน WiFi"
- Device Offline: "ไม่สามารถติดต่ออุปกรณ์ได้ กรุณาตรวจสอบว่าอุปกรณ์เปิดอยู่"

---

### 2.2 Re-configure WiFi/Device (จาก Settings)

**หมายเหตุ:** Flow นี้ใช้สำหรับผู้ใช้ที่ต้องการเปลี่ยน WiFi หรือเพิ่มอุปกรณ์ใหม่หลังจาก Setup เสร็จแล้ว

#### **จาก Settings Menu:**

**หน้า: Setting Menu**

- **เมนู:**
  1. **ตั้งค่าการเชื่อม WiFi ใหม่** → หน้าตั้งค่า WiFi (เหมือน Step 3)
  2. จัดการสมาชิก → Invite Members Flow
  3. แชร์ข้อมูลระบบ → Share Feature

---

## 3. Dashboard & Real-time Monitoring

> **หน้านี้แสดงหลังจาก Setup 3 Steps เสร็จสิ้น**
>
> **📍 ตำแหน่งในแอป:** ปุ่มนำทาง "หน้าหลัก" (🏠)

### 3.1 Dashboard Home (หน้าหลัก)

**หน้า: Dashboard Home**

- **Header:**
  - Logo: "Fall:Help" (Fall = สีเขียว, Help = สีดำ)
  - ไอคอนโปรไฟล์ (มุมขวาบน 👤) - กดเพื่อไปหน้า Profile
- **Status Bar:**
  - เวลา: "10:00"
  - สัญญาณ: WiFi + Battery

**Layout:**

- Title: "ภาพรวม" (ด้านบน)

---

### 3.2 สถานะ 3 การ์ด (Real-time Status Cards)

#### **การ์ด 1: สถานะของอุปกรณ์**

**UI Components:**

- **Title:** "สถานะของอุปกรณ์"
- **Status Badge:** "เชื่อมต่อแล้ว" (สีเขียว #00A86B, พื้นหลังสีเขียวอ่อน)
- **Styles:** การ์ดพื้นขาว, มุมโค้งมน, เงาเบา

**States:**

- ✅ **ONLINE:** "เชื่อมต่อแล้ว" (สีเขียว)
- ❌ **OFFLINE:** "ออฟไลน์" (สีเทา/แดง)
- ⚠️ **CONNECTING:** "กำลังเชื่อมต่อ..." (สีเหลือง)

---

#### **การ์ด 2: สถานะการหกล้ม**

**UI Components:**

- **Title:** "สถานะการหกล้ม"
- **Status Badge:** "ปกติ" (สีฟ้า #4A90E2)
- **Buttons:** ปุ่ม "ปกติ" (สีฟ้า, ไม่มี action)
- **Timestamp:** "อัปเดตล่าสุด : 10:05 น."

**States:**

- 🟦 **NORMAL:** "ปกติ" (สีฟ้า) - No fall detected
- 🟨 **WARNING:** "ตรวจพบการหกล้ม" (สีเหลือง) - Fall detected, 30s timer active
- 🟥 **EMERGENCY:** "ฉุกเฉิน" (สีแดง) - Emergency contacts called

---

#### **การ์ด 3: สถานะของชีพจร (Heart Rate Monitor)**

**UI Components:**

- **Title:** "สถานะของชีพจร"
- **Status Badge:** "ปกติ" (สีฟ้า #4A90E2)
- **BPM Display:** ❤️ "90 BPM" (ไอคอนหัวใจสีแดง-ชมพู #FF6B9D, ตัวเลขใหญ่)
- **Buttons:** ปุ่ม "ปกติ" (สีฟ้า, ไม่มี action)
- **Timestamp:** "อัปเดตล่าสุด : 10:05 น."

**BPM Ranges & States:**

- 🟢 **NORMAL (60-100 BPM):** "ปกติ" - สีฟ้า
- 🔵 **LOW (< 60 BPM):** "ต่ำกว่าเกณฑ์ปกติ" - สีฟ้าเข้ม
- 🔴 **HIGH (> 100 BPM):** "สูงกว่าปกติ" - สีแดง

**Real-time Updates:**

- อัปเดตทุก 5 วินาที (Socket.io)
- แสดง Animation เมื่อ BPM เปลี่ยน

---

### 3.3 ข้อมูลผู้สูงอายุ (Elder Info Card)

**หน้า: ข้อมูลผู้สูงอายุ**

- **Header:** "ข้อมูลผู้สูงอายุ"
- **Layout:** การ์ดพื้นขาว, มุมโค้งมน
- **แสดงข้อมูล:**
  - 👤 Icon (ไอคอนโปรไฟล์ผู้สูงอายุ)
  - **ชื่อ:** "นางลาลิต นางสมศรี" (ตัวหนา)
  - **เพศ:** "หญิง"
  - **อายุ:** "66 ปี" (คำนวณจากวันเกิด)
- **Action:**
  - **ลูกศร →** (ด้านขวา) - กดเพื่อไปหน้า "Manage elderly info" (ดูรายละเอียดเต็ม)

---

### 3.4 ปุ่มโทรฉุกเฉิน (Emergency Call Button)

**UI Components:**

- **Button Style:**
  - 📞 ไอคอนโทรศัพท์สีขาว
  - พื้นหลัง: สีแดง #FF4444
  - ขนาด: ใหญ่, มุมโค้งมน
  - ข้อความ: "เพิ่มเบอร์ติดต่อฉุกเฉิน" (สีขาว, ตัวหนา)

**Behavior:**

- ถ้า **ยังไม่มีเบอร์ฉุกเฉิน:** กดแล้วไปหน้า "Add emergency number info"
- ถ้า **มีเบอร์ฉุกเฉิน:** กดแล้วไปหน้า "Manage emergency number" (รายการเบอร์)

**API:**

- `GET /api/elders/:elderId/emergency-contacts` - Check if contacts exist

---

### 3.5 Bottom Navigation (Navigation Bar)

**Navigation Bar:** (ติดด้านล่างสุด - แสดงทุกหน้าจอหลัก)

- 🏠 **หน้าหลัก** (สีฟ้า #4A90E2 - Active State)
  - Label: "หน้าหลัก"
  - **เข้าถึงได้:**
    - Dashboard & Real-time Monitoring (Section 3)
    - Elder Management (Section 4) - ผ่านการ์ด "ข้อมูลผู้สูงอายุ"
    - Emergency Contact Management (Section 5) - ผ่านปุ่ม "เพิ่มเบอร์ติดต่อฉุกเฉิน"
    - Profile Management (Section 6) - ผ่านไอคอนโปรไฟล์มุมขวาบน (👤)
- 🕐 **ประวัติการหกล้ม** (สีเทา - Inactive)
  - Label: "ประวัติการหกล้ม"
  - **เข้าถึงได้:**
    - History & Reports (Section 7)
- ☰ **ตั้งค่า** (สีเทา - Inactive)
  - Label: "ตั้งค่า"
  - **เข้าถึงได้:**
    - Settings Menu (Section 8)
      - ตั้งค่าการเชื่อม WiFi ใหม่
      - จัดการสมาชิก (Member Management)
        - เชิญสมาชิก (Owner only)
        - กำหนดสิทธิ์: Editor (แก้ไขได้), Viewer (ดูได้อย่างเดียว)
      - ออกจากระบบ

**Styles:**

- พื้นหลัง: สีขาว
- Border-top: เส้นบางสีเทาอ่อน
- Icon + Text (แนวตั้ง)
- Active state: สีฟ้า, ตัวหนา

---

### 3.6 Dashboard States & Scenarios

#### **Scenario 1: Setup เสร็จใหม่ (First Load)**

```
Setup Success (WiFi Connected)
    ↓
Auto-redirect (3 วินาที)
    ↓
Dashboard Home
    ├─ สถานะอุปกรณ์: "เชื่อมต่อแล้ว" (เขียว)
    ├─ สถานะการหกล้ม: "ปกติ" (ฟ้า)
    ├─ สถานะชีพจร: "90 BPM" "ปกติ" (ฟ้า)
    ├─ ข้อมูลผู้สูงอายุ: แสดงชื่อ + เพศ + อายุ
    └─ ปุ่มฉุกเฉิน: "เพิ่มเบอร์ติดต่อฉุกเฉิน" (แดง)
```

#### **Scenario 2: Fall Detection Triggered**

```
IoT Device detects fall
    ↓
Socket Event: `fall:detected`
    ↓
Dashboard Update:
    ├─ การ์ดหกล้ม: "ตรวจพบการหกล้ม" (เหลือง)
    ├─ แสดงปุ่ม "ยกเลิก" + Timer 30 วินาที
    │   └─ *คำอธิบาย:* ช่วงเวลานี้คือการรอให้ผู้สูงอายุกดปุ่มยกเลิกที่อุปกรณ์ (False Alarm) หากพ้นเวลาให้สันนิษฐานว่าเกิดเหตุจริง (Silence implies Emergency) หรือหากญาติมีช่องทางตรวจสอบอื่น (เช่น กล้อง) ก็สามารถกดยกเลิกแทนได้ (Backup)
    ├─ Push Notification ส่งไปหา caregivers ทุกคน
    └─ ถ้าไม่กด "ยกเลิก" ภายใน 30s → เปลี่ยนสถานะเป็น "Confirmed" (แดง) และแสดงปุ่มโทรฉุกเฉิน
```

#### **Scenario 3: Heart Rate Anomaly**

```
BPM > 100 or BPM < 60
    ↓
Socket Event: `heartrate:anomaly`
    ↓
Dashboard Update:
    ├─ การ์ดชีพจร: "120 BPM" "สูงกว่าปกติ" (แดง)
    ├─ Push Notification: "ชีพจรผิดปกติ"
    └─ แสดงเวลาอัปเดต
```

#### **Scenario 4: Device Offline**

```
Device ไม่ส่งสัญญาณ > 2 นาที
    ↓
Socket Event: `device:status` (OFFLINE)
    ↓
Dashboard Update:
    ├─ การ์ดอุปกรณ์: "ออฟไลน์" (เทา/แดง)
    ├─ การ์ดหกล้ม: "ไม่สามารถตรวจจับได้" (เทา)
    ├─ การ์ดชีพจร: "ไม่มีข้อมูล" (เทา)
    └─ Push Notification: "อุปกรณ์ขาดการเชื่อมต่อ"
```

---

## 4. Elder Management

> **📍 ตำแหน่งในแอป:** ปุ่มนำทาง "หน้าหลัก" (🏠) → คลิกการ์ด "ข้อมูลผู้สูงอายุ"

### 4.1 Manage elderly info (ดูข้อมูล)

**หน้า: Manage elderly info**

- **Header:** "ข้อมูลผู้สูงอายุ"
- **แสดงข้อมูล:**
  - ชื่อผู้สูงอายุ: "นางลาลิต นางสมศรี"
  - เพศ: "หญิง"
  - วัน/เดือน/ปีเกิด: "04/ธันวาคม/2502"
  - ส่วนสูง: "161" cm
  - น้ำหนัก: "52" kg
  - โรคประจำตัว: "ไม่มี"
  - ที่อยู่: "20 ม.3 ต.ลาดบัว อ.เมืองพิจิตร จ.พิจิตร 34190"
- **Button:**
  - ปุ่ม "แก้ไขข้อมูล" (สีเทา)

---

### 4.2 Update elderly info (แก้ไขข้อมูล)

**หน้า: Update elderly info**

- **Header:** "แก้ไขข้อมูลผู้สูงอายุ"
- **ฟิลด์:**
  - ชื่อผู้สูงอายุ
  - เพศ (Dropdown: ชาย / หญิง)
  - วัน/เดือน/ปีเกิด
  - ส่วนสูง (cm)
  - น้ำหนัก (kg)
  - โรคประจำตัว (หรือ เคยป่วย) (KM)
  - ที่อยู่
- **Button:**
  - ปุ่ม "บันทึกข้อมูล" (สีเขียว)

**หน้า: Manage elderly info Update (หลังอัปเดตสำเร็จ)**

- แสดงข้อมูลที่อัปเดตแล้ว
- **Button:**
  - ปุ่ม "แก้ไขข้อมูล" (สีเทา)

---

## 5. Emergency Contact Management

> **📍 ตำแหน่งในแอป:** ปุ่มนำทาง "หน้าหลัก" (🏠) → ปุ่ม "เพิ่มเบอร์ติดต่อฉุกเฉิน" หรือ "จัดการเบอร์ฉุกเฉิน"

### 5.1 Empty state Manage emergency

**หน้า: Empty state Manage emergency**

- **ข้อความ:**
  - "ยังไม่มีเบอร์ติดต่อฉุกเฉิน"
- **Button:**
  - 📞 ปุ่ม "เพิ่มเบอร์ติดต่อฉุกเฉิน" (สีเขียว + ไอคอนโทรศัพท์)

---

### 5.2 Add emergency number info

**หน้า: Add emergency number info**

- **Header:** "เพิ่มเบอร์ติดต่อฉุกเฉิน"
- **ฟิลด์:**
  - ชื่อผู้ติดต่อ
  - เบอร์ติดต่อ
- **Button:**
  - ปุ่ม "ยืนยัน" (สีเขียว)

---

### 5.3 Manage emergency number (รายการเบอร์)

**หน้า: Manage emergency number**

- **Header:** "รายชื่อเบอร์ติดต่อฉุกเฉิน"
- **ข้อความแนะนำ:**
  - "จัดลำดับความสำคัญผู้ติดต่อฉุกเฉิน 3 ลำดับ"
- **รายการเบอร์ติดต่อ:**
  - **1. ลูกชาย** - 8022 →
  - **2. ญาติ** - 0871642321 →
  - **3. ญาติ** - 0871642321 →
- **Button:**
  - 📞 ปุ่ม "เพิ่มเบอร์ติดต่อฉุกเฉิน" (สีเขียว)

**หมายเหตุ:**

- แต่ละรายการมีลูกศร → (กดเพื่อดูรายละเอียด)
- สามารถลากเพื่อจัดลำดับความสำคัญได้

---

### 5.4 emergency number info (ดูรายละเอียด)

**หน้า: emergency number info**

- **Header:** "ข้อมูลเบอร์ติดต่อฉุกเฉิน"
- **แสดงข้อมูล:**
  - **ชื่อ:** "ญาติ"
  - **เบอร์:** "0871642321"
- **ลิงก์:**
  - "แก้ไขเบอร์ติดต่อฉุกเฉิน" (สีฟ้า)
- **ไอคอน:**
  - 🗑️ ปุ่มลบ (มุมขวาบน)

---

## 6. Profile Management

> **📍 ตำแหน่งในแอป:** ปุ่มนำทาง "หน้าหลัก" (🏠) → ไอคอนโปรไฟล์มุมขวาบน (👤)

### 6.1 Manage Profile Info (หน้าหลักการเริ่มหน้า Profile)

**หน้า: Manage Profile Info**

- แสดงไอคอนโปรไฟล์ (user icon)
- **ฟิลด์แสดงข้อมูล:**
  - ชื่อ
  - นามสกุล
  - เพศ
  - เบอร์โทรศัพท์
  - อีเมล
  - รหัสผ่าน ส่วนนี้ไม่โชว์รหัสผ่านนะ แต่ทำให้ผู้ใช้เห็นว่ามีตัวเลือกที่เราจะอัปเดตหรือเปลี่ยนรหัสผ่านได้

---

### 6.2 Update Info Profile Picture

**หน้า: Update Info Profile Picture**

- อัปโหลดรูปโปรไฟล์
- **ฟิลด์แก้ไข:**
  - ชื่อ
  - นามสกุล
  - เพศ
  - เบอร์โทร
  - อีเมล
  - รหัสผ่าน
- **Buttons:**
  - ปุ่ม "แก้ไขข้อมูล" (สีเทา) แถวเดียวของแต่ละฟิลด์เพื่อที่จะเลือกจะแก้ส่วนไหนได้อิสระ
  - เมื่อกดแก้ไขจะไปยังหน้าอัปเดตข้อมูลของคุณของส่วนหน้าอัปเดตข้อมูลของคุณ, หน้าอัปเดตหมายเลขโทรศัพท์, หน้าอัปเดตอีเมล,
    หน้าอัปเดตรหัสผ่าน

---

### 6.3 Update Info User (เอัปเดตข้อมูลของคุณ)

**หน้า: Update Info User**

- **ฟิลด์:**
  - ชื่อ + นามสกุล (2 ช่อง แนวนอน)
  - เพศ: Dropdown (ชาย/หญิง/อื่นๆ)
- **Button:**
  - ปุ่ม "บันทึกข้อมูล" (สีเขียว)

---

### 6.4 Update Info Phone (อัปเดตหมายเลขโทรศัพท์)

**หน้า: Update Info Phone**

- **ฟิลด์:**
  - เบอร์โทรศัพท์ เพิ่มเติมคือเป็นส่วนของ ญาติผู้ดูแลเท่านั้น ถ้านับเป็นการทำส่วนนี้
- **Button:**
  - ปุ่ม "ยืนยันข้อมูล" (สีเขียว)

---

### 6.5 Update Info Email (หน้าอัปเดตอีเมล)

**หน้า: Update Info Email**

- **ฟิลด์:**
  - อีเมล
- **Button:**
  - ปุ่ม "ยืนยันข้อมูล" (สีเขียว)

---

### 6.6 Update Info Password (หน้าอัปเดตรหัสผ่าน)

**หน้า: Update Info Password**

- **ฟิลด์:**
  - รหัสผ่าน
- **Button:**
  - ปุ่ม "ยืนยันข้อมูล" (สีเขียว)

---

## 7. History & Reports

> **📍 ตำแหน่งในแอป:** ปุ่มนำทาง "ประวัติการหกล้ม" (🕐)

### 7.1 ประวัติการตรวจกล้ม

**หน้า: History**

- **Header:** "ประวัติการตรวจกล้ม"
- **รายการประวัติ:**
  - **3.** 21/09/2566 เวลา 16:40 น. - **สีม** - 112 BPM
  - **2.** 16/07/2566 เวลา 13:00 น. - **ปกติ** - 50 BPM (ต่ำกว่าเกณฑ์ปกติ)
  - **1.** 04/07/2566 เวลา 16:00 น. - **สีม** - 90 BPM (ช่วงสถานะปกติ)
- แต่ละรายการมีลูกศร → (กดเพื่อดูรายละเอียด)

---

### 7.2 Report summary

**หน้า: Report summary**

- **Header:** "รายงานสรุปประจำเดือน"
- **เลือกเดือน:**
  - ← กรกฎาคม 2566 →
- **กรอบสีเขียว:**
  - แสดงข้อมูลสรุป
  - แสดงข้อมูล:
    - "ช่วงเวลาที่เกิดเหตุการณ์มากที่สุด: 16:00 - 18:00 น."
    - "จำนวนเหตุการณ์หกล้ม: 3 ครั้ง"
    - "ชีพจรผิดปกติ: ชีพจรสูง 3 ครั้ง
      ชีพจรต่ำ 1 ครั้ง"

---

## 8. Settings

> **📍 ตำแหน่งในแอป:** ปุ่มนำทาง "ตั้งค่า" (☰)

### 8.1 Setting Menu

**หน้า: Setting**

- **Header:** "ตั้งค่า"
- **เมนู:**
  1. **ตั้งค่าการเชื่อม WiFi ใหม่** → Re-configure WiFi (Step 3)
  2. **ตั้งค่าการเชื่อมอุปกรณ์ใหม่** → Re-pair Device (Step 2)
  3. **จัดการสมาชิก** → Multi-User Access & Member Management (Section 8.3)
  4. **ออกจากระบบ (Logout)** → Logout Confirmation Modal (Section 8.2)

---

### 8.2 Logout Confirmation

**หน้า: Logout**

- **Modal Overlay:** (พื้นหลังสีเทา)
- **Modal Content:**
  - "ยืนยันการออกจากระบบของคุณหรือไม่?"
  - **Buttons:**
    - ปุ่ม "ใช่" (สีแดง)
    - ปุ่ม "ยกเลิก" (สีเทา)

---

### 8.3 Multi-User Access & Member Management

> **📍 เข้าถึงจาก:** Settings Menu → เมนู "จัดการสมาชิก"

**🔑 Access Level (ระดับสิทธิ์):**

1. **ญาติผู้ดูแลหลัก (Owner/Primary Caregiver)**

   - สิทธิ์เต็ม: อ่าน, แก้ไข, ลบ ทุกอย่าง
   - สามารถเชิญสมาชิกอื่นได้
   - จัดการสิทธิ์ของสมาชิกอื่นได้
   - ลบสมาชิกอื่นออกได้

2. **สมาชิกที่ถูกเชิญ (Member/Viewer - VIEW_ONLY)**
   - สิทธิ์อ่านอย่างเดียว: ดูข้อมูลผู้สูงอายุ, ดูแดชบอร์ด, ดูประวัติ
   - **ไม่สามารถ:** แก้ไขข้อมูล, ลบข้อมูล, เชิญสมาชิก, ตั้งค่าอุปกรณ์/WiFi
   - รับการแจ้งเตือน Real-time เหมือนญาติหลัก
   - สามารถโทรฉุกเฉินได้ (ถ้ามีเหตุการณ์หกล้ม)

#### 8.3.1 Manage members info (รายชื่อสมาชิก)

**หน้า: Manage members info**

- **Header:** "รายชื่อสมาชิกทั้งหมดในกลุ่ม"
- **ข้อความแนะนำ:**
  - "สามารถแชร์ข้อมูลให้ญาติผู้ดูแลท่านอื่นเพื่อดูแลผู้สูงอายุร่วมกัน"
  - "สมาชิกที่ถูกเชิญจะมีสิทธิ์ดูข้อมูลอย่างเดียว (ไม่สามารถแก้ไขหรือลบ)"
- **รายการสมาชิก:**
  - รายการสมาชิกแต่ละคน:
    - ไอคอน 👤 (user icon Profile )
    - **ชื่อ:** "ชื่อ อีเมล"
    - **Badge:** "👑 ญาติหลัก" (สีทอง) หรือ "👁️ สมาชิก" (สีเทา)
    - ปุ่ม **"ลบ"** ❌ (สีแดง - มุมขวา) - **เฉพาะญาติหลักเท่านั้น**
  - แสดงข้อมูลสมาชิก 2 คน ตามรูป
- **Button:**
  - ปุ่ม "เชิญสมาชิกเข้ากลุ่มของคุณ" (สีเขียว #00A86B)

---

#### 8.3.2 Invite Members (เชิญสมาชิกผู้ดูแล)

**หน้า: Invite members**

- **Header:** "เชิญสมาชิกผู้ดูแล" พร้อมปุ่ม Back (←)
- **ข้อความแนะนำ:**
  - "กรุณากรอกอีเมลผู้ใช้ที่คุณต้องการเชิญ"
  - "สมาชิกจะได้รับสิทธิ์ดูข้อมูลอย่างเดียว (ไม่สามารถแก้ไขหรือลบ)"
- **Input Field:**
  - **อีเมล** (Text input)
  - Placeholder: "อีเมล"
- **Button:**
  - ปุ่ม "ยืนยัน" (สีเขียว #00A86B)

---

#### 8.3.3 Manage Members Info (รายชื่อสมาชิกที่เชิญแล้ว)

**หน้า: Manage Members Info**

- **Header:** "รายชื่อสมาชิกผู้ดูแล"
- **คำอธิบาย:**
  - "สถานะจ่ายคำผู้เข้าเชื่อมต่อไปเห็นกับ เพื่อให้สมาชิกมีช่องทางนี้ในตนเอง"
- **รายการสมาชิก:**
  - จัดการละ 2 คน (ตามรูป)
  - แต่ละรายการ:
    - 👤 ไอคอน User
    - **ชื่อ:** "ชื่อ อีเมล"
    - ปุ่ม **"ลบ"** (สีแดง) - มุมขวา
- **Button:**
  - ปุ่ม "เชิญสมาชิกเข้ากลุ่มของคุณ" (สีเขียว)

---

#### 8.3.4 Invite Success (เชิญสำเร็จ)

**หน้า: Invite members Success**

- ✅ **ไอคอนสีเขียว** (กลางหน้าจอ)
- **ข้อความ:**
  - "**เชิญสมาชิกผู้ดูแลคนอื่น**"
  - "**เรียบร้อยแล้ว**"
- **Behavior:**
  - Auto-redirect (2-3 วินาที) → กลับไปหน้า "Manage members info"
  - หรือ Manual: ปุ่ม "เสร็จสิ้น"

---

## 9. Admin Panel (Vite + React)

> **👨‍💻 ผู้ใช้งาน:** System Administrator / Support Team  
> **🖥️ Platform:** Vite + React + TypeScript + TailwindCSS  
> **🎯 วัตถุประสงค์:** จัดการระบบ, ตรวจสอบข้อมูล, Support ผู้ใช้งาน

### 9.1 ภาพรวมของ Admin Panel

**Admin Panel** เป็นเครื่องมือสำหรับผู้ดูแลระบบในการ:

**1. ลงทะเบียนอุปกรณ์และสร้าง QR Code**

- เพิ่มอุปกรณ์ใหม่เข้าระบบ
- กรอก Device ID, MAC Address
- สร้าง QR Code สำหรับ Pairing
- ดาวน์โหลด QR Code เพื่อติดบนอุปกรณ์
- ดูรายการอุปกรณ์ที่ลงทะเบียนแล้ว

**2. Dashboard ภาพรวมระบบ**

- จำนวนผู้ใช้งานทั้งหมด (Total Users)
- จำนวนผู้ใช้งานที่ Active
- จำนวนอุปกรณ์ที่ลงทะเบียน (Total Devices)
- จำนวนอุปกรณ์ที่เชื่อมต่ออยู่ (Active Devices)
- ข้อมูลสรุปเบื้องต้น

---

### 9.2 ฟีเจอร์หลัก

#### 9.2.1 ลงทะเบียนอุปกรณ์ใหม่

**หน้า: Register New Device**

- **Form Fields:**
  - Device ID (Text input)
  - MAC Address (Text input - Format: XX:XX:XX:XX:XX:XX)
  - Device Name (Optional)
  - Note/Description (Optional)
- **Button:**
  - ปุ่ม "สร้าง QR Code" (สีเขียว)

**หลังจากสร้างสำเร็จ:**

- แสดง QR Code บนหน้าจอ
- ปุ่ม "ดาวน์โหลด QR Code" (PNG/PDF)
- ปุ่ม "Print QR Code"
- แสดงข้อมูล: Device ID, MAC Address
- แนะนำให้ติด QR Code บนอุปกรณ์

---

#### 9.2.2 Dashboard ภาพรวม

**หน้า: Admin Dashboard**

**การ์ดแสดงข้อมูลสรุป (Cards):**

1. **Total Users**

   - จำนวนผู้ใช้งานทั้งหมด
   - ไอคอน 👥

2. **Active Users**

   - จำนวนผู้ใช้ที่ Active (Login ภายใน 30 วัน)
   - ไอคอน ✅

3. **Total Devices**

   - จำนวนอุปกรณ์ที่ลงทะเบียนแล้ว
   - ไอคอน 📱

4. **Active Devices**
   - จำนวนอุปกรณ์ที่เชื่อมต่ออยู่ (Online)
   - ไอคอน 🟢

**ตารางรายการอุปกรณ์ (Device List Table):**

- Device ID
- MAC Address
- Status (Online/Offline)
- Paired With (ผู้ใช้งาน)
- Registration Date

---

### 9.3 การเข้าถึง Admin Panel

**วิธีการเข้าใช้:**

1. **Authentication:**

   - Admin ต้อง Login ผ่าน Admin Panel ด้วย Email และ Password
   - ใช้ JWT Token สำหรับ Authentication

2. **การเชื่อมต่อ:**
   - Admin Panel เชื่อมต่อกับ Backend API ผ่าน REST APIs
   - ใช้ React Query สำหรับ Data Fetching

---

---

# 🔔 BEHAVIOR & STATES

> **ส่วนนี้อธิบายพฤติกรรม, การแจ้งเตือน, แลมสถานะต่างๆ ของระบบ**  
> **ไม่ใช่หน้าจอหลักที่เข้าถึงผ่าน Navigation แต่เป็นส่วนเสริมที่ทำงานร่วมกับหน้าหลักต่างๆ**

---

## 10. Notifications & Alertss

> **ประเภท:** Push Notifications, Real-time Alerts, Status Updates  
> **แสดงที่:** Dashboard Home (Section 3) - การ์ดสถานะต่างๆ

### 10.1 Dashboard Home Push notifications

**แจ้งเตือน 3 ประเภท:**

#### **1. สถานะของอุปกรณ์**

- **สี:** สีเขียว
- **ข้อความ:** "สถานะของอุปกรณ์เชื่อมต่อแล้ว"
- **สถานะ:** "เชื่อมต่อแล้ว" (สีเขียว)

#### **2. สถานะการหกล้ม**

- **สี:** สีเหลือง (WARNING)
- **ข้อความ:** "สถานะการหกล้ม"
- **อัปเดตล่าสุด:** "อัปเดตล่าสุด : 10:05 น."
- **สถานะ:** "สีเหลือง" (ปุ่มสีเหลือง) ใช้แสดงสถานะเท่านั้น คำว่าปุ่ม หมายเหตุ: แล้วก็จะมีปุ่มที่เป็นอันเดอสกอ_อยู่ใต้ปุ่มสีเหลืองของสถานะ เพื่อให้ผู้ใช้สามารถกดรีเซ็ตได้ หมายว่าระบบไม่มีทางรู้ได้ว่ามีการล้มไปแล้ว และได้รับการช่วยเหลือแล้ว จะไม่สลับเป็นปกติเองได้ เว้นเเต่ญาติผู้ดูแลกดปุ่มนั้น เพื่อกลับไปสถานะปกติ

#### **3. สถานะของชีพจร**

- **สี:** สีแดง (CRITICAL)
- **ข้อความ:** "สถานะของชีพจร"
- **อัปเดตล่าสุด:** "อัปเดตล่าสุด : 10:05 น."
- **สถานะ:** ❤️ "120 BPM" (สูงกว่าปกติ - สีแดง)
- **รายละเอียด:** "สูงกว่าปกติ"

### 10.2 Notification History Screen (ประวัติการแจ้งเตือน)

> **📍 ตำแหน่งในแอป:** ปุ่มกระดิ่ง (🔔) มุมขวาบนของหน้า Home

**หน้า: Notifications**

- **Header:** "ประวัติการแจ้งเตือน"
  - **Right Action:** ปุ่ม "ถังขยะ" (Clear All) - ลบการแจ้งเตือนทั้งหมด
- **Action Bar:**
  - ปุ่ม "อ่านทั้งหมด" (Mark all as read) - เปลี่ยนสถานะทุกรายการเป็นอ่านแล้ว
- **List Item:**
  - **Icon:** ตามประเภท (Fall=Warning, Heart=Heart, System=Info)
  - **Title:** หัวข้อแจ้งเตือน (ตัวหนา = ยังไม่อ่าน)
  - **Time:** เวลาที่เกิดเหตุ
  - **Message:** รายละเอียด
  - **Badge:** "ใหม่" (สีแดง) สำหรับรายการที่ยังไม่อ่าน
- **Interaction:**
  - **Tap:** เปิดดูรายละเอียด / ทำเครื่องหมายว่าอ่านแล้ว
  - **Pull-to-refresh:** ดึงข้อมูลใหม่

**Unread Badge:**

- แสดงจุดสีแดงพร้อมตัวเลขบนไอคอนกระดิ่งในหน้า Home
- อัปเดต Real-time (ทุก 30 วินาที)

### 10.3 Push Notification Behavior (การทำงานเมื่อแตะแจ้งเตือน)

- **Behavior:** เมื่อผู้ใช้งานแตะที่ Push Notification (ไม่ว่าจะเป็น Fall, Heart Rate, หรือ Offline)
- **Target Screen:** ระบบจะนำทางไปที่ **"หน้าหลัก" (Dashboard Home)** เสมอ
- **Reason:** เพื่อให้ญาติผู้ดูแลเห็นสถานะปัจจุบัน (Real-time Status) ของผู้สูงอายุก่อนตัดสินใจดำเนินการใดๆ (เช่น การกดโทรฉุกเฉิน หรือ ดูรายละเอียดเพิ่มเติม)
- **Flow:**
  1. User Taps Notification
  2. App Opens / Resumes
  3. Navigate to `(tabs)/index` (Dashboard)
  4. User sees the Status Card (e.g., Fall Detected Card)
  5. User decides action (Call / Cancel / View Details)

---

---

## 11. Emergency Call Behavior

> **ประเภท:** Native Phone Dialer Integration  
> **ทริกเกอร์เมื่อ:** ผู้ใช้งานกดปุ่มโทรฉุกเฉิน (จากหน้า Dashboard)  
> **พฤติกรรม:** เด้งเข้าหน้า Native Dialer ของมือถือโดยตรง (ไม่ใช่ Custom UI)

### 11.1 Call Screen

**หน้า: Call Screen**

- **Header:** "กำลังโทร..."
- **แสดงข้อมูล:**
  - "คนที่คุณเคน"
  - เบอร์: "1669"
- **ปุ่มควบคุม:**
  - ปุ่มวางสาย (สีแดง - กลาง)
  - ปุ่มอื่น ๆ (สีเทา - รอบ ๆ)

---

## 12. Empty States

> **ประเภท:** Initial States, No Data States  
> **แสดงเมื่อ:** ผู้ใช้เข้าระบบครั้งแรกหรือยังไม่มีข้อมูล

### 12.1 Empty state (ครั้งแรก)

**หน้า: Empty state**

- **Header:** "ยินดีต้อนรับสู่ Fall:Help"
- **ข้อความ:**
  - "คุณยังไม่มีข้อมูลในระบบ"
- **Button:**
  - ปุ่ม "เพิ่มข้อมูลผู้สูงอายุของคุณ" (สีเขียว)

---

## 13. Success States

> **ประเภท:** Success Confirmations, Auto-redirect States  
> **แสดงเมื่อ:** การดำเนินการสำเร็จ (บันทึก, Setup, ลงทะเบียน, เชิญสมาชิก)

### 13.1 บันทึกข้อมูลสูงอายุสำเร็จ

**หน้า: Saved Success**

- ✅ ไอคอนสีเขียว
- **ข้อความ:**
  - "บันทึกข้อมูลสูงอายุสำเร็จ"
  - "และเชื่อมต่ออุปกรณ์เข้ากับเครื่องเรียบร้อยแล้ว"
  - "ระบบกำลังโหลด.."

---

## API Requirements

> รายละเอียด API Endpoints ทั้งหมดดูได้ที่: **[API_DOCUMENTATION.md](../API_DOCUMENTATION.md)**

---

## Real-time Features (Socket.io)

1. **สถานะอุปกรณ์:** Online/Offline
2. **การหกล้ม:** แจ้งเตือนทันที + ปุ่มยกเลิกภายใน 30 วินาที
3. **ชีพจร:** อัปเดต BPM แบบ real-time
4. **การแจ้งเตือน:** Push notification ผ่าน Expo Push API---

## Notes

- **Multi-language Support:** ไทย (default)
- **Font:** Kanit จาก Google
- **Responsive Design:** รองรับ iOS + Android แบบ Expo รันบนเครื่อง
- **Offline Mode:** แสดงข้อความ "ไม่สามารถเชื่อมต่อได้" เมื่อไม่มี internet
- **Loading States:** แสดง "กำลังโหลด..." หรือ Spinner
- **Error Handling:** แสดงข้อความ error ที่เข้าใจง่าย

---

## Bottom Navigation

**3 Tabs:**

1. **หน้าหลัก** (Home) - Dashboard + Real-time monitoring
2. **ประวัติการตรวจกล้ม** (History) - Event history + Monthly reports
3. **ตั้งค่า** (Settings) - WiFi, Device, Profile, Members, Logout

---

## Design System ใช้ของทาง NativeWind (React Native)

### **Colors**

- **Primary Green:** ปุ่มหลัก, สถานะปกติ
- **Red:** ปุ่มฉุกเฉิน, สถานะ Critical, ลบ
- **Blue:** สถานะ Normal
- **Yellow:** สถานะ Warning
- **Gray:** ปุ่มรอง, ยกเลิก

### **Typography**

- **Headers:** ตัวหนา
- **Body Text:** ตัวปกติ
- **Status Text:** สีตามความรุนแรง (เขียว/เหลือง/แดง)

### **Icons (ใช้ของ Google)**

- 🏠 Home
- 🕐 History
- ☰ Settings
- 📞 Phone
- 👤 User
- ❤️ Heart Rate
- ✅ Success
- ❌ Delete/Cancel
- 🗑️ Trash
- 👁️ Show/Hide Password

---

## Bottom Navigation

**3 Tabs:**

1. **หน้าหลัก** (Home) - Dashboard + Real-time monitoring
2. **ประวัติการตรวจกล้ม** (History) - Event history + Monthly reports
3. **ตั้งค่า** (Settings) - WiFi, Device, Profile, Members, Logout

---

## Real-time Features (Socket.io)

1. **สถานะอุปกรณ์:** Online/Offline
2. **การหกล้ม:** แจ้งเตือนทันที + ปุ่มยกเลิกภายใน 30 วินาที
3. **ชีพจร:** อัปเดต BPM แบบ real-time
4. **การแจ้งเตือน:** Push notification ผ่าน Expo Push API

---

## Notes

- **Multi-language Support:** ไทย (default)
- **Font:** Kanit จาก Google
- **Responsive Design:** รองรับ iOS + Android แบบ Expo รันบนเครื่อง
- **Offline Mode:** แสดงข้อความ "ไม่สามารถเชื่อมต่อได้" เมื่อไม่มี internet
- **Loading States:** แสดง "กำลังโหลด..." หรือ Spinner
- **Error Handling:** แสดงข้อความ error ที่เข้าใจง่าย

---

**Last Updated:** December 13, 2025  
**Version:** 1.0.0
