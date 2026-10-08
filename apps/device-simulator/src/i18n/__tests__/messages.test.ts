import { describe, expect, it } from "vitest";
import { MESSAGES, initialLang } from "../messages";

/** Flattens nested message keys, e.g. "fall.phases.idle.title". */
const keysOf = (value: unknown, prefix = ""): string[] =>
  typeof value === "object" && value !== null
    ? Object.entries(value).flatMap(([key, child]) => keysOf(child, `${prefix}${key}.`))
    : [prefix.slice(0, -1)];

const leaves = (value: unknown): unknown[] =>
  typeof value === "object" && value !== null ? Object.values(value).flatMap(leaves) : [value];

describe("MESSAGES", () => {
  it("has the same keys in Thai and English", () => {
    expect(keysOf(MESSAGES.th).sort()).toEqual(keysOf(MESSAGES.en).sort());
  });

  it("has no empty strings", () => {
    for (const lang of [MESSAGES.th, MESSAGES.en]) {
      for (const leaf of leaves(lang)) {
        if (typeof leaf === "string") expect(leaf.trim()).not.toBe("");
      }
    }
  });

  it("formats numbers into dynamic messages", () => {
    expect(MESSAGES.th.heart.rising(125)).toContain("125");
    expect(MESSAGES.en.log.heartRate(78)).toBe("heart rate · 78 BPM");
  });
});

describe("initialLang", () => {
  it("defaults to Thai", () => {
    expect(initialLang(null)).toBe("th");
    expect(initialLang("fr")).toBe("th");
  });

  it("uses the saved choice", () => {
    expect(initialLang("en")).toBe("en");
    expect(initialLang("th")).toBe("th");
  });
});
