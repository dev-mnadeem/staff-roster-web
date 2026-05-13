import { test, expect } from '@playwright/test';

const password = process.env.E2E_PASSWORD;

test.beforeEach(() => {
  test.skip(!password, 'Set E2E_PASSWORD for the disposable seeded API.');
});

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email', {exact:true}).fill(email);
  await page.getByLabel('Password', {exact:true}).fill(password!);
  await page.getByRole('button', {name:'Sign in', exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test('admin can compute a plan', async ({page}) => {
  await login(page, 'admin@coastaleats.test');
  await page.getByRole('link', {name:'Auto-fill', exact:true}).click();
  await page.getByRole('button', {name:'Build a plan', exact:true}).click();
  await expect(page.getByText('Proposed assignments', {exact:true})).toBeVisible();
});

test('staff cannot open the manager planner', async ({page}) => {
  await login(page, 'sarah@coastaleats.test');
  await expect(page.getByRole('link', {name:'Auto-fill', exact:true})).toHaveCount(0);
  await page.goto('/planner');
  await expect(page).not.toHaveURL(/\/planner$/);
});
