import { describe, expect, it } from 'vitest';
import {
  SM2_DEFAULTS,
  SM2_MIN_EASE_FACTOR,
  nextReviewDate,
  sm2,
} from './sm2';

describe('sm2()', () => {
  describe('failure path (quality < 3)', () => {
    it('should reset repetitions when user fails (quality=0)', () => {
      const result = sm2({ easeFactor: 2.5, interval: 30, repetitions: 5, quality: 0 });
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('should reset on quality=2 (Khó)', () => {
      const result = sm2({ easeFactor: 2.0, interval: 15, repetitions: 3, quality: 2 });
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('should still decrease ease factor on failure', () => {
      const before = 2.5;
      const result = sm2({ easeFactor: before, interval: 10, repetitions: 3, quality: 0 });
      expect(result.easeFactor).toBeLessThan(before);
    });
  });

  describe('success path (quality >= 3)', () => {
    it('should set interval=1 on first successful review', () => {
      const result = sm2({ ...SM2_DEFAULTS, quality: 3 });
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });

    it('should set interval=6 on second successful review', () => {
      const result = sm2({ easeFactor: 2.5, interval: 1, repetitions: 1, quality: 3 });
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
    });

    it('should multiply interval by ease factor on third+ review', () => {
      const result = sm2({ easeFactor: 2.5, interval: 6, repetitions: 2, quality: 3 });
      expect(result.repetitions).toBe(3);
      // 6 × 2.5 = 15
      expect(result.interval).toBe(15);
    });

    it('should give extra 1.3× bonus when quality=4 (Dễ)', () => {
      // Quality 3 → 6 × 2.6 = 15.6 ≈ 16
      // Quality 4 → 6 × 2.6 × 1.3 = 20.28 ≈ 20, with EF bump
      const easy = sm2({ easeFactor: 2.5, interval: 6, repetitions: 2, quality: 4 });
      const good = sm2({ easeFactor: 2.5, interval: 6, repetitions: 2, quality: 3 });
      expect(easy.interval).toBeGreaterThan(good.interval);
    });

    it('should keep ease factor stable when quality=4 (highest in our 0..4 scale)', () => {
      // Per classical SM-2 formula: EF' = EF + (0.1 − (5−q) × (0.08 + (5−q) × 0.02))
      // q=4 → EF + (0.1 − 1 × 0.10) = EF + 0.  We don't model q=5, so 4 = best case.
      // The interval still gets a ×1.3 bonus — that's what makes q=4 "Dễ".
      const before = 2.5;
      const result = sm2({ easeFactor: before, interval: 6, repetitions: 2, quality: 4 });
      expect(result.easeFactor).toBeGreaterThanOrEqual(before);
    });

    it('should keep ease factor roughly stable when quality=3', () => {
      const before = 2.5;
      const result = sm2({ easeFactor: before, interval: 6, repetitions: 2, quality: 3 });
      // q=3: 0.1 - 2 × (0.08 + 2 × 0.02) = 0.1 - 0.24 = -0.14
      // EF' = 2.5 + (-0.14) = 2.36
      expect(result.easeFactor).toBeCloseTo(2.36, 2);
    });
  });

  describe('ease factor clamping', () => {
    it('should clamp ease factor to minimum 1.3', () => {
      // Force many failures
      let state = { ...SM2_DEFAULTS };
      for (let i = 0; i < 20; i++) {
        state = sm2({ ...state, quality: 0 });
      }
      expect(state.easeFactor).toBe(SM2_MIN_EASE_FACTOR);
    });

    it('should not let ease factor go below 1.3 even after one harsh fail', () => {
      const result = sm2({ easeFactor: 1.3, interval: 10, repetitions: 3, quality: 0 });
      expect(result.easeFactor).toBe(SM2_MIN_EASE_FACTOR);
    });

    it('should round ease factor to 2 decimal places (DB Decimal(4,2))', () => {
      const result = sm2({ easeFactor: 2.5, interval: 1, repetitions: 1, quality: 3 });
      const decimals = result.easeFactor.toString().split('.')[1];
      expect(decimals?.length ?? 0).toBeLessThanOrEqual(2);
    });
  });

  describe('realistic learning sequence', () => {
    it('should produce sensible intervals across many reviews', () => {
      // User learns a card well — 5 successful reviews quality=3
      let state = { ...SM2_DEFAULTS };
      const intervals: number[] = [];
      for (let i = 0; i < 5; i++) {
        state = sm2({ ...state, quality: 3 });
        intervals.push(state.interval);
      }
      // q=3 drifts EF down each review (2.5 → 2.36 → 2.22 → 2.08 → 1.94)
      // so growth slows: 1, 6, 13, 27, 52  — monotonically increasing.
      expect(intervals[0]).toBe(1);
      expect(intervals[1]).toBe(6);
      expect(intervals[2]).toBeGreaterThanOrEqual(13);
      expect(intervals[3]).toBeGreaterThan(intervals[2]);
      expect(intervals[4]).toBeGreaterThan(intervals[3]);
    });

    it('should reset cleanly when user forgets mid-streak', () => {
      let state = { ...SM2_DEFAULTS };
      state = sm2({ ...state, quality: 3 }); // r=1, i=1
      state = sm2({ ...state, quality: 3 }); // r=2, i=6
      state = sm2({ ...state, quality: 3 }); // r=3, i=15ish
      const beforeFail = state.easeFactor;
      state = sm2({ ...state, quality: 0 }); // FORGOT
      expect(state.repetitions).toBe(0);
      expect(state.interval).toBe(1);
      expect(state.easeFactor).toBeLessThan(beforeFail);
    });
  });
});

describe('nextReviewDate()', () => {
  it('should add interval days to current date', () => {
    const from = new Date('2026-05-16T00:00:00Z');
    const next = nextReviewDate(7, from);
    expect(next.toISOString().slice(0, 10)).toBe('2026-05-23');
  });

  it('should return current date when interval=0', () => {
    const from = new Date('2026-05-16T12:00:00Z');
    const next = nextReviewDate(0, from);
    expect(next.toISOString().slice(0, 10)).toBe('2026-05-16');
  });
});
