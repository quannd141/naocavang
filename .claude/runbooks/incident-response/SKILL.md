---
name: incident-response
description: Runbook khi production gãy. Triage (P0-P3) → Mitigate (rollback hay hotfix?) → Comms (status page, user) → Postmortem (5 whys + action items). Mục tiêu MTTR < 30 phút cho P0.
tags: [devops, incident, on-call, postmortem, sre]
---

Bạn là **Incident Commander (IC)** của Quân Nguyễn. Khi production gãy, mọi quyết định phải:
- **Nhanh** — mỗi phút downtime = mất tiền + niềm tin user
- **Có cấu trúc** — không panic, không "cứ thử xem"
- **Có ghi chép** — postmortem học hỏi cho lần sau

## Triết lý

> **"Restore trước, hiểu sau. Mitigation > Root cause analysis trong 30 phút đầu."**

Sai lầm phổ biến nhất: dành 1 giờ debug root cause trong khi rollback tốn 5 phút.

---

## Phase 0 — DETECT (target: < 5 phút từ khi xảy ra)

Incident được phát hiện qua:
- Sentry alert → error rate spike
- Better Stack → uptime check fail
- Datadog → p99 latency spike
- User report (Slack #support, email)

**Khi alert fire:**
1. Acknowledge trong PagerDuty/OpsGenie để team biết có người đang xử lý
2. Open Slack channel mới: `#incident-YYYY-MM-DD-<short-name>` (VD `#incident-2026-05-15-api-down`)
3. Pin message đầu tiên: severity assessment + timeline starts now

---

## Phase 1 — TRIAGE (target: < 5 phút)

### Severity Levels

| Sev | Định nghĩa | Ví dụ | Response |
|-----|-----------|-------|----------|
| **P0** | Service hoàn toàn down hoặc data loss | API trả 500 hết, DB unreachable, payment double-charged | Drop everything, all hands |
| **P1** | Critical feature broken cho >25% user | Login fail, checkout fail, OAuth gãy | IC + 1-2 dev, page on-call |
| **P2** | Degraded performance hoặc 1 feature không quan trọng | Slow response 2-3s, 1 marketplace integration down | Business hours, normal channel |
| **P3** | Minor bug, cosmetic | UI lỗi 1 page, text typo | Backlog ticket, no rush |

### Quick assessment questions

- Có bao nhiêu user bị ảnh hưởng?
- Có data loss không? Có security exposure không?
- Có thể rollback không (deploy gần đây)?
- Có workaround cho user không?

### Action by severity

- **P0**: Comms ngay → status page update "Investigating" → bắt đầu Phase 2
- **P1**: Comms internal → bắt đầu Phase 2 trong 10 phút
- **P2/P3**: Tạo ticket, fix theo backlog

---

## Phase 2 — MITIGATE (target: < 30 phút cho P0)

**Quy tắc vàng**: ưu tiên restore service, không phải hiểu vấn đề.

### Decision tree

```
Vấn đề bắt đầu sau lần deploy gần đây nhất?
├── YES → ROLLBACK ngay (xem `deployment-pipeline` rollback procedure)
│         Sau khi service xanh → chuyển Phase 3
│
└── NO → Vấn đề là gì?
    ├── DB issue?
    │   ├── Connection pool exhausted → tăng pool size, restart app
    │   ├── Slow query → kill query, add index sau
    │   ├── Disk full → expand volume / cleanup old data
    │   └── Replication lag → switch traffic to primary
    │
    ├── External service down?
    │   ├── Có circuit breaker → activate fallback
    │   ├── Không có → disable feature dùng service đó (feature flag)
    │   └── Status page nhà cung cấp → wait + comms
    │
    ├── Traffic spike?
    │   ├── Bot attack → enable rate limit / Cloudflare under attack mode
    │   ├── Legit spike → scale up instances
    │   └── DDoS → engage Cloudflare / Vercel DDoS protection
    │
    ├── Memory leak / OOM?
    │   └── Restart instances, set up auto-restart cron tạm
    │
    └── Unknown → ROLLBACK to last known good deploy + investigate
```

### Mitigation logging

Trong incident channel, log MỖI action:
```
14:32 - IC @quan: Started rollback to v1.2.2
14:35 - IC @quan: Rollback complete, monitoring
14:38 - IC @quan: Error rate back to 0.4% (baseline)
14:38 - IC @quan: Service restored. Moving to comms phase.
```

---

## Phase 3 — COMMS

Trong và sau khi mitigate.

### Stakeholders

| Audience | Channel | Frequency | Content |
|----------|---------|-----------|---------|
| Internal team | Slack #incident-* | Real-time | Mọi action, mọi finding |
| Other engineers | Slack #engineering | Mỗi 15-30 phút | Status update |
| Leadership | Email/Slack DM | Khi P0 confirm + khi resolve | Brief: impact + ETA |
| Users (P0/P1) | Status page | Khi confirm + mỗi 30 phút + khi resolve | Honest, không kỹ thuật quá |
| Users (post-mortem) | Email/Blog | Trong 7 ngày | Apology + what happened + what we'll do |

### Status page template

```markdown
[INVESTIGATING] 14:32 UTC+7
We're investigating reports of API errors affecting login.
Some users may be unable to sign in.

[IDENTIFIED] 14:40 UTC+7
We've identified the issue and are deploying a fix.

[MONITORING] 14:50 UTC+7
A fix has been deployed and we're monitoring the results.
Login should be working again. Please report if you still see issues.

[RESOLVED] 15:05 UTC+7
This incident has been resolved. We apologize for the disruption.
A detailed postmortem will be published within 7 days.
```

**Tone rules:**
- Honest, không che dấu
- Không tech jargon ("API 500" → "trouble loading data")
- Thường xuyên update, kể cả "vẫn đang investigate"
- Apology + commitment to learn

---

## Phase 4 — POSTMORTEM (trong 7 ngày)

**Blameless** — không đổ lỗi cá nhân, focus vào hệ thống cho phép lỗi xảy ra.

### Template `docs/postmortems/YYYY-MM-DD-<short-name>.md`

```markdown
# Postmortem: <Incident Title>

**Date:** 2026-05-15
**Duration:** 14:30 - 15:05 UTC+7 (35 phút)
**Severity:** P0
**Author:** @<name>
**Reviewers:** @tech-lead, @<involved>

## Summary
1-2 câu: cái gì xảy ra, ảnh hưởng ai, kéo dài bao lâu.

## Impact
- Số user ảnh hưởng: ~847 (toàn bộ active users)
- Revenue impact: ước ~3M VND (35 phút × throughput)
- SLA breach: YES (uptime 99.9% target → 99.85%)
- Data loss: NONE

## Timeline (UTC+7)
- **14:25** Deploy v1.2.3 hoàn thành
- **14:30** Sentry alert: error rate 12% (baseline 0.4%)
- **14:31** On-call @quan acknowledge
- **14:32** IC @quan tạo channel, assess P0
- **14:35** Rollback to v1.2.2 triggered
- **14:38** Error rate quay về 0.4%
- **14:40** Status page updated
- **15:05** Marked resolved

## Root Cause (5 Whys)
1. **Why** API 500? → New ORM query throw uncaught exception
2. **Why** uncaught? → Migration đổi column type chưa apply trên prod
3. **Why** chưa apply? → Migration script bị skip do prisma migrate deploy fail silent
4. **Why** silent fail? → CI script không check exit code của migrate
5. **Why** không có check? → Pipeline thiếu Phase 3 verification (deployment-pipeline skill chưa adopt)

## What went well
- Detection trong 5 phút (Sentry alert tốt)
- Rollback fast (3 phút)
- Communication clear

## What went poorly
- Migration broke không phát hiện trên staging
- CI không catch migration fail
- Status page update chậm (10 phút sau alert)

## Action Items
| # | Action | Owner | Due | Priority |
|---|--------|-------|-----|----------|
| 1 | Add migration verification step trong CI | @devops | 2026-05-22 | HIGH |
| 2 | Adopt `deployment-pipeline` skill cho mọi prod deploy | @tech-lead | 2026-05-29 | HIGH |
| 3 | Auto-update status page trên Sentry alert | @devops | 2026-06-15 | MEDIUM |
| 4 | Run staging với data clone từ prod weekly | @devops | 2026-06-30 | MEDIUM |

## Lessons Learned
- Migration safety quan trọng hơn deploy speed
- Silent failures là kẻ thù — mọi CI step phải check exit code
- Cần adopt formal deployment-pipeline cho mọi release
```

### Postmortem review meeting (trong 14 ngày)
- Đọc lại postmortem cùng team
- Validate action items có owner + due date
- Track action items trong sprint sau

---

## On-call Rotation

### Setup
- 1 person primary, 1 backup
- Rotation weekly
- Hand-off Monday morning với 15 phút sync (open issues, recent deploys)
- On-call comp: tiền hoặc time-off

### On-call kit (laptop bag)
- Laptop with VPN
- Phone with PagerDuty app
- Backup hotspot
- Runbook printed (worst case khi mất internet)

### Runbook location
`docs/runbooks/<scenario>.md` — VD:
- `docs/runbooks/db-connection-pool-exhausted.md`
- `docs/runbooks/payment-webhook-failing.md`
- `docs/runbooks/full-outage.md`

---

## Anti-patterns

- ❌ Debug 1 giờ trước khi rollback
- ❌ "Để xem nó tự fix không" cho P0
- ❌ Postmortem không có action item — vô nghĩa
- ❌ Đổ lỗi cá nhân: "Vì @X deploy ẩu" → fix process, không đổ người
- ❌ Status page im lặng — user nghĩ bạn đang giấu

---

## Liên kết skills khác

- `deployment-pipeline` — rollback procedure ở Phase 4
- `database-migration-safety` — nếu incident liên quan migration
- `observability-setup` — cần setup trước để có alert phát hiện incident

---

**Phát triển bởi Quân Nguyễn — Incidents are inevitable. Bad responses are not.**
