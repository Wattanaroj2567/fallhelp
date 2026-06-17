/**
 * @file FallDetectionConfig.ino
 * @brief ค่า threshold สำหรับรอบทดลองของ firmware จูนเซนเซอร์
 *
 * หน้าที่หลัก:
 * - รวมค่า impact / stabilization window / posture delta ที่ใช้ในรอบเก็บข้อมูล
 * - ส่งค่าให้ state machine และ lab payload ใช้จากแหล่งเดียวกัน
 *
 * วิธีปรับค่า:
 * - แก้ค่าคงที่ในไฟล์นี้
 * - อัปโหลด firmware ใหม่
 * - เก็บข้อมูลผ่าน Fall Detection Sensor Lab
 * - บันทึกค่า threshold ของรอบนั้นไว้ใน session notes/CSV export
 */

#include "types.h"

void sensorLogf(uint16_t category, const char *fmt, ...);

// ============================================================================
// [1] ค่า threshold ของรอบทดลองปัจจุบัน
// ============================================================================

#define FALLHELP_IMPACT_THRESHOLD_G 2.0f
#define FALLHELP_STABILIZATION_WINDOW_MS 1500UL
#define FALLHELP_POSTURE_DELTA_THRESHOLD_DEG 45.0f

// ============================================================================
// [2] สถานะ threshold ที่ state machine ใช้งานอยู่
// ============================================================================

float activeAccelThreshold = FALLHELP_IMPACT_THRESHOLD_G;
unsigned long activeDurationThreshold = FALLHELP_STABILIZATION_WINDOW_MS;
float activePostureThreshold = FALLHELP_POSTURE_DELTA_THRESHOLD_DEG;

// ============================================================================
// [3] Initialization
// ============================================================================

void initFallDetectionConfig()
{
  activeAccelThreshold = FALLHELP_IMPACT_THRESHOLD_G;
  activeDurationThreshold = FALLHELP_STABILIZATION_WINDOW_MS;
  activePostureThreshold = FALLHELP_POSTURE_DELTA_THRESHOLD_DEG;

  sensorLogf(SENSOR_LOG_SYSTEM, "FallDetectionConfig initialized");
  sensorLogf(SENSOR_LOG_SYSTEM,
             "Trial thresholds: impact=%.2fg stabilize=%lums posture=%.0fdeg",
             activeAccelThreshold, activeDurationThreshold, activePostureThreshold);
}

// ============================================================================
// [4] Shared Getters
// ============================================================================

float getAccelThreshold() { return activeAccelThreshold; }

unsigned long getDurationThreshold() { return activeDurationThreshold; }

float getPostureThreshold() { return activePostureThreshold; }
