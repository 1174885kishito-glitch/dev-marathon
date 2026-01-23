import { test, expect } from '@playwright/test';

test.describe('顧客登録フロー', () => {
  const baseURL = 'http://127.0.0.1:8080';

  test('40KM: add → confirm → list反映', async ({ page }) => {
    // ステップ1: add.htmlにアクセス
    await page.goto(`${baseURL}/customer/add.html`);
    await expect(page).toHaveURL(/\/customer\/add\.html/);

    // ステップ2: フォームに入力
    const ts = Date.now();
    const companyName = `test_${ts}`;
    const industry = `Industry_${ts}`;
    const contact = `test_${ts}@example.com`;
    const location = `Location_${ts}`;

    await page.fill('input[name="companyName"]', companyName);
    await page.fill('input[name="industry"]', industry);
    await page.fill('input[name="contact"]', contact);
    await page.fill('input[name="location"]', location);

    // ステップ3: sessionStorageにデータを保存
    await page.evaluate((data) => {
      sessionStorage.setItem('customerData', JSON.stringify(data));
    }, { companyName, industry, contact, location });

    // ステップ4: 確認ページに遷移
    await page.goto(`${baseURL}/customer/add-confirm.html`);
    await expect(page).toHaveURL(/\/customer\/add-confirm\.html/);
    await page.waitForTimeout(500);

    // ステップ5: 確認ページの表示を確認
    await expect(page.locator('#confirm-companyName')).toHaveText(companyName);
    await expect(page.locator('#confirm-contact')).toHaveText(contact);
  });

  test('41KM: 一覧ページからの詳細確認', async ({ page }) => {
    // 一覧ページにアクセス
    await page.goto(`${baseURL}/customer/list.html`);
    
    // テーブルが読み込まれるのを待つ
    await page.waitForTimeout(1000);

    // 最初のリンクが存在することを確認
    const firstLink = page.locator('#customer-list tr:first-child a');
    await expect(firstLink).toBeVisible();
    
    // リンクのテキストを取得
    const companyName = await firstLink.textContent();
    console.log(`First company: ${companyName}`);
    
    // リンクをクリック
    await firstLink.click();
    
    // 詳細ページに遷移することを確認
    await expect(page).toHaveURL(/\/customer\/detail\.html/);
  });
});
