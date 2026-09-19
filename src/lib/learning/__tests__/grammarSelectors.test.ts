import { describe, it, expect } from 'vitest';
import {
  getWeakestGrammarConcepts,
  getStrongestGrammarConcepts,
  getGrammarMasteryByCefr,
  getGrammarErrorDistribution,
  getRecentGrammarAccuracy,
} from '../grammarSelectors';
import type { GrammarWithProgress, ExerciseAttempt } from '../../../types';
import { seedGrammar } from '../../../data/seedGrammar';

describe('Grammar Selectors and Analytics', () => {
  const mockConcepts: GrammarWithProgress[] = [
    {
      concept: seedGrammar.find((c) => c.id === 'g_pres_simple')!, // A2
      mastery: {
        id: 'g_pres_simple',
        status: 'reliable',
        score: 92,
        firstSeenAt: '2026-01-01',
        attemptsCount: 6,
        firstAttemptSuccessCount: 6,
        consecutiveCorrect: 6,
      },
      exerciseCount: 3,
      strengthState: 'strong',
      errorCount: 0,
    },
    {
      concept: seedGrammar.find((c) => c.id === 'g_pres_perf')!, // B1
      mastery: {
        id: 'g_pres_perf',
        status: 'recognised',
        score: 35,
        firstSeenAt: '2026-01-02',
        attemptsCount: 4,
        firstAttemptSuccessCount: 1,
        consecutiveCorrect: 0,
      },
      exerciseCount: 3,
      strengthState: 'weak',
      errorCount: 3,
    },
    {
      concept: seedGrammar.find((c) => c.id === 'g_cond_third')!, // B2
      mastery: {
        id: 'g_cond_third',
        status: 'used_correctly',
        score: 82,
        firstSeenAt: '2026-01-03',
        attemptsCount: 5,
        firstAttemptSuccessCount: 4,
        consecutiveCorrect: 4,
      },
      exerciseCount: 2,
      strengthState: 'strong',
      errorCount: 1,
    },
  ];

  it('prioritizes weakest concepts correctly', () => {
    const weakest = getWeakestGrammarConcepts(mockConcepts, 2);
    expect(weakest.length).toBe(2);
    expect(weakest[0].concept.id).toBe('g_pres_perf');
    expect(weakest[0].strengthState).toBe('weak');
  });

  it('identifies strongest concepts with proven retention', () => {
    const strongest = getStrongestGrammarConcepts(mockConcepts, 2);
    expect(strongest.length).toBe(2);
    expect(strongest[0].concept.id).toBe('g_pres_simple');
    expect(strongest[1].concept.id).toBe('g_cond_third');
  });

  it('aggregates mastery by CEFR level without mixing global scores', () => {
    const cefrMetrics = getGrammarMasteryByCefr(mockConcepts);
    const a2 = cefrMetrics.find((m) => m.level === 'A2');
    const b1 = cefrMetrics.find((m) => m.level === 'B1');
    const b2 = cefrMetrics.find((m) => m.level === 'B2');

    expect(a2?.averageScore).toBe(92);
    expect(b1?.averageScore).toBe(35);
    expect(b2?.averageScore).toBe(82);

    // Shows user is strong in B2 Third Conditional but weak in B1 Present Perfect!
    expect(b2?.strongCount).toBe(1);
    expect(b1?.weakCount).toBe(1);
  });

  it('computes error distribution and recent accuracy', () => {
    const mockAttempts: ExerciseAttempt[] = [
      {
        id: 'att_1',
        exerciseId: 'ge_ct_1',
        userId: 'default_user',
        startedAt: '2026-01-01',
        attempts: [{ timestamp: '2026-01-01', isCorrect: false, timeSpentMs: 5000, hintsRequested: 0 }],
        finalCorrect: false,
        errorClassification: { category: 'conditional_structure', confidence: 0.9 },
      },
      {
        id: 'att_2',
        exerciseId: 'ge_ct_2',
        userId: 'default_user',
        startedAt: '2026-01-01',
        attempts: [{ timestamp: '2026-01-01', isCorrect: true, timeSpentMs: 4000, hintsRequested: 0 }],
        finalCorrect: true,
      },
    ];

    const dist = getGrammarErrorDistribution(mockAttempts);
    expect(dist.length).toBe(1);
    expect(dist[0].category).toBe('conditional_structure');
    expect(dist[0].count).toBe(1);

    const accuracy = getRecentGrammarAccuracy(mockAttempts);
    expect(accuracy.firstAttemptAccuracy).toBe(50);
    expect(accuracy.eventualAccuracy).toBe(50);
  });
});
