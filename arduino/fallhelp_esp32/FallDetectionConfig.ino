/**
 * @file FallDetectionConfig.ino
 * @brief Fall Detection Configuration - Based on SiSFall Dataset Research
 * 
 * ใช้กับ: Configuration - กำหนดค่า threshold สำหรับ Fall Detection
 * 
 * SiSFall Dataset Overview:
 * - 15 types of falls
 * - 19 types of ADLs (Activities of Daily Living)
 * - Participants: 19-75 years old
 * - Sensors: Accelerometer + Gyroscope
 * 
 * IMPORTANT: We use THRESHOLD VALUES from research papers that analyzed SiSFall dataset,
 * NOT the raw dataset itself. These thresholds are proven baselines that we can fine-tune.
 * 
 * Research-Based Thresholds (from SiSFall analysis papers):
 * - Acceleration threshold: 2.0-2.5g (typical fall detection)
 * - Duration threshold: 100-300ms (sustained high acceleration)
 * - Gyroscope threshold: 200-300 deg/s (rotation during fall)
 * 
 * Approach:
 * 1. Start with research-based thresholds (baseline)
 * 2. Test with 2-3 people (simulated falls)
 * 3. Fine-tune based on real-world testing results
 * 4. Finalize optimal thresholds for production
 * 
 * Integration:
 * - ถูกใช้โดย MPU6050_Sensor.ino สำหรับ fall detection thresholds
 * - ถูกเรียกใช้จาก fallhelp_esp32.ino หรือ SensorManager.ino
 */

// ==================== SiSFall-Based Configuration ====================

// Acceleration Thresholds (g-force)
// Based on research papers analyzing SiSFall dataset
// These are PROVEN baselines from multiple studies, not raw data
#define SISFALL_ACCEL_THRESHOLD_MIN 2.0   // Minimum threshold (more sensitive)
                                          // From studies showing 2.0g catches most falls
#define SISFALL_ACCEL_THRESHOLD_DEFAULT 2.3  // Default threshold (balanced)
                                             // Most common value in SiSFall research papers
#define SISFALL_ACCEL_THRESHOLD_MAX 2.8   // Maximum threshold (less sensitive)
                                          // Reduces false positives from normal activities

// Duration Thresholds (ms)
// Minimum duration of high acceleration to trigger fall
// Based on SiSFall analysis: falls typically last 100-300ms
#define SISFALL_DURATION_MIN 100          // Minimum duration (fast detection)
                                          // Catches quick falls but may have false positives
#define SISFALL_DURATION_DEFAULT 150     // Default duration (balanced)
                                         // Most common in research papers
#define SISFALL_DURATION_MAX 250         // Maximum duration (more stable)
                                        // Reduces false positives but may miss quick falls

// Gyroscope Thresholds (deg/s)
// Rotation detection during fall (optional enhancement)
#define SISFALL_GYRO_THRESHOLD_MIN 150    // Minimum rotation
#define SISFALL_GYRO_THRESHOLD_DEFAULT 200 // Default rotation
#define SISFALL_GYRO_THRESHOLD_MAX 300    // Maximum rotation

// Post-Fall Detection (ms)
// Time window after fall to detect post-fall state
#define SISFALL_POST_FALL_WINDOW 2000     // 2 seconds after fall
#define SISFALL_POST_FALL_ACCEL_THRESHOLD 0.5  // Low acceleration after fall (lying down)

// Sensitivity Levels
#define SENSITIVITY_LOW 0
#define SENSITIVITY_MEDIUM 1
#define SENSITIVITY_HIGH 2

// ==================== Current Configuration ====================
// These values can be adjusted based on testing
int currentSensitivity = SENSITIVITY_MEDIUM;  // Default: Medium sensitivity

// Active thresholds (will be set based on sensitivity)
float activeAccelThreshold = SISFALL_ACCEL_THRESHOLD_DEFAULT;
unsigned long activeDurationThreshold = SISFALL_DURATION_DEFAULT;
float activeGyroThreshold = SISFALL_GYRO_THRESHOLD_DEFAULT;

