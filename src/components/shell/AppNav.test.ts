import { describe, expect, it } from "vitest";
import { activeNavHref } from "@/components/shell/AppNav";

describe("activeNavHref", () => {
  it("picks the deepest link that contains the path", () => {
    expect(activeNavHref("/swaps/open")).toBe("/swaps/open");
    expect(activeNavHref("/swaps")).toBe("/swaps");
  });

  it("keeps a section lit on its detail pages", () => {
    expect(activeNavHref("/shifts/abc")).toBe("/shifts");
    expect(activeNavHref("/admin/audit")).toBe("/admin/audit");
  });

  it("lights nothing for a path outside the nav", () => {
    expect(activeNavHref("/login")).toBeUndefined();
  });
});
