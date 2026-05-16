# CHANGELOG — nao-ca-vang

Lịch sử thay đổi của dự án. Format theo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
