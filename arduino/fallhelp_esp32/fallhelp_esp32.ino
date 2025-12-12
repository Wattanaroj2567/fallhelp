/**
 * @file fallhelp_esp32.ino
 * @brief FallHelp ESP32 IoT Device - Connectivity & OTA Config Mode
 *
 * ระบบเชื่อมต่อและรับค่า Config ผ่าน MQTT (ตัด Simulation ออกตามคำขอ)
 *
 * Features:
 * - AP Mode สำหรับตั้งค่า WiFi ครั้งแรก
 * - Connect WiFi & MQTT
 * - **NEW:** Receive WiFi Config via MQTT (Remote Update)
 * - **NEW:** No Simulated Triggers (Connectivity Focus)
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>

// ==================== Configuration ====================
#define AP_SSID_PREFIX "FallHelp-"
#define AP_PASSWORD "fallhelp123"
#define MQTT_PORT 1883
#define WIFI_CHECK_INTERVAL 5000
#define STATUS_INTERVAL 30000

// ==================== Pin Definitions ====================
#define SOS_BTN_PIN 0

// ==================== Global Objects ====================
WebServer server(80);
Preferences preferences;
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

// ==================== State Variables ====================
bool apMode = false;
String deviceSerial = "";
String savedSSID = "";
String savedPassword = "";
String savedMqttServer = "";
unsigned long lastStatusTime = 0;
unsigned long lastWifiCheckTime = 0;

// ==================== Function Prototypes ====================
void loadWiFiConfig();
void saveWiFiConfig(String ssid, String password, String mqttServer);
void clearWiFiConfig();
void startAPMode();
void startStationMode();
void setupWebServer();
void handleRoot();
void handleWifiConfig();
void handleWifiStatus();
void handleReset();
void setupMQTT();
void reconnectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void publishStatus(bool online);
void handleSerialCommands();

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n╔══════════════════════════════════════════════════╗");
  Serial.println("║       FallHelp ESP32 v3.0 (Connectivity)          ║");
  Serial.println("║       MQTT Config Enabled | No Triggers          ║");
  Serial.println("╚══════════════════════════════════════════════════╝");

  // Generate Device Serial
  uint64_t chipId = ESP.getEfuseMac();
  char serialBuf[20];
  snprintf(serialBuf, sizeof(serialBuf), "ESP32-%012llX", chipId);
  deviceSerial = String(serialBuf);
  Serial.printf("Device Serial: %s\n", deviceSerial.c_str());

  pinMode(SOS_BTN_PIN, INPUT_PULLUP);

  preferences.begin("fallhelp", false);
  loadWiFiConfig();

  // Setup MQTT Callback (IMPORTANT)
  mqtt.setCallback(mqttCallback);

  if (savedSSID.length() > 0) {
    Serial.println("\n📶 WiFi config found, connecting...");
    startStationMode();
  } else {
    Serial.println("\n📡 No WiFi config, starting AP Mode...");
    startAPMode();
  }

  // ==========================================
  // 🔮 FUTURE IMPLEMENTATION: Smart Self-Check
  // ==========================================
  // TODO: Add sensor verification logic here.
  // 1. Check MPU6050 connection (I2C)
  // 2. Check Pulse Sensor signal
  // 3. If failed -> mqtt.publish(topic, "{\"error\": \"SENSOR_FAIL\"}");

  Serial.println("\n✅ Ready! Serial Commands: 'reset', 'info'");
}

// ==================== Main Loop ====================
void loop() {
  if (apMode) {
    server.handleClient();
  } else {
    // Check WiFi
    if (WiFi.status() != WL_CONNECTED) {
      if (millis() - lastWifiCheckTime > WIFI_CHECK_INTERVAL) {
        Serial.println("⚠️ WiFi disconnected, reconnecting...");
        WiFi.reconnect();
        lastWifiCheckTime = millis();
      }
      return;
    }

    // Maintain MQTT
    if (!mqtt.connected()) {
      reconnectMQTT();
    }
    mqtt.loop();

    // Send status periodically
    if (millis() - lastStatusTime >= STATUS_INTERVAL) {
      publishStatus(true);
      lastStatusTime = millis();
    }
  }

  handleSerialCommands();
  delay(10);
}

// ==================== MQTT Callback & Reconnect ====================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("\n📨 Message arrived [%s]\n", topic);

  // Parse JSON
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.print("❌ JSON Parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  // Check for WiFi Config Update
  // Topic: device/{serial}/config
  String configTopic = "device/" + deviceSerial + "/config";
  if (String(topic) == configTopic) {
    if (doc.containsKey("wifiSSID") && doc.containsKey("wifiPassword")) {
      String newSSID = doc["wifiSSID"];
      String newPass = doc["wifiPassword"];
      
      Serial.println("⚙️ Received New WiFi Config via MQTT!");
      Serial.printf("   SSID: %s\n", newSSID.c_str());
      
      // Save and Restart
      saveWiFiConfig(newSSID, newPass, savedMqttServer); // Keep same MQTT server
      
      Serial.println("🔄 Restarting to apply new WiFi settings...");
      delay(1000);
      ESP.restart();
    }
  }
}

void reconnectMQTT() {
  if (mqtt.connected() || apMode || savedMqttServer.length() == 0) return;

  static unsigned long lastAttempt = 0;
  if (millis() - lastAttempt < 5000) return;
  lastAttempt = millis();

  Serial.print("   Connecting to MQTT...");
  String clientId = "ESP32-" + deviceSerial.substring(deviceSerial.length() - 6);

  if (mqtt.connect(clientId.c_str())) {
    Serial.println(" Connected!");
    
    // Subscribe to Config Topic
    String configTopic = "device/" + deviceSerial + "/config";
    mqtt.subscribe(configTopic.c_str());
    Serial.printf("   Subscribed to: %s\n", configTopic.c_str());
    
    publishStatus(true);
  } else {
    Serial.printf(" Failed (rc=%d)\n", mqtt.state());
  }
}

void setupMQTT() {
  if (savedMqttServer.length() == 0) return;
  Serial.printf("\n📡 MQTT Server: %s:%d\n", savedMqttServer.c_str(), MQTT_PORT);
  mqtt.setServer(savedMqttServer.c_str(), MQTT_PORT);
  mqtt.setBufferSize(512);
}

// ==================== Status Publishing ====================
void publishStatus(bool online) {
  if (apMode || !mqtt.connected()) return;

  String topic = "device/" + deviceSerial + "/status";
  StaticJsonDocument<128> doc;
  doc["timestamp"] = millis();
  doc["online"] = online;
  doc["signalStrength"] = WiFi.RSSI();
  doc["ip"] = WiFi.localIP().toString();

  char buffer[128];
  serializeJson(doc, buffer);
  mqtt.publish(topic.c_str(), buffer);
}

// ==================== WiFi & WebServer (Unchanged Logic) ====================
void loadWiFiConfig() {
  savedSSID = preferences.getString("ssid", "");
  savedPassword = preferences.getString("password", "");
  savedMqttServer = preferences.getString("mqtt", "");
  Serial.printf("📂 Loaded config: SSID='%s'\n", savedSSID.c_str());
}

void saveWiFiConfig(String ssid, String password, String mqttServer) {
  preferences.putString("ssid", ssid);
  preferences.putString("password", password);
  preferences.putString("mqtt", mqttServer);
  savedSSID = ssid;
  savedPassword = password;
  savedMqttServer = mqttServer;
  Serial.println("💾 Config saved");
}

void clearWiFiConfig() {
  preferences.remove("ssid");
  preferences.remove("password");
  preferences.remove("mqtt");
  savedSSID = "";
  Serial.println("🗑️ Config cleared");
}

void startAPMode() {
  apMode = true;
  String shortId = deviceSerial.substring(deviceSerial.length() - 6);
  String apSSID = String(AP_SSID_PREFIX) + shortId;
  WiFi.mode(WIFI_AP);
  WiFi.softAP(apSSID.c_str(), AP_PASSWORD);
  
  Serial.println("\n--- AP Mode Started ---");
  Serial.printf("SSID: %s\n", apSSID.c_str());
  Serial.printf("IP: %s\n", WiFi.softAPIP().toString().c_str());

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
    Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
    setupMQTT();
  } else {
    Serial.println(" Failed! Starting AP Mode...");
    startAPMode();
  }
}

void setupWebServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/wifi-config", HTTP_POST, handleWifiConfig);
  server.on("/status", HTTP_GET, handleWifiStatus);
  server.on("/reset", HTTP_POST, handleReset);
}

void handleRoot() {
  String html = "<h1>FallHelp ESP32</h1><form action='/wifi-config' method='POST'>";
  html += "<input type='text' name='ssid' placeholder='SSID'><br>";
  html += "<input type='text' name='password' placeholder='Password'><br>";
  html += "<input type='text' name='mqtt' placeholder='MQTT IP'><br>";
  html += "<button type='submit'>Save</button></form>";
  server.send(200, "text/html", html);
}

void handleWifiConfig() {
  String ssid = server.arg("ssid");
  String password = server.arg("password");
  String mqttVal = server.arg("mqtt");
  
  if (server.hasArg("plain")) {
    StaticJsonDocument<256> doc;
    deserializeJson(doc, server.arg("plain"));
    ssid = doc["ssid"].as<String>();
    password = doc["password"].as<String>();
    mqttVal = doc["mqtt"].as<String>();
  }

  saveWiFiConfig(ssid, password, mqttVal);
  server.send(200, "application/json", "{\"success\":true}");
  delay(1000);
  ESP.restart();
}

void handleWifiStatus() {
  StaticJsonDocument<200> doc;
  doc["connected"] = (WiFi.status() == WL_CONNECTED);
  doc["ip"] = WiFi.localIP().toString();
  String res;
  serializeJson(doc, res);
  server.send(200, "application/json", res);
}

void handleReset() {
  server.send(200, "application/json", "{\"success\":true}");
  clearWiFiConfig();
  delay(1000);
  ESP.restart();
}

void handleSerialCommands() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "reset") {
      clearWiFiConfig();
      ESP.restart();
    } else if (cmd == "info") {
       Serial.printf("SSID: %s, MQTT: %s\n", savedSSID.c_str(), savedMqttServer.c_str());
    }
  }
}
