import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import type {
  CreateQuizDto,
  CreateQuizFromMindMapDto,
  SubmitAttemptDto,
} from '../presentation/dto/quiz.dto';

interface ScoredQuestion {
  questionId: string;
  type: string;
  question: string;
  options: string[] | null;
  userAnswer: string;
  correctAnswer: string;
  explanation: string | null;
  correct: boolean;
}

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- list / get ----------

  /** List quizzes for mindmaps owned by user. */
  async listMine(userId: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { mindmap: { userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        mindmap: { select: { id: true, title: true, subject: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    });
    return quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty,
      mindmapId: q.mindmapId,
      subject: q.mindmap.subject,
      mindmapTitle: q.mindmap.title,
      questionCount: q._count.questions,
      attemptCount: q._count.attempts,
      createdAt: q.createdAt,
    }));
  }

  /** Get quiz with questions. correctAnswer + explanation are MASKED unless `includeAnswers=true`. */
  async getQuiz(quizId: string, userId: string, includeAnswers = false) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { position: 'asc' } },
        mindmap: { select: { id: true, title: true, subject: true, userId: true } },
      },
    });
    if (!quiz) throw new NotFoundException({ code: 'QUIZ_NOT_FOUND' });
    if (quiz.mindmap.userId !== userId) {
      throw new ForbiddenException({ code: 'QUIZ_ACCESS_DENIED' });
    }

    return {
      id: quiz.id,
      title: quiz.title,
      difficulty: quiz.difficulty,
      mindmapId: quiz.mindmapId,
      mindmap: {
        id: quiz.mindmap.id,
        title: quiz.mindmap.title,
        subject: quiz.mindmap.subject,
      },
      questions: quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options as string[] | null,
        position: q.position,
        // mask answers from client while taking the quiz
        correctAnswer: includeAnswers ? q.correctAnswer : undefined,
        explanation: includeAnswers ? q.explanation : undefined,
      })),
      createdAt: quiz.createdAt,
    };
  }

  // ---------- create ----------

  async createQuiz(userId: string, dto: CreateQuizDto) {
    const mindmap = await this.prisma.mindMap.findUnique({ where: { id: dto.mindmapId } });
    if (!mindmap) throw new NotFoundException({ code: 'MINDMAP_NOT_FOUND' });
    if (mindmap.userId !== userId) {
      throw new ForbiddenException({ code: 'MINDMAP_ACCESS_DENIED' });
    }

    return this.prisma.quiz.create({
      data: {
        mindmapId: dto.mindmapId,
        title: dto.title,
        difficulty: dto.difficulty ?? 'medium',
        questions: {
          create: dto.questions.map((q, idx) => ({
            type: q.type,
            question: q.question,
            options: q.options ? (q.options as Prisma.InputJsonValue) : Prisma.JsonNull,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? null,
            position: idx,
          })),
        },
      },
      include: { questions: { orderBy: { position: 'asc' } } },
    });
  }

  /**
   * Auto-generate a quiz from a mind map (mechanical, no AI).
   *
   * Strategy: short_answer questions only — for each non-root node WITH notes,
   * create "Trình bày khái niệm: <label>" with correctAnswer = notes.
   *
   * We deliberately don't generate MCQ here: synthesising plausible distractors
   * from sibling node labels gives nonsense options. Real MCQ generation needs
   * the AI service (future S2-10 / Sprint 3 quiz_gen task).
   */
  async createFromMindmap(userId: string, mindmapId: string, dto: CreateQuizFromMindMapDto) {
    const mindmap = await this.prisma.mindMap.findUnique({ where: { id: mindmapId } });
    if (!mindmap) throw new NotFoundException({ code: 'MINDMAP_NOT_FOUND' });
    if (mindmap.userId !== userId) {
      throw new ForbiddenException({ code: 'MINDMAP_ACCESS_DENIED' });
    }

    const data = mindmap.data as unknown as {
      nodes?: Array<{ id: string; data?: { label?: string; notes?: string } }>;
    };
    const nodes = data?.nodes ?? [];
    const questions = nodes
      .filter((n) => n.id !== 'root')
      .map((n) => {
        const label = (n.data?.label ?? '').trim();
        const notes = (n.data?.notes ?? '').trim();
        if (!label || !notes) return null;
        return {
          type: 'short_answer' as const,
          question: `Trình bày khái niệm: ${label}`,
          options: null,
          correctAnswer: notes,
          explanation: `Xem thêm ở mind map node "${label}".`,
        };
      })
      .filter((q): q is NonNullable<typeof q> => q !== null);

    if (questions.length === 0) {
      throw new NotFoundException({
        code: 'NO_NODES_TO_CONVERT',
        message: 'Mind map cần ít nhất 1 node có notes để tạo câu hỏi',
      });
    }

    return this.prisma.quiz.create({
      data: {
        mindmapId,
        title: dto.title ?? `Quiz: ${mindmap.title}`,
        difficulty: dto.difficulty ?? 'medium',
        questions: {
          create: questions.map((q, idx) => ({
            type: q.type,
            question: q.question,
            options: Prisma.JsonNull,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            position: idx,
          })),
        },
      },
      include: { questions: { orderBy: { position: 'asc' } } },
    });
  }

  async deleteQuiz(quizId: string, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { mindmap: { select: { userId: true } } },
    });
    if (!quiz) throw new NotFoundException({ code: 'QUIZ_NOT_FOUND' });
    if (quiz.mindmap.userId !== userId) {
      throw new ForbiddenException({ code: 'QUIZ_ACCESS_DENIED' });
    }
    await this.prisma.quiz.delete({ where: { id: quizId } });
  }

  // ---------- attempts ----------

  /**
   * Submit a quiz attempt. Scores each answer, returns full breakdown.
   *
   * If user has at least one flashcard deck linked to this quiz's mindmap,
   * wrong answers are appended as new cards to the most recent one — closes
   * the "auto-add wrong answers to flashcard" loop. We don't auto-create a
   * new deck (avoid surprise side effects).
   */
  async submitAttempt(quizId: string, userId: string, dto: SubmitAttemptDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { position: 'asc' } },
        mindmap: { select: { id: true, userId: true } },
      },
    });
    if (!quiz) throw new NotFoundException({ code: 'QUIZ_NOT_FOUND' });
    if (quiz.mindmap.userId !== userId) {
      throw new ForbiddenException({ code: 'QUIZ_ACCESS_DENIED' });
    }

    const answerByQuestion = new Map(dto.answers.map((a) => [a.questionId, a.answer]));

    const scored: ScoredQuestion[] = quiz.questions.map((q) => {
      const userAnswer = (answerByQuestion.get(q.id) ?? '').trim();
      const correct = matchAnswer(q.type, userAnswer, q.correctAnswer);
      return {
        questionId: q.id,
        type: q.type,
        question: q.question,
        options: q.options as string[] | null,
        userAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        correct,
      };
    });

    const correctCount = scored.filter((s) => s.correct).length;
    const score = quiz.questions.length === 0
      ? 0
      : Math.round((correctCount / quiz.questions.length) * 100);

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        answersJson: scored as unknown as Prisma.InputJsonValue,
        timeSpentSec: dto.timeSpentSec ?? null,
      },
    });

    // Side effect: append wrong answers to user's most recent deck for this mindmap.
    const wrongAdded = await this.appendWrongAnswersToDeck(
      userId,
      quiz.mindmap.id,
      scored.filter((s) => !s.correct),
    );

    return {
      attemptId: attempt.id,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      results: scored,
      wrongAnswersAddedToDeckId: wrongAdded,
    };
  }

  /** Past attempts for a quiz (user's own). */
  async listAttempts(quizId: string, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { mindmap: { select: { userId: true } } },
    });
    if (!quiz) throw new NotFoundException({ code: 'QUIZ_NOT_FOUND' });
    if (quiz.mindmap.userId !== userId) {
      throw new ForbiddenException({ code: 'QUIZ_ACCESS_DENIED' });
    }
    return this.prisma.quizAttempt.findMany({
      where: { quizId, userId },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        score: true,
        timeSpentSec: true,
        completedAt: true,
      },
    });
  }

  // ---------- helpers ----------

  private async appendWrongAnswersToDeck(
    userId: string,
    mindmapId: string,
    wrong: ScoredQuestion[],
  ): Promise<string | null> {
    if (wrong.length === 0) return null;
    const deck = await this.prisma.flashcardDeck.findFirst({
      where: { userId, mindmapId },
      orderBy: { updatedAt: 'desc' },
    });
    if (!deck) return null;

    await this.prisma.flashcard.createMany({
      data: wrong.map((w) => ({
        deckId: deck.id,
        question: w.question,
        answer: w.correctAnswer,
        format: 'qa' as const,
      })),
    });
    await this.prisma.flashcardDeck.update({
      where: { id: deck.id },
      data: { updatedAt: new Date() },
    });
    return deck.id;
  }
}

/**
 * Compare user answer to correct answer.
 *
 * - multiple_choice: exact match after trim (FE sends the chosen option text)
 * - short_answer / cloze: case-insensitive trimmed equality, OR either side
 *   contains the other when one is short. Permissive on purpose — user may
 *   write "y = ax² + bx + c" while answer is "y=ax^2+bx+c".  Future: fuzzy
 *   match via Levenshtein, swap to LLM grader for free-form questions.
 */
export function matchAnswer(type: string, userAnswer: string, correctAnswer: string): boolean {
  const u = userAnswer.trim();
  const c = correctAnswer.trim();
  if (u.length === 0 || c.length === 0) return false;

  if (type === 'multiple_choice') {
    return u.toLowerCase() === c.toLowerCase();
  }

  // short_answer / cloze — case-insensitive, allow either-side substring
  const ul = u.toLowerCase();
  const cl = c.toLowerCase();
  if (ul === cl) return true;
  // Reject trivial substring matches like "a"
  if (Math.min(ul.length, cl.length) < 4) return ul === cl;
  return ul.includes(cl) || cl.includes(ul);
}
