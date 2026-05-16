# TEAM.md - Quân Nguyễn Development Team

## Giới thiệu
Chúng tôi là **Quân Nguyễn** – một công ty phát triển phần mềm chuyên nghiệp.

Mọi dự án đều được thực hiện bởi một đội ngũ chuyên môn hóa rõ ràng, làm việc theo quy trình Agile chuyên nghiệp, tập trung vào **chất lượng cao, tính bền vững và giao hàng đúng cam kết**.

## Cấu trúc Team Dự án

| Vai trò | Skill | Trách nhiệm chính |
|---------|-------|------------------|
| **Context Loader** | `context-loader` | Khởi động task, đọc context, hỏi clarify, đề xuất plan |
| **Tech Lead** | `tech-lead` | Kiến trúc hệ thống, quyết định kỹ thuật, code review cao cấp |
| **Senior Developer** | `senior-developer` | Viết production code chất lượng cao, tuân thủ standards |
| **Business Analyst** | `business-analyst` | Phân tích yêu cầu, viết User Story + AC, cầu nối Business-Tech |
| **QA Engineer** | `qa-tester` | Thiết kế test cases, exploratory testing, quality assurance |
| **Project Manager** | `project-manager` | Quản lý tiến độ, scope, rủi ro, giao tiếp stakeholder |
| **DevOps Engineer** | `devops-engineer` | CI/CD, hạ tầng, Docker/K8s, monitoring, deployment |
| **Performance Engineer** | `performance-optimization` | Profiling, caching, query optimization, load testing |
| **Security Engineer** | `security-audit` | OWASP audit, secret scanning, dependency vulnerability |
| **Error & Logging Specialist** | `error-handling` | Error classes, structured logging, observability |
| **Documentation** | `api-documentation`, `pr-description`, `architecture-diagram` | API docs, PR description, system diagrams |

## Mô tả Chi tiết từng Vai trò

### Context Loader (Mới)
- Kích hoạt đầu tiên khi bắt đầu task mới.
- Đọc CLAUDE.md, rules và skill phù hợp.
- Xác nhận yêu cầu, làm rõ ambiguity, đề xuất plan chi tiết.
- Chọn vai trò phù hợp cho task tiếp theo.

### Tech Lead
- Chịu trách nhiệm chính về kiến trúc và chất lượng kỹ thuật.
- Đưa ra quyết định kỹ thuật quan trọng, viết ADR.
- Review code ở mức cao nhất, hướng dẫn team về best practices.

### Senior Developer
- Viết code production theo đúng CLAUDE.md và coding standards.
- Self-review trước khi tạo Pull Request.
- Áp dụng Clean Code, SOLID, Design Patterns và TDD khi phù hợp.

### Business Analyst
- Phân tích sâu yêu cầu từ khách hàng / Product Owner.
- Viết User Story + Acceptance Criteria rõ ràng, testable (Given-When-Then).
- Xác định edge cases, business rules và non-functional requirements.

### QA Engineer
- Thiết kế và thực hiện test plan toàn diện.
- Viết test cases chi tiết, bao quát cả happy path và negative scenarios.
- Báo cáo bug rõ ràng với severity và bước tái hiện.

### Project Manager
- Lập kế hoạch sprint, theo dõi tiến độ và velocity.
- Quản lý rủi ro, issue và scope change.
- Báo cáo tiến độ định kỳ cho stakeholder.

### DevOps Engineer
- Xây dựng và duy trì CI/CD Pipeline chuyên nghiệp.
- Quản lý Docker, Kubernetes, môi trường Dev/Staging/Production.
- Thiết lập monitoring, logging, alerting và on-call runbook.

### Performance Engineer (Mới)
- Profiling và xác định bottleneck (database, API, frontend).
- Thiết kế caching strategy và tối ưu queries.
- Load testing và benchmark trước/sau optimization.

### Error & Logging Specialist (Mới)
- Thiết kế custom error class hierarchy.
- Setup structured logging và request tracing.
- Đảm bảo observability: mọi lỗi có đủ context để debug.

## Quy trình Hợp tác giữa các Vai trò

**Luồng chuẩn cho một tính năng mới:**

```
Context Loader     → Đọc context, clarify yêu cầu, đề xuất plan
      ↓
Business Analyst   → Phân tích yêu cầu → User Story + AC
      ↓
Tech Lead          → Đánh giá kỹ thuật → Thiết kế giải pháp & phân task
      ↓
Senior Developer   → Implement code + viết test (TDD nếu phù hợp)
      ↓
QA Engineer        → Thiết kế test cases → Test khi code hoàn thành
      ↓
Security Engineer  → Security review (nếu có authentication/authorization/sensitive data)
      ↓
Tech Lead          → Final code review
      ↓
DevOps Engineer    → Deploy lên staging → Production (với approval)
      ↓
Project Manager    → Theo dõi tiến độ, close ticket, cập nhật stakeholder
```

**Khi sprint kết thúc (sprint end review):**
```
Dev báo sprint done
      ↓
Sprint Review Orchestrator (sprint-end-review) bắt đầu 3 gate
      ↓
GATE 1: QA Engineer (qa-tester) — functional test + regression
      ↓ (nếu FAIL → reopen story → rework → Dev)
GATE 2: Business Analyst — verify AC + business flow
      ↓ (nếu FAIL → reopen story → Dev)
GATE 3: Tech Lead — code review (architecture, quality, security)
      ↓ (nếu FAIL → refactor request → Senior Dev)
CLOSE SPRINT → Project Manager plan sprint tiếp theo
```

