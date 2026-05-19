import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { ExportService } from './export.service';

type AnyFn = (...args: unknown[]) => unknown;
type Mock = ReturnType<typeof vi.fn<AnyFn>>;

interface PrismaMock {
  user: { findUniqueOrThrow: Mock };
  mindMap: { findMany: Mock };
  flashcardDeck: { findMany: Mock };
  quiz: { findMany: Mock };
}

function makeMocks(): { service: ExportService; prisma: PrismaMock } {
  const prisma: PrismaMock = {
    user: { findUniqueOrThrow: vi.fn() },
    mindMap: { findMany: vi.fn() },
    flashcardDeck: { findMany: vi.fn() },
    quiz: { findMany: vi.fn() },
  };
  const service = new ExportService(prisma as unknown as never);
  return { service, prisma };
}

describe('ExportService', () => {
  it('bundles user + mindmaps + decks + quizzes into schema v1', async () => {
    const now = new Date('2026-05-20T12:00:00Z');
    const { service, prisma } = makeMocks();

    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'u1',
      email: 'q@e.com',
      name: 'Quân',
      tier: 'free',
      avatarUrl: null,
      createdAt: now,
    });

    prisma.mindMap.findMany.mockResolvedValue([
      {
        id: 'mm1',
        title: 'MM1',
        description: null,
        subject: 'math',
        tags: ['toan'],
        isPublic: false,
        sourceType: 'manual',
        sourceTemplateId: null,
        data: { nodes: [], edges: [] },
        createdAt: now,
        updatedAt: now,
      },
    ]);

    prisma.flashcardDeck.findMany.mockResolvedValue([
      {
        id: 'd1',
        title: 'Deck 1',
        mindmapId: 'mm1',
        createdAt: now,
        updatedAt: now,
        cards: [
          {
            id: 'c1',
            question: 'Q',
            answer: 'A',
            format: 'qa',
            easeFactor: new Prisma.Decimal(2.5),
            interval: 1,
            repetitions: 1,
            nextReviewAt: now,
            lastReviewedAt: now,
            createdAt: now,
          },
        ],
      },
    ]);

    prisma.quiz.findMany.mockResolvedValue([
      {
        id: 'q1',
        title: 'Quiz 1',
        difficulty: 'medium',
        mindmapId: 'mm1',
        createdAt: now,
        questions: [
          {
            id: 'qq1',
            type: 'short_answer',
            question: 'Q?',
            options: null,
            correctAnswer: 'A',
            explanation: null,
            position: 0,
          },
        ],
        attempts: [
          { id: 'a1', score: 100, timeSpentSec: 42, completedAt: now },
        ],
      },
    ]);

    const out = await service.exportUserData('u1');

    expect(out.schemaVersion).toBe(1);
    expect(out.user.email).toBe('q@e.com');
    expect(out.mindmaps).toHaveLength(1);
    expect(out.flashcardDecks).toHaveLength(1);
    expect(out.flashcardDecks[0].cards[0].easeFactor).toBe('2.5');
    expect(out.flashcardDecks[0].cards[0].lastReviewedAt).toBe(now.toISOString());
    expect(out.quizzes).toHaveLength(1);
    expect(out.quizzes[0].attempts).toHaveLength(1);
    expect(out.quizzes[0].attempts[0].score).toBe(100);
  });

  it('empty user yields zero collections but valid envelope', async () => {
    const { service, prisma } = makeMocks();
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'u-empty',
      email: 'e@e.com',
      name: 'Empty',
      tier: 'free',
      avatarUrl: null,
      createdAt: new Date(),
    });
    prisma.mindMap.findMany.mockResolvedValue([]);
    prisma.flashcardDeck.findMany.mockResolvedValue([]);
    prisma.quiz.findMany.mockResolvedValue([]);

    const out = await service.exportUserData('u-empty');
    expect(out.mindmaps).toEqual([]);
    expect(out.flashcardDecks).toEqual([]);
    expect(out.quizzes).toEqual([]);
    expect(typeof out.exportedAt).toBe('string');
  });

  it('handles deck card with null lastReviewedAt', async () => {
    const { service, prisma } = makeMocks();
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      name: 'A',
      tier: 'free',
      avatarUrl: null,
      createdAt: new Date(),
    });
    prisma.mindMap.findMany.mockResolvedValue([]);
    prisma.flashcardDeck.findMany.mockResolvedValue([
      {
        id: 'd1',
        title: 'D',
        mindmapId: 'mm1',
        createdAt: new Date(),
        updatedAt: new Date(),
        cards: [
          {
            id: 'c1',
            question: 'q',
            answer: 'a',
            format: 'qa',
            easeFactor: new Prisma.Decimal(2.5),
            interval: 0,
            repetitions: 0,
            nextReviewAt: new Date(),
            lastReviewedAt: null,
            createdAt: new Date(),
          },
        ],
      },
    ]);
    prisma.quiz.findMany.mockResolvedValue([]);

    const out = await service.exportUserData('u1');
    expect(out.flashcardDecks[0].cards[0].lastReviewedAt).toBeNull();
  });
});
