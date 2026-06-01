# 🌙 Night Shift Report — 2026-06-01 (Sprint 9)

**Project**: Não Cá Vàng (`nao-ca-vang`)
**Mode**: NIGHT_SHIFT_MODE=true (mock AI, mock email, local-only, no push to main)
**Branch**: `night-shift/sprint-9-20260601` (off `main` @ 817f7f2)
**Theme**: AI Tutor (F5) + study reminders — both mock-first
**Commits awaiting review**: **5** (all on the feature branch)

---

## Summary

| Story | Commit | What | Tests |
|-------|--------|------|-------|
| S9-01 | `96e7ca0` | AI `tutor_chat` task + MockAdapter prose + pure `buildTutorPrompt`/`chunkReply` | +7 |
| S9-02 | `098a931` | `AiRoutingService.chat` + `TutorService` + `POST /tutor/chat` | +3 |
| S9-03 | `d77dbc0` | FE `/tutor` wired to real BE (`tutorApi.ask`) + typewriter | build |
| S9-04 | `5b610ca` | EmailPort + MockEmailAdapter + reminder digest domain (pure) | +6 |
| S9-05 | `de857e6` | `ReminderService.runDailyDigest` + `@Cron` 7AM ICT + admin trigger | +4 |

**API unit tests**: **137 → 147 PASS** (+20 new specs this sprint; +20 since Sprint 8's 127)
**API typecheck**: clean · **Web typecheck**: clean · **Web build**: 16/16 pages, `/tutor` 8.66 kB
**Biome lint**: clean on all new pure-logic/service/module files
**Diff**: 22 files, +731 / −18

---

## New API surface

```
POST /tutor/chat        { question, topicTitle?, subject? }  -> { answer, model }   (authed)
POST /reminders/run     (admin only) trigger daily digest now -> { candidates, sent, skipped }
@Cron 07:00 Asia/Ho_Chi_Minh  ReminderService.handleDailyCron  (in-process)
```

FE: `/tutor` now calls the BE (was a pure local mock); typewriter reveal kept.

---

## Decisions I made unilaterally (Quân check)

- **Tutor is stateless** (no conversation persistence) → no new DB model, no
  migration. Conversation history can be a later sprint.
- **Tutor bypasses AiRoutingService.generate** and uses a new `chat()` method
  that does NOT write `AiUsageLog`, because the `AiOperation` Prisma enum has no
  `tutor_chat` value and adding one needs a migration (no DB/Docker tonight).
  Quota is still enforced + decremented. **Follow-up**: a migration sprint should
  add `tutor_chat` to `AiOperation` and log tutor usage in `chat()`.
- **No true SSE streaming** — browser `EventSource` can't send the Bearer header
  this app uses. BE returns the full answer; FE types it out. Real server-push
  needs cookie-auth or a fetch-ReadableStream client (future).
- **Reminders via `@nestjs/schedule` `@Cron`**, not BullMQ — BullMQ needs Redis
  which isn't available (no Docker). `ScheduleModule` runs in-process, no Redis.
- **Reminder selection**: only users with `preferences.reminderEnabled` AND ≥1
  due card get an email (no "0 cards" noise). Digest lists top-5 decks most-due
  first, "+N bộ khác" for the rest.
- **`POST /reminders/run` is admin-only** (tier/role === 'admin') — a manual/ops
  trigger so you can verify the digest without waiting for 7AM.

---

## ⚠️ Verification limits this session (honest)

- **No Docker → no Postgres/Redis** → could NOT run: live cron, the SSE/HTTP
  endpoints end-to-end, BE-with-real-DB, or Playwright e2e.
- What IS verified: all new **pure logic + services** via vitest (mocked Prisma/
  AI/email), full **API typecheck**, **web typecheck + next build**. The thin
  controller wiring + the `@Cron` decorator are unverified-by-test (follow
  existing patterns; compile clean).

## Morning smoke test (when BE + DB are up)

```
# Tutor (works in NIGHT_SHIFT_MODE with mock answers):
/tutor → ask anything → mock VI answer types out. Set NIGHT_SHIFT_MODE=false +
real keys for actual answers.

# Reminders (needs an admin user + some due cards):
POST /reminders/run  (as admin) → check API logs for "[EMAIL MOCK] to=… subject=…"
                                  and the {candidates, sent, skipped} response.
```

---

## Tech debt / follow-ups

| ID | Item | Note |
|----|------|------|
| NEW | Add `tutor_chat` to `AiOperation` enum + log tutor usage | needs a migration |
| NEW | True tutor streaming (fetch-stream or cookie-auth SSE) | UX nicety |
| NEW | ResendEmailAdapter (swap MockEmailAdapter) | needs PH-005 key |
| NEW | FE: settings toggle already exists for reminders? verify wiring to prefs | — |
| TEC-04 | BE integration tests (testcontainers) | still blocked: no Docker |
| TEC-05 | JWT stateless auth | arch change, not attempted overnight |
| TEC-06 | FE mock-seed fallback cleanup | deferred |
| — | biome `unsafeParameterDecoratorsEnabled` config | still flagged, 1-line fix |

## Blocked (need Quân) — PENDING_HUMAN.md unchanged

Google OAuth, Gemini key, R2, **Resend (PH-005 — now needed for real reminder email)**,
Sentry, hosting, domain, trademark, real-user validation. None touched tonight.

---

## What I did NOT do

- ❌ No push to `origin` / no merge to `main` · ❌ No deploy · ❌ No migrations applied
- ❌ No paid AI calls (MockAiAdapter) · ❌ No real emails (MockEmailAdapter logs)
- ❌ No new dependencies (all needed libs already in package.json)
- ❌ Did not add the `tutor_chat` enum value (would need a migration — flagged)

---

## 🧠 Context Checkpoint

- Estimate context: 🟠 **~70%** — this continues a long session (Sprint 8 + FE PR
  + Sprint 9). Several modules added.
- State captured in: this report + `NIGHT_SHIFT_LOG.md` + 5 commit messages +
  CHANGELOG `[Unreleased]` Sprint 9 section.
- **Recommendation**: `/compact` before the next task, then:
  ```
  Đọc NIGHT_SHIFT_REPORT.md + NIGHT_SHIFT_LOG.md. Sprint 9 (5 commits) trên
  branch night-shift/sprint-9-20260601, 147/147 API tests, web build OK, chưa push.
  Việc: review + merge (PR như Sprint 8); follow-up: enum tutor_chat + migration,
  ResendEmailAdapter (PH-005), true tutor streaming.
  ```

---

_Generated by night-shift skill @ 2026-06-01 ~11:20 local time. Awaiting Quân's review._
