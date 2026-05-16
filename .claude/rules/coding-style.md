# Coding Style Guidelines - Quân Nguyễn

## General Rules
- Sử dụng English cho tất cả tên biến, function, comment và commit.
- Comment chỉ khi cần giải thích "tại sao" chứ không phải "làm gì".
- Mọi thay đổi lớn phải có ADR trong docs/adr/.

## Language Specific (ví dụ TypeScript)
- Sử dụng interface thay vì type alias khi định nghĩa shape của object.
- Strict mode: noImplicitAny, strictNullChecks luôn bật.
- Prefer async/await thay vì .then() chains.

## Commit Convention
Sử dụng Conventional Commits:
- feat: thêm tính năng mới
- fix: sửa lỗi
- refactor: tối ưu code không đổi behavior
- style: thay đổi format
- test: thêm/sửa test
- chore: cập nhật build/config

Ví dụ: feat(auth): implement JWT refresh token mechanism