# 🎨 FE Demo Plan — Não Cá Vàng

**Author:** Tech Lead agent
**Date:** 2026-05-16
**Goal:** Build a **fully-clickable demo** of Não Cá Vàng frontend using **mock data only** — zero backend dependency. Quân có thể bật `pnpm --filter web dev`, click qua mọi tính năng, screenshot/quay video pitch.

---

## 🎯 Demo success criteria

Một newbie mở `http://localhost:3000` phải làm được tất cả:
1. **Landing** polished — hero, features, pricing, FAQ, footer
2. **"Đăng ký"** → tự động login mock → dashboard
3. **Dashboard home** — stats, recent items, CTA "Tạo mind map mới"
4. **Mind map editor** — mở 1 template "Toán Lớp 10", drag/zoom/edit node, export PNG
5. **Flashcard study** — flip card, rate 0/2/3/4, SM-2 chạy client-side, stats update
6. **Quiz player** — làm 5 câu, thấy kết quả + giải thích
7. **AI Chat tutor** — chat với "Cá Vàng GPT", thấy fake streaming response
8. **Library** — grid templates VN (Toán/Văn/Anh/Hoá/IELTS...)
9. **Settings** — đổi tên, đổi ngôn ngữ (placeholder), upgrade tier modal

**Không có gì gọi BE.** Tất cả là mock data trong `apps/web/src/lib/mock/`.

---

## 📐 Mock data strategy

```
apps/web/src/lib/mock/
├── auth.ts          # Mock user, login/register/logout (localStorage)
├── mindmaps.ts      # 3 sample mind maps
├── flashcards.ts    # 5 decks × 10-20 cards each
├── quizzes.ts       # 5 quizzes × 5-10 questions
├── chat.ts          # Mock streaming response (typewriter setInterval)
├── templates.ts     # 12 templates (Toán/Văn/Anh/Lý/Hoá/Sinh/Sử/Địa/IELTS/TOEIC/HSK)
└── delay.ts         # simulateNetwork(ms) helper for realistic UX
```

Mọi mock function trả `Promise<T>` với delay 200-500ms để giả lập network. Khi BE ready, chỉ swap import — props/types không đổi vì đã chuẩn hoá ở `packages/shared-types`.

---

## 🗓 Phase breakdown (8 phases, ~8 ngày solo)

### Phase 1 — UI Foundation + Landing polish (1 ngày) ⏰