// ==================== Configuration Functions ====================
/**
 * Set fall detection sensitivity
 * @param sensitivity 0=Low, 1=Medium, 2=High
 */
void setFallDetectionSensitivity(int sensitivity) {
  currentSensitivity = sensitivity;
  
  switch (sensitivity) {
    case SENSITIVITY_LOW:
      activeAccelThreshold = SISFALL_ACCEL_THRESHOLD_MAX;
      activeDurationThreshold = SISFALL_DURATION_MAX;
      activeGyroThreshold = SISFALL_GYRO_THRESHOLD_MAX;
      Serial.println("📊 Fall Detection: Low Sensitivity (fewer false positives)");
      break;
      
    case SENSITIVITY_MEDIUM:
      activeAccelThreshold = SISFALL_ACCEL_THRESHOLD_DEFAULT;
      activeDurationThreshold = SISFALL_DURATION_DEFAULT;
      activeGyroThreshold = SISFALL_GYRO_THRESHOLD_DEFAULT;
      Serial.println("📊 Fall Detection: Medium Sensitivity (balanced)");
      break;
      
    case SENSITIVITY_HIGH:
      activeAccelThreshold = SISFALL_ACCEL_THRESHOLD_MIN;
      activeDurationThreshold = SISFALL_DURATION_MIN;
      activeGyroThreshold = SISFALL_GYRO_THRESHOLD_MIN;
      Serial.println("📊 Fall Detection: High Sensitivity (more sensitive)");
      break;
      
    default:
      currentSensitivity = SENSITIVITY_MEDIUM;
      activeAccelThreshold = SISFALL_ACCEL_THRESHOLD_DEFAULT;
      activeDurationThreshold = SISFALL_DURATION_DEFAULT;
      activeGyroThreshold = SISFALL_GYRO_THRESHOLD_DEFAULT;
      break;
  }
  
  Serial.printf("   Accel Threshold: %.2f g\n", activeAccelThreshold);
  Serial.printf("   Duration Threshold: %lu ms\n", activeDurationThreshold);
  Serial.printf("   Gyro Threshold: %.0f deg/s\n", activeGyroThreshold);
}

/**
 * Set custom thresholds (for fine-tuning after testing)
 * @param accelThreshold Acceleration threshold in g
 * @param durationThreshold Duration threshold in ms
 * @param gyroThreshold Gyroscope threshold in deg/s
 */
void setCustomFallThresholds(float accelThreshold, unsigned long durationThreshold, float gyroThreshold) {
  activeAccelThreshold = accelThreshold;
  activeDurationThreshold = durationThreshold;
  activeGyroThreshold = gyroThreshold;
  
  Serial.println("📊 Custom Fall Detection Thresholds Set:");
  Serial.printf("   Accel: %.2f g\n", activeAccelThreshold);
  Serial.printf("   Duration: %lu ms\n", activeDurationThreshold);
  Serial.printf("   Gyro: %.0f deg/s\n", activeGyroThreshold);
}

/**
 * Get current sensitivity level
 */
int getFallDetectionSensitivity() {
  return currentSensitivity;
}

/**
 * Get current acceleration threshold
 */
float getAccelThreshold() {
  return activeAccelThreshold;
}

/**
 * Get current duration threshold
 */
unsigned long getDurationThreshold() {
  return activeDurationThreshold;
}

/**
 * Get current gyroscope threshold
 */
float getGyroThreshold() {
  return activeGyroThreshold;
}

/**
 * Initialize fall detection configuration
 */
void initFallDetectionConfig() {
  // Set default sensitivity (Medium)
  setFallDetectionSensitivity(SENSITIVITY_MEDIUM);
  
  Serial.println("\n✅ Fall Detection Configuration initialized");
  Serial.println("   Using Research-Based Thresholds (from SiSFall analysis papers)");
  Serial.println("   Baseline: 2.3g @ 150ms (Medium sensitivity)");
  Serial.println("   Ready for real-world testing and fine-tuning");
}

