/**
 * Answer grader — decide whether a user's free-text quiz answer matches the
 * expected correct answer.
 *
 * Strategy (in order):
 *   1. Normalise both sides: lowercase, trim, collapse whitespace.
 *   2. Exact normalised equality → correct.
 *   3. (multiple_choice): stop here — must be exact text.
 *   4. (short_answer / cloze): allow either side to "contain" the other when
 *      the shorter side is ≥ 4 chars (avoid false-positive on tiny tokens).
 *   5. Fuzzy: Levenshtein-distance ratio ≥ 0.85 → correct. Catches typos and
 *      minor punctuation/diacritic drift like "phep cong" vs "phép cộng".
 *
 * Pure functions — no IO, no framework. Fully testable.
 */

export type AnswerQuestionType = 'multiple_choice' | 'cloze' | 'short_answer' | string;

const FUZZY_THRESHOLD = 0.85;
const MIN_LEN_FOR_SUBSTRING = 4;
const MIN_LEN_FOR_FUZZY = 4;

export function matchAnswer(
  type: AnswerQuestionType,
  userAnswer: string,
  correctAnswer: string,
): boolean {
  const u = normalise(userAnswer);
  const c = normalise(correctAnswer);

  if (u.length === 0 || c.length === 0) return false;
  if (u === c) return true;

  if (type === 'multiple_choice') {
    return false;
  }

  const minLen = Math.min(u.length, c.length);

  // Substring containment (when both sides are non-trivial length)
  if (minLen >= MIN_LEN_FOR_SUBSTRING && (u.includes(c) || c.includes(u))) {
    return true;
  }

  // Fuzzy ratio — only when both strings have meaningful length
  if (minLen >= MIN_LEN_FOR_FUZZY) {
    const ratio = similarity(u, c);
    if (ratio >= FUZZY_THRESHOLD) return true;
  }

  // Last pass: strip all whitespace and retry exact equality. Handles
  // formula-style answers where "y=ax+b" should match "y = ax + b".
  const uNoSpace = u.replace(/\s+/g, '');
  const cNoSpace = c.replace(/\s+/g, '');
  if (uNoSpace.length >= MIN_LEN_FOR_FUZZY && uNoSpace === cNoSpace) {
    return true;
  }

  return false;
}

/**
 * Normalise to a comparable form:
 *   - lowercase
 *   - collapse whitespace
 *   - strip leading/trailing punctuation/whitespace
 *   - strip common Vietnamese diacritics so "phép" ≈ "phep" matches
 */
export function normalise(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritic marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Similarity ratio in [0,1]: 1 - (levenshtein / maxLen).
 * Exported for unit tests.
 */
export function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / max;
}

/**
 * Classic Wagner-Fischer Levenshtein. O(a.length * b.length). For our use
 * case (quiz answers ≤ 2000 chars by DTO cap) this is fine. We bail early
 * when one side is empty.
 */
export function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1, // insert
        prev[j] + 1, // delete
        prev[j - 1] + cost, // substitute
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}
