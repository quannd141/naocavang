# 🛠️ IMPLEMENTATION PLAN — Não Cá Vàng MVP v0.1

**Version:** 1.0
**Date:** 2026-05-16
**Based on:** SRS-v1.0, TECH_DECISION.md
**Total duration:** 8 tuần (16/05/2026 → 15/07/2026)

---

## Tổng quan Sprint

| Sprint | Tuần | Goal | Demo date | Status |
|--------|------|------|-----------|--------|
| Sprint 0 | Đã xong (16/05) | Kickoff: Charter, Discovery, BRD, SRS, Tech Decision | — | ✅ Done |
| Sprint 1 | T1-T2 (16/05 → 30/05) | Foundation: monorepo, auth, deploy staging, POC mind map | 30/05/2026 | 🟡 Ready |
| Sprint 2 | T3-T4 (30/05 → 13/06) | Mind map editor + Template library | 13/06/2026 | ⏳ |
| Sprint 3 | T5-T6 (13/06 → 27/06) | AI generation + Flashcard | 27/06/2026 | ⏳ |
| Sprint 4 | T7 (27/06 → 04/07) | Spaced Repetition + Quiz + Alpha demo | 30/06/2026 (alpha) | ⏳ |
| Sprint 5 | T8 (04/07 → 15/07) | Polish + Production Launch | **15/07/2026** 🚀 | ⏳ |

---

## Sprint 1: Foundation (T1-T2, 16/05 → 30/05)

