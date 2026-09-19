import { describe, it, expect } from 'vitest';
import { calculateNextReview, DEFAULT_EASE_FACTOR, MIN_EASE_FACTOR } from '../srs';
import type { ReviewState } from '../../../types';

describe('SRS Calculation Engine', () => {
  const baseState: ReviewState = {
    id: 'v_1',
    nextReviewDate: new Date('2026-09-18T12:00:00Z').toISOString(),
    interval: 1,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    lapses: 0,
    consecutiveCorrect: 0,
  };

  const fixedNow = new Date('2026-09-18T12:00:00Z');

  it('correct on first attempt expands intervals conservatively', () => {
    // 1st clean repetition
    const res1 = calculateNextReview(
      baseState,
      {
        firstAttemptCorrect: true,
        eventualCorrect: true,
        hintsUsed: 0,
        timeSpentMs: 4000,
        attemptsCount: 1,
      },
      fixedNow
    );

    expect(res1.repetitions).toBe(1);
    expect(res1.consecutiveCorrect).toBe(1);
    expect(res1.interval).toBe(2); // Fast recall bonus = 2 days
    expect(res1.lapses).toBe(0);

    // 2nd clean repetition
    const state2: ReviewState = { ...baseState, ...res1 };
    const res2 = calculateNextReview(
      state2,
      {
        firstAttemptCorrect: true,
        eventualCorrect: true,
        hintsUsed: 0,
        timeSpentMs: 3000,
        attemptsCount: 1,
      },
      fixedNow
    );

    expect(res2.repetitions).toBe(2);
    expect(res2.consecutiveCorrect).toBe(2);
    expect(res2.interval).toBe(4);

    // 3rd clean repetition
    const state3: ReviewState = { ...baseState, ...res2 };
    const res3 = calculateNextReview(
      state3,
      {
        firstAttemptCorrect: true,
        eventualCorrect: true,
        hintsUsed: 0,
        timeSpentMs: 7000,
        attemptsCount: 1,
      },
      fixedNow
    );

    expect(res3.repetitions).toBe(3);
    expect(res3.interval).toBe(7);
  });

  it('correct after one failure preserves error signal and keeps interval short', () => {
    const priorState: ReviewState = {
      ...baseState,
      interval: 7,
      repetitions: 3,
      consecutiveCorrect: 3,
    };

    const res = calculateNextReview(
      priorState,
      {
        firstAttemptCorrect: false,
        eventualCorrect: true,
        hintsUsed: 0,
        timeSpentMs: 12000,
        attemptsCount: 2,
      },
      fixedNow
    );

    // Error occurred on first attempt: consecutive correct resets
    expect(res.consecutiveCorrect).toBe(0);
    // Interval remains very conservative (2 days max) despite prior 7-day interval
    expect(res.interval).toBe(2);
    // Ease factor takes a penalty
    expect(res.easeFactor).toBeLessThan(priorState.easeFactor);
  });

  it('correct with hint reduces interval and penalizes ease factor', () => {
    const res = calculateNextReview(
      baseState,
      {
        firstAttemptCorrect: true,
        eventualCorrect: true,
        hintsUsed: 2,
        timeSpentMs: 15000,
        attemptsCount: 1,
      },
      fixedNow
    );

    expect(res.consecutiveCorrect).toBe(0);
    expect(res.interval).toBe(1);
    expect(res.easeFactor).toBeLessThan(DEFAULT_EASE_FACTOR);
  });

  it('complete failure resets repetitions, increments lapses, and drops interval to 1 day', () => {
    const strongState: ReviewState = {
      ...baseState,
      interval: 14,
      repetitions: 4,
      consecutiveCorrect: 4,
      easeFactor: 2.6,
      lapses: 0,
    };

    const res = calculateNextReview(
      strongState,
      {
        firstAttemptCorrect: false,
        eventualCorrect: false,
        hintsUsed: 1,
        timeSpentMs: 20000,
        attemptsCount: 2,
      },
      fixedNow
    );

    expect(res.repetitions).toBe(0);
    expect(res.consecutiveCorrect).toBe(0);
    expect(res.lapses).toBe(1);
    expect(res.interval).toBe(1);
    expect(res.easeFactor).toBe(2.4);
  });

  it('never drops ease factor below MIN_EASE_FACTOR', () => {
    const degradedState: ReviewState = {
      ...baseState,
      easeFactor: 1.35,
    };

    const res = calculateNextReview(
      degradedState,
      {
        firstAttemptCorrect: false,
        eventualCorrect: false,
        hintsUsed: 0,
        timeSpentMs: 10000,
        attemptsCount: 2,
      },
      fixedNow
    );

    expect(res.easeFactor).toBe(MIN_EASE_FACTOR);
  });
});
