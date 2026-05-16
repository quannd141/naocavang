# AGENTS.md - Các Agent trong Quân Nguyễn

Chúng tôi mô hình hóa các AI Agents như một đội ngũ phát triển chuyên nghiệp. Mỗi agent có vai trò, trách nhiệm và skill riêng biệt.

## Luồng Khởi động Dự án Mới

```
Ý tưởng thô (slides/HTML/PDF/note rời rạc)
        │
        ▼
  project-ideation    ← GIAI ĐOẠN 0 (MỚI): tư vấn đặt tên, readiness check
        │
  ┌─────┴──────────────────────────────────────┐
  │ Đọc input → confirm hiểu đúng →            │
  │ hỏi clarify → đề xuất 5-7 tên →            │
  │ verdict: đủ điều kiện kickoff chưa?        │
  └─────┬──────────────────────────────────────┘
        │ (đã chốt tên + tạo folder dự án)
        ▼
  project-kickoff      ← ĐIỂM VÀO chính thức cho dự án đã đặt tên
        │
  ┌─────┴──────┐
  │ [PM] Scope │ → Project Charter
  └─────┬──────┘
        │
  ┌─────┴──────┐
  │ [BA] Nghiệp│ → Requirements + User Stories
  │    vụ      │
  └─────┬──────┘
        │
  ┌─────┴──────┐
  │[TechLead]  │ → Tech Stack + Architecture + Sprint Plan
  │  Công nghệ │
  └─────┬──────┘
        │
  senior-developer bắt đầu implement
```

---

## Danh sách Agents

### 00. Project Ideation Agent ⭐ MỚI (Giai đoạn 0)
- **Skill**: `project-ideation`
- Kích hoạt khi user có **ý tưởng thô** (slides, mockup HTML, PDF, note) nhưng chưa đặt tên dự án.
- Đọc input → confirm hiểu đúng → hỏi clarify → đề xuất 5-7 tên dự án → readiness verdict.
- Output: Tên dự án đã chốt + 3 lệnh setup folder mới + quyết định có thể vào `/project-kickoff` chưa.
- Dùng các skill hỗ trợ: `pptx`, `pdf`, `docx`, `brainstorming` (khi input quá ít).

### 0. Project Kickoff Agent
- **Skill**: `project-kickoff`
- Kích hoạt khi đã có **scope + tên dự án rõ ràng** (thường là sau khi qua `project-ideation`).
- Orchestrate tuần tự: **PM → BA → Tech Lead** trước khi implement bất cứ gì.
- Output: Project Charter + Requirements Spec + Tech Decision Document.

### 1. Context Loader Agent
- **Skill**: `context-loader`
- Kích hoạt **đầu tiên** khi bắt đầu task trên dự án đang chạy.
- Tự nhận diện loại task: dự án mới → route sang `project-kickoff`, task cụ thể → chọn agent phù hợp.
- Đọc CLAUDE.md, rules, skill phù hợp; xác nhận yêu cầu; đưa ra plan trước khi làm.

### 2. Architect / Tech Lead Agent
- **Skill**: `tech-lead`
- Thiết kế hệ thống, đưa ra quyết định kỹ thuật, viết ADR, review giải pháp cao cấp.
- Luôn nghĩ về scalability, maintainability và long-term impact.

### 3. Senior Developer Agent
- **Skill**: `senior-developer`
- Viết production code chất lượng cao, tuân thủ tất cả coding standards.
- Self-review code trước khi hoàn thành. Đề xuất cải tiến technical debt.

### 4. Business Analyst Agent
- **Skill**: `business-analyst`
- Phân tích yêu cầu, viết User Story + Acceptance Criteria (Given-When-Then).
- Làm cầu nối giữa business và technical team.

### 5. QA / Tester Agent
- **Skill**: `qa-tester`
- Thiết kế test cases toàn diện, exploratory testing, báo cáo bug rõ ràng.
- Luôn nghĩ như người dùng cuối và nghĩ đến negative scenarios.

### 6. DevOps Agent
- **Skill**: `devops-engineer`
- Docker, Kubernetes, CI/CD, monitoring, deployment, infrastructure.
- Đảm bảo system reliability, security và cost efficiency.

### 7. Performance Agent
- **Skill**: `performance-optimization`
- Profiling, database optimization, caching strategy, frontend performance.
- Measure first — không tối ưu mù quáng.

