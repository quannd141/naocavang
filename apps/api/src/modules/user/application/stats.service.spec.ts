import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StatsService, computeStreak } from './stats.service';

describe('computeStreak', () => {
  // Use a fixed "now" so the test isn't time-of-day-flaky.
  const NOW = new Date('2026-05-20T15:00:00');

  function dayOffset(days: number, hour = 10): Date {
    const d = new Date(NOW);
    d.setDate(d.getDate() - days);
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  it('returns 0 when no reviews exist', () => {
    expect(computeStreak([], NOW)).toBe(0);
  });

  it("returns 0 when there's no review today (yesterday alone doesn't count)", () => {
    expect(computeStreak([dayOffset(1)], NOW)).toBe(0);
  });

  it('returns 1 when only today has reviews', () => {
    expect(computeStreak([dayOffset(0)], NOW)).toBe(1);
  });

  it('counts consecutive days ending today', () => {
    const dates = [dayOffset(0), dayOffset(1), dayOffset(2), dayOffset(3)];
    expect(computeStreak(dates, NOW)).toBe(4);
  });

  it('breaks on first gap (today + 2 ago, missing yesterday)', () => {
    const dates = [dayOffset(0), dayOffset(2), dayOffset(3)];
    expect(computeStreak(dates, NOW)).toBe(1);
  });

  it('deduplicates multiple reviews same day', () => {
    const dates = [
      dayOffset(0, 9),
      dayOffset(0, 14),
      dayOffset(0, 20),
      dayOffset(1, 11),
    ];
    expect(computeStreak(dates, NOW)).toBe(2);
  });

  it('handles month boundaries correctly', () => {
    const may1 = new Date('2026-05-01T10:00:00');
    const apr30 = new Date('2026-04-30T22:00:00');
    const apr29 = new Date('2026-04-29T08:00:00');
    expect(computeStreak([may1, apr30, apr29], may1)).toBe(3);
  });
});

// ---------- StatsService.getUserStats ----------

type AnyFn = (...args: unknown[]) => unknown;
type Mock = ReturnType<typeof vi.fn<AnyFn>>;

interface PrismaMock {
  mindMap: { count: Mock; findMany: Mock };
  flashcardDeck: { count: Mock; findMany: Mock };
  quiz: { count: Mock };
  flashcard: { count: Mock; groupBy: Mock };
  reviewLog: { count: Mock; findMany: Mock };
}

function createPrismaMock(): PrismaMock {
  return {
    mindMap: { count: vi.fn(), findMany: vi.fn() },
    flashcardDeck: { count: vi.fn(), findMany: vi.fn() },
    quiz: { count: vi.fn() },
    flashcard: { count: vi.fn(), groupBy: vi.fn() },
    reviewLog: { count: vi.fn(), findMany: vi.fn() },
  };
}

describe('StatsService.getUserStats', () => {
  let prisma: PrismaMock;
  let service: StatsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new StatsService(prisma as unknown as never);
  });

  it('aggregates counts + recent + due cards in one call', async () => {
    prisma.mindMap.count.mockResolvedValue(7);
    prisma.flashcardDeck.count.mockResolvedValue(3);
    prisma.quiz.count.mockResolvedValue(2);
    prisma.flashcard.count.mockResolvedValue(15);
    prisma.reviewLog.count.mockResolvedValue(4);
    prisma.reviewLog.findMany.mockResolvedValue([]);
    prisma.mindMap.findMany.mockResolvedValue([
      { id: 'm1', title: 'A', subject: 'math', updatedAt: new Date('2026-05-20') },
    ]);
    prisma.flashcardDeck.findMany.mockResolvedValue([
      { id: 'd1', title: 'Deck 1', mindmapId: 'm1', updatedAt: new Date('2026-05-19') },
      { id: 'd2', title: 'Deck 2', mindmapId: 'm2', updatedAt: new Date('2026-05-18') },
    ]);
    prisma.flashcard.groupBy.mockResolvedValue([
      { deckId: 'd1', _count: { _all: 5 } },
    ]);

    const stats = await service.getUserStats('user-1');

    expect(stats.mindmapCount).toBe(7);
    expect(stats.deckCount).toBe(3);
    expect(stats.quizCount).toBe(2);
    expect(stats.dueCards).toBe(15);
    expect(stats.reviewsToday).toBe(4);
    expect(stats.streak).toBe(0); // no reviews returned
    expect(stats.recentMindmaps).toHaveLength(1);
    expect(stats.recentDecks).toHaveLength(2);
    expect(stats.recentDecks[0]).toMatchObject({ id: 'd1', dueCards: 5 });
    expect(stats.recentDecks[1]).toMatchObject({ id: 'd2', dueCards: 0 });
  });

  it('empty state — zero everything', async () => {
    prisma.mindMap.count.mockResolvedValue(0);
    prisma.flashcardDeck.count.mockResolvedValue(0);
    prisma.quiz.count.mockResolvedValue(0);
    prisma.flashcard.count.mockResolvedValue(0);
    prisma.reviewLog.count.mockResolvedValue(0);
    prisma.reviewLog.findMany.mockResolvedValue([]);
    prisma.mindMap.findMany.mockResolvedValue([]);
    prisma.flashcardDeck.findMany.mockResolvedValue([]);
    prisma.flashcard.groupBy.mockResolvedValue([]);

    const stats = await service.getUserStats('user-empty');

    expect(stats.mindmapCount).toBe(0);
    expect(stats.dueCards).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.recentMindmaps).toEqual([]);
    expect(stats.recentDecks).toEqual([]);
  });
});
