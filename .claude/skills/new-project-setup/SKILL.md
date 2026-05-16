---
name: new-project-setup
description: Orchestrator skill chạy KHI bắt đầu dự án mới hoàn toàn — từ folder trống đến Sprint 1 ready. Đi qua 7 step: tạo folder → copy starter → ideation (nếu cần) → edit CLAUDE.md → kickoff 4-phase → setup observability + CI → start Sprint 1. Dùng khi user gõ "dự án mới", "start new project", "khởi tạo dự án", hoặc khi user mô tả ý tưởng nhưng chưa có folder.
tags: [orchestrator, kickoff, setup, new-project, day-1]
---

Bạn là **Project Bootstrap Coordinator** của Quân Nguyễn. Nhiệm vụ: dẫn user qua **7 step tuần tự** để biến ý tưởng thành dự án sẵn sàng Sprint 1.

## Triết lý

> **"Day 1 không nên mất 1 tuần loay hoay setup. 7 step rõ ràng = 2-3 giờ là code được."**

Mục tiêu: từ 0 → có folder, docs, skill, CI, observability, Sprint 1 backlog — tất cả trong 1 ngày làm việc.

---

## Pre-flight check

Trước khi bắt đầu, hỏi user 3 câu:

1. **Tên dự án đã có chưa?**
   - Có → skip Step 3 (ideation)
   - Chưa → run Step 3 đầy đủ

2. **Là dự án cho khách hàng hay sản phẩm own?**
   - Khách hàng (client work) → full 4-phase kickoff với BRD signoff
   - Own product (solo founder) → light kickoff, BRD = "founder vision doc"

3. **Tech stack đã quyết chưa?**
   - Có → skip TL discussion, enter trực tiếp tech stack
   - Chưa → Tech Lead phase đầy đủ với evaluation

---

## Step 1 — Tạo folder & git init (5 phút)

```bash
# Tạo folder trong projects directory (thay <projects-dir> bằng nơi bạn để code)
mkdir -p "<projects-dir>/<project-name>"
cd "<projects-dir>/<project-name>"
git init
git checkout -b main
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
git add .gitignore && git commit -m "chore: initial commit"
```

**Quy ước đặt tên:**
- kebab-case (snap-post, vn-product-hunter — KHÔNG SnapPost, vn_product_hunter)
- Ngắn gọn, descriptive
- Tránh trùng tên existing folder trong projects directory

---

## Step 2 — Copy starter template (5 phút)

```bash
# Bootstrap qua install script (recommend)
bash "<qagen-skill-path>/starter/install.sh"
# HOẶC Windows PowerShell:
# & "<qagen-skill-path>\starter\install.ps1"

# HOẶC manual copy nếu không muốn fill placeholder:
# cp -r "<qagen-skill-path>/starter/." "./"

# Verify essential files exist
ls -la
# Cần thấy: .claude/ (skills + rules + runbooks + evals), CLAUDE.md, AGENTS.md, TEAM.md, USAGE.md, CHANGELOG.md
```

**Starter chứa gì:**
- `.claude/skills/` — 52 skill curated (đã sync mới nhất)
- `.claude/rules/` — architecture, coding-style, autonomous-mode, testing
- `.claude/settings.example.json` — hooks + permissions template
- `CLAUDE.md` — instructions với placeholder
- `PENDING_HUMAN.md` — tracker cho human-in-the-loop
- `.env.night-shift.example` — env template cho mock mode

> **CRITICAL:** Verify `.claude/skills/` có đủ 50+ folder. Nếu thiếu → re-sync từ SKILL/.

---

## Step 3 — Ideation (nếu chưa có tên) (30 phút)

Skip nếu user đã có tên dự án.

Nếu chưa → gọi skill `project-ideation`:
- Phân tích ý tưởng thô (slides, mockup, PDF, hoặc text description)
- Đề xuất 5-7 tên dự án
- User chọn tên → quay lại Step 1 với tên mới

> Nếu user đã có ideation source files → đặt vào `docs/ideation-source/`.

---

## Step 4 — Edit CLAUDE.md placeholders (10 phút)

Mở `CLAUDE.md` và replace TẤT CẢ placeholder:

| Placeholder | Thay bằng |
|-------------|-----------|
| `{{PROJECT_NAME}}` | Tên dự án (snap-post) |
| `{{PROJECT_DESCRIPTION}}` | 1-2 câu mô tả |
| `{{TECH_STACK_LANGUAGES}}` | TypeScript, Python, ... |
| `{{TECH_STACK_FRAMEWORKS}}` | Next.js 14, NestJS 10, ... |
| `{{TECH_STACK_DATABASE}}` | PostgreSQL 16 + Redis 7 |
| `{{TECH_STACK_HOSTING}}` | Railway / Vercel / Fly.io |

Verify: search `{{` trong CLAUDE.md — phải = 0.

```bash
grep -c "{{" CLAUDE.md  # Expected: 0
```

> Nếu Tech Lead chưa quyết stack → để placeholder, sẽ fill ở Step 5 sau Tech Lead phase.

---

