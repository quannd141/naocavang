import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { nextReviewDate, sm2, type ReviewQuality } from '../domain/sm2';
import type {
  CreateDeckDto,
  CreateDeckFromMindMapDto,
  ReviewCardDto,
  UpdateDeckDto,
} from '../presentation/dto/flashcard.dto';

@Injectable()
export class FlashcardService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Decks ----------

  async listDecks(userId: string) {
    const decks = await this.prisma.flashcardDeck.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        mindmap: { select: { id: true, title: true, subject: true } },
        _count: { select: { cards: true } },
      },
    });

    // Compute due count per deck in a single grouped query
    const dueCounts = await this.prisma.flashcard.groupBy({
      by: ['deckId'],
      where: {
        deck: { userId },
        nextReviewAt: { lte: new Date() },
      },
      _count: { _all: true },
    });
    const dueByDeck = new Map(dueCounts.map((d) => [d.deckId, d._count._all]));

    return decks.map((d) => ({
      id: d.id,
      title: d.title,
      mindmapId: d.mindmapId,
      subject: d.mindmap.subject,
      totalCards: d._count.cards,
      dueCards: dueByDeck.get(d.id) ?? 0,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  }

  async getDeck(deckId: string, userId: string) {
    const deck = await this.prisma.flashcardDeck.findUnique({
      where: { id: deckId },
      include: {
        cards: { orderBy: { createdAt: 'asc' } },
        mindmap: { select: { id: true, title: true, subject: true } },
      },
    });
    if (!deck) throw new NotFoundException({ code: 'DECK_NOT_FOUND' });
    if (deck.userId !== userId) {
      throw new ForbiddenException({ code: 'DECK_ACCESS_DENIED' });
    }
    return deck;
  }

  async createDeck(userId: string, dto: CreateDeckDto) {
    // Verify mindmap ownership before creating deck against it
    const mindmap = await this.prisma.mindMap.findUnique({ where: { id: dto.mindmapId } });
    if (!mindmap) throw new NotFoundException({ code: 'MINDMAP_NOT_FOUND' });
    if (mindmap.userId !== userId) {
      throw new ForbiddenException({ code: 'MINDMAP_ACCESS_DENIED' });
    }

    return this.prisma.flashcardDeck.create({
      data: {
        userId,
        mindmapId: dto.mindmapId,
        title: dto.title,
        cards: {
          create: dto.cards.map((c) => ({
            question: c.question,
            answer: c.answer,
            format: c.format ?? 'qa',
          })),
        },
      },
      include: { cards: true, _count: { select: { cards: true } } },
    });
  }

  /**
   * Auto-generate a deck from a mind map: each node with `notes` (or just `label`)
   * becomes one Q/A card. Skips the root node.
   */
  async createFromMindmap(userId: string, mindmapId: string, dto: CreateDeckFromMindMapDto) {
    const mindmap = await this.prisma.mindMap.findUnique({ where: { id: mindmapId } });
    if (!mindmap) throw new NotFoundException({ code: 'MINDMAP_NOT_FOUND' });
    if (mindmap.userId !== userId) {
      throw new ForbiddenException({ code: 'MINDMAP_ACCESS_DENIED' });
    }

    const data = mindmap.data as unknown as {
      nodes?: Array<{ id: string; data?: { label?: string; notes?: string } }>;
    };
    const nodes = data?.nodes ?? [];
    const cards = nodes
      .filter((n) => n.id !== 'root')
      .map((n) => {
        const label = (n.data?.label ?? '').trim();
        const notes = (n.data?.notes ?? '').trim();
        if (!label) return null;
        return {
          question: notes ? label : `Khái niệm: ${label}`,
          answer: notes || `(Chưa có notes — bổ sung ở mind map node "${label}")`,
          format: 'qa' as const,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    if (cards.length === 0) {
      throw new NotFoundException({
        code: 'NO_NODES_TO_CONVERT',
        message: 'Mind map chưa có node nào để chuyển sang flashcard',
      });
    }

    return this.prisma.flashcardDeck.create({
      data: {
        userId,
        mindmapId,
        title: dto.title ?? `Flashcards: ${mindmap.title}`,
        cards: { create: cards },
      },
      include: { cards: true, _count: { select: { cards: true } } },
    });
  }

  async updateDeck(deckId: string, userId: string, dto: UpdateDeckDto) {
    const existing = await this.prisma.flashcardDeck.findUnique({ where: { id: deckId } });
    if (!existing) throw new NotFoundException({ code: 'DECK_NOT_FOUND' });
    if (existing.userId !== userId) {
      throw new ForbiddenException({ code: 'DECK_ACCESS_DENIED' });
    }
    return this.prisma.flashcardDeck.update({
      where: { id: deckId },
      data: { ...(dto.title !== undefined && { title: dto.title }) },
    });
  }

  async deleteDeck(deckId: string, userId: string) {
    const existing = await this.prisma.flashcardDeck.findUnique({ where: { id: deckId } });
    if (!existing) throw new NotFoundException({ code: 'DECK_NOT_FOUND' });
    if (existing.userId !== userId) {
      throw new ForbiddenException({ code: 'DECK_ACCESS_DENIED' });
    }
    await this.prisma.flashcardDeck.delete({ where: { id: deckId } });
  }

  // ---------- Cards (manual CRUD on existing deck) ----------

  /** Append 1+ cards to an existing deck. */
  async addCardsToDeck(
    deckId: string,
    userId: string,
    cards: Array<{ question: string; answer: string; format?: 'qa' | 'cloze' | 'mcq' }>,
  ) {
    const deck = await this.prisma.flashcardDeck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException({ code: 'DECK_NOT_FOUND' });
    if (deck.userId !== userId) {
      throw new ForbiddenException({ code: 'DECK_ACCESS_DENIED' });
    }
    if (cards.length === 0) {
      return { count: 0 };
    }
    const result = await this.prisma.flashcard.createMany({
      data: cards.map((c) => ({
        deckId,
        question: c.question,
        answer: c.answer,
        format: c.format ?? 'qa',
      })),
    });
    await this.prisma.flashcardDeck.update({
      where: { id: deckId },
      data: { updatedAt: new Date() },
    });
    return { count: result.count };
  }

  async deleteCard(cardId: string, userId: string) {
    const card = await this.prisma.flashcard.findUnique({
      where: { id: cardId },
      include: { deck: { select: { userId: true } } },
    });
    if (!card) throw new NotFoundException({ code: 'CARD_NOT_FOUND' });
    if (card.deck.userId !== userId) {
      throw new ForbiddenException({ code: 'CARD_ACCESS_DENIED' });
    }
    await this.prisma.flashcard.delete({ where: { id: cardId } });
  }

  // ---------- Study session ----------

  /** Cards whose nextReviewAt is in the past (due now). Default cap 20 per session. */
  async getDueCards(deckId: string, userId: string, limit = 20) {
    const deck = await this.prisma.flashcardDeck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException({ code: 'DECK_NOT_FOUND' });
    if (deck.userId !== userId) {
      throw new ForbiddenException({ code: 'DECK_ACCESS_DENIED' });
    }
    return this.prisma.flashcard.findMany({
      where: { deckId, nextReviewAt: { lte: new Date() } },
      orderBy: { nextReviewAt: 'asc' },
      take: limit,
    });
  }

  /** Apply SM-2 to a card and persist the new state + write a review log. */
  async reviewCard(cardId: string, userId: string, dto: ReviewCardDto) {
    const card = await this.prisma.flashcard.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });
    if (!card) throw new NotFoundException({ code: 'CARD_NOT_FOUND' });
    if (card.deck.userId !== userId) {
      throw new ForbiddenException({ code: 'CARD_ACCESS_DENIED' });
    }

    const prevState = {
      easeFactor: Number(card.easeFactor),
      interval: card.interval,
      repetitions: card.repetitions,
    };
    const next = sm2({ ...prevState, quality: dto.quality as ReviewQuality });
    const now = new Date();
    const nextReviewAt = nextReviewDate(next.interval, now);

    // Persist new state + log atomically
    const [updated] = await this.prisma.$transaction([
      this.prisma.flashcard.update({
        where: { id: cardId },
        data: {
          easeFactor: new Prisma.Decimal(next.easeFactor),
          interval: next.interval,
          repetitions: next.repetitions,
          nextReviewAt,
          lastReviewedAt: now,
        },
      }),
      this.prisma.reviewLog.create({
        data: {
          flashcardId: cardId,
          userId,
          quality: dto.quality,
          intervalBefore: prevState.interval,
          intervalAfter: next.interval,
          easeFactorBefore: new Prisma.Decimal(prevState.easeFactor),
          easeFactorAfter: new Prisma.Decimal(next.easeFactor),
        },
      }),
    ]);

    return {
      card: updated,
      sm2: next,
      nextReviewAt,
    };
  }
}
