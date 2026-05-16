# Não Cá Vàng 🧠🐠

> **Học một lần, nhớ cả đời** — Nền tảng học bằng AI all-in-one cho người Việt.

Não Cá Vàng biến text/PDF/slide bài giảng thành **mind map + flashcard + quiz** với AI tự sinh và spaced repetition để **học nhanh hơn, nhớ lâu hơn**.

## 🎯 USP

1. **All-in-one tiếng Việt** — 5 module trong 1 platform (Mind map + Flashcard + Quiz + AI tutor + Summary)
2. **Brand viral** — Tận dụng meme "não cá vàng" có sẵn trong văn hoá VN
3. **Giá Việt** — 49-149k/tháng + free tier dùng được thật, thanh toán MoMo/ZaloPay (v0.2)

## 📚 Documentation

| Doc | Mục đích |
|-----|----------|
| [CLAUDE.md](CLAUDE.md) | Hướng dẫn AI agents — đọc đầu tiên |
| [Project Charter](docs/charter/PROJECT_CHARTER.md) | Scope + timeline + KPI |
| [BRD v1.0](docs/requirements/BRD-v1.0.md) | Business Requirements (signed) |
| [SRS v1.0](docs/requirements/SRS-v1.0.md) | Technical Specification |
| [Tech Decision](docs/tech/TECH_DECISION.md) | Stack chính thức |
| [Implementation Plan](docs/tech/IMPLEMENTATION_PLAN.md) | Sprint 1-5 chi tiết |
| [ADRs](docs/adr/) | 5 Architecture Decisions |
| [VERIFY_LATER.md](VERIFY_LATER.md) | Giả định cần verify |

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS
- pnpm 9
- Docker Desktop (cho local postgres + redis)

### Setup

```bash
# Clone & install
git clone <repo-url>
cd nao-ca-vang
pnpm install

# Copy env
cp .env.example .env.local
# Edit .env.local — điền credentials

# Start local stack (postgres + redis)
docker compose up -d

# Migrate database
pnpm --filter api db:migrate dev

# Seed templates
pnpm --filter api db:seed

# Run dev (FE + BE song song)
pnpm dev

# Open
# Frontend: http://localhost:3000
# API: http://localhost:3001
# API Swagger: http://localhost:3001/api/docs
```

## 🏗️ Architecture

```
nao-ca-vang/
├── apps/
│   ├── web/              # Next.js 14 (App Router) frontend
│   └── api/              # NestJS 10 backend + worker
├── packages/
│   ├── shared-types/     # TypeScript types FE↔BE
│   ├── shared-constants/ # Subjects, grades, AI quotas
│   └── eslint-config/
├── docs/                 # Charter, Discovery, BRD, SRS, ADRs
└── docker-compose.yml    # Local dev stack
```

Stack:
- **FE:** Next.js 14 + Tailwind + shadcn/ui + React Flow (mind map)
- **BE:** NestJS 10 + Prisma + PostgreSQL 16 + Redis + BullMQ
- **AI:** Multi-provider (Gemini Flash 2.0 free, Claude Haiku/Sonnet for Premium)
- **Test:** Vitest + Playwright
- **Lint:** Biome
- **Monorepo:** Turborepo + pnpm 9
- **Hosting:** Vercel (FE) + Railway Singapore (BE/DB/Redis)

## 🧪 Testing

```bash
pnpm test                   # All unit + integration
pnpm test:e2e               # Playwright
pnpm typecheck              # TS check
pnpm lint                   # Biome lint
```

## 📊 Status

- ✅ Phase 1-4 hoàn thành (Charter, Discovery, BRD, SRS, Tech Decision)
- 🟡 **Sprint 1 in progress** (foundation, monorepo, auth, deploy staging)
- ⏳ Sprint 2-5 → MVP launch **15/07/2026**

## 📄 License

UNLICENSED — Private project. © 2026 Quân Nguyễn.
