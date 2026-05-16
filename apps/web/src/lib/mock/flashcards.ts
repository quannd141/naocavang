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
