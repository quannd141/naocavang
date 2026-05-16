/**
 * SM-2 Spaced Repetition algorithm (SuperMemo 2).
 *
 * Pure function — no IO, no framework dependencies. Fully testable.
 *
 * Reference:
 *   - ADR-004 (Spaced Repetition design)
 *   - https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 *
 * Quality scale (0-4, user self-rating):
 *   0 = Lại (complete blackout)        → reset
 *   1 = Lại (incorrect response)        → reset (same as 0 in our UX)
 *   2 = Khó (incorrect, but recognized) → reset
 *   3 = Tốt (correct, but with effort)  → advance with current EF
 *   4 = Dễ (correct, easy recall)       → advance with EF × 1.3 bonus
 *
 * Note: classical SM-2 uses quality 0-5; we collapse to 0,2,3,4 for UX simplicity.
 * Quality 1 is accepted as input but treated identically to 0.
 */

export type ReviewQuality = 0 | 1 | 2 | 3 | 4;

export interface Sm2State {
  /** Multiplier for interval growth. Min 1.3, default 2.5. */
  easeFactor: number;
  /** Days until next review. */
  interval: number;
  /** Consecutive successful reviews (resets to 0 on failure). */
  repetitions: number;
}

export interface Sm2Input extends Sm2State {
  quality: ReviewQuality;
}

export const SM2_DEFAULTS: Sm2State = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
};

export const SM2_MIN_EASE_FACTOR = 1.3;

/**
 * Compute next SM-2 state after a single review.
 *
 * Algorithm:
 *   1. If quality < 3 (failed): reset repetitions to 0, set interval = 1.
 *   2. Else (passed):
 *      - repetition 1: interval = 1
 *      - repetition 2: interval = 6
 *      - repetition n: interval = previousInterval × easeFactor
 *      - quality 4 gets an extra ×1.3 bonus
 *   3. Update easeFactor:
 *      EF' = EF + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02))
 *      Clamp to min 1.3.
 */
export function sm2(input: Sm2Input): Sm2State {
  const { quality } = input;
  let { easeFactor, interval, repetitions } = input;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    if (quality === 4) {
      interval = Math.round(interval * 1.3);
    }
  }

  // Update ease factor regardless of pass/fail
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < SM2_MIN_EASE_FACTOR) easeFactor = SM2_MIN_EASE_FACTOR;
  // Round to 2 decimals to keep DB values clean (Decimal(4,2))
  easeFactor = Math.round(easeFactor * 100) / 100;

  return { easeFactor, interval, repetitions };
}

/**
 * Convenience helper: compute next review date from interval (in days).
 */
export function nextReviewDate(intervalDays: number, from: Date = new Date()): Date {
  const next = new Date(from.getTime());
  next.setDate(next.getDate() + intervalDays);
  return next;
}
