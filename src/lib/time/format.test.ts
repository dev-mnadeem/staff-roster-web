import { describe, expect, it } from "vitest";
import { formatInLocationTz, localInputToUtcIso } from "@/lib/time/format";

describe("localInputToUtcIso", () => {
  it("reads the input as wall-clock time at the location", () => {
    expect(localInputToUtcIso("2026-05-01T17:00", "America/Los_Angeles")).toBe(
      "2026-05-02T00:00:00.000Z",
    );
    expect(localInputToUtcIso("2026-05-01T17:00", "America/New_York")).toBe(
      "2026-05-01T21:00:00.000Z",
    );
  });

  it("follows daylight saving rather than a fixed offset", () => {
    expect(localInputToUtcIso("2026-01-15T09:00", "America/New_York")).toBe(
      "2026-01-15T14:00:00.000Z",
    );
  });
});

describe("formatInLocationTz", () => {
  it("shows the same instant in each site's own zone", () => {
    const instant = "2026-05-02T00:00:00.000Z";
    expect(formatInLocationTz(instant, "America/Los_Angeles", "HH:mm")).toBe("17:00");
    expect(formatInLocationTz(instant, "America/New_York", "HH:mm")).toBe("20:00");
  });
});
