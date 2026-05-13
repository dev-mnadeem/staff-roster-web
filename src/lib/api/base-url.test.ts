import { afterEach, describe, expect, it, vi } from "vitest";
import { serverApiBaseUrl, toServerApiUrl } from "@/lib/api/base-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("toServerApiUrl", () => {
  it("leaves the URL alone when no internal address is set", () => {
    vi.stubEnv("API_BASE_URL_INTERNAL", "");
    expect(toServerApiUrl("http://localhost:4000/api/shifts?x=1")).toBe(
      "http://localhost:4000/api/shifts?x=1",
    );
  });

  it("swaps only the origin for the server-side address", () => {
    vi.stubEnv("API_BASE_URL_INTERNAL", "http://api:4000/api");
    expect(toServerApiUrl("http://localhost:4000/api/shifts?x=1")).toBe(
      "http://api:4000/api/shifts?x=1",
    );
  });
});

describe("serverApiBaseUrl", () => {
  it("prefers the internal address over the browser one", () => {
    vi.stubEnv("API_BASE_URL_INTERNAL", "http://api:4000/api");
    vi.stubEnv("NEXT_PUBLIC_BACKEND_ENDPOINT", "http://localhost:4000/api");
    expect(serverApiBaseUrl()).toBe("http://api:4000/api");
  });

  it("treats an empty internal address as unset", () => {
    vi.stubEnv("API_BASE_URL_INTERNAL", "");
    vi.stubEnv("NEXT_PUBLIC_BACKEND_ENDPOINT", "http://localhost:4000/api");
    expect(serverApiBaseUrl()).toBe("http://localhost:4000/api");
  });
});
