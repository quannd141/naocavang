import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizService, matchAnswer } from './quiz.service';

type AnyFn = (...args: unknown[]) => unknown;
type Mock = ReturnType<typeof vi.fn<AnyFn>>;

interface PrismaMock {
  quiz: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    delete: Mock;
  };
  quizAttempt: {
    create: Mock;
    findMany: Mock;
  };
  flashcardDeck: {
    findFirst: Mock;
    update: Mock;
  };
  flashcard: {
    createMany: Mock;
  };
  mindMap: {
    findUnique: Mock;
  };
}

function createPrismaMock(): PrismaMock {
  return {
    quiz: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    quizAttempt: { create: vi.fn(), findMany: vi.fn() },
    flashcardDeck: { findFirst: vi.fn(), update: vi.fn() },
    flashcard: { createMany: vi.fn() },
    mindMap: { findUnique: vi.fn() },
  };
}

const USER_A = 'user-a';
const USER_B = 'user-b';
const MM_ID = 'mm1';

describe('matchAnswer', () => {
  it('exact match (case-insensitive trim) for short_answer', () => {
    expect(matchAnswer('short_answer', 'Phép cộng', 'phép cộng')).toBe(true);
    expect(matchAnswer('short_answer', '  hello  ', 'HELLO')).toBe(true);
  });

  it('substring match permissive both directions when length >= 4', () => {
    expect(matchAnswer('short_answer', 'phép cộng số học', 'phép cộng')).toBe(true);
    // Trivially short answers must match exactly to avoid false positives
    expect(matchAnswer('short_answer', 'a', 'answer is a')).toBe(false);
    expect(matchAnswer('short_answer', 'cộng', 'phép cộng')).toBe(true); // 4 chars
  });

  it('multiple_choice requires exact text match', () => {
    expect(matchAnswer('multiple_choice', 'Option A', 'Option A')).toBe(true);
    expect(matchAnswer('multiple_choice', 'Option A', 'OPTION a')).toBe(true);
    expect(matchAnswer('multiple_choice', 'option A extra', 'Option A')).toBe(false);
  });

  it('returns false on empty input', () => {
    expect(matchAnswer('short_answer', '', 'something')).toBe(false);
    expect(matchAnswer('short_answer', 'x', '')).toBe(false);
  });
});

