/**
 * @file fallhelp_esp32.ino
 * @brief FallHelp ESP32 IoT Device - Fall Detection & Heart Rate Monitor
 *
 * ระบบตรวจจับการล้มและวัดชีพจรสำหรับผู้สูงอายุ
 *
 * Features:
 * - AP Mode สำหรับตั้งค่า WiFi ผ่าน Mobile App
 * - เชื่อมต่อ WiFi บ้านและ MQTT Broker
 * - ส่ง Sensor Events (Fall, Heart Rate, Status)
 *
 * Hardware:
 * - ESP32 DevKit V1
 * - MPU6050 Accelerometer/Gyroscope (I2C)
 * - XD-58C Pulse Heart Rate Sensor (Analog)
 *
 * Libraries Required (Install via Arduino IDE):
 * - WiFi (built-in)
 * - WebServer (built-in)
 * - Preferences (built-in)
 * - PubSubClient by Nick O'Leary
 * - ArduinoJson by Benoit Blanchon
 *
 * MQTT Topics:
 * - device/{deviceId}/fall      → Fall detection event
 * - device/{deviceId}/heartrate → Heart rate readings
 * - device/{deviceId}/status    → Device status
 *
 * @author FallHelp Team
 * @version 2.0.0
 * @date 2024
 */

// ==================== Configuration ====================

// AP Mode Settings (สำหรับตั้งค่า WiFi)
#define AP_SSID_PREFIX "FallHelp-"  // จะเป็น "FallHelp-{serialNumber}"
#define AP_PASSWORD "fallhelp123"

// Default MQTT Port (Server IP รับจาก Mobile App)
#define MQTT_PORT 1883

// ==================== Pin Definitions ====================
// MPU6050 (I2C)
#define MPU6050_SDA 21
#define MPU6050_SCL 22

// XD-58C Pulse Sensor (Analog)
#define PULSE_PIN 34

// Button (optional)
#define SOS_BTN_PIN 0  // BOOT button for SOS

// ==================== Thresholds ====================
// Fall Detection
#define FALL_THRESHOLD 3.0     // G-force threshold
#define FALL_COOLDOWN_MS 5000  // Cooldown after fall detection

// Heart Rate
#define HR_LOW_THRESHOLD 50    // Abnormal low
#define HR_HIGH_THRESHOLD 120  // Abnormal high

// ==================== Intervals ====================
#define HR_SEND_INTERVAL 10000    // Send HR every 10 seconds
#define STATUS_INTERVAL 30000     // Send status every 30 seconds
#define WIFI_CHECK_INTERVAL 5000  // Check WiFi connection

// ==================== Libraries ====================
#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>

// ==================== Global Objects ====================
WebServer server(80);
Preferences preferences;
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

// ==================== State Variables ====================
bool apMode = false;
String deviceSerial = "";  // Serial Number ของ ESP32
String savedSSID = "";
String savedPassword = "";
String savedMqttServer = "";  // MQTT Server IP จาก Mobile App
unsigned long lastHrTime = 0;
unsigned long lastStatusTime = 0;
unsigned long lastFallTime = 0;
unsigned long lastWifiCheckTime = 0;
bool fallDetected = false;

// Simulated sensor values (TODO: Replace with real sensor readings)
float simAccelX = 0.0;
float simAccelY = 0.0;
float simAccelZ = 1.0;
int simHeartRate = 75;

// ==================== Function Prototypes ====================
// WiFi & AP Mode
void loadWiFiConfig();
void saveWiFiConfig(String ssid, String password);
void clearWiFiConfig();
void startAPMode();
void startStationMode();
void setupWebServer();
void handleRoot();
void handleWifiConfig();
void handleWifiStatus();
void handleReset();

// MQTT
void setupMQTT();
void reconnectMQTT();

// Sensors
void setupSensors();
void readMPU6050();
void readPulseSensor();
void checkFallDetection();

// Publishing
void publishFall(float x, float y, float z, float magnitude);
void publishHeartRate(int bpm, bool isAbnormal);
void publishStatus(bool online);

