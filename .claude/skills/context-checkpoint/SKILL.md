---
name: context-checkpoint
description: Chủ động gợi ý user chạy /compact khi context đã dùng >50% và đang ở milestone (cuối sprint, cuối ngày, cuối task lớn). Lưu "preservation notes" để sau compact không mất context quan trọng. Kích hoạt tự động trong sprint-end-review và night-shift khi kết thúc; kích hoạt manual khi user gõ "check context" hoặc "nên compact chưa?".
tags: [context, compact, checkpoint, session-management]
---

Bạn là **Context Checkpoint Advisor**. Theo dõi context usage + gợi ý compact đúng lúc để không mất state quan trọng.

## ⚠️ Giới hạn kỹ thuật

- Agent **KHÔNG** tự chạy được `/compact` (native command của Claude Code, chỉ user trigger)
- Agent chỉ có thể **ước lượng context usage** (dựa số lượng tool calls, files read, v.v.) và **gợi ý** user chạy `/compact`
- User gõ `/compact` → Claude Code tự tóm tắt conversation → tiếp tục session với context nhẹ hơn

## Khi nào kích hoạt skill này

### ✅ Auto-trigger (invoke trong skill khác)
- Cuối `sprint-end-review` khi 3 gate PASS (milestone)
- Cuối `night-shift` khi viết NIGHT_SHIFT_REPORT.md
- Sau khi commit 5+ stories trong 1 session
- Sau khi đọc 20+ file trong 1 conversation

### ✅ Manual-trigger (user gõ)
- "check context"
- "nên compact chưa?"
- "conversation dài quá rồi"
- "về milestone rồi"

### ❌ Không trigger khi
- Đang giữa 1 story (compact giữa chừng làm mất context đang build)
- Context < 30% (không cần)
- User đang debug phức tạp (mất trace khó debug tiếp)

## Quy trình 3 bước

### Bước 1 — Estimate Context Usage

Agent tự đánh giá dựa các signal:

| Signal | Weight | Note |
|--------|--------|------|
| Conversation turn count | Cao | >50 turns → thường > 50% |
| Số file đã đọc | Cao | >30 file (không kể lines) → context nặng |
| Số tool call tổng | TB | >200 tool call |
| Có đọc file lớn (>500 dòng)? | TB | Mỗi file lớn ~15k token |
| Có include full HTML/JSON dump? | Cao | Mỗi dump 10-50k token |
| Thinking block nhiều? | TB | Extended thinking consume context |

**Ước lượng:**
- 🟢 Light (<30%): Tiếp tục bình thường
- 🟡 Medium (30-50%): Lưu ý, có thể compact nếu sắp milestone
- 🟠 High (50-70%): **Chủ động gợi ý compact** nếu ở milestone
- 🔴 Critical (>70%): **Gợi ý compact ngay** + warning sắp hit limit

### Bước 2 — Viết Preservation Notes (trước khi compact)

Trước khi gợi ý user `/compact`, ghi file `.claude/session-notes/YYYY-MM-DD-HHMM.md` chứa thông tin quan trọng agent cần nhớ sau compact:

```markdown
# Session Notes — [Milestone/Context]

**Ngày**: YYYY-MM-DD HH:MM
**Trigger**: sprint-end-review / night-shift / manual

## Decisions đã chốt trong session
- [VD: Chọn NestJS thay Fastify, lý do X]
- [VD: Sprint 0 done 7/9 stories, skip US-S0-007]

## Files đang dở
- [VD: src/modules/auth/login.service.ts — implement xong, test đang viết]

## PENDING_HUMAN items đã log
- PH-001: [ngắn]
- PH-002: [ngắn]

## Context user đã cung cấp (quan trọng, không ở trong code)
- [VD: user preference: ưu tiên tốc độ > cover test edge case]
- [VD: deadline Sprint 0 là 29/04]

## Bug/Issue phát hiện chưa fix
- [VD: race condition ở credits deduction — đã log tech-debt.md]

## State code hiện tại
- Branch: feature/sprint-0-setup
- Last commit: abc123 - "feat(auth): US-001 signup"
- Test status: 45/50 pass (5 skip intentionally)

## Nếu mất context (worst case), agent có thể đọc lại:
- CLAUDE.md, docs/*.md
- git log last 10 commits
- PENDING_HUMAN.md
- File này (session-notes)
```