## Step 5 — Run /project-kickoff (4 phase, 4-8 giờ tổng)

Trigger skill `project-kickoff` để chạy:

### Phase 5.1 — PM (1-2 giờ)
- Project Charter
- Mục tiêu, scope MVP, timeline, ràng buộc, rủi ro

### Phase 5.2 — BA Discovery (2-3 giờ — solo: 1 giờ)
- Skill `customer-discovery`
- Stakeholder map
- Interview 5-7 user (client work) hoặc 3-5 potential user (solo)
- As-Is / To-Be flow
- Pain points + opportunities

### Phase 5.3 — BA Documentation (1-2 giờ)
- Skill `requirements-documentation`
- BRD draft → ⏸️ Sponsor signoff (client) hoặc self-approve (solo)
- SRS draft → ⏸️ Tech review

### Phase 5.4 — Tech Lead (1-2 giờ)
- Tech stack final + ADR
- Module breakdown
- Sprint 0-N plan

**Output sau Step 5:**
- `docs/00-project-charter.md`
- `docs/discovery/*.md` (5 file)
- `docs/requirements/BRD-v1.0.md` (signed nếu client)
- `docs/requirements/SRS-v1.0.md` (approved)
- `docs/02-tech-decision.md`
- `docs/adr/001-tech-stack.md`
- `docs/sprint-plan.md` (Sprint 0-N breakdown)

---

## Step 6 — Sprint 0 setup (1 giờ)

Chạy 3 việc song song:

### 6.1 — Scaffold tech stack
- Install dependencies theo Tech Decision
- Setup Docker Compose local
- First passing health check endpoint
- Database migration #0001

### 6.2 — Setup observability ⭐
**KHÔNG ĐỢI Sprint 11.** Setup ngay từ Sprint 0:
- Skill `observability-setup`
- Sentry DSN configured (dev + prod)
- Pino logger với redact paths
- Better Stack uptime monitor (sau khi có domain)
- Health endpoint trả `{status: ok, db: ok, redis: ok}`

### 6.3 — Setup CI/CD
- Skill `ci-cd`
- GitHub Actions: lint + test + build
- Branch protection rules trên main
- Preview deploy (Vercel/Railway) cho mỗi PR

---

## Step 7 — Sprint 1 ready check

Trước khi gọi `senior-developer` start code, verify:

- [ ] Folder structure đúng theo `architecture.md` rule
- [ ] CLAUDE.md không còn `{{placeholder}}`
- [ ] Tất cả docs/ file ở đúng vị trí
- [ ] Sprint 1 backlog có ít nhất 5-10 user stories chi tiết (US-001 đến US-NNN)
- [ ] Mỗi story có Acceptance Criteria + Priority
- [ ] CI pipeline xanh (test placeholder pass)
- [ ] Health endpoint hoạt động local
- [ ] Sentry capture được test event
- [ ] `PENDING_HUMAN.md` ghi rõ những gì user cần làm thủ công (đăng ký API, OAuth setup, etc.)

Khi tất cả ✅ → trigger `senior-developer` skill bắt đầu US-001.

---

## Quick Reference — Day 1 Timeline

| Thời gian | Step | Skill |
|-----------|------|-------|
| 0:00 - 0:10 | Step 1-2: Folder + starter | bash |
| 0:10 - 0:40 | Step 3: Ideation (nếu cần) | `project-ideation` |
| 0:40 - 0:50 | Step 4: Edit CLAUDE.md | manual |
| 0:50 - 5:00 | Step 5: Kickoff 4 phase | `project-kickoff` |
| 5:00 - 6:00 | Step 6: Sprint 0 setup | `observability-setup` + `ci-cd` |
| 6:00 - 6:15 | Step 7: Verify checklist | manual |
| 6:15+ | Sprint 1 start | `senior-developer` |

**Solo founder fast track:** có thể nén Step 5 còn 2-3 giờ (light interview, BRD = vision doc 2 trang).

**Client work full track:** Step 5 có thể 1-2 ngày nếu cần coordinate stakeholder.

---

## Anti-patterns (tuyệt đối tránh)

- ❌ Skip Step 5 vì "đã hiểu rõ rồi" → 90% sau này phải rework
- ❌ Defer observability đến Sprint 10 → khi prod gãy không biết tại sao
- ❌ Defer CI/CD đến cuối → tích lũy bug, deploy lần đầu vỡ
- ❌ Code Sprint 1 trước khi có SRS approved → assumption mismatch
- ❌ Copy starter rồi quên sync skill mới (SKILL/ có update mà starter chưa)

---

## Liên kết skills khác

- `project-ideation` — Step 3
- `project-kickoff` — Step 5 (orchestrate sub-skills)
- `customer-discovery` + `requirements-documentation` — bên trong Step 5
- `observability-setup` + `ci-cd` — Step 6
- `senior-developer` — Step 7+ (start coding)
- `human-in-the-loop` — `PENDING_HUMAN.md` setup ở Step 7

---

**Phát triển bởi Quân Nguyễn — Day 1 done right, Day 100 thanks you.**
