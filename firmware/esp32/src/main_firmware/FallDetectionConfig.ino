/**
 * @file FallDetectionConfig.ino
 * @brief FallDetectionConfig: จุดรวมค่า threshold ของ fall detection ใน Prototype firmware
 *
 * หน้าที่หลัก:
 * - เก็บค่า threshold หลักของ impact / stabilization window / posture delta
 * - เก็บ cancel window ของ fall lifecycle ที่ใช้ร่วมกับปุ่ม GPIO27
 *
 * หมายเหตุ:
 * - ค่า threshold เป็น compile-time baseline ของ Prototype firmware
 * - หากต้องปรับค่า ให้ปรับจากรอบ sensor_tuning ที่มี log/CSV รองรับก่อน
 */

#include "types.h"

void sensorLogf(uint16_t category, const char *fmt, ...);

// ============================================================================
// [1] ค่า threshold ตั้งต้นของ Prototype firmware
// ============================================================================

#define FALLHELP_IMPACT_THRESHOLD_G 2.0f
#define FALLHELP_STABILIZATION_WINDOW_MS 1500UL
#define FALLHELP_POSTURE_DELTA_THRESHOLD_DEG 45.0f
#define FALLHELP_FALL_CANCEL_TIMEOUT_MS 15000UL

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
             "Prototype thresholds: impact=%.2fg stabilize=%lums posture=%.0fdeg",
             activeAccelThreshold, activeDurationThreshold, activePostureThreshold);
}

// ============================================================================
// [4] Shared Getters
// ============================================================================

float getAccelThreshold() { return activeAccelThreshold; }

unsigned long getDurationThreshold() { return activeDurationThreshold; }

float getPostureThreshold() { return activePostureThreshold; }

unsigned long getFallCancelTimeoutMs() { return FALLHELP_FALL_CANCEL_TIMEOUT_MS; }
