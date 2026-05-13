import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/shared/redirect";

describe("safeNextPath", () => {
  it("keeps a same-site path with its query", () => {
    expect(safeNextPath("/shifts/42?tab=history")).toBe("/shifts/42?tab=history");
  });

  it.each([
    ["absolute URL", "https://evil.example/dashboard"],
    ["protocol-relative URL", "//evil.example"],
    ["backslash trick", "/\\evil.example"],
    ["relative path", "dashboard"],
    ["javascript: URL", "javascript:alert(1)"],
    ["embedded newline", "/dashboard\nLocation: https://evil.example"],
    ["empty string", ""],
  ])("falls back on an %s", (_, value) => {
    expect(safeNextPath(value)).toBe("/dashboard");
  });

  it("falls back when the value is missing or not a string", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
    expect(safeNextPath(new File([], "x"))).toBe("/dashboard");
  });

  it("uses the caller's fallback", () => {
    expect(safeNextPath("//x", "/login")).toBe("/login");
  });
});
