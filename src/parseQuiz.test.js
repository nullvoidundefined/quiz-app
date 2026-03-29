import { describe, expect, it } from 'vitest';

import { parseQuiz } from './parseQuiz';

const SINGLE_QUESTION = `
**1. What library does the app use for validation?**

- A) Joi
- B) Yup
- **C) Zod**
- D) class-validator

? Runtime validation libraries check data at execution time.

> Zod is a TypeScript-first schema library.
`;

const TWO_QUESTIONS = `
**1. First question?**

- A) Wrong
- **B) Right**
- C) Wrong
- D) Wrong

? Clarification for Q1.

> Explanation for Q1.

**2. Second question?**

- **A) Correct**
- B) Wrong
- C) Wrong
- D) Wrong

? Clarification for Q2.

> Explanation for Q2.
`;

describe('parseQuiz', () => {
  describe('basic parsing', () => {
    it('parses a single question from markdown', () => {
      const result = parseQuiz(SINGLE_QUESTION);
      expect(result).toHaveLength(1);
      expect(result[0].number).toBe(1);
      expect(result[0].text).toBe(
        'What library does the app use for validation?',
      );
    });

    it('extracts all four options', () => {
      const result = parseQuiz(SINGLE_QUESTION);
      expect(result[0].options).toHaveLength(4);
      expect(result[0].options[0]).toBe('A) Joi');
      expect(result[0].options[1]).toBe('B) Yup');
      expect(result[0].options[2]).toBe('C) Zod');
      expect(result[0].options[3]).toBe('D) class-validator');
    });

    it('identifies the correct answer index from bold markers', () => {
      const result = parseQuiz(SINGLE_QUESTION);
      expect(result[0].correctIndex).toBe(2); // C) Zod is index 2
    });

    it('parses multiple questions', () => {
      const result = parseQuiz(TWO_QUESTIONS);
      expect(result).toHaveLength(2);
      expect(result[0].number).toBe(1);
      expect(result[1].number).toBe(2);
    });

    it('correctly identifies different correct answer positions', () => {
      const result = parseQuiz(TWO_QUESTIONS);
      expect(result[0].correctIndex).toBe(1); // B
      expect(result[1].correctIndex).toBe(0); // A
    });
  });

  describe('clarification and explanation separation', () => {
    it('extracts clarification lines (? prefix)', () => {
      const result = parseQuiz(SINGLE_QUESTION);
      expect(result[0].clarification).toBe(
        'Runtime validation libraries check data at execution time.',
      );
    });

    it('extracts explanation lines (> prefix)', () => {
      const result = parseQuiz(SINGLE_QUESTION);
      expect(result[0].explanation).toBe(
        'Zod is a TypeScript-first schema library.',
      );
    });

    it('joins multiple clarification lines with spaces', () => {
      const md = `
**1. Question?**

- A) One
- **B) Two**
- C) Three
- D) Four

? First clarification line.
? Second clarification line.

> Explanation.
`;
      const result = parseQuiz(md);
      expect(result[0].clarification).toBe(
        'First clarification line. Second clarification line.',
      );
    });

    it('joins multiple explanation lines with spaces', () => {
      const md = `
**1. Question?**

- A) One
- **B) Two**
- C) Three
- D) Four

? Clarification.

> First explanation line.
> Second explanation line.
`;
      const result = parseQuiz(md);
      expect(result[0].explanation).toBe(
        'First explanation line. Second explanation line.',
      );
    });

    it('returns empty strings when clarification/explanation are absent', () => {
      const md = `
**1. Question?**

- A) One
- **B) Two**
- C) Three
- D) Four
`;
      const result = parseQuiz(md);
      expect(result[0].clarification).toBe('');
      expect(result[0].explanation).toBe('');
    });
  });

  describe('inline markdown to HTML conversion', () => {
    it('converts markdown links to HTML anchor tags in explanations', () => {
      const md = `
**1. Question?**

- A) One
- **B) Two**
- C) Three
- D) Four

> See [the docs](https://example.com) for details.
`;
      const result = parseQuiz(md);
      expect(result[0].explanation).toContain(
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer">the docs</a>',
      );
    });

    it('converts backtick code to <code> tags in explanations', () => {
      const md = `
**1. Question?**

- A) One
- **B) Two**
- C) Three
- D) Four

> Use the \`parse()\` method.
`;
      const result = parseQuiz(md);
      expect(result[0].explanation).toContain('<code>parse()</code>');
    });

    it('converts inline markdown in clarification text', () => {
      const md = `
**1. Question?**

- A) One
- **B) Two**
- C) Three
- D) Four

? The \`validate()\` function checks [schemas](https://zod.dev).
`;
      const result = parseQuiz(md);
      expect(result[0].clarification).toContain('<code>validate()</code>');
      expect(result[0].clarification).toContain(
        '<a href="https://zod.dev" target="_blank" rel="noopener noreferrer">schemas</a>',
      );
    });
  });

  describe('edge cases', () => {
    it('returns an empty array for empty input', () => {
      expect(parseQuiz('')).toEqual([]);
    });

    it('skips questions with fewer than 4 options', () => {
      const md = `
**1. Incomplete question?**

- A) One
- **B) Two**
- C) Three
`;
      expect(parseQuiz(md)).toEqual([]);
    });

    it('skips questions with no bold (correct) option', () => {
      const md = `
**1. No correct answer?**

- A) One
- B) Two
- C) Three
- D) Four
`;
      expect(parseQuiz(md)).toEqual([]);
    });
  });
});
