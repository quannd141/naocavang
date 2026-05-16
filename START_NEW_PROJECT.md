# 🚀 START NEW PROJECT — Khởi tạo dự án mới với QAgenSkill

> Từ ý tưởng (hoặc folder trống) → Sprint 1 sẵn sàng code.
> Tổng thời gian: **2-6 giờ** (solo nhanh hơn, agency dài hơn vì phải interview khách).

---

## ⚡ TL;DR — 30 giây

```bash
# 1. Tạo folder dự án mới
mkdir my-project && cd my-project
git init && git checkout -b main

# 2. Bootstrap từ QAgenSkill starter
bash /path/to/QAgenSkill/starter/install.sh
# (Windows: pwsh /path/to/QAgenSkill/starter/install.ps1)

# 3. Mở Claude Code và gõ:
/project-kickoff
```

Phần còn lại của file là **chi tiết từng bước** + decision tree solo vs agency.

---

## 📍 Bạn đang ở đâu?

```
Có ý tưởng?
│
├── ❓ Chưa rõ scope, chưa đặt tên (slides/mockup/note rời rạc)
│       └─► Bắt đầu từ STEP 0: Ideation (~30 phút)
│
├── ✅ Đã rõ scope + tên dự án
│       └─► Bắt đầu từ STEP 1: Folder + git
│
└── 🔄 Đã có code dự án cũ
        └─► Đọc USAGE.md (file này không dành cho bạn)
```

---

## STEP 0 — Ideation (chỉ khi chưa rõ scope/tên)

**Khi nào**: bạn có pitch deck, mockup HTML, PDF tham khảo, note rời rạc — nhưng chưa biết gọi dự án là gì, chưa biết scope MVP nên cắt thế nào.

**Cách làm**:

```bash
# Tạo folder tạm chứa ý tưởng thô
mkdir -p /tmp/ideas/my-idea
# Copy slides/PDF/mockup vào đó
cp ~/Downloads/*.pdf /tmp/ideas/my-idea/

# Mở Claude Code ở SKILL repo (vì lúc này dự án chưa có folder)
cd /path/to/QAgenSkill
```

Trong Claude Code:

```
/project-ideation

Tôi có ý tưởng trong /tmp/ideas/my-idea/. Phân tích giúp, tư vấn đặt tên,
verdict xem đã đủ điều kiện vào /project-kickoff chưa.
```

**Output**:
1. Tóm tắt ý tưởng → confirm bạn hiểu đúng
2. Hỏi 3-5 câu clarify (target user, thị trường, tone thương hiệu)
3. Đề xuất **5-7 tên dự án** kèm pros/cons
4. **Readiness verdict**: ✅ đủ kickoff / ⚠️ cần brainstorm thêm / ❌ chưa sẵn sàng

Sau khi chốt tên → quay lại STEP 1 với tên đó.

---

## STEP 1 — Folder + git (5 phút)

```bash
# Tạo folder root
cd ~/projects     # hoặc folder bạn để code
mkdir my-project  # kebab-case
cd my-project

# Khởi tạo git
git init
git checkout -b main

# .gitignore cơ bản (sẽ được override khi install.sh chạy)
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.env.production
.env.night-shift
dist/
build/
__pycache__/
.venv/
EOF

git add .gitignore
git commit -m "chore: initial commit"
```

---

## STEP 2 — Bootstrap từ QAgenSkill starter (5 phút)

```bash
# Linux / macOS / Git Bash
bash /path/to/QAgenSkill/starter/install.sh

# Windows PowerShell
& "C:\path\to\QAgenSkill\starter\install.ps1"
```

Script sẽ hỏi 7-8 câu:
- Tên dự án (đã chốt từ Step 0 hoặc 1)
- Mô tả ngắn 1-2 câu
- Giai đoạn (MVP / Phase 2 / Maintenance)
- Frontend language + framework
- Backend language + framework
- Database

Sau đó copy `.claude/` + các `.md` template + replace `{{PLACEHOLDER}}` cụ thể.

