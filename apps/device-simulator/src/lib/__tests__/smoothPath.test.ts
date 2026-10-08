import { describe, expect, it } from "vitest";
import { smoothPath } from "../smoothPath";

describe("smoothPath", () => {
  it("returns an empty path for fewer than two points", () => {
    expect(smoothPath([])).toBe("");
    expect(smoothPath([{ x: 0, y: 0 }])).toBe("");
  });

  it("starts at the first point and ends at the last one", () => {
    const path = smoothPath([
      { x: 0, y: 10 },
      { x: 10, y: 20 },
      { x: 20, y: 5 },
    ]);
    expect(path.startsWith("M0,10")).toBe(true);
    expect(path.endsWith("20,5")).toBe(true);
  });

  it("uses one cubic curve per segment", () => {
    const path = smoothPath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
      { x: 30, y: 10 },
    ]);
    expect(path.match(/C/g)).toHaveLength(3);
  });

  it("keeps a straight line straight", () => {
    const path = smoothPath([
      { x: 0, y: 5 },
      { x: 10, y: 5 },
      { x: 20, y: 5 },
    ]);
    const ys = [...path.matchAll(/,(-?[\d.]+)/g)].map((m) => Number(m[1]));
    expect(ys.length).toBeGreaterThan(0);
    expect(ys.every((y) => y === 5)).toBe(true);
  });
});
