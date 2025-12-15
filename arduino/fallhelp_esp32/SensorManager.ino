/**
 * @file SensorManager.ino
 * @brief Sensor Manager - Unified Interface for All Sensors
 * 
 * ใช้กับ: Unified Interface - จัดการ sensors ทั้งหมดผ่าน interface เดียว
 * 
 * This module provides a unified interface to manage all sensors:
 * - MPU6050_Sensor.ino (Fall Detection)
 * - PulseSensor.ino (Heart Rate)
 * - FalseAlarmCancelButton.ino (False Alarm Cancel)
 * - PowerManagement.ino (Battery)
 * - AlertSystem.ino (Speaker & LED)
 * 
 * Features:
 * - Centralized sensor initialization
 * - Unified update loop
 * - Status monitoring
 * - Error handling & retry
 * - MQTT status publishing
 * 
 * Integration:
 * - ถูกเรียกใช้จาก fallhelp_esp32.ino (main firmware)
 * - จัดการ sensors ทั้งหมดให้ทำงานร่วมกัน
 */

// ==================== Sensor Manager Configuration ====================
#define SENSOR_STATUS_INTERVAL 30000  // ms - publish sensor status every 30s
#define SENSOR_ERROR_RETRY_DELAY 5000  // ms - retry failed sensors every 5s

// ==================== Sensor Manager State Variables ====================
struct SensorManagerState {
  bool mpu6050Enabled;
  bool pulseSensorEnabled;
  bool falseAlarmCancelButtonEnabled;
  bool powerManagementEnabled;
  bool alertSystemEnabled;
  
  bool mpu6050Ready;
  bool pulseSensorReady;
  bool falseAlarmCancelButtonReady;
  bool powerManagementReady;
  bool alertSystemReady;
  
  unsigned long lastStatusPublish;
  unsigned long lastErrorCheck;
  
  bool isInitialized;
};

SensorManagerState sensorMgr = {
  true, true, true, true, true,  // All sensors and systems enabled by default
  false, false, false, false, false,
  0, 0,
  false
};

// ==================== Sensor Manager Function Prototypes ====================
bool initSensorManager();
void updateSensorManager();
void publishSensorStatus();
void checkSensorErrors();
void enableSensor(String sensorName, bool enable);
bool isSensorReady(String sensorName);
void printSensorStatus();

// ==================== Sensor Manager Initialization ====================
/**
 * Initialize all sensors
 * @return true if at least one sensor initialized, false otherwise
 */
bool initSensorManager() {
  Serial.println("\n╔══════════════════════════════════════════════════╗");
  Serial.println("║          Sensor Manager Initialization           ║");
  Serial.println("╚══════════════════════════════════════════════════╝");
  
  bool anySuccess = false;
  
  // Initialize Fall Detection Configuration (SiSFall-based)
  initFallDetectionConfig();
  
  // Initialize I2C for MPU6050
  if (sensorMgr.mpu6050Enabled) {
    Wire.begin(21, 22);  // SDA=GPIO21, SCL=GPIO22
    delay(100);
    
    sensorMgr.mpu6050Ready = initMPU6050();
    if (sensorMgr.mpu6050Ready) {
      anySuccess = true;
      Serial.println("✅ MPU6050 enabled");
    } else {
      Serial.println("⚠️ MPU6050 initialization failed (will retry)");
    }
  } else {
    Serial.println("⏭️  MPU6050 disabled");
  }
  
  // Initialize Pulse Sensor
  if (sensorMgr.pulseSensorEnabled) {
    sensorMgr.pulseSensorReady = initPulseSensor();
    if (sensorMgr.pulseSensorReady) {
      anySuccess = true;
      Serial.println("✅ Pulse Sensor enabled");
    } else {
      Serial.println("⚠️ Pulse Sensor initialization failed (will retry)");
    }
  } else {
    Serial.println("⏭️  Pulse Sensor disabled");
  }
  
  // Initialize False Alarm Cancel Button
  if (sensorMgr.falseAlarmCancelButtonEnabled) {
    sensorMgr.falseAlarmCancelButtonReady = initFalseAlarmCancelButton();
    if (sensorMgr.falseAlarmCancelButtonReady) {
      anySuccess = true;
      Serial.println("✅ False Alarm Cancel Button enabled");
    } else {
      Serial.println("⚠️ False Alarm Cancel Button initialization failed");
    }
  } else {
    Serial.println("⏭️  False Alarm Cancel Button disabled");
  }
  
  // Initialize Alert System
  if (sensorMgr.alertSystemEnabled) {
    sensorMgr.alertSystemReady = initAlertSystem();
    if (sensorMgr.alertSystemReady) {
      anySuccess = true;
      Serial.println("✅ Alert System enabled");
    } else {
      Serial.println("⚠️ Alert System initialization failed");
    }
  } else {
    Serial.println("⏭️  Alert System disabled");
  }
  
  // Initialize Power Management
  if (sensorMgr.powerManagementEnabled) {
    sensorMgr.powerManagementReady = initPowerManagement();
    if (sensorMgr.powerManagementReady) {
      anySuccess = true;
      Serial.println("✅ Power Management enabled");
    } else {
      Serial.println("⚠️ Power Management initialization failed");
    }
  } else {
    Serial.println("⏭️  Power Management disabled");
  }
  
  sensorMgr.isInitialized = anySuccess;
  sensorMgr.lastStatusPublish = millis();
  sensorMgr.lastErrorCheck = millis();
  
  if (anySuccess) {
    Serial.println("\n✅ Sensor Manager initialized");
    printSensorStatus();
  } else {
    Serial.println("\n❌ Sensor Manager initialization failed - no sensors ready");
  }
  
  return anySuccess;
}

