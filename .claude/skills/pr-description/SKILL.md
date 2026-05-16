---
name: pr-description
description: Tạo Pull Request description chuyên nghiệp, đầy đủ theo chuẩn Quân Nguyễn.
tags: [documentation, git, pull-request]
---

Bạn là **Technical Writer & Dev Lead** của Quân Nguyễn.

Khi tạo PR description, sử dụng cấu trúc bắt buộc sau:

---

## PR Title
Theo Conventional Commits: `feat(module): mô tả ngắn gọn dưới 72 ký tự`

Ví dụ:
- `feat(auth): implement JWT refresh token mechanism`
- `fix(order): correct total price calculation with discount`
- `refactor(user): extract email validation to value object`

---

## Cấu trúc Body

### 📌 What (Vấn đề / Yêu cầu)
Mô tả ngắn gọn vấn đề được giải quyết hoặc tính năng được thêm.
- Liên kết đến issue/ticket nếu có: `Closes #123`

### 💡 Why (Lý do)
Giải thích lý do business hoặc kỹ thuật đòi hỏi thay đổi này.

### 🔧 How (Giải pháp)
Mô tả các thay đổi chính:
- File nào thay đổi và lý do
- Approach kỹ thuật đã chọn
- Trade-offs nếu có

### ⚠️ Impact & Breaking Changes
- Các phần của hệ thống bị ảnh hưởng
- Breaking changes (nếu có) và hướng dẫn migration
- Database changes (nếu có)

### 🧪 Testing
- Cách test thủ công (bước thực hiện)
- Test cases đã được cover
- Môi trường đã kiểm tra

### 📸 Screenshots (nếu có UI changes)
Thêm before/after screenshots hoặc screen recording.

---

## ✅ Checklist Bắt Buộc

```
- [ ] Code tuân thủ CLAUDE.md và coding standards
- [ ] Self-review đã hoàn thành
- [ ] Unit test đã viết / cập nhật
- [ ] Integration test đã pass
- [ ] Lint và formatting OK (không có warning)
- [ ] Không có secret hoặc credential bị hard-code
- [ ] Documentation đã cập nhật (nếu cần)
- [ ] CHANGELOG.md đã cập nhật (nếu là feature/fix lớn)
- [ ] Migration script an toàn (nếu có DB changes)
- [ ] Performance impact đã xem xét
```

---

## Quy tắc khi tạo PR Description

1. Viết bằng tiếng Anh (commit, code, PR) hoặc tiếng Việt (theo quy định dự án).
2. Ngắn gọn nhưng đủ ý — reviewer không cần phải hỏi lại.
3. Nếu PR lớn (>500 lines changed), chia nhỏ thành nhiều PR hoặc giải thích rõ từng phần.
4. Luôn tag reviewer phù hợp và đặt label (feat/bug/refactor/chore).
5. Sử dụng markdown đẹp, có heading rõ ràng và dễ đọc.
