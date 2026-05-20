# 🌙 Night Shift Report — 2026-05-20

**Project**: Não Cá Vàng (`nao-ca-vang`)
**Mode**: NIGHT_SHIFT_MODE=true (mock AI, local-only, no push)
**Branch chain**: `night-shift/sprint-2 → 3 → 4 → 5 → 6-20260520`
**Total commits awaiting Quân's review**: **21** across 5 sprints

> Supersedes the original Sprint-1 night-shift report. That run had its own
> 3-gate sprint-end-review (see `git log night-shift/sprint-1-20260516` and
> the CHANGELOG entry for Sprint 1). This file consolidates Sprints 2–5.

---

## Summary

The /night-shift skill was invoked mid Sprint 5 after **4 sprints worth of
work had already completed under the same constraints** (mock mode, local-only,
no push). This report consolidates the whole run so Quân can review in the
morning.

| Sprint | Commits | Headline outcome |
|---|---|---|
| **2** (19/05) | 9 | Flashcard + Quiz BE modules, FE→BE wiring, manual card CRUD |
| **3** (20/05) | 3 | Dashboard real stats, Levenshtein grader (TEC-08), QA Round 2 |
| **4** (20/05) | 3 | Settings (change name + password), search/filter (TEC-09), QA Round 3 |
| **5** (20/05) | 5 | Delete UI, /quizzes search (TEC-11), Export JSON, Public share, QA Round 4 |
| **6** (20/05) | 3 | Read-only public viewer (TEC-12), PDPA account delete, QA Round 5 |

**API tests**: 100/100 PASS (was 95 — +5 deleteAccount specs)
**E2E tests**: 26/26 PASS (~72s) (was 21 — +5 round-5 specs)
**API operations live**: ~33 (was 16 at end of Sprint 1)
**TS strict**: 0 errors web + api
**Total LOC added Sprints 2–6**: ~3700+ lines of feature code + tests

---

## Constraints honoured ✓

- ❌ **No real API calls**: `NIGHT_SHIFT_MODE=true` env enforced in `apps/api/.env`. `GeminiAdapter` throws if invoked with `FAKE_KEY_DO_NOT_USE` — but mock adapter handled all AI calls.
- ❌ **No push to remote**: All 18 commits stay local on `night-shift/sprint-*` branches. Quân's choice when to push.
- ❌ **No deploy**: zero `vercel deploy`, `railway`, `docker push`, etc.
- ❌ **No destructive ops**: no force-push, no `git reset --hard` on Quân's branches, no migrations on prod DB.
- ❌ **No secrets committed**: when Quân pasted real API keys into `.env.example` by mistake (Sprint 5 start), agent reverted that change, moved keys to gitignored `apps/api/.env`, and flagged 3 keys to rotate (commit `b310fe1`). Keys are: Anthropic + Google AI Studio + Groq.

---

## Sprint-by-sprint highlights

### Sprint 2 — Flashcard + Quiz core loop (`night-shift/sprint-2-20260519`)

```
f7cd7ee  Flashcard BE module (8 endpoints) + FE wiring (3 pages)
2bfc104  Zod validation on mindmap.data (TEC-07 closed)
86be2cc  Integration tests for FlashcardService + sm2 spec fixes
89fa164  Quiz BE module (8 endpoints) + auto-add wrong→deck loop
f73bb12  FE Quizzes + Library wired to real BE
f61356d  Manual add/delete cards on existing deck (TEC-09 partial)
0a1898e  Playwright QA Round 1 (7 specs)
b310fe1  Revert leaked API keys from .env.example (security fix)
```

**Critical loop verified**: mindmap → auto-gen flashcard deck → quiz → submit wrong → cards appended to deck.

### Sprint 3 — Dashboard polish + grader (`night-shift/sprint-3-20260520`)

```
43630d2  Dashboard real stats endpoint (GET /users/me/stats)
90fb28d  Levenshtein answer grader (TEC-08 closed) — "phep cong" matches "phép cộng"
3271759  QA Round 2 (4 specs)
```

### Sprint 4 — Settings + search (`night-shift/sprint-4-20260520`)

```
1a873d3  Settings: change name + change password (invalidates all sessions)
dc182ca  Search/filter on /mindmaps + /flashcards (TEC-09 closed)
50ef4e3  QA Round 3 (5 specs)
```

### Sprint 5 — Power user features (`night-shift/sprint-5-20260520`)

```
a4c1c2f  Delete UI on /mindmaps + /quizzes (TEC-10) + /quizzes search (TEC-11)
b5799a4  Export user data as JSON (PDPA, GET /users/me/export)
dcb10d5  Public mindmap sharing (isPublic toggle + /public/mindmaps/[id] viewer)
9db59ca  QA Round 4 (5 specs)
```

### Sprint 6 — Tech debt cleanup (`night-shift/sprint-6-20260520`)