**Verify**:
```bash
ls .claude/                          # phải có: skills, rules, runbooks, evals, settings.json
ls .claude/skills/ | wc -l            # phải >= 45
grep -c '{{' CLAUDE.md                 # phải = 0 (placeholder đã được fill)
```

Nếu còn `{{...}}` → mở CLAUDE.md và điền tay (ORM, monitoring, email, etc.).

**Commit baseline**:
```bash
git add .
git commit -m "chore: bootstrap with QAgenSkill v4.1"
```

---

## STEP 3 — Project kickoff 4-phase (2-4 giờ)

Trong Claude Code (ở folder dự án):

```
/project-kickoff

Tôi muốn xây dựng [LOẠI DỰ ÁN] cho [ĐỐI TƯỢNG SỬ DỤNG].

Mục tiêu chính:
- [mục tiêu 1]
- [mục tiêu 2]

Ràng buộc:
- Timeline: [VD: 3 tháng MVP]
- Team: [VD: 2 dev + 1 QA]
- Budget: [VD: VPS 8GB RAM]
- Đối tượng: [VD: 500 user nội bộ]

Yêu cầu đặc biệt:
- [VD: tích hợp ERP hiện có]
- [VD: GDPR compliance]
```

Skill `project-kickoff` chạy **4 phase tuần tự** (KHÔNG bỏ qua):

| Phase | Vai trò | Output | Thời gian |
|-------|---------|--------|-----------|
| 3.1 | PM | `docs/00-project-charter.md` — scope, timeline, milestone, rủi ro | 1 giờ |
| 3.2 | BA Discovery | `docs/discovery/*.md` — stakeholder, interview, As-Is/To-Be flow, opportunities | 2-3 giờ (solo: 1 giờ) |
| 3.3 | BA Documentation | `docs/requirements/BRD-v1.0.md` (khách ký) + `SRS-v1.0.md` (dev build) | 1-2 giờ |
| 3.4 | Tech Lead | `docs/02-tech-decision.md` + `docs/adr/001-*.md` + sprint plan | 1-2 giờ |

**Handoff gate giữa các phase**:
- 3.3 → 3.4: ⏸️ Sponsor sign BRD (skip nếu solo own product)
- 3.4 → Sprint 1: ⏸️ Tech review SRS

> Xem chi tiết flow trong [AGENTS.md](AGENTS.md).

---

## STEP 4 — Sprint 0 setup (1 giờ)

Sau khi có Tech Decision (3.4) — **3 việc song song**:

### 4.1 Scaffold tech stack (theo Tech Decision)

Ví dụ Next.js + NestJS monorepo:
```bash
mkdir -p apps/web apps/api packages/shared-types
# Hoặc: npx create-turbo@latest, pnpm init -y workspace, etc.
```

### 4.2 Observability — KHÔNG đợi Sprint 11

Trong Claude Code:
```
mở runbook .claude/runbooks/observability-setup/SKILL.md
```

Setup:
- Sentry DSN (dev + prod)
- Pino logger với redact secret
- `GET /health` endpoint trả status DB/Redis
- Better Stack uptime (sau khi có domain)

> Lý do: prod gãy không có observability = mò mẫm. 1 giờ Sprint 0 = tiết kiệm 10 giờ debug Sprint 5.

### 4.3 CI/CD

```
gọi skill ci-cd
```

Setup:
- `.github/workflows/ci.yml` (lint + test + build)
- Branch protection main
- Preview deploy per PR (Vercel/Railway)

---

## STEP 5 — Sprint 1 ready check

Verify checklist trước khi viết line code đầu tiên:

- [ ] CLAUDE.md không còn `{{...}}`
- [ ] `docs/requirements/SRS-v1.0.md` đã có (tech-reviewed)
- [ ] Sprint 1 backlog ≥ 5 user stories có AC (Given-When-Then)
- [ ] CI pipeline xanh trên commit baseline
- [ ] `curl http://localhost:3001/health` trả `{status: "ok"}`
- [ ] Sentry test event capture được
- [ ] `PENDING_HUMAN.md` liệt kê việc user tự làm tay (API key đăng ký, OAuth setup, domain mua)

✅ All pass? → Start Sprint 1:

