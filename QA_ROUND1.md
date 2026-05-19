# QA Round 1 — Não Cá Vàng (Sprint 1 + Sprint 2)

**Date**: 2026-05-20
**Tester**: night-shift agent
**Branch**: `night-shift/sprint-2-20260519`
**Env**: local dev (web :3000, api :3001, Postgres 18 :5432, NIGHT_SHIFT_MODE=true)

---

## Automated E2E — Playwright (Chromium headless)

**Result**: ✅ **7/7 PASS** in 16.8s

| # | Test | Time | Status |
|---|------|------|--------|
| 1 | Landing page loads | 626ms | ✅ |
| 2 | Register → dashboard | 1.4s | ✅ |
| 3 | Mindmap create blank → editor opens with React Flow | 4.1s | ✅ |
| 4 | Flashcards: auto-gen from mindmap → deck appears (2 cards) | 2.5s | ✅ |
| 5 | Quiz: auto-gen → take → submit (1 correct + 1 wrong) → 50% result | 3.7s | ✅ |
| 6 | Library renders templates list or empty state | 2.8s | ✅ |
| 7 | Unauthenticated route renders (no crash) | 837ms | ✅ |

Specs: [`apps/web/e2e/qa-round1.spec.ts`](apps/web/e2e/qa-round1.spec.ts).
Config: [`apps/web/playwright.config.ts`](apps/web/playwright.config.ts).
Run: `cd apps/web && npx playwright test`

### What's covered
- Registration form + auto-login after register.
- Mindmap CRUD via FE form + via direct API call from test.
- Auto-gen flashcard deck from mindmap nodes-with-notes.
- Auto-gen short_answer quiz; take + submit; verify score math.
- Templates list page renders without runtime error.

### What's NOT covered (recommend manual)
- React Flow drag/drop, node edit, save round-trip.
- Study session SM-2 rating buttons (Lại / Khó / Tốt / Dễ).
- Multi-tab session sync.
- Mobile responsive layout.
- Vietnamese diacritic rendering edge cases.
- Empty deck "no due cards" CTA.

---

## Manual Chrome checklist (Quân tự test)

Mở Chrome (đăng nhập với user bất kỳ vừa register hoặc tạo mới):

### Auth (5 min)
- [ ] Register form validate password < 8 chars → hiện lỗi đỏ.
- [ ] Login với email không tồn tại → "Email hoặc mật khẩu không đúng".
- [ ] Login + reload tab → vẫn login (token persist trong localStorage).
- [ ] Logout từ Settings → /login redirect.

### Mind maps (10 min)
- [ ] Tạo blank → kéo thêm 2 node, đặt label + notes → click Save.
- [ ] Reload trang → 2 node mới còn đó (data persisted vào BE).
- [ ] Click "AI sinh từ text" + paste 3 câu → check console F12: AI response sẽ là mock JSON (NIGHT_SHIFT_MODE=true). Mindmap mới phải hiển thị.
- [ ] Tạo từ template (nếu có template trong DB) — useCount của template tăng.
- [ ] Mở mindmap của user khác (URL guess) → 403 Forbidden message.

### Flashcards (15 min)
- [ ] Empty state: chỉ vào /flashcards lần đầu → CTA "Auto-gen từ mindmap" hiện.
- [ ] Click 1 mindmap → deck mới tạo, count cards = số node có notes.
- [ ] Vào /flashcards/[deckId] → list cards có EF=2.50, Interval=0d.
- [ ] Click "+ Thêm thẻ" → form inline xuất hiện → submit thẻ mới → đếm tăng +1.
- [ ] Click 🗑 trên 1 card → confirm dialog → xoá → count giảm -1.
- [ ] Click "Bắt đầu ôn" → mở /study → click "Xem đáp án" → 4 nút rating.
- [ ] Rate "Tốt" (q=3) → next card xuất hiện. Cuối session: trang "Hoàn thành".
- [ ] Reload /flashcards → mastery % tăng (do due ratio giảm).

### Quiz (15 min)
- [ ] Auto-gen quiz từ mindmap có 2 nodes-with-notes → 2 questions.
- [ ] Click "Bắt đầu →" → intro hiện number of questions, difficulty.
- [ ] Click "Bắt đầu →" lần 2 → play phase.
- [ ] Trả lời cả 2 câu đúng (case insensitive, có thể substring) → score 100%.
- [ ] Lùi "← Câu trước" rồi sửa → submit lại → tính lại đúng.
- [ ] Trả lời sai 1 câu → result page có banner "Đã thêm 1 câu sai vào deck flashcard..." kèm link.
- [ ] Click link đó → vào deck thấy card vừa được auto-add.

### Library (5 min)
- [ ] /library list templates (hoặc empty state "Chưa có template").
- [ ] Click 1 template → detail page → có thông tin author + node count + tags.
- [ ] Click "Copy & mở" → redirect /mindmaps/[newId] với data từ template.

### Cross-browser (optional, 10 min)
- [ ] Lặp lại flow chính (register → mindmap → flashcard auto-gen) trong Firefox/Safari.
- [ ] Lặp lại trong Chrome mobile responsive (DevTools → iPhone 12 Pro).

---

## Known issues / tech debt observed

| ID | Issue | Severity | Notes |
|----|-------|---------|-------|
| TEC-08 | `matchAnswer` substring grader thô — "phép cộng" matches "phép cộng số học" two-way. Đôi khi false-positive. | Minor | Sprint 3 sẽ replace với LLM grader hoặc Levenshtein. |
| TEC-09 | Empty state on /flashcards và /quizzes chỉ list 5 mindmap đầu tiên (slice(0,5)). User có >5 mindmap không thấy được. | Minor | Add pagination/search Sprint 3. |
| QA-01 | (Cosmetic) `cards.length === 0` button disabled state trên deck detail page lúc deck vừa rỗng. | Cosmetic | Acceptable. |
| QA-02 | AI mind map gen với NIGHT_SHIFT_MODE=true trả về mock JSON — không phải bug, là design. Khi tắt mode + có real key, sẽ hit Gemini thật. | Info | Documented in CLAUDE.md autonomous-mode.md. |

---

## Verdict

✅ **PASS — sẵn sàng demo** Sprint 1 + Sprint 2 cho stakeholder.

API: 54/54 unit/service tests PASS.
E2E web: 7/7 critical paths PASS.
TS strict: 0 errors web + api.

Blockers còn lại đều là external (Google OAuth, Gemini real key, Resend, Vercel deploy) — không phải code bug.
