/**
 * @file PowerManagement.ino
 * @brief Power Management - Battery, Charging, Voltage Monitoring
 * 
 * ใช้กับ: Battery & Power Management - จัดการแบตเตอรี่และสถานะการชาร์จ
 * 
 * Hardware Components (แค่ต่อ - ไม่ได้อัปโหลดโค้ด):
 * - LiPo Battery 3.7V 450mAh (แบตเตอรี่ - แค่ต่อ)
 * - TP4056 Charging Module (โมดูลชาร์จ - แค่ต่อ, อ่านสถานะชาร์จผ่าน GPIO32)
 * - Step-Up Boost 3.7V to 5V (ตัวแปลงแรงดัน - แค่ต่อ)
 * - Slide Switch SS12D00 G4 (สวิตช์เปิด/ปิด - แค่ต่อ, อ่านสถานะผ่าน GPIO33)
 * 
 * Note: อุปกรณ์เหล่านี้เป็น hardware components ที่แค่ต่อ (hardware wiring)
 * ESP32 เท่านั้นที่อัปโหลดโค้ดได้ โค้ดนี้แค่อ่านค่าจาก hardware เหล่านี้
 * 
 * Features:
 * - Battery voltage monitoring (อ่านจาก GPIO35 - ADC)
 * - Charging status detection (อ่านจาก GPIO32 - TP4056 CHRG pin)
 * - Low battery warning
 * - Power switch handling (อ่านจาก GPIO33)
 * - MQTT status publishing
 * 
 * Integration:
 * - ถูกเรียกใช้ผ่าน SensorManager.ino
 * - Trigger AlertSystem.ino เมื่อแบตเตอรี่ต่ำ
 */

// ==================== Power Management Configuration ====================
// Pin Definitions - อ่านค่าจาก hardware components ที่ต่อไว้
#define BATTERY_ADC_PIN 35          // GPIO35 (ADC1_CH7) - อ่าน voltage จากแบตเตอรี่ (ผ่าน voltage divider หรือ direct)
#define CHARGING_STATUS_PIN 32      // GPIO32 (Digital) - อ่านสถานะชาร์จจาก TP4056 CHRG pin (LOW=charging, HIGH=not charging)
#define POWER_SWITCH_PIN 33         // GPIO33 (Digital) - อ่านสถานะสวิตช์เปิด/ปิด (HIGH=ON, LOW=OFF)

// Battery Voltage Thresholds (3.7V LiPo)
#define BATTERY_FULL 4.2           // V - Full charge
#define BATTERY_NORMAL_MIN 3.7      // V - Normal operation
#define BATTERY_LOW 3.5             // V - Low battery warning
#define BATTERY_CRITICAL 3.3        // V - Critical - shutdown soon
#define BATTERY_EMPTY 3.0           // V - Empty - shutdown

// Voltage Divider Configuration
// ⚠️ IMPORTANT: LiPo 3.7V battery can reach 4.2V when fully charged
// ESP32 ADC max input is 3.3V, so voltage divider is REQUIRED for accurate reading
// Example: R1 = 10kΩ, R2 = 10kΩ gives 2:1 divider (4.2V → 2.1V at ADC)
// If direct connection (R1=0, R2=1): Will saturate at 3.3V - NOT RECOMMENDED
#define VOLTAGE_DIVIDER_R1 10000    // Ω - R1 value (Set to 0 if no divider - NOT RECOMMENDED)
#define VOLTAGE_DIVIDER_R2 10000    // Ω - R2 value (Set to 1 if no divider - NOT RECOMMENDED)
#define ADC_REFERENCE_VOLTAGE 3.3   // V - ESP32 ADC reference
#define ADC_RESOLUTION 4095         // 12-bit ADC

// Monitoring Intervals
#define BATTERY_CHECK_INTERVAL 5000  // ms - check battery every 5 seconds
#define LOW_BATTERY_WARNING_INTERVAL 60000  // ms - warn every 60 seconds when low

// ==================== Power Management State Variables ====================
struct PowerManagementState {
  float batteryVoltage;             // V - Current battery voltage
  int batteryPercentage;            // % - Estimated battery percentage
  bool isCharging;                  // Charging status
  bool isPowerOn;                   // Power switch state
  String batteryStatus;             // "full", "normal", "low", "critical", "empty"
  unsigned long lastBatteryCheck;
  unsigned long lastLowBatteryWarning;
  bool lowBatteryWarningSent;
  bool criticalBatteryWarningSent;
  bool isInitialized;
};

