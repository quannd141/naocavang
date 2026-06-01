import { describe, expect, it } from 'vitest';
import { normaliseIngestedCards, titleFromFileName } from './ingest-normalise';

describe('normaliseIngestedCards', () => {
  it('extracts cards from the AI { cards: [...] } shape', () => {
    const out = normaliseIngestedCards({
      cards: [{ question: 'Q1', answer: 'A1', format: 'qa' }],
    });
    expect(out).toEqual([{ question: 'Q1', answer: 'A1', format: 'qa' }]);
  });

  it('accepts a bare array', () => {
    const out = normaliseIngestedCards([{ question: 'Q', answer: 'A' }]);
    expect(out).toHaveLength(1);
  });

  it('drops cards with empty question or answer', () => {
    const out = normaliseIngestedCards({
      cards: [
        { question: '', answer: 'A' },
        { question: 'Q', answer: '   ' },
        { question: 'Q2', answer: 'A2' },
      ],
    });
    expect(out).toEqual([{ question: 'Q2', answer: 'A2', format: 'qa' }]);
  });

  it('coerces unknown formats to qa', () => {
    const out = normaliseIngestedCards({
      cards: [{ question: 'Q', answer: 'A', format: 'weird' }],
    });
    expect(out[0]?.format).toBe('qa');
  });

  it('preserves valid cloze / mcq formats', () => {
    const out = normaliseIngestedCards({
      cards: [
        { question: 'Q', answer: 'A', format: 'cloze' },
        { question: 'Q', answer: 'A', format: 'mcq' },
      ],
    });
    expect(out.map((c) => c.format)).toEqual(['cloze', 'mcq']);
  });

  it('truncates over-long question / answer', () => {
    const out = normaliseIngestedCards({
      cards: [{ question: 'q'.repeat(2000), answer: 'a'.repeat(5000) }],
    });
    expect(out[0]?.question.length).toBe(1000);
    expect(out[0]?.answer.length).toBe(2000);
  });

  it('caps the number of cards', () => {
    const many = Array.from({ length: 200 }, (_, i) => ({ question: `Q${i}`, answer: `A${i}` }));
    expect(normaliseIngestedCards({ cards: many }, { maxCards: 5 })).toHaveLength(5);
  });

  it('returns [] for junk input', () => {
    expect(normaliseIngestedCards(null)).toEqual([]);
    expect(normaliseIngestedCards({})).toEqual([]);
    expect(normaliseIngestedCards('nope')).toEqual([]);
  });
});

describe('titleFromFileName', () => {
  it('strips the .pdf extension', () => {
    expect(titleFromFileName('Sinh học 12.pdf')).toBe('Sinh học 12');
  });

  it('is case-insensitive on the extension', () => {
    expect(titleFromFileName('Notes.PDF')).toBe('Notes');
  });

  it('falls back when name is missing or blank', () => {
    expect(titleFromFileName(undefined)).toBe('Tài liệu PDF');
    expect(titleFromFileName('   .pdf')).toBe('Tài liệu PDF');
  });
});
