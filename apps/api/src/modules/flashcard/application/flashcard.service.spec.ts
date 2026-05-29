/**
 * Integration-style tests for FlashcardService.
 *
 * We mock PrismaService with vi.fn() stubs instead of hitting a real DB —
 * gives us fast, deterministic coverage of the service's business logic
 * (SM-2 transition, permission checks, createFromMindmap filtering).
 *
 * For real-DB E2E we'd need a docker-postgres test container — out of scope
 * for Sprint 2 (TEC-04 mentioned in Sprint 1 retro covers that later).
 */

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlashcardService } from './flashcard.service';

type AnyFn = (...args: unknown[]) => unknown;
type Mock<T extends AnyFn = AnyFn> = ReturnType<typeof vi.fn<T>>;

interface PrismaMock {
  flashcardDeck: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  flashcard: {
    findMany: Mock;
    findUnique: Mock;
    update: Mock;
    groupBy: Mock;
    createMany: Mock;
    delete: Mock;
  };
  reviewLog: {
    create: Mock;
  };
  mindMap: {
    findUnique: Mock;
  };
  $transaction: Mock;
}

function createPrismaMock(): PrismaMock {
  return {
    flashcardDeck: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    flashcard: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn(),
      createMany: vi.fn(),
      delete: vi.fn(),
    },
    reviewLog: { create: vi.fn() },
    mindMap: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  };
}

const USER_A = 'user-a';
const USER_B = 'user-b';

