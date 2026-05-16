# 🙋 PENDING_HUMAN — Tasks chờ Quân xử lý

> Agent không thể tự làm các task sau vì cần credentials, account hoặc quyết định kinh doanh từ Quân. Đánh dấu mỗi PH theo độ priority + thời gian dự kiến.

---

## PH-001 — Google Cloud OAuth credentials

**Priority:** 🔴 HIGH (block Sprint 1 acceptance — auth Google trên web)
**Estimated:** ~15 phút

### What Quân làm

1. Vào https://console.cloud.google.com/ → tạo project mới `nao-ca-vang-dev`
2. APIs & Services → OAuth consent screen → External → fill thông tin app (tên, support email)
3. Credentials → Create credentials → OAuth Client ID → Web application
4. Authorized redirect URIs: thêm cả 3 cho dev + staging + prod
   - `http://localhost:3000/api/auth/callback/google`
   - `https://staging.naocavang.com/api/auth/callback/google` (tạm)
   - `https://naocavang.com/api/auth/callback/google` (tạm)
5. Copy `Client ID` + `Client Secret` → paste vào `.env.local`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

### Why blocked

- NextAuth.js Google provider cần real OAuth credentials
- Trong night-shift: `.env.night-shift` có `GOOGLE_CLIENT_ID=FAKE_KEY_DO_NOT_USE`
- Auth pages `apps/web/src/app/(auth)/login/page.tsx` có button "Tiếp tục với Google" disabled với title "chưa cấu hình"

### Files reference

- [apps/web/src/app/(auth)/login/page.tsx](apps/web/src/app/(auth)/login/page.tsx) — button disabled
- [.env.example](.env.example) — slot trống cho credentials

---

## PH-002 — Google Gemini API key

**Priority:** 🟡 MEDIUM (block Sprint 3 — AI gen mind map từ PDF)
**Estimated:** ~10 phút

### What Quân làm

1. Vào https://aistudio.google.com/app/apikey
2. Đăng nhập Google → Create API key → chọn project `nao-ca-vang-dev`
3. Copy key → `.env.local`:
   ```
   GEMINI_API_KEY=AIza...
   ```
4. Verify free tier: 60 req/min, đủ cho MVP

### Why blocked

- Sprint 3 cần real AI call để verify quality
- Trong night-shift: `MockAiAdapter` đang trả response giả lập (deterministic)
- `GeminiAdapter` đã scaffold nhưng throws nếu key = FAKE

### Files reference

- [apps/api/src/modules/ai/infrastructure/gemini.adapter.ts](apps/api/src/modules/ai/infrastructure/gemini.adapter.ts) — TODO Sprint 3 wire real SDK

---

## PH-003 — Anthropic Claude API key (v0.2)

**Priority:** 🟢 LOW (chỉ cần khi launch Premium tier — v0.2 Sprint 7+)
**Estimated:** ~10 phút + đăng ký credit card

### What Quân làm

1. Vào https://console.anthropic.com/ → đăng ký account
2. Settings → API Keys → Create Key → copy
3. Settings → Billing → add credit (~$20 đủ cho test)
4. `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

### Why blocked

- Premium tier (99k/tháng) dùng Claude Haiku — cần real key
- Có thể đợi đến v0.2 (Sprint 7) mới setup

---

## PH-004 — Cloudflare R2 bucket + credentials

**Priority:** 🟡 MEDIUM (block Sprint 2 — image embed + Sprint 3 — PDF upload)
**Estimated:** ~15 phút

### What Quân làm

1. https://dash.cloudflare.com/ → đăng ký account miễn phí
2. R2 sidebar → Create bucket `nao-ca-vang-dev`
3. Settings → CORS:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://staging.naocavang.com"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```
4. Manage R2 API Tokens → Create → permissions: Object Read + Write
5. Copy: Access Key ID + Secret + Account ID → `.env.local`:
   ```
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=nao-ca-vang-dev
   ```

### Why blocked

- Free tier (10GB + $0 egress) tốt cho MVP
- Cần cho upload PDF (Sprint 3) + image embed mind map (Sprint 2)

---

## PH-005 — Resend (Email) API key

**Priority:** 🟢 LOW (chỉ cần email reminder + welcome — Sprint 1 nhưng có thể defer Sprint 2)
**Estimated:** ~10 phút

### What Quân làm

