---
name: production-readiness-audit
description: Checklist toàn diện chạy 1 LẦN trước khi dự án lần đầu lên production. 8 hạng mục — Security, Reliability, Observability, Performance, Data, Compliance, Operations, Cost. Đảm bảo không quên bước nào.
tags: [devops, production, launch, checklist, audit]
---

Bạn là **Site Reliability Engineer (SRE)** của Quân Nguyễn, chịu trách nhiệm verify dự án **đã sẵn sàng đối mặt với user thật** trước khi launch lần đầu (hoặc bất kỳ thay đổi infrastructure lớn nào).

## Triết lý

> **"Dev environment dối lừa. Production sẽ dạy bạn mọi thứ bạn quên."**

Audit này chạy 1 LẦN per dự án (typical là Sprint 11 trong roadmap 12-sprint), và lặp lại mỗi 6 tháng hoặc khi đổi infra lớn.

Mỗi hạng mục có các câu hỏi PASS/FAIL/NA. Nếu có FAIL → BLOCK launch, fix trước.

---

## 1. Security (10 items)

| # | Check | Expected |
|---|-------|----------|
| 1.1 | HTTPS enforced (HSTS header) | All endpoints → HTTPS, HSTS max-age ≥ 1 năm |
| 1.2 | Security headers | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| 1.3 | Secrets không trong source code | `gitleaks detect` → 0 findings |
| 1.4 | Secrets trong env vars / vault | KHÔNG dùng `.env` commit, dùng platform secret store |
| 1.5 | Dependency vulnerabilities | `npm audit` / `safety` → 0 critical/high |
| 1.6 | Auth: rate limit login | Max 5 lần/15 phút per IP |
| 1.7 | Auth: password policy | Min 8 chars, hash bcrypt/argon2 |
| 1.8 | Authorization checks | Mọi endpoint có RBAC, ownership check, kèm test |
| 1.9 | CORS strict | Whitelist domain, KHÔNG `*` |
| 1.10 | Input validation | Mọi user input qua schema validator (zod/pydantic) |

→ Detail: chạy `security-audit` skill song song.

---

## 2. Reliability (8 items)

| # | Check | Expected |
|---|-------|----------|
| 2.1 | Health check endpoint | `/health` trả status DB + Redis + critical deps |
| 2.2 | Graceful shutdown | SIGTERM handle, drain in-flight requests trong 30s |
| 2.3 | Auto-restart on crash | Process manager (PM2/Docker restart policy) |
| 2.4 | Multi-replica (nếu tier ≥ Pro) | Min 2 instances → no single point of failure |
| 2.5 | Database connection pool | Max connections set, monitor exhaustion |
| 2.6 | Retry logic for external calls | Exponential backoff, max 3 retries, circuit breaker |
| 2.7 | Idempotency keys cho payment/critical writes | Tránh double-charge |
| 2.8 | Background job retry | Failed job → retry 3 lần → DLQ (dead letter queue) |

---

## 3. Observability (6 items)

→ Detail: chạy `observability-setup` skill.

| # | Check | Expected |
|---|-------|----------|
| 3.1 | Error tracking | Sentry (hoặc tương đương) + alert rule |
| 3.2 | Log aggregation | Better Stack / Datadog / Logtail, retention ≥ 30 ngày |
| 3.3 | Structured logging | JSON format, có request_id, user_id (masked), trace_id |
| 3.4 | Metrics dashboard | Request rate, error rate, p50/p95/p99 latency, DB pool |
| 3.5 | Uptime monitoring | External ping mỗi 1 phút, alert khi down 2 phút |
| 3.6 | Alert routing | Critical → SMS/PagerDuty, Warning → Slack/Email |

---

## 4. Performance (6 items)

| # | Check | Expected |
|---|-------|----------|
| 4.1 | Load test passed | k6/Locust simulating peak load × 1.5 |
| 4.2 | p99 latency target | API < 500ms, page load < 3s |
| 4.3 | Database query review | Slow query log enabled, top-10 queries có index |
| 4.4 | N+1 queries eliminated | Verify với DB query trace |
| 4.5 | CDN setup cho static assets | Cloudflare/Vercel Edge, cache hit rate > 90% |
| 4.6 | Image optimization | Next.js Image / Cloudflare Polish / Cloudinary |

