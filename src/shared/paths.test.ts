import { describe, expect, it } from "vitest";
import { isWithin } from "@/shared/paths";

describe("isWithin", () => {
  it("matches the route itself and pages beneath it", () => {
    expect(isWithin("/team", "/team")).toBe(true);
    expect(isWithin("/team/7", "/team")).toBe(true);
  });

  it("does not match a sibling that only shares a prefix", () => {
    expect(isWithin("/teams", "/team")).toBe(false);
    expect(isWithin("/plannerx", "/planner")).toBe(false);
  });
});