### Bước 3 — Gợi ý User

Output cho user (format rõ ràng, actionable):

```markdown
## 🧠 Context Checkpoint

**Ước lượng context usage**: 🟠 ~60% (sau 7 stories + 25 file đọc + 180 tool calls)

**Tình huống**: Vừa hoàn tất `sprint-end-review` Sprint 0 ✅

**Khuyến nghị**: Gõ `/compact` để release context cho Sprint 1 sắp tới.

**Đã lưu session notes tại**: `.claude/session-notes/2026-04-23-0630.md`
→ Agent sẽ đọc file này sau compact để nhớ decisions + state.

**Sau khi compact, gõ tiếp:**
\`\`\`
Tiếp tục Sprint 1. Đọc .claude/session-notes/2026-04-23-0630.md để hiểu context.
\`\`\`

**Nếu KHÔNG muốn compact** (VD: đang debug cần trace full): bỏ qua, tiếp tục session.
```

## Lưu ý Quan trọng

### 1. KHÔNG compact giữa story
- Nếu đang implement US-XXX chưa xong → đừng gợi ý compact
- Chờ đến khi commit xong story mới gợi ý

### 2. KHÔNG compact nếu user đang debug khó
- Trace chain of reasoning quan trọng cho debug
- Nếu user hỏi "tìm bug X", tiếp tục session, không gợi ý compact

### 3. KHÔNG gợi ý compact quá thường xuyên
- Max 1 gợi ý mỗi milestone
- Không gợi ý lại cho đến khi context thêm 20%

### 4. Session notes phải ĐỦ ĐỂ tiếp tục sau compact
- User/agent mới (sau compact) đọc notes phải hiểu ngay state
- Prefer link sang file hơn là paste content (file tồn tại sau compact)

## Integration với các skill khác

### sprint-end-review (auto-invoke cuối)
Thêm ở cuối skill `sprint-end-review`:
```markdown
## Final Step: Context Checkpoint
Invoke skill `context-checkpoint` để evaluate và gợi ý `/compact` nếu phù hợp.
```

### night-shift (auto-invoke sau report)
Thêm ở cuối skill `night-shift`:
```markdown
## After writing NIGHT_SHIFT_REPORT.md
Invoke skill `context-checkpoint`. Cuối night-shift thường context đã dùng
nhiều (5-10 stories × files read × tool calls), compact để session sáng mai nhẹ.
```

### sprint-end-review thành công
Khi sprint close, luôn gợi ý compact vì:
- Sprint mới cần context fresh
- Decisions cũ đã save vào CHANGELOG/ADR → không cần giữ trong chat

## Template: Viết Session Notes ngắn

Nếu context chỉ 30-50% (không critical), chỉ cần session note ngắn:

```markdown
# Checkpoint — [reason]

**Mốc**: [VD: US-003 commit xong]
**Branch**: [name]
**Next**: [what to do after compact]
```

## Anti-patterns

| Đừng | Thay vào đó |
|------|-------------|
| Gợi ý compact mỗi 5 turn | Chỉ khi milestone + context > 50% |
| Compact ngay khi user vừa hỏi 1 câu phức tạp | Đợi câu trả lời xong |
| Quên viết session notes trước compact | Notes là life raft — luôn viết trước |
| Paste toàn bộ conversation vào notes | Dư thừa — chỉ note decisions + state |
| Gợi ý compact khi < 30% | Lãng phí, chưa cần |

## Self-check trước khi gợi ý

- [ ] Đang ở milestone? (sprint end / night-shift end / task lớn xong)
- [ ] Context > 50% estimate?
- [ ] User không đang debug phức tạp?
- [ ] Đã viết session notes?
- [ ] Gợi ý trước đó cách đây ≥ 1 milestone?

Nếu 5/5 ✅ → gợi ý. Nếu không → skip.
