# FallHelp ESP32 - Sensor Modules Documentation

# เอกสาร Sensor Modules

เอกสารครบถ้วนเกี่ยวกับ Sensor Modules ทั้งหมดสำหรับ ESP32 Firmware

---

## โครงสร้าง Sensor Modules

```
arduino/
├── docs/                    ← Documentation (ที่นี่)
│   ├── README.md           ← Documentation Index
│   ├── SENSORS_README.md   ← This file
│   └── FALL_DETECTION_TUNING.md
└── fallhelp_esp32/          ← Firmware Source Code
    ├── fallhelp_esp32.ino      ← Main firmware (WiFi + MQTT)
    ├── MPU6050_Sensor.ino      ← Fall Detection Sensor
    ├── PulseSensor.ino          ← Heart Rate Monitoring
    ├── FalseAlarmCancelButton.ino ← False Alarm Cancel Button
    ├── PowerManagement.ino      ← Battery & Power Management
    ├── AlertSystem.ino          ← Speaker & Alert System
    ├── SensorManager.ino        ← Unified Sensor Interface
    └── FallDetectionConfig.ino  ← SiSFall-based Configuration
```

## Hardware Connections

| Component               | Pin                    | Description                   |
| ----------------------- | ---------------------- | ----------------------------- |
| **MPU6050**             | SDA=GPIO21, SCL=GPIO22 | I2C Accelerometer + Gyroscope |
| **Pulse Sensor XD-58C** | GPIO34 (Analog)        | Heart Rate Sensor             |
| **False Alarm Cancel Button** | GPIO4 | Large Push Button Module (ยกเลิกการแจ้งเตือน) |
| **Battery Monitor**     | GPIO35 (Analog)        | Battery voltage monitoring    |
| **Charging Status**     | GPIO32 (Digital)       | TP4056 charging status        |
| **Power Switch**        | GPIO33 (Digital)       | Slide Switch SS12D00 G4       |
| **Speaker**             | GPIO25 (PWM)           | Grove Speaker Module          |
| **LED Indicator**       | GPIO2                  | Built-in LED                  |

## Sensor Modules Overview

### 1. MPU6050_Sensor.ino

**Purpose:** Fall Detection using Accelerometer

**Features:**

- Real-time acceleration monitoring (X, Y, Z axes)
- Fall detection algorithm (threshold-based)
- Configurable sensitivity
- MQTT event publishing

**Configuration:**

```cpp
#define FALL_THRESHOLD_ACCEL 2.5    // g-force threshold
#define FALL_THRESHOLD_DURATION 200 // ms
#define SAMPLING_RATE 50            // Hz
```

**Usage:**

```cpp
// In setup()
initMPU6050();

// In loop()
updateMPU6050();

// Get data
MPU6050Data data = getMPU6050Data();
```

**MQTT Event:**

```json
{
  "type": "fall",
  "timestamp": 1234567890,
  "accelX": 0.5,
  "accelY": -1.2,
  "accelZ": 2.8,
  "totalAccel": 3.1,
  "severity": "high"
}
```

---

### 2. PulseSensor.ino

**Purpose:** Heart Rate Monitoring

**Features:**

- Real-time heart rate calculation (BPM)
- Heart rate zone detection (low/normal/high/critical)
- Peak detection algorithm
- MQTT event publishing

**Configuration:**

```cpp
#define HR_LOW_THRESHOLD 50      // BPM
#define HR_NORMAL_MAX 100        // BPM
#define HR_HIGH_THRESHOLD 100    // BPM
#define HR_CRITICAL_HIGH 120     // BPM
#define PULSE_SAMPLING_RATE 100  // Hz
```

**Usage:**

```cpp
// In setup()
initPulseSensor();

// In loop()
updatePulseSensor();

// Get data
PulseSensorData data = getPulseSensorData();
```

**MQTT Event:**

```json
{
  "type": "heart_rate",
  "event": "high",
  "timestamp": 1234567890,
  "heartRate": 110,
  "zone": "high",
  "rawValue": 2048,
  "voltage": 1.65
}
```

---

### 3. FalseAlarmCancelButton.ino

**Purpose:** False Alarm Cancel Button Handler

**ใช้กับ:** False Alarm Cancel Button - ปุ่มยกเลิกการแจ้งเตือนการหกล้มที่ผิดพลาด

**Flow:**
1. เมื่อตรวจพบการหกล้ม → ระบบแจ้งเตือน (Timer 30 วินาที)
2. ผู้สูงอายุกดปุ่มนี้ภายใน 30 วินาที → ยกเลิกการแจ้งเตือน (False Alarm)
3. ถ้าไม่กดภายใน 30 วินาที → สันนิษฐานว่าเกิดเหตุจริง (Confirmed)

**Features:**

