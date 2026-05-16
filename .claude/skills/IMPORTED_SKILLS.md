# Imported Skills — Quân Nguyễn (Curated)

> **v4.0.0-rc.1 (2026-05-13)**: Tách 5 runbook ra `.claude/runbooks/` để phân biệt "AI capability" vs "human checklist". Skills/ giờ chỉ chứa capability auto-discoverable.
>
> **v3.0 (2026-05-03)**: Cắt từ 925 → 50 skill sau audit. 875 chuyển `.claude/skills-archive/`.

Tài liệu này ghi lại bộ skill được giữ lại sau audit + nguồn gốc.

---

## 📊 Tổng quan

| Nhóm | Số lượng | Ghi chú |
|------|---------|---------|
| Custom skills | 23 | Tự xây, VI — capability auto-discoverable |
| Custom runbooks | 5 | `.claude/runbooks/` — checklist human follow |
| obra/superpowers | 8 | MIT, EN, workflow methodology |
| anthropic/skills | 8 | Apache 2.0, EN, tooling |
| Productivity (community) | 4 | Mixed license |
| Design | 1 | UI/UX comprehensive |
| Reference (image) | 1 | Composio MIT |
| **Tổng cộng** | **50** | (45 skill + 5 runbook) |
| Archive | 875 | Trong `.claude/skills-archive/`, có thể restore |

---

## 🟦 Custom skills (23) — auto-discoverable AI capabilities

### Roles (6)
- `project-manager` — PM
- `business-analyst` — BA
- `tech-lead` — Tech Lead / Architect
- `senior-developer` — Senior Dev
- `qa-tester` — QA Engineer
- `devops-engineer` — DevOps

### Project Lifecycle (5)
- `project-ideation` — Phase 0: ý tưởng → tên dự án
- `project-kickoff` — PM→BA→TechLead khởi tạo
- `context-loader` — Load context dự án đang chạy
- `context-checkpoint` — Proactive /compact >50%
- `sprint-end-review` — Sprint review 3-gate

### Autonomous (2)
- `night-shift` — Auto build qua đêm (mock mode)
- `human-in-the-loop` — PENDING_HUMAN.md khi block

### Quality (5)
- `code-review`, `security-audit`, `performance-optimization`, `refactoring`, `error-handling`

### Dev Practices (5)
- `tdd`, `frontend-design`, `ci-cd`, `database-migration`, `pr-description`

---

## 📕 Custom runbooks (5) — `.claude/runbooks/` — human checklists, NOT auto-discoverable

> **v4.0 đổi**: 5 mục dưới đây trước v4.0 ở `.claude/skills/`. Tách ra vì chúng là **playbook con người follow** (deploy ngày X, prod gãy lúc Y), không phải capability AI tự execute. Xem `.claude/runbooks/README.md`.

- `deployment-pipeline` — Master 5-phase deploy runbook (mỗi lần deploy)
- `database-migration-safety` — Expand-contract pattern, rollback SQL (release có migration)
- `production-readiness-audit` — 50-item checklist trước launch (1 lần)
- `incident-response` — Triage P0-P3 + postmortem template (khi prod gãy)
- `observability-setup` — Sentry + Better Stack + alerts setup (Sprint 0-1)

---

## 🟩 obra/superpowers (8)

- Repo: https://github.com/obra/superpowers
- License: MIT (© 2025 Jesse Vincent)

- `brainstorming` — Khám phá intent trước khi build
- `systematic-debugging` — Methodology debug có cấu trúc
- `writing-plans` — Plan trước multi-step task
- `executing-plans` — Execute plan với checkpoint
- `verification-before-completion` — Verify trước khi claim done
- `using-git-worktrees` — Worktree isolation
- `dispatching-parallel-agents` — Parallel agent dispatch
- `subagent-driven-development` — Subagent execution

---

## 🟨 anthropic/skills (8)

- Repo: https://github.com/anthropics/skills
- License: Apache 2.0

### Tooling
- `skill-creator` — Tạo skill mới
- `mcp-builder` — Build MCP server
- `claude-api` — Claude API/SDK reference
- `webapp-testing` — Playwright E2E

### File formats
- `docx`, `pdf`, `xlsx`, `pptx`

---

