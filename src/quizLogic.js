/**
 * Pure logic functions extracted from App.jsx for testability.
 *
 * These are re-exported here so tests can import them directly.
 * App.jsx should import from this module instead of defining inline.
 */

export const QUESTIONS_PER_SESSION = 20;

export function getLetterGrade(pct) {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

export function gradeColor(grade) {
  return {
    A: '#22c55e',
    B: '#84cc16',
    C: '#eab308',
    D: '#f97316',
    F: '#ef4444',
  }[grade];
}

/**
 * Compute the session size (number of questions to draw).
 * Caps at QUESTIONS_PER_SESSION; uses the full pool if smaller.
 */
export function computeSessionSize(poolSize) {
  return Math.min(QUESTIONS_PER_SESSION, poolSize);
}

/**
 * Build a quiz session: shuffle the pool and take sessionSize questions.
 */
export function buildSession(allQuestions, shuffleFn) {
  const sessionSize = computeSessionSize(allQuestions.length);
  return shuffleFn(allQuestions).slice(0, sessionSize);
}

/**
 * Determine whether a single-question session should return to browse
 * instead of the finished screen.
 */
export function nextScreenAfterLast(isSingleQuestion) {
  return isSingleQuestion ? 'browse' : 'finished';
}

/**
 * Compute percentage score.
 */
export function computePercentage(score, answered) {
  return answered > 0 ? Math.round((score / answered) * 100) : 100;
}
