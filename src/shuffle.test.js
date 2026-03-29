import { describe, expect, it } from 'vitest';

import { shuffle } from './parseQuiz';

describe('Fisher-Yates shuffle', () => {
  it('returns a new array (does not mutate the original)', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    const result = shuffle(original);
    expect(original).toEqual(copy);
    expect(result).not.toBe(original);
  });

  it('preserves all elements (same length, same set)', () => {
    const input = [10, 20, 30, 40, 50];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort((a, b) => a - b)).toEqual(
      input.sort((a, b) => a - b),
    );
  });

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('produces a roughly uniform distribution over many runs', () => {
    // For a 4-element array, run 10,000 shuffles and count how often
    // each element lands in each position. Chi-squared test for uniformity.
    const n = 4;
    const runs = 10_000;
    const expected = runs / n; // 2500

    // counts[position][value] = how many times value landed in that position
    const counts = Array.from({ length: n }, () =>
      Object.fromEntries(Array.from({ length: n }, (_, i) => [i, 0])),
    );

    const input = [0, 1, 2, 3];
    for (let r = 0; r < runs; r++) {
      const result = shuffle(input);
      for (let pos = 0; pos < n; pos++) {
        counts[pos][result[pos]]++;
      }
    }

    // Chi-squared test per position. With df=3 (n-1), p<0.001 threshold is 16.27.
    // We use a generous threshold of 20 to avoid flaky tests.
    for (let pos = 0; pos < n; pos++) {
      let chiSquared = 0;
      for (let val = 0; val < n; val++) {
        const diff = counts[pos][val] - expected;
        chiSquared += (diff * diff) / expected;
      }
      expect(chiSquared).toBeLessThan(20);
    }
  });

  it('does not always return the same order (not a no-op)', () => {
    // With 10 elements, the probability of the shuffle returning the
    // exact same order is 1/10! ≈ 2.8e-7. Running 5 times makes this
    // effectively impossible.
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let allSame = true;
    for (let i = 0; i < 5; i++) {
      const result = shuffle(input);
      if (result.some((v, idx) => v !== input[idx])) {
        allSame = false;
        break;
      }
    }
    expect(allSame).toBe(false);
  });
});