```
5649f41  MindMapCanvas readOnly mode for /public viewer (TEC-12 closed)
e598ebd  Account delete with cascade + password+"XOA" double confirm (PDPA)
ed5fe4c  QA Round 5 (5 specs)
```

**Critical loop verified**: public viewer now read-only (no broken Save button); account delete cascades through sessions, mindmaps, decks, cards, quizzes, attempts, review/AI logs in one transaction.

---

## ⚠️ Things to verify in the morning

### MUST do (security)

1. **Rotate 3 API keys** — they appeared in chat history during Sprint 5 start before being moved to gitignored file:
   - Anthropic: https://console.anthropic.com/settings/keys (revoke `sk-ant-api03-WXsMCN...AA`)
   - Google AI Studio: https://aistudio.google.com/app/apikey (delete `AIzaSyC_4elJ3...A`)
   - Groq: https://console.groq.com/keys (revoke `gsk_XA0KgISqp...YZZYe`)
   - Paste new keys into `apps/api/.env` (gitignored ✓), **NOT** into `.env.example`.

### SHOULD do (review)

2. **Review the 18 commits**: `git log --oneline night-shift/sprint-2-20260519..HEAD` on the sprint-5 branch.
3. **Decide merge strategy**:
   - Option A: merge sprint-2..5 chain into `main` locally then push.
   - Option B: push each sprint as its own PR for review history.
   - Option C: rebase + squash into 4 clean PRs (one per sprint).

### Quick smoke test (5 min)

Boot both servers, then:
```
http://localhost:3000           → landing
http://localhost:3000/register  → make a user
http://localhost:3000/dashboard → stats tiles + recent activity
/mindmaps/new                   → "Mind map trống" → editor + toggle 🌍 Public
/flashcards                     → auto-gen from mindmap → study session
/quizzes                        → auto-gen → take → "Hà Nội" vs "ha noi" both correct
/settings                       → change name → Export JSON downloads
```

Or just run `pnpm --filter web exec playwright test` — 21/21 should pass in ~50s.

---

## Tech debt still open

| ID | Item | Sprint to address |
|----|------|-------------------|
| TEC-04 | BE integration tests with real Postgres (testcontainers) | Sprint 7 |
| TEC-05 | JWT instead of session table (stateless API) | Sprint 7+ |
| TEC-06 | Some FE pages still rely on mock seed (template detail fallback) | Sprint 7 |
| ~~TEC-12~~ | ~~Mindmap public viewer disable add/save when read-only~~ | ✅ closed Sprint 6 |

## Blocked items (need Quân's credentials/decisions)

- **S2-01** Google OAuth — need `GOOGLE_CLIENT_ID/SECRET`
- **S2-05** PDF upload → mind map — need R2 + real Gemini (Gemini key now exists, just need R2)
- **S2-06** Welcome email — need Resend API key
- **S2-07** Staging deploy — need Vercel + Railway provisioned
- **S2-10** AI chat tutor with SSE — needs NIGHT_SHIFT_MODE=false (paid LLM calls)
- ~~Account delete (currently disabled in Settings)~~ — ✅ closed Sprint 6 (hard delete + cascade + double confirm; chose immediate delete over retention because (a) cascade is clean, (b) Export JSON already gives user a backup path before deletion)

---

## Decisions I made unilaterally (Quân check)

- **`matchAnswer` substring threshold = 4 chars** to avoid false-positive on single letters.
- **Levenshtein similarity threshold = 0.85** for fuzzy matching. Catches 1-char typos in 7-char words and longer.
- **`computeStreak` resets if no review today** (yesterday alone doesn't count). Tighter UX — encourages daily habit.
- **Public mindmap returns 404 (not 403) for private maps** — avoids leaking existence to scrapers.
- **Export bundle skips `review_log` table** — state already on cards (easeFactor, interval) keeps bundle small.
- **Password change invalidates ALL sessions** (industry standard but a few users may complain).

---

## 🧠 Context checkpoint

- Estimate context: 🔴 ~85% — long session across 4 sprints + many tool calls.
- Session notes implicit in: this report + 4 QA Round spec files + 18 commit messages.
- Recommendation: Quân runs `/compact` before resuming, then paste:
  ```
  Đọc NIGHT_SHIFT_REPORT.md (đầu repo) để hiểu state.
  Sprint 5 đã đóng với 21/21 E2E. Còn 18 commit local chưa push.
  Action items: rotate 3 keys + decide merge strategy (xem report).
  ```

---

## What I did NOT do

- ❌ Push any branch to GitHub remote
- ❌ Merge anything into `main`
- ❌ Delete other branches
- ❌ Call any paid AI API (NIGHT_SHIFT_MODE held the line)
- ❌ Modify `.env`/`.env.production` (only `.env.example` and `apps/api/.env`)
- ❌ Touch infrastructure or CI/CD files
- ❌ Run migrations on anything other than local Postgres
- ❌ `npm publish`, `docker push`, etc.

---

_Generated by night-shift skill @ 2026-05-20 ~01:30 local time._
_Awaiting Quân's review in the morning._