// Simulation
void triggerSimulatedFall();
void triggerSimulatedHR(int type);
void handleSerialCommands();

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n╔══════════════════════════════════════════════════╗");
  Serial.println("║       FallHelp ESP32 v2.1.0                       ║");
  Serial.println("║       MPU6050 + XD-58C Pulse Sensor              ║");
  Serial.println("╚══════════════════════════════════════════════════╝");

  // Generate Device Serial from ESP32 chip ID
  uint64_t chipId = ESP.getEfuseMac();
  char serialBuf[20];
  snprintf(serialBuf, sizeof(serialBuf), "ESP32-%012llX", chipId);
  deviceSerial = String(serialBuf);
  Serial.printf("Device Serial: %s\n", deviceSerial.c_str());

  pinMode(SOS_BTN_PIN, INPUT_PULLUP);

  // Initialize Preferences for WiFi storage
  preferences.begin("fallhelp", false);

  // Load saved WiFi config
  loadWiFiConfig();

  // Check if WiFi is configured
  if (savedSSID.length() > 0) {
    Serial.println("\n📶 WiFi config found, connecting...");
    startStationMode();
  } else {
    Serial.println("\n📡 No WiFi config, starting AP Mode...");
    startAPMode();
  }

  setupSensors();

  Serial.println("\n✅ Ready! Serial Commands:");
  Serial.println("   'fall'    - Simulate fall event");
  Serial.println("   'hr low/normal/high' - Simulate HR");
  Serial.println("   'status'  - Send device status");
  Serial.println("   'reset'   - Clear WiFi config & restart");
}

// ==================== Main Loop ====================
void loop() {
  // Handle web server in AP mode
  if (apMode) {
    server.handleClient();
  } else {
    // Station Mode: Normal operation

    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
      if (millis() - lastWifiCheckTime > WIFI_CHECK_INTERVAL) {
        Serial.println("⚠️ WiFi disconnected, reconnecting...");
        WiFi.reconnect();
        lastWifiCheckTime = millis();
      }
      return;  // Skip MQTT and sensor if WiFi not connected
    }

    // Maintain MQTT connection
    if (!mqtt.connected()) {
      reconnectMQTT();
    }
    mqtt.loop();

    // Read sensors
    readMPU6050();
    readPulseSensor();

    // Check for fall
    checkFallDetection();

    // Send heart rate periodically
    if (millis() - lastHrTime >= HR_SEND_INTERVAL) {
      bool abnormal = (simHeartRate < HR_LOW_THRESHOLD || simHeartRate > HR_HIGH_THRESHOLD);
      publishHeartRate(simHeartRate, abnormal);
      lastHrTime = millis();
    }

    // Send status periodically
    if (millis() - lastStatusTime >= STATUS_INTERVAL) {
      publishStatus(true);
      lastStatusTime = millis();
    }
  }

  // Handle Serial commands (for simulation) - works in both modes
  handleSerialCommands();

  delay(10);
}

// ==================== Serial Command Handler ====================
void handleSerialCommands() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    cmd.toLowerCase();

    if (cmd == "fall") {
      triggerSimulatedFall();
    } else if (cmd == "hr low") {
      triggerSimulatedHR(0);
    } else if (cmd == "hr normal") {
      triggerSimulatedHR(1);
    } else if (cmd == "hr high") {
      triggerSimulatedHR(2);
    } else if (cmd == "status") {
      publishStatus(true);
    } else if (cmd == "reset") {
      Serial.println("🔄 Clearing WiFi config and restarting...");
      clearWiFiConfig();
      delay(1000);
      ESP.restart();
    } else if (cmd == "info") {
      Serial.println("\n📋 Device Info:");
      Serial.printf("   Serial: %s\n", deviceSerial.c_str());
      Serial.printf("   AP Mode: %s\n", apMode ? "Yes" : "No");
      Serial.printf("   WiFi SSID: %s\n", savedSSID.c_str());
      Serial.printf("   MQTT Server: %s\n", savedMqttServer.c_str());
      Serial.printf("   WiFi Status: %s\n", WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
      if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("   IP: %s\n", WiFi.localIP().toString().c_str());
      }
      Serial.printf("   MQTT: %s\n", mqtt.connected() ? "Connected" : "Disconnected");
    } else {
      Serial.println("Commands: fall, hr low/normal/high, status, reset, info");
    }
  }
}

