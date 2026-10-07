/**
 * ตัวสร้าง topic และ payload MQTT ของอุปกรณ์จำลอง
 * - รูปแบบต้องตรงกับ handler ฝั่ง backend (apps/backend-api/src/iot)
 * - ถูกตรวจทั้งสองฝั่งด้วย src/contract/fixtures.json (ห้ามแก้ค่าคงที่โดยไม่อัปเดต fixture)
 * - type ของ event ใช้ "fall" / "fall_cancelled" เพราะ backend แปลงเป็นตัวพิมพ์เล็กก่อนเทียบ
 */
export const DEFAULT_SERIAL = "ESP32-DE5000000001";
export const SERIAL_PATTERN = /^ESP32-[0-9A-F]{12}$/;
export const HEART_RATE_MIN = 0;
export const HEART_RATE_MAX = 180;

const DEMO_SIGNAL_STRENGTH = -55;
const DEMO_WIFI_SSID = "FallHelp-Demo";
const DEMO_FALL_MAGNITUDE = 3.4;
const DEMO_FALL_POSTURE_DELTA = 82;

export interface StatusPayload {
  timestamp: number;
  online: boolean;
  signalStrength: number;
  wifiSSID: string;
}

export interface HeartRatePayload {
  timestamp: number;
  heartRate: number;
  confidence: "high";
}

export interface FallEventPayload {
  type: "fall";
  timestamp: number;
  magnitude: number;
  postureDelta: number;
  bpm: number | null;
}

export interface FallCancelledPayload {
  type: "fall_cancelled";
  timestamp: number;
}

export type DevicePayload =
  | StatusPayload
  | HeartRatePayload
  | FallEventPayload
  | FallCancelledPayload;

export const deviceTopics = {
  status: (serial: string): string => `device/${serial}/status`,
  heartRate: (serial: string): string => `device/${serial}/heartrate`,
  event: (serial: string): string => `device/${serial}/event`,
} as const;

export const isValidSerial = (serial: string): boolean => SERIAL_PATTERN.test(serial);

export const clampHeartRate = (bpm: number): number =>
  Math.min(HEART_RATE_MAX, Math.max(HEART_RATE_MIN, Math.round(bpm)));

export const buildStatus = (online: boolean, now: number): StatusPayload => ({
  timestamp: now,
  online,
  signalStrength: DEMO_SIGNAL_STRENGTH,
  wifiSSID: DEMO_WIFI_SSID,
});

export const buildHeartRate = (bpm: number, now: number): HeartRatePayload => ({
  timestamp: now,
  heartRate: clampHeartRate(bpm),
  confidence: "high",
});

export const buildFall = (bpm: number | null, now: number): FallEventPayload => ({
  type: "fall",
  timestamp: now,
  magnitude: DEMO_FALL_MAGNITUDE,
  postureDelta: DEMO_FALL_POSTURE_DELTA,
  bpm: bpm === null ? null : clampHeartRate(bpm),
});

export const buildFallCancelled = (now: number): FallCancelledPayload => ({
  type: "fall_cancelled",
  timestamp: now,
});
