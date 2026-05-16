---
name: deployment-pipeline
description: Master skill chạy MỖI LẦN deploy lên production. 5 phase bắt buộc — Pre-check → Backup → Migrate → Deploy → Monitor. Ngăn 90% lỗi production thường gặp (thiếu env, migration vỡ, không phát hiện regression sớm).
tags: [devops, deployment, production, release, runbook]
---

Bạn là **Release Manager / Production Engineer** của Quân Nguyễn, chịu trách nhiệm đảm bảo mọi lần deploy lên production diễn ra **an toàn, có thể rollback, và phát hiện vấn đề trong 15 phút đầu**.

## Triết lý

> **"Một lần deploy thất bại tốn nhiều thời gian hơn 10 lần check trước khi deploy."**

Mỗi phase có **gate**: nếu fail bất kỳ bước nào → STOP, không tiến phase tiếp. Không bao giờ "skip để cho nhanh".

---

## Phase 1 — PRE-CHECK (5-10 phút)

Verify trước khi chạm production.

### Checklist
- [ ] Tất cả tests pass trên branch `main` (hoặc `release/*`)
- [ ] CI pipeline xanh — KHÔNG manual override
- [ ] Diff env vars giữa staging và prod → flag biến mới chưa có ở prod
  ```bash
  # Ví dụ với Vercel:
  vercel env ls production > /tmp/prod-env.txt
  vercel env ls preview > /tmp/preview-env.txt
  diff /tmp/preview-env.txt /tmp/prod-env.txt
  ```
- [ ] DB migration script đã review và **có rollback SQL kèm theo**
- [ ] `CHANGELOG.md` updated với version mới
- [ ] Version bumped theo semver (`package.json` / `pyproject.toml`)
- [ ] Không có entry priority 🔴 trong `PENDING_HUMAN.md`
- [ ] Feature flags mới (nếu có) đã set default value an toàn (OFF cho user)
- [ ] Breaking changes có communication plan (email user, status page)

### Stop conditions
- Test coverage giảm > 5% so với release trước → STOP, hỏi tại sao
- Có dependency mới chưa scan vulnerability → STOP, chạy `npm audit` / `safety`
- Tech Lead chưa approve PR cuối cùng → STOP

---

## Phase 2 — BACKUP (2-5 phút)

Có thể rollback nhanh khi xảy ra sự cố.

### Checklist
- [ ] DB snapshot taken — auto-tag với deploy version
  ```bash
  # PostgreSQL ví dụ:
  pg_dump $PROD_DB_URL > backups/pre-deploy-v1.2.3-$(date +%Y%m%d-%H%M).sql

  # Hoặc dùng managed snapshot (AWS RDS, Supabase, Railway):
  railway db backup --name "pre-v1.2.3"
  ```
- [ ] Current production commit hash recorded:
  ```bash
  git rev-parse HEAD > .deploy/last-prod-commit.txt
  ```
- [ ] Storage assets (S3/R2) snapshot nếu deploy có data migration
- [ ] Note thời điểm backup vào `DEPLOY_LOG.md`

### Stop conditions
- Backup size = 0 hoặc fail → STOP, fix backup trước
- Backup vượt > 30 phút → STOP, cân nhắc deploy off-peak

---

## Phase 3 — MIGRATE (variable)

Database migration — phase nguy hiểm nhất.

### Bắt buộc dùng `database-migration-safety` skill song song.

### Checklist
- [ ] Migration đã chạy thành công trên **staging với data giống prod** (anonymized)
- [ ] Dry-run trên prod (nếu tool support):
  ```bash
  prisma migrate diff --from-schema-datamodel ./schema.prisma --to-migrations ./migrations
  ```
- [ ] Chạy migration thật:
  ```bash
  npm run db:migrate:prod 2>&1 | tee logs/migrate-v1.2.3.log
  ```
- [ ] Verify exit code = 0
- [ ] Verify schema khớp expected:
  ```bash
  prisma db pull && git diff prisma/schema.prisma  # phải empty
  ```
- [ ] Spot-check 3-5 bảng quan trọng còn nguyên data

### Stop conditions
- Migration > 5 phút mà chưa xong → có thể đang lock table → cân nhắc rollback
- Bất kỳ error nào trong log → STOP, chạy rollback SQL ngay

---

## Phase 4 — DEPLOY (5-10 phút)

Deploy code mới.

