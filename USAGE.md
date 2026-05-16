# 📘 USAGE — Daily work trên dự án đã có code

> File này cho **dự án đang chạy** (đã có code, CLAUDE.md, sprint plan).
> Dự án mới? → đọc [START_NEW_PROJECT.md](START_NEW_PROJECT.md) thay vì file này.
> Quên cú pháp slash command? → cuộn xuống mục [Cheatsheet copy-paste](#-cheatsheet-copy-paste).

---

## 🔔 Khi bạn offline — đọc trước

Khi Claude gặp block cần input của bạn (API key, OAuth, approval...) mà bạn không online → Claude **KHÔNG ĐỢI**, ghi vào file `PENDING_HUMAN.md` ở root dự án và tiếp task khác.

**Khi quay lại**:
1. Mở `PENDING_HUMAN.md` trước tiên
2. Xử lý theo priority: 🔴 Blocking > 🟠 Important > 🟢 Nice-to-have
3. Báo agent: **"đã xử lý pending"** → Claude resume task bị block

→ Tránh "user offline = team ngồi chơi". Chi tiết: skill `human-in-the-loop`.

---

## 🚦 Quy tắc vàng — bắt đầu task mới

```
Task của bạn là gì?
│
├── 🆕 Feature mới, bug fix, refactor, perf, security review
│       └─► /context-loader   (đọc context → clarify → plan → chọn agent)
│
├── 🎯 Đã rất quen task này (lặp lại nhiều lần)
│       └─► Gọi thẳng skill cần dùng:
│           "code-review file X" / "tdd implement feature Y"
│
├── 🌙 Build qua đêm (user ngủ)
│       └─► /night-shift   (mock mode, không gọi API thật)
│
├── 🏁 Đóng sprint
│       └─► /sprint-end-review   (3 gate: QA → BA → TechLead)
│
└── 🚨 Production gãy
        └─► Mở .claude/runbooks/incident-response/SKILL.md (P0-P3 triage)
```

**Đừng** nhảy thẳng vào "viết code cho tôi X" mà bỏ qua `/context-loader` — Claude sẽ assume nhiều thứ và làm sai.

---

## 📋 3 scenario phổ biến

### Scenario 1 — Feature mới

```
/context-loader

Thêm chức năng [TÍNH NĂNG] vào module [TÊN MODULE].

Yêu cầu cụ thể:
- [chi tiết 1]
- [chi tiết 2]

Bối cảnh nghiệp vụ: [VÌ SAO cần làm cái này, ai dùng]
Output mong muốn: [code mới / sửa file nào / endpoint nào]
Test coverage mong muốn: [đầy đủ unit + integration / chỉ unit]
```

**Ví dụ thật**:
```
/context-loader

Thêm chức năng export Excel cho danh sách đơn hàng ở module orders.
User click nút "Export", chọn khoảng ngày, tải file .xlsx về.

Bối cảnh: khách hàng cần báo cáo gửi kế toán hàng tuần.
Output: endpoint POST /api/orders/export + frontend component ExportButton.
Test: unit cho service + integration cho endpoint.
```

Context Loader sẽ:
1. Đọc CLAUDE.md + SRS liên quan
2. Hỏi clarify (format Excel? include cancelled orders?)
3. Đề xuất plan có file paths cụ thể
4. Route sang `business-analyst` (nếu cần AC) → `senior-developer` + `tdd`

### Scenario 2 — Bug fix

```
/context-loader

Bug: [MÔ TẢ HÀNH VI SAI] khi [INPUT/CONDITION].
Expected: [HÀNH VI ĐÚNG].
Reproduce steps:
1. [step 1]
2. [step 2]
3. [hành vi quan sát]

Log/error: [stack trace, Sentry ticket #, screenshot]
Tôi muốn debug có phương pháp, tìm root cause chứ không vá tạm.
```

**Ví dụ**:
```
/context-loader

Bug: API POST /api/users/register trả 500 khi email chứa dấu '+' (VD: user+test@gmail.com).
Expected: 201 Created với user mới.
Reproduce: Postman gửi POST với body { email: "a+b@gmail.com", password: "..." }.
Log: Sentry ticket #1234 — "PrismaClientValidationError: invalid character".

Tôi muốn root cause, không vá tạm bằng sanitize input.
```

→ Context Loader route sang `systematic-debugging` (obra/superpowers).

### Scenario 3 — Refactor / performance / security

```
/context-loader

[Refactor | Tối ưu performance | Security review] module [TÊN MODULE].

[Yêu cầu cụ thể]
QUAN TRỌNG: không được [constraint, vd: đổi behavior / đổi API response].
```

**Ví dụ refactor**:
```
/context-loader

Refactor module users: tách business logic khỏi controller, áp dụng Clean Architecture.
QUAN TRỌNG: không được đổi behavior. Tất cả test hiện tại phải pass.
```

**Ví dụ performance**:
```
/context-loader

API GET /products/search đang chậm 2.8s ở production (P95).
Profiling và đề xuất optimization. Không được đổi response format.
DB: PostgreSQL, bảng products có 500k records.
```

**Ví dụ security**:
```
/context-loader

Review bảo mật module authentication vừa merge tuần trước.
Focus: JWT handling, rate limiting, password reset flow.
OWASP Top 10 + custom checks cho VN context (vd: SQL injection qua tiếng Việt unicode).
```

---

## 🎯 Gọi thẳng skill (khi đã rất quen)

Bỏ qua `/context-loader` nếu bạn đã làm task tương tự nhiều lần:

```
"senior-developer + tdd: implement endpoint POST /api/orders theo SRS FR-008"
"tech-lead: review architecture proposal trong docs/proposals/event-driven-v2.md"
"business-analyst: viết user story + AC cho tính năng thanh toán trả góp"
"qa-tester: viết đầy đủ test cases cho module checkout"
"code-review: review PR branch feat/order-refund"
"refactoring: extract validation logic ra khỏi src/orders/orders.service.ts"
"security-audit: scan module auth, OWASP Top 10"
"performance-optimization: API /search chậm 3s, profile + optimize"
"error-handling: refactor error handling cho module users dùng custom error class"
"pr-description: viết PR description cho branch feat/order-export"
```

> Xem [.claude/skills/INDEX.md](.claude/skills/INDEX.md) để tra skill theo phase công việc.

---

## 🏁 Đóng sprint — 3-gate verification

Khi team báo "sprint done":

```
/sprint-end-review

Sprint [N] team báo xong. Verify theo quy trình 3-gate.
```

3 gate tuần tự:

```
GATE 1 — QA functional verification   (skill: qa-tester)
  ├─ FAIL → rework về Dev, BLOCK sprint close
  └─ PASS → GATE 2

GATE 2 — BA business verification     (skill: business-analyst)
  ├─ FAIL → reopen user story, BLOCK close
  └─ PASS → GATE 3

GATE 3 — Tech Lead code review        (skill: tech-lead + code-review)
  ├─ FAIL → refactor request, BLOCK close
  └─ PASS → CLOSE SPRINT → plan sprint kế tiếp
```

Sprint chỉ đóng khi **cả 3 gate PASS**. Không "bypass cho nhanh".

---

## 🌙 Night-shift — Build qua đêm

**Khi dùng**: bạn muốn agent tự build sprint qua đêm, KHÔNG tốn tiền API thật, KHÔNG deploy production.

**Setup 1 lần**:
```bash
cp .env.night-shift.example .env.night-shift   # toàn FAKE keys
echo ".env.night-shift" >> .gitignore
```

**Chạy tay** (test trước khi bật cron):
```bash
cd /path/to/my-project
export NIGHT_SHIFT_MODE=true   # PowerShell: $env:NIGHT_SHIFT_MODE="true"
claude
```

Trong Claude Code:
```
/night-shift

Run sprint 3 qua đêm. Mock mode, local only, 5 story max, 3 retry.
Block cần key/OAuth → ghi PENDING_HUMAN.md, skip story.
Sáng viết NIGHT_SHIFT_REPORT.md cho tôi.
```

**Sáng mai đọc theo thứ tự**:
1. `NIGHT_SHIFT_REPORT.md` — tổng kết
2. `PENDING_HUMAN.md` — việc cần xử lý
3. `git log night-shift/* --oneline` — commits đã làm

**Constraint TỐI THƯỢNG** (hardcode trong skill + `.claude/rules/autonomous-mode.md`):
- ❌ KHÔNG gọi API thật (chỉ MockAdapter)
- ❌ KHÔNG deploy production (`vercel --prod`, `fly deploy` đều block)
- ❌ KHÔNG push main/master (chỉ branch `night-shift/*`)
- ❌ KHÔNG merge PR (chỉ tạo, user review)
- ✅ Commit feature branch, test local, Docker Compose local

---

## 🚨 Production gãy — Incident response

**KHÔNG dùng `/context-loader`** — quá chậm khi prod đang 5xx. Mở thẳng runbook:

```
mở .claude/runbooks/incident-response/SKILL.md
```

Runbook hướng dẫn:
1. **Triage** (P0-P3): impact + urgency
2. **Mitigate**: rollback nhanh, hay hotfix? Tiêu chí quyết định trong < 5 phút
3. **Comms**: status page, user notification, internal channel
4. **Postmortem**: 5 whys + action items (sau khi đã mitigated)

**Mục tiêu MTTR < 30 phút cho P0**.

Sau khi xong, mở `.claude/runbooks/observability-setup/SKILL.md` để check xem alerting có miss gì không.

---

## 🚀 Deploy production — Mỗi lần đều mở runbook

**KHÔNG bỏ qua bước này**:

```
mở .claude/runbooks/deployment-pipeline/SKILL.md
```

5 phase bắt buộc:
1. **Pre-check** — tests xanh, env vars khớp prod, CHANGELOG ready
2. **Backup** — DB snapshot, current build artifact
3. **Migrate** — DB migration (nếu có) — xem thêm `runbooks/database-migration-safety/SKILL.md`
4. **Deploy** — push artifact, smoke test
5. **Monitor** — 15 phút đầu, Sentry/logs/dashboard, ready rollback

Mỗi phase có **gate**: fail bất kỳ bước nào → STOP, không tiến phase tiếp.

---

## 🔄 Cập nhật QAgenSkill — Khi có version mới

```bash
# Pull QAgenSkill mới nhất
cd /path/to/QAgenSkill && git pull

# Vào folder dự án
cd /path/to/my-project

# Sync skill + rule + runbook + eval (giữ CLAUDE.md đã edit)
cp -rf /path/to/QAgenSkill/.claude/skills/. ./.claude/skills/
cp -rf /path/to/QAgenSkill/.claude/rules/. ./.claude/rules/
cp -rf /path/to/QAgenSkill/.claude/runbooks/. ./.claude/runbooks/
cp -rf /path/to/QAgenSkill/.claude/evals/. ./.claude/evals/
rm -rf .claude/evals/_results 2>/dev/null    # per-session noise

# TUYỆT ĐỐI KHÔNG overwrite:
# - CLAUDE.md (đã điền project-specific tech stack)
# - .claude/settings.json (có thể đã customize hooks/permissions)
# - PENDING_HUMAN.md (history của dự án)
```

Check CHANGELOG.md ở QAgenSkill để biết breaking change.

---

## 📋 Cheatsheet copy-paste

### Bắt đầu task bất kỳ
```
/context-loader

[mô tả task]. Bối cảnh: [...]. Output: [...].
```

### Skill trực tiếp (đã quen)
```
{skill-name}: [yêu cầu cụ thể]
```

### Đóng sprint
```
/sprint-end-review

Sprint [N] team báo xong.
```

### Build qua đêm
```
/night-shift

Run sprint [N] qua đêm. Mock mode, 5 story max.
```

### Sửa skill → eval regression
```bash
bash /path/to/QAgenSkill/scripts/run-evals.sh <skill-name>
```

---

## ✅ Checklist trước khi báo "DONE"

- [ ] Test xanh? (`npm test` / `pytest` / lệnh project-specific)
- [ ] Lint sạch? (`npm run lint` / `ruff check`)
- [ ] Skill `verification-before-completion` confirm OK?
- [ ] Commit message theo Conventional Commits (`feat:`, `fix:`, `refactor:`, ...)?
- [ ] PR description đã viết? (`pr-description` skill)
- [ ] CHANGELOG entry (nếu user-facing change)?

## ❌ Anti-patterns

| Đừng | Thay vào đó |
|------|-------------|
| "Viết code cho tôi module users" (mơ hồ) | `/context-loader` → BA clarify trước |
| Skip `/context-loader` cho task không quen | Mất 30s thôi, đảm bảo đúng |
| Gộp 5 feature vào 1 task | Tách 5 task, mỗi task 1 lần `/context-loader` |
| Quên đọc CLAUDE.md | `/context-loader` tự đọc — đừng tự tin override |
| Deploy mà không mở `deployment-pipeline` runbook | Bỏ phase = nhân lỗi production |
| Hardcode secret để "thử cho nhanh" | Hooks coding-standards-check sẽ flag — tốn time hơn |

---

## 📚 File liên quan

| File | Khi nào đọc |
|------|-------------|
| [`START_NEW_PROJECT.md`](START_NEW_PROJECT.md) | Khởi tạo dự án mới |
| [`CLAUDE.md`](CLAUDE.md) | Rules + tech stack cụ thể của dự án này |
| [`AGENTS.md`](AGENTS.md) | Chi tiết 11 agent + sơ đồ workflow |
| [`TEAM.md`](TEAM.md) | Cấu trúc team & quy trình hợp tác |
| [`.claude/skills/INDEX.md`](.claude/skills/INDEX.md) | Tra skill theo phase công việc |
| [`.claude/runbooks/README.md`](.claude/runbooks/README.md) | 5 runbook khi vận hành production |
| [`.claude/rules/`](.claude/rules/) | architecture, coding-style, testing, autonomous-mode |
| [`PENDING_HUMAN.md`](PENDING_HUMAN.md) | Việc user phải tự làm tay |
| [`CHANGELOG.md`](CHANGELOG.md) | Lịch sử thay đổi dự án |

---

**Quân Nguyễn** — *Khi quên, mở file này.*
Phiên bản: 2.0 (đồng bộ với QAgenSkill v4.1) | Cập nhật: 2026-05-13
