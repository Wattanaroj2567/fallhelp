/**
 * @file MPU6050_Sensor.ino
 * @brief MPU6050 Accelerometer & Gyroscope - Fall Detection Sensor
 * 
 * ใช้กับ: Fall Detection - ตรวจจับการหกล้มจากความเร่ง
 * 
 * Hardware:
 * - MPU6050 (I2C) - SDA=GPIO21, SCL=GPIO22
 * 
 * Features:
 * - Real-time acceleration monitoring
 * - Fall detection algorithm
 * - Configurable sensitivity
 * - MQTT event publishing
 * 
 * Integration:
 * - ใช้ FallDetectionConfig.ino สำหรับ threshold values
 * - ถูกเรียกใช้ผ่าน SensorManager.ino
 * - Trigger AlertSystem.ino เมื่อตรวจพบการหกล้ม
 */

// ==================== MPU6050 Configuration ====================
#define MPU6050_ADDR 0x68           // I2C Address (default)
#define MPU6050_PWR_MGMT_1 0x6B    // Power Management Register
#define MPU6050_ACCEL_XOUT_H 0x3B  // Accelerometer Data Register
#define MPU6050_GYRO_XOUT_H 0x43   // Gyroscope Data Register

// Fall Detection Thresholds (Using SiSFall-based configuration)
// Default values will be overridden by FallDetectionConfig.ino
#define FALL_THRESHOLD_ACCEL_DEFAULT 2.3    // Default g-force threshold (SiSFall-based)
#define FALL_THRESHOLD_DURATION_DEFAULT 150 // Default duration threshold (SiSFall-based)
#define SAMPLING_RATE 50                     // Hz - read sensor every 20ms

// Use active thresholds from FallDetectionConfig
// These will be set by initFallDetectionConfig()
extern float activeAccelThreshold;
extern unsigned long activeDurationThreshold;
extern float activeGyroThreshold;

// ==================== MPU6050 State Variables ====================
struct MPU6050Data {
  float accelX, accelY, accelZ;    // Accelerometer (g)
  float gyroX, gyroY, gyroZ;       // Gyroscope (deg/s)
  float totalAccel;                 // Total acceleration magnitude
  bool isInitialized;
};

MPU6050Data mpuData = {0, 0, 0, 0, 0, 0, 0, false};
unsigned long lastSensorRead = 0;
unsigned long fallDetectedTime = 0;
bool fallDetected = false;
int fallDetectionCount = 0;

// ==================== MPU6050 Function Prototypes ====================
bool initMPU6050();
void readMPU6050();
float calculateTotalAccel(float x, float y, float z);
bool detectFall();
void publishFallEvent();
void resetFallDetection();

// External configuration (from FallDetectionConfig.ino)
extern float activeAccelThreshold;
extern unsigned long activeDurationThreshold;
extern float activeGyroThreshold;

// ==================== MPU6050 Initialization ====================
/**
 * Initialize MPU6050 sensor via I2C
 * @return true if successful, false otherwise
 */
bool initMPU6050() {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(MPU6050_PWR_MGMT_1);
  Wire.write(0x00);  // Wake up MPU6050 (clear sleep mode)
  byte error = Wire.endTransmission();
  
  if (error != 0) {
    Serial.printf("❌ MPU6050 init failed (error: %d)\n", error);
    mpuData.isInitialized = false;
    return false;
  }
  
  // Wait for sensor to stabilize
  delay(100);
  
  // Test read to verify connection
  readMPU6050();
  
  if (mpuData.isInitialized) {
    Serial.println("✅ MPU6050 initialized");
    Serial.printf("   Initial reading: X=%.2f, Y=%.2f, Z=%.2f g\n", 
                  mpuData.accelX, mpuData.accelY, mpuData.accelZ);
  }
  
  return mpuData.isInitialized;
}

// ==================== MPU6050 Data Reading ====================
/**
 * Read accelerometer and gyroscope data from MPU6050
 */
void readMPU6050() {
  if (!mpuData.isInitialized && !initMPU6050()) {
    return;
  }
  
  // Request accelerometer data (6 bytes: X, Y, Z - each 2 bytes)
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(MPU6050_ACCEL_XOUT_H);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU6050_ADDR, 6, true);
  
  if (Wire.available() >= 6) {
    // Read accelerometer (16-bit signed, big-endian)
    int16_t accelX_raw = (Wire.read() << 8) | Wire.read();
    int16_t accelY_raw = (Wire.read() << 8) | Wire.read();
    int16_t accelZ_raw = (Wire.read() << 8) | Wire.read();
    
    // Convert to g-force (MPU6050 default: ±2g range = 16384 LSB/g)
    mpuData.accelX = accelX_raw / 16384.0;
    mpuData.accelY = accelY_raw / 16384.0;
    mpuData.accelZ = accelZ_raw / 16384.0;
    
    // Calculate total acceleration magnitude
    mpuData.totalAccel = calculateTotalAccel(mpuData.accelX, mpuData.accelY, mpuData.accelZ);
    
    mpuData.isInitialized = true;
  } else {
    mpuData.isInitialized = false;
    Serial.println("⚠️ MPU6050 read failed - insufficient data");
  }
  
  // Request gyroscope data (optional, for future use)
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(MPU6050_GYRO_XOUT_H);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU6050_ADDR, 6, true);
  
  if (Wire.available() >= 6) {
    int16_t gyroX_raw = (Wire.read() << 8) | Wire.read();
    int16_t gyroY_raw = (Wire.read() << 8) | Wire.read();
    int16_t gyroZ_raw = (Wire.read() << 8) | Wire.read();
    
    // Convert to deg/s (MPU6050 default: ±250°/s range = 131 LSB/°/s)
    mpuData.gyroX = gyroX_raw / 131.0;
    mpuData.gyroY = gyroY_raw / 131.0;
    mpuData.gyroZ = gyroZ_raw / 131.0;
  }
}

