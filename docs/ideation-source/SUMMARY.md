# NãoCáVàng — Ideation Summary

**Ngày**: 2026-05-16
**Skill chạy**: `/project-ideation`
**Trạng thái**: ✅ Đủ điều kiện chạy `/project-kickoff` (sau khi check trademark)

---

## One-liner

Nền tảng học bằng AI all-in-one cho người học Việt Nam — biến tài liệu (text/PDF/slide) thành **mind map + flashcard + quiz + AI tutor + summary** chỉ trong 1 platform, giúp **người có trí nhớ não cá vàng vẫn nhớ dai**.

> **Tagline gợi ý**: "NãoCáVàng — Học một lần, nhớ cả đời."
> Brand humor: flip meme VN nổi tiếng "trí nhớ não cá vàng = quên hoài" → sản phẩm giúp giải pain đó.

## Cảm hứng & nguồn

- **Reference**: [heuristi.ca](https://www.heuristi.ca/) — All-in-one AI learning (Concept Map + Flashcard + Quiz + AI Chat + Summarizer). 75.000+ users, made in Switzerland, EN-only.
- **Khoảng trống**: Heuristica + competitors global đều **không có tiếng Việt + không hiểu curriculum VN + giá $10-20/tháng quá cao cho HS VN**.

## Bài toán giải quyết (Pain Points)

1. **Tổ chức kiến thức phức tạp tốn nhiều thời gian** — người học mất hàng giờ tóm tắt sách/video → ngại học
2. **Tự tạo flashcard/quiz thủ công rất lâu** — đa số bỏ giữa chừng, không có routine
3. **Không biết ôn tập đúng phương pháp** — spaced repetition chưa phổ biến, kiến thức trôi đi sau 1-2 tuần
4. **Công cụ hiện có rời rạc** — Anki (chỉ flashcard), Quizlet (chỉ flashcard share), ChatGPT (chat thuần không lưu structured), Notion (manual), Heuristica (EN-only đắt) → phải dùng 4-5 tool cùng lúc
5. **Tiếng Việt + curriculum VN bị bỏ rơi** — AI tool global chỉ giỏi EN, không hiểu môn học BGD, IELTS VN, giáo trình ĐH VN

## Target User (broad — đã chấp nhận trade-off PMF)

- **Học sinh THPT** ôn thi đại học (~3 triệu HS lớp 10-12)
- **Sinh viên đại học** (kinh tế, y dược, kỹ thuật, luật...) (~2 triệu SV)
- **Người ôn chứng chỉ** — IELTS, TOEIC, HSK, JLPT (~vài trăm nghìn)
- **Researcher / chuyên nghiệp tự học** (niche nhỏ nhưng chịu chi)
- **Lifelong learner** — người đi làm tự nâng cấp kỹ năng

> ⚠️ **Note cho BA Discovery**: Target rộng = rủi ro PMF kém. **BA cần khảo sát phân loại** — segment nào pain mạnh nhất, willingness-to-pay cao nhất → ưu tiên đó cho Phase 1.

## USP (3 điểm khác biệt)

1. **All-in-one tiếng Việt native** — 5 module (mind map + flashcard + quiz + AI chat + summary) trong 1 platform, input VI, output VI, hiểu curriculum BGD/IELTS VN
2. **Brand viral** — meme "não cá vàng" đã có sẵn trong văn hoá VN → marketing chi phí thấp, HS thấy là cười + nhớ ngay
3. **Giá Việt** — Heuristica $10-20/tháng (~250-500k VND); mình target 49-149k/tháng + có gói miễn phí thật sự dùng được

## Scope MVP (5 feature)

| ID | Feature | Priority | Mô tả |
|----|---------|----------|-------|
| F1 | **Text paste → AI parse** | P0 | Người dùng paste text/note → AI extract concepts |
| F2 | **AI Flashcard + Spaced Repetition** | P0 | Generate flashcard tự động, schedule ôn theo SRS (giống Anki) |
| F3 | **AI Quiz generator** | P0 | Trắc nghiệm + tự luận ngắn để self-test |
| F4 | **Mind Map auto** | P0 | Visualize cấu trúc kiến thức tự động từ content |
| F5 | **AI Chat tutor** | P0 | Hỏi đáp với context tài liệu đã upload, hỗ trợ giải bài tập |
| F6 | **PDF upload** | P1 | Nice-to-have sau MVP — parse PDF (giáo trình, ebook) |
| F7 | **Slide PPT/PDF upload** | P2 | Parse slide bài giảng |
| F8 | **YouTube link** | P3 | Parse video bài giảng (giống Heuristica) |

## Brand & Naming

- **Tên dự án**: `nao-ca-vang` (NãoCáVàng)
- **Tagline**: "Học một lần, nhớ cả đời"
- **Tông brand**: Trẻ trung - vui - viral (Cake/Duolingo style)
- **Ngôn ngữ brand**: Tiếng Việt thuần
- **Đối tượng nhìn tên đầu tiên**: Cả B2C (HS/SV tự dùng) + B2B2C (trường/giáo viên)
- **Brand differentiator**: Meme flip — "não cá vàng" trong văn hoá VN nghĩa là "trí nhớ kém", brand mang nghĩa ngược lại "ai cũng dùng được kể cả não cá vàng"
- **Visual concept gợi ý**: Mascot cá vàng đeo kính + sách (smart goldfish), màu vàng-cam (gold + warm), pixel-art hoặc minimal modern

## Architecture Model (chưa chốt — Tech Lead quyết)

Hướng đề xuất:
- **Web app first** (Next.js + responsive) — dễ scale, không cần qua App Store/Play Store ban đầu
- **Backend**: AI orchestration layer — gọi nhiều LLM (OpenAI / Anthropic / Gemini / model VN như VinAI) tuỳ task. Tích hợp embedding để index tài liệu user upload.
- **Mobile app** (Phase 2) — React Native, sync với web

## Monetization (chưa chốt — BA Discovery sẽ khảo sát)

Hướng đề xuất giai đoạn này:
- **Free tier** — generous, dùng được lâu dài (10-20 flashcard/tháng, quiz cơ bản) → lấy 100.000+ user
- **Pro 49-79k/tháng** — unlimited flashcard, quiz, mind map; ưu tiên model AI tốt nhất
- **Premium 149k/tháng** — thêm PDF/Slide upload, AI tutor nâng cao, export Anki/PDF
- **B2B school** — gói trường (5-50tr/năm tuỳ quy mô), admin dashboard cho giáo viên

→ BA cần khảo sát 15-20 user (đa segment) để chốt giá + tier.

## Competitor (research kỹ — giao Tech Lead)

| Tên | Loại | Điểm yếu |
|-----|------|----------|
| **Heuristica** (TZ) | All-in-one AI learning | EN-only, $10-20/tháng |
| **Quizlet** (US) | Flashcard sharing | Chỉ flashcard, không AI tutor, đắt |
| **Anki** (open source) | Flashcard + SRS | Manual tạo card, UI cũ, không AI |
| **NotebookLM** (Google) | AI study assistant | EN-first, không có flashcard structured |
| **RemNote / Knowt** | AI learning notes | EN-only |
| **MathDojo** (VN) | AI tutoring Toán | Chỉ Toán |
| **Edmicro** (VN) | EdTech tổng hợp | B2B school, không AI all-in-one |
| **OnLuyện / VuiHọc / HọcMãi** (VN) | Bài giảng video | Học thụ động, không AI tạo nội dung |
| **ChatGPT / Claude / Gemini** | Generic AI chat | Không có structured output (flashcard/quiz/mindmap), không SRS |

→ **Khoảng trống thị trường**: AI all-in-one tiếng Việt cho người học VN — **chưa ai làm**.

## ⚠️ Trademark Check (BẮT BUỘC trước launch)

- [ ] Tra cứu **TM VN** tại [iponline.noip.gov.vn](https://iponline.noip.gov.vn) cho "NãoCáVàng", "Não Cá Vàng", "naocavang"
- [ ] Check domain: `naocavang.vn`, `naocavang.com`, `naocavang.app`
- [ ] Check social handle: Facebook, TikTok, YouTube, Instagram
- [ ] Check Google Play / App Store có app trùng tên không
- [ ] Nếu trùng → quay lại chọn tên dự phòng (NhớDai, VởVàng)

→ Giao **BA Discovery** + **PM** xử lý trong Sprint 0.

## Readiness Verdict

```
✅ Đã rõ — chạy /project-kickoff:
- [x] Pain point & target user rõ (broad — 5 segment, BA narrow sau)
- [x] Scope MVP 5 feature P0 + 3 P1-P3 (F1-F8)
- [x] Brand đã chốt (NãoCáVàng, VI, trẻ-vui, B2C+B2B2C)
- [x] USP rõ — all-in-one + tiếng Việt + viral meme
- [x] Competitor đã map sơ bộ

🟡 Để BA Discovery + Tech Lead xử lý sau kickoff:
- [ ] Trademark check (BẮT BUỘC trước build)
- [ ] Narrow target user — chọn 1-2 segment ưu tiên Phase 1
- [ ] Monetization model + pricing chi tiết
- [ ] Tech stack — LLM nào, embedding nào, vector DB nào, chi phí AI/tháng
- [ ] Mind map rendering library (React Flow? Mermaid? D3?)
- [ ] Customer Discovery — khảo sát 15-20 user đa segment
- [ ] BRD + SRS — agency-style cho dev build
```

---

**Phát triển bởi Quân Nguyễn — Quality First, Always.**
