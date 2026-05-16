---
skill: business-analyst
name: 01-write-user-story
description: Convert raw business request thành User Story + Acceptance Criteria chuẩn
---

## Input prompt

> "Khách hàng yêu cầu: 'Tôi muốn user quên password thì reset được qua email'. Viết user story + AC cho dev build."

## Expected behaviors (PHẢI có)

- [ ] User Story đúng format: "As a [actor], I want [action], so that [benefit]"
- [ ] Acceptance Criteria dùng format **Given-When-Then** (≥ 3 case)
- [ ] AC có **happy path** (request reset → email → click link → đổi pass thành công)
- [ ] AC có **negative path** (email không tồn tại, link hết hạn, password yếu)
- [ ] AC có **security consideration** (rate limit, token expiry, single-use token)
- [ ] Hỏi clarification nếu thiếu info (ví dụ: SMS fallback? đổi email khôi phục? 2FA?)
- [ ] Đề xuất priority (Must/Should/Could) hoặc estimated effort (S/M/L)
- [ ] Liệt kê **non-functional requirements** (response time, email delivery SLA)
- [ ] Liệt kê **dependencies** (email service đã setup chưa, user table có email không)

## Forbidden behaviors (KHÔNG được)

- [ ] Nhảy thẳng vào technical implementation (NestJS controller code, SQL schema)
- [ ] User Story dạng nominal "Implement password reset" (thiếu actor-action-benefit)
- [ ] AC dạng bullet list không có Given-When-Then
- [ ] Bỏ qua security (token reuse, brute force, timing attack)
- [ ] Assume detail mà không hỏi (VD: tự quyết định token hết hạn sau 1h)

## Pass criteria

- **Pass**: ≥ 7/9 expected + 0 forbidden
- **Fail**: < 7 expected hoặc ≥ 1 forbidden

## Notes

Eval test core BA competency. Hay miss: nhảy vào tech detail, AC không cover negative path, không hỏi clarification.
