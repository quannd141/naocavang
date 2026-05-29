import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export interface UserStats {
  mindmapCount: number;
  deckCount: number;
  quizCount: number;
  dueCards: number;
  /** Reviews submitted in the last 24h (used to highlight "active today"). */
  reviewsToday: number;
  /** Consecutive days ending today with ≥1 review. 0 if no review today. */
  streak: number;
  recentMindmaps: Array<{
    id: string;
    title: string;
    subject: string | null;
    updatedAt: Date;
  }>;
  recentDecks: Array<{
    id: string;
    title: string;
    mindmapId: string;
    dueCards: number;
    updatedAt: Date;
  }>;
}

export interface ReviewActivity {
  /** Number of days the window covers (clamped to [1, 90]). */
  days: number;
  /** One bucket per day, oldest first, ending today. */
  buckets: Array<{ date: string; count: number }>;
  /** Total reviews across the window. */
  total: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(userId: string): Promise<UserStats> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);

    // Parallelise the independent queries.
    const [
      mindmapCount,
      deckCount,
      quizCount,
      dueCardsCount,
      reviewsToday,
      recentReviews,
      recentMindmaps,
      recentDecksRaw,
      dueByDeck,
    ] = await Promise.all([
      this.prisma.mindMap.count({ where: { userId } }),
      this.prisma.flashcardDeck.count({ where: { userId } }),
      this.prisma.quiz.count({ where: { mindmap: { userId } } }),
      this.prisma.flashcard.count({
        where: { deck: { userId }, nextReviewAt: { lte: now } },
      }),
      this.prisma.reviewLog.count({
        where: { userId, reviewedAt: { gte: startOfToday } },
      }),
      this.prisma.reviewLog.findMany({
        where: { userId, reviewedAt: { gte: thirtyDaysAgo } },
        select: { reviewedAt: true },
        orderBy: { reviewedAt: 'desc' },
      }),
      this.prisma.mindMap.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: { id: true, title: true, subject: true, updatedAt: true },
      }),
      this.prisma.flashcardDeck.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: { id: true, title: true, mindmapId: true, updatedAt: true },
      }),
      this.prisma.flashcard.groupBy({
        by: ['deckId'],
        where: { deck: { userId }, nextReviewAt: { lte: now } },
        _count: { _all: true },
      }),
    ]);

    const dueMap = new Map<string, number>(
      dueByDeck.map((row) => [row.deckId, row._count._all]),
    );

    const recentDecks = recentDecksRaw.map((d) => ({
      id: d.id,
      title: d.title,
      mindmapId: d.mindmapId,
      dueCards: dueMap.get(d.id) ?? 0,
      updatedAt: d.updatedAt,
    }));

    return {
      mindmapCount,
      deckCount,
      quizCount,
      dueCards: dueCardsCount,
      reviewsToday,
      streak: computeStreak(recentReviews.map((r) => r.reviewedAt), now),
      recentMindmaps,
      recentDecks,
    };
  }

  /**
   * Daily review activity for the last N days (for the dashboard heatmap/chart).
   * `days` is clamped to [1, 90]; invalid values fall back to 30.
   */
  async getActivity(userId: string, days?: number): Promise<ReviewActivity> {
    const window = clampActivityDays(days);
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (window - 1));

    const reviews = await this.prisma.reviewLog.findMany({
      where: { userId, reviewedAt: { gte: start } },
      select: { reviewedAt: true },
    });

    const buckets = computeDailyReviewCounts(
      reviews.map((r) => r.reviewedAt),
      now,
      window,
    );
    return {
      days: window,
      buckets,
      total: buckets.reduce((sum, b) => sum + b.count, 0),
    };
  }
}

const DEFAULT_ACTIVITY_DAYS = 30;
const MAX_ACTIVITY_DAYS = 90;

/**
 * Clamp the requested activity window into [1, 90]. Invalid values (NaN, ≤0,
 * undefined) fall back to the 30-day default. Exported for unit tests.
 */
export function clampActivityDays(days?: number): number {
  if (days === undefined || !Number.isFinite(days) || days <= 0) {
    return DEFAULT_ACTIVITY_DAYS;
  }
  return Math.min(Math.floor(days), MAX_ACTIVITY_DAYS);
}

/**
 * Bucket review timestamps into per-day counts for the last `days` days.
 * Returns exactly `days` buckets, oldest first, ending with today. Reviews
 * outside the window are ignored. Pure — exported for unit tests.
 */
export function computeDailyReviewCounts(
  reviewDates: Date[],
  now: Date,
  days: number,
): Array<{ date: string; count: number }> {
  const buckets: Array<{ date: string; count: number }> = [];
  const index = new Map<string, number>();
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const key = dayKey(cursor);
    index.set(key, i);
    buckets.push({ date: key, count: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const d of reviewDates) {
    const i = index.get(dayKey(d));
    if (i !== undefined) buckets[i].count += 1;
  }
  return buckets;
}

/**
 * Streak = consecutive days ending today where at least one review was logged.
 * Returns 0 if no review today (don't credit yesterday's effort if user skipped).
 *
 * Exported for unit tests.
 */
export function computeStreak(reviewDates: Date[], now: Date = new Date()): number {
  if (reviewDates.length === 0) return 0;

  // Bucket reviews by local day key (YYYY-MM-DD).
  const days = new Set(reviewDates.map((d) => dayKey(d)));
  const todayKey = dayKey(now);
  if (!days.has(todayKey)) return 0;

  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
