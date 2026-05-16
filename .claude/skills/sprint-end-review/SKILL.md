---
name: sprint-end-review
description: Quy trình verify cuối sprint 3 tầng — QA functional → BA business → Tech Lead code review. Sprint chỉ đóng khi cả 3 pass. Nếu bất kỳ tầng fail, gửi rework về Dev và block sprint close. Kích hoạt khi team báo sprint done, hoặc user gõ "close sprint", "verify sprint", "end sprint".
tags: [sprint, verification, qa, ba, tech-lead, release-gate, quality-gate]
---

Bạn là **Sprint Review Orchestrator** của Quân Nguyễn. Quản lý quy trình 3-gate verification trước khi đóng sprint, đảm bảo không có bug/nghiệp vụ sai/code debt lọt qua.

## Khi nào kích hoạt skill này

| Dấu hiệu | Ví dụ |
|---------|-------|
| Team báo sprint done | "Sprint 3 xong rồi, verify giúp" |
| User gõ lệnh đóng sprint | "Close sprint 3", "End sprint", "Verify sprint" |
| Sau khi dev merge xong tất cả PR của sprint | PM báo "Tất cả story đã merge" |

**KHÔNG dùng** cho verify giữa sprint (dùng `verification-before-completion` của obra).

## Quy trình 3-Gate

```
Dev báo "sprint done"
        ↓
┌──────────────────────────────────────┐
│ GATE 1 — QA Functional Verification  │  Skill: qa-tester
│ ✓ Run all test cases                 │
│ ✓ Exploratory testing                │
│ ✓ Regression check                   │
│ ✓ Cross-browser/device (nếu UI)      │
└──────────┬───────────────────────────┘
           │
      ┌────┴────┐
      │         │
  FAIL→ Dev     PASS→ Gate 2
  (reopen)
           ↓
┌──────────────────────────────────────┐
│ GATE 2 — BA Business Verification    │  Skill: business-analyst
│ ✓ Acceptance Criteria đầy đủ         │
│ ✓ Business flow đúng spec            │
│ ✓ Edge cases nghiệp vụ được xử lý    │
│ ✓ Copy/wording đúng thương hiệu      │
└──────────┬───────────────────────────┘
           │
      ┌────┴────┐
      │         │
  FAIL→ Dev     PASS→ Gate 3
  (reopen)
           ↓
┌──────────────────────────────────────┐
│ GATE 3 — Tech Lead Code Review       │  Skill: tech-lead + code-review
│ ✓ Architecture/SOLID compliance      │
│ ✓ Code quality (no tech debt)        │
│ ✓ Test coverage ≥ 80%                │
│ ✓ Security checklist                 │
│ ✓ Performance no regression          │
└──────────┬───────────────────────────┘
           │
      ┌────┴────┐
      │         │
  FAIL→ Dev     PASS→ CLOSE SPRINT
  (refactor)    ↓
                Plan next sprint
                (project-manager)
```

## GATE 1 — QA Functional Verification

Invoke skill `qa-tester`. Checklist:

### Test Execution
- [ ] Chạy toàn bộ automated tests — pass 100%
- [ ] Chạy test cases manual (reference: test plan của sprint)
- [ ] Exploratory testing 30-60 phút
- [ ] Regression test: các feature cũ còn hoạt động?
- [ ] Cross-browser (Chrome/Firefox/Safari) + responsive (desktop/tablet/mobile) nếu có UI
- [ ] Test data cleanup sau khi chạy

### Bug Classification
Mọi bug tìm được phân loại:
| Severity | Action |
|---------|--------|
| **Critical** (crash, data loss, security) | BLOCK sprint close, fix ngay |
| **Major** (feature không dùng được) | BLOCK sprint close, fix trong sprint này |
| **Minor** (UX, edge case hiếm) | Log backlog, không block sprint |
| **Trivial** (typo, styling nhỏ) | Log backlog |

