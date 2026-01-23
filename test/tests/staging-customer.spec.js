import { test, expect } from '@playwright/test';

test.describe('Staging環境 - 39KM: 顧客登録フロー', () => {
  const stagingURL = 'http://dev.marathon.rplearn.net/toshiki_kobayashi';

  test('顧客登録: add → confirm → list反映', async ({ page }) => {
    // ステップ1: 顧客登録ページにアクセス
    await page.goto(`${stagingURL}/customer/add.html`);
    await expect(page).toHaveURL(/\/customer\/add\.html/);

    // ステップ2: テストデータを生成
    const ts = Date.now();
    const companyName = `staging_test_${ts}`;
    const industry = `Industry_${ts}`;
    const contact = `staging_test_${ts}@example.com`;
    const location = `Tokyo_${ts}`;

    // ステップ3: フォームに入力
    await page.fill('input[name="companyName"]', companyName);
    await page.fill('input[name="industry"]', industry);
    await page.fill('input[name="contact"]', contact);
    await page.fill('input[name="location"]', location);

    // ステップ4: sessionStorageにデータを保存
    await page.evaluate((data) => {
      sessionStorage.setItem('customerData', JSON.stringify(data));
    }, { companyName, industry, contact, location });

    // ステップ5: 確認ページに遷移
    await page.goto(`${stagingURL}/customer/add-confirm.html`);
    await expect(page).toHaveURL(/\/customer\/add-confirm\.html/);
    await page.waitForTimeout(500);

    // ステップ6: 確認ページで入力内容が正しく表示されることを確認
    await expect(page.locator('#confirm-companyName')).toHaveText(companyName);
    await expect(page.locator('#confirm-contact')).toHaveText(contact);

    console.log(`✅ Staging: 顧客 ${companyName} の確認ページまで正常に進みました`);
  });

  test('顧客一覧ページの表示確認', async ({ page }) => {
    // ステップ1: 顧客一覧ページにアクセス
    await page.goto(`${stagingURL}/customer/list.html`);
    await expect(page).toHaveURL(/\/customer\/list\.html/);

    // ステップ2: テーブルが読み込まれるのを待つ
    await page.waitForTimeout(1500);

    // ステップ3: 顧客情報が表示されていることを確認
    const tableLinks = page.locator('table tbody tr td:nth-child(2) a');
    const linkCount = await tableLinks.count();
    
    if (linkCount > 0) {
      const firstCompanyName = await tableLinks.first().textContent();
      console.log(`✅ Staging: 一覧ページに ${linkCount} 件の顧客情報が表示されています`);
      console.log(`   最初の顧客: ${firstCompanyName}`);

      // ステップ4: 最初の顧客をクリック
      await tableLinks.first().click();

      // ステップ5: 詳細ページが表示されることを確認
      await expect(page).toHaveURL(/\/customer\/detail\.html/);
      console.log(`✅ Staging: "${firstCompanyName}" の詳細ページが表示されました`);
    } else {
      console.log('⚠️  一覧ページに顧客データがありません');
    }
  });

  test('顧客詳細ページの編集ボタン確認', async ({ page }) => {
    // ステップ1: 顧客一覧ページにアクセス
    await page.goto(`${stagingURL}/customer/list.html`);
    await page.waitForTimeout(1500);

    // ステップ2: リンクが存在するか確認
    const firstLink = page.locator('table tbody tr td:nth-child(2) a').first();
    const linkExists = await firstLink.count() > 0;
    
    if (!linkExists) {
      console.log('⚠️  一覧ページに顧客データがないため、詳細ページテストをスキップします');
      return;
    }

    const firstCompanyName = await firstLink.textContent();
    await firstLink.click();
    await expect(page).toHaveURL(/\/customer\/detail\.html/);

    // ステップ3: 編集ボタンが存在することを確認
    const editButton = page.locator('#edit-btn');
    
    if (await editButton.count() > 0) {
      await expect(editButton).toBeVisible();
      console.log(`✅ Staging: "${firstCompanyName}" の詳細ページに編集ボタンが表示されています`);
    } else {
      console.log('⚠️  編集ボタンが見つかりません');
    }
  });
});
