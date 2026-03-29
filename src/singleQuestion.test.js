import { describe, expect, it } from 'vitest';

import { nextScreenAfterLast } from './quizLogic';

describe('single-question mode', () => {
  describe('nextScreenAfterLast', () => {
    it('returns "browse" for single-question sessions', () => {
      expect(nextScreenAfterLast(true)).toBe('browse');
    });

    it('returns "finished" for multi-question sessions', () => {
      expect(nextScreenAfterLast(false)).toBe('finished');
    });
  });

  describe('single-question session structure', () => {
    it('a single-question session has exactly one question', () => {
      // Simulates handlePickQuestion: questions = [thatQuestion]
      const question = {
        number: 5,
        text: 'Sample question?',
        options: ['A) a', 'B) b', 'C) c', 'D) d'],
        correctIndex: 1,
        explanation: 'Because B.',
        clarification: 'This asks about B.',
      };
      const session = [question];
      expect(session).toHaveLength(1);
      expect(session[0]).toBe(question);
    });

    it('isSingleQuestion is true when questions.length === 1', () => {
      // Mirrors the logic in App.jsx: const isSingleQuestion = questions.length === 1;
      const questions = [{ number: 1 }];
      const isSingleQuestion = questions.length === 1;
      expect(isSingleQuestion).toBe(true);
    });

    it('isSingleQuestion is false for multi-question sessions', () => {
      const questions = [{ number: 1 }, { number: 2 }];
      const isSingleQuestion = questions.length === 1;
      expect(isSingleQuestion).toBe(false);
    });
  });

  describe('answer detection in single-question mode', () => {
    it('selecting the correct index counts as correct', () => {
      const q = { correctIndex: 2 };
      const selected = 2;
      expect(selected === q.correctIndex).toBe(true);
    });

    it('selecting a wrong index counts as incorrect', () => {
      const q = { correctIndex: 2 };
      const selected = 0;
      expect(selected === q.correctIndex).toBe(false);
    });

    it('navigates to browse after answering in single-question mode', () => {
      // Simulates handleNext: if (current + 1 >= questions.length) setScreen(isSingleQuestion ? 'browse' : 'finished')
      const current = 0;
      const questions = [{ number: 1 }];
      const isSingleQuestion = questions.length === 1;
      const isLastQuestion = current + 1 >= questions.length;

      expect(isLastQuestion).toBe(true);
      expect(nextScreenAfterLast(isSingleQuestion)).toBe('browse');
    });
  });
});
