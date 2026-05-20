import { expect, test } from '@playwright/test';

/**
 * QA Round 5 — Sprint 6 additions:
 *
 *   1. Public viewer: no edit toolbar (TEC-12 closed).
 *      - "Lưu" / "Thêm node" / "Xoá" buttons must NOT exist on /public/mindmaps/<id>.
 *   2. Public viewer: editor toolbar still present on owner's /mindmaps/<id>
 *      (regression — readOnly is opt-in).
 *   3. Account delete — happy path:
 *      - Settings → expand danger zone → enter password + "XOA" → submit
 *      - Redirects to landing, bearer cleared, login attempt fails.
 *   4. Account delete — wrong password rejected.
 *   5. Account delete — typing other than "XOA" stays disabled / errors out.
 */

const stamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const PASSWORD = 'qa-test-pw-123';

async function register(page: import('@playwright/test').Page, name: string) {
  const email = `qa5-${stamp()}@nao-ca-vang.test`;
  await page.goto('/register');
  await page.getByLabel(/họ tên|name/i).fill(name);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mật khẩu|password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /Đăng ký miễn phí/ }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  const token = await page.evaluate(() => localStorage.getItem('nao-ca-vang:bearer'));
  if (!token) throw new Error('No bearer after register');
  return { email, token };
}

async function seedPublicMindMap(
  page: import('@playwright/test').Page,
  token: string,
  title: string,
) {
  const create = await page.request.post('http://localhost:3001/api/mindmaps', {
    headers: { authorization: `Bearer ${token}` },
    data: {
      title,
      data: {
        nodes: [
          { id: 'root', data: { label: 'Root' } },
          { id: 'n1', data: { label: 'Branch', notes: 'note' } },
        ],
        edges: [{ id: 'e1', source: 'root', target: 'n1' }],
      },
    },
  });
  const id = (await create.json()).data.id;
  await page.request.patch(`http://localhost:3001/api/mindmaps/${id}`, {
    headers: { authorization: `Bearer ${token}` },
    data: { isPublic: true },
  });
  return id;
}

test.describe('Não Cá Vàng — QA Round 5 (Sprint 6)', () => {
  test('1. public viewer hides editor toolbar (TEC-12)', async ({ page, browser }) => {
    const { token } = await register(page, 'TEC12 QA');
    const id = await seedPublicMindMap(page, token, 'Read Only MM');

    const anon = await browser.newContext();
    const anonPage = await anon.newPage();
    await anonPage.goto(`http://localhost:3000/public/mindmaps/${id}`);
    await expect(anonPage.getByText('🌍 Read Only MM').first()).toBeVisible({ timeout: 10_000 });

    // No editor buttons must render in read-only mode.
    await expect(anonPage.getByRole('button', { name: /^Lưu$/ })).toHaveCount(0);
    await expect(anonPage.getByRole('button', { name: /Thêm node/i })).toHaveCount(0);
    await expect(anonPage.getByRole('button', { name: /^Xoá$/i })).toHaveCount(0);
    await anon.close();
  });

  test('2. owner editor still has toolbar (regression)', async ({ page }) => {
    const { token } = await register(page, 'TEC12 Owner');
    const id = await seedPublicMindMap(page, token, 'Editable MM');

    await page.goto(`/mindmaps/${id}`);
    // Wait for canvas to load (toolbar buttons mount after).
    await expect(page.getByRole('button', { name: /^Lưu$/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Thêm node/i })).toBeVisible();
  });

  test('3. account delete — happy path redirects + invalidates session', async ({ page }) => {
    const { email } = await register(page, 'Delete Me');

    await page.goto('/settings');
    await page.getByRole('button', { name: /Xoá tài khoản/i }).click();

    // Danger-zone form expanded.
    await page.locator('#deletePassword').fill(PASSWORD);
    await page.locator('#deleteConfirm').fill('XOA');
    await page.getByRole('button', { name: /Xoá vĩnh viễn/i }).click();

    await page.waitForURL(/\/$/, { timeout: 10_000 });

    // Bearer token must be cleared client-side.
    const token = await page.evaluate(() => localStorage.getItem('nao-ca-vang:bearer'));
    expect(token).toBeFalsy();

    // Login with old credentials should fail (user record gone).
    const login = await page.request.post('http://localhost:3001/api/auth/login', {
      data: { email, password: PASSWORD },
      failOnStatusCode: false,
    });
    expect(login.status()).toBeGreaterThanOrEqual(400);
  });

  test('4. account delete — wrong password rejected', async ({ page }) => {
    await register(page, 'Wrong PW QA');

    await page.goto('/settings');
    await page.getByRole('button', { name: /Xoá tài khoản/i }).click();
    await page.locator('#deletePassword').fill('nope-wrong-password');
    await page.locator('#deleteConfirm').fill('XOA');
    await page.getByRole('button', { name: /Xoá vĩnh viễn/i }).click();

    // Stays on /settings + shows error message
    await expect(page).toHaveURL(/\/settings$/, { timeout: 5_000 });
    await expect(page.getByText(/Mật khẩu không đúng/i)).toBeVisible({ timeout: 5_000 });

    // Bearer still present — session not destroyed
    const token = await page.evaluate(() => localStorage.getItem('nao-ca-vang:bearer'));
    expect(token).toBeTruthy();
  });

  test('5. account delete — confirm text must equal "XOA"', async ({ page }) => {
    await register(page, 'Bad Confirm QA');

    await page.goto('/settings');
    await page.getByRole('button', { name: /Xoá tài khoản/i }).click();
    await page.locator('#deletePassword').fill(PASSWORD);
    await page.locator('#deleteConfirm').fill('delete');
    await page.getByRole('button', { name: /Xoá vĩnh viễn/i }).click();

    await expect(page.getByText(/Gõ chính xác "XOA"/i)).toBeVisible({ timeout: 5_000 });
    const token = await page.evaluate(() => localStorage.getItem('nao-ca-vang:bearer'));
    expect(token).toBeTruthy();
  });
});