### Goals
1. Setup monorepo Turborepo + pnpm hoạt động end-to-end
2. Auth flow Google + Email working trên staging
3. Onboarding wizard hoàn chỉnh
4. POC mind map render (verify [V-202](../../VERIFY_LATER.md#v-202))
5. CI/CD + observability setup hoàn tất

### Task breakdown

#### 1.1 Project Setup (Day 1-2)
- [ ] Init pnpm workspace + Turborepo
- [ ] Create `apps/web` Next.js 14 với App Router
- [ ] Create `apps/api` NestJS 10
- [ ] Create `packages/shared-types`, `packages/eslint-config`, `packages/tsconfig`
- [ ] Setup Biome (lint + format) + Husky pre-commit
- [ ] Docker Compose: postgres 16 + redis 7
- [ ] `.env.example` cho dev + staging + prod
- [ ] README.md với "Quick start"

#### 1.2 Database & Prisma (Day 2-3)
- [ ] `prisma/schema.prisma` initial: User, Session, Account (NextAuth tables)
- [ ] First migration
- [ ] Prisma seed script (admin user dev)
- [ ] Connection pool config
- [ ] Backup script

#### 1.3 Auth (Day 3-5) — FR-001, FR-002, FR-003
- [ ] NextAuth.js setup với Google + Email providers
- [ ] `/login`, `/register`, `/forgot-password`, `/reset-password` pages
- [ ] Email verification flow (Resend integration)
- [ ] Password hashing (bcrypt cost 12)
- [ ] Rate limiting (5/15 phút per email)
- [ ] Session JWT 30 days
- [ ] **Onboarding wizard** 3 bước (role, subjects, first mindmap)
- [ ] `user_preferences` table
- [ ] Tests: unit + integration

#### 1.4 CI/CD (Day 5-6)
- [ ] `.github/workflows/ci.yml`: lint + typecheck + test on PR
- [ ] `.github/workflows/deploy-staging.yml`: auto-deploy `main` → Vercel + Railway
- [ ] Branch protection on `main`: require PR + CI pass
- [ ] Secret management (GitHub Secrets + Railway secrets)

#### 1.5 Hosting & Observability (Day 6-8)
- [ ] Vercel project create + connect repo + env vars
- [ ] Railway project create:
  - PostgreSQL service
  - Redis service
  - NestJS API service
- [ ] Custom domain (DNS staging.naocavang.com → Vercel)
- [ ] Sentry setup (FE + BE), source maps upload
- [ ] Better Stack: logging + uptime monitor
- [ ] Health check endpoint `/health` + `/ready`
- [ ] Setup theo runbook [observability-setup](../../.claude/runbooks/observability-setup/SKILL.md)

#### 1.6 POC Mind Map Render (Day 8-10) — [V-202](../../VERIFY_LATER.md#v-202), [V-304](../../VERIFY_LATER.md#v-304)
- [ ] React Flow integration vào `apps/web`
- [ ] Test render 100/500/1000/2000 node với dummy data
- [ ] Đo FPS + memory + interaction latency
- [ ] Document kết quả vào `docs/tech/poc-mindmap-render.md`
- [ ] **Decision gate:** OK → tiếp Sprint 2. Lag → cân nhắc virtualization hoặc đổi lib

### Sprint 1 Acceptance
- [ ] User có thể: đăng ký Google → onboarding 30s → thấy dashboard rỗng
- [ ] Staging URL working
- [ ] CI pass cho PR
- [ ] Sentry receive test error
- [ ] POC mind map document complete

### Risks Sprint 1
- 🟡 Railway region Singapore latency VN — verify với ping test
- 🟡 NextAuth v5 (beta) breaking changes — fallback v4 nếu cần

---

## Sprint 2: Mind Map Editor + Template (T3-T4, 30/05 → 13/06)

### Goals
1. Mind map editor đầy đủ: tạo, edit, save, load
2. Template library với 50+ template seed
3. Image embed vào node

### Task breakdown

#### 2.1 Schema & API (Day 1-3)
- [ ] Prisma schema: MindMap, Template
- [ ] Migration
- [ ] Module `mindmap` (NestJS): controller + service + repository + DTO
- [ ] API: `POST /mindmaps`, `GET /mindmaps` (list paginated), `GET /mindmaps/:id`, `PATCH /mindmaps/:id`, `DELETE /mindmaps/:id`
- [ ] Quota middleware (10 active mindmaps free tier)
- [ ] Tests: unit + integration

#### 2.2 Mind Map Editor FE (Day 3-7) — FR-010, FR-011
- [ ] Page `/mindmaps/[id]/edit`
- [ ] React Flow + dagre layout integration
- [ ] Custom node component (text, color, icon, image)
- [ ] Toolbar: thêm node con (Tab), anh em (Enter), xóa (Delete)
- [ ] Color picker (10 màu preset)
- [ ] Undo/redo (Ctrl+Z/Y) — Zustand state with history
- [ ] Auto-save 500ms debounce, indicator "Đã lưu HH:MM"
- [ ] Zoom + pan controls
- [ ] Keyboard shortcuts overlay (?)
- [ ] Performance: target < 100ms add/delete node

#### 2.3 Image Embed (Day 7-9) — FR-012
- [ ] Cloudflare R2 setup
- [ ] API: `POST /uploads/presigned-url` → return signed URL
- [ ] FE: image upload component
- [ ] Image resize tự động (max 800px)
- [ ] Thumbnail trong node, full image popup khi click
- [ ] Image validation: type + size

#### 2.4 Template Library (Day 9-13) — FR-060, FR-061
- [ ] Module `template`: schema, CRUD API
- [ ] **Template seed script:** AI generate 50 template (10 môn × 5 chương)
  - Toán 10/11/12, Lý 10/11/12, Hóa 10/11/12 — 27 template
  - Sử/Địa/Văn THPT — 9 template
  - Anh Văn vocab + grammar — 6 template
  - IELTS Reading/Writing/Speaking — 3 template
  - SV Marketing căn bản, Kinh tế vi mô — 5 template
- [ ] Template content human review + edit
- [ ] FE `/templates` page: grid, filter, search
- [ ] FE template preview modal
- [ ] FE "Use this template" → clone về cá nhân

### Sprint 2 Acceptance
- [ ] User tạo mind map từ scratch, edit, auto-save, mở lại sau 1 ngày → giữ nguyên
- [ ] User dùng template → copy về cá nhân → edit
- [ ] Image upload + display works
- [ ] Performance < 2s render 500 node

---

## Sprint 3: AI Generation + Flashcard (T5-T6, 13/06 → 27/06)

### Goals
1. AI sinh mind map từ PDF/text working
2. AI sinh flashcard từ mind map working
3. Quota + cost tracking

### Task breakdown

#### 3.1 BullMQ + Worker (Day 1-2)
- [ ] BullMQ setup với Redis
- [ ] Worker process trong `apps/api` (cùng process MVP, tách sau)
- [ ] Job lifecycle: queue → process → complete → notify FE
- [ ] WebSocket hoặc polling cho progress update

#### 3.2 PDF Processing (Day 2-3)
- [ ] PDF upload endpoint với validation (50MB, 100 trang max)
- [ ] PDF text extraction (`pdf-parse`)
- [ ] Chunking strategy: split theo trang nếu > 8000 token
- [ ] Edge case: scan-image PDF → message "Không đọc được, paste text?"

#### 3.3 AI Routing Service (Day 3-5) — ADR-005, FR-021
- [ ] `AiRoutingService` + provider adapters (Gemini + Anthropic)
- [ ] Cost computation
- [ ] `ai_usage_log` table + repository
- [ ] Quota middleware + enforcement
- [ ] Monthly quota reset cron
- [ ] Tests: mock providers + cost math

#### 3.4 Mind Map Generation (Day 5-8) — FR-020
- [ ] Prompt template VI cho Gemini (xem SRS Phụ lục A)
- [ ] `MindmapFromPdfJob` worker
- [ ] JSON schema validation cho AI output
- [ ] Retry logic (2x với backoff)
- [ ] FE: upload UI + progress polling
- [ ] FE: hiển thị mind map với banner "AI sinh từ tài liệu"
- [ ] Tests: integration với mock AI

#### 3.5 Flashcard Module (Day 8-11) — FR-030
- [ ] Prisma schema: FlashcardDeck, Flashcard
- [ ] Migration
- [ ] CRUD API
- [ ] AI gen flashcard từ mind map
- [ ] Format support: Q&A, Cloze, MCQ
- [ ] FE: "Tạo flashcard" button trong mind map editor
- [ ] FE: deck view + card list edit
- [ ] Tests

#### 3.6 Manual AI Quality Eval (Day 11-13)
- [ ] Prepare 20 PDF sample (HS THPT slide các môn)
- [ ] Generate 20 mind map + 20 flashcard deck
- [ ] Human rate 1-5 stars cho mỗi → spreadsheet
- [ ] Target: trung bình ≥ 4/5
- [ ] Iterate prompt nếu < target
- [ ] **Verify V-205 (quota 50/tháng) sau eval**

### Sprint 3 Acceptance
- [ ] User upload PDF Hóa 12 → 60s sau ra mind map → click 1 nút ra 50 flashcard
- [ ] AI cost log đầy đủ
- [ ] Quality eval pass ≥ 4/5

---

## Sprint 4: Spaced Repetition + Quiz + Alpha (T7, 27/06 → 04/07)

### Goals
1. SR + flashcard review UX hoàn chỉnh
2. Quiz generation + play
3. Alpha demo 30/06 với 5-10 user

### Task breakdown

#### 4.1 SM-2 Algorithm (Day 1-2) — ADR-004, FR-040
- [ ] `sm2()` pure function + tests
- [ ] Review service: apply SM-2 + log
- [ ] `ReviewLog` table + repo
- [ ] Query "due today" với index

#### 4.2 Flashcard Review UX (Day 2-4) — FR-031
- [ ] FE: dashboard widget "Hôm nay X thẻ cần ôn"
- [ ] FE: review mode full screen
  - Card flip animation
  - 4 button rate
  - Keyboard shortcut (1-4)
  - Progress bar
- [ ] Celebration screen (confetti + stats)
- [ ] State persist (resume sau quit)

#### 4.3 Reminder (Day 4-5) — FR-041
- [ ] Cron job 7h sáng Asia/Ho_Chi_Minh
- [ ] Email template "Hôm nay X thẻ cần ôn" (React Email)
- [ ] Web notification API
- [ ] Settings page: toggle reminder

#### 4.4 Quiz Module (Day 5-8) — FR-050, FR-051
- [ ] Prisma schema: Quiz, QuizQuestion, QuizAttempt
- [ ] AI gen quiz từ mind map
- [ ] FE: config quiz UI (số câu, loại, độ khó)
- [ ] FE: play quiz UI với timer (optional)
- [ ] FE: review answers + giải thích
- [ ] FE: "Thêm câu sai vào flashcard"

#### 4.5 E2E + Load Testing (Day 8-10)
- [ ] Playwright tests cho 10 critical paths
- [ ] k6 load test 200 concurrent users
- [ ] Fix perf bottlenecks

#### 4.6 Alpha Demo (Day 10-12) — 30/06/2026
- [ ] Recruit 5-10 alpha user (cháu/em họ HS + bạn SV)
- [ ] Demo session 30 phút mỗi user
- [ ] Feedback form
- [ ] Bug triage + fix priority

### Sprint 4 Acceptance
- [ ] User ôn flashcard hàng ngày → SR working đúng
- [ ] User làm quiz → score + giải thích
- [ ] Alpha: 5-10 user feedback collected
- [ ] All Sprint 1-4 features stable

---

## Sprint 5: Polish + Production Launch (T8, 04/07 → 15/07)

### Goals
1. Fix alpha bug
2. Accessibility + i18n polish
3. Production launch 15/07

### Task breakdown

#### 5.1 Bug Fixes (Day 1-4)
- [ ] Triage alpha bugs by priority
- [ ] Fix all critical + high
- [ ] Document medium/low cho v0.2

#### 5.2 Accessibility (Day 3-5)
- [ ] axe-core CI check
- [ ] Keyboard navigation full
- [ ] Screen reader labels
- [ ] Color contrast 4.5:1+
- [ ] Focus indicator

#### 5.3 UX Polish (Day 4-7)
- [ ] Onboarding tooltip (Shepherd.js hoặc custom)
- [ ] 2-min video demo (record màn hình + voice)
- [ ] Empty states + error messages friendly
- [ ] Loading skeleton
- [ ] Mobile responsive final pass

#### 5.4 Legal & Privacy (Day 5-7)
- [ ] Privacy Policy (tham khảo template + adapt PDPL)
- [ ] Terms of Service
- [ ] Cookie banner (chỉ functional cookies)
- [ ] User data export (PDPL right)
- [ ] User account delete (PDPL right)

#### 5.5 Production Setup (Day 7-10)
- [ ] DNS: naocavang.com + naocavang.vn (mua + setup)
- [ ] SSL cert (Vercel + Railway tự động)
- [ ] Production env vars
- [ ] Production secrets rotation
- [ ] Backup verification
- [ ] DNS warm-up

#### 5.6 Production Launch (Day 10-12) — 15/07/2026 🚀
- [ ] Chạy [production-readiness-audit](../../.claude/runbooks/production-readiness-audit/SKILL.md) checklist
- [ ] Chạy [deployment-pipeline](../../.claude/runbooks/deployment-pipeline/SKILL.md) 5-phase runbook
- [ ] Smoke tests post-deploy
- [ ] Sentry + Better Stack live monitoring
- [ ] **🚀 ANNOUNCE LAUNCH** (Facebook, TikTok, Twitter, group HS/SV)

### Sprint 5 Acceptance
- [ ] Zero critical bug 7 ngày post-launch
- [ ] 100+ user đăng ký trong 24h đầu
- [ ] Uptime 99%+ tuần đầu
- [ ] AI cost < $5/day trung bình tuần đầu

---

## Định nghĩa Done (per Sprint)

Một sprint coi như DONE khi:

- [ ] Mọi acceptance criteria từng FR đã pass
- [ ] Unit + integration tests cover ≥ 80%
- [ ] Lint + typecheck pass
- [ ] CI green
- [ ] Code review (self-review hoặc AI subagent review)
- [ ] Demo staging URL working
- [ ] No regression
- [ ] Docs updated nếu có thay đổi architecture
- [ ] CHANGELOG.md updated
- [ ] `/sprint-end-review` skill chạy → QA + BA + Tech Lead sign-off

---

## Risks & Mitigation

| Risk | Sprint | Mitigation |
|------|--------|------------|
| POC mind map render lag (1000+ node) | 1 | Cân nhắc virtualization hoặc đổi tldraw |
| AI quality kém (< 4/5) | 3 | Iterate prompt, fallback Claude Haiku cho free |
| Alpha user feedback rất tệ | 4 | Có 1 tuần buffer (Sprint 5 fix) |
| Launch ngày 15/07 trễ | 5 | Acceptable trễ 1-2 tuần, KHÔNG cắt chất lượng |
| AI cost vượt $50 trong tuần | 3-5 | Quota strict, alert daily |

---

## Post-Launch (v0.1 → v0.2 plan)

| Tuần sau launch | Hoạt động |
|-----------------|-----------|
| Tuần 1 | Monitor, fix bug, content marketing TikTok |
| Tuần 2 | Phân tích usage data, identify top friction |
| Tuần 3-4 | Start v0.2 planning: Premium subscription + payment |
| Tuần 5-8 | Build v0.2: MoMo/ZaloPay + AI từ ảnh + thư viện public |
| 15/08/2026 | **v0.2 launch** |

---

## Owner & RACI

- **Responsible:** Senior Developer agent (chính) + Quân (review + sign off)
- **Accountable:** Tech Lead agent + Quân
- **Consulted:** PM agent, BA agent, QA agent
- **Informed:** All agents + Quân

---

**🟢 Plan approved — Sprint 1 ready to kickoff sau khi Quân say go.**
