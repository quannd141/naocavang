# Skills Index — Quân Nguyễn

> **Mục tiêu**: Trả lời câu hỏi "skill nào cho task gì?" trong < 30 giây. Nếu skill auto-trigger không đúng, mở file này.

## Skill có 2 loại — đừng nhầm

| Loại | Mô tả | Ví dụ |
|------|-------|-------|
| 🔧 **Method skill** | Kỹ thuật/methodology cụ thể, có quy trình | `tdd`, `code-review`, `refactoring`, `systematic-debugging` |
| 👤 **Role skill (persona)** | Đổi perspective/system prompt, không có method độc lập | `senior-developer`, `tech-lead`, `qa-tester`, `devops-engineer` |

**Khi dùng song song**: gọi role để set perspective + method để có technique.
Ví dụ: *"Senior Developer dùng TDD viết feature X"* = `senior-developer` + `tdd`.

**Đừng kỳ vọng role skill làm việc của method skill**: gọi `senior-developer` review code KHÔNG bằng gọi `code-review` (vì role không có review checklist).

## Phân nhóm theo phase công việc

### 🌱 Phase 0 — Idea → Project name
| Skill | Khi nào |
|-------|---------|
| `project-ideation` | Có pitch deck / mockup / PDF, chưa đặt tên dự án |

### 🚀 Phase 1 — New project kickoff
| Skill | Khi nào |
|-------|---------|
| `new-project-setup` | Orchestrator end-to-end: từ folder trống → Sprint 1 ready (7 step) |
| `project-kickoff` | 4-phase PM → BA Discovery → BA Docs → Tech Lead (đã có scope + name) |
| `customer-discovery` | BA solo step: stakeholder map, interview, As-Is/To-Be flow |
| `requirements-documentation` | BA solo step: viết BRD (khách ký) + SRS (dev build) |

> **Overlap note**: `new-project-setup` = wrapper gọi `project-kickoff`. Dùng `new-project-setup` khi user mới bắt đầu chưa có folder. Dùng `project-kickoff` khi đã có folder + name.

### 🛠 Phase 2 — Active development
| Skill | Khi nào |
|-------|---------|
| `context-loader` | Bắt đầu task mới trên dự án đang chạy — đọc context trước khi đụng |
| `business-analyst` | Phân tích yêu cầu, viết User Story + AC (Given-When-Then) |
| `tech-lead` | Thiết kế architecture, viết ADR, quyết định tech |
| `senior-developer` | Viết production code, theo SRS + AC strict |
| `tdd` | Red-Green-Refactor methodology |
| `frontend-design` | UI implementation (responsive, a11y, performance) |
| `architecture-diagram` | Vẽ Mermaid system diagram |
| `database-migration` | Viết migration an toàn, rollback-able |
| `error-handling` | Custom error class hierarchy, structured logging |
| `ci-cd` | GitHub Actions pipeline setup |
| `api-documentation` | OpenAPI / Swagger spec |

### 🔍 Phase 3 — Verify & ship
| Skill | Khi nào |
|-------|---------|
| `code-review` | Review code chất lượng, tìm bug, perf, security smell |
| `refactoring` | Refactor an toàn (preserve behavior, all tests pass) |
| `qa-tester` | Thiết kế test cases, exploratory testing |
| `security-audit` | OWASP scan, secret leak, dep vuln |
| `performance-optimization` | Profile → identify bottleneck → optimize |
| `verification-before-completion` | Checklist trước khi báo "done" (obra/superpowers) |
| `pr-description` | Viết PR description chuẩn |
| `sprint-end-review` | Orchestrate 3-gate: QA → BA → TechLead |

### 🤖 Autonomous / async
| Skill | Khi nào |
|-------|---------|
| `night-shift` | Agent tự build qua đêm (mock mode, local only) |
| `human-in-the-loop` | Block cần user input → PENDING_HUMAN.md, skip task |
| `context-checkpoint` | Gợi ý `/compact` khi context >50% + milestone |