// ==================== Sensor Manager Main Loop ====================
/**
 * Update all sensors (call in main loop)
 */
void updateSensorManager() {
  if (!sensorMgr.isInitialized) {
    // Try to initialize if not already done
    if (millis() > 2000) {  // Wait 2 seconds after boot
      initSensorManager();
    }
    return;
  }
  
  // Update each sensor if enabled and ready
  if (sensorMgr.mpu6050Enabled && sensorMgr.mpu6050Ready) {
    updateMPU6050();
  }
  
  if (sensorMgr.pulseSensorEnabled && sensorMgr.pulseSensorReady) {
    updatePulseSensor();
  }
  
  if (sensorMgr.falseAlarmCancelButtonEnabled && sensorMgr.falseAlarmCancelButtonReady) {
    updateFalseAlarmCancelButton();
  }
  
  if (sensorMgr.alertSystemEnabled && sensorMgr.alertSystemReady) {
    updateAlertSystem();
  }
  
  if (sensorMgr.powerManagementEnabled && sensorMgr.powerManagementReady) {
    updatePowerManagement();
  }
  
  // Check for sensor errors periodically
  if (millis() - sensorMgr.lastErrorCheck >= SENSOR_ERROR_RETRY_DELAY) {
    checkSensorErrors();
    sensorMgr.lastErrorCheck = millis();
  }
  
  // Publish sensor status periodically
  if (millis() - sensorMgr.lastStatusPublish >= SENSOR_STATUS_INTERVAL) {
    publishSensorStatus();
    sensorMgr.lastStatusPublish = millis();
  }
}

// ==================== Sensor Status & Error Handling ====================
/**
 * Check for sensor errors and retry initialization
 */
void checkSensorErrors() {
  // Retry MPU6050 if not ready
  if (sensorMgr.mpu6050Enabled && !sensorMgr.mpu6050Ready) {
    Serial.println("🔄 Retrying MPU6050 initialization...");
    sensorMgr.mpu6050Ready = initMPU6050();
  }
  
  // Retry Pulse Sensor if not ready
  if (sensorMgr.pulseSensorEnabled && !sensorMgr.pulseSensorReady) {
    Serial.println("🔄 Retrying Pulse Sensor initialization...");
    sensorMgr.pulseSensorReady = initPulseSensor();
  }
  
  // False Alarm Cancel Button doesn't need retry (always works if hardware exists)
}

/**
 * Publish sensor status to MQTT
 */