PowerManagementState powerState = {
  0.0, 0, false, true, "unknown", 0, 0, false, false, false
};

// ==================== Power Management Function Prototypes ====================
bool initPowerManagement();
void updatePowerManagement();
float readBatteryVoltage();
int calculateBatteryPercentage(float voltage);
String getBatteryStatus(float voltage);
bool readChargingStatus();
bool readPowerSwitch();
void publishBatteryStatus();
void handleLowBattery();
void handleCriticalBattery();
void printPowerStatus();

// ==================== Power Management Initialization ====================
/**
 * Initialize Power Management
 * @return true if successful, false otherwise
 */
bool initPowerManagement() {
  // Configure ADC pins
  pinMode(BATTERY_ADC_PIN, INPUT);
  pinMode(CHARGING_STATUS_PIN, INPUT);
  pinMode(POWER_SWITCH_PIN, INPUT_PULLUP);
  
  // Configure ADC
  analogReadResolution(12);  // 12-bit resolution (0-4095)
  // Note: analogSetAttenuation() may vary by ESP32 Arduino Core version
  // For ESP32 Arduino Core 2.x+: use analogSetAttenuation(ADC_ATTEN_DB_11)
  // For older versions: may need to use different method
  // Default attenuation is usually 11dB (0-3.3V range) which is suitable for battery monitoring
  
  delay(100);  // Stabilize ADC
  
  // Read initial values
  powerState.batteryVoltage = readBatteryVoltage();
  powerState.batteryPercentage = calculateBatteryPercentage(powerState.batteryVoltage);
  powerState.batteryStatus = getBatteryStatus(powerState.batteryVoltage);
  powerState.isCharging = readChargingStatus();
  powerState.isPowerOn = readPowerSwitch();
  
  powerState.isInitialized = true;
  powerState.lastBatteryCheck = millis();
  
  Serial.println("✅ Power Management initialized");
  printPowerStatus();
  
  return true;
}

// ==================== Battery Voltage Reading ====================
/**
 * Read battery voltage from ADC (GPIO35)
 * @return Battery voltage in volts
 * 
 * Note: อ่านค่า voltage จากแบตเตอรี่ผ่าน ADC (ไม่ใช่จาก TP4056)
 * TP4056 เป็นโมดูลชาร์จเท่านั้น ไม่ได้วัด voltage
 */
float readBatteryVoltage() {
  int adcValue = analogRead(BATTERY_ADC_PIN);
  
  // Convert ADC reading to voltage
  float adcVoltage = (adcValue / (float)ADC_RESOLUTION) * ADC_REFERENCE_VOLTAGE;
  
  // Apply voltage divider if used
  // V_battery = V_adc * (R1 + R2) / R2
  float batteryVoltage;
  if (VOLTAGE_DIVIDER_R1 > 0 && VOLTAGE_DIVIDER_R2 > 0) {
    batteryVoltage = adcVoltage * ((VOLTAGE_DIVIDER_R1 + VOLTAGE_DIVIDER_R2) / (float)VOLTAGE_DIVIDER_R2);
  } else {
    // Direct connection (no divider) - ⚠️ WARNING: This will saturate at 3.3V!
    // Battery voltage above 3.3V (e.g., 4.2V when fully charged) will read as 3.3V maximum
    // This is NOT recommended for LiPo 3.7V batteries
    batteryVoltage = adcVoltage;
    Serial.println("⚠️ WARNING: No voltage divider! Battery readings may be inaccurate above 3.3V");
  }
  
  return batteryVoltage;
}

/**
 * Calculate battery percentage from voltage
 * @param voltage Battery voltage in volts
 * @return Battery percentage (0-100)
 * 
 * Note: TP4056 is a charging module only - it does NOT provide battery percentage.
 * We calculate percentage from voltage using LiPo 3.7V discharge curve:
 * - Read voltage from GPIO35 (ADC) - not from TP4056
 * - TP4056 only provides charging status (GPIO32: HIGH/LOW)
 * - Battery % is estimated from voltage curve, not measured directly
 */
