import { expect, test } from '@playwright/test';

/**
 * QA Round 3 — Sprint 4 additions:
 *
 *   1. Settings page: change name persists + reflects on dashboard greeting.
 *   2. Settings page: change password — wrong old shows error.
 *   3. Settings page: change password — correct flow logs user out.
 *   4. /mindmaps search filter narrows the grid.
 *   5. /flashcards "Chỉ deck đến hạn" toggle filters out completed decks.
 */

const stamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

async function register(page: import('@playwright/test').Page, name: string) {
  const email = `qa3-${stamp()}@nao-ca-vang.test`;
  const password = 'qa-test-pw-123';
  await page.goto('/register');
  await page.getByLabel(/họ tên|name/i).fill(name);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mật khẩu|password/i).fill(password);
  await page.getByRole('button', { name: /Đăng ký miễn phí/ }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  const token = await page.evaluate(() => localStorage.getItem('nao-ca-vang:bearer'));
  if (!token) throw new Error('No bearer after register');
  return { email, password, token };
}

test.describe('Não Cá Vàng — QA Round 3 (Sprint 4)', () => {
  test('1. settings: update name persists + reflects on dashboard greeting', async ({ page }) => {
    await register(page, 'Old Name');

    await page.goto('/settings');
    const nameInput = page.getByLabel('Họ tên');
    await nameInput.fill('Quân Updated');
    await page.getByRole('button', { name: /^Lưu thay đổi$/ }).click();
    await expect(page.getByText(/Đã lưu thay đổi/i)).toBeVisible({ timeout: 10_000 });

    // Dashboard greeting uses last word of name → "Updated"
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Chào Updated/i })).toBeVisible();
  });

  test('2. settings: change password — wrong old → error, session still valid', async ({ page }) => {
    await register(page, 'PW Test');

    await page.goto('/settings');
    await page.getByLabel('Mật khẩu hiện tại').fill('definitely-wrong');
    await page.getByLabel('Mật khẩu mới (≥ 8 ký tự)').fill('newpw-1234');
    await page.getByLabel('Xác nhận mật khẩu mới').fill('newpw-1234');
    await page.getByRole('button', { name: /^Đổi mật khẩu$/ }).click();
    await expect(page.getByText(/Mật khẩu cũ không đúng/i)).toBeVisible({ timeout: 10_000 });

    // Should still be on /settings (not logged out)
    await expect(page).toHaveURL(/\/settings/);
  });

  test('3. settings: change password — correct → redirect to /login', async ({ page }) => {
    const { password } = await register(page, 'PW Success');

    await page.goto('/settings');
    await page.getByLabel('Mật khẩu hiện tại').fill(password);
    await page.getByLabel('Mật khẩu mới (≥ 8 ký tự)').fill('newpw-12345');
    await page.getByLabel('Xác nhận mật khẩu mới').fill('newpw-12345');
    await page.getByRole('button', { name: /^Đổi mật khẩu$/ }).click();
    await expect(page.getByText(/Đổi mật khẩu thành công/i)).toBeVisible({ timeout: 10_000 });
    // Redirected to /login within ~2s
    await page.waitForURL(/\/login/, { timeout: 5_000 });
  });

  test('4. /mindmaps search filter narrows the list', async ({ page }) => {
    const { token } = await register(page, 'Search QA');
    // Seed 3 mindmaps with distinct titles
    for (const title of ['Toán hàm số', 'Văn Chí Phèo', 'IELTS Reading 1']) {
      await page.request.post('http://localhost:3001/api/mindmaps', {
        headers: { authorization: `Bearer ${token}` },
        data: {
          title,
          data: { nodes: [{ id: 'root', data: { label: 'Root' } }], edges: [] },
        },
      });
    }

    await page.goto('/mindmaps');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Toán hàm số')).toBeVisible();
    await expect(page.getByText('Văn Chí Phèo')).toBeVisible();
    await expect(page.getByText('IELTS Reading 1')).toBeVisible();

    // Search "ielts" — should hide the other 2 (diacritic-insensitive matters here)
    await page.getByPlaceholder(/Tìm theo title/i).fill('ielts');
    await expect(page.getByText('IELTS Reading 1')).toBeVisible();
    await expect(page.getByText('Toán hàm số')).not.toBeVisible();
    await expect(page.getByText('Văn Chí Phèo')).not.toBeVisible();

    // Diacritic-insensitive: search "ham so" (no accents) finds "Toán hàm số"
    await page.getByPlaceholder(/Tìm theo title/i).fill('ham so');
    await expect(page.getByText('Toán hàm số')).toBeVisible();
    await expect(page.getByText('IELTS Reading 1')).not.toBeVisible();
  });

  test('5. /flashcards "Chỉ deck đến hạn" toggle filters', async ({ page }) => {
    const { token } = await register(page, 'Filter QA');

    // Seed a mindmap with notes → auto-gen deck (will have due cards)
    const mmRes = await page.request.post('http://localhost:3001/api/mindmaps', {
      headers: { authorization: `Bearer ${token}` },
      data: {
        title: 'Filter MM',
        data: {
          nodes: [
            { id: 'root', data: { label: 'Root' } },
            { id: 'n1', data: { label: 'A', notes: 'def A' } },
          ],
        },
      },
    });
    const mindmapId = (await mmRes.json()).data.id;
    await page.request.post(
      `http://localhost:3001/api/flashcards/decks/from-mindmap/${mindmapId}`,
      { headers: { authorization: `Bearer ${token}` }, data: {} },
    );

    await page.goto('/flashcards');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Flashcards: Filter MM')).toBeVisible();

    // Toggle ON — deck has dueCards=1 so still visible
    await page.getByRole('button', { name: /Chỉ deck đến hạn/i }).click();
    await expect(page.getByText('Flashcards: Filter MM')).toBeVisible();

    // Search "xxx" — should hide all
    await page.getByPlaceholder(/Tìm deck/i).fill('xxx');
    await expect(page.getByText(/Không có deck khớp/i)).toBeVisible();

    // Click Reset bộ lọc
    await page.getByRole('button', { name: /Reset bộ lọc/i }).click();
    await expect(page.getByText('Flashcards: Filter MM')).toBeVisible();
  });
});
