/**
 * Reminder digest assembly. Pure functions — no IO, fully testable.
 */

export interface DigestDeck {
  title: string;
  dueCards: number;
}

export interface DigestInput {
  name: string;
  totalDue: number;
  /** Per-deck breakdown; only decks with dueCards > 0 are meaningful. */
  decks: DigestDeck[];
  /** Absolute URL to the study page (CTA). */
  studyUrl: string;
}

export interface DigestEmail {
  subject: string;
  text: string;
}

const MAX_DECKS_LISTED = 5;

/**
 * Whether to send a daily reminder: only when the user opted in AND there is at
 * least one card due. (No "you have 0 cards" noise.)
 */
export function shouldRemind(prefs: { reminderEnabled: boolean }, dueCount: number): boolean {
  return prefs.reminderEnabled && dueCount > 0;
}

/**
 * Build the due-cards digest email. Lists up to 5 decks (most-due first) and
 * summarises the rest as "+N bộ khác".
 */
export function buildDueDigest(input: DigestInput): DigestEmail {
  const firstName = input.name.trim().split(/\s+/).pop() || input.name;
  const subject = `🐠 ${firstName} ơi, hôm nay có ${input.totalDue} thẻ cần ôn!`;

  const ranked = [...input.decks]
    .filter((d) => d.dueCards > 0)
    .sort((a, b) => b.dueCards - a.dueCards);
  const shown = ranked.slice(0, MAX_DECKS_LISTED);
  const lines = shown.map((d) => `• ${d.title}: ${d.dueCards} thẻ`);
  if (ranked.length > MAX_DECKS_LISTED) {
    lines.push(`• …và ${ranked.length - MAX_DECKS_LISTED} bộ khác`);
  }

  const text = [
    `Chào ${firstName},`,
    '',
    `Hôm nay bạn có **${input.totalDue} thẻ** đến hạn ôn theo lịch spaced repetition.`,
    ...(lines.length > 0 ? ['', ...lines] : []),
    '',
    `Ôn ngay để giữ chuỗi học của bạn: ${input.studyUrl}`,
    '',
    'Học một lần, nhớ cả đời 🧠✨',
    '— NãoCáVàng',
  ].join('\n');

  return { subject, text };
}
