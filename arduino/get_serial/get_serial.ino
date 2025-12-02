/**
 * @file get_serial.ino
 * @brief FallHelp - ESP32-C3 Serial Number (แสดงครั้งเดียว)
 */

#include <WiFi.h>

void setup()
{
    Serial.begin(115200);
    delay(3000); // รอให้ Serial Monitor พร้อม
    
    WiFi.mode(WIFI_STA); // เปิด WiFi เพื่อดึง MAC
    
    // ดึง Chip ID
    uint64_t chipId = ESP.getEfuseMac();
    char serialNumber[32];
    snprintf(serialNumber, sizeof(serialNumber), "ESP32-%012llX", chipId);

    // แสดงผล
    Serial.println("\n\n");
    Serial.println("════════════════════════════════════════════════════");
    Serial.println("         FallHelp - ESP32-C3 Serial Number          ");
    Serial.println("════════════════════════════════════════════════════");
    Serial.println();
    Serial.print("   📌 Serial Number: ");
    Serial.println(serialNumber);
    Serial.println();
    Serial.println("════════════════════════════════════════════════════");
    Serial.println();
    
    // ข้อมูลชิป
    Serial.println("📋 ESP32-C3 Chip Information:");
    Serial.println("────────────────────────────────────────────────────");
    Serial.print("   • Chip Model:    "); Serial.println(ESP.getChipModel());
    Serial.print("   • Chip Revision: "); Serial.println(ESP.getChipRevision());
    Serial.print("   • CPU Cores:     "); Serial.println(ESP.getChipCores());
    Serial.print("   • CPU Frequency: "); Serial.print(ESP.getCpuFreqMHz()); Serial.println(" MHz");
    Serial.print("   • Flash Size:    "); Serial.print(ESP.getFlashChipSize() / (1024 * 1024)); Serial.println(" MB");
    Serial.print("   • Flash Speed:   "); Serial.print(ESP.getFlashChipSpeed() / 1000000); Serial.println(" MHz");
    Serial.print("   • Heap Size:     "); Serial.print(ESP.getHeapSize() / 1024); Serial.println(" KB");
    Serial.print("   • Free Heap:     "); Serial.print(ESP.getFreeHeap() / 1024); Serial.println(" KB");
    Serial.print("   • MAC Address:   "); Serial.println(WiFi.macAddress());
    Serial.println("────────────────────────────────────────────────────");
    Serial.println();
    Serial.println("✅ Copy the Serial Number above to Admin Panel");
    Serial.println();
}

void loop()
{
    // ไม่ต้องทำอะไร - แสดงผลครั้งเดียวใน setup() แล้ว
    delay(10000);
}