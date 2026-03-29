import { describe, expect, it } from 'vitest';

import {
  computePercentage,
  getLetterGrade,
  gradeColor,
} from './quizLogic';

describe('getLetterGrade', () => {
  it('returns A for 90% and above', () => {
    expect(getLetterGrade(90)).toBe('A');
    expect(getLetterGrade(95)).toBe('A');
    expect(getLetterGrade(100)).toBe('A');
  });

  it('returns B for 80-89%', () => {
    expect(getLetterGrade(80)).toBe('B');
    expect(getLetterGrade(89)).toBe('B');
  });

  it('returns C for 70-79%', () => {
    expect(getLetterGrade(70)).toBe('C');
    expect(getLetterGrade(79)).toBe('C');
  });

  it('returns D for 60-69%', () => {
    expect(getLetterGrade(60)).toBe('D');
    expect(getLetterGrade(69)).toBe('D');
  });

  it('returns F for below 60%', () => {
    expect(getLetterGrade(59)).toBe('F');
    expect(getLetterGrade(0)).toBe('F');
  });

  it('handles exact boundary values', () => {
    expect(getLetterGrade(90)).toBe('A');
    expect(getLetterGrade(80)).toBe('B');
    expect(getLetterGrade(70)).toBe('C');
    expect(getLetterGrade(60)).toBe('D');
    expect(getLetterGrade(59)).toBe('F');
  });
});

describe('gradeColor', () => {
  it('returns the correct color for each grade', () => {
    expect(gradeColor('A')).toBe('#22c55e');
    expect(gradeColor('B')).toBe('#84cc16');
    expect(gradeColor('C')).toBe('#eab308');
    expect(gradeColor('D')).toBe('#f97316');
    expect(gradeColor('F')).toBe('#ef4444');
  });

  it('returns undefined for invalid grades', () => {
    expect(gradeColor('E')).toBeUndefined();
    expect(gradeColor('X')).toBeUndefined();
  });
});

describe('computePercentage', () => {
  it('computes correct percentage', () => {
    expect(computePercentage(8, 10)).toBe(80);
    expect(computePercentage(20, 20)).toBe(100);
    expect(computePercentage(0, 20)).toBe(0);
  });

  it('rounds to the nearest integer', () => {
    expect(computePercentage(1, 3)).toBe(33); // 33.33... → 33
    expect(computePercentage(2, 3)).toBe(67); // 66.66... → 67
  });

  it('returns 100 when no questions have been answered yet', () => {
    expect(computePercentage(0, 0)).toBe(100);
  });
});
