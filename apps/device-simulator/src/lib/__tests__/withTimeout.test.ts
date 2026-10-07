import { describe, expect, it } from "vitest";
import { withTimeout } from "../withTimeout";

describe("withTimeout", () => {
  it("resolves when the promise settles in time", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 50, "late")).resolves.toBe("ok");
  });
  it("rejects with the message when the promise is too slow", async () => {
    const never = new Promise<void>(() => undefined);
    await expect(withTimeout(never, 10, "Publish timed out")).rejects.toThrow("Publish timed out");
  });
  it("passes through the original rejection", async () => {
    await expect(withTimeout(Promise.reject(new Error("boom")), 50, "late")).rejects.toThrow(
      "boom"
    );
  });
});
