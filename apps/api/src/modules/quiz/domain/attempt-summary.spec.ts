import { describe, expect, it } from 'vitest';
import { summariseAttempts } from './attempt-summary';

describe('summariseAttempts', () => {
  it('returns zeros for an empty history', () => {
    expect(summariseAttempts([])).toEqual({
      count: 0,
      bestScore: 0,
      avgScore: 0,
      lastScore: null,
    });
  });

  it('summarises a single attempt', () => {
    expect(summariseAttempts([{ score: 80 }])).toEqual({
      count: 1,
      bestScore: 80,
      avgScore: 80,
      lastScore: 80,
    });
  });

  it('computes count, best, rounded average, and last (first element = most recent)', () => {
    // ordered newest-first, as listAttempts returns them
    const attempts = [{ score: 50 }, { score: 90 }, { score: 70 }];
    expect(summariseAttempts(attempts)).toEqual({
      count: 3,
      bestScore: 90,
      avgScore: 70, // (50+90+70)/3 = 70
      lastScore: 50, // most recent (first)
    });
  });

  it('rounds the average to the nearest integer', () => {
    const attempts = [{ score: 100 }, { score: 100 }, { score: 0 }];
    // mean = 66.67 -> 67
    expect(summariseAttempts(attempts).avgScore).toBe(67);
  });

  it('is robust to out-of-order input for best/avg (uses first as last regardless)', () => {
    const attempts = [{ score: 30 }, { score: 100 }];
    const s = summariseAttempts(attempts);
    expect(s.bestScore).toBe(100);
    expect(s.avgScore).toBe(65);
    expect(s.lastScore).toBe(30);
  });
});
