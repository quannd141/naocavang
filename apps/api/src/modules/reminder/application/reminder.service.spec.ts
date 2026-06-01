import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReminderService } from './reminder.service';

type AnyFn = (...args: unknown[]) => unknown;
type Mock = ReturnType<typeof vi.fn<AnyFn>>;

interface PrismaMock {
  user: { findMany: Mock };
  flashcard: { groupBy: Mock };
  flashcardDeck: { findMany: Mock };
}

function makeService() {
  const prisma: PrismaMock = {
    user: { findMany: vi.fn() },
    flashcard: { groupBy: vi.fn() },
    flashcardDeck: { findMany: vi.fn() },
  };
  const config = { get: vi.fn().mockReturnValue('https://app.test') };
  const email = { send: vi.fn().mockResolvedValue(undefined) };
  const service = new ReminderService(
    prisma as unknown as never,
    config as unknown as never,
    email as unknown as never,
  );
  return { service, prisma, email };
}

describe('ReminderService.runDailyDigest', () => {
  let ctx: ReturnType<typeof makeService>;
  beforeEach(() => {
    ctx = makeService();
  });

  it('sends a digest to an opted-in user who has due cards', async () => {
    const { service, prisma, email } = ctx;
    prisma.user.findMany.mockResolvedValue([{ id: 'u1', name: 'An', email: 'an@test.vn' }]);
    prisma.flashcard.groupBy.mockResolvedValue([{ deckId: 'd1', _count: { _all: 4 } }]);
    prisma.flashcardDeck.findMany.mockResolvedValue([{ id: 'd1', title: 'Toán 10' }]);

    const result = await service.runDailyDigest(new Date('2026-06-01T00:00:00Z'));

    expect(result).toEqual({ candidates: 1, sent: 1, skipped: 0 });
    expect(email.send).toHaveBeenCalledTimes(1);
    const msg = email.send.mock.calls[0][0] as { to: string; subject: string; text: string };
    expect(msg.to).toBe('an@test.vn');
    expect(msg.subject).toContain('4 thẻ');
    expect(msg.text).toContain('Toán 10: 4 thẻ');
    expect(msg.text).toContain('https://app.test/flashcards');
  });

  it('skips users with zero due cards (no email)', async () => {
    const { service, prisma, email } = ctx;
    prisma.user.findMany.mockResolvedValue([{ id: 'u1', name: 'An', email: 'an@test.vn' }]);
    prisma.flashcard.groupBy.mockResolvedValue([]);

    const result = await service.runDailyDigest();

    expect(result).toEqual({ candidates: 1, sent: 0, skipped: 1 });
    expect(email.send).not.toHaveBeenCalled();
    expect(prisma.flashcardDeck.findMany).not.toHaveBeenCalled();
  });

  it('only considers users with reminderEnabled (query filter)', async () => {
    const { service, prisma } = ctx;
    prisma.user.findMany.mockResolvedValue([]);

    const result = await service.runDailyDigest();

    expect(result.candidates).toBe(0);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { preferences: { reminderEnabled: true } },
      }),
    );
  });

  it('handles multiple users — sends only to those with due cards', async () => {
    const { service, prisma, email } = ctx;
    prisma.user.findMany.mockResolvedValue([
      { id: 'u1', name: 'An', email: 'an@test.vn' },
      { id: 'u2', name: 'Bình', email: 'binh@test.vn' },
    ]);
    prisma.flashcard.groupBy
      .mockResolvedValueOnce([{ deckId: 'd1', _count: { _all: 2 } }])
      .mockResolvedValueOnce([]);
    prisma.flashcardDeck.findMany.mockResolvedValue([{ id: 'd1', title: 'Lý 11' }]);

    const result = await service.runDailyDigest();

    expect(result).toEqual({ candidates: 2, sent: 1, skipped: 1 });
    expect(email.send).toHaveBeenCalledTimes(1);
  });
});
