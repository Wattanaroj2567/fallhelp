import { describe, expect, it } from "vitest";
import { describeFallPhase } from "../fallPhase";
import { CANCEL_WINDOW_MS } from "../fallSequence";

const base = { suspectedAt: null, blockedUntil: null, blockStartedAt: null, lastOutcome: null };

describe("describeFallPhase", () => {
  it("is idle when nothing happened", () => {
    expect(describeFallPhase({ ...base, now: 1_000 })).toEqual({
      kind: "idle",
      remainingMs: 0,
      totalMs: 0,
    });
  });

  it("counts down the device cancel window after a suspected fall", () => {
    expect(describeFallPhase({ ...base, suspectedAt: 1_000, now: 6_000 })).toEqual({
      kind: "suspected",
      remainingMs: CANCEL_WINDOW_MS - 5_000,
      totalMs: CANCEL_WINDOW_MS,
    });
  });

  it("shows the outcome while the backend de-dup block is active", () => {
    const phase = { ...base, blockStartedAt: 10_000, blockedUntil: 40_000, now: 25_000 };
    expect(describeFallPhase({ ...phase, lastOutcome: "confirmed" })).toEqual({
      kind: "confirmed",
      remainingMs: 15_000,
      totalMs: 30_000,
    });
    expect(describeFallPhase({ ...phase, lastOutcome: "cancelled" }).kind).toBe("cancelled");
  });

  it("returns to idle once the block has expired", () => {
    const phase = {
      ...base,
      blockStartedAt: 10_000,
      blockedUntil: 40_000,
      lastOutcome: "confirmed" as const,
    };
    expect(describeFallPhase({ ...phase, now: 40_000 }).kind).toBe("idle");
  });
});