// ==================== Simulation Triggers ====================
void triggerSimulatedFall() {
  Serial.println("\n🚨 SIMULATED FALL TRIGGERED!");

  // Simulate high G-force impact
  simAccelX = 2.5 + random(0, 100) / 100.0;
  simAccelY = 2.8 + random(0, 100) / 100.0;
  simAccelZ = 1.5 + random(0, 100) / 100.0;

  float magnitude = sqrt(simAccelX * simAccelX + simAccelY * simAccelY + simAccelZ * simAccelZ);

  publishFall(simAccelX, simAccelY, simAccelZ, magnitude);

  // Reset to normal after 2 seconds
  delay(2000);
  simAccelX = 0.0;
  simAccelY = 0.0;
  simAccelZ = 1.0;
}

void triggerSimulatedHR(int type) {
  switch (type) {
    case 0:  // Low
      simHeartRate = 40 + random(0, 10);
      Serial.printf("💙 Simulated LOW HR: %d BPM\n", simHeartRate);
      break;
    case 1:  // Normal
      simHeartRate = 65 + random(0, 30);
      Serial.printf("💚 Simulated NORMAL HR: %d BPM\n", simHeartRate);
      break;
    case 2:  // High
      simHeartRate = 115 + random(0, 25);
      Serial.printf("❤️ Simulated HIGH HR: %d BPM\n", simHeartRate);
      break;
  }

  bool abnormal = (simHeartRate < HR_LOW_THRESHOLD || simHeartRate > HR_HIGH_THRESHOLD);
  publishHeartRate(simHeartRate, abnormal);
}

// ==================== WiFi Config Storage ====================
void loadWiFiConfig() {
  savedSSID = preferences.getString("ssid", "");
  savedPassword = preferences.getString("password", "");
  savedMqttServer = preferences.getString("mqtt", "");
  Serial.printf("📂 Loaded config: SSID='%s', MQTT='%s'\n", savedSSID.c_str(), savedMqttServer.c_str());
}

void saveWiFiConfig(String ssid, String password, String mqttServer) {
  preferences.putString("ssid", ssid);
  preferences.putString("password", password);
  preferences.putString("mqtt", mqttServer);
  savedSSID = ssid;
  savedPassword = password;
  savedMqttServer = mqttServer;
  Serial.printf("💾 Saved config: SSID='%s', MQTT='%s'\n", ssid.c_str(), mqttServer.c_str());
}

void clearWiFiConfig() {
  preferences.remove("ssid");
  preferences.remove("password");
  preferences.remove("mqtt");
  savedSSID = "";
  savedPassword = "";
  savedMqttServer = "";
  Serial.println("🗑️ Config cleared");
}

// ==================== AP Mode ====================
void startAPMode() {
  apMode = true;

  // Use last 6 chars of serial for shorter SSID
  String shortId = deviceSerial.substring(deviceSerial.length() - 6);
  String apSSID = String(AP_SSID_PREFIX) + shortId;

  WiFi.mode(WIFI_AP);
  WiFi.softAP(apSSID.c_str(), AP_PASSWORD);

  Serial.println("\n╔══════════════════════════════════════════════════╗");
  Serial.println("║           📡 AP Mode Started                     ║");
  Serial.println("╠══════════════════════════════════════════════════╣");
  Serial.printf("║   SSID: %-40s║\n", apSSID.c_str());
  Serial.printf("║   Password: %-36s║\n", AP_PASSWORD);
  Serial.printf("║   IP: %-42s║\n", WiFi.softAPIP().toString().c_str());
  Serial.printf("║   Serial: %-38s║\n", deviceSerial.c_str());
  Serial.println("╠══════════════════════════════════════════════════╣");
  Serial.println("║   Connect to this WiFi with Mobile App           ║");
  Serial.println("║   POST /wifi-config with ssid, password, mqtt    ║");
  Serial.println("╚══════════════════════════════════════════════════╝");

  setupWebServer();
  server.begin();
}

void startStationMode() {
  apMode = false;

  WiFi.mode(WIFI_STA);
  WiFi.begin(savedSSID.c_str(), savedPassword.c_str());

  Serial.printf("📶 Connecting to '%s'", savedSSID.c_str());

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" Connected!");
    Serial.printf("   IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("   Signal: %d dBm\n", WiFi.RSSI());

    // Setup MQTT with saved server
    setupMQTT();
  } else {
    Serial.println(" FAILED!");
    Serial.println("   Starting AP Mode for reconfiguration...");
    startAPMode();
  }
}

