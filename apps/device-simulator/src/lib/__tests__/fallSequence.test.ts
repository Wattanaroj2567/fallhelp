import { describe, expect, it } from "vitest";
import {
  CANCEL_WINDOW_MS,
  CONFIRMED_DEDUP_MS,
  SUSPECTED_DEDUP_MS,
  blockedUntilAfter,
  cancelWindowRemainingMs,
} from "../fallSequence";

describe("cancelWindowRemainingMs", () => {
  it("is the full device cancel window right after the suspected fall", () => {
    expect(cancelWindowRemainingMs(1_000, 1_000)).toBe(CANCEL_WINDOW_MS);
  });
  it("reaches zero when the window has elapsed", () => {
    expect(cancelWindowRemainingMs(1_000, 1_000 + CANCEL_WINDOW_MS + 1)).toBe(0);
  });
  it("is zero when no fall is pending", () => {
    expect(cancelWindowRemainingMs(null, 5_000)).toBe(0);
  });
});

describe("blockedUntilAfter", () => {
  it("after a device cancel, blocks until the suspected de-dup window ends", () => {
    expect(blockedUntilAfter("cancelled", 1_000, 6_000)).toBe(1_000 + SUSPECTED_DEDUP_MS);
  });
  it("after confirmation, blocks until the confirmed de-dup window ends", () => {
    expect(blockedUntilAfter("confirmed", 1_000, 16_000)).toBe(16_000 + CONFIRMED_DEDUP_MS);
  });
});

describe("backend timing constants", () => {
  it("match fallHandler (15 s suspected, 30 s confirmed) and the firmware cancel window", () => {
    expect(CANCEL_WINDOW_MS).toBe(15_000);
    expect(SUSPECTED_DEDUP_MS).toBe(15_000);
    expect(CONFIRMED_DEDUP_MS).toBe(30_000);
  });
});
