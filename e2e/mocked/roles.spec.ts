import { expect, test } from "@playwright/test";
import { ADMIN, STAFF, expectPath, signIn } from "./helpers";

test("an admin builds a plan and sees the reasoning", async ({ page }) => {
  await signIn(page, ADMIN);
  await expectPath(page, "/dashboard");
  await page.getByRole("link", { name: "Auto-fill", exact: true }).first().click();
  await page.getByRole("button", { name: "Build a plan", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Proposed assignments" })).toBeVisible();
  await expect(page.getByText(/Priya Patel had the fewest hours/)).toBeVisible();
  await expect(page.getByText("Still open (1)")).toBeVisible();
});

test("staff cannot see or open the manager planner", async ({ page }) => {
  await signIn(page, STAFF);
  await expectPath(page, "/dashboard");
  await expect(page.getByRole("link", { name: "Auto-fill", exact: true })).toHaveCount(0);

  await page.goto("/planner");
  await expectPath(page, "/dashboard");
});
