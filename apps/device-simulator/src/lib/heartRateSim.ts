/**
 * จำลองชีพจรให้สมจริงสำหรับ demo (เรียกทุก 5 วินาที)
 * - ค่าขยับรอบค่าฐาน (ต่ำ/ปกติ/สูง ตาม HEART_RATE_PRESETS) แบบสุ่มทีละน้อย ไม่ออกนอกช่วง ±HR_BAND_BPM
 * - เปลี่ยนต่อรอบไม่เกิน HR_MAX_STEP_BPM: เปลี่ยนโหมดแล้วค่อยๆ ไต่ขึ้น/ลง ไม่กระโดด
 *   (และไม่ชนตัวกรอง spike 50 BPM ของแอป)
 * - หลังล้ม (startFallBoost) ชีพจรค่อยๆ สูงขึ้นแล้วกลับสู่ค่าฐานภายในประมาณ 2 นาที
 * - รับฟังก์ชันสุ่มเข้ามาได้ เพื่อให้ test ซ้ำได้
 */

export const SIM_BPM_MIN = 40;
export const SIM_BPM_MAX = 180;
export const HR_BAND_BPM = 8;
export const HR_MAX_STEP_BPM = 6;
export const HR_RANDOM_STEP_BPM = 3;
export const FALL_BOOST_BPM = 25;

/** Resting targets; low/high fall outside the app's normal 60-100 BPM range. */
export const HEART_RATE_PRESETS = { low: 50, normal: 75, high: 125 } as const;
export type HeartRateMode = keyof typeof HEART_RATE_PRESETS;

const REVERSION = 0.5;
const BOOST_DECAY = 0.85;

export interface HeartRateSimState {
  bpm: number;
  /** Extra BPM on top of the baseline after a fall; decays every tick. */
  boost: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const initialHeartRate = (baseline: number): HeartRateSimState => ({
  bpm: clamp(Math.round(baseline), SIM_BPM_MIN, SIM_BPM_MAX),
  boost: 0,
});

export const startFallBoost = (state: HeartRateSimState): HeartRateSimState => ({
  ...state,
  boost: FALL_BOOST_BPM,
});

export function nextHeartRate(
  state: HeartRateSimState,
  baseline: number,
  random: () => number = Math.random
): HeartRateSimState {
  const target = baseline + state.boost;
  const noise = Math.round((random() * 2 - 1) * HR_RANDOM_STEP_BPM);
  const proposed = state.bpm + (target - state.bpm) * REVERSION + noise;

  const inBand = clamp(proposed, target - HR_BAND_BPM, target + HR_BAND_BPM);
  const limited = clamp(inBand, state.bpm - HR_MAX_STEP_BPM, state.bpm + HR_MAX_STEP_BPM);
  const decayed = state.boost * BOOST_DECAY;

  return {
    bpm: clamp(Math.round(limited), SIM_BPM_MIN, SIM_BPM_MAX),
    boost: decayed < 1 ? 0 : decayed,
  };
}