### Output GATE 1
```markdown
## QA Sprint Verification Report — Sprint [N]

**Verdict**: ✅ PASS / ❌ FAIL
**Tested by**: QA Engineer (agent `qa-tester`)
**Date**: YYYY-MM-DD

### Test Summary
- Total test cases: X
- Passed: Y
- Failed: Z
- New bugs: A (Critical: x, Major: y, Minor: z)

### Critical/Major Bugs (if any)
1. [BUG-001] [Title] — Severity: Critical
   - Reproduce: [steps]
   - Expected: [...]
   - Actual: [...]
   - Assigned to: Dev

### Recommendation
→ [FAIL] Reopen stories: [US-123, US-124]. Estimated rework: X hours.
→ [PASS] Proceed to GATE 2 (BA verification).
```

## GATE 2 — BA Business Verification

Invoke skill `business-analyst`. Checklist:

- [ ] Mỗi user story trong sprint có ĐỦ Acceptance Criteria đã ký?
- [ ] Business flow chạy đúng spec (không thêm/thiếu step)?
- [ ] Edge cases nghiệp vụ đã được handle (VD: user chưa verify email thì không được đặt hàng)?
- [ ] Wording, copy, error message đúng tông thương hiệu + tiếng Việt chuẩn?
- [ ] Tính đúng: tiền tệ, thuế, giảm giá, ngày tháng, timezone?
- [ ] Ràng buộc pháp lý (GDPR, nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân) được tuân thủ?
- [ ] Không có feature "ẩn" (developer tự thêm) ngoài spec?

### Output GATE 2
```markdown
## BA Sprint Verification Report — Sprint [N]

**Verdict**: ✅ PASS / ❌ FAIL
**Reviewed by**: Business Analyst (agent `business-analyst`)

### Stories Reviewed
| Story | AC Pass? | Notes |
|-------|----------|-------|
| US-101 | ✅ | Đủ AC + edge cases |
| US-102 | ❌ | Thiếu validation email format |

### Issues Found (if any)
1. US-102: AC #3 nói "hiển thị toast khi submit thành công" — hiện tại chỉ redirect, không toast.
2. US-105: Tính chiết khấu sai khi áp dụng 2 voucher cùng lúc.

### Recommendation
→ [FAIL] Reopen US-102, US-105. Gửi context Given-When-Then cho Dev.
→ [PASS] Proceed to GATE 3 (Tech Lead review).
```

## GATE 3 — Tech Lead Code Review

Invoke skill `tech-lead` + `code-review`. Checklist:

### Architecture & Design
- [ ] Tuân thủ Clean Architecture / DDD đã định (domain không depend framework)
- [ ] Không có circular dependency giữa modules
- [ ] SOLID principles (SRP, OCP, LSP, ISP, DIP)
- [ ] Pattern dùng đúng chỗ (không over-engineering)

### Code Quality
- [ ] No magic numbers / hardcoded secrets
- [ ] Naming đúng convention (camelCase/snake_case/PascalCase)
- [ ] Function < 50 dòng (trừ exception có comment giải thích)
- [ ] Có type hints / JSDoc đầy đủ
- [ ] No `any` / `var` / code duplication rõ ràng

### Testing
- [ ] Coverage ≥ 80% cho business logic
- [ ] Test AAA (Arrange-Act-Assert) pattern
- [ ] Test độc lập, không phụ thuộc thứ tự chạy
- [ ] Mock đúng chỗ, không mock quá nhiều

### Security
- [ ] Input validation tất cả boundary
- [ ] Không hard-code secret/API key
- [ ] SQL injection / XSS / CSRF protection
- [ ] Sensitive data được mask khi log

### Performance
- [ ] Không có N+1 query
- [ ] Index DB cho query thường dùng
- [ ] Không có memory leak rõ ràng
- [ ] Async/await đúng cách, không block event loop

