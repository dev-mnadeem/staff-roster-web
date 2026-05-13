import { expect, type Page } from "@playwright/test";

/** Any password signs in a known address on the mock API. */
export async function signIn(page: Page, email: string, path = "/login") {
  await page.goto(path);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("any-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

export const ADMIN = "admin@coastaleats.test";
export const STAFF = "sarah@coastaleats.test";

export async function expectPath(page: Page, path: string) {
  await expect(page).toHaveURL((url) => url.pathname === path);
}