// ==================== Fall Detection Algorithm ====================
/**
 * Calculate total acceleration magnitude
 */
float calculateTotalAccel(float x, float y, float z) {
  return sqrt(x*x + y*y + z*z);
}

/**
 * Detect fall event based on acceleration threshold
 * @return true if fall detected, false otherwise
 */
bool detectFall() {
  // Check if acceleration exceeds threshold (using SiSFall-based threshold)
  float threshold = activeAccelThreshold > 0 ? activeAccelThreshold : FALL_THRESHOLD_ACCEL_DEFAULT;
  unsigned long durationThreshold = activeDurationThreshold > 0 ? activeDurationThreshold : FALL_THRESHOLD_DURATION_DEFAULT;
  
  if (mpuData.totalAccel > threshold) {
    fallDetectionCount++;
    
    // Require sustained high acceleration for minimum duration
    unsigned long currentDuration = fallDetectionCount * (1000 / SAMPLING_RATE);
    if (currentDuration >= durationThreshold) {
      if (!fallDetected) {
        fallDetected = true;
        fallDetectedTime = millis();
        Serial.println("\n🚨 FALL DETECTED!");
        
        // Start cancel window (30 seconds) for False Alarm Cancel Button
        setLastFallTimestamp(fallDetectedTime);
        Serial.printf("   Acceleration: %.2f g (threshold: %.2f g)\n", 
                      mpuData.totalAccel, threshold);
        Serial.printf("   Duration: %lu ms (threshold: %lu ms)\n",
                      currentDuration, durationThreshold);
        Serial.printf("   X=%.2f, Y=%.2f, Z=%.2f g\n", 
                      mpuData.accelX, mpuData.accelY, mpuData.accelZ);
        Serial.printf("   Gyro: X=%.1f, Y=%.1f, Z=%.1f deg/s\n",
                      mpuData.gyroX, mpuData.gyroY, mpuData.gyroZ);
        return true;
      }
    }
  } else {
    // Reset if acceleration drops below threshold
    if (fallDetectionCount > 0) {
      fallDetectionCount = 0;
    }
    
    // Reset fall flag after 5 seconds
    if (fallDetected && (millis() - fallDetectedTime > 5000)) {
      resetFallDetection();
    }
  }
  
  return false;
}

/**
 * Reset fall detection state
 */
void resetFallDetection() {
  fallDetected = false;
  fallDetectionCount = 0;
  fallDetectedTime = 0;
}

/**
 * Publish fall event to MQTT
 */
void publishFallEvent() {
  if (apMode || !mqtt.connected()) return;
  
  String topic = "device/" + deviceSerial + "/event";
  StaticJsonDocument<256> doc;
  doc["type"] = "fall";
  doc["timestamp"] = millis();
  doc["accelX"] = mpuData.accelX;
  doc["accelY"] = mpuData.accelY;
  doc["accelZ"] = mpuData.accelZ;
  doc["totalAccel"] = mpuData.totalAccel;
  doc["gyroX"] = mpuData.gyroX;
  doc["gyroY"] = mpuData.gyroY;
  doc["gyroZ"] = mpuData.gyroZ;
  doc["severity"] = "high";
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  if (mqtt.publish(topic.c_str(), buffer)) {
    Serial.println("📤 Fall event published to MQTT");
    
    // Trigger alert
    if (isAlertSystemReady()) {
      alertFall();
    }
  } else {
    Serial.println("❌ Failed to publish fall event");
  }
}

// ==================== MPU6050 Main Loop Handler ====================
/**
 * Update MPU6050 sensor (call in main loop)
 */
void updateMPU6050() {
  // Read sensor at specified sampling rate
  if (millis() - lastSensorRead >= (1000 / SAMPLING_RATE)) {
    readMPU6050();
    lastSensorRead = millis();
    
    // Check for fall detection
    if (detectFall()) {
      publishFallEvent();
    }
  }
}

/**
 * Get current MPU6050 data
 */
MPU6050Data getMPU6050Data() {
  return mpuData;
}

/**
 * Check if MPU6050 is initialized
 */
bool isMPU6050Ready() {
  return mpuData.isInitialized;
}