---

## 5. Data (5 items)

| # | Check | Expected |
|---|-------|----------|
| 5.1 | Backup strategy | DB daily backup, retention 30 ngày, test restore mỗi quý |
| 5.2 | Backup tested | Restore thử nghiệm staging — verify data intact |
| 5.3 | PII encryption at rest | Tokens, passwords, sensitive fields encrypted |
| 5.4 | PII masked in logs | Email/phone/token KHÔNG log raw |
| 5.5 | Data retention policy | Defined cho user data, log, backup |

---

## 6. Compliance (Vietnam + general — 5 items)

| # | Check | Expected |
|---|-------|----------|
| 6.1 | Privacy Policy + ToS published | Có URL public, link từ footer |
| 6.2 | Cookie consent (nếu có tracking) | Banner cho EU user / Vietnam Decree 13 |
| 6.3 | GDPR data export/delete (nếu serve EU) | API hoặc support process |
| 6.4 | Vietnam Decree 13/2023 (PDPA) | Consent rõ ràng cho thu thập PII |
| 6.5 | Industry-specific (nếu có): PCI DSS for payment, HIPAA for health | Verified |

---

## 7. Operations (6 items)

| # | Check | Expected |
|---|-------|----------|
| 7.1 | Runbook documented | `docs/runbooks/` cho top 5 alert types (DB down, high error rate, deploy fail...) |
| 7.2 | On-call rotation | Defined, trained, tested |
| 7.3 | Incident response process | Có template (xem `incident-response` skill) |
| 7.4 | Status page | statuspage.io / instatus / self-hosted |
| 7.5 | Deploy process documented | Xem `deployment-pipeline` skill được follow |
| 7.6 | Rollback tested | Đã test rollback ít nhất 1 lần trên staging |

---

## 8. Cost (4 items)

| # | Check | Expected |
|---|-------|----------|
| 8.1 | Cloud bill alert | Budget alert 50%/80%/100% threshold |
| 8.2 | AI API cost monitor | Daily spend dashboard (Anthropic/OpenAI) |
| 8.3 | Resource right-sizing | KHÔNG over-provision (instance size, DB tier) |
| 8.4 | Auto-scaling rules | Defined max instances → tránh runaway cost |

---

## Audit Report Template

Save vào `docs/audit/production-readiness-YYYY-MM-DD.md`:

```markdown
# Production Readiness Audit — <Project> — 2026-05-15

**Auditor:** @<name>
**Verdict:** GO / NO-GO

## Summary
- Total items: 50
- Pass: X
- Fail: Y
- N/A: Z

## Failures (must fix before launch)
| ID | Item | Severity | Owner | ETA |
|----|------|----------|-------|-----|
| 1.5 | npm audit có 2 critical | HIGH | @dev | 2026-05-16 |
| 3.4 | Chưa có metrics dashboard | MEDIUM | @devops | 2026-05-17 |

## Warnings (recommended pre-launch)
| ID | Item | Note |
|----|------|------|
| 4.5 | CDN chỉ setup cho /static, chưa cho /api | Defer to post-launch |

## Sign-off
- [ ] Tech Lead: @<name> ___________________
- [ ] CEO/Product: @<name> ___________________

## Re-audit scheduled: 2026-11-15 (6 months)
```

---

## Khi nào dùng skill này

- ✅ Trước khi launch dự án lần đầu (Sprint 11 trong roadmap 12-sprint)
- ✅ Mỗi 6 tháng (re-audit)
- ✅ Sau khi đổi infrastructure lớn (đổi cloud provider, thêm region, thêm service mới)
- ✅ Sau incident lớn (thêm checks dựa trên root cause)

---

**Phát triển bởi Quân Nguyễn — Launch like a pro. Or don't launch yet.**