## 🟪 Productivity (4)

- `changelog-generator` — Auto changelog từ git commits (Composio, MIT)
- `domain-name-brainstormer` — Domain name + availability check (Composio, MIT)
- `image-enhancer` — Enhance/upscale images (Composio, MIT)
- `ui-ux-pro-max` ⭐ — Design intelligence cho 10 stack (Next Level Builder, MIT)

---

## 🗄️ Archive (875 skill trong `.claude/skills-archive/`)

### Lý do archive

| Nhóm | Số | Lý do |
|------|----|----|
| `*-automation` (Composio) | 832 | Cần Composio platform account, không có = dead weight |
| `composio-*` duplicates | 9 | Trùng tên với Anthropic skill, đã có bản gốc |
| `connect-*` | 3 | Composio infra, không có account thì không dùng |
| Design duplicate | 14 | `brand`, `design`, `design-system`, `ui-styling`, `brand-guidelines`, `anthropic-frontend-design`, `theme-factory`, `canvas-design`, `banner-design`, `slides`, `slack-gif-creator`, `web-artifacts-builder`, `algorithmic-art`, `internal-comms` → đã có `frontend-design` + `ui-ux-pro-max` |
| Workflow duplicate | 5 | `test-driven-development` (có `tdd`), `requesting-code-review`, `receiving-code-review`, `finishing-a-development-branch` (có `code-review`+`pr-description`), `template-skill` (có `skill-creator`) |
| Meta skill | 2 | `using-superpowers`, `writing-skills` (ít dùng) |
| Marketing/Sales/HR | 7 | `tailored-resume-generator`, `twitter-algorithm-optimizer`, `competitive-ads-extractor`, `content-research-writer`, `lead-research-assistant`, `meeting-insights-analyzer`, `developer-growth-analysis` |
| Linh tinh | 6 | `raffle-winner-picker`, `invoice-organizer`, `video-downloader`, `file-organizer`, `langsmith-fetch`, `skill-share` |
| Doc utility | 1 | `doc-coauthoring` (niche) |

### Khi cần restore 1 skill

```bash
# Ví dụ cần dùng lại slack-gif-creator:
mv ".claude/skills-archive/slack-gif-creator" ".claude/skills/"
```

5 giây, không phá structure.

### Khi cần restore tất cả (rollback v3.0)

```bash
mv .claude/skills-archive/*/ .claude/skills/
```

---

## 🔄 Cách cập nhật khi có phiên bản mới

```bash
# Clone bản mới
git clone --depth=1 https://github.com/anthropics/skills.git /tmp/anth
git clone --depth=1 https://github.com/obra/superpowers.git /tmp/obra

# Diff trước khi ghi đè
diff -r /tmp/anth/skills/<skill-name> .claude/skills/<skill-name>
```

## License compliance

- Giữ nguyên `LICENSE.txt` / `NOTICE` trong mỗi skill folder.
- Khi modify skill bên thứ ba → ghi changes trong SKILL.md.

---

## Changelog

### v4.0.0-rc.1 (2026-05-13)
- 📂 Tách `.claude/runbooks/` khỏi `.claude/skills/` — 5 mục (deployment-pipeline, database-migration-safety, production-readiness-audit, incident-response, observability-setup)
- 📝 Lý do: runbook = human checklist (mở khi cần), skill = AI capability (auto-discoverable). Trộn chung làm mờ ranh giới.
- 🔁 Skills counter: 28 custom → 23 custom + 5 runbook (total vẫn 50)

### v3.0 (2026-05-03)
- ✂️ Cắt 925 → 50 skill sau audit (875 archive)
- ➕ Thêm 5 DevOps skill mới (deployment-pipeline, database-migration-safety, production-readiness-audit, incident-response, observability-setup)
- 🔧 Enhance `devops-engineer` + `ci-cd` link đến skill mới
- 📁 Tạo `.claude/skills-archive/` cho rollback an toàn

### v2.9 (trước đó)
- Import full 832 composio-skills + 9 duplicates + 10 niche
- Tổng 925 skill → quá noise, không discovery được

### v2.0 (trước đó)
- Import từ anthropics/skills (17), obra/superpowers (14), ui-ux-pro-max (7), awesome-claude (10)
