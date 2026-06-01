/**
 * Normalise an AI `flashcard_gen` payload into clean, bounded card inputs ready
 * for {@link FlashcardService.createDeck}. Because ingest calls the service
 * directly (bypassing the class-validator DTO), this is the only guard against
 * malformed / oversized AI output reaching the DB.
 */

const MAX_QUESTION = 1000;
const MAX_ANSWER = 2000;
const MAX_CARDS = 100;
const FORMATS = ['qa', 'cloze', 'mcq'] as const;

export type CardFormat = (typeof FORMATS)[number];

export interface NormalisedCard {
  question: string;
  answer: string;
  format: CardFormat;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Accepts either `{ cards: [...] }` (AI shape) or a bare array. Drops cards with
 * an empty question or answer, truncates to field limits, coerces unknown
 * formats to `qa`, and caps the total at {@link MAX_CARDS}.
 */
export function normaliseIngestedCards(
  raw: unknown,
  opts: { maxCards?: number } = {},
): NormalisedCard[] {
  const max = opts.maxCards ?? MAX_CARDS;
  const source = raw as { cards?: unknown };
  const list = Array.isArray(source?.cards) ? source.cards : Array.isArray(raw) ? raw : [];

  const cards: NormalisedCard[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const c = item as Record<string, unknown>;
    const question = asString(c.question).trim();
    const answer = asString(c.answer).trim();
    if (!question || !answer) continue;
    const format = FORMATS.includes(c.format as CardFormat) ? (c.format as CardFormat) : 'qa';
    cards.push({
      question: question.slice(0, MAX_QUESTION),
      answer: answer.slice(0, MAX_ANSWER),
      format,
    });
    if (cards.length >= max) break;
  }
  return cards;
}

/**
 * Derive a human-friendly title from the uploaded file name: strips the `.pdf`
 * extension and trims. Falls back to a generic label.
 */
export function titleFromFileName(
  originalName: string | undefined,
  fallback = 'Tài liệu PDF',
): string {
  if (!originalName) return fallback;
  const base = originalName.replace(/\.pdf$/i, '').trim();
  return base ? base.slice(0, 200) : fallback;
}
