# Skill Evaluation Framework

> **Mục tiêu**: Trả lời câu hỏi *"Tôi vừa sửa skill X — output có tệ đi không?"* trong < 10 phút.

## Cấu trúc

```
.claude/evals/
├── README.md                      # File này
└── skills/
    ├── tdd/
    │   ├── 01-add-pure-function.md
    │   └── 02-fix-bug-with-test.md
    ├── code-review/
    │   └── 01-find-sql-injection.md
    └── ...
```

Mỗi file eval là 1 **golden example** chứa:
1. **Input** — prompt y nguyên user sẽ gõ
2. **Expected behaviors** — checklist Claude PHẢI làm
3. **Forbidden behaviors** — checklist Claude KHÔNG được làm
4. **Pass criteria** — quy tắc tổng hợp pass/fail

## Tại sao không tự động chạy trong CI?

- Chạy 1 prompt với Claude tốn ~$0.01-0.10. 50 eval × N model version = nhanh chóng tốn tiền.
- LLM output non-deterministic → cần human judgment để chấm.
- Mục tiêu là **smoke test thủ công khi sửa skill quan trọng**, không phải full automation.

**CI chỉ chạy static analysis** (frontmatter quality, file structure) — xem `scripts/check-skill-quality.sh`.

## Cách chạy 1 eval

```bash
bash scripts/run-evals.sh tdd                   # chạy tất cả eval của skill tdd
bash scripts/run-evals.sh tdd 01-add-pure       # chạy 1 eval cụ thể
bash scripts/run-evals.sh --list                # liệt kê tất cả eval
```

Script sẽ:
1. In ra **input prompt** + checklist expected/forbidden.
2. Yêu cầu bạn **copy-paste vào Claude session mới**, chạy thử.
3. Tự chấm theo checklist → in pass/fail.
4. Log kết quả vào `.claude/evals/_results/<date>-<skill>-<eval>.md`.

> Lý do dùng session mới: tránh contamination từ context conversation cũ.

## Khi nào chạy eval?

| Tình huống | Eval cần chạy |
|-----------|---------------|
| Sửa SKILL.md frontmatter (description) | Tất cả eval của skill đó |
| Sửa SKILL.md body | 1-2 eval đại diện |
| Update skill từ upstream (obra/anthropic) | Tất cả eval của skill đó |
| Thêm skill mới | Viết 2-3 eval mới + chạy |
| Trước release v4.x → v4.(x+1) | Tất cả eval skill quan trọng (tdd, code-review, business-analyst, tech-lead, systematic-debugging, refactoring) |

## Cách viết eval mới

Dùng template ở `_template.md`. Format:

```markdown
---
skill: tdd
name: 01-add-pure-function
description: Khi thêm 1 pure function mới, Claude phải viết test TRƯỚC, fail-Green-Refactor
---

## Input prompt
> "Thêm hàm calculateTax(amount, rate) trả về amount * rate trong file src/utils/tax.ts"

## Expected behaviors (PHẢI có)
- [ ] Claude tạo test file TRƯỚC source file
- [ ] Test file có ít nhất 3 test case (happy path + zero + edge case)
- [ ] Test FAIL trước khi viết implementation (Red)
- [ ] Implementation tối thiểu để pass test (Green)
- [ ] Đề xuất refactor (nếu có cải tiến rõ ràng) — Refactor
- [ ] Naming theo coding-style.md (camelCase)

## Forbidden behaviors (KHÔNG được)
- [ ] Viết implementation trước test
- [ ] Bỏ qua step Red (test phải fail trước)
- [ ] Test dùng magic number không có giải thích
- [ ] Function > 50 dòng (vi phạm CLAUDE.md)

## Pass criteria
- Pass: ≥ 5/6 expected + 0 forbidden
- Fail: < 5 expected hoặc ≥ 1 forbidden
```

## Limitations

- Eval là smoke test, không exhaustive. Skill có thể pass eval nhưng vẫn fail edge case không cover.
- Tính chủ quan: "test có đầy đủ không" — 2 reviewer có thể chấm khác. Cố gắng dùng checklist binary.
- Skill `night-shift`, `human-in-the-loop` khó eval vì cần state setup phức tạp. Skip.

## Tracking

Kết quả lưu trong `.claude/evals/_results/` (gitignored — không commit). Khi báo cáo regression, screenshot + paste vào PR/issue.
