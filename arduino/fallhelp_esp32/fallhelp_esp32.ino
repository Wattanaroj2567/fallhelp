/**
 * @file fallhelp_esp32.ino
 * @brief FallHelp ESP32 IoT Device - Captive Portal WiFi Setup
 *
 * Features:
 * - Open AP (No Password) for easy connection
 * - Captive Portal (Auto-open Web Page)
 * - Pre-configured MQTT Server
 * - Mobile-style Web UI
 * - Connect WiFi & MQTT
 */

#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>

// ==================== Configuration ====================
#define AP_SSID_PREFIX "FallHelp-"
// No Password - Open Network for easy Captive Portal
#define MQTT_SERVER "192.168.1.102"  // Pre-configured MQTT Server
#define MQTT_PORT 1883
#define WIFI_CHECK_INTERVAL 5000
#define STATUS_INTERVAL 15000
#define DNS_PORT 53

// ==================== Pin Definitions ====================
#define SOS_BTN_PIN 0

// ==================== Global Objects ====================
WebServer server(80);
DNSServer dnsServer;
Preferences preferences;
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

// ==================== State Variables ====================
bool apMode = false;
String deviceSerial = "";
String savedSSID = "";
String savedPassword = "";
String mqttServer = MQTT_SERVER;
unsigned long lastStatusTime = 0;
unsigned long lastWifiCheckTime = 0;

// ==================== Function Prototypes ====================
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
void handleCaptivePortal();
void sendResultPage(bool success, String message);
void setupMQTT();
void reconnectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void publishStatus(bool online);
void handleSerialCommands();

// ==================== Mobile-Style Web Page ====================
const char MAIN_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>FallHelp Setup</title>
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Kanit', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #F3F4F6;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .card {
      background: #FFFFFF;
      border-radius: 24px;
      padding: 32px 24px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      width: 100%;
      max-width: 380px;
    }
    .header {
      text-align: center;
      margin-bottom: 28px;
    }
    .header h1 {
      color: #16AD78;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .header p {
      color: #6B7280;
      font-size: 14px;
      font-weight: 400;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .input-wrapper {
      position: relative;
    }
    .form-group input {
      width: 100%;
      padding: 14px 16px;
      padding-right: 48px;
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      font-size: 16px;
      font-family: 'Kanit', sans-serif;
      transition: all 0.2s ease;
      outline: none;
      background: #FAFAFA;
    }
    .form-group input:focus {
      border-color: #16AD78;
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(22, 173, 120, 0.1);
    }
    .form-group input::placeholder {
      color: #9CA3AF;
    }
    .btn-primary {
      width: 100%;
      padding: 16px;
      background: #16AD78;
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Kanit', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 8px;
    }
    .btn-primary:hover {
      background: #14986A;
    }
    .btn-primary:active {
      transform: scale(0.98);
    }
    .device-info {
      text-align: center;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #F3F4F6;
    }
    .device-info span {
      color: #9CA3AF;
      font-size: 12px;
    }
    .loading, .success {
      display: none;
      text-align: center;
      padding: 24px 0;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid #E5E7EB;
      border-top-color: #16AD78;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading h2, .success h2 {
      color: #111827;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .loading p, .success p {
      color: #6B7280;
      font-size: 14px;
    }
    .success-icon {
      width: 56px;
      height: 56px;
      background: #16AD78;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .success-icon svg {
      width: 28px;
      height: 28px;
      stroke: white;
      stroke-width: 3;
      fill: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>FallHelp</h1>
      <p>ตั้งค่าการเชื่อมต่อ WiFi</p>
    </div>

    <div id="form-section">
      <form id="wifi-form" method="POST" action="/wifi-config" onsubmit="showLoading()">
        <div class="form-group">
          <label>ชื่อ WiFi (SSID)</label>
          <input type="text" id="ssid" name="ssid" placeholder="กรอกชื่อ WiFi" required>
        </div>
        <div class="form-group">
          <label>รหัสผ่าน WiFi</label>
          <input type="password" id="password" name="password" placeholder="กรอกรหัสผ่าน (ถ้ามี)">
          <p style="font-size:12px;color:#9CA3AF;margin-top:6px;">* รหัส 8 ตัวอักษรขึ้นไป (หรือเว้นว่างถ้าไม่มีรหัส)</p>
        </div>
        <button type="submit" class="btn-primary" id="submit-btn">บันทึกและเชื่อมต่อ</button>
        <p style="font-size:12px;color:#6B7280;margin-top:12px;text-align:center;">⏱️ หลังกดปุ่ม กรุณารอสักครู่ (ประมาณ 10 วินาที)</p>
      </form>
      <div class="device-info">
        <span>Device ID: %DEVICE_ID%</span>
      </div>
    </div>

    <div id="loading-section" style="display:none;text-align:center;padding:40px 0;">
      <div style="width:48px;height:48px;border:3px solid #E5E7EB;border-top-color:#16AD78;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
      <h2 style="color:#111827;font-size:18px;margin:0 0 4px;">กำลังทดสอบการเชื่อมต่อ...</h2>
      <p style="color:#6B7280;font-size:14px;margin:0;">กรุณารอสักครู่ (ประมาณ 10 วินาที)</p>
    </div>
  </div>

  <script>
    function showLoading() {
      document.getElementById('form-section').style.display = 'none';
      document.getElementById('loading-section').style.display = 'block';
    }
  </script>
  <style>
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</body>
</html>
)rawliteral";

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n╔══════════════════════════════════════════════════╗");
  Serial.println("║       FallHelp ESP32 v5.0 (Captive Portal)        ║");
  Serial.println("║       Open AP | Auto Web Popup | No BLE           ║");
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

  // Setup MQTT Callback
  mqtt.setCallback(mqttCallback);

  if (savedSSID.length() > 0) {
    Serial.println("\n📶 WiFi config found, connecting...");
    startStationMode();
  } else {
    Serial.println("\n📡 No WiFi config, starting Captive Portal...");
    startAPMode();
  }

  Serial.println("\n✅ Ready! Serial Commands: 'reset', 'info'");
}

