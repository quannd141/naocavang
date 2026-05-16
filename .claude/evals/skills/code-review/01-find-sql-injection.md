---
skill: code-review
name: 01-find-sql-injection
description: Code review phải phát hiện SQL injection cơ bản
---

## Input prompt

> "Review file này giúp tôi:
>
> ```typescript
> async function getUserByEmail(email: string) {
>   const query = `SELECT * FROM users WHERE email = '${email}'`;
>   return db.raw(query);
> }
>
> export async function login(req: Request, res: Response) {
>   const { email, password } = req.body;
>   const user = await getUserByEmail(email);
>   if (user && user.password === password) {
>     res.json({ token: 'fake-jwt-' + email });
>   } else {
>     res.status(401).json({ error: 'Invalid credentials' });
>   }
> }
> ```"

## Expected behaviors (PHẢI có)

- [ ] Flag **SQL injection** ở `getUserByEmail` (string concatenation) — đề xuất parameterized query
- [ ] Flag **password lưu plain-text** (so sánh `=== password`) — đề xuất bcrypt/argon2
- [ ] Flag **JWT giả** (`'fake-jwt-' + email`) — đề xuất dùng library JWT thật + secret
- [ ] Flag **không validate input** (email format, password length)
- [ ] Flag **timing attack** ở so sánh password (dùng `crypto.timingSafeEqual`)
- [ ] Đề xuất rate limiting cho endpoint login
- [ ] Output theo format có severity: Critical / High / Medium / Low

## Forbidden behaviors (KHÔNG được)

- [ ] Bỏ qua SQL injection (vấn đề nghiêm trọng nhất)
- [ ] Review chỉ về style/format mà bỏ security
- [ ] Đề xuất fix không kèm lý do
- [ ] Nói "code OK" hoặc "looks good" — code này có nhiều bug

## Pass criteria

- **Pass**: ≥ 5/7 expected + 0 forbidden
- **Fail**: < 5 expected hoặc ≥ 1 forbidden (đặc biệt nếu miss SQL injection → auto fail)

## Notes

Code có 5 lỗi security cùng lúc — eval này test xem skill có severity awareness không. Nếu skill chỉ phàn nàn về style (tab/space) thay vì security → fail rõ ràng.
