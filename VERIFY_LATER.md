# 🔍 VERIFY_LATER — Các giả định cần Quân verify

**Mục đích:** Track mọi giả định, decision tự quyết, hoặc "cấn cấn" trong quá trình kickoff & dev. Quân xem khi rảnh và quyết.

**Quy tắc:** Mỗi item phải có **Phase**, **What**, **Why**, **Impact nếu sai**, **Verify how**.

---

## ⏰ Phase 1 — Project Charter

### V-001 — Deadline 15/07/2026 cho MVP v0.1
- **Why decided:** Charter định 8 tuần từ 16/05/2026
- **Impact nếu sai:** Trễ launch → mất momentum, vào mùa khai giảng tháng 9 mất cơ hội
- **Verify how:** Sau Sprint 2 review velocity → đánh giá có realistic không. Nếu chậm, push deadline thay vì cắt scope chất lượng

### V-002 — KPI 1,000 user trong 3 tháng
- **Why decided:** Rough estimate, không có baseline
- **Impact nếu sai:** Có thể quá thấp (đặt target dễ → tự thỏa mãn) hoặc quá cao (gây pressure)
- **Verify how:** Tìm benchmark VN apps tương tự (Quizizz VN, MarathonEdu) → adjust

### V-003 — Budget AI $50-100/tháng đủ không?
- **Why decided:** Self constraint của Quân
- **Impact nếu sai:** Có thể vượt nhanh khi user upload nhiều PDF lớn → tắt feature hoặc đốt tiền
- **Verify how:** Sprint 3 đo cost thực tế cho 100 mind map generation → extrapolate

---

## ⏰ Phase 2 — Discovery (giả lập)

### V-101 — Toàn bộ 7 persona là GIẢ LẬP
- **Why decided:** Quân chọn hybrid (Q1C) — simulate trước, validate sau
- **Impact nếu sai:** BRD/SRS có thể off với user thật → rework requirement
- **Verify how:** Quân tự interview 3-5 user thật (cháu/em họ HS + bạn SV) → đối chiếu với persona giả lập → cập nhật `interviews/` + revise BRD/SRS nếu khác biệt lớn

### V-102 — "HS tỉnh đa số không có laptop" (Linh)
- **Why decided:** Insight từ Linh giả lập, ảnh hưởng đến quyết định mobile-first
- **Impact nếu sai:** Có thể over-invest vào mobile UI, hoặc dưới-invest
- **Verify how:** Survey nhanh 20 HS tỉnh qua Facebook nhóm "Học sinh THPT"

### V-103 — Pricing 49-99k/tháng được chấp nhận
- **Why decided:** So sánh với Quizlet Plus 70k, ChatGPT $20
- **Impact nếu sai:** Pricing sai = conversion thấp / để tiền trên bàn
- **Verify how:** Landing page test trước launch — "Bạn sẵn sàng trả X cho app Y?" với 3 tier pricing

### V-104 — Free tier "10 mind map + 50 AI gen/tháng" đủ rộng?
- **Why decided:** Gut feel — đủ cho 1 môn học
- **Impact nếu sai:** Quá rộng → ăn AI cost mà không convert. Quá hẹp → user churn ngay
- **Verify how:** A/B test 2 tier free khi có 100+ free user

### V-105 — Collaboration (HMW6) đẩy lên v0.2 thay vì v1.0
- **Why decided:** 2/6 persona (Thảo + Mai) xin
- **Impact nếu sai:** Có thể không phải top priority cho mass, tốn 1-2 sprint
- **Verify how:** Survey free user sau MVP v0.1 launch → ranked feature request

### V-106 — Power user tier "Pro" 150-200k/tháng (An, Đức)
- **Why decided:** 2 power user giả lập đề cập
- **Impact nếu sai:** Có thể segment quá nhỏ, không justify build tier riêng
- **Verify how:** Hỏi 5-10 SV chuyên ngữ/Toán/CNTT thật về willingness to pay

---

## ⏰ Phase 3 — BRD + SRS

### V-201 — "Own product" mode, Quân tự ký BRD
- **Why decided:** Không có khách external, Quân vừa BA vừa sponsor
- **Impact nếu sai:** Mất tính kỷ luật scope discipline thường có với khách
- **Verify how:** Tự ép — mỗi sprint review, refuse feature ngoài BRD chính thức

### V-202 — Mind map data model: JSON tree trong PostgreSQL JSONB
- **Why decided:** Linh hoạt, dễ render, performance OK đến 1000 node
- **Impact nếu sai:** Nếu cần collaborative real-time → cần migrate sang Yjs/CRDT struct → rebuild
- **Verify how:** POC render 1000-node mind map ở Sprint 1 → đo perf. Nếu OK, giữ. Nếu lag → cân nhắc graph DB hoặc CRDT từ đầu

### V-203 — Spaced repetition dùng SM-2 (Anki classic)
- **Why decided:** Battle-tested, free, dễ implement
- **Impact nếu sai:** Modern algos (FSRS) tốt hơn nhưng phức tạp
- **Verify how:** v0.2 cân nhắc migrate FSRS sau khi có data user real

