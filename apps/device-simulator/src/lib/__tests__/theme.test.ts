import { describe, expect, it } from "vitest";
import { initialTheme, toggleTheme } from "../theme";

describe("initialTheme", () => {
  it("uses the saved choice first", () => {
    expect(initialTheme("dark", false)).toBe("dark");
    expect(initialTheme("light", true)).toBe("light");
  });

  it("falls back to the system preference", () => {
    expect(initialTheme(null, true)).toBe("dark");
    expect(initialTheme(null, false)).toBe("light");
  });

  it("ignores unknown saved values", () => {
    expect(initialTheme("purple", true)).toBe("dark");
  });
});

describe("toggleTheme", () => {
  it("switches between light and dark", () => {
    expect(toggleTheme("light")).toBe("dark");
    expect(toggleTheme("dark")).toBe("light");
  });
});
