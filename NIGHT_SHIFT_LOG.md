# 🌙 NIGHT_SHIFT_LOG — Sprint 8 — 2026-05-29

**Branch:** `night-shift/sprint-8-20260529` (off `main`)
**Mode:** NIGHT_SHIFT_MODE=true (mock-first, local-only, no push to main)
**Start:** 2026-05-29 ~09:50 local

> Previous sprints (1–7) merged into `main` and pushed to `origin`. This run
> works on a fresh feature branch; nothing pushed to `origin/main`.

---

## Pre-flight ✅

- [x] On feature branch `night-shift/sprint-8-20260529` (NOT main)
- [x] `node_modules` installed via `corepack pnpm@9.12.0 install` (pnpm not on PATH; corepack used)
- [x] `prisma generate` run (fixed `Prisma.Decimal` undefined in export.service.spec)
- [x] **Baseline green: 104/104 API unit tests pass**
- [⚠️] Docker NOT available → no local Postgres → BE-integration-with-real-DB + Playwright e2e CANNOT run this session. Scope limited to unit-testable BE logic (vitest + mocked Prisma).

## Theme: Public gallery + learning analytics (all BE, unit-testable)

| # | Story | Verify | Status |
|---|-------|--------|--------|
| S8-01 | Public mindmap gallery list — `GET /public/mindmaps` (closes `public/list` TODO stub) | vitest (mock Prisma) | ✅ done `f157a08` |
| S8-02 | Review activity analytics — `StatsService.getActivity` + pure `computeDailyReviewCounts` | vitest | ✅ done `bb071b9` |
| S8-03 | Quiz attempt score summary (best/avg/last) — pure helper + wire into attempt history | vitest | ✅ done `b468269` |
| S8-04 | (stretch) Flashcard due-forecast pure function | vitest | ✅ done `2206283` |
| S8-05 | Wrap: typecheck + full test + CHANGELOG + report | — | ✅ done |

## Constraints applied

- ❌ No real API calls (NIGHT_SHIFT_MODE mock adapters only)
- ❌ No deploy / no `git push origin main`
- ❌ No e2e / no migrations (docker unavailable)
- ✅ TDD red-green-refactor, atomic commit per story
- ✅ All new logic covered by unit tests before commit

## Progress log

- 09:50 Pre-flight: installed deps via corepack pnpm@9.12.0 (2 attempts, EPERM on store first time), `prisma generate`, baseline 104/104.
- 09:54 S8-01 public gallery — committed `f157a08` (108 tests).
- 09:59 S8-02 review activity — committed `bb071b9` (114 tests).
- 10:02 S8-03 quiz attempt summary — committed `b468269` (119 tests).
- 10:05 S8-04 due-forecast — committed `2206283` (127 tests).
- 10:08 Wrap: CHANGELOG + report. **Final: 127/127 API unit tests, api typecheck clean.**