- Button press detection with debouncing
- MQTT event publishing (cancel fall event)
- Visual/audio feedback (confirmation beep)
- Time window check (30 seconds from fall detection)

**Configuration:**

```cpp
#define FALSE_ALARM_BTN_PIN 4     // GPIO4 (Large Push Button Module)
#define DEBOUNCE_DELAY 50         // ms
#define CANCEL_TIME_WINDOW 30000  // ms - 30 seconds window to cancel
```

**Usage:**

```cpp
// In setup()
initFalseAlarmCancelButton();

// In loop()
updateFalseAlarmCancelButton();

// Set fall timestamp when fall is detected
setLastFallTimestamp(millis());

// Set active fall event ID (from Backend)
setActiveFallEventId(eventId);

// Get state
FalseAlarmCancelButtonState state = getFalseAlarmCancelButtonState();
```

**MQTT Event:**

```json
{
  "type": "fall_cancel",
  "event": "cancel",
  "timestamp": 1234567890,
  "fallTimestamp": 1234500000,
  "eventId": "event-123"
}
```

---

### 4. PowerManagement.ino

**Purpose:** Battery & Power Management

**Features:**

- Battery voltage monitoring (LiPo 3.7V 450mAh)
- Charging status detection (TP4056)
- Power switch handling (Slide Switch)
- Low battery warnings
- MQTT status publishing

**Configuration:**

```cpp
#define BATTERY_ADC_PIN 35          // GPIO35
#define CHARGING_STATUS_PIN 32      // GPIO32
#define POWER_SWITCH_PIN 33         // GPIO33
#define BATTERY_LOW 3.5             // V
#define BATTERY_CRITICAL 3.3        // V
```

**Usage:**

```cpp
// In setup()
initPowerManagement();

// In loop()
updatePowerManagement();

// Get data
PowerManagementState power = getPowerManagementState();
float voltage = getBatteryVoltage();
int percentage = getBatteryPercentage();
bool charging = isCharging();
```

**MQTT Event:**

```json
{
  "type": "battery",
  "event": "low",
  "timestamp": 1234567890,
  "voltage": 3.4,
  "percentage": 15
}
```

**MQTT Status:**

```json
{
  "timestamp": 1234567890,
  "voltage": 3.8,
  "percentage": 75,
  "status": "normal",
  "charging": false,
  "powerOn": true
}
```

---

### 5. AlertSystem.ino

**Purpose:** Speaker & Alert System

**Features:**

- Fall detection alert (triple beep)
- False Alarm Cancel confirmation (success beep)
- Low battery alert (double beep)
- Heart rate alert (double beep)
- Visual LED indicator
- Configurable tones and patterns

**Configuration:**

```cpp
#define SPEAKER_PIN 25              // GPIO25 (PWM)
#define LED_PIN 2                   // GPIO2
#define TONE_FALL 800               // Hz
#define TONE_BATTERY_LOW 600        // Hz
#define TONE_SUCCESS 500            // Hz - Confirmation beep
```

**Usage:**

```cpp
// In setup()
initAlertSystem();

// In loop()
updateAlertSystem();

// Trigger alerts
alertFall();
alertBatteryLow();
alertHeartRate();
alertSuccess();  // False Alarm Cancel confirmation
```

**Alert Patterns:**

- **Single**: One beep
- **Double**: Two beeps
- **Triple**: Three beeps
- **Success**: Confirmation beep (for False Alarm Cancel)

---

### 6. SensorManager.ino

**Purpose:** Unified Interface for All Sensors

**Features:**

- Centralized sensor initialization
- Unified update loop
- Status monitoring
- Error handling & retry
- MQTT status publishing

**Usage:**

```cpp
// In setup()
initSensorManager();

// In loop()
updateSensorManager();

// Control sensors
enableSensor("mpu6050", true);
enableSensor("pulse", false);
enableSensor("false_alarm_cancel", true);

// Check status
bool ready = isSensorReady("mpu6050");
```

**MQTT Status:**

```json
{
  "timestamp": 1234567890,
  "mpu6050": {
    "enabled": true,
    "ready": true,
    "accelX": 0.1,
    "accelY": 0.2,
    "accelZ": 0.9,
    "totalAccel": 0.95
  },
  "pulse": {
    "enabled": true,
    "ready": true,
    "heartRate": 75,
    "zone": "normal",
    "rawValue": 2048
  },
  "false_alarm_cancel": {
    "enabled": true,
    "ready": true,
    "lastFallTimestamp": 0,
    "activeFallEventId": ""
  }
}
```

## Integration with Main Firmware

### Step 1: Include Sensor Modules

Arduino IDE จะรวมไฟล์ `.ino` ทั้งหมดในโฟลเดอร์เดียวกันอัตโนมัติ

### Step 2: Initialize in setup()

```cpp
void setup() {
  // ... existing WiFi/MQTT setup ...

  // Initialize sensors
  initSensorManager();
}
```

