# 📋 PROJECT CHARTER — Não Cá Vàng

**Mã dự án:** nao-ca-vang
**Ngày phê duyệt Charter:** 2026-05-16
**Phiên bản:** 1.0
**Project Manager:** Quân Nguyễn
**Trạng thái:** ✅ PM Sign-off — sẵn sàng chuyển Phase 2 (BA Discovery)

---

## 1. Tổng quan

**Não Cá Vàng** là nền tảng học tập **Web + Mobile App** giúp người học Việt Nam **học nhanh, nhớ lâu** thông qua **sơ đồ tư duy (mind map)** kết hợp **AI sinh nội dung tự động** và **spaced repetition**.

**Slogan định hướng:** *"Não Cá Vàng — nơi trí nhớ không còn là vấn đề."*

---

## 2. Vấn đề cần giải quyết

Người học Việt Nam (HS THPT, SV ĐH, học viên ôn chứng chỉ, researcher, lifelong learner) đang gặp khó khăn:

- **Học nhiều nhưng quên nhanh** — không có hệ thống ôn tập khoa học
- **Tài liệu phân mảnh** — slide, PDF, video, sách giấy, ghi chú → khó tổng hợp thành kiến thức có cấu trúc
- **Công cụ nước ngoài đắt và không Việt hóa** — Quizlet, Anki, MindMeister, Notion không tối ưu cho người Việt
- **Mỗi tool chỉ giải 1 phần**: Quizlet/Anki chỉ flashcard, Xmind/MindMeister chỉ mind map, MathDojo chỉ Toán → user phải dùng 3-5 app cùng lúc

---

## 3. Định vị sản phẩm (USP)

> **"All-in-one + Tiếng Việt + Giá Việt Nam"**

| Sản phẩm | Ưu thế | Hạn chế |
|----------|--------|---------|
| Quizlet | Flashcard tốt | Chỉ flashcard, không có mind map, không Việt hóa sâu |
| Anki | Spaced repetition mạnh | UX cũ, không có AI, chỉ flashcard |
| MindMeister/Xmind | Mind map tốt | Không có ôn tập, không có AI sinh nội dung |
| MathDojo | AI tốt | Chỉ Toán, không phục vụ đa môn |
| **Não Cá Vàng** | **Mind map + Flashcard + AI sinh + Spaced repetition + Quiz**, Việt hóa toàn diện, giá VN | (mới) |

---

## 4. End-users mục tiêu

| Persona | Mô tả | Pain point chính | Phase ưu tiên |
|---------|-------|------------------|---------------|
| **Học sinh THPT** | Lớp 10-12, ôn thi ĐH | Học nhiều môn, dễ quên, khó hệ thống hóa | MVP v0.1 |
| **Sinh viên ĐH** | Năm 1-4, học chuyên ngành | Lecture nhiều, ghi chú lộn xộn, cần ôn thi cuối kỳ | MVP v0.1 |
| **Học viên IELTS/TOEIC/HSK** | Người ôn chứng chỉ | Vocab + grammar phải lặp lại để nhớ | v0.2 |
| **Researcher** | Sau đại học, học giả | Tổng hợp paper, ghi nhớ insight | v1.0 |
| **Lifelong learner** | Người đi làm tự học | Học không liên tục, dễ quên | v0.2 |

---

## 5. Phạm vi MVP (In Scope)

### MVP v0.1 — Web only — 6-8 tuần (deadline 15/07/2026)

**7 tính năng cốt lõi:**

1. **Auth** — Đăng ký / Đăng nhập (Email + Google)
2. **Mind map editor** — Tạo / sửa mind map thủ công (kéo thả node, nhánh, màu)
3. **AI sinh mind map từ text / PDF** — Upload tài liệu → AI sinh mind map nháp
4. **Flashcard tự sinh từ mind map** — Mỗi node → flashcard
5. **Spaced repetition** — Lặp lại ngắt quãng (SM-2 algorithm hoặc tương đương)
6. **Quiz cơ bản** — Trắc nghiệm / điền khuyết tự sinh từ mind map
7. **Template mind map** — Bộ template sẵn theo môn (Toán/Lý/Hóa/Sử/IELTS...)

### Roadmap mở rộng (theo phân tầng đã chốt)

| Phase | Thời gian | Features bổ sung | Mục tiêu |
|-------|-----------|------------------|----------|
| **v0.2** | +4 tuần (~giữa tháng 8) | AI từ ảnh + YouTube, Thư viện public, Premium subscription | Monetize + viral loop |
| **v0.3** | +6 tuần (~cuối tháng 9) | Mobile app, Offline mode, Push notification | Mở rộng platform |
| **v1.0** | +6 tuần (~giữa tháng 11) | Học nhóm real-time, Marketplace, Follow/comment | Cộng đồng |

---

## 6. Ngoài phạm vi MVP v0.1 (Out of Scope)

Để tránh scope creep:

- ❌ Mobile app native (web trước, mobile ở v0.3)
- ❌ AI từ ảnh chụp / YouTube (ở v0.2)
- ❌ Thư viện public + social features (ở v0.2-v1.0)
- ❌ Real-time collaboration mind map nhóm (ở v1.0)
- ❌ Marketplace bán mind map (ở v1.0)
- ❌ Pomodoro timer (nice-to-have, có thể nhồi sau)
- ❌ Push notification (chỉ có ở mobile v0.3)

---

## 7. Timeline & Milestone

| # | Milestone | Deadline | Mô tả |
|---|-----------|----------|-------|
| M1 | Kickoff hoàn tất | 2026-05-23 | BA Discovery + SRS + Tech Decision xong |
| M2 | Sprint 1 — Foundation | 2026-06-06 | Setup repo, auth, DB schema, CI/CD |
| M3 | Sprint 2 — Mind map editor | 2026-06-20 | Editor kéo thả + lưu DB |
| M4 | Sprint 3 — AI + Flashcard + SR | 2026-07-04 | AI sinh mind map, flashcard tự sinh, spaced repetition |
| M5 | Alpha demo nội bộ | 2026-06-30 | Demo cho 5-10 user thân để feedback |
| M6 | **MVP v0.1 Launch (public)** | **2026-07-15** | Live cho user thật |

---

## 8. Team & Resources

- **Team size:** Solo — Quân Nguyễn + AI agents (Claude Code subagents)
- **Budget AI/tháng (pre-revenue):** **$50-100/tháng**
  - Bulk task → Gemini Flash / Claude Haiku
  - Task khó (sinh mind map, sinh quiz) → Claude Sonnet / GPT-4 mini
  - Monitor cost hàng tuần qua dashboard provider
- **Hosting MVP:** Tier free / cheap (Vercel + Supabase / Railway — Tech Lead sẽ quyết)

---

## 9. Ràng buộc

| Loại | Chi tiết |
|------|----------|
| **Tech stack** | Không bắt buộc — Tech Lead quyết ở Phase 4 |
| **Compliance** | PDPL Việt Nam (Luật Bảo vệ Dữ liệu Cá nhân) — encrypt PII, có chính sách privacy |
| **Tích hợp** | Không (greenfield) |
| **Ngôn ngữ UI** | Tiếng Việt primary, EN secondary (v1.0) |
| **Payment** | Tích hợp tối thiểu MoMo / VNPay / ZaloPay cho user VN (v0.2) |

---

## 10. Rủi ro đã xác định

| # | Rủi ro | Xác suất | Impact | Mitigation |
|---|--------|----------|--------|------------|
| R1 | **AI cost vượt budget** khi user tăng đột biến | TB | Cao | Cache aggressive, rate-limit free tier, dùng model rẻ cho bulk |
| R2 | **Scope creep** — thêm feature ngoài MVP | Cao | Cao | PM enforce mỗi sprint review, từ chối feature không trong charter |
| R3 | **Chất lượng AI sinh mind map kém** → user churn | TB | Cao | Cho user edit dễ dàng, A/B test nhiều prompt, fallback "draft only" |
| R4 | **Solo dev burnout** trong 6 tháng dài | Cao | Cao | Sprint 2 tuần, không over-commit, dùng tối đa AI agents |
| R5 | **Competitor (Quizlet/Anki) thêm AI mind map** | TB | TB | Launch sớm (MVP 8 tuần), USP "Việt + giá VN" khó copy |
| R6 | **Adoption chậm** — user không hiểu mind map | TB | Cao | Onboarding có template + video demo, content marketing TikTok |
| R7 | **Payment VN khó tích hợp** (MoMo/VNPay docs hạn chế) | TB | TB | Spike technical ở Sprint 2-3, có plan B (Stripe + đổi qua bank) |

---

## 11. Định nghĩa Thành công

### Sau 3 tháng từ launch (tức ~15/10/2026)
- ✅ **1,000 user đăng ký**
- ✅ **100 DAU** (Daily Active Users)
- ✅ **5% conversion free → Premium**
- ✅ NPS ≥ 30

### Sau 6 tháng từ launch (tức ~15/01/2027)
- ✅ **10,000 user đăng ký**
- ✅ **500 paying user** (~25-50M VNĐ MRR)
- ✅ Retention D30 ≥ 25%
- ✅ Có thư viện mind map cộng đồng ≥ 500 mind map public

---

## 12. Phê duyệt

| Vai trò | Người | Ngày | Trạng thái |
|---------|-------|------|------------|
| Project Manager | Quân Nguyễn (AI PM proxy) | 2026-05-16 | ✅ Approved |
| Sponsor / Founder | Quân Nguyễn | 2026-05-16 | ✅ Approved |

---

## 13. Bước tiếp theo

➡️ **Phase 2 — BA Discovery** (skill: `customer-discovery`)
- Stakeholder map
- Interview script
- 5-7 user interview thật (HS THPT, SV ĐH, học viên IELTS)
- As-Is / To-Be flow
- Pain points & opportunities

**Output dự kiến:** `docs/discovery/01-stakeholders.md` … `05-opportunities.md`

---

*Charter này là sống — sẽ review lại sau mỗi sprint và update version khi có thay đổi scope hợp lý.*
