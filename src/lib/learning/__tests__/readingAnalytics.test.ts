import { describe, it, expect } from 'vitest';
import {
  calculateReadingAccuracyOverTime,
  calculateFirstAttemptAccuracy,
  calculatePerformanceByTaskType,
  calculatePerformanceByCEFR,
  calculateAverageResponseTime,
  identifyWeakErrorCategories,
} from '../readingAnalytics';
import type { ExerciseSessionResult } from '../../../types/exercise';

describe('Reading Analytics Selectors and Helpers', () => {
  const mockResults: ExerciseSessionResult[] = [
    {
      id: 'res1',
      exerciseId: 'ex1',
      skill: 'Reading',
      taskType: 'short_message',
      cefrLevel: 'A2',
      difficulty: 2,
      mode: 'training',
      startedAt: '2026-09-01T10:00:00.000Z',
      completedAt: '2026-09-01T10:02:00.000Z',
      totalTimeMs: 120000,
      questionAttempts: {},
      totalQuestions: 2,
      firstAttemptScore: 2,
      finalScore: 2,
      firstAttemptAccuracy: 100,
      finalAccuracy: 100,
      inferredErrors: [],
    },
    {
      id: 'res2',
      exerciseId: 'ex2',
      skill: 'Reading',
      taskType: 'multiple_choice_cloze',
      cefrLevel: 'B1',
      difficulty: 5,
      mode: 'training',
      startedAt: '2026-09-02T11:00:00.000Z',
      completedAt: '2026-09-02T11:03:00.000Z',
      totalTimeMs: 180000,
      questionAttempts: {},
      totalQuestions: 3,
      firstAttemptScore: 1,
      finalScore: 3,
      firstAttemptAccuracy: 33,
      finalAccuracy: 100,
      inferredErrors: [
        { category: 'vocabulary_comprehension', confidence: 0.8 },
        { category: 'distractor_confusion', confidence: 0.85 },
      ],
    },
  ];

  it('calculates chronological accuracy over time', () => {
    const timeData = calculateReadingAccuracyOverTime(mockResults);
    expect(timeData).toHaveLength(2);
    expect(timeData[0].firstAttemptAccuracy).toBe(100);
    expect(timeData[1].firstAttemptAccuracy).toBe(33);
  });

  it('calculates overall first-attempt accuracy correctly', () => {
    // Total questions: 2 + 3 = 5
    // First correct: 2 + 1 = 3 -> 3/5 = 60%
    const acc = calculateFirstAttemptAccuracy(mockResults);
    expect(acc).toBe(60);
  });

  it('calculates performance grouped by task type', () => {
    const taskBreakdown = calculatePerformanceByTaskType(mockResults);
    expect(taskBreakdown).toHaveLength(2);

    const shortMsg = taskBreakdown.find((t) => t.taskType === 'short_message');
    expect(shortMsg?.firstAttemptAccuracy).toBe(100);

    const cloze = taskBreakdown.find((t) => t.taskType === 'multiple_choice_cloze');
    expect(cloze?.firstAttemptAccuracy).toBe(33);
  });

  it('calculates performance grouped by CEFR level', () => {
    const cefrBreakdown = calculatePerformanceByCEFR(mockResults);
    const a2 = cefrBreakdown.find((c) => c.cefrLevel === 'A2');
    const b1 = cefrBreakdown.find((c) => c.cefrLevel === 'B1');

    expect(a2?.firstAttemptAccuracy).toBe(100);
    expect(b1?.firstAttemptAccuracy).toBe(33);
  });

  it('calculates average response time in seconds per question', () => {
    // Total time: 120000 + 180000 = 300000ms = 300s
    // Total questions: 5
    // 300s / 5 = 60s
    const avgTime = calculateAverageResponseTime(mockResults);
    expect(avgTime).toBe(60);
  });

  it('identifies and ranks weak error categories', () => {
    const errors = identifyWeakErrorCategories(mockResults);
    expect(errors).toHaveLength(2);
    expect(errors[0].count).toBe(1);
    expect(errors[0].percentage).toBe(50);
  });
});
