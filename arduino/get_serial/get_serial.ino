/**
 * @file get_serial.ino
 * @brief FallHelp - Get ESP32 Serial Number
 *
 * ใช้สำหรับดึง S/N ของ ESP32 เพื่อนำไปสร้างอุปกรณ์ใน Admin Panel
 *
 * วิธีใช้:
 * 1. เปิดไฟล์นี้ใน Arduino IDE
 * 2. Upload ไปยัง ESP32
 * 3. เปิด Serial Monitor (115200 baud)
 * 4. Copy Serial Number ไปใช้ใน Admin Panel
 */

void setup()
{
    Serial.begin(115200);
    delay(2000);

    uint64_t chipId = ESP.getEfuseMac();

    Serial.println("\n");
    Serial.println("╔══════════════════════════════════════════════════╗");
    Serial.println("║       FallHelp - ESP32 Serial Number             ║");
    Serial.println("╠══════════════════════════════════════════════════╣");

    char serialNumber[32];
    snprintf(serialNumber, sizeof(serialNumber), "ESP32-%012llX", chipId);

    Serial.printf("║   Serial Number: %-30s║\n", serialNumber);
    Serial.println("╠══════════════════════════════════════════════════╣");
    Serial.println("║   Copy this S/N to Admin Panel                   ║");
    Serial.println("╚══════════════════════════════════════════════════╝");

    Serial.println("\n📋 ESP32 Chip Info:");
    Serial.printf("   - Chip Model: %s\n", ESP.getChipModel());
    Serial.printf("   - CPU Cores: %d\n", ESP.getChipCores());
    Serial.printf("   - Flash Size: %d MB\n", ESP.getFlashChipSize() / 1024 / 1024);
}

void loop()
{
    delay(1000);
}