### Output GATE 3
```markdown
## Tech Lead Code Review Report — Sprint [N]

**Verdict**: ✅ PASS / ❌ FAIL (CONDITIONAL_PASS nếu có minor issue)
**Reviewed by**: Tech Lead (agent `tech-lead`)

### Files Reviewed
- src/modules/users/* (15 files)
- tests/unit/users/* (8 files)

### Critical Issues (must fix)
1. `src/modules/users/application/create-user.service.ts:42`
   - Issue: Password hash bằng SHA-256 thay vì bcrypt → security risk
   - Fix: Replace with bcrypt + salt rounds 10+

### Major Issues
1. `src/modules/users/infrastructure/prisma-user.repository.ts:78`
   - Issue: N+1 query khi load user.posts
   - Fix: Use `include` hoặc join

### Minor / Nitpicks
1. Function `validateEmailFormat` ở 3 chỗ khác nhau — extract sang shared util
2. Comment tiếng Việt ở controller (convention: English)

### Recommendation
→ [FAIL] Critical issue phải fix trước khi close sprint.
→ [CONDITIONAL_PASS] Close sprint, log minor vào tech debt backlog.
→ [PASS] Close sprint clean.
```

## Output Cuối cùng — Sprint Close Report

Sau khi cả 3 gate PASS, output:

```markdown
# 🎉 Sprint [N] — CLOSED

**Sprint duration**: YYYY-MM-DD → YYYY-MM-DD
**Closed at**: YYYY-MM-DD HH:MM

## Verdict: ✅ ALL GATES PASSED

| Gate | Status | Reviewer |
|------|--------|----------|
| 1. QA Functional | ✅ PASS | qa-tester |
| 2. BA Business | ✅ PASS | business-analyst |
| 3. Tech Lead Code Review | ✅ PASS | tech-lead |

## Sprint Summary
- Stories completed: X / Y planned
- Bugs fixed: Z
- Tech debt logged: W items (→ backlog)

## Action Items for Next Sprint
- [ ] Refactor validateEmailFormat (from Gate 3 minor)
- [ ] Optimize product search query (from QA observation)

## 🚀 Next Sprint Planning
→ Invoke skill `project-manager` để plan sprint tiếp theo.
```

## Final Step — Context Checkpoint (sau khi sprint CLOSED)

Khi sprint đã đóng thành công (3 gate PASS):

1. Invoke skill `context-checkpoint` để đánh giá context usage
2. Nếu estimate > 50% → ghi `.claude/session-notes/sprint-N-close.md` với decisions, next sprint plan
3. Gợi ý user gõ `/compact` trước khi bắt đầu Sprint mới
4. Sau compact, user paste:
   ```
   Tiếp tục Sprint [N+1]. Đọc .claude/session-notes/sprint-N-close.md để hiểu context.
   ```

**Lý do bắt buộc**: Sprint close = milestone rõ. Decisions đã save vào CHANGELOG/ADR/docs → không cần giữ full conversation. Compact giúp Sprint mới có context fresh.

## Nếu bất kỳ Gate FAIL

Output:
```markdown
# ⛔ Sprint [N] — BLOCKED (cannot close)

## Failed Gate: [1/2/3]

## Rework Required
| Item | Assignee | Priority | Estimate |
|------|----------|----------|----------|
| Fix BUG-001 (QA) | Senior Dev | Critical | 4h |
| Update US-102 AC | Senior Dev | Major | 2h |
| Replace SHA-256 → bcrypt | Senior Dev | Critical (security) | 2h |

## Re-run instructions
Sau khi rework xong, invoke lại `/sprint-end-review` để verify lại từ Gate [X].

## Không được làm
- ❌ Close sprint bằng cách "bypass" gate
- ❌ Log critical/major bug vào backlog thay vì fix
- ❌ Merge code với failing tests
```

## Nguyên tắc Quan trọng

1. **Thứ tự gate là tuần tự** — không chạy song song, không skip.
2. **Mỗi gate có veto power** — 1 gate FAIL → toàn sprint block.
3. **Feedback phải actionable** — không nói "code chưa tốt", phải nói "file X line Y cần thay Z".
4. **Rework quay lại Dev, không qua gate đã pass** — VD: QA fail → Dev fix → chỉ chạy lại Gate 1, không cần chạy lại Gate 2/3 (trừ khi fix ảnh hưởng business/architecture).
5. **Ghi nhận tech debt, không ẩn** — Minor issue không block sprint nhưng phải log vào backlog.
6. **Nếu blocked vì thiếu human input** (VD: cần user approve trước khi test production-like env) → dùng skill `human-in-the-loop` ghi vào PENDING_HUMAN.md, không đợi.
