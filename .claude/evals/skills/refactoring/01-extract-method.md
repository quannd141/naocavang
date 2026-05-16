---
skill: refactoring
name: 01-extract-method
description: Refactor long function — extract method, giữ behavior, có test guard
---

## Input prompt

> "Refactor function này cho dễ đọc, giữ nguyên behavior:
>
> ```typescript
> async function processOrder(order: Order): Promise<Result> {
>   // Validate
>   if (!order.userId) throw new Error('missing user');
>   if (order.items.length === 0) throw new Error('empty cart');
>   for (const item of order.items) {
>     if (item.qty <= 0) throw new Error('invalid qty');
>     if (item.price < 0) throw new Error('invalid price');
>   }
>
>   // Calculate
>   let subtotal = 0;
>   for (const item of order.items) {
>     subtotal += item.qty * item.price;
>   }
>   const tax = subtotal * 0.1;
>   const shipping = subtotal > 100 ? 0 : 10;
>   const total = subtotal + tax + shipping;
>
>   // Save
>   const saved = await db.orders.create({ ...order, total });
>
>   // Notify
>   await emailService.send(order.userEmail, `Order ${saved.id} confirmed, total $${total}`);
>   await analyticsService.track('order_placed', { userId: order.userId, total });
>
>   return { orderId: saved.id, total };
> }
> ```"

## Expected behaviors (PHẢI có)

- [ ] Hỏi/kiểm tra **có test hiện tại** cho function này không TRƯỚC khi refactor
- [ ] Nếu không có test → yêu cầu viết test characterization trước (capture current behavior)
- [ ] Extract ít nhất 3 method con: `validate*`, `calculate*`, `notify*`
- [ ] Mỗi extracted method có pure function nature (nếu có thể) — nhận input, return output, không side effect (ngoại trừ save/notify)
- [ ] Tách side effect (save DB, email, analytics) khỏi pure logic (calculate)
- [ ] Constants (tax rate 0.1, shipping threshold 100, shipping cost 10) extract ra biến đặt tên
- [ ] Function `processOrder` cuối cùng < 20 dòng (orchestration only)
- [ ] Giải thích từng bước refactor — không refactor 1 nhát quá lớn
- [ ] Confirm với user trước khi áp dụng changes (đặc biệt nếu có nhiều file)

## Forbidden behaviors (KHÔNG được)

- [ ] Refactor mà không hỏi/check test guard
- [ ] Đổi behavior (ví dụ: đổi tax rate, đổi error message format API)
- [ ] Refactor "to lớn" 1 lần — không có incremental steps
- [ ] Magic number giữ nguyên không extract thành constant
- [ ] Inline comments giải thích "what" (không cần khi tên function rõ ràng)

## Pass criteria

- **Pass**: ≥ 7/9 expected + 0 forbidden
- **Fail**: < 7 expected hoặc ≥ 1 forbidden

## Notes

Eval này test **safety-first** mindset: refactoring không có test = nguy hiểm. Skill phải reflexive hỏi về test trước.
