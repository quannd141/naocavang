# Stakeholder Map — Não Cá Vàng

**Ngày:** 2026-05-16
**Phiên bản:** 1.0
**Người tạo:** BA Discovery (Quân Nguyễn)

---

## 1. Stakeholders chính (decision makers)

| Tên | Vai trò | Pain point chính | Mức ảnh hưởng | Liên hệ |
|-----|---------|-----------------|---------------|---------|
| Quân Nguyễn | Founder + Solo Developer + PM | Build sản phẩm chất lượng trong 8 tuần với budget AI $50-100/tháng | HIGH | quannd141@gmail.com |
| (Tương lai) Advisor giáo dục | Cố vấn nội dung sư phạm | Đảm bảo phương pháp học khoa học | MED | TBD — tìm 1 advisor là GV/giảng viên |
| (Tương lai) Angel investor | Funding pre-seed sau MVP | ROI, traction số liệu | MED | TBD sau khi có 1k user |

---

## 2. End users (người dùng thực tế — TARGET MVP v0.1)

| Persona | Mô tả | Quy mô VN | Pain point chính | Số interview cần |
|---------|-------|-----------|------------------|------------------|
| **P1 — HS THPT lớp 11-12** | Đang ôn thi ĐH, học 10+ môn | ~1.8 triệu HS lớp 11-12 (2025) | Học nhiều môn, khó tổng hợp, dễ quên | 3 interview giả lập |
| **P2 — SV ĐH năm 1-3** | Học chuyên ngành, lecture nhiều | ~1.5 triệu SV ĐH chính quy | Tài liệu phân mảnh (slide, sách, paper), thi cuối kỳ dồn dập | 3 interview giả lập |
| **P3 — Học viên IELTS/TOEIC** (v0.2 priority) | 18-30 tuổi, ôn chứng chỉ | ~500k học viên/năm | Vocab + cấu trúc ngữ pháp cần lặp lại liên tục để nhớ | 1 interview giả lập (làm context cho v0.2) |
| **P4 — Lifelong learner** (v0.2 priority) | 25-45 tuổi, tự học sau giờ làm | ~vài trăm nghìn | Học không liên tục → quên nhanh, không có hệ thống | (skip ở MVP v0.1) |
| **P5 — Researcher / Postgrad** (v1.0 priority) | Sau ĐH, đọc paper nhiều | ~vài chục nghìn | Tổng hợp insight từ nhiều paper, ghi nhớ method | (skip ở MVP v0.1) |

**Tổng interview giả lập cho Phase 2: 7 user** (3 HS + 3 SV + 1 IELTS để có context v0.2).

---

## 3. Influencers (không quyết định nhưng ảnh hưởng)

| Tên / Nhóm | Vai trò | Quan điểm dự đoán | Risk / Opportunity |
|------------|---------|-------------------|---------------------|
| Phụ huynh HS THPT | Người trả tiền cho con học | Sẵn sàng chi nếu thấy con học tốt hơn | **Opportunity**: target ads vào phụ huynh cho gói Premium |
| Giáo viên / Giảng viên | Influencer chính cho HS/SV | Có thể recommend tool cho lớp | **Opportunity**: B2B2C — bán cho trường |
| KOL TikTok học tập (VD: Thầy Nam Hóa, Cô Vĩnh Hà) | Tạo trend học | Có thể giới thiệu tool nếu chất lượng | **Opportunity**: partnership marketing |
| Cộng đồng Facebook "Học giỏi cùng nhau" | Nguồn user organic | Săn tool miễn phí, ghét ads | **Risk**: review xấu nếu UX kém |
| App store reviewer | Quyết định visibility | App store yêu cầu high quality | **Risk**: launch sớm = review thấp |

---

## 4. RACI cho dự án MVP v0.1

| Hoạt động | Responsible | Accountable | Consulted | Informed |
|-----------|-------------|-------------|-----------|----------|
| Approve Project Charter | PM | Founder (Quân) | — | AI agents |
| Approve Discovery output | BA | Founder | (Tương lai) advisor | — |
| Approve BRD | BA | Founder | Tech Lead | — |
| Approve SRS | Tech Lead | Founder | BA | Senior Dev |
| Implement code | Senior Dev (AI) | Tech Lead | — | Founder |
| QA testing | QA agent | Tech Lead | — | Founder |
| Deploy MVP | DevOps agent | Tech Lead | — | Founder |
| User feedback loop | BA + Founder | Founder | Real users | All agents |

> **Lưu ý solo founder mode:** Quân vừa là Founder (Accountable cho mọi quyết định) vừa là người vận hành tay nhiều khâu thông qua AI agents.

---

## 5. User research recruiting plan (cho validation Phase sau)

Sau khi tôi xuất 7 interview giả lập, **Quân cần validate bằng 3-5 interview thật**:

| Persona | Kênh tìm user thật | Câu mở đầu |
|---------|--------------------|------------|
| HS THPT lớp 11-12 | Hỏi cháu / em họ / con bạn bè đang học cấp 3 | "Anh đang làm app giúp học sinh học nhanh hơn, em cho anh xin 20 phút để hỏi cách em học hiện tại nhé?" |
| SV ĐH | Bạn bè đang đi học / em họ SV / Facebook group SV trường | Tương tự |
| Học viên IELTS | Facebook group "IELTS Speaking", "Cộng đồng học IELTS" | "Mình đang nghiên cứu cách người Việt học IELTS hiệu quả, mình tặng 1 buổi cafe nếu bạn trả lời 20 phút" |

**Mẹo recruit:** offer 1 cốc cafe (~50k) hoặc voucher Premium 3 tháng khi launch — cost thấp, conversion tốt.

---

## 6. Bước tiếp theo

➡️ `02-interview-script.md` — Script chi tiết để interview
➡️ `interviews/` — 7 file giả lập (làm hypothesis)
➡️ `03-flow-as-is.md` + `04-flow-to-be.md` — Visualize workflow
➡️ `05-opportunities.md` — Tổng hợp pain points + HMW
