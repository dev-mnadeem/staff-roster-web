import { expect, test, type Page } from "@playwright/test";
import { ADMIN, expectPath, signIn } from "./helpers";

// Regenerates docs/screenshots from the mock API's fictional data.
//   CAPTURE_SCREENSHOTS=1 npx playwright test screenshots
test.skip(!process.env.CAPTURE_SCREENSHOTS, "Set CAPTURE_SCREENSHOTS=1 to refresh docs/screenshots.");

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const shot = (name: string) => `docs/screenshots/${name}.png`;

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

test("desktop captures", async ({ page }) => {
  await page.setViewportSize(DESKTOP);

  await page.goto("/login");
  await settle(page);
  await page.screenshot({ path: shot("login") });

  await signIn(page, ADMIN);
  await expectPath(page, "/dashboard");
  await settle(page);
  await page.screenshot({ path: shot("dashboard") });

  for (const [path, name, ready] of [
    ["/shifts", "shifts", "Coastal Eats — Boston ·"],
    ["/on-duty", "onduty", "Sarah Chen"],
    ["/analytics", "analytics", "Omar Haddad"],
    ["/team", "team", "Yuki Tanaka"],
    ["/admin/audit", "audit", "override_grant"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByText(ready).first()).toBeVisible();
    await settle(page);
    await page.screenshot({ path: shot(name) });
  }

  await page.goto("/planner");
  await page.getByRole("button", { name: "Build a plan" }).click();
  await expect(page.getByRole("heading", { name: "Proposed assignments" })).toBeVisible();
  await settle(page);
  await page.screenshot({ path: shot("planner"), fullPage: true });
});

test("mobile planner", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await signIn(page, ADMIN);
  await expectPath(page, "/dashboard");
  await page.goto("/planner");
  await page.getByRole("button", { name: "Build a plan" }).click();
  await expect(page.getByRole("heading", { name: "Proposed assignments" })).toBeVisible();
  await settle(page);
  await page.screenshot({ path: shot("planner-mobile"), fullPage: true });
});