### V-204 — AI sinh mind map trả về structured JSON (không phải image)
- **Why decided:** Cho phép user edit + version control
- **Impact nếu sai:** None — đây là đúng quyết định
- **Verify how:** N/A

### V-205 — Quota AI: 50 generation/tháng cho free
- **Why decided:** Rough estimate dựa trên giá Gemini Flash
- **Impact nếu sai:** Cost vượt budget hoặc quá hạn chế user
- **Verify how:** Monitor sau 100 user → adjust

---

## ⏰ Phase 4 — Tech Decision

### V-301 — Chọn NestJS thay vì FastAPI / Hono / tRPC
- **Why decided:** TypeScript end-to-end, DI built-in, Quân quen
- **Impact nếu sai:** Nếu sau scale lên 100k user → có thể cần migrate sang Go/Rust
- **Verify how:** Stress test ở v0.3, nếu Node bottleneck → cân nhắc

### V-302 — PostgreSQL primary thay vì MongoDB
- **Why decided:** Relational + JSONB cho mind map = best of both worlds
- **Impact nếu sai:** Nếu mind map graph thực sự phức tạp → Neo4j tốt hơn
- **Verify how:** Đo query performance ở 10k mind map / user

### V-303 — Hosting: Vercel (FE) + Railway (BE + DB)
- **Why decided:** Setup nhanh, có free tier, scale tự động
- **Impact nếu sai:** Cost tăng nhanh khi scale → cần migrate VPS/K8s
- **Verify how:** Set budget alert. Khi $200/tháng → review migrate

### V-304 — Mind map editor: React Flow
- **Why decided:** Mature, customizable, có hierarchical layout
- **Impact nếu sai:** Performance limit ~1000 node. Nếu cần > 2000 → cần custom canvas
- **Verify how:** POC Sprint 1, render thử 500/1000/2000 node → đo FPS

### V-305 — Multi-AI strategy: Gemini Flash + Claude Haiku + Claude Sonnet
- **Why decided:** Cost optimize — model rẻ cho task đơn giản, model mạnh cho task khó
- **Impact nếu sai:** Routing logic phức tạp, có thể bug
- **Verify how:** Sprint 3 đo cost per generation thực tế

### V-306 — Payment: VNPay first (v0.2), MoMo + ZaloPay sau
- **Why decided:** VNPay docs tốt nhất, support nhiều thẻ
- **Impact nếu sai:** User trẻ thích MoMo/ZaloPay hơn → conversion thấp
- **Verify how:** Survey trong app: "Bạn muốn thanh toán qua?" — chọn top 1-2 implement trước

### V-307 — Email: Resend thay vì SendGrid
- **Why decided:** Cheaper ($0-20/tháng vs $15+), modern API, React Email templating
- **Impact nếu sai:** Newer service → ít deliverability data ở VN
- **Verify how:** Monitor bounce rate / spam rate sau launch

---

## ⏰ Pending Decisions (cần Quân quyết khi rảnh)

### D-001 — Tên brand chính thức
- **Options:** "Não Cá Vàng" (gốc), "BrainGold" (EN), "NaoVang"
- **Recommendation:** Giữ "Não Cá Vàng" — đậm chất VN, dễ nhớ, đánh vào pain point
- **Deadline:** Trước khi mua domain & launch

### D-002 — Logo + brand color
- **Recommendation:** Vàng (#FFD700) + Trắng (#FFFFFF) — gold = trí thức, sang
- **Deadline:** Sprint 2 (cần cho onboarding UI)

### D-003 — Domain
- **Candidates:** naocavang.com, naocavang.vn, brainfish.vn
- **Recommendation:** naocavang.com + naocavang.vn (mua cả 2, redirect)
- **Cost:** ~500k/năm cho cả 2
- **Deadline:** Trước Sprint 4 (khi setup CI/CD deploy)

### D-004 — Legal entity
- **Options:** Tự cá nhân (cho MVP) → công ty TNHH khi có doanh thu
- **Recommendation:** Cá nhân trước, đăng ký hộ kinh doanh khi MRR > 20M VND
- **Deadline:** Trước v0.2 launch (khi có payment)

### D-005 — Privacy Policy + Terms of Service
- **Recommendation:** Dùng template + tham vấn luật sư khi MRR > 50M
- **Deadline:** Trước public launch v0.1

### D-006 — Tài khoản developer cho Apple/Google (v0.3)
- **Cost:** Apple $99/năm + Google $25 one-time
- **Deadline:** v0.3 — trước khi build mobile

---

## 📋 Workflow để Quân verify

1. Đọc file này hàng tuần (vào sprint review)
2. Pick top 3-5 item priority cao
3. Verify (interview, A/B test, research)
4. Update file: mark `✅ VERIFIED — <kết luận>` hoặc `❌ INVALIDATED — cần thay đổi X`
5. Nếu invalidated → mở issue / Change Request → update BRD/SRS

---

**File này được maintain bởi AI agents — Quân là Decision Maker cuối cùng.**
