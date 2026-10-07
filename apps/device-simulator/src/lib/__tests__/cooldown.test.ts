import { describe, expect, it } from "vitest";
import { FALL_DEDUP_MS, remainingCooldownMs } from "../cooldown";

describe("remainingCooldownMs", () => {
  it("is zero when no fall was sent", () => {
    expect(remainingCooldownMs(null, 1_000)).toBe(0);
  });
  it("counts down from the backend de-dup window", () => {
    expect(remainingCooldownMs(1_000, 1_000)).toBe(FALL_DEDUP_MS);
    expect(remainingCooldownMs(1_000, 11_000)).toBe(FALL_DEDUP_MS - 10_000);
  });
  it("never goes negative", () => {
    expect(remainingCooldownMs(1_000, 1_000 + FALL_DEDUP_MS + 5)).toBe(0);
  });
});