**Deliverables:**
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `components/ui/` — Button, Card, Input, Label, Badge (shadcn pattern, dùng deps có sẵn @radix-ui/*)
- `components/layout/` — Header (logo + nav + CTA login/signup), Footer
- Landing page mới: Hero + 6 Features + How-it-works (3 step) + Pricing (Free/Premium/Pro) + FAQ + Footer
- Open Graph image placeholder
- Update `vi.json` với copy đầy đủ

**Commit:** `[demo] feat(web): UI foundation + polished landing page`

---

### Phase 2 — Mock auth flow (0.5 ngày)

**Deliverables:**
- `lib/mock/auth.ts` — `mockLogin(email, password)`, `mockRegister(...)`, `mockLogout()`, `useMockSession()` hook đọc localStorage
- Rewrite login page: form react-hook-form + zod validation → on submit call `mockLogin` → redirect `/dashboard`
- Rewrite register page tương tự
- Forgot password placeholder page
- "Tiếp tục với Google" button: mock — alert "Demo mode: cần Google OAuth credentials" rồi auto login mock user

**Commit:** `[demo] feat(web): mock auth flow — login/register with localStorage session`

---

### Phase 3 — Dashboard shell + Sidebar (0.5 ngày)

**Deliverables:**
- `components/layout/sidebar.tsx` — Mind Maps / Flashcards / Quiz / Tutor / Library / Settings nav
- `components/layout/topbar.tsx` — search input + user dropdown (avatar, logout)
- `app/(dashboard)/layout.tsx` — Sidebar + Topbar + children
- `app/(dashboard)/dashboard/page.tsx` — Stats cards (3 mindmaps, 12 cards due, 3-day streak), Recent activity, Quick action CTAs
- Sub-route placeholders cho mindmaps/flashcards/quizzes/tutor/library/settings

**Commit:** `[demo] feat(web): dashboard shell — sidebar + topbar + stats home`

---

### Phase 4 — Mind Map editor ⭐ THE WOW FACTOR (2 ngày)

**Deliverables:**
- `lib/mock/mindmaps.ts` — 3 mind maps mẫu:
  1. "Toán Lớp 10 — Hàm số bậc 2" (8 nodes, 7 edges)
  2. "IELTS Speaking Part 2 — Templates" (12 nodes)
  3. "Lịch sử VN — Cách mạng tháng 8" (15 nodes)
- `components/mindmap/MindMapCanvas.tsx` — React Flow wrapper:
  - Custom `ConceptNode` component (rounded card, color category, edit inline)
  - Toolbar: Add node, Delete, Color picker, Export PNG (html-to-image), Auto-layout (dagre)
  - Minimap + Controls + Background dots
  - Right panel: node detail (notes, image upload mock, tags)
  - Save = update Zustand store + localStorage
- `app/(dashboard)/mindmaps/page.tsx` — Grid list of user's mind maps + "+ Tạo mới" modal (pick template OR blank)
- `app/(dashboard)/mindmaps/[id]/page.tsx` — Editor view

**Commit:** `[demo] feat(web): mind map editor — React Flow + 3 templates + edit/export`

---

### Phase 5 — Flashcard study mode (1.5 ngày)

**Deliverables:**
- `lib/mock/flashcards.ts` — 5 decks (Tiếng Anh 600 từ, Toán công thức, Lịch sử VN, IELTS Idioms, Hoá hữu cơ) × 10-20 cards. Mỗi card có `easeFactor`, `interval`, `nextReview`, `repetitions` lưu localStorage
- `lib/sm2.ts` — clone từ `apps/api/src/modules/flashcard/domain/sm2.ts` để FE chạy client-side (sau này sẽ delete khi BE ready)
- `app/(dashboard)/flashcards/page.tsx` — Deck list grid + "+ Tạo deck" CTA
- `app/(dashboard)/flashcards/[deckId]/page.tsx` — Deck detail (cards table)
- `app/(dashboard)/flashcards/[deckId]/study/page.tsx` — Study mode:
  - Big card center (front), click/space → flip (animation)
  - 4 buttons: Lại (red) / Khó (orange) / Tốt (green) / Dễ (blue)
  - Click rating → SM-2 update → next card
  - End screen: cards reviewed, accuracy, next session ETA

**Commit:** `[demo] feat(web): flashcard study mode — flip + SM-2 client-side + stats`

---

### Phase 6 — Quiz player (1 ngày)

**Deliverables:**
- `lib/mock/quizzes.ts` — 5 quizzes × 5-10 câu (multi-choice, true-false, fill-blank)
- `app/(dashboard)/quizzes/page.tsx` — List
- `app/(dashboard)/quizzes/[id]/page.tsx` — Quiz info + Start
- `app/(dashboard)/quizzes/[id]/play/page.tsx` — Take quiz: 1 câu/màn, progress bar, timer
- `app/(dashboard)/quizzes/[id]/result/page.tsx` — Score % + per-question review + giải thích AI

**Commit:** `[demo] feat(web): quiz player — multi-choice/T-F/fill, result + explanations`

---

### Phase 7 — AI Chat tutor (1 ngày)

**Deliverables:**
- `lib/mock/chat.ts` — `streamMockResponse(prompt, onToken)` — split mock answer thành tokens, emit từng token mỗi 30ms (giả lập streaming)
- `app/(dashboard)/tutor/page.tsx` — Chat UI:
  - Sidebar: conversation list (3-5 mock)
  - Main: messages (user + assistant), avatar "🐠 Cá Vàng GPT", markdown render
  - Input bottom + Send button
  - Streaming animation (caret blink trong message đang generate)
- Suggested prompts: "Giải thích định lý Pythagoras", "IELTS Speaking Part 2 mẫu", "Tóm tắt chương 1 sinh học 10"

**Commit:** `[demo] feat(web): AI chat tutor — Cá Vàng GPT with mock streaming`

---

### Phase 8 — Library + Settings + Polish (0.5 ngày)

**Deliverables:**
- `app/(dashboard)/library/page.tsx` — Templates grid: filter by subject + grade, "Dùng template này" CTA → tạo mind map từ template
- `app/(dashboard)/settings/page.tsx` — Profile (name, email, avatar mock), Tier upgrade modal (Free/Premium/Pro pricing), Notification toggles (placeholders)
- Toast notifications (sonner or custom)
- Loading states + empty states
- Mobile responsive testing (sidebar → hamburger drawer)
- 404 page

**Commit:** `[demo] feat(web): library templates + settings + polish + responsive`

---

## 📦 Dependencies cần thêm

Tất cả đã có trong `package.json` rồi — chỉ cần `pnpm install`. Optional thêm cho polish:
- `html-to-image` — export mind map PNG (Phase 4)
- `dagre` — auto-layout mind map (Phase 4)
- `sonner` — toast (Phase 8) — hoặc custom Radix Toast

---

## 🚦 Demo run-book (cho Quân test)

```bash
# Lần đầu
pnpm install              # ~3-5 phút
pnpm --filter web dev     # http://localhost:3000

# Demo flow
1. http://localhost:3000               → landing page
2. Click "Dùng thử miễn phí"           → /register
3. Điền form bất kỳ → Submit            → mock login → /dashboard
4. Click "Tạo mind map mới"             → pick template "Toán Lớp 10"
5. Edit nodes, drag, export PNG         → tải về máy
6. Sidebar → "Flashcards" → pick deck   → "Bắt đầu ôn"
7. Flip card, rate Tốt/Khó              → next card
8. Sidebar → "Tutor"                    → chat với Cá Vàng GPT
9. Sidebar → "Settings" → "Nâng cấp"    → xem pricing modal
```

---

## 🚀 Sau demo

Khi BE sẵn sàng (sau khi Quân xử lý PENDING_HUMAN):
1. Replace `lib/mock/*` bằng API client thật (`@nao-ca-vang/api-client` package mới)
2. Wire NextAuth credentials provider + Google OAuth
3. Streaming chat dùng SSE/WebSocket thật từ NestJS
4. Delete `lib/sm2.ts` ở FE (đã có ở BE)

→ Vì props/types đã align với `packages/shared-types`, swap chỉ tốn ~0.5-1 ngày.

---

## 📊 Progress tracker

- [x] Phase 1 — UI Foundation + Landing ✅ 2026-05-16
- [x] Phase 2 — Mock auth ✅ 2026-05-16
- [x] Phase 3 — Dashboard shell ✅ 2026-05-16
- [x] Phase 4 — Mind map editor ⭐ ✅ 2026-05-16
- [x] Phase 5 — Flashcard study ✅ 2026-05-16
- [x] Phase 6 — Quiz player ✅ 2026-05-16
- [x] Phase 7 — AI Chat tutor ✅ 2026-05-16
- [ ] Phase 8 — Library + Settings + polish (settings done — chỉ còn responsive polish + 404 + toast)

**Done in 1 session — branch `night-shift/sprint-1-20260516`.**
Tech Lead commits atomic per phase. Quân `pnpm install && pnpm --filter web dev` → demo ngay.
