/**
 * Flashcard + Spaced Repetition types.
 *
 * Spaced Repetition uses SM-2 algorithm (see ADR-004).
 * Quality scale: 0 (Lại), 2 (Khó), 3 (Tốt), 4 (Dễ).
 */

export type FlashcardFormat = 'qa' | 'cloze' | 'mcq';

/** Quality rating user provides after reviewing a card. */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4;

/** Mapped to UX-friendly labels in Vietnamese. */
export const QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: 'Lại',
  1: 'Lại',
  2: 'Khó',
  3: 'Tốt',
  4: 'Dễ',
};

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  format: FlashcardFormat;
  // SM-2 state
  easeFactor: number; // default 2.5, min 1.3
  interval: number; // days
  repetitions: number;
  nextReviewAt: string; // ISO date
  lastReviewedAt: string | null;
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  mindmapId: string;
  userId: string;
  title: string;
  cardCount: number;
  dueCount: number; // cards due today
  createdAt: string;
}

export interface CreateFlashcardDeckDto {
  mindmapId: string;
  title?: string;
}

export interface ReviewCardDto {
  quality: ReviewQuality;
}
