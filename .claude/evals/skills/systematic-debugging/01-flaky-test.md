---
skill: systematic-debugging
name: 01-flaky-test
description: Debug flaky test có phương pháp, không đoán mò
---

## Input prompt

> "Test này pass local nhưng fail trên CI khoảng 30% lần. Debug giúp:
>
> ```typescript
> test('should return latest orders sorted by date', async () => {
>   await createOrder({ id: 1, createdAt: new Date('2026-01-01') });
>   await createOrder({ id: 2, createdAt: new Date('2026-01-02') });
>   await createOrder({ id: 3, createdAt: new Date('2026-01-03') });
>
>   const result = await getLatestOrders(3);
>
>   expect(result[0].id).toBe(3);
>   expect(result[1].id).toBe(2);
>   expect(result[2].id).toBe(1);
> });
> ```
>
> CI environment: PostgreSQL container, fresh DB per test."

## Expected behaviors (PHẢI có)

- [ ] **KHÔNG đoán fix ngay** — hỏi/quan sát data trước
- [ ] Hỏi: error message cụ thể khi fail là gì? (assertion fail ở line nào?)
- [ ] Hỏi: CI logs có race condition / timing info?
- [ ] Liệt kê **hypothesis có thể** (không chỉ 1):
  - Race condition giữa các createOrder (parallel insert?)
  - Database timezone khác local/CI
  - `getLatestOrders` thiếu `ORDER BY created_at DESC` (rely on insertion order)
  - Test order phụ thuộc (test khác làm bẩn DB)
  - `new Date(string)` parse timezone khác nhau (local vs UTC)
- [ ] Đề xuất **isolate hypothesis** một cách có hệ thống (vd: chạy 1 hypothesis 1 lần)
- [ ] Đề xuất logging/debug instrumentation (in actual order, timestamps, query thực tế)
- [ ] Đề xuất **reproduction step** local (loop chạy test 100 lần, xem flake rate)
- [ ] Sau khi xác định root cause, đề xuất fix + test verify fix giữ
- [ ] Đề xuất **prevention** (lint rule, pattern tránh repeat)

## Forbidden behaviors (KHÔNG được)

- [ ] Fix mò: "thử thêm `await sleep(100)` xem"
- [ ] Đoán root cause mà không có evidence
- [ ] Fix 1 hypothesis duy nhất mà không loại bỏ alternative
- [ ] Skip step reproduction (vá CI mà chưa repo local)
- [ ] Đề xuất "retry test 3 lần" như fix (mask vấn đề, không fix)

## Pass criteria

- **Pass**: ≥ 7/9 expected + 0 forbidden
- **Fail**: < 7 expected hoặc ≥ 1 forbidden

## Notes

Flaky test là test case kinh điển cho systematic debugging. Skill PHẢI thể hiện:
1. Tránh confirmation bias (đừng có 1 hypothesis là chốt)
2. Evidence-driven (logs, repro, data)
3. Prevention thinking (sau khi fix, làm sao không repeat)

Anti-pattern hay gặp: "Thêm retry 3 lần" (mask flaky), "thêm sleep" (race condition vẫn còn).
