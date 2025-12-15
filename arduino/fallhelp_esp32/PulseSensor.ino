/**
 * @file PulseSensor.ino
 * @brief Pulse Sensor XD-58C - Heart Rate Monitoring
 * 
 * ใช้กับ: Heart Rate Monitoring - ตรวจสอบอัตราการเต้นของหัวใจ
 * 
 * Hardware:
 * - Pulse Sensor XD-58C (Analog) - GPIO34 (ADC1_CH6)
 * 
 * Features:
 * - Real-time heart rate monitoring
 * - Heart rate zone detection (low/normal/high)
 * - Configurable thresholds
 * - MQTT event publishing
 * 
 * Integration:
 * - ถูกเรียกใช้ผ่าน SensorManager.ino
 * - Trigger AlertSystem.ino เมื่อ heart rate ผิดปกติ
 */

// ==================== Pulse Sensor Configuration ====================
#define PULSE_SENSOR_PIN 34          // GPIO34 (ADC1_CH6) - Analog input
#define PULSE_SAMPLING_RATE 100     // Hz - read sensor every 10ms
#define PULSE_BUFFER_SIZE 100      // Samples for heart rate calculation

// Heart Rate Thresholds (BPM - Beats Per Minute)
#define HR_LOW_THRESHOLD 50         // Below 50 BPM = Low (Bradycardia)
#define HR_NORMAL_MIN 50            // Normal range: 50-100 BPM
#define HR_NORMAL_MAX 100
#define HR_HIGH_THRESHOLD 100       // Above 100 BPM = High (Tachycardia)
#define HR_CRITICAL_HIGH 120        // Above 120 BPM = Critical

// Heart Rate Calculation
#define CALCULATION_WINDOW 5000     // ms - window for BPM calculation
#define MIN_PEAK_DIFF 50            // Minimum difference between peaks

// ==================== Pulse Sensor State Variables ====================
struct PulseSensorData {
  int rawValue;                     // Raw ADC reading (0-4095)
  float voltage;                    // Voltage (0-3.3V)
  int heartRate;                    // Calculated BPM
  String zone;                      // "low", "normal", "high", "critical"
  bool isInitialized;
  unsigned long lastPeakTime;
  int peakCount;
  int peakBuffer[PULSE_BUFFER_SIZE];
  int bufferIndex;
  unsigned long lastCalculationTime;
};

PulseSensorData pulseData = {
  0, 0.0, 0, "unknown", false, 0, 0, {0}, 0, 0
};

unsigned long lastPulseRead = 0;
int lastValue = 0;
bool rising = false;
int peakValue = 0;

// ==================== Pulse Sensor Function Prototypes ====================
bool initPulseSensor();
void readPulseSensor();
void calculateHeartRate();
void detectHeartRateZone();
void publishHeartRateEvent(String eventType);
void resetPulseSensor();

// ==================== Pulse Sensor Initialization ====================
/**
 * Initialize Pulse Sensor
 * @return true if successful, false otherwise
 */
bool initPulseSensor() {
  // GPIO34 is input-only (no pull-up/pull-down)
  pinMode(PULSE_SENSOR_PIN, INPUT);
  
  // Initialize ADC (ESP32 default: 12-bit, 0-3.3V)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);  // 0-3.3V range
  
  // Read initial value to test
  delay(100);
  pulseData.rawValue = analogRead(PULSE_SENSOR_PIN);
  pulseData.voltage = (pulseData.rawValue / 4095.0) * 3.3;
  
  if (pulseData.rawValue > 0 && pulseData.rawValue < 4095) {
    pulseData.isInitialized = true;
    Serial.println("✅ Pulse Sensor initialized");
    Serial.printf("   Initial reading: %d (%.2fV)\n", 
                  pulseData.rawValue, pulseData.voltage);
  } else {
    Serial.println("⚠️ Pulse Sensor may not be connected");
    pulseData.isInitialized = false;
  }
  
  return pulseData.isInitialized;
}

// ==================== Pulse Sensor Data Reading ====================
/**
 * Read pulse sensor analog value
 */
