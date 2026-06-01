import { describe, expect, it } from 'vitest';
import { buildDueDigest, shouldRemind } from './digest';

describe('shouldRemind', () => {
  it('true only when opted in AND has due cards', () => {
    expect(shouldRemind({ reminderEnabled: true }, 3)).toBe(true);
    expect(shouldRemind({ reminderEnabled: true }, 0)).toBe(false);
    expect(shouldRemind({ reminderEnabled: false }, 3)).toBe(false);
    expect(shouldRemind({ reminderEnabled: false }, 0)).toBe(false);
  });
});

describe('buildDueDigest', () => {
  const base = {
    name: 'Nguyễn Văn An',
    totalDue: 12,
    decks: [
      { title: 'Toán 10', dueCards: 7 },
      { title: 'Lý 11', dueCards: 5 },
    ],
    studyUrl: 'https://naocavang.com/flashcards',
  };

  it('uses the last name part in subject + greeting', () => {
    const { subject, text } = buildDueDigest(base);
    expect(subject).toBe('🐠 An ơi, hôm nay có 12 thẻ cần ôn!');
    expect(text).toContain('Chào An,');
  });

  it('lists decks most-due first', () => {
    const { text } = buildDueDigest(base);
    expect(text.indexOf('Toán 10: 7 thẻ')).toBeLessThan(text.indexOf('Lý 11: 5 thẻ'));
  });

  it('includes the study URL', () => {
    expect(buildDueDigest(base).text).toContain('https://naocavang.com/flashcards');
  });

  it('caps deck list at 5 and summarises the rest', () => {
    const decks = Array.from({ length: 8 }, (_, i) => ({ title: `Bộ ${i}`, dueCards: 8 - i }));
    const { text } = buildDueDigest({ ...base, decks });
    expect(text).toContain('…và 3 bộ khác');
    // 5 listed deck lines + 1 summary line
    expect(text.match(/^• /gm)?.length).toBe(6);
  });

  it('omits zero-due decks', () => {
    const { text } = buildDueDigest({
      ...base,
      decks: [
        { title: 'Có thẻ', dueCards: 2 },
        { title: 'Rỗng', dueCards: 0 },
      ],
    });
    expect(text).toContain('Có thẻ: 2 thẻ');
    expect(text).not.toContain('Rỗng');
  });
});
