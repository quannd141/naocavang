import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { buildDueDigest, shouldRemind } from '../domain/digest';
import { EMAIL_PORT, type EmailPort } from '../domain/ports/email.port';

export interface ReminderRunResult {
  candidates: number;
  sent: number;
  skipped: number;
}

/**
 * Daily spaced-repetition reminder digest. Selects users who opted in and have
 * due cards, then emails them a per-deck breakdown via the EmailPort
 * (MockEmailAdapter logs in night-shift; real provider later — PH-005).
 */
@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(EMAIL_PORT) private readonly email: EmailPort,
  ) {}

  /** 07:00 every day, Vietnam time. Runs in-process (no Redis needed). */
  @Cron('0 7 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleDailyCron(): Promise<void> {
    const result = await this.runDailyDigest();
    this.logger.log(
      `Daily reminder: ${result.sent} sent / ${result.candidates} candidates (${result.skipped} skipped)`,
    );
  }

  async runDailyDigest(now: Date = new Date()): Promise<ReminderRunResult> {
    const studyUrl = `${this.config.get<string>('WEB_URL') ?? 'https://naocavang.com'}/flashcards`;

    const users = await this.prisma.user.findMany({
      where: { preferences: { reminderEnabled: true } },
      select: { id: true, name: true, email: true },
    });

    let sent = 0;
    for (const user of users) {
      const dueByDeck = await this.prisma.flashcard.groupBy({
        by: ['deckId'],
        where: { deck: { userId: user.id }, nextReviewAt: { lte: now } },
        _count: { _all: true },
      });
      const totalDue = dueByDeck.reduce((sum, row) => sum + row._count._all, 0);

      if (!shouldRemind({ reminderEnabled: true }, totalDue)) continue;

      const decks = await this.prisma.flashcardDeck.findMany({
        where: { id: { in: dueByDeck.map((d) => d.deckId) } },
        select: { id: true, title: true },
      });
      const titleById = new Map(decks.map((d) => [d.id, d.title]));

      const digest = buildDueDigest({
        name: user.name,
        totalDue,
        decks: dueByDeck.map((d) => ({
          title: titleById.get(d.deckId) ?? 'Bộ thẻ',
          dueCards: d._count._all,
        })),
        studyUrl,
      });

      await this.email.send({ to: user.email, subject: digest.subject, text: digest.text });
      sent += 1;
    }

    return { candidates: users.length, sent, skipped: users.length - sent };
  }
}
