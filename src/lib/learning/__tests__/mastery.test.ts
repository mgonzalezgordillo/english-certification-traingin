import { describe, it, expect } from 'vitest';
import { calculateMastery, scoreToMasteryStatus } from '../mastery';
import type { MasteryState } from '../../../types';

describe('Mastery Calculation Engine', () => {
  const baseMastery: MasteryState = {
    id: 'v_1',
    status: 'unseen',
    score: 0,
    firstSeenAt: new Date('2026-09-18T10:00:00Z').toISOString(),
    attemptsCount: 0,
    firstAttemptSuccessCount: 0,
    consecutiveCorrect: 0,
  };

  it('correct on single attempt advances score but does not jump directly to reliable or recalled', () => {
    const res = calculateMastery(baseMastery, {
      exerciseType: 'meaning_to_en', // Active recall typing
      firstAttemptCorrect: true,
      eventualCorrect: true,
      attemptsCount: 1,
      hintsUsed: 0,
      timeSpentMs: 3500,
    });

    expect(res.score).toBeGreaterThan(0);
    expect(res.score).toBeLessThanOrEqual(20);
    // Even with perfect answer, single repetition stays at 'seen'
    expect(res.status).toBe('seen');
    expect(res.consecutiveCorrect).toBe(1);
    expect(res.firstAttemptSuccessCount).toBe(1);
  });

  it('preserves first-attempt error penalty even if retry is correct', () => {
    const res = calculateMastery(baseMastery, {
      exerciseType: 'en_to_meaning',
      firstAttemptCorrect: false,
      eventualCorrect: true,
      attemptsCount: 2,
      hintsUsed: 0,
      timeSpentMs: 8000,
    });

    // Score gain on retry is tiny (+3)
    expect(res.score).toBe(3);
    expect(res.status).toBe('seen');
    // Consecutive correct count must be 0 because first attempt failed
    expect(res.consecutiveCorrect).toBe(0);
    expect(res.firstAttemptSuccessCount).toBe(0);
  });

  it('deducts score when hints are used', () => {
    const noHintRes = calculateMastery(baseMastery, {
      exerciseType: 'meaning_to_en',
      firstAttemptCorrect: true,
      eventualCorrect: true,
      attemptsCount: 1,
      hintsUsed: 0,
      timeSpentMs: 4000,
    });

    const withHintRes = calculateMastery(baseMastery, {
      exerciseType: 'meaning_to_en',
      firstAttemptCorrect: true,
      eventualCorrect: true,
      attemptsCount: 1,
      hintsUsed: 2,
      timeSpentMs: 4000,
    });

    expect(withHintRes.score).toBeLessThan(noHintRes.score);
  });

  it('penalizes score on complete failure and resets consecutive streak', () => {
    const intermediateState: MasteryState = {
      ...baseMastery,
      score: 65,
      status: 'recalled',
      consecutiveCorrect: 3,
    };

    const res = calculateMastery(intermediateState, {
      exerciseType: 'context_blank',
      firstAttemptCorrect: false,
      eventualCorrect: false,
      attemptsCount: 2,
      hintsUsed: 1,
      timeSpentMs: 14000,
    });

    expect(res.score).toBe(45);
    expect(res.status).toBe('recognised');
    expect(res.consecutiveCorrect).toBe(0);
  });

  it('scoreToMasteryStatus strictly enforces consecutive correct requirements', () => {
    // High score but low consecutive correct cannot be 'reliable'
    expect(scoreToMasteryStatus(95, 1)).toBe('recognised');
    expect(scoreToMasteryStatus(95, 2)).toBe('recalled');
    expect(scoreToMasteryStatus(95, 4)).toBe('used_correctly');
    expect(scoreToMasteryStatus(95, 5)).toBe('reliable');
    expect(scoreToMasteryStatus(0, 0)).toBe('unseen');
  });
});