int calculateBatteryPercentage(float voltage) {
  // LiPo 3.7V typical discharge curve
  // Voltage-based estimation (not from TP4056 sensor)
  if (voltage >= BATTERY_FULL) {
    return 100;
  } else if (voltage >= BATTERY_NORMAL_MIN) {
    // Linear interpolation: 3.7V = 20%, 4.2V = 100%
    return (int)(20 + ((voltage - BATTERY_NORMAL_MIN) / (BATTERY_FULL - BATTERY_NORMAL_MIN)) * 80);
  } else if (voltage >= BATTERY_LOW) {
    // Linear interpolation: 3.5V = 10%, 3.7V = 20%
    return (int)(10 + ((voltage - BATTERY_LOW) / (BATTERY_NORMAL_MIN - BATTERY_LOW)) * 10);
  } else if (voltage >= BATTERY_CRITICAL) {
    // Linear interpolation: 3.3V = 5%, 3.5V = 10%
    return (int)(5 + ((voltage - BATTERY_CRITICAL) / (BATTERY_LOW - BATTERY_CRITICAL)) * 5);
  } else if (voltage >= BATTERY_EMPTY) {
    // Linear interpolation: 3.0V = 0%, 3.3V = 5%
    return (int)((voltage - BATTERY_EMPTY) / (BATTERY_CRITICAL - BATTERY_EMPTY) * 5);
  } else {
    return 0;
  }
}

/**
 * Get battery status string
 * @param voltage Battery voltage in volts
 * @return Status string
 */
String getBatteryStatus(float voltage) {
  if (voltage >= BATTERY_FULL) {
    return "full";
  } else if (voltage >= BATTERY_NORMAL_MIN) {
    return "normal";
  } else if (voltage >= BATTERY_LOW) {
    return "low";
  } else if (voltage >= BATTERY_CRITICAL) {
    return "critical";
  } else {
    return "empty";
  }
}

// ==================== Charging & Power Switch ====================
/**
 * Read charging status from TP4056 module
 * @return true if charging, false otherwise
 * 
 * Note: TP4056 CHRG pin (GPIO32) only indicates charging status (HIGH/LOW)
 * It does NOT provide battery percentage or voltage data.
 * Battery voltage is read from GPIO35 (ADC), not from TP4056.
 * Battery percentage is calculated from voltage using discharge curve.
 */
bool readChargingStatus() {
  // ⚠️ WARNING: TP4056 CHRG pin logic varies by module manufacturer!
  // Some modules: LOW = charging, HIGH = not charging (or full)
  // Other modules: HIGH = charging, LOW = not charging
  // VERIFY YOUR MODULE'S ACTUAL BEHAVIOR BEFORE DEPLOYMENT!
  // If your module is reversed, change == LOW to == HIGH below
  return (digitalRead(CHARGING_STATUS_PIN) == LOW);  // Common: LOW = charging
}

/**
 * Read power switch state (Slide Switch SS12D00 G4)
 * @return true if power is ON, false if OFF
 * 
 * Note: อ่านสถานะสวิตช์เปิด/ปิดจาก GPIO33
 * Slide Switch เป็น hardware component ที่แค่ต่อ ไม่ได้อัปโหลดโค้ด
 */
bool readPowerSwitch() {
  // Slide switch: HIGH = ON, LOW = OFF (with pull-up)
  return (digitalRead(POWER_SWITCH_PIN) == HIGH);
}

// ==================== Power Management Main Loop ====================
/**
 * Update Power Management (call in main loop)
 */
void updatePowerManagement() {
  if (!powerState.isInitialized && !initPowerManagement()) {
    return;
  }
  
  // Check battery periodically
  if (millis() - powerState.lastBatteryCheck >= BATTERY_CHECK_INTERVAL) {
    powerState.batteryVoltage = readBatteryVoltage();
    powerState.batteryPercentage = calculateBatteryPercentage(powerState.batteryVoltage);
    powerState.batteryStatus = getBatteryStatus(powerState.batteryVoltage);
    powerState.isCharging = readChargingStatus();
    powerState.isPowerOn = readPowerSwitch();
    
    powerState.lastBatteryCheck = millis();
    
    // Handle battery warnings
    if (powerState.batteryStatus == "low") {
      handleLowBattery();
    } else if (powerState.batteryStatus == "critical") {
      handleCriticalBattery();
    } else if (powerState.batteryStatus == "empty") {
      // Shutdown or enter deep sleep
      Serial.println("⚠️ Battery empty - entering deep sleep...");
      // ESP.deepSleep(0);  // Sleep forever (until reset)
    }
    
    // Publish status to MQTT
    publishBatteryStatus();
  }
}

