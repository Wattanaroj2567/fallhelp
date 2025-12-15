/**
 * @file AlertSystem.ino
 * @brief Alert System - Speaker/Buzzer for Alerts
 * 
 * ใช้กับ: Alert System - ระบบแจ้งเตือนด้วยเสียง
 * 
 * Hardware:
 * - Grove Speaker Module - GPIO25 (PWM)
 * 
 * Features:
 * - Fall detection alert (triple beep)
 * - False Alarm Cancel confirmation (success beep)
 * - Low battery alert (double beep)
 * - Heart rate alert (double beep)
 * - Configurable tones and patterns
 * 
 * Integration:
 * - ถูกเรียกใช้จาก MPU6050_Sensor.ino (fall detection)
 * - ถูกเรียกใช้จาก FalseAlarmCancelButton.ino (false alarm cancel confirmation)
 * - ถูกเรียกใช้จาก PowerManagement.ino (low battery)
 * - ถูกเรียกใช้จาก PulseSensor.ino (heart rate alert)
 */

// ==================== Alert System Configuration ====================
#define SPEAKER_PIN 25              // GPIO25 (PWM-capable) - Speaker output
// Note: LED indicator removed - system doesn't have LED hardware yet

// Alert Tones (Frequencies in Hz)
#define TONE_FALL 800               // Fall detection tone
#define TONE_BATTERY_LOW 600        // Low battery tone
#define TONE_HEART_RATE_ALERT 700   // Heart rate alert tone
#define TONE_SUCCESS 500            // Success/confirmation tone (False Alarm Cancel)

// Alert Durations
#define ALERT_DURATION_SHORT 200    // ms - Short beep
#define ALERT_DURATION_MEDIUM 500   // ms - Medium beep
#define ALERT_DURATION_LONG 1000    // ms - Long beep
#define ALERT_PATTERN_INTERVAL 300  // ms - Interval between pattern beeps

// Alert Patterns
#define PATTERN_SINGLE 1            // Single beep
#define PATTERN_DOUBLE 2            // Double beep
#define PATTERN_TRIPLE 3            // Triple beep

// ==================== Alert System State Variables ====================
struct AlertSystemState {
  bool isPlaying;
  unsigned long alertStartTime;
  unsigned long alertDuration;
  int currentPattern;
  int patternCount;
  bool isInitialized;
};

AlertSystemState alertState = {
  false, 0, 0, 0, 0, false
};

// ==================== Alert System Function Prototypes ====================
bool initAlertSystem();
void playTone(int frequency, unsigned long duration);
void playPattern(int pattern, int frequency);
void alertFall();
void alertBatteryLow();
void alertHeartRate();
void alertSuccess();  // False Alarm Cancel confirmation
void stopAlert();
void updateAlertSystem();
// Removed: blinkLED() - LED hardware not available

// ==================== Alert System Initialization ====================
/**
 * Initialize Alert System
 * @return true if successful, false otherwise
 */
bool initAlertSystem() {
  // Configure speaker pin (PWM using LEDC)
  pinMode(SPEAKER_PIN, OUTPUT);
  // LEDC (LED PWM Controller) setup for tone generation
  // Channel 0, 2000Hz base frequency, 8-bit resolution (0-255)
  ledcSetup(0, 2000, 8);
  ledcAttachPin(SPEAKER_PIN, 0);  // Attach GPIO25 to LEDC channel 0
  
  // LED removed - system doesn't have LED hardware yet
  
  alertState.isInitialized = true;
  
  Serial.println("✅ Alert System initialized");
  
  // Test beep
  playTone(TONE_SUCCESS, ALERT_DURATION_SHORT);
  delay(100);
  
  return true;
}

// ==================== Tone Generation ====================
/**
 * Play a tone at specified frequency and duration
 * @param frequency Frequency in Hz
 * @param duration Duration in milliseconds
 */
void playTone(int frequency, unsigned long duration) {
  if (frequency <= 0) {
    // Silent (turn off)
    ledcWriteTone(0, 0);
    return;
  }
  
  // Generate tone at specified frequency using LEDC
  // Note: ledcWriteTone() is available in ESP32 Arduino Core 2.x+
  // For older cores (< 2.0), may need to use ledcWrite() with manual frequency calculation
  ledcWriteTone(0, frequency);
  alertState.isPlaying = true;
  alertState.alertStartTime = millis();
  alertState.alertDuration = duration;
}

/**
 * Play an alert pattern
 * @param pattern Pattern type (1=single, 2=double, 3=triple)
 * @param frequency Frequency in Hz
 */
void playPattern(int pattern, int frequency) {
  switch (pattern) {
    case PATTERN_SINGLE:
      playTone(frequency, ALERT_DURATION_MEDIUM);
      break;
      
    case PATTERN_DOUBLE:
      playTone(frequency, ALERT_DURATION_SHORT);
      delay(ALERT_PATTERN_INTERVAL);
      playTone(frequency, ALERT_DURATION_SHORT);
      break;
      
    case PATTERN_TRIPLE:
      for (int i = 0; i < 3; i++) {
        playTone(frequency, ALERT_DURATION_SHORT);
        if (i < 2) delay(ALERT_PATTERN_INTERVAL);
      }
      break;
  }
}

// ==================== Alert Functions ====================
/**
 * Alert for fall detection
 */
void alertFall() {
  Serial.println("🔊 Fall Detection Alert!");
  playPattern(PATTERN_TRIPLE, TONE_FALL);
}


/**
 * Alert for low battery
 */
void alertBatteryLow() {
  Serial.println("🔊 Low Battery Alert!");
  playPattern(PATTERN_DOUBLE, TONE_BATTERY_LOW);
}

/**
 * Alert for heart rate anomaly
 */
void alertHeartRate() {
  Serial.println("🔊 Heart Rate Alert!");
  playPattern(PATTERN_DOUBLE, TONE_HEART_RATE_ALERT);
}

/**
 * Success/confirmation alert
 */
void alertSuccess() {
  Serial.println("🔊 Success Alert!");
  playTone(TONE_SUCCESS, ALERT_DURATION_SHORT);
}

/**
 * Stop current alert
 */
void stopAlert() {
  ledcWriteTone(0, 0);
  alertState.isPlaying = false;
}

// Removed: blinkLED() - LED hardware not available in current system

// ==================== Alert System Main Loop ====================
/**
 * Update Alert System (call in main loop)
 */
void updateAlertSystem() {
  if (!alertState.isInitialized && !initAlertSystem()) {
    return;
  }
  
  // Stop tone after duration
  if (alertState.isPlaying) {
    if (millis() - alertState.alertStartTime >= alertState.alertDuration) {
      stopAlert();
    }
  }
}

// ==================== Alert System Utility Functions ====================
/**
 * Check if alert system is initialized
 */
bool isAlertSystemReady() {
  return alertState.isInitialized;
}

/**
 * Check if currently playing alert
 */
bool isAlertPlaying() {
  return alertState.isPlaying;
}

