# ADR-001: Tech Stack chính cho MVP v0.1

**Status:** ACCEPTED
**Date:** 2026-05-16
**Deciders:** Tech Lead agent + Quân Nguyễn

---

## Context

Não Cá Vàng cần stack:
- TypeScript-friendly (team Quân quen TS)
- Solo dev maintainable (1 ngôn ngữ FE+BE)
- Deploy nhanh trong 8 tuần
- Cost thấp ($50-100/tháng pre-revenue)
- Performance ổn cho mind map editor + AI streaming

## Decision

| Layer | Choice |
|-------|--------|
| Frontend | **Next.js 14** (App Router) + Tailwind + shadcn/ui |
| Backend | **NestJS 10** + Node 20 LTS |
| Mind map editor | **React Flow (xyflow) 12** |
| Database | **PostgreSQL 16** |
| Cache + Queue | **Redis 7** + BullMQ |
| ORM | **Prisma 5** |
| Auth | **NextAuth.js (Auth.js) 5** |
| Hosting FE | **Vercel** (Hobby) |
| Hosting BE+DB | **Railway** (Singapore region) |
| Object storage | **Cloudflare R2** |
| Email | **Resend** |
| Monitoring | **Sentry** + **Better Stack** |
| Test | **Vitest** + **Playwright** |
| Lint/Format | **Biome** |
| CI/CD | **GitHub Actions** |
| Monorepo | **Turborepo** + **pnpm 9** |

## Rationale

**Tại sao TypeScript end-to-end (Next.js + NestJS):**
- Shared types qua `packages/shared-types` → giảm bug interface mismatch
- Solo dev quen TS, không phải context-switch ngôn ngữ
- Ecosystem npm tốt nhất

**Tại sao NestJS thay vì FastAPI/Hono:**
- DI built-in → enforce Clean Architecture / DDD
- Test-friendly (mock dependencies dễ)
- Quân quen syntax decorators

**Tại sao PostgreSQL + JSONB:**
- Hybrid: relational (user, billing) + document (mind map JSON)
- 1 DB thay vì 2 (PG + Mongo) — đỡ ops overhead
- Prisma support tốt nhất với PG
- JSONB query có index

**Tại sao Vercel + Railway:**
- Setup < 1 giờ
- Vercel: Next.js native, edge CDN gần VN
- Railway Singapore: ~50ms latency VN, postgres+redis trong 1 platform
- Cost MVP $10-25/tháng, đủ cho 1k user

**Tại sao Cloudflare R2 thay vì S3:**
- $0 egress (S3 tốn $0.09/GB) → quan trọng khi serve nhiều image
- S3-compatible API → không lock-in

**Tại sao Resend thay vì SendGrid:**
- $0-20/tháng cho 3-50k email (SendGrid $15+/tháng cho 40k)
- React Email templating → component familiar
- Modern API

## Consequences

### Positive
- Single language (TS) toàn stack → onboarding agent dev nhanh
- Quick setup → Sprint 1 deploy staging được
- Cost dưới budget
- Performance OK cho MVP scale

### Negative / Risks
- Vercel + Railway có thể đắt khi scale 10k+ user → migrate VPS sau (xem [V-303](../../VERIFY_LATER.md#v-303))
- NestJS có learning curve cho ai chưa quen DI (mitigate: docs + ADR rõ)
- React Flow giới hạn ~1000 node performance (mitigate: POC Sprint 1, virtualize nếu cần)

## Alternatives Considered

- **FastAPI (Python) + Next.js:** Tốt nhưng 2 ngôn ngữ
- **Hono + tRPC + Next.js:** Mới, hot, nhưng ecosystem chưa giàu bằng NestJS
- **SvelteKit + monolith:** Performance tốt nhưng ecosystem nhỏ hơn React
- **Supabase BaaS:** Nhanh hơn nhưng vendor lock-in + khó custom auth/quota
- **MongoDB thay PostgreSQL:** Document-first nhưng yếu relational (user/billing)
- **AWS Amplify:** Complex setup, cost cao
- **VPS tự host:** Cheap nhưng ops overhead lớn cho solo dev

## Verify later

Xem [VERIFY_LATER.md](../../VERIFY_LATER.md) các item V-301 đến V-307.
