import { expect, test } from "@playwright/test";
import { ADMIN, expectPath, signIn } from "./helpers";

test("a signed-out visit to the planner returns there after sign-in", async ({ page }) => {
  await page.goto("/planner");
  await expect(page).toHaveURL(/\/login\?next=%2Fplanner$/);

  await page.getByLabel("Email", { exact: true }).fill(ADMIN);
  await page.getByLabel("Password", { exact: true }).fill("any-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expectPath(page, "/planner");
});

test("an off-site ?next= is ignored after sign-in", async ({ page }) => {
  await signIn(page, ADMIN, "/login?next=https://evil.example/");
  await expectPath(page, "/dashboard");
});

test("an unknown account sees the API's error", async ({ page }) => {
  await signIn(page, "nobody@coastaleats.test");
  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expectPath(page, "/login");
});

test("signing out returns to the login page", async ({ page }) => {
  await signIn(page, ADMIN);
  await expectPath(page, "/dashboard");
  await page.getByRole("banner").getByRole("button", { name: "Sign out" }).click();
  await expectPath(page, "/login");
});