// ==================== Battery Warning Handlers ====================
/**
 * Handle low battery warning
 */
void handleLowBattery() {
  if (millis() - powerState.lastLowBatteryWarning >= LOW_BATTERY_WARNING_INTERVAL) {
    Serial.printf("⚠️ Low Battery: %.2fV (%d%%)\n", 
                  powerState.batteryVoltage, powerState.batteryPercentage);
    
    if (!powerState.lowBatteryWarningSent) {
      // Publish warning event
      if (mqtt.connected() && !apMode) {
        String topic = "device/" + deviceSerial + "/event";
        StaticJsonDocument<128> doc;
        doc["type"] = "battery";
        doc["event"] = "low";
        doc["timestamp"] = millis();
        doc["voltage"] = powerState.batteryVoltage;
        doc["percentage"] = powerState.batteryPercentage;
        
        char buffer[128];
        serializeJson(doc, buffer);
        mqtt.publish(topic.c_str(), buffer);
      }
      
      powerState.lowBatteryWarningSent = true;
      
      // Trigger alert
      if (isAlertSystemReady()) {
        alertBatteryLow();
      }
    }
    
    powerState.lastLowBatteryWarning = millis();
  }
}

/**
 * Handle critical battery warning
 */
void handleCriticalBattery() {
  Serial.printf("🚨 Critical Battery: %.2fV (%d%%)\n", 
                powerState.batteryVoltage, powerState.batteryPercentage);
  
  if (!powerState.criticalBatteryWarningSent) {
    // Publish critical event
    if (mqtt.connected() && !apMode) {
      String topic = "device/" + deviceSerial + "/event";
      StaticJsonDocument<128> doc;
      doc["type"] = "battery";
      doc["event"] = "critical";
      doc["timestamp"] = millis();
      doc["voltage"] = powerState.batteryVoltage;
      doc["percentage"] = powerState.batteryPercentage;
      
      char buffer[128];
      serializeJson(doc, buffer);
      mqtt.publish(topic.c_str(), buffer);
    }
    
    powerState.criticalBatteryWarningSent = true;
  }
}

/**
 * Publish battery status to MQTT
 */
void publishBatteryStatus() {
  if (apMode || !mqtt.connected()) return;
  
  String topic = "device/" + deviceSerial + "/power/status";
  StaticJsonDocument<256> doc;
  doc["timestamp"] = millis();
  doc["voltage"] = powerState.batteryVoltage;
  doc["percentage"] = powerState.batteryPercentage;
  doc["status"] = powerState.batteryStatus;
  doc["charging"] = powerState.isCharging;
  doc["powerOn"] = powerState.isPowerOn;
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  mqtt.publish(topic.c_str(), buffer);
}

/**
 * Print power status to Serial
 */
void printPowerStatus() {
  Serial.println("\n--- Power Status ---");
  Serial.printf("Battery: %.2fV (%d%%) [%s]\n", 
                powerState.batteryVoltage, 
                powerState.batteryPercentage,
                powerState.batteryStatus.c_str());
  Serial.printf("Charging: %s\n", powerState.isCharging ? "Yes" : "No");
  Serial.printf("Power Switch: %s\n", powerState.isPowerOn ? "ON" : "OFF");
  Serial.println("-------------------\n");
}

// ==================== Power Management Utility Functions ====================
/**
 * Get current power management state
 */
PowerManagementState getPowerManagementState() {
  return powerState;
}

/**
 * Check if power management is initialized
 */
bool isPowerManagementReady() {
  return powerState.isInitialized;
}

/**
 * Get battery voltage
 */
float getBatteryVoltage() {
  return powerState.batteryVoltage;
}

/**
 * Get battery percentage
 */
int getBatteryPercentage() {
  return powerState.batteryPercentage;
}

/**
 * Check if charging
 */
bool isCharging() {
  return powerState.isCharging;
}

