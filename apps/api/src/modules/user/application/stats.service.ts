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
