/**
 * สถานะของลำดับการล้มสำหรับวงนับถอยหลังบน dashboard
 * - suspected: อยู่ในช่วงยกเลิก 15 วินาทีของอุปกรณ์
 * - confirmed / cancelled: ผลล่าสุด ระหว่างที่ backend ยังกันเหตุการณ์ซ้ำ (de-dup)
 * - idle: กดจำลองการล้มใหม่ได้
 */
import { CANCEL_WINDOW_MS, cancelWindowRemainingMs, type FallOutcome } from "./fallSequence";

export type FallPhaseKind = "idle" | "suspected" | FallOutcome;

export interface FallPhase {
  kind: FallPhaseKind;
  remainingMs: number;
  totalMs: number;
}

export interface FallPhaseInput {
  suspectedAt: number | null;
  blockStartedAt: number | null;
  blockedUntil: number | null;
  lastOutcome: FallOutcome | null;
  now: number;
}

export function describeFallPhase(input: FallPhaseInput): FallPhase {
  const { suspectedAt, blockStartedAt, blockedUntil, lastOutcome, now } = input;

  if (suspectedAt !== null) {
    return {
      kind: "suspected",
      remainingMs: cancelWindowRemainingMs(suspectedAt, now),
      totalMs: CANCEL_WINDOW_MS,
    };
  }

  if (blockedUntil !== null && blockedUntil > now && lastOutcome !== null) {
    return {
      kind: lastOutcome,
      remainingMs: blockedUntil - now,
      totalMs: blockedUntil - (blockStartedAt ?? now),
    };
  }

  return { kind: "idle", remainingMs: 0, totalMs: 0 };
}