1. https://resend.com/ → đăng ký với email Quân
2. Add domain (cần DNS access — có thể dùng resend.dev tạm)
3. API Keys → Create → copy → `.env.local`:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM=hello@naocavang.com (hoặc tạm onboarding@resend.dev)
   ```

### Why blocked

- Welcome email + password reset cần real provider
- Trong night-shift: agent log "[EMAIL MOCK] would send to X" thay vì gửi thật

---

## PH-006 — Sentry account + DSN

**Priority:** 🟢 LOW (chỉ cần khi deploy staging — Sprint 1 cuối)
**Estimated:** ~10 phút

### What Quân làm

1. https://sentry.io/ → đăng ký free
2. Create project "nao-ca-vang-web" (Next.js) + "nao-ca-vang-api" (Node)
3. Copy DSN của mỗi → `.env.local`:
   ```
   SENTRY_DSN=https://...@sentry.io/...
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   ```

---

## PH-007 — Hosting: Vercel + Railway accounts

**Priority:** 🟡 MEDIUM (block deploy staging — Sprint 1 cuối)
**Estimated:** ~30 phút

### What Quân làm

1. **Vercel** (Next.js FE)
   - https://vercel.com/ → đăng ký bằng GitHub
   - Import repo → Vercel auto-detect Next.js
   - Set root directory: `apps/web`
   - Set build command: `cd ../.. && pnpm turbo build --filter=@nao-ca-vang/web`
   - Set env vars (tất cả từ `.env.local` trừ DB local)

2. **Railway** (NestJS BE + Postgres + Redis)
   - https://railway.app/ → đăng ký GitHub
   - New Project → Deploy from GitHub repo
   - Add Postgres service + Redis service
   - Add Node service cho `apps/api`
   - Set env vars

### Why blocked

- Agent không có credential, không thể setup account thay
- Cost: Vercel Hobby free, Railway ~$5-15/tháng

---

## PH-008 — Domain naocavang.com + naocavang.vn

**Priority:** 🟡 MEDIUM (cần trước launch 15/07/2026)
**Estimated:** ~30 phút + ~500k VND/năm

### What Quân làm

1. Check domain available qua https://www.namecheap.com/ hoặc https://matbao.net/ (cho .vn)
2. Mua naocavang.com (~$10/năm) + naocavang.vn (~400k/năm)
3. Setup DNS:
   - `staging.naocavang.com` → CNAME Vercel
   - `naocavang.com` → ALIAS Vercel
   - `api.naocavang.com` → CNAME Railway
4. Update OAuth redirect URIs ở Google Cloud + NextAuth callbacks

---

## PH-009 — Trademark check

**Priority:** 🔴 HIGH (MUST trước launch — tránh rủi ro legal)
**Estimated:** ~1-2 giờ tra cứu + ~6 tháng đăng ký TM

### What Quân làm

1. Tra cứu TM trên https://wipopublish.ipvietnam.gov.vn/ — keyword "Não Cá Vàng", "NaoVang", "NãoCáVàng"
2. Tra social handle: @naocavang trên Facebook/Instagram/TikTok/Twitter
3. Nếu sạch → cân nhắc đăng ký TM (~3-5 triệu VND qua agent IP)
4. Nếu trùng → brainstorm tên khác (xem [VERIFY_LATER.md D-001](VERIFY_LATER.md))

---

## PH-010 — Validate 3-5 user thật (Phase 2 follow-up)

**Priority:** 🔴 HIGH (verify hypothesis trước Sprint 3)
**Estimated:** ~3-5 buổi 30-45 phút

### What Quân làm

1. Recruit 3-5 user thật:
   - 2-3 HS THPT (cháu/em họ)
   - 1-2 SV ĐH (bạn/em họ)
2. Dùng script trong [docs/discovery/02-interview-script.md](docs/discovery/02-interview-script.md)
3. Notes vào `docs/discovery/interviews/HS-<tên-thật>-<date>.md`
4. So sánh với 7 persona giả lập → đánh dấu V-101 trong [VERIFY_LATER.md](VERIFY_LATER.md)
5. Nếu khác biệt lớn → revise BRD/SRS v1.1

### Why blocked

- AI không thể interview user thật
- Output Discovery phase đã có (7 giả lập) nhưng cần real validation

---

## 📋 Tổng kết priority

| # | Task | Priority | When |
|---|------|----------|------|
| PH-001 | Google OAuth | 🔴 HIGH | Trước Sprint 1 end |
| PH-009 | Trademark check | 🔴 HIGH | Trước Sprint 4 |
| PH-010 | Validate 3-5 user thật | 🔴 HIGH | Trước Sprint 3 |
| PH-002 | Gemini API key | 🟡 MED | Trước Sprint 3 |
| PH-004 | Cloudflare R2 | 🟡 MED | Trước Sprint 2 end |
| PH-007 | Vercel + Railway | 🟡 MED | Trước Sprint 1 end |
| PH-008 | Domain | 🟡 MED | Trước Sprint 5 launch |
| PH-003 | Claude API | 🟢 LOW | Trước Sprint 7 (v0.2) |
| PH-005 | Resend | 🟢 LOW | Trước Sprint 2 |
| PH-006 | Sentry | 🟢 LOW | Trước Sprint 1 end |

**Tổng thời gian Quân: ~3-5 giờ** (admin) + ~3-5 buổi interview.

Sau khi xử lý, Quân:
1. Cập nhật `.env.local` với credentials thật
2. Đánh dấu PH đã xong (✅) trong file này
3. Tag agent quay lại tiếp Sprint 1 task còn dở