// ==================== Main Loop ====================
void loop() {
  if (apMode) {
    dnsServer.processNextRequest();  // Handle DNS for Captive Portal
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

// ==================== AP Mode with Captive Portal ====================
void startAPMode() {
  apMode = true;
  String shortId = deviceSerial.substring(deviceSerial.length() - 6);
  String apSSID = String(AP_SSID_PREFIX) + shortId;
  
  WiFi.mode(WIFI_AP);
  WiFi.softAP(apSSID.c_str());  // No password = Open Network
  
  // Start DNS server for Captive Portal
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
  
  Serial.println("\n--- Captive Portal Started ---");
  Serial.printf("SSID: %s (Open Network)\n", apSSID.c_str());
  Serial.printf("IP: %s\n", WiFi.softAPIP().toString().c_str());
  Serial.println("📱 Connect to this WiFi, web page will open automatically!");

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
    Serial.println(" Failed! Starting Captive Portal...");
    startAPMode();
  }
}

// ==================== Web Server ====================
void setupWebServer() {
  // Captive Portal detection endpoints
  server.on("/generate_204", HTTP_GET, handleCaptivePortal);  // Android
  server.on("/fwlink", HTTP_GET, handleCaptivePortal);         // Microsoft
  server.on("/hotspot-detect.html", HTTP_GET, handleCaptivePortal);  // Apple
  server.on("/canonical.html", HTTP_GET, handleCaptivePortal);
  server.on("/success.txt", HTTP_GET, handleCaptivePortal);
  server.on("/ncsi.txt", HTTP_GET, handleCaptivePortal);
  
  // Main endpoints
  server.on("/", HTTP_GET, handleRoot);
  server.on("/wifi-config", HTTP_POST, handleWifiConfig);
  server.on("/status", HTTP_GET, handleWifiStatus);
  server.on("/reset", HTTP_POST, handleReset);
  
  // Catch all for captive portal
  server.onNotFound(handleCaptivePortal);
}

void handleCaptivePortal() {
  server.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/");
  server.send(302, "text/plain", "");
}

void handleRoot() {
  String html = FPSTR(MAIN_PAGE);
  html.replace("%DEVICE_ID%", deviceSerial);
  server.send(200, "text/html", html);
}

void handleWifiConfig() {
  String ssid = server.arg("ssid");
  String password = server.arg("password");

  // Validate
  if (ssid.length() == 0) {
    sendResultPage(false, "กรุณากรอกชื่อ WiFi");
    return;
  }
  
  if (password.length() > 0 && password.length() < 8) {
    sendResultPage(false, "รหัสผ่าน WiFi ต้องมีอย่างน้อย 8 ตัวอักษร");
    return;
  }

  Serial.printf("\n📶 Testing WiFi connection to '%s'...\n", ssid.c_str());
  
  // Disconnect from current network
  WiFi.disconnect();
  delay(100);
  
  // Try to connect to the new network
  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(ssid.c_str(), password.c_str());
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" Connected!");
    Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
    
    // Save config and respond success
    saveWiFiConfig(ssid, password);
    sendResultPage(true, "เชื่อมต่อสำเร็จ! อุปกรณ์จะรีสตาร์ทอัตโนมัติ");
    
    delay(1000);
    ESP.restart();
  } else {
    Serial.println(" Failed!");
    
    // Respond with error
    sendResultPage(false, "เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบรหัสผ่าน WiFi");
    
    // Go back to AP mode
    WiFi.disconnect();
    WiFi.mode(WIFI_AP);
  }
}

