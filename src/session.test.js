import { describe, expect, it } from 'vitest';

import { shuffle } from './parseQuiz';
import {
  buildSession,
  computeSessionSize,
  QUESTIONS_PER_SESSION,
} from './quizLogic';

function makeQuestions(count) {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    text: `Question ${i + 1}?`,
    options: ['A) a', 'B) b', 'C) c', 'D) d'],
    correctIndex: 0,
    explanation: '',
    clarification: '',
  }));
}

describe('session limiting', () => {
  it('QUESTIONS_PER_SESSION is 20', () => {
    expect(QUESTIONS_PER_SESSION).toBe(20);
  });

  describe('computeSessionSize', () => {
    it('caps at 20 when pool is larger', () => {
      expect(computeSessionSize(50)).toBe(20);
      expect(computeSessionSize(100)).toBe(20);
    });

    it('returns exact pool size when pool is 20 or fewer', () => {
      expect(computeSessionSize(20)).toBe(20);
      expect(computeSessionSize(15)).toBe(15);
      expect(computeSessionSize(5)).toBe(5);
      expect(computeSessionSize(1)).toBe(1);
    });

    it('returns 0 for empty pool', () => {
      expect(computeSessionSize(0)).toBe(0);
    });
  });

  describe('buildSession', () => {
    it('returns exactly 20 questions from a pool of 50', () => {
      const pool = makeQuestions(50);
      const session = buildSession(pool, shuffle);
      expect(session).toHaveLength(20);
    });

    it('returns all questions when pool has fewer than 20', () => {
      const pool = makeQuestions(10);
      const session = buildSession(pool, shuffle);
      expect(session).toHaveLength(10);
    });

    it('returns all questions when pool has exactly 20', () => {
      const pool = makeQuestions(20);
      const session = buildSession(pool, shuffle);
      expect(session).toHaveLength(20);
    });

    it('returns empty array for empty pool', () => {
      const session = buildSession([], shuffle);
      expect(session).toHaveLength(0);
    });

    it('draws a random subset (not always the first 20)', () => {
      const pool = makeQuestions(50);
      const sessions = Array.from({ length: 5 }, () =>
        buildSession(pool, shuffle),
      );

      // At least one session should differ from the first
      const firstNumbers = sessions[0].map((q) => q.number).join(',');
      const allSame = sessions.every(
        (s) => s.map((q) => q.number).join(',') === firstNumbers,
      );
      expect(allSame).toBe(false);
    });
  });
});
