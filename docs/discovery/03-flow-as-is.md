# As-Is Flow — Cách người học VN học HIỆN TẠI

**Ngày:** 2026-05-16
**Phiên bản:** 1.0

> Tổng hợp từ 7 interview giả lập (3 HS, 3 SV, 1 IELTS). Cần validate bằng interview thật.

---

## Flow 1 — HS THPT học 1 chương mới

```mermaid
flowchart TD
    A[Cô/thầy giảng bài mới trên lớp] --> B[HS ghi chép vào vở giấy]
    B --> C[Cô gửi slide PDF/PPT qua Zalo lớp]
    C --> D{HS có laptop?}
    D -->|Có laptop| E[Mở slide PDF trên laptop]
    D -->|Chỉ điện thoại| F[Screenshot slide vào ảnh điện thoại]
    E --> G[Đọc + take note song song]
    F --> H[Đọc trên màn hình nhỏ, mỏi mắt]
    G --> I[Làm bài tập về nhà]
    H --> I
    I --> J{Hiểu bài?}
    J -->|Có| K[Quên dần sau 2-4 tuần]
    J -->|Không hiểu| L[Tự Google / xem YouTube / hỏi bạn / ChatGPT]
    L --> M[Hỏi rồi quên cách giải]
    K --> N[Đến đề tổng hợp → như học mới lại]
    M --> N
    N --> O[Học lại từ đầu cho thi]

    style K fill:#ffcccc
    style M fill:#ffcccc
    style N fill:#ffcccc
    style O fill:#ffcccc
```

**Pain hot spots (đỏ):**
- Quên sau 2-4 tuần
- Học/hỏi xong quên ngay
- Ôn lại từ đầu = phí thời gian

---

## Flow 2 — SV ĐH ôn thi cuối kỳ

```mermaid
flowchart TD
    A[Bắt đầu kỳ: 7-8 môn, mỗi môn 100-300 trang slide] --> B[Mỗi tuần: học mới + làm bài]
    B --> C[Ghi note trong Notion / vở / GoogleDocs]
    C --> D{Có ôn định kỳ?}
    D -->|Không 95%| E[Note bị bỏ quên]
    D -->|Có 5% chăm| F[Đọc lại note hàng tuần]
    E --> G[2 tuần trước thi: hoảng]
    F --> H[Vẫn quên nhiều vì đọc thụ động]
    G --> I[In hết slide 7-8 môn × 200 trang]
    H --> I
    I --> J[Thức đêm học dồn 14 ngày]
    J --> K[Học nhóm Facebook Messenger - chia tóm tắt qua Word]
    K --> L{Format đồng bộ?}
    L -->|Không| M[Mỗi đứa làm 1 kiểu khác → đọc rối]
    L -->|Có| N[Ít khi xảy ra]
    M --> O[Vào phòng thi: học thuộc rồi quên]
    N --> P[Đỡ hơn nhưng vẫn áp lực]
    O --> Q[Thi xong: 8.5 điểm, 1 tháng sau quên 70%]
    P --> Q

    style E fill:#ffcccc
    style G fill:#ffcccc
    style J fill:#ffcccc
    style M fill:#ffcccc
    style Q fill:#ffcccc
```

**Pain hot spots:**
- Không ôn định kỳ trong kỳ
- Học dồn 2 tuần trước thi → burnout
- Học nhóm không đồng bộ format
- Quên 70% sau 1 tháng

---

## Flow 3 — Học viên IELTS học vocab (v0.2 context)

```mermaid
flowchart TD
    A[Mở sách Cambridge / Mai Lan Hương] --> B[Chọn 30 từ mới ngày]
    B --> C[Mở Quizlet, tạo set mới]
    C --> D[Gõ từng từ + nghĩa + ví dụ → 30-45 phút]
    D --> E[Học flashcard Quizlet]
    E --> F{Nhớ được không?}
    F -->|Phần lớn| G[1 tuần sau quên 40%]
    F -->|Quên ngay| H[Học lại từ đầu]
    G --> I[Đi nói: quên cách dùng từ]
    H --> I
    I --> J[Tốn 70k/tháng Quizlet Plus mà vẫn không hiệu quả]

    style D fill:#ffcccc
    style G fill:#ffcccc
    style I fill:#ffcccc
    style J fill:#ffcccc
```

**Pain hot spots:**
- Nhập tay 30-45 phút/ngày — tốn TG hơn cả học
- Nhớ nghĩa nhưng không biết dùng
- Trả tiền nhưng không hiệu quả

---

## Tổng kết các "hot spot" chung

| # | Hot spot | Persona ảnh hưởng | Tần suất | Severity |
|---|----------|-------------------|----------|----------|
| H1 | **Quên kiến thức sau 2-4 tuần** | HS + SV + IELTS | Mọi user | 🔥🔥🔥 |
| H2 | **Tổng hợp slide dài thủ công** | HS + SV | Mỗi tuần | 🔥🔥🔥 |
| H3 | **Nhập liệu thủ công vào tool** | IELTS, một số HS | Mỗi ngày | 🔥🔥 |
| H4 | **Học dồn cuối kỳ → burnout** | SV chủ yếu | Mỗi kỳ thi | 🔥🔥🔥 |
| H5 | **Học nhóm không đồng bộ** | SV + HS chuyên | Trong nhóm | 🔥🔥 |
| H6 | **Không biết yếu skill gì** | IELTS, HS thi ĐH | Trước thi | 🔥🔥 |
| H7 | **Học sinh tỉnh không có laptop** | HS + SV tỉnh | Chronic | 🔥🔥 |
| H8 | **Không có Visa Card để trả app nước ngoài** | HS + SV cấp trung | Khi muốn upgrade | 🔥 |
| H9 | **App nước ngoài quá đắt** | Tất cả | Khi cân nhắc | 🔥🔥 |
| H10 | **ChatGPT mất context giữa session** | Power users | Mỗi session | 🔥 |

---

## Mỗi pain → giải pháp tiềm năng (preview cho `04-flow-to-be.md`)

| Pain | Não Cá Vàng giải thế nào |
|------|--------------------------|
| H1 Quên kiến thức | **Spaced repetition tự động** trên mind map |
| H2 Tổng hợp slide dài | **AI sinh mind map từ PDF/PPT** trong 30 giây |
| H3 Nhập liệu thủ công | **AI tự sinh flashcard từ mind map** |
| H4 Học dồn cuối kỳ | **Smart reminder ôn theo lịch thi** |
| H5 Học nhóm không đồng bộ | **Mind map collaborative** (v0.2/v1.0) |
| H6 Không biết yếu skill gì | **Analytic dashboard** (v0.2-v1.0) |
| H7 HS tỉnh không laptop | **Responsive web tốt + PWA** + mobile v0.3 |
| H8 Không có Visa | **MoMo / ZaloPay / VNPay** (v0.2) |
| H9 App nước ngoài đắt | **Pricing VN: 49-99k/tháng** (+ free tier rộng + gói SV 39k) |
| H10 ChatGPT mất context | **AI persistent context per mind map** |
