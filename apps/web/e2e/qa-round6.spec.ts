import { expect, test } from '@playwright/test';

/**
 * QA Round 6 — Sprint 7 additions:
 *
 *   1. Quiz attempt history surfaces after first submit (S7-01).
 *   2. Mind map clone via tile button creates a "(sao chép)" duplicate (S7-02).
 *   3. Public mindmap clone returns 403 for private, 201 for public (S7-02 auth).
 *   4. Flashcard deck inline rename persists (S7-03).
 */

const stamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

async function register(page: import('@playwright/test').Page, name: string) {
  const email = `qa6-${stamp()}@nao-ca-vang.test`;
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

async function seedMindmap(
  page: import('@playwright/test').Page,
  token: string,
  title: string,
) {
  const res = await page.request.post('http://localhost:3001/api/mindmaps', {
    headers: { authorization: `Bearer ${token}` },
    data: {
      title,
      data: {
        nodes: [
          { id: 'root', data: { label: 'Root' } },
          { id: 'n1', data: { label: 'A', notes: 'A means apple' } },
          { id: 'n2', data: { label: 'B', notes: 'B means banana' } },
        ],
        edges: [
          { id: 'e1', source: 'root', target: 'n1' },
          { id: 'e2', source: 'root', target: 'n2' },
        ],
      },
    },
  });
  return (await res.json()).data.id;
}

test.describe('Não Cá Vàng — QA Round 6 (Sprint 7)', () => {
  test('1. quiz attempt history surfaces after submit', async ({ page }) => {
    const { token } = await register(page, 'Quiz Hist QA');
    const mmId = await seedMindmap(page, token, 'Quiz Hist MM');
    const quizRes = await page.request.post(
      `http://localhost:3001/api/quizzes/from-mindmap/${mmId}`,
      { headers: { authorization: `Bearer ${token}` }, data: {} },
    );
    const quizId = (await quizRes.json()).data.id;

    // Seed one attempt directly via the API so the history is non-empty before
    // we navigate (avoids flake from waiting on a real quiz submission).
    const reveal = await page.request.get(
      `http://localhost:3001/api/quizzes/${quizId}?reveal=true`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    const quizFull = (await reveal.json()).data;
    const answers = quizFull.questions.map(
      (q: { id: string; correctAnswer: string }) => ({
        questionId: q.id,
        answer: q.correctAnswer,
      }),
    );
    await page.request.post(`http://localhost:3001/api/quizzes/${quizId}/attempts`, {
      headers: { authorization: `Bearer ${token}` },
      data: { answers, timeSpentSec: 42 },
    });

    await page.goto(`/quizzes/${quizId}`);
    await expect(page.getByRole('heading', { name: /Lịch sử \(1 lần\)/ })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/Cao nhất 100%/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Làm lại/ })).toBeVisible();
  });

  test('2. clone via /mindmaps tile creates "(sao chép)" duplicate', async ({ page }) => {
    const { token } = await register(page, 'Clone QA');
    await seedMindmap(page, token, 'Original MM');

    await page.goto('/mindmaps');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Original MM')).toBeVisible();

    await page.getByLabel(/Sao chép Original MM/).click();
    // Routes to /mindmaps/<new-id> after clone.
    await page.waitForURL(/\/mindmaps\/[a-f0-9-]{8}/, { timeout: 10_000 });

    await page.goto('/mindmaps');
    await expect(page.getByText('Original MM (sao chép)')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Original MM').first()).toBeVisible();
  });

  test('3. non-owner cannot clone private mindmap, can clone public', async ({
    page,
    browser,
  }) => {
    const owner = await register(page, 'Owner');
    const privateId = await seedMindmap(page, owner.token, 'Private MM');
    const publicId = await seedMindmap(page, owner.token, 'Public MM');
    await page.request.patch(`http://localhost:3001/api/mindmaps/${publicId}`, {
      headers: { authorization: `Bearer ${owner.token}` },
      data: { isPublic: true },
    });

    // Second user
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    const stranger = await register(page2, 'Stranger');

    const forbid = await page2.request.post(
      `http://localhost:3001/api/mindmaps/${privateId}/clone`,
      { headers: { authorization: `Bearer ${stranger.token}` }, failOnStatusCode: false },
    );
    expect(forbid.status()).toBe(403);

    const ok = await page2.request.post(
      `http://localhost:3001/api/mindmaps/${publicId}/clone`,
      { headers: { authorization: `Bearer ${stranger.token}` } },
    );
    expect(ok.status()).toBe(201);
    const cloned = (await ok.json()).data;
    expect(cloned.title).toBe('Public MM (sao chép)');
    expect(cloned.userId).not.toBe(owner.token);

    await ctx2.close();
  });

  test('4. flashcard deck inline rename persists', async ({ page }) => {
    const { token } = await register(page, 'Rename QA');
    const mmId = await seedMindmap(page, token, 'Rename MM');
    const deckRes = await page.request.post('http://localhost:3001/api/flashcards/decks', {
      headers: { authorization: `Bearer ${token}` },
      data: {
        title: 'Original Deck Title',
        mindmapId: mmId,
        cards: [{ question: 'q1', answer: 'a1' }],
      },
    });
    const deckId = (await deckRes.json()).data.id;

    await page.goto(`/flashcards/${deckId}`);
    await expect(page.getByRole('heading', { name: 'Original Deck Title' })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByLabel(/Đổi tên deck/i).click();
    await page.getByLabel(/Tên deck/i).fill('Renamed Deck Title');
    await page.getByRole('button', { name: /^Lưu$/ }).click();

    await expect(page.getByRole('heading', { name: 'Renamed Deck Title' })).toBeVisible({
      timeout: 10_000,
    });

    // Reload to confirm persistence
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Renamed Deck Title' })).toBeVisible({
      timeout: 10_000,
    });
  });
});
