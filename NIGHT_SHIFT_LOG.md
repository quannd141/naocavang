# 🌙 NIGHT_SHIFT_LOG — Sprint 9 — 2026-06-01

**Branch:** `night-shift/sprint-9-20260601` (off `main` @ 817f7f2)
**Mode:** NIGHT_SHIFT_MODE=true (mock-first, local-only, no push to main)
**Theme:** AI Tutor (F5) + study reminders — both mock-first
**Start:** 2026-06-01 ~10:30 local

## Pre-flight ✅

- [x] On feature branch (NOT main)
- [x] Deps already present: `@nestjs/schedule`, `@nestjs/bullmq`, `bullmq`, `rxjs`,
      `@google/generative-ai` — **no new dependency needed**
- [x] node_modules installed (corepack pnpm@9.12.0), prisma client generated
- [⚠️] Docker NOT available → no Redis → **BullMQ cannot run**; use `@nestjs/schedule`
      `@Cron` (in-process, no Redis) for reminders. Cron execution itself not
      runnable overnight → verify reminder/tutor **logic via vitest** + typecheck + build.

## Key design constraints (mock-first, migration-free)

- **AiUsageLog.operation is a Prisma enum** (`AiOperation`) → adding a `tutor_chat`
  value would need a migration (can't apply, no DB). So **TutorService calls the AI
  provider directly** (not via AiRoutingService), still checks/decrements quota, and
  skips the enum-constrained usage log (flagged for later). `'tutor_chat'` is added
  only to the **TS** `AiTaskType` union (not the DB enum).
- **Tutor streaming**: browser `EventSource` can't send the Bearer header this app
  uses, so true SSE push is deferred. BE returns the **full answer** (`POST /tutor/chat`);
  the existing FE keeps its typewriter reveal for the streaming feel.
- **Tutor is stateless** (no conversation persistence) → no new DB model, no migration.

## Stories

| # | Story | Verify | Status |
|---|-------|--------|--------|
| S9-01 | AI `tutor_chat`: port task + MockAdapter prose + pure `buildTutorPrompt`/`chunkReply` | vitest | ✅ `96e7ca0` |
| S9-02 | TutorModule: service (direct provider + quota) + `POST /tutor/chat` | vitest | ✅ `098a931` |
| S9-03 | FE: wire `/tutor` to real BE (`tutorApi.ask`), keep typewriter | typecheck+build | ✅ `d77dbc0` |
| S9-04 | Email port + MockEmailAdapter + reminder digest domain (pure) | vitest | ✅ `5b610ca` |
| S9-05 | ReminderModule: `runDailyDigest` + `@Cron` 7AM ICT + dev trigger endpoint | vitest | ✅ `de857e6` |
| S9-06 | Wrap: typecheck + full test + build + CHANGELOG + report | — | ✅ done |

## Progress log

- 10:30 Pre-flight: branch off main@817f7f2, deps verified (schedule/rxjs present).
- S9-01 `96e7ca0` (134 tests) · S9-02 `098a931` (137) · S9-03 `d77dbc0` (web build ok)
- S9-04 `5b610ca` (143) · S9-05 `de857e6` (147)
- Final: **API 147/147**, api+web typecheck clean, web build 16/16 pages.

## Constraints applied

- ❌ No real API calls (mock provider + mock email adapter that logs)
- ❌ No deploy / no push to main / no migrations applied
- ✅ TDD, atomic commit per story, all new logic unit-tested before commit