describe('QuizService', () => {
  let prisma: PrismaMock;
  let service: QuizService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new QuizService(prisma as unknown as never);
  });

  describe('getQuiz', () => {
    const baseQuiz = {
      id: 'q1',
      title: 'Quiz 1',
      difficulty: 'medium',
      mindmapId: MM_ID,
      mindmap: { id: MM_ID, title: 'MM', subject: null, userId: USER_A },
      questions: [
        {
          id: 'qq1',
          type: 'short_answer',
          question: 'Hỏi 1',
          options: null,
          correctAnswer: 'đáp án',
          explanation: 'vì vậy',
          position: 0,
        },
      ],
      createdAt: new Date(),
    };

    it('masks correctAnswer + explanation by default', async () => {
      prisma.quiz.findUnique.mockResolvedValue(baseQuiz);
      const result = await service.getQuiz('q1', USER_A);
      expect(result.questions[0].correctAnswer).toBeUndefined();
      expect(result.questions[0].explanation).toBeUndefined();
    });

    it('reveals answers when includeAnswers=true', async () => {
      prisma.quiz.findUnique.mockResolvedValue(baseQuiz);
      const result = await service.getQuiz('q1', USER_A, true);
      expect(result.questions[0].correctAnswer).toBe('đáp án');
      expect(result.questions[0].explanation).toBe('vì vậy');
    });

    it('throws Forbidden on non-owner mindmap', async () => {
      prisma.quiz.findUnique.mockResolvedValue({
        ...baseQuiz,
        mindmap: { ...baseQuiz.mindmap, userId: USER_B },
      });
      await expect(service.getQuiz('q1', USER_A)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFound when missing', async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);
      await expect(service.getQuiz('missing', USER_A)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('createFromMindmap', () => {
    const mindmapBase = {
      id: MM_ID,
      userId: USER_A,
      title: 'MM',
      data: {
        nodes: [
          { id: 'root', data: { label: 'Root' } },
          { id: 'n1', data: { label: 'A', notes: 'def A' } },
          { id: 'n2', data: { label: 'B' } }, // no notes → skipped
          { id: 'n3', data: { label: 'C', notes: 'def C' } },
        ],
      },
    };

    it('creates short_answer questions only from nodes with notes', async () => {
      prisma.mindMap.findUnique.mockResolvedValue(mindmapBase);
      prisma.quiz.create.mockImplementation((args: unknown) => {
        const a = args as { data: { questions: { create: unknown[] } } };
        return Promise.resolve({ id: 'q1', questions: a.data.questions.create });
      });

      const result = (await service.createFromMindmap(USER_A, MM_ID, {})) as {
        questions: Array<{ type: string; question: string; correctAnswer: string }>;
      };

      expect(result.questions).toHaveLength(2); // n2 skipped (no notes)
      expect(result.questions[0]).toMatchObject({
        type: 'short_answer',
        question: 'Trình bày khái niệm: A',
        correctAnswer: 'def A',
      });
      expect(result.questions[1].correctAnswer).toBe('def C');
    });

    it('throws when no node has notes', async () => {
      prisma.mindMap.findUnique.mockResolvedValue({
        ...mindmapBase,
        data: { nodes: [{ id: 'root', data: { label: 'Root' } }, { id: 'n1', data: { label: 'X' } }] },
      });
      await expect(service.createFromMindmap(USER_A, MM_ID, {})).rejects.toThrow(
        /Mind map cần ít nhất|NO_NODES/,
      );
    });

    it('rejects another user\'s mindmap', async () => {
      prisma.mindMap.findUnique.mockResolvedValue({ ...mindmapBase, userId: USER_B });
      await expect(service.createFromMindmap(USER_A, MM_ID, {})).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('submitAttempt', () => {
    const quizFixture = {
      id: 'q1',
      mindmap: { id: MM_ID, userId: USER_A },
      questions: [
        {
          id: 'qq1',
          type: 'short_answer',
          question: 'Q1?',
          options: null,
          correctAnswer: 'paris',
          explanation: 'capital of France',
          position: 0,
        },
        {
          id: 'qq2',
          type: 'short_answer',
          question: 'Q2?',
          options: null,
          correctAnswer: 'berlin',
          explanation: '',
          position: 1,
        },
      ],
    };

    it('scores correct + wrong, returns 50% for 1-of-2', async () => {
      prisma.quiz.findUnique.mockResolvedValue(quizFixture);
      prisma.quizAttempt.create.mockResolvedValue({ id: 'a1' });
      prisma.flashcardDeck.findFirst.mockResolvedValue(null); // no deck → skip side effect

      const result = await service.submitAttempt('q1', USER_A, {
        answers: [
          { questionId: 'qq1', answer: 'PARIS' }, // correct (case-insensitive)
          { questionId: 'qq2', answer: 'tokyo' }, // wrong
        ],
      });

      expect(result.score).toBe(50);
      expect(result.correctCount).toBe(1);
      expect(result.results[0].correct).toBe(true);
      expect(result.results[1].correct).toBe(false);
      expect(result.wrongAnswersAddedToDeckId).toBeNull();
    });

    it('appends wrong answers to user\'s existing deck for same mindmap', async () => {
      prisma.quiz.findUnique.mockResolvedValue(quizFixture);
      prisma.quizAttempt.create.mockResolvedValue({ id: 'a1' });
      prisma.flashcardDeck.findFirst.mockResolvedValue({ id: 'deck-1', userId: USER_A, mindmapId: MM_ID });
      prisma.flashcard.createMany.mockResolvedValue({ count: 2 });
      prisma.flashcardDeck.update.mockResolvedValue({});

      const result = await service.submitAttempt('q1', USER_A, {
        answers: [
          { questionId: 'qq1', answer: 'wrong1' },
          { questionId: 'qq2', answer: 'wrong2' },
        ],
      });

      expect(result.wrongAnswersAddedToDeckId).toBe('deck-1');
      expect(prisma.flashcard.createMany).toHaveBeenCalledTimes(1);
      const call = prisma.flashcard.createMany.mock.calls[0][0] as {
        data: Array<{ question: string; answer: string }>;
      };
      expect(call.data).toHaveLength(2);
      expect(call.data[0].answer).toBe('paris');
      expect(call.data[1].answer).toBe('berlin');
    });

    it('does NOT touch flashcard table when all correct', async () => {
      prisma.quiz.findUnique.mockResolvedValue(quizFixture);
      prisma.quizAttempt.create.mockResolvedValue({ id: 'a1' });
      prisma.flashcardDeck.findFirst.mockResolvedValue({ id: 'deck-1' });

      const result = await service.submitAttempt('q1', USER_A, {
        answers: [
          { questionId: 'qq1', answer: 'paris' },
          { questionId: 'qq2', answer: 'berlin' },
        ],
      });

      expect(result.score).toBe(100);
      expect(result.wrongAnswersAddedToDeckId).toBeNull();
      expect(prisma.flashcard.createMany).not.toHaveBeenCalled();
    });

    it('rejects non-owner', async () => {
      prisma.quiz.findUnique.mockResolvedValue({
        ...quizFixture,
        mindmap: { id: MM_ID, userId: USER_B },
      });
      await expect(
        service.submitAttempt('q1', USER_A, { answers: [] }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('deleteQuiz', () => {
    it('rejects non-owner', async () => {
      prisma.quiz.findUnique.mockResolvedValue({
        id: 'q1',
        mindmap: { userId: USER_B },
      });
      await expect(service.deleteQuiz('q1', USER_A)).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.quiz.delete).not.toHaveBeenCalled();
    });

    it('deletes for owner', async () => {
      prisma.quiz.findUnique.mockResolvedValue({
        id: 'q1',
        mindmap: { userId: USER_A },
      });
      prisma.quiz.delete.mockResolvedValue({});
      await service.deleteQuiz('q1', USER_A);
      expect(prisma.quiz.delete).toHaveBeenCalledWith({ where: { id: 'q1' } });
    });
  });
});
