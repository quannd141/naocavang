import { SM2_DEFAULTS, type Sm2State } from '@/lib/sm2';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  sm2: Sm2State;
  nextReview: string; // ISO date
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  description: string;
  cards: Flashcard[];
}

function due(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const MOCK_DECKS: FlashcardDeck[] = [
  {
    id: 'eng-600',
    title: 'Tiếng Anh 600 từ vựng',
    subject: 'Tiếng Anh',
    description: '600 từ vựng cốt lõi cho học sinh THPT, lấy từ corpus SGK',
    cards: [
      { id: 'c1', front: 'abundant (adj)', back: 'dồi dào, phong phú', hint: 'Ex: abundant resources', sm2: { ...SM2_DEFAULTS }, nextReview: due(1) },
      { id: 'c2', front: 'meticulous (adj)', back: 'tỉ mỉ, kỹ lưỡng', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 'c3', front: 'ambiguous (adj)', back: 'mơ hồ, nhập nhằng', sm2: { ...SM2_DEFAULTS }, nextReview: due(2) },
      { id: 'c4', front: 'inevitable (adj)', back: 'không thể tránh khỏi', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 'c5', front: 'profound (adj)', back: 'sâu sắc', sm2: { ...SM2_DEFAULTS }, nextReview: due(1) },
      { id: 'c6', front: 'conspicuous (adj)', back: 'nổi bật, dễ thấy', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 'c7', front: 'reluctant (adj)', back: 'miễn cưỡng', hint: 'reluctant to do sth', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 'c8', front: 'subtle (adj)', back: 'tinh tế, khó nhận ra', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
    ],
  },
  {
    id: 'toan-ct',
    title: 'Toán — Công thức lượng giác',
    subject: 'Toán',
    description: 'Công thức cộng, nhân đôi, hạ bậc, biến tổng thành tích',
    cards: [
      { id: 't1', front: 'sin(a + b) = ?', back: 'sin a · cos b + cos a · sin b', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 't2', front: 'cos(a + b) = ?', back: 'cos a · cos b − sin a · sin b', sm2: { ...SM2_DEFAULTS }, nextReview: due(1) },
      { id: 't3', front: 'sin 2a = ?', back: '2 · sin a · cos a', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 't4', front: 'cos 2a = ?', back: 'cos²a − sin²a = 1 − 2sin²a = 2cos²a − 1', sm2: { ...SM2_DEFAULTS }, nextReview: due(1) },
      { id: 't5', front: 'tan(a + b) = ?', back: '(tan a + tan b) / (1 − tan a · tan b)', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
    ],
  },
  {
    id: 'su-vn',
    title: 'Lịch sử VN — Mốc thời gian',
    subject: 'Sử',
    description: 'Các sự kiện then chốt trong lịch sử Việt Nam',
    cards: [
      { id: 's1', front: 'Năm thành lập Đảng Cộng sản Việt Nam?', back: '3/2/1930', hint: 'Hồng Kông', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 's2', front: 'Ngày Cách mạng tháng 8 thành công?', back: '19/8/1945', sm2: { ...SM2_DEFAULTS }, nextReview: due(1) },
      { id: 's3', front: 'Ngày tuyên ngôn độc lập?', back: '2/9/1945 — Bác Hồ tại Quảng trường Ba Đình', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 's4', front: 'Chiến thắng Điện Biên Phủ?', back: '7/5/1954', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 's5', front: 'Ngày thống nhất đất nước?', back: '30/4/1975', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
    ],
  },
  {
    id: 'ielts-idiom',
    title: 'IELTS — 50 Idioms band 7+',
    subject: 'IELTS',
    description: 'Idioms thông dụng dùng trong IELTS Speaking để boost band điểm',
    cards: [
      { id: 'i1', front: 'off the top of my head', back: 'không cần suy nghĩ, nói ngay', hint: 'when you say sth without preparation', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 'i2', front: 'bear in mind', back: 'lưu ý, ghi nhớ', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 'i3', front: 'a piece of cake', back: 'dễ như ăn bánh', sm2: { ...SM2_DEFAULTS }, nextReview: due(1) },
      { id: 'i4', front: 'hit the books', back: 'học hành chăm chỉ', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
      { id: 'i5', front: 'on cloud nine', back: 'cực kỳ hạnh phúc', sm2: { ...SM2_DEFAULTS }, nextReview: due(2) },
      { id: 'i6', front: 'cost an arm and a leg', back: 'đắt cắt cổ', sm2: { ...SM2_DEFAULTS }, nextReview: due(0) },
    ],
  },
  {
    id: 'hoa-hc',
    title: 'Hoá hữu cơ — Phản ứng đặc trưng',
    subject: 'Hoá',
    description: 'Phản ứng đặc trưng của hidrocacbon, ancol, anđehit, axit cacboxylic',
    cards: [
      { id: 'h1', front: 'Ankan + Cl₂ (ánh sáng) tạo ra?', back: 'Dẫn xuất halogen + HCl (phản ứng thế)', sm2: { ...SM2_DEFAULTS }, nextReview: due(3) },
      { id: 'h2', front: 'Anken + HBr tạo ra?', back: 'Dẫn xuất halogen (cộng theo quy tắc Markovnikov)', sm2: { ...SM2_DEFAULTS }, nextReview: due(2) },
      { id: 'h3', front: 'Ancol + Na tạo ra?', back: 'R−ONa + ½H₂↑', hint: 'Phản ứng thế nhóm OH', sm2: { ...SM2_DEFAULTS }, nextReview: due(5) },
      { id: 'h4', front: 'Anđehit + AgNO₃/NH₃ tạo ra?', back: 'Ag↓ (tráng gương) + axit cacboxylic + NH₄NO₃', sm2: { ...SM2_DEFAULTS }, nextReview: due(2) },
      { id: 'h5', front: 'Axit cacboxylic + ancol tạo ra?', back: 'Este + H₂O (phản ứng este hoá, xúc tác H₂SO₄ đặc, đun nóng)', sm2: { ...SM2_DEFAULTS }, nextReview: due(4) },
    ],
  },
];

export function getMockDeck(id: string): FlashcardDeck | undefined {
  return MOCK_DECKS.find((d) => d.id === id);
}

export function dueCards(deck: FlashcardDeck): Flashcard[] {
  const now = Date.now();
  return deck.cards.filter((c) => new Date(c.nextReview).getTime() <= now);
}

const STUDY_KEY_PREFIX = 'nao-ca-vang:deck-state:';

export function loadDeckState(deckId: string): Record<string, Sm2State> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STUDY_KEY_PREFIX + deckId);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDeckState(deckId: string, state: Record<string, Sm2State>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STUDY_KEY_PREFIX + deckId, JSON.stringify(state));
}
