/**
 * Summarise a user's quiz attempt history for the quiz intro screen.
 *
 * Pure function — no IO. Input is the attempt list as returned by
 * `QuizService.listAttempts` (ordered newest-first), so `lastScore` is the
 * first element's score. `bestScore`/`avgScore` are order-independent.
 */

export interface AttemptScore {
  score: number;
}

export interface AttemptSummary {
  /** Number of attempts. */
  count: number;
  /** Highest score achieved (0 when no attempts). */
  bestScore: number;
  /** Mean score rounded to the nearest integer (0 when no attempts). */
  avgScore: number;
  /** Score of the most recent attempt, or null when no attempts. */
  lastScore: number | null;
}

export function summariseAttempts(attempts: AttemptScore[]): AttemptSummary {
  if (attempts.length === 0) {
    return { count: 0, bestScore: 0, avgScore: 0, lastScore: null };
  }
  const scores = attempts.map((a) => a.score);
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return {
    count: attempts.length,
    bestScore: Math.max(...scores),
    avgScore: Math.round(sum / scores.length),
    lastScore: attempts[0].score,
  };
}