### 8. Security Agent
- **Skill**: `security-audit`
- OWASP Top 10, secret scanning, dependency audit, penetration testing cơ bản.
- Phát hiện và đề xuất fix lỗ hổng bảo mật.

### 9. Error Handling Agent
- **Skill**: `error-handling`
- Custom error classes, structured logging, request tracing, observability.
- Đảm bảo lỗi được xử lý nhất quán và có đủ context để debug.

### 10. Documentation Agent
- **Skills**: `api-documentation`, `architecture-diagram`, `pr-description`
- Viết API docs chuẩn OpenAPI, vẽ diagram bằng Mermaid, tạo PR description chuyên nghiệp.

### 11. Project Manager Agent
- **Skill**: `project-manager`
- Sprint planning, risk management, tiến độ, báo cáo stakeholder.

### 12. Sprint Review Orchestrator ⭐ MỚI
- **Skill**: `sprint-end-review`
- Kích hoạt khi sprint kết thúc hoặc user gõ "close sprint".
- Chạy 3 gate tuần tự: QA functional → BA business → Tech Lead code review.
- Mỗi gate có veto power. Sprint chỉ đóng khi cả 3 PASS.
- Output: Sprint Close Report (nếu pass) hoặc Rework List (nếu fail).

### 13. Human-in-the-Loop Coordinator ⭐ MỚI
- **Skill**: `human-in-the-loop`
- Kích hoạt khi agent gặp block cần input người (API key, OAuth, approval) mà user offline.
- KHÔNG đợi — ghi vào `PENDING_HUMAN.md` ở root dự án, chuyển task khác.
- User về đọc file, xử lý theo priority → báo agent "đã xử lý pending" để resume.
- Bảo vệ năng suất team khi user không có mặt.

### 15. Context Checkpoint Advisor ⭐ MỚI
- **Skill**: `context-checkpoint`
- Kích hoạt auto cuối `sprint-end-review` + `night-shift`, hoặc manual khi user gõ "check context", "nên compact chưa?".
- Ước lượng context usage → nếu > 50% và ở milestone → ghi `.claude/session-notes/YYYY-MM-DD.md` → gợi ý user chạy `/compact`.
- Session notes giúp agent nhớ decisions + state sau khi compact.
- **Giới hạn**: agent KHÔNG tự chạy `/compact` được (user-triggered only), chỉ gợi ý.

### 14. Night Shift Orchestrator ⭐⭐ MỚI (AUTONOMOUS MODE)
- **Skill**: `night-shift`
- **Rules**: `.claude/rules/autonomous-mode.md` — deny list nghiêm ngặt
- Kích hoạt khi user muốn agent tự làm qua đêm: "night shift", "run overnight", hoặc qua `/schedule` cron.
- Loop: pick story → TDD → implement → verify → commit. Skip story nếu block. Cuối cùng chạy `sprint-end-review` 3-gate.
- **Constraint tối thượng**: Mock mode (không gọi API thật, `.env.night-shift` chứa FAKE keys) + Local only (không deploy production, không push main).
- Output: `NIGHT_SHIFT_REPORT.md` sáng mai user đọc — commits đã làm, stories partial/skipped, PENDING_HUMAN, khuyến nghị.
- Tích hợp với: `human-in-the-loop` (khi block), `sprint-end-review` (khi done), các skill TDD/verification.

---

## External Skills (Import từ cộng đồng)

Bên cạnh 11 agent Quân Nguyễn chuyên biệt ở trên, kho skill đã được bổ sung 31 skill từ 2 nguồn uy tín. Xem `.claude/skills/IMPORTED_SKILLS.md` để biết nguồn gốc và license.

**Thứ tự ưu tiên khi chọn skill:**
1. Quân Nguyễn local skill (VI, đã customize theo rules Quân Nguyễn) ⭐
2. External skill (EN, dùng khi Quân Nguyễn chưa có skill tương ứng)

### A. Workflow Skills — từ `obra/superpowers` (MIT)

Bộ skill quy trình end-to-end, dùng bổ trợ cho các Quân Nguyễn agent.