void publishSensorStatus() {
  if (apMode || !mqtt.connected()) return;
  
  String topic = "device/" + deviceSerial + "/sensors/status";
  StaticJsonDocument<512> doc;
  doc["timestamp"] = millis();
  
  // MPU6050 status
  JsonObject mpu6050 = doc.createNestedObject("mpu6050");
  mpu6050["enabled"] = sensorMgr.mpu6050Enabled;
  mpu6050["ready"] = sensorMgr.mpu6050Ready;
  if (sensorMgr.mpu6050Ready) {
    MPU6050Data mpuData = getMPU6050Data();
    mpu6050["accelX"] = mpuData.accelX;
    mpu6050["accelY"] = mpuData.accelY;
    mpu6050["accelZ"] = mpuData.accelZ;
    mpu6050["totalAccel"] = mpuData.totalAccel;
  }
  
  // Pulse Sensor status
  JsonObject pulse = doc.createNestedObject("pulse");
  pulse["enabled"] = sensorMgr.pulseSensorEnabled;
  pulse["ready"] = sensorMgr.pulseSensorReady;
  if (sensorMgr.pulseSensorReady) {
    PulseSensorData pulseData = getPulseSensorData();
    pulse["heartRate"] = pulseData.heartRate;
    pulse["zone"] = pulseData.zone;
    pulse["rawValue"] = pulseData.rawValue;
  }
  
  // False Alarm Cancel Button status
  JsonObject cancelButton = doc.createNestedObject("falseAlarmCancel");
  cancelButton["enabled"] = sensorMgr.falseAlarmCancelButtonEnabled;
  cancelButton["ready"] = sensorMgr.falseAlarmCancelButtonReady;
  if (sensorMgr.falseAlarmCancelButtonReady) {
    FalseAlarmCancelButtonState cancelState = getFalseAlarmCancelButtonState();
    cancelButton["withinWindow"] = isWithinCancelWindow();
    cancelButton["lastFallTimestamp"] = cancelState.lastFallTimestamp;
  }
  
  // Power Management status
  if (sensorMgr.powerManagementReady) {
    PowerManagementState powerState = getPowerManagementState();
    JsonObject power = doc.createNestedObject("power");
    power["voltage"] = powerState.batteryVoltage;
    power["percentage"] = powerState.batteryPercentage;
    power["status"] = powerState.batteryStatus;
    power["charging"] = powerState.isCharging;
    power["powerOn"] = powerState.isPowerOn;
  }
  
  char buffer[512];
  serializeJson(doc, buffer);
  
  if (mqtt.publish(topic.c_str(), buffer)) {
    Serial.println("📤 Sensor status published");
  }
}

/**
 * Print sensor status to Serial
 */
void printSensorStatus() {
  Serial.println("\n--- Sensor Status ---");
  Serial.printf("MPU6050:     %s %s\n", 
                sensorMgr.mpu6050Enabled ? "ENABLED" : "DISABLED",
                sensorMgr.mpu6050Ready ? "✅" : "❌");
  Serial.printf("Pulse Sensor: %s %s\n", 
                sensorMgr.pulseSensorEnabled ? "ENABLED" : "DISABLED",
                sensorMgr.pulseSensorReady ? "✅" : "❌");
  Serial.printf("False Alarm Cancel: %s %s\n", 
                sensorMgr.falseAlarmCancelButtonEnabled ? "ENABLED" : "DISABLED",
                sensorMgr.falseAlarmCancelButtonReady ? "✅" : "❌");
  Serial.printf("Alert System: %s %s\n", 
                sensorMgr.alertSystemEnabled ? "ENABLED" : "DISABLED",
                sensorMgr.alertSystemReady ? "✅" : "❌");
  Serial.printf("Power Mgmt:   %s %s\n", 
                sensorMgr.powerManagementEnabled ? "ENABLED" : "DISABLED",
                sensorMgr.powerManagementReady ? "✅" : "❌");
  Serial.println("-------------------\n");
}

// ==================== Sensor Manager Control Functions ====================
/**
 * Enable/disable a sensor
 */
void enableSensor(String sensorName, bool enable) {
  if (sensorName == "mpu6050") {
    sensorMgr.mpu6050Enabled = enable;
    Serial.printf("MPU6050 %s\n", enable ? "enabled" : "disabled");
  } else if (sensorName == "pulse") {
    sensorMgr.pulseSensorEnabled = enable;
    Serial.printf("Pulse Sensor %s\n", enable ? "enabled" : "disabled");
  } else if (sensorName == "falseAlarmCancel" || sensorName == "cancel") {
    sensorMgr.falseAlarmCancelButtonEnabled = enable;
    Serial.printf("False Alarm Cancel Button %s\n", enable ? "enabled" : "disabled");
  }
}

/**
 * Check if a sensor is ready
 */
bool isSensorReady(String sensorName) {
  if (sensorName == "mpu6050") {
    return sensorMgr.mpu6050Ready;
  } else if (sensorName == "pulse") {
    return sensorMgr.pulseSensorReady;
  } else if (sensorName == "falseAlarmCancel" || sensorName == "cancel") {
    return sensorMgr.falseAlarmCancelButtonReady;
  } else if (sensorName == "power") {
    return sensorMgr.powerManagementReady;
  } else if (sensorName == "alert") {
    return sensorMgr.alertSystemReady;
  }
  return false;
}