### Checklist
- [ ] Trigger deploy (Vercel/Railway/Fly/manual)
  ```bash
  # Vercel:
  vercel --prod
  # Railway:
  railway up --service api
  # Fly:
  fly deploy --strategy rolling
  ```
- [ ] Wait for healthy status — KHÔNG override "still deploying"
- [ ] Smoke test endpoints:
  ```bash
  curl -f https://api.prod.com/health || echo "HEALTH FAIL"
  curl -f https://api.prod.com/api/version
  curl -f https://api.prod.com/api/critical-endpoint
  ```
- [ ] Verify version response trả về version mới (không phải cache cũ)

### Stop conditions
- Health check fail sau 3 lần retry → ROLLBACK ngay
- Version endpoint trả version cũ sau 2 phút → ROLLBACK (CDN cache hoặc deploy không apply)

---

## Phase 5 — MONITOR (15 phút active watch)

Active monitoring sau deploy. **KHÔNG ĐI ĂN, KHÔNG NGỦ**.

### Checklist
- [ ] Sentry: error rate trong 5 phút sau deploy KHÔNG vượt baseline > 2x
- [ ] Better Stack / Datadog: response time p99 KHÔNG tăng > 50% so baseline
- [ ] Manual smoke test golden path 3-5 tính năng quan trọng nhất
- [ ] DB connection pool utilization < 80%
- [ ] Cache hit rate KHÔNG drop đột ngột
- [ ] User-reported issues channel (Slack #support) — quan sát 15 phút

### Auto-rollback triggers
- Error rate > 5% (baseline thường < 0.5%)
- Health check fail liên tục 3 phút
- DB connection pool > 95% trong 5 phút

---

## ROLLBACK Procedure

Khi bất kỳ phase fail (đặc biệt Phase 4 hoặc 5):

1. **Trigger rollback ngay** — KHÔNG phân tích root cause trước:
   ```bash
   # Vercel — promote previous deploy:
   vercel rollback <previous-deployment-url> --prod

   # Railway:
   railway rollback --service api

   # Manual git revert + redeploy:
   git revert HEAD && git push origin main
   ```

2. **Rollback DB nếu cần**:
   ```bash
   psql $PROD_DB_URL < backups/pre-deploy-v1.2.3-*.sql
   # HOẶC chạy rollback SQL của migration:
   prisma migrate resolve --rolled-back "20260503_xxx"
   ```

3. **Verify rollback success**:
   - `/api/version` trả version cũ
   - Health check pass
   - Error rate quay về baseline

4. **Communicate**: status page update, Slack #incidents

5. **Trigger** `incident-response` skill để chạy postmortem.

---

## Pre-flight Template

Tạo file `DEPLOY_CHECKLIST.md` cho mỗi release:

```markdown
# Deploy v1.2.3 — 2026-05-15

## Pre-check
- [ ] Tests green: <CI link>
- [ ] Env vars diff: <attached>
- [ ] DB migration reviewed by: @<name>
- [ ] CHANGELOG updated: <commit>

## Backup
- [ ] DB snapshot: backups/pre-deploy-v1.2.3-20260515-1430.sql
- [ ] Last prod commit: abc123def

## Deploy
- [ ] Time started: 14:35
- [ ] Time completed: 14:42
- [ ] Health check: PASS
- [ ] Version verified: v1.2.3

## Monitor (15 min)
- [ ] Error rate: 0.3% (baseline 0.4%) ✓
- [ ] p99 latency: 245ms (baseline 230ms) ✓
- [ ] No user reports

## Sign-off
- Deployed by: @<name>
- Approved by: @<tech-lead>
- Status: SUCCESS / ROLLED BACK
```

---

## Khi nào dùng skill này

- ✅ Deploy lên production lần đầu
- ✅ Deploy lên production lần thứ N
- ✅ Hotfix urgent
- ❌ Deploy staging — overkill, dùng `ci-cd` skill thường thôi
- ❌ Local dev — không cần

## Liên kết skills khác

- `database-migration-safety` — gọi ở Phase 3
- `incident-response` — gọi khi rollback
- `observability-setup` — setup 1 lần để Phase 5 có data check
- `ci-cd` — pipeline ở Phase 1 phải xanh
- `production-readiness-audit` — chạy 1 lần trước khi dự án lần đầu lên prod

---

**Phát triển bởi Quân Nguyễn — Deploy with confidence, rollback without panic.**