void sendResultPage(bool success, String message) {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta charset='UTF-8'>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<link href='https://fonts.googleapis.com/css2?family=Kanit:wght@400;600&display=swap' rel='stylesheet'>";
  html += "<style>";
  html += "body{font-family:'Kanit',sans-serif;background:#F3F4F6;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;margin:0;}";
  html += ".card{background:#fff;border-radius:24px;padding:32px;text-align:center;max-width:380px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);}";
  html += ".icon{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}";
  html += "h2{margin:0 0 8px;font-size:20px;}";
  html += "p{color:#6B7280;margin:0 0 20px;}";
  html += ".btn{display:block;width:100%;padding:14px;border:none;border-radius:12px;font-size:16px;font-weight:600;font-family:'Kanit',sans-serif;cursor:pointer;text-decoration:none;text-align:center;}";
  html += "</style></head><body><div class='card'>";
  
  if (success) {
    html += "<div class='icon' style='background:#16AD78;'>";
    html += "<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'><polyline points='20 6 9 17 4 12'/></svg>";
    html += "</div>";
    html += "<h2 style='color:#16AD78;'>สำเร็จ!</h2>";
    html += "<p>" + message + "</p>";
    html += "<p style='font-size:14px;'>คุณสามารถปิดหน้านี้ได้เลย</p>";
  } else {
    html += "<div class='icon' style='background:#EF4444;'>";
    html += "<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>";
    html += "</div>";
    html += "<h2 style='color:#EF4444;'>ไม่สำเร็จ</h2>";
    html += "<p>" + message + "</p>";
    html += "<a href='/' class='btn' style='background:#EF4444;color:white;'>ลองใหม่</a>";
  }
  
  html += "</div></body></html>";
  server.send(200, "text/html", html);
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

// ==================== MQTT ====================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("\n📨 Message arrived [%s]\n", topic);

  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.print("❌ JSON Parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  // Check for WiFi Config Update via MQTT
  String configTopic = "device/" + deviceSerial + "/config";
  if (String(topic) == configTopic) {
    if (doc.containsKey("wifiSSID") && doc.containsKey("wifiPassword")) {
      String newSSID = doc["wifiSSID"];
      String newPass = doc["wifiPassword"];
      
      Serial.println("⚙️ Received New WiFi Config via MQTT!");
      Serial.printf("   SSID: %s\n", newSSID.c_str());
      
      saveWiFiConfig(newSSID, newPass);
      
      Serial.println("🔄 Restarting to apply new WiFi settings...");
      delay(1000);
      ESP.restart();
    }
  }
}

void reconnectMQTT() {
  if (mqtt.connected() || apMode || mqttServer.length() == 0) return;

  static unsigned long lastAttempt = 0;
  if (millis() - lastAttempt < 5000) return;
  lastAttempt = millis();

  Serial.print("   Connecting to MQTT...");
  String clientId = "ESP32-" + deviceSerial.substring(deviceSerial.length() - 6);

  // Prepare Last Will Testament (sent by broker when ESP32 disconnects unexpectedly)
  String willTopic = "device/" + deviceSerial + "/status";
  String willPayload = "{\"online\":false,\"timestamp\":" + String(millis()) + "}";

  // Connect with Last Will: topic, QoS=1, retain=true, payload
  if (mqtt.connect(clientId.c_str(), NULL, NULL, willTopic.c_str(), 1, true, willPayload.c_str())) {
    Serial.println(" Connected!");
    
    String configTopic = "device/" + deviceSerial + "/config";
    mqtt.subscribe(configTopic.c_str());
    Serial.printf("   Subscribed to: %s\n", configTopic.c_str());
    Serial.printf("   Last Will set on: %s\n", willTopic.c_str());
    
    publishStatus(true);
  } else {
    Serial.printf(" Failed (rc=%d)\n", mqtt.state());
  }
}

void setupMQTT() {
  if (mqttServer.length() == 0) return;
  Serial.printf("\n📡 MQTT Server: %s:%d\n", mqttServer.c_str(), MQTT_PORT);
  mqtt.setServer(mqttServer.c_str(), MQTT_PORT);
  mqtt.setBufferSize(512);
}

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

// ==================== Config Management ====================
void loadWiFiConfig() {
  savedSSID = preferences.getString("ssid", "");
  savedPassword = preferences.getString("password", "");
  Serial.printf("📂 Loaded config: SSID='%s'\n", savedSSID.c_str());
}

void saveWiFiConfig(String ssid, String password) {
  preferences.putString("ssid", ssid);
  preferences.putString("password", password);
  savedSSID = ssid;
  savedPassword = password;
  Serial.println("💾 Config saved");
}

void clearWiFiConfig() {
  preferences.remove("ssid");
  preferences.remove("password");
  savedSSID = "";
  Serial.println("🗑️ Config cleared");
}

void handleSerialCommands() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "reset") {
      clearWiFiConfig();
      ESP.restart();
    } else if (cmd == "info") {
      Serial.printf("SSID: %s, MQTT: %s\n", savedSSID.c_str(), mqttServer.c_str());
    }
  }
}
