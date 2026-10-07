import { describe, expect, it } from "vitest";
import fixtures from "../../contract/fixtures.json";
import {
  DEFAULT_SERIAL,
  buildFallCancelled,
  buildFallConfirmed,
  buildHeartRate,
  buildStatus,
  buildSuspectedFall,
  clampHeartRate,
  deviceTopics,
  isValidSerial,
  serialWarning,
} from "../payloads";

describe("contract fixtures", () => {
  it("builders produce exactly the shared fixtures", () => {
    expect(buildStatus(true, fixtures.now)).toEqual(fixtures.statusOnline);
    expect(buildStatus(false, fixtures.now)).toEqual(fixtures.statusOffline);
    expect(buildHeartRate(fixtures.bpm, fixtures.now)).toEqual(fixtures.heartRate);
    expect(buildSuspectedFall(fixtures.bpm, fixtures.now)).toEqual(fixtures.suspectedFall);
    expect(buildFallConfirmed(fixtures.bpm, fixtures.now)).toEqual(fixtures.fallConfirmed);
    expect(buildFallCancelled(fixtures.now)).toEqual(fixtures.fallCancelled);
  });
});

describe("topics", () => {
  it("builds device topics", () => {
    expect(deviceTopics.status(DEFAULT_SERIAL)).toBe("device/ESP32-DE5000000001/status");
    expect(deviceTopics.heartRate(DEFAULT_SERIAL)).toBe("device/ESP32-DE5000000001/heartrate");
    expect(deviceTopics.event(DEFAULT_SERIAL)).toBe("device/ESP32-DE5000000001/event");
  });
});

describe("isValidSerial", () => {
  it("accepts the demo serial", () => {
    expect(isValidSerial(DEFAULT_SERIAL)).toBe(true);
  });
  it.each([
    "",
    "ESP32-de5000000001",
    "ESP32-DE500000000",
    "ESP32-DE50000000012",
    "ESP32 DE5000000001",
    "ESP32-DE500000000G",
  ])("rejects %j", (serial) => {
    expect(isValidSerial(serial)).toBe(false);
  });
});

describe("serialWarning", () => {
  it("is null for the seeded demo serial", () => {
    expect(serialWarning(DEFAULT_SERIAL)).toBeNull();
  });
  it("warns for another well-formed serial", () => {
    expect(serialWarning("ESP32-DE5000000002")).toMatch(/not the seeded demo device/);
  });
  it("is null for a malformed serial (format error is shown instead)", () => {
    expect(serialWarning("ESP32-x")).toBeNull();
  });
});

describe("clampHeartRate", () => {
  it("clamps and rounds into 0..180", () => {
    expect(clampHeartRate(200)).toBe(180);
    expect(clampHeartRate(-5)).toBe(0);
    expect(clampHeartRate(72.6)).toBe(73);
  });
});

describe("fall builders", () => {
  it("keep a null bpm", () => {
    expect(buildSuspectedFall(null, 1).bpm).toBeNull();
    expect(buildFallConfirmed(null, 1).bpm).toBeNull();
  });
  it("clamp an out-of-range bpm", () => {
    expect(buildSuspectedFall(250, 1).bpm).toBe(180);
  });
});
