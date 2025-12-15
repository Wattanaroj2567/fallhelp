/**
 * @file FalseAlarmCancelButton.ino
 * @brief False Alarm Cancel Button Handler
 * 
 * ใช้กับ: False Alarm Cancel Button - ปุ่มยกเลิกการแจ้งเตือนการหกล้มที่ผิดพลาด
 * 
 * Flow:
 * 1. เมื่อตรวจพบการหกล้ม → ระบบแจ้งเตือน (Timer 30 วินาที)
 * 2. ผู้สูงอายุกดปุ่มนี้ภายใน 30 วินาที → ยกเลิกการแจ้งเตือน (False Alarm)
 * 3. ถ้าไม่กดภายใน 30 วินาที → สันนิษฐานว่าเกิดเหตุจริง (Confirmed)
 * 
 * Hardware:
 * - False Alarm Cancel Button - GPIO4 (Large Push Button Module)
 * 
 * Features:
 * - Button press detection with debouncing
 * - MQTT event publishing (cancel fall event)
 * - Visual/audio feedback (confirmation beep)
 * - Time window check (30 seconds from fall detection)
 * 
 * Integration:
 * - ถูกเรียกใช้ผ่าน SensorManager.ino
 * - Trigger AlertSystem.ino สำหรับ confirmation beep
 * - ส่ง MQTT event ไปยัง Backend เพื่อยกเลิก fall event
 */

// ==================== False Alarm Cancel Button Configuration ====================
#define FALSE_ALARM_BTN_PIN 4        // GPIO4 (Large Push Button Module)
#define DEBOUNCE_DELAY 50            // ms - debounce delay
#define CANCEL_TIME_WINDOW 30000     // ms - 30 seconds window to cancel

// ==================== False Alarm Cancel Button State Variables ====================
struct FalseAlarmCancelButtonState {
  bool lastState;                    // Last button state
  bool currentState;                 // Current button state
  unsigned long lastPressTime;       // Time of last press
  unsigned long pressStartTime;       // Time when button was pressed
  bool isPressed;                    // Button currently pressed
  bool isInitialized;
  unsigned long lastFallTimestamp;   // Timestamp of last fall detection (for time window check)
  String activeFallEventId;          // Active fall event ID (from Backend)
};

FalseAlarmCancelButtonState cancelButtonState = {
  HIGH, HIGH, 0, 0, false, false, 0, ""
};

// ==================== False Alarm Cancel Button Function Prototypes ====================
bool initFalseAlarmCancelButton();
void updateFalseAlarmCancelButton();
void handleCancelButtonPress();
void handleCancelButtonRelease();
void publishCancelEvent();
void setLastFallTimestamp(unsigned long timestamp);
void setActiveFallEventId(String eventId);
bool isWithinCancelWindow();

// ==================== False Alarm Cancel Button Initialization ====================
/**
 * Initialize False Alarm Cancel Button
 * @return true if successful, false otherwise
 */
bool initFalseAlarmCancelButton() {
  pinMode(FALSE_ALARM_BTN_PIN, INPUT_PULLUP);
  
  // Read initial state
  cancelButtonState.lastState = digitalRead(FALSE_ALARM_BTN_PIN);
  cancelButtonState.currentState = cancelButtonState.lastState;
  cancelButtonState.isInitialized = true;
  
  Serial.println("✅ False Alarm Cancel Button initialized");
  Serial.println("   Press Large Push Button (GPIO4) to cancel false alarm");
  
  return true;
}

// ==================== False Alarm Cancel Button Main Loop Handler ====================
/**
 * Update False Alarm Cancel Button state (call in main loop)
 */
void updateFalseAlarmCancelButton() {
  if (!cancelButtonState.isInitialized && !initFalseAlarmCancelButton()) {
    return;
  }
  
  // Read current button state
  cancelButtonState.currentState = digitalRead(FALSE_ALARM_BTN_PIN);
  
  // Detect state change (button pressed = LOW, released = HIGH)
  if (cancelButtonState.currentState != cancelButtonState.lastState) {
    // Debounce delay
    delay(DEBOUNCE_DELAY);
    
    // Re-read after debounce
    cancelButtonState.currentState = digitalRead(FALSE_ALARM_BTN_PIN);
    
    if (cancelButtonState.currentState != cancelButtonState.lastState) {
      // State change confirmed
      if (cancelButtonState.currentState == LOW) {
        // Button pressed
        handleCancelButtonPress();
      } else {
        // Button released
        handleCancelButtonRelease();
      }
      
      cancelButtonState.lastState = cancelButtonState.currentState;
    }
  }
}