describe('FlashcardService', () => {
  let prisma: PrismaMock;
  let service: FlashcardService;

  beforeEach(() => {
    prisma = createPrismaMock();
    // PrismaService shape is what NestJS injects; we cast via unknown
    service = new FlashcardService(prisma as unknown as never);
  });

  describe('listDecks', () => {
    it('merges due-card counts into deck summaries', async () => {
      prisma.flashcardDeck.findMany.mockResolvedValue([
        {
          id: 'd1',
          title: 'Deck 1',
          mindmapId: 'm1',
          mindmap: { id: 'm1', title: 'MM1', subject: 'math' },
          _count: { cards: 10 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'd2',
          title: 'Deck 2',
          mindmapId: 'm2',
          mindmap: { id: 'm2', title: 'MM2', subject: null },
          _count: { cards: 5 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      prisma.flashcard.groupBy.mockResolvedValue([{ deckId: 'd1', _count: { _all: 3 } }]);

      const result = await service.listDecks(USER_A);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: 'd1', totalCards: 10, dueCards: 3, subject: 'math' });
      expect(result[1]).toMatchObject({ id: 'd2', totalCards: 5, dueCards: 0 });
    });
  });

  describe('getDueForecast', () => {
    it('queries the user cards and returns buckets + window', async () => {
      const today = new Date();
      prisma.flashcard.findMany.mockResolvedValue([{ nextReviewAt: today }]);

      const result = await service.getDueForecast(USER_A, 7);

      expect(result.days).toBe(7);
      expect(result.buckets).toHaveLength(7);
      expect(result.total).toBe(1);
      expect(prisma.flashcard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deck: { userId: USER_A } }),
        }),
      );
    });

    it('clamps the window (invalid -> 7, huge -> 30)', async () => {
      prisma.flashcard.findMany.mockResolvedValue([]);
      expect((await service.getDueForecast(USER_A, 0)).days).toBe(7);
      expect((await service.getDueForecast(USER_A, 999)).days).toBe(30);
    });
  });

  describe('getDeck', () => {
    it('returns deck for owner', async () => {
      prisma.flashcardDeck.findUnique.mockResolvedValue({
        id: 'd1',
        userId: USER_A,
        title: 'My deck',
        cards: [],
        mindmap: { id: 'm1', title: 'MM', subject: null },
      });

      const result = await service.getDeck('d1', USER_A);
      expect(result.id).toBe('d1');
    });

    it('throws NotFound when deck missing', async () => {
      prisma.flashcardDeck.findUnique.mockResolvedValue(null);
      await expect(service.getDeck('missing', USER_A)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws Forbidden when deck belongs to another user', async () => {
      prisma.flashcardDeck.findUnique.mockResolvedValue({
        id: 'd1',
        userId: USER_B,
        cards: [],
        mindmap: {},
      });
      await expect(service.getDeck('d1', USER_A)).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('createFromMindmap', () => {
    const baseMindmap = {
      id: 'm1',
      userId: USER_A,
      title: 'Hàm số bậc 2',
      data: {
        nodes: [
          { id: 'root', data: { label: 'Hàm số bậc 2' } },
          { id: 'n1', data: { label: 'Định nghĩa', notes: 'y = ax² + bx + c' } },
          { id: 'n2', data: { label: 'Đồ thị' } },
          { id: 'n3', data: { label: '   ' } }, // whitespace only — filtered
          { id: 'n4', data: { label: 'Ứng dụng', notes: 'Giải PT bậc 2' } },
        ],
      },
    };

    it('converts non-root nodes with labels into Q/A cards', async () => {
      prisma.mindMap.findUnique.mockResolvedValue(baseMindmap);
      prisma.flashcardDeck.create.mockImplementation((args: unknown) => {
        const a = args as { data: { cards: { create: unknown[] } } };
        return Promise.resolve({ id: 'd1', cards: a.data.cards.create, _count: { cards: a.data.cards.create.length } });
      });

      const result = (await service.createFromMindmap(USER_A, 'm1', {})) as {
        cards: Array<{ question: string; answer: string }>;
      };

      // root + whitespace-label are filtered; 3 remain
      expect(result.cards).toHaveLength(3);
      // Nodes with notes use label as question, notes as answer
      expect(result.cards[0]).toMatchObject({
        question: 'Định nghĩa',
        answer: 'y = ax² + bx + c',
      });
      // Node without notes gets a placeholder answer
      expect(result.cards[1].question).toBe('Khái niệm: Đồ thị');
      expect(result.cards[1].answer).toContain('Chưa có notes');
    });

    it('throws NO_NODES_TO_CONVERT when mindmap has only root', async () => {
      prisma.mindMap.findUnique.mockResolvedValue({
        ...baseMindmap,
        data: { nodes: [{ id: 'root', data: { label: 'Just root' } }] },
      });

      await expect(service.createFromMindmap(USER_A, 'm1', {})).rejects.toThrow(
        /NO_NODES_TO_CONVERT|Mind map chưa có node/,
      );
    });

    it('rejects mindmap belonging to another user', async () => {
      prisma.mindMap.findUnique.mockResolvedValue({ ...baseMindmap, userId: USER_B });
      await expect(service.createFromMindmap(USER_A, 'm1', {})).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('uses custom title when provided', async () => {
      prisma.mindMap.findUnique.mockResolvedValue(baseMindmap);
      prisma.flashcardDeck.create.mockImplementation((args: unknown) => {
        const a = args as { data: { title: string } };
        return Promise.resolve({ id: 'd1', title: a.data.title, cards: [] });
      });

      const result = await service.createFromMindmap(USER_A, 'm1', { title: 'Custom title' });
      expect((result as { title: string }).title).toBe('Custom title');
    });
  });

  describe('reviewCard', () => {
    const baseCard = {
      id: 'c1',
      deckId: 'd1',
      easeFactor: new Prisma.Decimal(2.5),
      interval: 0,
      repetitions: 0,
      deck: { userId: USER_A },
    };

    it('applies SM-2 for quality=3 (Tốt) — first repetition', async () => {
      prisma.flashcard.findUnique.mockResolvedValue(baseCard);
      prisma.$transaction.mockImplementation((async (ops: unknown) => {
        return Promise.all(ops as Promise<unknown>[]);
      }) as never);
      prisma.flashcard.update.mockImplementation((args: unknown) => {
        const a = args as { data: { interval: number; repetitions: number; easeFactor: Prisma.Decimal } };
        return Promise.resolve({ ...baseCard, ...a.data });
      });
      prisma.reviewLog.create.mockResolvedValue({ id: 'rl1' });

      const result = await service.reviewCard('c1', USER_A, { quality: 3 });

      // SM-2: q=3 first rep → interval=1, reps=1, EF: 2.5 + (0.1 - 2*(0.08 + 2*0.02)) = 2.36
      expect(result.sm2.repetitions).toBe(1);
      expect(result.sm2.interval).toBe(1);
      expect(result.sm2.easeFactor).toBeCloseTo(2.36, 2);

      // Verify review log was written with the before/after pair
      const logCall = prisma.reviewLog.create.mock.calls[0][0] as {
        data: { quality: number; intervalBefore: number; intervalAfter: number };
      };
      expect(logCall.data.quality).toBe(3);
      expect(logCall.data.intervalBefore).toBe(0);
      expect(logCall.data.intervalAfter).toBe(1);
    });

    it('resets repetitions on quality=0 (Lại)', async () => {
      prisma.flashcard.findUnique.mockResolvedValue({
        ...baseCard,
        easeFactor: new Prisma.Decimal(2.0),
        interval: 30,
        repetitions: 5,
      });
      prisma.$transaction.mockImplementation((async (ops: unknown) =>
        Promise.all(ops as Promise<unknown>[])) as never);
      prisma.flashcard.update.mockResolvedValue({});
      prisma.reviewLog.create.mockResolvedValue({});

      const result = await service.reviewCard('c1', USER_A, { quality: 0 });
      expect(result.sm2.repetitions).toBe(0);
      expect(result.sm2.interval).toBe(1);
    });

    it('rejects card belonging to another user (via deck.userId)', async () => {
      prisma.flashcard.findUnique.mockResolvedValue({
        ...baseCard,
        deck: { userId: USER_B },
      });
      await expect(service.reviewCard('c1', USER_A, { quality: 3 })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws NotFound when card missing', async () => {
      prisma.flashcard.findUnique.mockResolvedValue(null);
      await expect(service.reviewCard('missing', USER_A, { quality: 3 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('computes nextReviewAt as today + interval days', async () => {
      prisma.flashcard.findUnique.mockResolvedValue(baseCard);
      prisma.$transaction.mockImplementation((async (ops: unknown) =>
        Promise.all(ops as Promise<unknown>[])) as never);
      prisma.flashcard.update.mockResolvedValue({});
      prisma.reviewLog.create.mockResolvedValue({});

      const before = Date.now();
      const result = await service.reviewCard('c1', USER_A, { quality: 4 });
      // q=4 first rep: interval=1, then *1.3 → 1 (Math.round(1.3) = 1)
      const expectedMs = before + result.sm2.interval * 86400_000;
      const actualMs = new Date(result.nextReviewAt).getTime();
      expect(Math.abs(actualMs - expectedMs)).toBeLessThan(5_000);
    });
  });

  describe('deleteDeck', () => {
    it('rejects deck of another user', async () => {
      prisma.flashcardDeck.findUnique.mockResolvedValue({ id: 'd1', userId: USER_B });
      await expect(service.deleteDeck('d1', USER_A)).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.flashcardDeck.delete).not.toHaveBeenCalled();
    });

    it('deletes deck when caller is owner', async () => {
      prisma.flashcardDeck.findUnique.mockResolvedValue({ id: 'd1', userId: USER_A });
      prisma.flashcardDeck.delete.mockResolvedValue({});
      await service.deleteDeck('d1', USER_A);
      expect(prisma.flashcardDeck.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
    });
  });

  describe('addCardsToDeck', () => {
    it('rejects deck of another user', async () => {
      prisma.flashcardDeck.findUnique.mockResolvedValue({ id: 'd1', userId: USER_B });
      await expect(
        service.addCardsToDeck('d1', USER_A, [{ question: 'q', answer: 'a' }]),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.flashcard.createMany).not.toHaveBeenCalled();
    });

    it('returns count=0 without DB writes when input is empty', async () => {
      prisma.flashcardDeck.findUnique.mockResolvedValue({ id: 'd1', userId: USER_A });
      const result = await service.addCardsToDeck('d1', USER_A, []);
      expect(result).toEqual({ count: 0 });
      expect(prisma.flashcard.createMany).not.toHaveBeenCalled();
      expect(prisma.flashcardDeck.update).not.toHaveBeenCalled();
    });

    it('createMany + bumps deck.updatedAt for owner', async () => {
      prisma.flashcardDeck.findUnique.mockResolvedValue({ id: 'd1', userId: USER_A });
      prisma.flashcard.createMany.mockResolvedValue({ count: 2 });
      prisma.flashcardDeck.update.mockResolvedValue({});

      const result = await service.addCardsToDeck('d1', USER_A, [
        { question: 'q1', answer: 'a1' },
        { question: 'q2', answer: 'a2', format: 'cloze' },
      ]);

      expect(result).toEqual({ count: 2 });
      const createArg = prisma.flashcard.createMany.mock.calls[0][0] as {
        data: Array<{ deckId: string; format: string }>;
      };
      expect(createArg.data[0]).toMatchObject({ deckId: 'd1', format: 'qa' });
      expect(createArg.data[1]).toMatchObject({ format: 'cloze' });
      expect(prisma.flashcardDeck.update).toHaveBeenCalled();
    });
  });

  describe('deleteCard', () => {
    it('rejects card whose deck belongs to another user', async () => {
      prisma.flashcard.findUnique.mockResolvedValue({ id: 'c1', deck: { userId: USER_B } });
      await expect(service.deleteCard('c1', USER_A)).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.flashcard.delete).not.toHaveBeenCalled();
    });

    it('deletes when owner', async () => {
      prisma.flashcard.findUnique.mockResolvedValue({ id: 'c1', deck: { userId: USER_A } });
      prisma.flashcard.delete.mockResolvedValue({});
      await service.deleteCard('c1', USER_A);
      expect(prisma.flashcard.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });

    it('NotFound when card missing', async () => {
      prisma.flashcard.findUnique.mockResolvedValue(null);
      await expect(service.deleteCard('missing', USER_A)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
