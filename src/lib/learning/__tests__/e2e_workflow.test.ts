import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  db,
  initializeDatabase,
  getVocabularyWithProgress,
  recordVocabularyAttemptAndProgress,
  saveStudySession,
  getVocabularyMetrics,
  getReviewQueueSummary,
} from '../../db';
import { selectSessionItems } from '../adaptive';
import { generateExercise, normalizeAnswer } from '../exercises';
import { classifyVocabularyError } from '../errors';
import type { ExerciseAttempt } from '../../../types';

describe('Vocabulary E2E Learning & SRS Workflow Integration', () => {
  beforeEach(async () => {
    await db.vocabularyMastery.clear();
    await db.reviewStates.clear();
    await db.exerciseAttempts.clear();
    await db.studySessions.clear();
    await initializeDatabase();
  });

  it('verifies complete lifecycle: library seed, adaptive selection, strict grading, SRS update, session save, and dashboard metrics', async () => {
    // 1. Initial state check
    const initialVocab = await getVocabularyWithProgress();
    expect(initialVocab.length).toBe(120);

    const initialSummary = await getReviewQueueSummary();
    expect(initialSummary.totalCount).toBe(120);
    expect(initialSummary.unseenCount).toBe(120);
    expect(initialSummary.weakCount).toBe(0);

    // 2. Adaptive item selection for a Quick session (10 items)
    const sessionItems = selectSessionItems(initialVocab, {
      itemCount: 10,
      mode: 'smart_mix',
    });
    expect(sessionItems.length).toBe(10);

    // 3. Question 1: Clean First-Attempt Success (Active Recall Typing)
    const item1 = sessionItems[0];
    const rawPool = initialVocab.map((v) => v.item);
    const ex1 = generateExercise(item1.item, rawPool, 'meaning_to_en');

    expect(ex1.type).toBe('meaning_to_en');
    expect(normalizeAnswer(ex1.correctAnswer)).toBe(normalizeAnswer(item1.item.word));

    const attempt1: ExerciseAttempt = {
      id: 'att_1',
      exerciseId: ex1.id,
      userId: 'default_user',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      attempts: [
        {
          timestamp: new Date().toISOString(),
          selectedAnswer: ex1.correctAnswer,
          isCorrect: true,
          timeSpentMs: 3200,
          hintsRequested: 0,
        },
      ],
      finalCorrect: true,
    };

    const res1 = await recordVocabularyAttemptAndProgress({
      attempt: attempt1,
      vocabularyId: item1.item.id,
      srsInput: {
        firstAttemptCorrect: true,
        eventualCorrect: true,
        hintsUsed: 0,
        timeSpentMs: 3200,
        attemptsCount: 1,
      },
      masteryInput: {
        exerciseType: 'meaning_to_en',
        firstAttemptCorrect: true,
        eventualCorrect: true,
        attemptsCount: 1,
        hintsUsed: 0,
        timeSpentMs: 3200,
      },
    });

    expect(res1.nextMastery.score).toBeGreaterThanOrEqual(16);
    expect(res1.nextMastery.status).toBe('seen');
    expect(res1.nextMastery.consecutiveCorrect).toBe(1);
    expect(res1.nextReview.repetitions).toBe(1);
    expect(res1.nextReview.interval).toBe(2); // fast recall bonus
    expect(res1.nextReview.lapses).toBe(0);

    // 4. Question 2: First Attempt Wrong -> Hint Requested -> Second Attempt Correct
    const item2 = sessionItems[1];
    const ex2 = generateExercise(item2.item, rawPool, 'en_to_meaning');

    const wrongAnswer = 'Completely wrong meaning';
    const errClass2 = classifyVocabularyError(ex2, wrongAnswer, 4500, item2.review);

    const attempt2: ExerciseAttempt = {
      id: 'att_2',
      exerciseId: ex2.id,
      userId: 'default_user',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      attempts: [
        {
          timestamp: new Date().toISOString(),
          selectedAnswer: wrongAnswer,
          isCorrect: false,
          timeSpentMs: 4500,
          hintsRequested: 0,
        },
        {
          timestamp: new Date().toISOString(),
          selectedAnswer: ex2.correctAnswer,
          isCorrect: true,
          timeSpentMs: 8000,
          hintsRequested: 1,
        },
      ],
      finalCorrect: true,
      errorClassification: errClass2,
    };

    const res2 = await recordVocabularyAttemptAndProgress({
      attempt: attempt2,
      vocabularyId: item2.item.id,
      srsInput: {
        firstAttemptCorrect: false,
        eventualCorrect: true,
        hintsUsed: 1,
        timeSpentMs: 12500,
        attemptsCount: 2,
      },
      masteryInput: {
        exerciseType: 'en_to_meaning',
        firstAttemptCorrect: false,
        eventualCorrect: true,
        attemptsCount: 2,
        hintsUsed: 1,
        timeSpentMs: 12500,
      },
    });

    // Verify first-error preservation:
    // Score gain is dampened to 1 pt
    expect(res2.nextMastery.score).toBe(1);
    // Consecutive correct is 0
    expect(res2.nextMastery.consecutiveCorrect).toBe(0);
    // SRS interval is conservative (1 day)
    expect(res2.nextReview.interval).toBe(1);
    expect(res2.nextReview.consecutiveCorrect).toBe(0);

    // 5. Question 3: Complete Failure (Attempt 1 and 2 wrong)
    const item3 = sessionItems[2];
    const ex3 = generateExercise(item3.item, rawPool, 'context_blank');

    const attempt3: ExerciseAttempt = {
      id: 'att_3',
      exerciseId: ex3.id,
      userId: 'default_user',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      attempts: [
        {
          timestamp: new Date().toISOString(),
          selectedAnswer: 'wrong1',
          isCorrect: false,
          timeSpentMs: 5000,
          hintsRequested: 0,
        },
        {
          timestamp: new Date().toISOString(),
          selectedAnswer: 'wrong2',
          isCorrect: false,
          timeSpentMs: 6000,
          hintsRequested: 1,
        },
      ],
      finalCorrect: false,
      errorClassification: { category: 'vocabulary_gap', confidence: 0.8 },
    };

    const res3 = await recordVocabularyAttemptAndProgress({
      attempt: attempt3,
      vocabularyId: item3.item.id,
      srsInput: {
        firstAttemptCorrect: false,
        eventualCorrect: false,
        hintsUsed: 1,
        timeSpentMs: 11000,
        attemptsCount: 2,
      },
      masteryInput: {
        exerciseType: 'context_blank',
        firstAttemptCorrect: false,
        eventualCorrect: false,
        attemptsCount: 2,
        hintsUsed: 1,
        timeSpentMs: 11000,
      },
    });

    expect(res3.nextReview.lapses).toBe(1);
    expect(res3.nextReview.repetitions).toBe(0);
    expect(res3.nextReview.interval).toBe(1);

    // 6. Complete and save the session
    await saveStudySession({
      id: 'sess_1',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationMs: 45000,
      exercisesAttempted: ['att_1', 'att_2', 'att_3'],
    });

    // 7. Verify Dashboard Analytics metrics based on real Dexie data
    const metrics = await getVocabularyMetrics();
    expect(metrics.totalWords).toBe(120);
    expect(metrics.encounteredWords).toBe(3);
    expect(metrics.weakWords).toBe(1); // item 3 has lapse 1
    expect(metrics.totalAttempts).toBe(3);
    // 1 out of 3 attempts was first-attempt correct -> 33%
    expect(metrics.firstAttemptAccuracyRate).toBe(33);
    expect(metrics.recentSessions.length).toBe(1);

    // 8. Verify Review Queue Summary reflects updated SRS state
    const summaryAfter = await getReviewQueueSummary();
    expect(summaryAfter.unseenCount).toBe(117);
    expect(summaryAfter.weakCount).toBe(1);
  });
});
