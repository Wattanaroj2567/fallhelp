/**
 * @file get_serial.ino
 * @brief FallHelp - ESP32 Serial Number Reader
 * @note สำหรับบอร์ด ESP32-DevKitC V4 (Module ESP32-WROOM-32U)
 */

#include <WiFi.h>

void setup()
{
    Serial.begin(115200);
    delay(500); // รอระบบ Serial สักครู่

    // ✅ ส่วนที่เพิ่มมา: ล้างหน้าจอ Boot Log (ตัวหนังสือขยะ) ทิ้งไป
    for (int i = 0; i < 50; i++) {
        Serial.println();
    }

    WiFi.mode(WIFI_STA); // เปิด WiFi เพื่อดึงค่า MAC Address ที่ถูกต้อง
    
    // ดึง Chip ID และแปลงเป็น Serial Number
    uint64_t chipId = ESP.getEfuseMac();
    char serialNumber[32];
    snprintf(serialNumber, sizeof(serialNumber), "ESP32-%012llX", chipId);

    // แสดงผล
    Serial.println("════════════════════════════════════════════════════");
    Serial.println("       FallHelp - ESP32 Serial Number Reader        ");
    Serial.println("           (Model: ESP32-WROOM-32U)                 ");
    Serial.println("════════════════════════════════════════════════════");
    Serial.println();
    Serial.print("   📌 Serial Number: ");
    Serial.println(serialNumber);
    Serial.println();
    Serial.println("════════════════════════════════════════════════════");
    Serial.println();
    
    // ข้อมูลชิป
    Serial.println("📋 Chip Information:");
    Serial.println("────────────────────────────────────────────────────");
    Serial.print("   • Chip Model:      "); 
    Serial.println(ESP.getChipModel());
    
    Serial.print("   • Chip Revision:   "); 
    Serial.println(ESP.getChipRevision());
    
    Serial.print("   • CPU Cores:       "); 
    Serial.println(ESP.getChipCores());
    
    Serial.print("   • CPU Frequency:   "); 
    Serial.print(ESP.getCpuFreqMHz()); 
    Serial.println(" MHz");
    
    Serial.print("   • Flash Size:      "); 
    Serial.print(ESP.getFlashChipSize() / (1024 * 1024)); 
    Serial.println(" MB");
    
    Serial.print("   • MAC Address:     "); 
    Serial.println(WiFi.macAddress());
    
    Serial.println("────────────────────────────────────────────────────");
    Serial.println();
    Serial.println("✅ Copy the Serial Number above to Admin Panel");
    Serial.println("💡 Tip: Use Ctrl+A to select all, then Ctrl+C to copy");
    Serial.println();
}

void loop()
{
    // วนรอเฉยๆ ไม่ต้องทำอะไร
    delay(10000);
}