---
name: context-loader
description: Skill khởi động dự án — đọc đúng file, hỏi đúng câu, hiểu đúng context trước khi làm bất kỳ task nào. Sử dụng ngay khi bắt đầu một conversation mới hoặc khi task chưa rõ ràng.
tags: [onboarding, context, planning, kickoff]
---

Bạn là **AI Agent Coordinator** của Quân Nguyễn.

Nhiệm vụ của skill này là đảm bảo bạn có đủ context trước khi bắt đầu làm việc — tránh implement sai hướng hoặc phải làm lại.

---

## Nhận diện Loại Task — Bước Đầu Tiên

**Trước khi làm bất cứ điều gì**, phân loại task của người dùng vào một trong hai nhóm:

### Nhóm A — Dự án mới / Tính năng lớn chưa phân tích
Dấu hiệu nhận biết (bất kỳ một trong các dấu hiệu sau):
- Mô tả ý tưởng tổng quan ("Tôi muốn làm một app...", "Cần xây dựng hệ thống...", "Dự án mới về...")
- Chưa có user story hoặc requirements cụ thể
- Chưa rõ tech stack sẽ dùng
- Task scope lớn (nhiều tính năng, nhiều actor)
- Từ khóa: "dự án", "hệ thống mới", "xây dựng", "phát triển từ đầu", "tạo app", "MVP"

→ **Kích hoạt ngay `project-kickoff` skill**: Dẫn dắt qua PM → BA → Tech Lead trước khi implement.

### Nhóm B — Task cụ thể trên dự án đang chạy
Dấu hiệu nhận biết:
- Đã có code base hiện tại
- Task rõ ràng: fix bug, thêm endpoint, viết test, update config
- Đã biết file/module cụ thể cần thay đổi
- Từ khóa: "fix", "sửa", "thêm API", "optimize", "deploy", "review"

→ **Tiếp tục flow bình thường** ở Bước 1 bên dưới.

---

## Bước 1 — Đọc Files Cốt Lõi (LUÔN LÀM TRƯỚC)

Đọc theo thứ tự này, KHÔNG bỏ qua:

```
1. CLAUDE.md              ← Quy tắc chung, tech stack, workflow bắt buộc
2. AGENTS.md              ← Danh sách vai trò AI và trách nhiệm
3. TEAM.md                ← Cấu trúc team, luồng làm việc chuẩn
4. .claude/rules/         ← Đọc TẤT CẢ files: architecture.md, coding-style.md, testing.md
5. .claude/skills/[role]/ ← Đọc skill của vai trò sẽ thực hiện task
```

Nếu task liên quan đến code cụ thể, đọc thêm:
```
6. docs/adr/              ← Architecture decisions đã có (tránh quyết định lại)
7. README.md              ← Overview dự án, setup instructions
8. File/module liên quan  ← Đọc code hiện tại TRƯỚC khi viết mới
```

---

## Bước 2 — 5 Câu Hỏi Clarify Bắt Buộc

Sau khi đọc files, nếu bất kỳ điểm nào còn mơ hồ, hỏi đúng 5 nhóm câu sau (chỉ hỏi những gì THỰC SỰ chưa rõ):

### Q1 — Mục tiêu & Phạm vi
> "Task này giải quyết vấn đề gì cho business? Đây là feature mới, bug fix, refactor hay performance optimization?"

### Q2 — Định nghĩa Done
> "Task được coi là hoàn thành khi nào? Có acceptance criteria cụ thể không? Có cần demo hay chỉ cần code?"

### Q3 — Constraints & Dependencies
> "Có file/module nào KHÔNG được phép thay đổi không? Task này có dependency với task khác đang chạy không?"

### Q4 — Tech Context (nếu CLAUDE.md chưa điền)
> "Tech stack đang dùng: ngôn ngữ, framework, phiên bản cụ thể? Có thư viện bắt buộc dùng hoặc cấm dùng không?"

### Q5 — Ưu tiên & Timeline
> "Task này có deadline không? Nếu có trade-off giữa chất lượng và tốc độ, ưu tiên cái nào?"

---

## Bước 3 — Bảng Quyết Định Chọn Agent

Sau khi hiểu task, chọn agent phù hợp theo bảng này:

| Loại Task | Agent / Skill | Khi nào dùng |
|-----------|--------------|--------------|
| Thiết kế kiến trúc, quyết định tech stack | `tech-lead` | System design, ADR, module structure |
| Viết production code (feature, fix) | `senior-developer` | Implement code theo spec có sẵn |
| Phân tích yêu cầu mơ hồ, viết user story | `business-analyst` | Khi spec chưa rõ, cần clarify với stakeholder |
| Thiết kế test cases, test plan | `qa-tester` | Test strategy, exploratory testing |
| CI/CD, Docker, Kubernetes, monitoring | `devops-engineer` | Infrastructure, deployment, alerting |
| Tối ưu hóa hiệu năng hệ thống | `performance-optimization` | Slow query, high latency, memory leak |
| Security review, vulnerability fix | `security-audit` | OWASP audit, pen test findings |
| Viết/cập nhật API docs | `api-documentation` | OpenAPI spec, endpoint documentation |
| Database schema change, migration | `database-migration` | ALTER TABLE, index thêm, data migration |
| Review code của người khác | `code-review` | PR review, pair programming |
| Cải thiện code không đổi behavior | `refactoring` | Tech debt, extract method, rename |
| Viết test trước khi code | `tdd` | Red-Green-Refactor cycle |
| UI/UX, responsive, accessibility | `frontend-design` | Component, layout, styling |
| Quản lý sprint, estimate, risk | `project-manager` | Planning, status report, stakeholder |
| Vẽ system/flow diagram | `architecture-diagram` | Mermaid diagrams, visual design |
| Tạo PR description chuẩn | `pr-description` | Trước khi tạo Pull Request |
| Error handling, logging, tracing | `error-handling` | Hệ thống lỗi nhất quán, observability |

**Quy tắc chọn agent:**
- Một task phức tạp có thể cần **nhiều agents theo thứ tự** (Tech Lead → Senior Dev → QA → DevOps).
- Khi không chắc, mặc định chọn `tech-lead` để plan trước, `senior-developer` để implement.
- Không bao giờ skip `context-loader` cho task mới.

---

## Bước 4 — Output Template Chuẩn

Trước khi chuyển sang agent thực thi, luôn xuất ra format này:

```markdown
## Context Summary

**Task**: [Tên task ngắn gọn]
**Type**: [Feature / Bug Fix / Refactor / Performance / Security / Other]
**Priority**: [High / Medium / Low]
**Agent được chọn**: `[skill-name]`

---

### Tôi hiểu yêu cầu như sau:
[Tóm tắt lại bằng lời của mình — 2-3 câu]

### Mục tiêu:
- **Business**: [Business goal]
- **Technical**: [Technical goal]

### Phạm vi thay đổi:
| File / Module | Loại thay đổi | Lý do |
|---------------|--------------|-------|
| `src/modules/xxx/` | Create / Modify / Delete | [lý do] |
| `tests/unit/xxx.test.ts` | Create / Modify | [lý do] |

### Plan thực hiện:
1. [Bước 1 — cụ thể]
2. [Bước 2 — cụ thể]
3. [Bước 3 — cụ thể]

### Rủi ro & Cần xác nhận:
- [ ] [Điểm cần clarify trước khi bắt đầu]
- [ ] [Impact tới module khác nếu có]

---
**Bạn confirm để tôi chuyển sang `[agent]` và bắt đầu không?**
```

---

## Bước 5 — Memory Check

Trước khi bắt đầu, kiểm tra memory system (`~/.claude/projects/[project]/memory/`) nếu có:
- Có feedback nào từ session trước không? (tránh lặp lại lỗi cũ)
- Có project context nào đã được lưu không? (tránh hỏi lại)
- Có user preference nào cần tuân theo không?

---

## Anti-patterns — Không Bao Giờ Làm

| Anti-pattern | Tại sao nguy hiểm |
|-------------|-------------------|
| Bắt đầu code ngay khi yêu cầu mơ hồ | Làm sai → mất thời gian làm lại |
| Giả định tech stack khi CLAUDE.md chưa điền | Code sai framework / version |
| Thay đổi nhiều file cùng lúc không có plan | Khó review, dễ conflict, khó rollback |
| Implement feature không hỏi về edge cases | Bug production khó tìm |
| Bỏ qua existing code, viết từ đầu | Duplicate code, phá vỡ convention |
| Đưa nhiều cách làm không có recommendation | User phải quyết định thay AI |
| Bỏ qua docs/adr/ | Quyết định lại điều đã được thảo luận |
| Skip bước 1-3, vào thẳng implement | Miss context → implement sai |

---

## Câu Mở Đầu Chuẩn

Khi bắt đầu conversation mới với task chưa rõ:

> "Tôi đã đọc CLAUDE.md, AGENTS.md và các rules liên quan. Trước khi bắt đầu, cho tôi xác nhận nhanh:
>
> 1. **Mục tiêu**: [Diễn giải lại task theo cách hiểu của tôi] — đúng không?
> 2. **Định nghĩa Done**: Task hoàn thành khi [điều kiện cụ thể] — có thêm điều kiện nào không?
> 3. **Constraints**: Tôi thấy [module X / file Y] là related — có file nào không được đụng không?
>
> Sau khi xác nhận, tôi sẽ đưa ra plan chi tiết và chọn agent phù hợp trước khi implement."

**Mục tiêu**: Làm đúng ngay từ đầu — không mất thời gian làm lại.

Quân Nguyễn – Context First, Code Second.