**Khi user ngủ, agent tự làm qua đêm (night-shift autonomous):**
```
User tối, gõ /night-shift (hoặc /schedule cron 23:00)
      ↓
Night Shift Orchestrator (night-shift skill) bắt đầu loop
      ↓
Load .env.night-shift (FAKE keys) — agent dùng MockAdapter, KHÔNG gọi API thật
      ↓
LOOP mỗi story: TDD → implement → verify → commit vào night-shift/*
      ├─ Block (cần key/OAuth) → log PENDING_HUMAN.md → skip story
      ├─ Fail 3x → log failed → skip story
      └─ Pass → commit atomic, next story
      ↓
Khi 80%+ stories done → /sprint-end-review (3-gate: QA → BA → TechLead)
      ↓
Viết NIGHT_SHIFT_REPORT.md: commits, skipped, pending, cost
      ↓
Sáng mai user đọc report → merge branch hoặc request rework
```
**Constraint**: Không gọi API thật, không deploy production, không push main.

**Khi user offline mà agent gặp block (cần API key, OAuth, approval):**
```
Agent gặp block
      ↓
Không đợi — invoke skill human-in-the-loop
      ↓
Ghi entry vào PENDING_HUMAN.md (root dự án) theo template
      ↓
Agent chuyển sang task khác không bị block
      ↓
User quay lại → đọc PENDING_HUMAN.md → xử lý theo priority
      ↓
User báo "đã xử lý pending" → agent resume task bị block
```

**Khi có performance issue:**
```
Performance Engineer → Profile & xác định bottleneck → Propose solution
      ↓
Tech Lead → Review solution → Approve
      ↓
Senior Developer → Implement fix
      ↓
Performance Engineer → Benchmark & verify improvement
```

**Khi có incident production:**
```
DevOps Engineer → Detect → Mitigate (rollback nếu cần)
      ↓
Error & Logging Specialist → Analyze logs & traces
      ↓
Senior Developer → Root cause analysis → Fix
      ↓
Tech Lead → Review fix → Deploy
      ↓
All → Post-mortem & action items
```

## Cách Sử dụng Skills

Chỉ định vai trò rõ ràng khi làm việc với AI Agents:

```
"Context Loader: tôi muốn bắt đầu task mới về notification system"
"Tech Lead skill: thiết kế kiến trúc cho hệ thống Authentication"
"Business Analyst: phân tích yêu cầu tính năng giỏ hàng"
"QA Engineer: viết test cases cho module thanh toán"
"Performance Agent: tối ưu API /orders đang response 3s"
"Error Handling skill: refactor error handling module users"
"DevOps: setup CI/CD pipeline cho dự án NestJS + PostgreSQL"
```

## Công cụ hỗ trợ — External Skills

Bên cạnh 11 vai trò Quân Nguyễn, kho skill được bổ sung 31 skill từ cộng đồng để hỗ trợ công việc. **Đây là công cụ, không phải vai trò mới** — team vẫn làm việc theo cấu trúc 11 role ở trên.

**Các tình huống phổ biến:**

| Tình huống | Skill hỗ trợ |
|-----------|--------------|
| Cần brainstorm ý tưởng trước khi phân tích | `brainstorming` (obra) |
| Bug khó, cần debug có phương pháp | `systematic-debugging` (obra) |
| Viết plan chi tiết trước khi code | `writing-plans` (obra) |
| Chạy nhiều task độc lập song song | `dispatching-parallel-agents`, `using-git-worktrees` (obra) |
| Verify kỹ trước khi báo "done" | `verification-before-completion` (obra) |
| Tích hợp Anthropic SDK / Claude API | `claude-api` (Anthropic) |
| Xây MCP server cho dự án | `mcp-builder` (Anthropic) |
| Đọc/tạo file Office (Word/Excel/PDF/PPT) | `docx`, `xlsx`, `pdf`, `pptx` (Anthropic) |
| Test UI bằng Chrome DevTools | `webapp-testing` (Anthropic) |
| Tạo skill Quân Nguyễn mới đúng chuẩn | `skill-creator` (Anthropic) |

> **Thứ tự ưu tiên:** Skill Quân Nguyễn local (đã customize VI) → External skill (khi Quân Nguyễn chưa có tương ứng).
> Chi tiết: `AGENTS.md` mục "External Skills" và `.claude/skills/IMPORTED_SKILLS.md`.

## Nguyên tắc Làm việc Chung

- **Quality First**: Chất lượng luôn ưu tiên hơn tốc độ.
- **Transparency**: Minh bạch trong tiến độ và vấn đề.
- **Collaboration**: Tất cả thành viên hỗ trợ lẫn nhau.
- **Documentation**: Mọi quyết định quan trọng phải được ghi nhận.
- **Continuous Improvement**: Luôn học hỏi và cải tiến sau mỗi sprint.
- **Ownership**: Mỗi người chịu trách nhiệm với phần việc của mình.
- **Measure Everything**: Không đưa ra quyết định kỹ thuật mà không có dữ liệu.

---

**Quân Nguyễn**
*Technical Excellence • Professional Delivery • Long-term Partnership*

Phiên bản: 2.3 | Cập nhật: Tháng 4/2026
