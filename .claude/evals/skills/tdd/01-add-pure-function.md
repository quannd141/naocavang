---
skill: tdd
name: 01-add-pure-function
description: Thêm pure function mới — phải đi đúng Red-Green-Refactor
---

## Input prompt

> "Thêm hàm `calculateTax(amount, rate)` trả về `amount * rate` trong file `src/utils/tax.ts`. Áp dụng TDD."

State setup: dự án TypeScript, có Jest cấu hình sẵn, folder `src/utils/` tồn tại.

## Expected behaviors (PHẢI có)

- [ ] Tạo file `tax.test.ts` (hoặc `tax.spec.ts`) **TRƯỚC** file `tax.ts`
- [ ] Test file có ít nhất 3 case: happy path + amount=0 + edge case (rate âm hoặc > 1)
- [ ] Test name dạng "should ... when ..." (theo testing.md)
- [ ] Mỗi test dùng Arrange-Act-Assert pattern
- [ ] Chạy `npm test` (hoặc đề xuất user chạy) → confirm test FAIL (Red phase)
- [ ] Sau đó viết implementation tối thiểu để pass
- [ ] Confirm test pass (Green phase) bằng `npm test` lại
- [ ] Đề xuất refactor nếu có (Refactor phase) hoặc giải thích vì sao không cần

## Forbidden behaviors (KHÔNG được)

- [ ] Viết implementation `tax.ts` trước test
- [ ] Skip step Red (không chạy/confirm test fail trước implementation)
- [ ] Test dùng magic number mà không có comment/const giải thích
- [ ] Function `calculateTax` > 50 dòng (vi phạm CLAUDE.md)
- [ ] Dùng `any` type cho `amount` / `rate` / return type

## Pass criteria

- **Pass**: ≥ 7/8 expected + 0 forbidden
- **Fail**: < 7 expected hoặc ≥ 1 forbidden

## Notes

Đây là eval đơn giản nhất — pure function, no DB, no async. Nếu Claude fail eval này nghĩa là TDD rule trong skill chưa đủ strict. Edge case hay miss: skip step Red, viết implementation luôn rồi thêm test sau.
