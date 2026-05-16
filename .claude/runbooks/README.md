# Runbooks — Quân Nguyễn

> **Khác với `.claude/skills/`**: Runbooks là **playbook/checklist con người follow** (có AI hỗ trợ), không phải capability mà Claude tự thực thi. Đây là sự khác biệt quan trọng — runbook không được auto-discovery như skill.

## Khi nào dùng

Khi bạn (developer / on-call / release manager) đang **đối mặt một tình huống production thật** và cần làm theo từng bước có structure để không sót:

| Runbook | Khi nào mở |
|---------|-----------|
| [`deployment-pipeline`](deployment-pipeline/SKILL.md) | Mỗi lần deploy lên production — 5 phase bắt buộc |
| [`database-migration-safety`](database-migration-safety/SKILL.md) | Khi release có DB migration — expand-contract pattern, rollback SQL |
| [`incident-response`](incident-response/SKILL.md) | Khi production gãy — triage P0-P3, mitigate, postmortem |
| [`observability-setup`](observability-setup/SKILL.md) | 1 lần / dự án (Sprint 0-1) — Sentry + Better Stack + alerts |
| [`production-readiness-audit`](production-readiness-audit/SKILL.md) | 1 lần trước launch (Sprint 11) — 50-item checklist |

## Cách invoke

```
"Tôi đang deploy v1.5.0 lên prod, mở deployment-pipeline runbook."
"Prod đang 5xx, cần incident-response runbook ngay."
```

Bạn gõ tên runbook **explicit**, không expect Claude auto-trigger.

## Tại sao tách khỏi skills/?

- **Skill** = capability AI có thể auto-trigger (vd: `tdd`, `code-review`, `pr-description`)
- **Runbook** = checklist con người theo (vd: deploy prod, incident triage)

Trước v4.0 cả hai trộn vào `skills/` → mờ ranh giới, user không biết "ai làm" vs "tôi follow". v4.0 tách rõ.

Runbook vẫn dùng frontmatter `name:` + `description:` giống skill cho consistency, nhưng đóng vai khác.
