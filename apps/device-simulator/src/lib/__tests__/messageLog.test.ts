import { describe, expect, it } from "vitest";
import { appendLog, type LogEntry } from "../messageLog";
import { buildStatus } from "../payloads";

const entry = (id: number): LogEntry => ({
  id,
  at: id,
  topic: "device/ESP32-DE5000000001/status",
  payload: buildStatus(true, id),
  status: "sent",
});

describe("appendLog", () => {
  it("prepends the newest entry", () => {
    const result = appendLog([entry(1)], entry(2));
    expect(result.map((e) => e.id)).toEqual([2, 1]);
  });
  it("drops the oldest entries beyond max", () => {
    const result = appendLog([entry(2), entry(1)], entry(3), 2);
    expect(result.map((e) => e.id)).toEqual([3, 2]);
  });
  it("does not mutate the input", () => {
    const input = [entry(1)];
    appendLog(input, entry(2));
    expect(input).toHaveLength(1);
  });
});
