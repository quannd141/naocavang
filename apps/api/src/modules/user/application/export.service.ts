import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export interface UserExport {
  /** ISO timestamp of when the export was generated. */
  exportedAt: string;
  /** Version of the export schema — bump on breaking changes. */
  schemaVersion: 1;
  user: {
    id: string;
    email: string;
    name: string;
    tier: string;
    avatarUrl: string | null;
    createdAt: string;
  };
  mindmaps: Array<{
    id: string;
    title: string;
    description: string | null;
    subject: string | null;
    tags: string[];
    isPublic: boolean;
    sourceType: string;
    sourceTemplateId: string | null;
    data: unknown;
    createdAt: string;
    updatedAt: string;
  }>;
  flashcardDecks: Array<{
    id: string;
    title: string;
    mindmapId: string;
    cards: Array<{
      id: string;
      question: string;
      answer: string;
      format: string;
      easeFactor: string;
      interval: number;
      repetitions: number;
      nextReviewAt: string;
      lastReviewedAt: string | null;
      createdAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    difficulty: string;
    mindmapId: string;
    questions: Array<{
      id: string;
      type: string;
      question: string;
      options: unknown;
      correctAnswer: string;
      explanation: string | null;
      position: number;
    }>;
    attempts: Array<{
      id: string;
      score: number;
      timeSpentSec: number | null;
      completedAt: string;
    }>;
    createdAt: string;
  }>;
}

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bundle everything the user owns into a single JSON blob.
   *
   * Compliance: PDPA (Nghị định 13/2023) — users have the right to obtain a
   * portable copy of their personal data. We deliberately include review
   * logs aggregated as deck/card state (easeFactor + interval) rather than
   * the full review_log table to keep the bundle small.
   */
  async exportUserData(userId: string): Promise<UserExport> {
    const [user, mindmaps, decks, quizzes] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          tier: true,
          avatarUrl: true,
          createdAt: true,
        },
      }),
      this.prisma.mindMap.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.flashcardDeck.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        include: {
          cards: { orderBy: { createdAt: 'asc' } },
        },
      }),
      this.prisma.quiz.findMany({
        where: { mindmap: { userId } },
        orderBy: { createdAt: 'asc' },
        include: {
          questions: { orderBy: { position: 'asc' } },
          attempts: {
            where: { userId },
            select: {
              id: true,
              score: true,
              timeSpentSec: true,
              completedAt: true,
            },
            orderBy: { completedAt: 'asc' },
          },
        },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      schemaVersion: 1,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      mindmaps: mindmaps.map((mm) => ({
        id: mm.id,
        title: mm.title,
        description: mm.description,
        subject: mm.subject,
        tags: mm.tags,
        isPublic: mm.isPublic,
        sourceType: mm.sourceType,
        sourceTemplateId: mm.sourceTemplateId,
        data: mm.data,
        createdAt: mm.createdAt.toISOString(),
        updatedAt: mm.updatedAt.toISOString(),
      })),
      flashcardDecks: decks.map((d) => ({
        id: d.id,
        title: d.title,
        mindmapId: d.mindmapId,
        cards: d.cards.map((c) => ({
          id: c.id,
          question: c.question,
          answer: c.answer,
          format: c.format,
          easeFactor: c.easeFactor.toString(),
          interval: c.interval,
          repetitions: c.repetitions,
          nextReviewAt: c.nextReviewAt.toISOString(),
          lastReviewedAt: c.lastReviewedAt?.toISOString() ?? null,
          createdAt: c.createdAt.toISOString(),
        })),
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
      quizzes: quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty,
        mindmapId: q.mindmapId,
        questions: q.questions.map((qq) => ({
          id: qq.id,
          type: qq.type,
          question: qq.question,
          options: qq.options,
          correctAnswer: qq.correctAnswer,
          explanation: qq.explanation,
          position: qq.position,
        })),
        attempts: q.attempts.map((a) => ({
          id: a.id,
          score: a.score,
          timeSpentSec: a.timeSpentSec,
          completedAt: a.completedAt.toISOString(),
        })),
        createdAt: q.createdAt.toISOString(),
      })),
    };
  }
}
