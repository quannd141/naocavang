# CLAUDE.md - Hướng dẫn cho AI Agents (Quân Nguyễn)

## 📋 Bối cảnh dự án (ĐỌC TRƯỚC TIÊN)

> **Trạng thái**: Đã hoàn thành `/project-ideation` ngày 2026-05-16. **KHÔNG hỏi lại user** các thông tin dưới đây — đã chốt rồi. Chỉ tiến vào phần chưa biết (architecture chi tiết, tech stack, timeline, sprint plan...).

### Tên & one-liner
- **Tên**: NãoCáVàng (`nao-ca-vang`)
- **Tagline**: "Học một lần, nhớ cả đời"
- **One-liner**: Nền tảng học bằng AI all-in-one cho người học VN — biến text/PDF/slide thành **mind map + flashcard + quiz + AI tutor + summary** trong 1 platform. Brand viral từ meme VN "trí nhớ não cá vàng".

### Reference & cảm hứng
[heuristi.ca](https://www.heuristi.ca/) — All-in-one AI learning (Concept Map + Flashcard + Quiz + AI Chat + Summarizer), EN-only, 75k+ users.

### Target user (BROAD — chấp nhận trade-off PMF, BA Discovery sẽ narrow)
- Học sinh THPT (3 triệu)
- Sinh viên ĐH (2 triệu)
- Người ôn chứng chỉ (IELTS/TOEIC/HSK)
- Researcher / chuyên nghiệp
- Lifelong learner

### Pain points
1. Tổ chức kiến thức phức tạp tốn thời gian (đọc → tóm tắt → ghi chú)
2. Tự tạo flashcard/quiz thủ công lâu, đa số bỏ giữa chừng
3. Không biết spaced repetition → kiến thức trôi
4. Công cụ rời rạc (Anki + Quizlet + ChatGPT + Notion) — phải dùng 4-5 tool
5. AI tool global EN-only, không hiểu curriculum VN

### USP (3 điểm khác biệt)
1. **All-in-one tiếng Việt** — 5 module trong 1 platform, input/output VI, hiểu curriculum VN
2. **Brand viral** — meme "não cá vàng" có sẵn trong văn hoá VN, marketing chi phí thấp
3. **Giá Việt** — 49-149k/tháng + free tier dùng được thật

### Scope MVP (đã chốt — KHÔNG cần PM hỏi lại)
| ID | Feature | Priority |
|----|---------|----------|
| F1 | Text paste → AI parse | P0 |
| F2 | AI Flashcard + Spaced Repetition | P0 |
| F3 | AI Quiz generator | P0 |
| F4 | Mind Map auto | P0 |
| F5 | AI Chat tutor | P0 |
| F6 | PDF upload | P1 |
| F7 | Slide PPT/PDF upload | P2 |
| F8 | YouTube link | P3 |

### Brand
- Tông: Trẻ trung - vui - viral (Cake/Duolingo style)
- Ngôn ngữ: Tiếng Việt thuần
- Persona đầu tiên thấy tên: cả B2C (HS/SV tự dùng) + B2B2C (trường/giáo viên)

### Đã chốt
- ✅ Tên + tagline
- ✅ Target user (broad, sẽ narrow ở BA Discovery)
- ✅ USP + competitor positioning
- ✅ MVP feature list (F1-F8)
- ✅ Tông brand + ngôn ngữ

### ✅ Phase 1-4 hoàn thành (16/05/2026)
- ✅ **Project Charter** — Solo dev, 8 tuần, MVP Web, launch 15/07/2026, budget AI $50-100/tháng
- ✅ **BA Discovery** — 7 persona giả lập (3 HS + 3 SV + 1 IELTS) + 10 pain × 10 HMW
- ✅ **BRD-v1.0** — Approved (self-signed) — 7 features cốt lõi MVP
- ✅ **SRS-v1.0** — 25+ FR, NFR, ER diagram, 3 critical use cases chi tiết
- ✅ **Tech Decision** — Next.js + NestJS + PostgreSQL JSONB + React Flow + multi-AI routing
- ✅ **5 ADR** — stack, mindmap storage, monorepo, SM-2 SR, AI routing

### Vẫn TODO trước Sprint 1
- [ ] **Trademark check** (BẮT BUỘC trước launch): TM VN + domain naocavang.vn/.com + social handle (xem [VERIFY_LATER.md D-001, D-003](VERIFY_LATER.md))
- [ ] **Validate 3-5 user thật** (interview cháu/em họ HS + bạn SV) để xác nhận 7 persona giả lập
- [ ] **Setup project structure** (Sprint 1) — monorepo + Docker Compose + CI/CD
- [ ] Verify items trong [VERIFY_LATER.md](VERIFY_LATER.md)

> 📄 **Onboard mới?** Đọc theo thứ tự: Charter → Discovery 05-opportunities → BRD → SRS → TECH_DECISION → 5 ADR. Tổng ~30 phút.

---

## Giới thiệu về Công ty & Dự án
Chúng tôi là **Quân Nguyễn** – một công ty phần mềm chuyên nghiệp chuyên phát triển ứng dụng web/mobile, hệ thống doanh nghiệp và sản phẩm SaaS.
Mọi dự án đều tuân thủ quy trình phát triển chuyên nghiệp: Clean Code, TDD/BDD, Code Review nghiêm ngặt, CI/CD tự động và tài liệu đầy đủ.

**Mục tiêu chính khi làm việc với dự án này:**
- Viết code sạch, dễ bảo trì, dễ mở rộng (maintainable & scalable).
- Tuân thủ nghiêm ngặt coding standards và architecture đã định.
- Luôn ưu tiên chất lượng > tốc độ.
- Mọi thay đổi phải có test tương ứng (unit/integration nếu áp dụng).
- Không bao giờ commit code có lỗi hoặc không theo convention.

## ⚙️ Tech Stack Dự án — Não Cá Vàng MVP v0.1

> 📝 **Decided 2026-05-16** by Tech Lead agent. References: [TECH_DECISION.md](docs/tech/TECH_DECISION.md) + [docs/adr/](docs/adr/).

- **Frontend language**: TypeScript (strict mode)
- **Frontend framework**: Next.js 14 (App Router) + React 18
- **UI library**: shadcn/ui + Tailwind CSS
- **Mind map editor**: React Flow (xyflow) 12
- **Backend language**: TypeScript
- **Backend framework**: NestJS 10
- **Runtime**: Node.js 20 LTS
- **Primary database**: PostgreSQL 16
- **Cache + Queue**: Redis 7 + BullMQ 5
- **ORM / Migration**: Prisma 5
- **Auth**: NextAuth.js (Auth.js) 5 — Google OAuth + Email/Password (JWT)
- **Test runner**: Vitest + Playwright (E2E)
- **Linter / Formatter**: Biome (replaces ESLint + Prettier)
- **CI/CD**: GitHub Actions
- **Monorepo**: Turborepo + pnpm 9 workspaces
- **Container (dev)**: Docker Compose (postgres + redis)
- **Orchestration (prod)**: Vercel (FE) + Railway Singapore (BE + DB + Redis)
- **Object storage**: Cloudflare R2 (S3-compatible)
- **Email**: Resend (React Email templating)
- **Error monitoring**: Sentry (FE + BE)
- **Logs / Uptime**: Better Stack
- **AI — Free tier**: Google Gemini Flash 2.0
- **AI — Premium tier (v0.2)**: Anthropic Claude Haiku 4.5 + prompt caching
- **AI — Pro tier (v0.2)**: Anthropic Claude Sonnet 4.6 + prompt caching
- **Payment (v0.2)**: VNPay → MoMo → ZaloPay
- **i18n**: next-intl (VI primary, EN ready)

### Folder structure (monorepo)

```
nao-ca-vang/
├── apps/
│   ├── web/              # Next.js 14 frontend
│   └── api/              # NestJS backend (API + worker)
├── packages/
│   ├── shared-types/     # Shared TS types FE↔BE
│   ├── shared-constants/
│   └── eslint-config/
├── docs/
│   ├── charter/          # Project Charter (Phase 1 PM)
│   ├── discovery/        # User research (Phase 2 BA)
│   ├── requirements/     # BRD + SRS (Phase 3 BA)
│   ├── tech/             # Tech Decision (Phase 4 Tech Lead)
│   └── adr/              # Architecture Decision Records
├── scripts/
├── .github/workflows/    # CI/CD
├── docker-compose.yml    # Local dev stack
├── turbo.json
├── pnpm-workspace.yaml
├── VERIFY_LATER.md       # Assumptions to verify
└── CLAUDE.md             # This file
```

### 📚 Documents map (Phase 1-4 OUTPUT — đọc theo thứ tự khi onboard)

| Phase | Doc | Mục đích |
|-------|-----|----------|
| 0 | [ideation-source/SUMMARY.md](docs/ideation-source/SUMMARY.md) | Ý tưởng gốc |
| 1 | [charter/PROJECT_CHARTER.md](docs/charter/PROJECT_CHARTER.md) | Scope + timeline + KPI |
| 2 | [discovery/05-opportunities.md](docs/discovery/05-opportunities.md) | User insight + persona + HMW |
| 3 | [requirements/BRD-v1.0.md](docs/requirements/BRD-v1.0.md) | Business requirement (signed) |
| 3 | [requirements/SRS-v1.0.md](docs/requirements/SRS-v1.0.md) | Technical spec (61 FR + NFR) |
| 4 | [tech/TECH_DECISION.md](docs/tech/TECH_DECISION.md) | Tech stack + sprint plan |
| 4 | [adr/](docs/adr/) | 5 ADR (stack, mindmap storage, monorepo, SR, AI routing) |
| ✱ | [VERIFY_LATER.md](VERIFY_LATER.md) | Giả định cần Quân verify |
| ✱ | [tech/IMPLEMENTATION_PLAN.md](docs/tech/IMPLEMENTATION_PLAN.md) | Sprint 1-5 chi tiết |

## Quy trình Làm việc Bắt buộc (YOU MUST FOLLOW)

### Bước 1 – Trước khi viết bất kỳ code nào
1. Đọc file này (CLAUDE.md) và các file trong `.claude/rules/`.
2. Đọc skill tương ứng với vai trò đang thực hiện trong `.claude/skills/`.
3. Hiểu yêu cầu → Phân tích tác động → Đề xuất giải pháp → Xác nhận với người dùng nếu cần.

### Bước 2 – Coding Standards
- Naming: `camelCase` cho JS/TS, `snake_case` cho Python, `PascalCase` cho class/interface.
- Mọi function/method phải có type hints và JSDoc/Docstring ngắn gọn.
- Giới hạn độ dài function < 50 dòng (trừ trường hợp đặc biệt có giải thích).
- Không dùng `any` / `var` / magic number. Luôn dùng `const` / `readonly` khi có thể.
- Error handling: dùng custom error classes và structured logging.

### Bước 3 – Testing
- Viết test trước hoặc song song với code (TDD khuyến khích).
- Coverage tối thiểu 80% cho business logic.
- Test phải độc lập, không phụ thuộc môi trường hoặc thứ tự chạy.

### Bước 4 – Security & Best Practices
- Không hard-code secret, API key → dùng environment variables.
- Validate tất cả input từ user/external.
- Dùng dependency injection ở mọi nơi có thể.
- Log thông tin nhạy cảm phải được mask.

### Bước 5 – Hoàn thành task
1. Self-review code trước khi trả kết quả.
2. Gợi ý commit message theo Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`...).
3. Gợi ý cải tiến nếu phát hiện technical debt.

## Cấu trúc Dự án Chuẩn

```
project-root/
├── src/
│   ├── modules/          # Feature modules (DDD style)
│   ├── shared/           # Shared utilities, helpers, base classes
│   ├── infrastructure/   # DB, cache, external services adapters
│   └── main.ts / main.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── adr/              # Architecture Decision Records
│   └── api/              # API documentation
├── .claude/
│   ├── rules/            # Quy tắc chi tiết theo loại file
│   └── skills/           # Skills cho từng vai trò AI
├── scripts/              # Helper scripts (deploy, migration...)
├── docker/               # Dockerfiles & compose
├── .github/workflows/    # CI/CD GitHub Actions
├── CLAUDE.md             # File này
├── AGENTS.md             # Định nghĩa các AI Agent
├── TEAM.md               # Cấu trúc team & quy trình
├── CHANGELOG.md          # Lịch sử thay đổi
└── README.md
```

## Lệnh Thường Dùng (Monorepo Turborepo + pnpm)

```bash
# Install all
pnpm install

# Dev — chạy cả FE + BE song song
pnpm dev                    # turbo run dev (cả apps/web + apps/api)
pnpm --filter web dev       # Chỉ frontend
pnpm --filter api dev       # Chỉ backend

# Lint & Format (Biome)
pnpm lint                   # turbo run lint
pnpm format                 # biome format --write .
pnpm typecheck              # turbo run typecheck

# Test (Vitest)
pnpm test                   # turbo run test
pnpm --filter api test      # Backend tests
pnpm --filter web test      # Frontend tests
pnpm test:e2e               # Playwright E2E

# Build production
pnpm build                  # turbo run build

# Local stack (Docker Compose)
docker compose up -d        # postgres 16 + redis 7
docker compose down

# Database (Prisma)
pnpm --filter api db:migrate dev     # Create + apply migration
pnpm --filter api db:migrate deploy  # Apply in CI/prod
pnpm --filter api db:seed            # Seed templates
pnpm --filter api db:studio          # Prisma Studio GUI
pnpm --filter api db:reset           # Reset DB (LOCAL ONLY)

# Workspace
pnpm --filter @nao-ca-vang/shared-types build
```

## Cách AI Agents Phải Làm Việc

- **Luôn đọc file này trước** mọi hành động.
- Đọc skill phù hợp trong `.claude/skills/` trước khi bắt đầu task.
- Nếu không chắc về architecture hoặc convention → Hỏi lại hoặc tham khảo `docs/adr/`.
- Ưu tiên **modular code**, **SOLID principles**, **Domain-Driven Design** (nếu áp dụng).
- Không giả định — nếu yêu cầu mơ hồ, hãy hỏi lại trước khi implement.

## Chọn Skill — Thứ tự Ưu tiên

Kho v4.0:
- `.claude/skills/` — **45 skill auto-discoverable** (AI capabilities)
- `.claude/runbooks/` — **5 runbook** (playbook con người follow khi đối mặt tình huống thật)
- `.claude/skills-archive/` — 875 skill archived, restore khi cần

> **Bắt đầu**: xem `.claude/skills/INDEX.md` để tra skill theo phase công việc.

### 3 nhóm skill chính

1. **Custom Quân Nguyễn (23)** — VI, theo rules Quân Nguyễn. Ưu tiên cao nhất.
2. **obra/superpowers (8)** — MIT, methodology
3. **anthropic/skills (8)** — Apache 2.0, tooling

**Misc (6):** `ui-ux-pro-max`, `changelog-generator`, `domain-name-brainstormer`, `image-enhancer`, etc.

> Chi tiết + license: [.claude/skills/IMPORTED_SKILLS.md](.claude/skills/IMPORTED_SKILLS.md)

### Quy tắc deploy production

Khi deploy prod **PHẢI** mở runbook tương ứng (không bỏ qua):
1. **[`deployment-pipeline`](.claude/runbooks/deployment-pipeline/SKILL.md)** — Master 5-phase, mỗi lần deploy
2. **[`database-migration-safety`](.claude/runbooks/database-migration-safety/SKILL.md)** — Khi có migration
3. **[`incident-response`](.claude/runbooks/incident-response/SKILL.md)** — Khi prod gãy
4. **[`observability-setup`](.claude/runbooks/observability-setup/SKILL.md)** — Setup 1 lần (Sprint 0-1)
5. **[`production-readiness-audit`](.claude/runbooks/production-readiness-audit/SKILL.md)** — Trước launch (Sprint 11)

→ Đây là kết quả từ học hỏi 2 dự án trước (snap-post, vn-product-hunter) — deploy không có process = mất giờ + lỗi.

---

**Phát triển bởi Quân Nguyễn — Quality First, Always.**
Phiên bản: 4.0.0-rc.1 | Cập nhật: 2026-05-13 | Repo Git + sync automation + runbooks tách + INDEX
