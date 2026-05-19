import { expect, test } from '@playwright/test';

/**
 * QA Round 4 — Sprint 5 additions:
 *
 *   1. Delete mindmap from /mindmaps list — confirm dialog + reload.
 *   2. Delete quiz from /quizzes list.
 *   3. Export user data → browser downloads JSON file.
 *   4. Public mindmap: private map returns 404 on /public/mindmaps/<id>.
 *   5. Public mindmap: after toggling isPublic, /public/mindmaps/<id>
 *      renders the viewer without auth.
 */

const stamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

async function register(page: import('@playwright/test').Page, name: string) {
  const email = `qa4-${stamp()}@nao-ca-vang.test`;
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

test.describe('Não Cá Vàng — QA Round 4 (Sprint 5)', () => {
  test('1. delete mindmap from list — confirm + reload', async ({ page }) => {
    const { token } = await register(page, 'Delete MM QA');
    await page.request.post('http://localhost:3001/api/mindmaps', {
      headers: { authorization: `Bearer ${token}` },
      data: {
        title: 'To Be Deleted',
        data: { nodes: [{ id: 'root', data: { label: 'r' } }], edges: [] },
      },
    });

    await page.goto('/mindmaps');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('To Be Deleted')).toBeVisible();

    // Auto-accept the native confirm dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Hover the card → trash button becomes visible. Click via aria-label.
    await page.getByLabel(/Xoá To Be Deleted/).click();
    await expect(page.getByText('To Be Deleted')).not.toBeVisible({ timeout: 10_000 });
  });

  test('2. delete quiz from list', async ({ page }) => {
    const { token } = await register(page, 'Delete Q QA');
    // Seed mindmap + auto-gen quiz
    const mmRes = await page.request.post('http://localhost:3001/api/mindmaps', {
      headers: { authorization: `Bearer ${token}` },
      data: {
        title: 'Q MM',
        data: {
          nodes: [
            { id: 'root', data: { label: 'r' } },
            { id: 'n1', data: { label: 'A', notes: 'def A' } },
          ],
        },
      },
    });
    const mindmapId = (await mmRes.json()).data.id;
    await page.request.post(`http://localhost:3001/api/quizzes/from-mindmap/${mindmapId}`, {
      headers: { authorization: `Bearer ${token}` },
      data: {},
    });

    await page.goto('/quizzes');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Quiz: Q MM')).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByLabel(/Xoá Quiz: Q MM/).click();
    await expect(page.getByText('Quiz: Q MM')).not.toBeVisible({ timeout: 10_000 });
  });

  test('3. export → downloads JSON file with expected shape', async ({ page }) => {
    const { token } = await register(page, 'Export QA');
    // Seed some data so the bundle is interesting
    await page.request.post('http://localhost:3001/api/mindmaps', {
      headers: { authorization: `Bearer ${token}` },
      data: {
        title: 'Export MM',
        data: { nodes: [{ id: 'root', data: { label: 'r' } }], edges: [] },
      },
    });

    await page.goto('/settings');

    // The Export button triggers <a download> → Playwright captures via 'download' event
    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
    await page.getByRole('button', { name: /Export JSON/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^nao-ca-vang-export-\d{4}-\d{2}-\d{2}\.json$/);

    // Read the file content + verify schema
    const path = await download.path();
    expect(path).toBeTruthy();
    const fs = await import('node:fs');
    const raw = fs.readFileSync(path!, 'utf-8');
    const bundle = JSON.parse(raw);
    expect(bundle.schemaVersion).toBe(1);
    expect(bundle.user.name).toBe('Export QA');
    expect(bundle.mindmaps).toHaveLength(1);
    expect(bundle.mindmaps[0].title).toBe('Export MM');
  });

  test('4. private mindmap returns 404 on public URL', async ({ page }) => {
    const { token } = await register(page, 'Privacy QA');
    const mmRes = await page.request.post('http://localhost:3001/api/mindmaps', {
      headers: { authorization: `Bearer ${token}` },
      data: {
        title: 'Private MM',
        data: { nodes: [{ id: 'root', data: { label: 'r' } }], edges: [] },
      },
    });
    const mindmapId = (await mmRes.json()).data.id;

    // Open the public URL in the same context — should show the "not public" screen.
    await page.goto(`/public/mindmaps/${mindmapId}`);
    await expect(page.getByText(/không công khai/i)).toBeVisible({ timeout: 10_000 });
  });

  test('5. public mindmap renders without auth after isPublic=true', async ({ page, browser }) => {
    const { token } = await register(page, 'Share QA');
    const mmRes = await page.request.post('http://localhost:3001/api/mindmaps', {
      headers: { authorization: `Bearer ${token}` },
      data: {
        title: 'Shared MM',
        data: {
          nodes: [
            { id: 'root', data: { label: 'Topic' } },
            { id: 'n1', data: { label: 'Sub', notes: 'note' } },
          ],
          edges: [],
        },
      },
    });
    const mindmapId = (await mmRes.json()).data.id;

    // Make it public via API (UI toggle would also work)
    const patch = await page.request.patch(`http://localhost:3001/api/mindmaps/${mindmapId}`, {
      headers: { authorization: `Bearer ${token}` },
      data: { isPublic: true },
    });
    expect(patch.ok()).toBeTruthy();

    // Open in a separate browser context (no auth) to prove no session needed
    const anon = await browser.newContext();
    const anonPage = await anon.newPage();
    await anonPage.goto(`http://localhost:3000/public/mindmaps/${mindmapId}`);
    // The viewer banner contains "🌍 Shared MM" — pick the first match (banner div)
    await expect(anonPage.getByText('🌍 Shared MM').first()).toBeVisible({ timeout: 10_000 });
    await expect(anonPage.getByText(/Share QA/).first()).toBeVisible();
    // CTA "Tạo mind map của bạn" → /register
    await expect(anonPage.getByRole('link', { name: /Tạo mind map của bạn/i })).toBeVisible();
    await anon.close();
  });
});
