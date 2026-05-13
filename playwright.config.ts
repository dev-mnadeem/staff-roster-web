import { defineConfig } from "@playwright/test";

/**
 * Two ways to run the browser tests:
 *
 * - Default: against `e2e/mock-api`, started here alongside `next start`.
 *   Build first with NEXT_PUBLIC_BACKEND_ENDPOINT=http://127.0.0.1:4010/api,
 *   because that URL is baked into the client bundle.
 * - E2E_BASE_URL set: against an app you already run with the real API and
 *   a disposable seed database. Only `e2e/live` runs, and only with
 *   E2E_PASSWORD set.
 */
const liveBaseUrl = process.env.E2E_BASE_URL;
const mockPort = 4010;
const appPort = 3200;

export default defineConfig({
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"]],
  use: {
    baseURL: liveBaseUrl ?? `http://127.0.0.1:${appPort}`,
    browserName: "chromium",
  },
  projects: liveBaseUrl
    ? [{ name: "live", testDir: "./e2e/live" }]
    : [{ name: "mocked", testDir: "./e2e/mocked" }],
  webServer: liveBaseUrl
    ? undefined
    : [
        {
          command: `node e2e/mock-api/server.mjs`,
          url: `http://127.0.0.1:${mockPort}/api/locations`,
          env: { MOCK_API_PORT: String(mockPort) },
          // Answers 401 without a token, which Playwright counts as ready.
          reuseExistingServer: true,
        },
        {
          command: `npx next start -p ${appPort} -H 127.0.0.1`,
          url: `http://127.0.0.1:${appPort}/login`,
          reuseExistingServer: true,
          timeout: 60_000,
        },
      ],
});
