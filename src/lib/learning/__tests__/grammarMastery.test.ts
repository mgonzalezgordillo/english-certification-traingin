import { describe, it, expect } from 'vitest';
import {
  calculateGrammarMastery,
  calculateGrammarStrength,
  scoreToGrammarStatus,
} from '../grammarMastery';

describe('Grammar Mastery Engine', () => {
  it('conservatively increases mastery on first-attempt correct', () => {
    const initial = { id: 'g_pres_simple', score: 0, attemptsCount: 0, consecutiveCorrect: 0 };
    const result = calculateGrammarMastery(initial, {
      exerciseType: 'choose_form',
      firstAttemptCorrect: true,
      eventualCorrect: true,
      attemptsCount: 1,
      hintsUsed: 0,
      timeSpentMs: 4000,
    });

    // Score increases modestly (+10 base + 2 speed bonus = 12)
    expect(result.score).toBe(12);
    expect(result.status).toBe('seen');
    expect(result.strengthState).toBe('medium');
    expect(result.consecutiveCorrect).toBe(1);
    expect(result.firstAttemptSuccessCount).toBe(1);
  });

  it('preserves first-attempt error and yields minimal gain on retry success', () => {
    const initial = {
      id: 'g_cond_second',
      score: 40,
      attemptsCount: 2,
      firstAttemptSuccessCount: 1,
      consecutiveCorrect: 1,
    };
    const result = calculateGrammarMastery(initial, {
      exerciseType: 'fill_in_the_blank',
      firstAttemptCorrect: false,
      eventualCorrect: true,
      attemptsCount: 2,
      hintsUsed: 0,
      timeSpentMs: 8000,
    });

    // Only minimal consolidation (+3 for production)
    expect(result.score).toBe(43);
    // Consecutive correct streak is reset because first attempt failed!
    expect(result.consecutiveCorrect).toBe(0);
    // First attempt successes not incremented
    expect(result.firstAttemptSuccessCount).toBe(1);
    expect(result.attemptsCount).toBe(3);
  });

  it('penalizes mastery progression when hints are requested', () => {
    const initial = { id: 'g_cond_third', score: 30, attemptsCount: 1, consecutiveCorrect: 1 };
    const withHints = calculateGrammarMastery(initial, {
      exerciseType: 'choose_form',
      firstAttemptCorrect: true,
      eventualCorrect: true,
      attemptsCount: 1,
      hintsUsed: 2, // 2 hints used (-8 penalty)
      timeSpentMs: 6000,
    });

    const withoutHints = calculateGrammarMastery(initial, {
      exerciseType: 'choose_form',
      firstAttemptCorrect: true,
      eventualCorrect: true,
      attemptsCount: 1,
      hintsUsed: 0,
      timeSpentMs: 6000,
    });

    expect(withHints.score).toBeLessThan(withoutHints.score);
    expect(withoutHints.score - initial.score).toBe(12);
    expect(withHints.score - initial.score).toBe(2); // Capped at minimum positive gain
  });

  it('heavily penalizes repeated failure and resets consecutive streak', () => {
    const initial = {
      id: 'g_passive_adv',
      score: 65,
      attemptsCount: 4,
      firstAttemptSuccessCount: 3,
      consecutiveCorrect: 3,
    };
    const result = calculateGrammarMastery(initial, {
      exerciseType: 'sentence_transformation',
      firstAttemptCorrect: false,
      eventualCorrect: false,
      attemptsCount: 2,
      hintsUsed: 1,
      timeSpentMs: 15000,
    });

    expect(result.score).toBeLessThan(initial.score);
    expect(result.score).toBe(65 - 18); // -18 penalty for failure when score > 60
    expect(result.consecutiveCorrect).toBe(0);
    expect(result.strengthState).toBe('weak');
  });

  it('requires proven consistency before achieving strong or reliable status', () => {
    // Single high score cannot be strong without enough attempts & consecutive successes
    expect(calculateGrammarStrength(85, 1, 1, 1)).toBe('medium');
    expect(calculateGrammarStrength(85, 4, 4, 4)).toBe('strong');

    // Status mapping: reliable requires score >= 90 AND consecutiveCorrect >= 5
    expect(scoreToGrammarStatus(92, 2)).toBe('recalled');
    expect(scoreToGrammarStatus(92, 5)).toBe('reliable');
  });
});