```
gọi skill senior-developer

Implement user story US-001 (đăng ký user). Đọc SRS section FR-001 trước.
```

❌ Còn thiếu? Quay lại fix trước khi bắt đầu code.

---

## 🎯 Decision Tree — Solo vs Agency

| Tình huống | Adjustments cho STEP 3 |
|-----------|------------------------|
| **Solo own product** | 3.2 nén còn 1 giờ (interview 3-5 friend/Twitter); 3.3 BRD = vision doc 2 trang, không có sponsor sign |
| **Client work < 50M VND** | Skip ADR formal; BRD light; focus speed; gate handoff bằng tin nhắn xác nhận thay vì chữ ký giấy |
| **Client work > 200M VND** | Full process; BRD chữ ký digital/giấy; ADR đầy đủ; gate handoff = meeting có ghi biên bản |
| **Internal tool công ty** | Skip 3.2 (stakeholder = đồng nghiệp, biết rồi); 3.3 chỉ cần SRS |

---

## 🚨 Common pitfalls

1. **"Tôi hiểu user rồi, skip Discovery"** → 90% case sau Sprint 5 mới nhận ra hiểu sai → rebuild tốn 2-3× thời gian
2. **"Setup observability sau khi xong feature"** → khi prod gãy không biết tại sao, debug 5 giờ
3. **"BRD viết qua loa, dev đọc SRS là đủ"** → khách demo: "không phải cái tôi muốn" → rework
4. **"CI/CD setup lúc gần launch"** → 100% bug tích lũy đến lúc đó, không refactor được
5. **"Copy starter cũ"** — `starter/` có thể stale. Sync mới nhất từ QAgenSkill:
   ```bash
   cd /path/to/QAgenSkill && git pull
   bash starter/install.sh   # vào folder dự án mới
   ```
6. **`{{PLACEHOLDER}}` còn sót trong CLAUDE.md** → AI bối rối "dùng X hay Y" → output không nhất quán

---

## 📁 Project structure sau Day 1

```
my-project/
├── .claude/
│   ├── skills/         # 45 skill (synced từ QAgenSkill)
│   ├── runbooks/       # 5 runbook (deploy, incident, ...)
│   ├── evals/          # Golden examples (regression test skill)
│   ├── rules/          # 4 rules: architecture, coding-style, testing, autonomous-mode
│   └── settings.json
├── apps/               # apps/web (FE) + apps/api (BE) — nếu monorepo
├── packages/           # shared types, utils
├── docs/
│   ├── 00-project-charter.md       # PM
│   ├── discovery/                  # BA discovery (5 file)
│   ├── requirements/
│   │   ├── BRD-v1.0.md             # Khách ký
│   │   ├── SRS-v1.0.md             # Dev build
│   │   └── signed/                 # PDFs đã ký
│   ├── adr/
│   │   └── 001-tech-stack.md
│   ├── 02-tech-decision.md
│   └── sprint-plan.md
├── .github/workflows/  # CI/CD
├── docker/             # docker-compose.yml
├── CLAUDE.md           # Đã fill placeholder cho dự án này
├── AGENTS.md
├── TEAM.md
├── USAGE.md            # Cheatsheet daily work
├── CHANGELOG.md
├── PENDING_HUMAN.md    # User tự làm tay
├── README.md
└── .gitignore
```

---

## 🆘 Khi stuck

| Vấn đề | Làm gì |
|--------|--------|
| Không biết next step | Mở Claude → `/context-loader` |
| BA cần clarification | Gọi `business-analyst` skill |
| Requirement đổi giữa chừng | Tạo Change Request `docs/CR-NNN.md` qua `requirements-documentation` skill |
| API key cần đăng ký | Ghi vào `PENDING_HUMAN.md` priority 🔴 |
| Production gãy | Mở runbook `.claude/runbooks/incident-response/SKILL.md` |
| Skill không hoạt động đúng | Chạy eval: `bash scripts/run-evals.sh <skill>` |

---

**Quân Nguyễn** — *Day 1 setup right, Day 100 ship faster.*
Phiên bản: 2.0 (đồng bộ với QAgenSkill v4.1) | Cập nhật: 2026-05-13