### 🧠 Methodology (obra/superpowers — MIT)
| Skill | Khi nào |
|-------|---------|
| `brainstorming` | Trước khi build, khám phá intent rộng |
| `writing-plans` | Plan trước multi-step task |
| `executing-plans` | Execute plan có checkpoint |
| `systematic-debugging` | Bug khó, không đoán mò |
| `using-git-worktrees` | Isolate feature work qua worktree |
| `dispatching-parallel-agents` | 2+ task độc lập song song |
| `subagent-driven-development` | Implement plan qua subagent |

### 🧰 Tooling (anthropic/skills — Apache 2.0)
| Skill | Khi nào |
|-------|---------|
| `claude-api` | Integrate Anthropic SDK, prompt caching |
| `mcp-builder` | Build MCP server |
| `skill-creator` | Tạo skill mới chuẩn form |
| `webapp-testing` | Playwright E2E |
| `docx` / `pdf` / `xlsx` / `pptx` | Office file I/O |

### 🎨 Design & misc
| Skill | Khi nào |
|-------|---------|
| `ui-ux-pro-max` | Design intelligence (50+ styles, 161 palettes, 10 stacks) |
| `changelog-generator` | Auto sinh CHANGELOG từ git commits |
| `domain-name-brainstormer` | Sinh tên domain + check availability |
| `image-enhancer` | Upscale ảnh / screenshot |

### 👤 Roles (persona prompts) — SET PERSPECTIVE
| Skill | Khi nào | Pair với method skill |
|-------|---------|------------------------|
| `project-manager` | Sprint plan, risk, stakeholder comms | (orchestrator skill) |
| `business-analyst` | Phân tích yêu cầu, viết User Story + AC | `requirements-documentation` |
| `tech-lead` | Quyết định tech, ADR, architecture review | `architecture-diagram`, `code-review` |
| `senior-developer` | Viết production code theo SRS/AC | `tdd`, `refactoring` |
| `qa-tester` | Thiết kế test cases, exploratory testing | `verification-before-completion` |
| `devops-engineer` | Infra, K8s, monitoring, deploy strategy | `ci-cd`, runbooks/* |

---

## Overlap cảnh báo

| Skill A | Skill B | Khác biệt |
|---------|---------|-----------|
| `new-project-setup` | `project-kickoff` | A = wrapper full setup; B = chỉ phase PM→BA→TechLead |
| `tdd` | `code-review` | A = trước/trong code; B = sau code |
| `code-review` | `refactoring` | A = phát hiện; B = sửa, giữ behavior |
| `code-review` | `verification-before-completion` | A = review style/quality; B = checklist completion |
| `security-audit` | `code-review` | A = OWASP focus; B = quality focus |
| `customer-discovery` | `requirements-documentation` | A = thu thập; B = format thành BRD/SRS |
| `error-handling` | `incident-response` (runbook) | A = code design; B = vận hành khi prod gãy |
| `frontend-design` | `ui-ux-pro-max` | A = implementation; B = design intelligence reference |

## Runbooks (không phải skill)

Xem `.claude/runbooks/README.md`. 5 mục: `deployment-pipeline`, `database-migration-safety`, `production-readiness-audit`, `incident-response`, `observability-setup`.

Runbook là **playbook con người follow** khi đang trong tình huống thật (deploy ngày X, prod gãy lúc Y). Không auto-discoverable.

## Evals (test skill regression)

Xem `.claude/evals/README.md`. Khi sửa SKILL.md của skill quan trọng, chạy:

```bash
bash scripts/run-evals.sh <skill-name>
```

Eval = golden examples (input + expected/forbidden checklist). Hiện có 6 eval cho: `tdd`, `code-review`, `refactoring`, `business-analyst`, `tech-lead`, `systematic-debugging`. Thêm eval mới qua `_template.md`.

Tự động trong CI: chỉ static check (`scripts/check-skill-quality.sh`). Runtime eval với Claude là manual (tốn API).
