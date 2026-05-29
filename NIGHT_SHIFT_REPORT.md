# 🌙 Night Shift Report — 2026-05-29 (Sprint 8)

**Project**: Não Cá Vàng (`nao-ca-vang`)
**Mode**: NIGHT_SHIFT_MODE=true (mock AI, local-only, no push to main)
**Branch**: `night-shift/sprint-8-20260529` (off `main`)
**Commits awaiting Quân's review**: **4** (all on the feature branch)

> Supersedes the 2026-05-20 consolidated report (Sprints 2–7, now merged to
> `main`/`origin`). This run is a clean Sprint 8 on a fresh feature branch.

---

## Summary

| Story | Commit | What | Tests |
|-------|--------|------|-------|
| S8-01 | `f157a08` | Public mindmap gallery `GET /public/mindmaps` (+ removed dead stub) | +4 |
| S8-02 | `bb071b9` | Daily review activity `GET /users/me/activity` | +6 |
| S8-03 | `b468269` | Quiz attempt summary in `meta` of `GET /quizzes/:id/attempts` | +5 |
| S8-04 | `2206283` | Flashcard due-forecast `GET /flashcards/forecast` | +8 |

**Theme**: Public gallery + learning analytics — all backend, all pure-logic,
all unit-testable.

**API unit tests**: **104 → 127 PASS** (+23 new specs across 4 stories)
**API typecheck (`tsc --noEmit`)**: clean
**Biome lint**: clean on all new pure-logic files (`*.service.ts`, `domain/*.ts`, specs)
**Diff**: 15 files, +582 / −14 (apps/api only — no FE, no infra touched)

---

## Why this scope (honest constraint note)

The dev box this session had **no Docker** and **pnpm only reachable via
corepack** (`pnpm` not on PATH; `corepack enable` blocked by EPERM on
`C:\Program Files`). Consequences:

- ✅ Unit tests (vitest + mocked Prisma) **do** run — I installed deps via
  `corepack pnpm@9.12.0 install` (took 2 tries; first hit `ERR_PNPM_EPERM` on
  the `D:\.pnpm-store`, second completed) and ran `prisma generate` (which also
  fixed 2 pre-existing `export.service.spec` failures caused by an
  ungenerated client → `Prisma.Decimal is not a constructor`).
- ❌ **No Postgres** → BE-integration-with-real-DB and Playwright **e2e could
  not run**. So I deliberately scoped Sprint 8 to **pure-logic + service-layer**
  work where vitest gives real verification, rather than features whose only
  honest proof is e2e. Every new endpoint's core logic is a pure function with
  exhaustive unit tests; the thin controller wiring is the only unverified-by-
  test layer (it's 1–3 lines each, following existing patterns).

---

## New API surface (for the morning smoke test)

```
GET /public/mindmaps?subject=math&limit=20   → public gallery (no auth)
GET /users/me/activity?days=30                → [{date,count}] review heatmap
GET /quizzes/:id/attempts                     → data[] unchanged + meta{count,bestScore,avgScore,lastScore}
GET /flashcards/forecast?days=7               → {overdue, buckets[{date,count}], total, days}
```

All four are backend-only. **FE does not yet consume the 3 new endpoints**
(activity / forecast / gallery-list) — those are dashboard/gallery widgets for
a future FE story. The quiz `meta` is additive so the existing Sprint-7 intro
screen is unaffected.

---

## Decisions I made unilaterally (Quân check)

- **Gallery list lives on the public (no-auth) controller** `GET /public/mindmaps`,
  not the authed `GET /mindmaps/public/list` stub (which I deleted). Rationale:
  a gallery should be browsable logged-out, matching the existing
  `/public/mindmaps/:id` viewer.
- **Limit/days clamps**: gallery `limit` ∈ [1,50] default 20; activity `days`
  ∈ [1,90] default 30; forecast `days` ∈ [1,30] default 7. Invalid/NaN → default.
  Picked to cap query cost without an offset/cursor pagination layer (defer that
  until the FE actually needs infinite scroll).
- **Quiz summary under `meta`, not `data`** — keeps the Sprint-7 FE contract
  (`data` = attempt array) intact while exposing best/avg/last.
- **Forecast separates `overdue` from `total`** — `total` counts only
  cards due *within* the window; cards due before today are surfaced as
  `overdue` so the dashboard can nudge "catch up" distinctly from "upcoming".

---

## ⚠️ Things to look at in the morning

1. **Pre-existing lint noise (not introduced by me)**: `biome lint` reports
   "Decorators are only valid on class declarations…" on *every* NestJS
   controller (e.g. the untouched `mindmap.controller.delete`). The repo
   `biome.json` is missing
   `javascript.parser.unsafeParameterDecoratorsEnabled: true`. One-line fix,
   but it changes lint behaviour repo-wide so I left it for you. **Recommended**:
   add that flag so `pnpm lint` is green on the API. (My new pure-logic files
   lint clean today only because they have no param decorators.)
2. **Line endings**: new files committed as LF; git warns it'll convert to CRLF
   on checkout (Windows `autocrlf`). Harmless, matches repo `.gitattributes`
   behaviour for the rest of the tree.
3. **Merge**: branch is local only. `git log --oneline main..night-shift/sprint-8-20260529`
   shows the 4 commits. Suggested: review → fast-forward/merge into `main` → push.

---

## Tech debt still open (unchanged this sprint)

| ID | Item | Note |
|----|------|------|
| TEC-04 | BE integration tests with real Postgres (testcontainers) | **Blocked tonight: no Docker.** Needs your machine to have Docker for the test container. |
| TEC-05 | JWT instead of session table (stateless API) | Architecture change — deliberately NOT attempted overnight (per night-shift rules). |
| TEC-06 | Some FE pages still rely on mock seed (mindmap template fallback) | FE change; best verified with e2e which couldn't run tonight. Deferred. |

## Blocked items (need Quân's credentials/decisions) — see PENDING_HUMAN.md

Unchanged from prior runs: Google OAuth (PH-001), Gemini key (PH-002), R2
(PH-004), Resend (PH-005), Sentry (PH-006), hosting (PH-007), domain (PH-008),
trademark (PH-009), real-user validation (PH-010). None touched tonight.

---

## What I did NOT do

- ❌ No push to `origin` (nothing to `main`)
- ❌ No merge into `main`
- ❌ No deploy / docker push / migrations
- ❌ No paid AI calls (NIGHT_SHIFT_MODE; mock adapter only — and no AI code touched)
- ❌ No FE / infra / CI / `.env*` changes
- ❌ Did not "fix" the repo-wide biome config unilaterally (flagged instead)

---

## 🧠 Context Checkpoint

- Estimate context: 🟠 **~55–60%** — one focused sprint, ~40 tool calls, 1 big
  install. Lower than the Sprints 2–7 mega-run.
- State is fully captured in: this report + `NIGHT_SHIFT_LOG.md` + the 4 commit
  messages + the CHANGELOG `[Unreleased]` section.
- **Recommendation**: if continuing, `/compact` first, then:
  ```
  Đọc NIGHT_SHIFT_REPORT.md + NIGHT_SHIFT_LOG.md. Sprint 8 (4 commits) trên
  branch night-shift/sprint-8-20260529, 127/127 API unit tests pass, chưa push.
  Việc cần: (1) thêm unsafeParameterDecoratorsEnabled vào biome.json, (2) review
  + merge branch, (3) FE story tiêu thụ 3 endpoint mới (gallery/activity/forecast).
  ```

---

_Generated by night-shift skill @ 2026-05-29 ~10:08 local time._
_Awaiting Quân's review in the morning._