// ==================== Web Server Handlers ====================
void setupWebServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/wifi-config", HTTP_POST, handleWifiConfig);
  server.on("/wifi-config", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
  });
  server.on("/status", HTTP_GET, handleWifiStatus);
  server.on("/reset", HTTP_POST, handleReset);
}

void handleRoot() {
  server.sendHeader("Access-Control-Allow-Origin", "*");

  String html = "<!DOCTYPE html><html><head>";
  html += "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<title>FallHelp WiFi Setup</title>";
  html += "<style>body{font-family:sans-serif;max-width:400px;margin:40px auto;padding:20px;background:#1a1a2e;color:#fff}";
  html += "h1{color:#4f46e5}input{width:100%;padding:12px;margin:8px 0;border:none;border-radius:8px;box-sizing:border-box}";
  html += "button{width:100%;padding:14px;background:#4f46e5;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px}";
  html += "button:hover{background:#4338ca}.info{background:#2d2d44;padding:15px;border-radius:8px;margin:10px 0;font-size:12px}</style></head>";
  html += "<body><h1>🛡️ FallHelp</h1>";
  html += "<div class='info'><strong>Serial:</strong> " + deviceSerial + "</div>";
  html += "<form action='/wifi-config' method='POST'>";
  html += "<input type='text' name='ssid' placeholder='WiFi Name (SSID)' required>";
  html += "<input type='password' name='password' placeholder='WiFi Password' required>";
  html += "<input type='text' name='mqtt' placeholder='MQTT Server IP (e.g. 192.168.1.100)' required>";
  html += "<button type='submit'>Connect</button>";
  html += "</form></body></html>";

  server.send(200, "text/html", html);
}

void handleWifiConfig() {
  server.sendHeader("Access-Control-Allow-Origin", "*");

  String ssid = "";
  String password = "";
  String mqttServer = "";

  // Handle both form data and JSON
  if (server.hasArg("plain")) {
    // JSON body
    StaticJsonDocument<256> doc;
    deserializeJson(doc, server.arg("plain"));
    ssid = doc["ssid"].as<String>();
    password = doc["password"].as<String>();
    mqttServer = doc["mqtt"].as<String>();
  } else {
    // Form data
    ssid = server.arg("ssid");
    password = server.arg("password");
    mqttServer = server.arg("mqtt");
  }

  if (ssid.length() == 0 || mqttServer.length() == 0) {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"SSID and MQTT server required\"}");
    return;
  }

  Serial.printf("\n📥 Received config: SSID='%s', MQTT='%s'\n", ssid.c_str(), mqttServer.c_str());

  // Save config
  saveWiFiConfig(ssid, password, mqttServer);

  // Send response
  String response = "{\"success\":true,\"message\":\"Configured. Restarting...\"}";
  server.send(200, "application/json", response);

  // Wait and restart
  delay(2000);
  ESP.restart();
}

void handleWifiStatus() {
  server.sendHeader("Access-Control-Allow-Origin", "*");

  StaticJsonDocument<256> doc;
  doc["serialNumber"] = deviceSerial;
  doc["apMode"] = apMode;
  doc["wifiConnected"] = WiFi.status() == WL_CONNECTED;
  doc["ssid"] = savedSSID;
  doc["mqtt"] = savedMqttServer;
  doc["ip"] = apMode ? WiFi.softAPIP().toString() : WiFi.localIP().toString();
  doc["rssi"] = WiFi.RSSI();

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleReset() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", "{\"success\":true,\"message\":\"Resetting...\"}");

  clearWiFiConfig();
  delay(1000);
  ESP.restart();
}

// ==================== MQTT Setup ====================
void setupMQTT() {
  if (savedMqttServer.length() == 0) {
    Serial.println("⚠️ MQTT Server not configured");
    return;
  }

  Serial.printf("\n📡 MQTT Server: %s:%d\n", savedMqttServer.c_str(), MQTT_PORT);
  mqtt.setServer(savedMqttServer.c_str(), MQTT_PORT);
  mqtt.setBufferSize(512);
}