void readPulseSensor() {
  if (!pulseData.isInitialized && !initPulseSensor()) {
    return;
  }
  
  // Read analog value
  pulseData.rawValue = analogRead(PULSE_SENSOR_PIN);
  pulseData.voltage = (pulseData.rawValue / 4095.0) * 3.3;
  
  // Simple peak detection algorithm
  int currentValue = pulseData.rawValue;
  
  // Detect rising edge
  if (currentValue > lastValue) {
    rising = true;
    if (currentValue > peakValue) {
      peakValue = currentValue;
    }
  }
  
  // Detect peak (transition from rising to falling)
  if (rising && currentValue < lastValue) {
    // Found a peak
    if (peakValue - lastValue > MIN_PEAK_DIFF) {
      unsigned long currentTime = millis();
      
      // Store peak time for BPM calculation
      if (pulseData.lastPeakTime > 0) {
        unsigned long interval = currentTime - pulseData.lastPeakTime;
        if (interval > 300 && interval < 2000) {  // Valid heart rate range: 30-200 BPM
          pulseData.peakCount++;
        }
      }
      
      pulseData.lastPeakTime = currentTime;
    }
    
    rising = false;
    peakValue = 0;
  }
  
  lastValue = currentValue;
  
  // Calculate heart rate every calculation window
  if (millis() - pulseData.lastCalculationTime >= CALCULATION_WINDOW) {
    calculateHeartRate();
    detectHeartRateZone();
    pulseData.lastCalculationTime = millis();
  }
}

// ==================== Heart Rate Calculation ====================
/**
 * Calculate heart rate (BPM) from peak detection
 */
void calculateHeartRate() {
  if (pulseData.peakCount > 0) {
    // BPM = (peak count / time window in minutes)
    float timeWindowMinutes = CALCULATION_WINDOW / 60000.0;
    pulseData.heartRate = (int)(pulseData.peakCount / timeWindowMinutes);
    
    // Clamp to reasonable range
    if (pulseData.heartRate < 30) pulseData.heartRate = 0;
    if (pulseData.heartRate > 200) pulseData.heartRate = 200;
    
    // Reset counter for next window
    pulseData.peakCount = 0;
  } else {
    // No peaks detected - may indicate sensor not attached or no pulse
    pulseData.heartRate = 0;
  }
}

/**
 * Detect heart rate zone (low/normal/high/critical)
 */
void detectHeartRateZone() {
  if (pulseData.heartRate == 0) {
    pulseData.zone = "unknown";
    return;
  }
  
  if (pulseData.heartRate < HR_LOW_THRESHOLD) {
    pulseData.zone = "low";
  } else if (pulseData.heartRate >= HR_LOW_THRESHOLD && 
             pulseData.heartRate <= HR_NORMAL_MAX) {
    pulseData.zone = "normal";
  } else if (pulseData.heartRate > HR_NORMAL_MAX && 
             pulseData.heartRate < HR_CRITICAL_HIGH) {
    pulseData.zone = "high";
  } else {
    pulseData.zone = "critical";
  }
}

/**
 * Publish heart rate event to MQTT
 */
void publishHeartRateEvent(String eventType) {
  if (apMode || !mqtt.connected()) return;
  
  String topic = "device/" + deviceSerial + "/event";
  StaticJsonDocument<256> doc;
  doc["type"] = "heart_rate";
  doc["event"] = eventType;  // "low", "normal", "high", "critical"
  doc["timestamp"] = millis();
  doc["heartRate"] = pulseData.heartRate;
  doc["zone"] = pulseData.zone;
  doc["rawValue"] = pulseData.rawValue;
  doc["voltage"] = pulseData.voltage;
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  if (mqtt.publish(topic.c_str(), buffer)) {
    Serial.printf("📤 Heart rate event published: %s (%d BPM)\n", 
                  eventType.c_str(), pulseData.heartRate);
  } else {
    Serial.println("❌ Failed to publish heart rate event");
  }
}

/**
 * Reset pulse sensor state
 */
void resetPulseSensor() {
  pulseData.peakCount = 0;
  pulseData.lastPeakTime = 0;
  pulseData.heartRate = 0;
  pulseData.zone = "unknown";
  lastValue = 0;
  rising = false;
  peakValue = 0;
}

// ==================== Pulse Sensor Main Loop Handler ====================
/**
 * Update Pulse Sensor (call in main loop)
 */
void updatePulseSensor() {
  // Read sensor at specified sampling rate
  if (millis() - lastPulseRead >= (1000 / PULSE_SAMPLING_RATE)) {
    readPulseSensor();
    lastPulseRead = millis();
    
    // Check for zone changes and publish events
    static String lastZone = "";
    if (pulseData.zone != lastZone && pulseData.heartRate > 0) {
      if (pulseData.zone == "low" || 
          pulseData.zone == "high" || 
          pulseData.zone == "critical") {
        publishHeartRateEvent(pulseData.zone);
        
        // Trigger alert for abnormal heart rate
        if (isAlertSystemReady() && 
            (pulseData.zone == "high" || pulseData.zone == "critical")) {
          alertHeartRate();
        }
      }
      lastZone = pulseData.zone;
    }
  }
}

/**
 * Get current pulse sensor data
 */
PulseSensorData getPulseSensorData() {
  return pulseData;
}

/**
 * Check if pulse sensor is initialized
 */
bool isPulseSensorReady() {
  return pulseData.isInitialized;
}

