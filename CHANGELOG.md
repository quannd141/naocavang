# CHANGELOG — nao-ca-vang

Lịch sử thay đổi của dự án. Format theo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Sprint 10 — Legal & go-live prep (2026-06-01, night-shift)

> Branch `night-shift/sprint-10-20260601`. FE/content-focused; verified by web
> typecheck + next build (18 pages) + 6 consent unit tests.

#### Added
- **Trang pháp lý** `/privacy` + `/terms` (nội dung tiếng Việt, tham chiếu Nghị
  định 13/2023/NĐ-CP) qua `LegalShell` — kèm banner "bản nháp, cần luật sư rà
  soát". Footer trước đó link 404, nay đã resolve. (S10-01)
- **Cookie consent banner** + helper `lib/consent.ts` (versioned, SSR-safe,
  localStorage) mounted ở root layout. (S10-02)
- **`apps/web/vitest.config.ts`** — giới hạn unit test trong `src/`, loại trừ
  `e2e/**` (trước đó `pnpm --filter web test` fail vì quét nhầm Playwright specs).
- Footer: link **"Thư viện công khai"** → `/public/mindmaps`. (S10-03)

#### Notes / deferred
- ⚠️ Privacy/ToS là **bản nháp** — cần luật sư rà soát trước launch (PENDING_HUMAN PH-011).

### Sprint 9 — AI Tutor + study reminders (2026-06-01, night-shift)

> Branch `night-shift/sprint-9-20260601`. Mock-first, local-only. API unit
> tests 137 → **147 pass**; web typecheck + build green.

#### Added
- **AI Tutor "Cá Vàng GPT"** — `POST /tutor/chat` (stateless) trả lời câu hỏi
  học tập, có thể kèm ngữ cảnh mind map. FE `/tutor` đã nối BE thật, giữ hiệu
  ứng gõ chữ (typewriter), fallback mock khi BE offline. (S9-01..03)
- **Daily reminder digest** — `ReminderService.runDailyDigest` + `@Cron` 07:00
  giờ VN (in-process, không cần Redis): chọn user bật nhắc nhở + có thẻ đến hạn,
  gửi email tóm tắt theo bộ thẻ. `POST /reminders/run` (admin) để chạy thủ công. (S9-04..05)
- **EmailPort + MockEmailAdapter** (log thay vì gửi thật cho tới khi có key — PH-005).

#### Notes / deferred
- Tutor dùng MockAiAdapter (mock-mode); usage chưa ghi `AiUsageLog` (enum
  `AiOperation` chưa có `tutor_chat` — cần migration sau) nhưng vẫn trừ quota.
- True server-push streaming hoãn lại (EventSource không gửi được Bearer header).

### Sprint 8 — Public gallery + learning analytics (2026-05-29, night-shift)

> Trên branch `night-shift/sprint-8-20260529`. Toàn bộ BE, pure-logic, phủ
> unit test (vitest + mock Prisma). API unit tests: 104 → **127 pass**.

#### Added
- **Public mindmap gallery** — `GET /public/mindmaps` (no auth) liệt kê mind
  map `isPublic` mới nhất, kèm `authorName`, hỗ trợ `?subject=` và `?limit=`
  (clamp [1,50], mặc định 20). (S8-01)
- **Daily review activity** — `GET /users/me/activity?days=N` (max 90, mặc
  định 30) trả buckets review theo ngày + tổng, phục vụ heatmap dashboard. (S8-02)
- **Quiz attempt summary** — `GET /quizzes/:id/attempts` thêm `meta`
  (count, bestScore, avgScore, lastScore); `data` giữ nguyên (không phá FE). (S8-03)
- **Flashcard due-forecast** — `GET /flashcards/forecast?days=N` (max 30, mặc
  định 7) trả buckets thẻ đến hạn N ngày tới + `overdue`. (S8-04)

#### Removed
- Bỏ stub chết `GET /mindmaps/public/list` (trả mảng rỗng hardcode) — thay
  bằng endpoint public gallery thật ở trên.

---

## [0.1.0] - 2026-05-16

### Added
- Khởi tạo dự án nao-ca-vang từ **Quân Nguyễn Agent System Starter** v1.0 (base 2.3).
- Bộ AI Agent: CLAUDE.md, AGENTS.md, TEAM.md, USAGE.md.
- `.claude/rules/`: architecture, coding-style, testing.
- `.claude/skills/`: 51 skill (21 Quân Nguyễn + 14 obra/superpowers + 17 anthropics/skills — xem `.claude/skills/IMPORTED_SKILLS.md`).
- `.claude/settings.json`: hooks cho Agent Router, coding standards check, Bash safety, post-save reminder.

---

## Hướng dẫn Cập nhật CHANGELOG

Khi có thay đổi lớn, tạo section mới theo format:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added    ← Thêm mới
### Fixed    ← Sửa lỗi
### Changed  ← Thay đổi behavior
### Removed  ← Xóa bỏ
### Deprecated ← Sắp bị xóa
```
