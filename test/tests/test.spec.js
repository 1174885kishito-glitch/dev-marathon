import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).click();
  await page.getByRole('textbox', { name: 'What needs to be done?' }).click();
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('TEST1');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('TEST2');
  await page.locator('html').click();
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.locator('html').click();
  await page.getByRole('listitem').filter({ hasText: 'TEST2' }).getByLabel('Toggle Todo').check();
  await page.locator('html').click();
  await page.getByRole('link', { name: 'Completed' }).click();
  await page.locator('html').click();
  const item = page.getByRole('listitem').filter({ hasText: 'TEST2' });
  await item.hover();
  await item.locator('button.destroy').click();
});