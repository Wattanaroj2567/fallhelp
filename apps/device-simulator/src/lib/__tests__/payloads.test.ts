import { describe, expect, it } from "vitest";
import fixtures from "../../contract/fixtures.json";
import {
  DEFAULT_SERIAL,
  buildFall,
  buildFallCancelled,
  buildHeartRate,
  buildStatus,
  clampHeartRate,
  deviceTopics,
  isValidSerial,
} from "../payloads";

describe("contract fixtures", () => {
  it("builders produce exactly the shared fixtures", () => {
    expect(buildStatus(true, fixtures.now)).toEqual(fixtures.statusOnline);
    expect(buildStatus(false, fixtures.now)).toEqual(fixtures.statusOffline);
    expect(buildHeartRate(fixtures.bpm, fixtures.now)).toEqual(fixtures.heartRate);
    expect(buildFall(fixtures.bpm, fixtures.now)).toEqual(fixtures.fall);
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

describe("clampHeartRate", () => {
  it("clamps and rounds into 0..180", () => {
    expect(clampHeartRate(200)).toBe(180);
    expect(clampHeartRate(-5)).toBe(0);
    expect(clampHeartRate(72.6)).toBe(73);
  });
});

describe("buildFall", () => {
  it("keeps a null bpm", () => {
    expect(buildFall(null, 1).bpm).toBeNull();
  });
  it("clamps an out-of-range bpm", () => {
    expect(buildFall(250, 1).bpm).toBe(180);
  });
});
