/**
 * heartRate.ts
 *
 * ค่าเกณฑ์ชีพจรกลางสำหรับ mobile app
 *
 * สิ่งที่เกิดขึ้นในไฟล์นี้:
 * - กำหนด threshold ของชีพจรสูงและต่ำ
 * - แปลงค่า BPM เป็น label และสีที่ใช้แสดงใน UI
 * - ใช้ร่วมกันระหว่าง history และหน้าที่แสดงสถานะชีพจร
 * - กรอง spike ของค่า realtime: ข้ามค่าที่กระโดดเกิน 50 BPM ครั้งเดียว แต่ยอมรับเมื่อค่าถัดไปยืนยัน
 */

export const HR_HIGH_THRESHOLD = 100;
export const HR_LOW_THRESHOLD = 60;
export const HR_SPIKE_THRESHOLD = 50;

export interface HrStatusStyle {
  label: string;
  color: string;
  bg: string;
}

export function getHrStatus(bpm: number): HrStatusStyle {
  // BPM สูงกว่าเกณฑ์ แสดงเป็นสถานะสูงกว่าปกติ
  if (bpm > HR_HIGH_THRESHOLD) return { label: 'สูงกว่าปกติ', color: '#EF4444', bg: '#FEF2F2' };

  // BPM ต่ำกว่าเกณฑ์ แสดงเป็นสถานะต่ำกว่าปกติ
  if (bpm < HR_LOW_THRESHOLD) return { label: 'ต่ำกว่าปกติ', color: '#3B82F6', bg: '#EFF6FF' };

  return { label: 'ปกติ', color: '#065F46', bg: '#D1FAE5' };
}

export interface HeartRateSpikeDecision {
  accept: boolean;
  pending: number | null;
}

/**
 * ตัดสินว่าจะแสดงค่า BPM ใหม่หรือไม่
 * - ค่ากระโดดเกิน threshold ครั้งเดียว = spike ข้ามไปก่อนและจำไว้ใน pending
 * - ค่าถัดไปใกล้กับ pending = ชีพจรเปลี่ยนจริง ยอมรับ (ไม่งั้นจะค้างค่าเดิมตลอด)
 */
export function filterHeartRateSpike(
  current: number | null,
  pending: number | null,
  next: number,
): HeartRateSpikeDecision {
  const isNear = (a: number, b: number) => Math.abs(a - b) <= HR_SPIKE_THRESHOLD;

  if (current === null || current === 0 || isNear(next, current)) {
    return { accept: true, pending: null };
  }

  if (pending !== null && isNear(next, pending)) {
    return { accept: true, pending: null };
  }

  return { accept: false, pending: next };
}