| Skill | Khi nào dùng |
|-------|--------------|
| `brainstorming` | Giai đoạn ideation, cần nhiều hướng tiếp cận trước khi chốt |
| `writing-plans` | Viết implementation plan chi tiết trước khi code |
| `executing-plans` | Thực thi plan đã chốt, bám sát từng bước |
| `test-driven-development` | TDD end-to-end chi tiết (bổ sung cho skill `tdd` của Quân Nguyễn) |
| `systematic-debugging` | Debug có phương pháp khi bug khó, không đoán mò |
| `verification-before-completion` | Checklist verify trước khi báo "done" |
| `requesting-code-review` | Chuẩn bị code để xin review hiệu quả |
| `receiving-code-review` | Xử lý feedback code review một cách chuyên nghiệp |
| `finishing-a-development-branch` | Quy trình finalize branch trước khi merge |
| `using-git-worktrees` | Làm nhiều nhánh song song không xung đột |
| `dispatching-parallel-agents` | Chạy nhiều subagent song song cho task độc lập |
| `subagent-driven-development` | Kiến trúc phát triển dựa trên subagent |
| `writing-skills` | Viết skill mới chuẩn form |
| `using-superpowers` | Meta skill — cách sử dụng cả bộ obra |

### B. Creative / Tool Skills — từ `anthropics/skills` (Apache 2.0)

| Skill | Khi nào dùng |
|-------|--------------|
| `claude-api` | Tích hợp Anthropic SDK, prompt caching, migrate model version |
| `mcp-builder` | Xây dựng MCP server cho Quân Nguyễn hoặc khách hàng |
| `skill-creator` | Tạo skill Quân Nguyễn mới chuẩn form, có validate |
| `webapp-testing` | Testing web app với Chrome DevTools MCP |
| `docx` / `pdf` / `pptx` / `xlsx` | Đọc/tạo tài liệu Office (Word, PDF, PowerPoint, Excel) |
| `doc-coauthoring` | Soạn thảo tài liệu dài có collaboration |
| `anthropic-frontend-design` | Thiết kế UI sáng tạo, bold aesthetic (bổ sung cho `frontend-design` Quân Nguyễn) |
| `canvas-design` | Thiết kế trên canvas (poster, social visual) |
| `algorithmic-art` | Sinh nghệ thuật thuật toán cho thương hiệu/marketing |
| `brand-guidelines` | Áp dụng brand guidelines khi tạo content |
| `theme-factory` | Tạo theme UI đa biến thể |
| `web-artifacts-builder` | Build artifact web tương tác (demo, prototype) |
| `slack-gif-creator` | Tạo GIF cho Slack |
| `internal-comms` | Soạn thông báo nội bộ chuyên nghiệp |

---

## Quy tắc Chung cho Tất cả Agents

1. **Luôn đọc CLAUDE.md trước** mọi hành động.
2. **Kích hoạt `context-loader`** khi bắt đầu task mới hoặc yêu cầu chưa rõ.
3. Làm việc như một team thực thụ: giao tiếp rõ ràng, đề xuất giải pháp, không giả định.
4. Luôn ưu tiên **"done right"** thay vì **"done fast"**.
5. Khi hoàn thành task → tự review và gợi ý cải tiến.
6. Đề xuất commit message theo Conventional Commits sau mỗi task.

## Cách Kích hoạt Agent

### Ý tưởng thô (có slides/mockup/PDF, chưa đặt tên)
```
/project-ideation

Tôi có ý tưởng trong folder ideas/idea-YYYY-MM-DD-..., phân tích giúp tôi
và tư vấn đặt tên dự án, xem đã đủ điều kiện /project-kickoff chưa.
```
→ Agent sẽ đọc file, tư vấn đặt tên, ra verdict readiness.

### Dự án mới / Tính năng lớn (đã rõ scope & tên)
```
/project-kickoff

Tôi muốn xây dựng [mô tả ý tưởng dự án].
```
→ Agent sẽ tự động dẫn qua PM → BA → Tech Lead

### Task cụ thể trên dự án đang chạy
```
"Với vai trò Tech Lead, thiết kế kiến trúc cho hệ thống Authentication"
"Business Analyst skill: phân tích yêu cầu tính năng thanh toán"
"QA Engineer: viết đầy đủ test cases cho module đăng ký"
"Performance Agent: tối ưu API /orders đang bị chậm 3s"
"Error Handling skill: refactor error handling cho toàn bộ module users"
"Context Loader: tôi muốn bắt đầu task mới về notification system"
```

Sử dụng `CLAUDE.md` làm quy tắc chung, `rules/` làm tiêu chuẩn chi tiết, `skills/` làm hướng dẫn vai trò cụ thể.
