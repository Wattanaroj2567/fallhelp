/**
 * ลำดับการหกล้มแบบเดียวกับ firmware: suspected_fall → ช่วงยกเลิก 15 วินาที → fall_confirmed / fall_cancelled
 * - backend ยกเลิกได้เฉพาะ event ที่ยัง PENDING_CONFIRMATION (eventService.cancelFallEventByDevice)
 * - backend ตัด event ซ้ำ: suspected 15 วินาที, confirmed 30 วินาที (fallHandler de-dup)
 */
import { FALL_DEDUP_MS, remainingCooldownMs } from "./cooldown";

export const CANCEL_WINDOW_MS = 15_000;
export const SUSPECTED_DEDUP_MS = 15_000;
export const CONFIRMED_DEDUP_MS = FALL_DEDUP_MS;

export type FallOutcome = "cancelled" | "confirmed";

export const cancelWindowRemainingMs = (suspectedAt: number | null, now: number): number =>
  remainingCooldownMs(suspectedAt, now, CANCEL_WINDOW_MS);

export const blockedUntilAfter = (
  outcome: FallOutcome,
  suspectedAt: number,
  resolvedAt: number
): number =>
  outcome === "cancelled" ? suspectedAt + SUSPECTED_DEDUP_MS : resolvedAt + CONFIRMED_DEDUP_MS;
