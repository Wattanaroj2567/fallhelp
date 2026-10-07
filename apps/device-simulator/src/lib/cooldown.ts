/**
 * คำนวณเวลาที่เหลือก่อนส่ง fall ซ้ำได้
 * - backend ตัด fall ซ้ำของอุปกรณ์เดียวกันภายใน 30 วินาที (fallHandler de-dup)
 * - simulator จึงปิดปุ่ม Fall ระหว่างนี้เพื่อไม่ให้ผู้นำเสนอสับสน
 */
export const FALL_DEDUP_MS = 30_000;

export const remainingCooldownMs = (
  lastFallAt: number | null,
  now: number,
  windowMs: number = FALL_DEDUP_MS
): number => {
  if (lastFallAt === null) return 0;
  return Math.max(0, windowMs - (now - lastFallAt));
};
