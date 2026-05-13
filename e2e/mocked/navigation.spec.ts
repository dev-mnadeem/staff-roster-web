import { expect, test } from "@playwright/test";
import { ADMIN, expectPath, signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signIn(page, ADMIN);
  await expectPath(page, "/dashboard");
});

test("only the open-shifts link is current on /swaps/open", async ({ page }) => {
  await page.goto("/swaps/open");
  const nav = page.getByRole("navigation", { name: "Main" }).first();
  await expect(nav.getByRole("link", { name: "Open shifts" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Swaps & drops" })).not.toHaveAttribute("aria-current", "page");
});

test("the location filter narrows the shift list", async ({ page }) => {
  await page.goto("/shifts");
  await expect(page.getByText(/Coastal Eats — Boston ·/).first()).toBeVisible();

  await page.getByLabel("Location").selectOption({ label: "Coastal Eats — Brooklyn (America/New_York)" });
  await expect(page.getByText(/Coastal Eats — Boston ·/)).toHaveCount(0);
  await expect(page.getByText(/Coastal Eats — Brooklyn ·/)).toHaveCount(2);
});

test("on-duty shows who is working at each site now", async ({ page }) => {
  await page.goto("/on-duty");
  await expect(page.getByText("Sarah Chen")).toBeVisible();
  await expect(page.getByText(/No one assigned/)).toBeVisible();
});