void reconnectMQTT() {
  if (mqtt.connected() || apMode || savedMqttServer.length() == 0)
    return;

  static unsigned long lastAttempt = 0;
  if (millis() - lastAttempt < 5000)
    return;
  lastAttempt = millis();

  Serial.print("   Connecting to MQTT...");
  String clientId = "ESP32-" + deviceSerial.substring(deviceSerial.length() - 6);

  if (mqtt.connect(clientId.c_str())) {
    Serial.println(" Connected!");
    publishStatus(true);
  } else {
    Serial.printf(" Failed (rc=%d)\n", mqtt.state());
  }
}

// ==================== Sensor Setup ====================
void setupSensors() {
  Serial.println("\n🔧 Setting up sensors...");

  // Initialize I2C
  Wire.begin(MPU6050_SDA, MPU6050_SCL);

  // TODO: Initialize MPU6050
  // mpu.begin();
  // mpu.calcOffsets();
  Serial.println("   MPU6050: TODO - Add real initialization");

  // Pulse sensor is analog, no init needed
  Serial.println("   XD-58C Pulse: OK (Pin 34)");

  Serial.println("   ⚠️ Using SIMULATED sensor data");
  Serial.println("   Use Serial commands to trigger events");
}

// ==================== Sensor Reading ====================
void readMPU6050() {
  // TODO: Read real MPU6050 data
  // mpu.update();
  // float accX = mpu.getAccX();
  // float accY = mpu.getAccY();
  // float accZ = mpu.getAccZ();

  // For now, using simulated values
  // They are updated by triggerSimulatedFall()
}

void readPulseSensor() {
  // TODO: Read real pulse sensor
  // int rawValue = analogRead(PULSE_PIN);
  // Process with algorithm to get BPM

  // For now, using simulated values
  // They are updated by triggerSimulatedHR()
}

void checkFallDetection() {
  float magnitude = sqrt(simAccelX * simAccelX + simAccelY * simAccelY + simAccelZ * simAccelZ);

  // Only trigger if above threshold and not in cooldown
  if (magnitude > FALL_THRESHOLD && !fallDetected) {
    if (millis() - lastFallTime > FALL_COOLDOWN_MS) {
      fallDetected = true;
      lastFallTime = millis();

      // Fall is published by triggerSimulatedFall()
      // In real implementation, publish here
    }
  } else if (magnitude < 1.5) {
    fallDetected = false;
  }
}

// ==================== MQTT Publishing ====================
void publishFall(float x, float y, float z, float magnitude) {
  if (apMode || !mqtt.connected())
    return;

  String topic = "device/" + deviceSerial + "/fall";

  StaticJsonDocument<256> doc;
  doc["timestamp"] = millis();
  doc["accelerationX"] = x;
  doc["accelerationY"] = y;
  doc["accelerationZ"] = z;
  doc["magnitude"] = magnitude;

  char buffer[256];
  serializeJson(doc, buffer);

  if (mqtt.publish(topic.c_str(), buffer)) {
    Serial.printf("📤 FALL → %s\n", topic.c_str());
    Serial.printf("   Magnitude: %.2f g\n", magnitude);
  } else {
    Serial.println("❌ Failed to publish fall");
  }
}

void publishHeartRate(int bpm, bool isAbnormal) {
  if (apMode || !mqtt.connected())
    return;

  String topic = "device/" + deviceSerial + "/heartrate";

  StaticJsonDocument<128> doc;
  doc["timestamp"] = millis();
  doc["heartRate"] = bpm;
  doc["isAbnormal"] = isAbnormal;

  char buffer[128];
  serializeJson(doc, buffer);

  if (mqtt.publish(topic.c_str(), buffer)) {
    Serial.printf("📤 HR → %d BPM %s\n", bpm, isAbnormal ? "(ABNORMAL)" : "");
  } else {
    Serial.println("❌ Failed to publish HR");
  }
}

void publishStatus(bool online) {
  if (apMode || !mqtt.connected())
    return;

  String topic = "device/" + deviceSerial + "/status";

  StaticJsonDocument<128> doc;
  doc["timestamp"] = millis();
  doc["online"] = online;
  doc["signalStrength"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();

  char buffer[128];
  serializeJson(doc, buffer);

  if (mqtt.publish(topic.c_str(), buffer)) {
    Serial.printf("📤 STATUS → online=%s\n", online ? "true" : "false");
  } else {
    Serial.println("❌ Failed to publish status");
  }
}
