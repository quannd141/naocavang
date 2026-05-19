import { describe, expect, it } from 'vitest';
import { levenshtein, matchAnswer, normalise, similarity } from './answer-grader';

describe('normalise', () => {
  it('lowercases + trims + collapses whitespace', () => {
    expect(normalise('  Phép   COng  ')).toBe('phep cong');
  });

  it('strips Vietnamese diacritics', () => {
    expect(normalise('phép cộng')).toBe('phep cong');
    expect(normalise('định nghĩa')).toBe('dinh nghia');
    expect(normalise('Đường tròn')).toBe('duong tron');
  });

  it('returns empty for whitespace-only', () => {
    expect(normalise('   ')).toBe('');
  });
});

describe('levenshtein', () => {
  it('zero for identical strings', () => {
    expect(levenshtein('abc', 'abc')).toBe(0);
  });

  it('counts single substitution', () => {
    expect(levenshtein('cat', 'bat')).toBe(1);
  });

  it('counts insertion', () => {
    expect(levenshtein('cat', 'cats')).toBe(1);
  });

  it('symmetric', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('sitting', 'kitten')).toBe(3);
  });

  it('handles empty inputs', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('', '')).toBe(0);
  });
});

describe('similarity', () => {
  it('1.0 for identical', () => {
    expect(similarity('paris', 'paris')).toBe(1);
  });

  it('0.0 for two empty strings (by convention)', () => {
    expect(similarity('', '')).toBe(1);
  });

  it('≥ 0.85 for typo within 1 char of a 7-char word', () => {
    expect(similarity('vietnam', 'vietnan')).toBeGreaterThanOrEqual(0.85);
  });
});

describe('matchAnswer', () => {
  describe('multiple_choice', () => {
    it('requires exact (normalised) text match', () => {
      expect(matchAnswer('multiple_choice', 'Option A', 'Option A')).toBe(true);
      expect(matchAnswer('multiple_choice', 'option a', 'OPTION A')).toBe(true);
    });

    it('rejects substring or fuzzy for MCQ — must be the same option', () => {
      expect(matchAnswer('multiple_choice', 'Option A is correct', 'Option A')).toBe(false);
      expect(matchAnswer('multiple_choice', 'Optoin A', 'Option A')).toBe(false);
    });
  });

  describe('short_answer / cloze', () => {
    it('exact normalised equality', () => {
      expect(matchAnswer('short_answer', 'Paris', 'paris')).toBe(true);
    });

    it('handles Vietnamese diacritic drift — "phep cong" matches "phép cộng"', () => {
      expect(matchAnswer('short_answer', 'phep cong', 'phép cộng')).toBe(true);
      expect(matchAnswer('short_answer', 'PHÉP CỘNG', 'phep cong')).toBe(true);
    });

    it('catches single-char typos via Levenshtein ≥ 0.85', () => {
      // "vietnam" vs "vietnan" — distance 1, ratio 6/7 ≈ 0.857
      expect(matchAnswer('short_answer', 'vietnan', 'vietnam')).toBe(true);
      // "hà nội" vs "ha noi" → after normalise both → "ha noi" → exact match
      expect(matchAnswer('short_answer', 'Hà Nội', 'ha noi')).toBe(true);
    });

    it('substring tolerance both directions', () => {
      expect(matchAnswer('short_answer', 'paris is capital', 'paris')).toBe(true);
      expect(matchAnswer('short_answer', 'paris', 'paris is capital')).toBe(true);
    });

    it('rejects trivially short tokens', () => {
      // "a" matching "answer to question a" would be a false positive
      expect(matchAnswer('short_answer', 'a', 'answer is a')).toBe(false);
    });

    it('rejects clearly wrong answer', () => {
      expect(matchAnswer('short_answer', 'tokyo', 'paris')).toBe(false);
      expect(matchAnswer('short_answer', 'sai rồi', 'phép cộng')).toBe(false);
    });

    it('cloze treated like short_answer', () => {
      expect(matchAnswer('cloze', 'y = ax + b', 'y = ax + b')).toBe(true);
      expect(matchAnswer('cloze', 'y=ax+b', 'y = ax + b')).toBe(true); // normalise whitespace
    });

    it('empty input is always wrong', () => {
      expect(matchAnswer('short_answer', '', 'paris')).toBe(false);
      expect(matchAnswer('short_answer', '   ', 'paris')).toBe(false);
      expect(matchAnswer('short_answer', 'paris', '')).toBe(false);
    });
  });

  describe('regression: existing quiz.service.spec.ts cases still pass', () => {
    it('phép cộng số học contains phép cộng', () => {
      expect(matchAnswer('short_answer', 'phép cộng số học', 'phép cộng')).toBe(true);
    });

    it('cộng (4 chars) substring-matches phép cộng', () => {
      expect(matchAnswer('short_answer', 'cộng', 'phép cộng')).toBe(true);
    });
  });
});
