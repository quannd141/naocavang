import { describe, expect, it } from 'vitest';
import { clampForecastDays, forecastDueCards } from './due-forecast';

describe('clampForecastDays', () => {
  it('defaults to 7 for invalid values', () => {
    expect(clampForecastDays(undefined)).toBe(7);
    expect(clampForecastDays(0)).toBe(7);
    expect(clampForecastDays(-3)).toBe(7);
    expect(clampForecastDays(Number.NaN)).toBe(7);
  });

  it('clamps to a max of 30', () => {
    expect(clampForecastDays(999)).toBe(30);
    expect(clampForecastDays(10)).toBe(10);
  });
});

describe('forecastDueCards', () => {
  const NOW = new Date('2026-05-20T15:00:00');

  function at(daysFromToday: number, hour = 9): Date {
    const d = new Date(NOW);
    d.setDate(d.getDate() + daysFromToday);
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  it('returns `days` buckets starting today, oldest first', () => {
    const result = forecastDueCards([], NOW, 7);
    expect(result.buckets).toHaveLength(7);
    expect(result.buckets[0].date).toBe('2026-05-20');
    expect(result.buckets[6].date).toBe('2026-05-26');
    expect(result.overdue).toBe(0);
    expect(result.total).toBe(0);
  });

  it('counts cards into the day they are due', () => {
    const cards = [
      { nextReviewAt: at(0) },
      { nextReviewAt: at(0, 20) },
      { nextReviewAt: at(2) },
    ];
    const result = forecastDueCards(cards, NOW, 7);
    const byDate = Object.fromEntries(result.buckets.map((b) => [b.date, b.count]));
    expect(byDate['2026-05-20']).toBe(2);
    expect(byDate['2026-05-22']).toBe(1);
    expect(result.total).toBe(3);
  });

  it('separates overdue (due before today) from the buckets', () => {
    const cards = [{ nextReviewAt: at(-1) }, { nextReviewAt: at(-5) }, { nextReviewAt: at(0) }];
    const result = forecastDueCards(cards, NOW, 7);
    expect(result.overdue).toBe(2);
    expect(result.buckets[0].count).toBe(1); // today
    // overdue is not double-counted into total (total = within-window only)
    expect(result.total).toBe(1);
  });

  it('ignores cards due beyond the window', () => {
    const result = forecastDueCards([{ nextReviewAt: at(10) }], NOW, 7);
    expect(result.total).toBe(0);
    expect(result.overdue).toBe(0);
  });
});