// ==================== False Alarm Cancel Button Event Handlers ====================
/**
 * Handle cancel button press event
 */
void handleCancelButtonPress() {
  cancelButtonState.isPressed = true;
  cancelButtonState.pressStartTime = millis();
  
  Serial.println("\n🔘 False Alarm Cancel Button Pressed!");
  
  // Check if within cancel time window (30 seconds from fall detection)
  if (!isWithinCancelWindow()) {
    Serial.println("⚠️ Cancel time window expired (30 seconds)");
    Serial.println("   Cannot cancel - time window has passed");
    return;
  }
  
  // Publish cancel event
  publishCancelEvent();
  
  // Trigger confirmation beep
  if (isAlertSystemReady()) {
    alertSuccess();  // Confirmation beep
  }
}

/**
 * Handle cancel button release event
 */
void handleCancelButtonRelease() {
  unsigned long pressDuration = millis() - cancelButtonState.pressStartTime;
  Serial.printf("   Press duration: %lu ms\n", pressDuration);
  
  cancelButtonState.isPressed = false;
  cancelButtonState.lastPressTime = millis();
}

/**
 * Publish cancel event to MQTT
 * This will be handled by Backend to cancel the fall event
 * 
 * Note: Backend will handle the cancellation logic (check 30-second window, etc.)
 * ESP32 just sends the cancel request
 */
void publishCancelEvent() {
  if (apMode || !mqtt.connected()) {
    Serial.println("⚠️ Cannot publish cancel event - MQTT not connected");
    return;
  }
  
  String topic = "device/" + deviceSerial + "/event";
  StaticJsonDocument<256> doc;
  doc["type"] = "fall_cancel";
  doc["event"] = "cancel";
  doc["timestamp"] = millis();
  doc["fallTimestamp"] = cancelButtonState.lastFallTimestamp;
  if (cancelButtonState.activeFallEventId.length() > 0) {
    doc["eventId"] = cancelButtonState.activeFallEventId;
  }
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  if (mqtt.publish(topic.c_str(), buffer)) {
    Serial.println("📤 Cancel event published - False alarm cancelled");
    Serial.printf("   Event ID: %s\n", cancelButtonState.activeFallEventId.c_str());
  } else {
    Serial.println("❌ Failed to publish cancel event");
  }
}

/**
 * Set last fall detection timestamp
 * Call this when fall is detected to start the 30-second window
 */
void setLastFallTimestamp(unsigned long timestamp) {
  cancelButtonState.lastFallTimestamp = timestamp;
  Serial.printf("⏱️ Cancel window started: %lu ms (30 seconds)\n", timestamp);
}

/**
 * Set active fall event ID
 * Call this when fall event is created (received from Backend via MQTT config topic)
 */
void setActiveFallEventId(String eventId) {
  cancelButtonState.activeFallEventId = eventId;
  Serial.printf("📌 Active fall event ID set: %s\n", eventId.c_str());
}

/**
 * Check if current time is within cancel window (30 seconds)
 */
bool isWithinCancelWindow() {
  if (cancelButtonState.lastFallTimestamp == 0) {
    // No fall detected yet
    return false;
  }
  
  unsigned long elapsed = millis() - cancelButtonState.lastFallTimestamp;
  bool withinWindow = elapsed <= CANCEL_TIME_WINDOW;
  
  if (!withinWindow) {
    Serial.printf("⏰ Cancel window expired: %lu ms elapsed (max: %lu ms)\n", 
                  elapsed, CANCEL_TIME_WINDOW);
  }
  
  return withinWindow;
}

// ==================== False Alarm Cancel Button Utility Functions ====================
/**
 * Get current cancel button state
 */
FalseAlarmCancelButtonState getFalseAlarmCancelButtonState() {
  return cancelButtonState;
}

/**
 * Check if cancel button is initialized
 */
bool isFalseAlarmCancelButtonReady() {
  return cancelButtonState.isInitialized;
}

/**
 * Reset cancel button state
 */
void resetFalseAlarmCancelButton() {
  cancelButtonState.isPressed = false;
  cancelButtonState.pressStartTime = 0;
  cancelButtonState.lastPressTime = 0;
  cancelButtonState.lastFallTimestamp = 0;
  cancelButtonState.activeFallEventId = "";
}

