/**
 * Forecast upcoming flashcard reviews for the next N days (dashboard widget).
 *
 * Pure functions — no IO, fully unit-testable.
 */

export interface DueCard {
  nextReviewAt: Date;
}

export interface DueForecast {
  /** Cards whose nextReviewAt day is before today (need catching up). */
  overdue: number;
  /** One bucket per day, oldest first, starting today. */
  buckets: Array<{ date: string; count: number }>;
  /** Cards due within the window (excludes overdue). */
  total: number;
}

const DEFAULT_FORECAST_DAYS = 7;
const MAX_FORECAST_DAYS = 30;

/**
 * Clamp the forecast window into [1, 30]; invalid values fall back to 7.
 */
export function clampForecastDays(days?: number): number {
  if (days === undefined || !Number.isFinite(days) || days <= 0) {
    return DEFAULT_FORECAST_DAYS;
  }
  return Math.min(Math.floor(days), MAX_FORECAST_DAYS);
}

export function forecastDueCards(cards: DueCard[], now: Date, days: number): DueForecast {
  const buckets: Array<{ date: string; count: number }> = [];
  const index = new Map<string, number>();
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  const todayKey = dayKey(cursor);
  for (let i = 0; i < days; i++) {
    const key = dayKey(cursor);
    index.set(key, i);
    buckets.push({ date: key, count: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  let overdue = 0;
  let total = 0;
  for (const card of cards) {
    const key = dayKey(card.nextReviewAt);
    const i = index.get(key);
    if (i !== undefined) {
      buckets[i].count += 1;
      total += 1;
    } else if (key < todayKey) {
      // Lexicographic comparison is safe for the YYYY-MM-DD format.
      overdue += 1;
    }
    // else: due beyond the window — ignored.
  }
  return { overdue, buckets, total };
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
