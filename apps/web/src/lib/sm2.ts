/**
 * SM-2 Spaced Repetition algorithm — client-side mirror of apps/api/src/modules/flashcard/domain/sm2.ts.
 * When BE is wired, delete this file and call API instead.
 */

export type ReviewQuality = 0 | 1 | 2 | 3 | 4;

export interface Sm2State {
  easeFactor: number;
  interval: number;
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

export const QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: 'Lại',
  1: 'Lại',
  2: 'Khó',
  3: 'Tốt',
  4: 'Dễ',
};

export function sm2(input: Sm2Input): Sm2State {
  const { quality } = input;
  let { easeFactor, interval, repetitions } = input;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
    if (quality === 4) interval = Math.round(interval * 1.3);
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < SM2_MIN_EASE_FACTOR) easeFactor = SM2_MIN_EASE_FACTOR;
  easeFactor = Math.round(easeFactor * 100) / 100;

  return { easeFactor, interval, repetitions };
}

export function nextReviewDate(intervalDays: number, from: Date = new Date()): Date {
  const next = new Date(from.getTime());
  next.setDate(next.getDate() + intervalDays);
  return next;
}
