import { describe, expect, it } from "vitest";
import { describeConnection } from "../connectionStatus";

describe("describeConnection", () => {
  it("is green when connected", () => {
    expect(describeConnection("connected")).toEqual({ label: "Connected", tone: "ok" });
  });
  it("shows amber only for the first attempt", () => {
    expect(describeConnection("connecting").tone).toBe("pending");
  });
  it.each(["reconnecting", "offline"] as const)("%s reads as disconnected", (state) => {
    expect(describeConnection(state)).toEqual({ label: "Disconnected – retrying", tone: "error" });
  });
  it("error is red", () => {
    expect(describeConnection("error").tone).toBe("error");
  });
});
