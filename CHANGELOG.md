# CHANGELOG — nao-ca-vang

Lịch sử thay đổi của dự án. Format theo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

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
