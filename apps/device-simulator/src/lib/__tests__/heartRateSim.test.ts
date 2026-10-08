import { describe, expect, it } from "vitest";
import {
  FALL_BOOST_BPM,
  HEART_RATE_PRESETS,
  HR_BAND_BPM,
  HR_MAX_STEP_BPM,
  SIM_BPM_MAX,
  SIM_BPM_MIN,
  initialHeartRate,
  nextHeartRate,
  startFallBoost,
  type HeartRateSimState,
} from "../heartRateSim";

/** Deterministic pseudo-random sequence (LCG) so drift tests are repeatable. */
const seeded = (seed: number) => () => {
  seed = (seed * 1_664_525 + 1_013_904_223) % 4_294_967_296;
  return seed / 4_294_967_296;
};
const steady = () => 0.5;

const run = (state: HeartRateSimState, baseline: number, ticks: number, random = seeded(7)) => {
  const values: number[] = [];
  for (let i = 0; i < ticks; i++) {
    state = nextHeartRate(state, baseline, random);
    values.push(state.bpm);
  }
  return { state, values };
};

describe("HEART_RATE_PRESETS", () => {
  it("puts low and high outside the app's normal range (60-100 BPM)", () => {
    expect(HEART_RATE_PRESETS.low).toBeLessThan(60);
    expect(HEART_RATE_PRESETS.normal).toBeGreaterThanOrEqual(60);
    expect(HEART_RATE_PRESETS.normal).toBeLessThanOrEqual(100);
    expect(HEART_RATE_PRESETS.high).toBeGreaterThan(100);
  });
});

describe("nextHeartRate", () => {
  it("stays on the baseline when the random step is zero", () => {
    expect(nextHeartRate(initialHeartRate(75), 75, steady).bpm).toBe(75);
  });

  it("varies around the baseline but stays within the band", () => {
    const { values } = run(initialHeartRate(75), 75, 500);
    expect(new Set(values).size).toBeGreaterThan(3);
    for (const bpm of values) {
      expect(Math.abs(bpm - 75)).toBeLessThanOrEqual(HR_BAND_BPM);
    }
  });

  it("ramps gradually to a new baseline instead of jumping", () => {
    const { values } = run(
      initialHeartRate(HEART_RATE_PRESETS.normal),
      HEART_RATE_PRESETS.high,
      20
    );
    let previous: number = HEART_RATE_PRESETS.normal;
    for (const bpm of values) {
      expect(Math.abs(bpm - previous)).toBeLessThanOrEqual(HR_MAX_STEP_BPM);
      previous = bpm;
    }
    expect(values[1]).toBeLessThan(HEART_RATE_PRESETS.high - HR_BAND_BPM);
    expect(Math.abs((values.at(-1) ?? 0) - HEART_RATE_PRESETS.high)).toBeLessThanOrEqual(
      HR_BAND_BPM
    );
  });

  it("ramps down to the low preset the same way", () => {
    const { values } = run(initialHeartRate(HEART_RATE_PRESETS.normal), HEART_RATE_PRESETS.low, 20);
    expect(Math.abs((values.at(-1) ?? 0) - HEART_RATE_PRESETS.low)).toBeLessThanOrEqual(
      HR_BAND_BPM
    );
  });

  it("clamps to the simulator range", () => {
    expect(run(initialHeartRate(180), 180, 50).values.every((v) => v <= SIM_BPM_MAX)).toBe(true);
    expect(run(initialHeartRate(40), 40, 50).values.every((v) => v >= SIM_BPM_MIN)).toBe(true);
  });
});

describe("startFallBoost", () => {
  it("raises the heart rate gradually after a fall and settles back within two minutes", () => {
    const boosted = startFallBoost(initialHeartRate(75));
    expect(boosted.boost).toBe(FALL_BOOST_BPM);

    const { values, state } = run(boosted, 75, 24, steady);
    expect(values[0]).toBeLessThanOrEqual(75 + HR_MAX_STEP_BPM);
    expect(Math.max(...values)).toBeGreaterThanOrEqual(75 + 12);
    expect(state.boost).toBe(0);
    expect(Math.abs(state.bpm - 75)).toBeLessThanOrEqual(2);
  });
});