### Step 3: Update in loop()

```cpp
void loop() {
  // ... existing WiFi/MQTT loop ...

  // Update sensors
  updateSensorManager();
}
```

## MQTT Topics

| Topic                            | Description                                    |
| -------------------------------- | ---------------------------------------------- |
| `device/{serial}/event`          | Sensor events (fall, heart_rate, fall_cancel, battery) |
| `device/{serial}/sensors/status` | Periodic sensor status                         |
| `device/{serial}/power/status`   | Power management status                        |

## Configuration

### Fall Detection Sensitivity

ปรับค่า `FALL_THRESHOLD_ACCEL` ใน `MPU6050_Sensor.ino`:

- **2.0g** = More sensitive (detect smaller falls)
- **2.5g** = Default (balanced)
- **3.0g** = Less sensitive (only major falls)

### Heart Rate Zones

ปรับค่าใน `PulseSensor.ino`:

- **HR_LOW_THRESHOLD**: Below this = Low (Bradycardia)
- **HR_NORMAL_MAX**: Normal range upper limit
- **HR_HIGH_THRESHOLD**: Above this = High (Tachycardia)
- **HR_CRITICAL_HIGH**: Critical threshold

## Troubleshooting

### MPU6050 ไม่ทำงาน

1. ตรวจสอบการเชื่อมต่อ I2C (SDA=21, SCL=22)
2. ตรวจสอบว่า MPU6050 ใช้ address 0x68
3. ดู Serial Monitor สำหรับ error messages
4. Sensor Manager จะ retry อัตโนมัติทุก 5 วินาที

### Pulse Sensor ไม่อ่านค่า

1. ตรวจสอบว่า sensor ต่อที่ GPIO34
2. ตรวจสอบว่า sensor สัมผัสกับผิวหนัง
3. ดู Serial Monitor สำหรับ raw values
4. ถ้า rawValue = 0 หรือ 4095 อาจหมายถึง sensor ไม่ต่อ

### False Alarm Cancel Button ไม่ทำงาน

1. ตรวจสอบว่าใช้ GPIO4 (Large Push Button Module)
2. Button ต้องกดลง (LOW) เมื่อกด
3. ดู Serial Monitor เมื่อกด button
4. ตรวจสอบว่า fall detection ถูก trigger แล้ว (ต้องมี fall event ก่อน)
5. ตรวจสอบว่าไม่เกิน 30 วินาทีจาก fall detection

**หมายเหตุ:** ปุ่มนี้ใช้สำหรับยกเลิกการแจ้งเตือน False Alarm ภายใน 30 วินาที

### Power Management ไม่ทำงาน

1. ตรวจสอบการเชื่อมต่อ:
   - Battery: GPIO35 (Analog)
   - Charging: GPIO32 (Digital)
   - Power Switch: GPIO33 (Digital)
2. ตรวจสอบ voltage divider circuit (ถ้าใช้)
3. ดู Serial Monitor สำหรับ voltage readings

### Alert System ไม่มีเสียง

1. ตรวจสอบว่า Speaker ต่อที่ GPIO25
2. ตรวจสอบว่าใช้ PWM-capable pin
3. ทดสอบด้วย `alertSuccess()` ใน setup
4. ตรวจสอบ volume ของ speaker

## Notes

### Sampling Rates
- MPU6050: 50 Hz (20ms interval)
- Pulse Sensor: 100 Hz (10ms interval)
- False Alarm Cancel Button: Continuous monitoring (เมื่อมี fall event)
- Power Management: 5 seconds interval
- Alert System: On-demand (when triggered)

### MQTT Events
- Events จะ publish เฉพาะเมื่อ MQTT connected
- ถ้า MQTT ไม่ connected จะแสดง warning ใน Serial

### Error Handling
- Sensor Manager จะ retry failed sensors อัตโนมัติ
- Status จะ publish ทุก 30 วินาที

### Power Management
- Battery Monitoring: Uses voltage divider circuit (adjust R1/R2 values if needed)
- Calibrate voltage readings based on your circuit
- Low battery warning at 3.5V
- Critical battery warning at 3.3V
- Charging Detection: TP4056 CHG pin logic may vary by module
- Power Switch: Slide switch controls power state

### Alert System
- Speaker: Uses ESP32 PWM (LEDC) for tone generation, Frequency range: 0-2000 Hz
- LED Indicator: Built-in LED (GPIO2) for visual feedback, Blinks in sync with alerts
- Alert Triggers:
  - Fall detection → Triple beep
  - False Alarm Cancel → Success beep (confirmation)
  - Low battery → Double beep
  - Heart rate alert → Double beep

---

**Last Updated:** December 15, 2025  
**Status:** Sensor Modules v1.1 - Complete with Power & Alert Systems
