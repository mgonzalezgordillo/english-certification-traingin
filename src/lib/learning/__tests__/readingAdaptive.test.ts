import { describe, it, expect } from 'vitest';
import {
  selectReadingActivities,
  selectTopReadingRecommendation,
  getCefrDifficultyRange,
} from '../readingAdaptive';
import type {
  GenericExercise,
  ReadingProgressRecord,
  ExerciseSessionResult,
} from '../../../types/exercise';
import type { UserProfile } from '../../../types';

describe('Reading Adaptive Selection Helper', () => {
  const mockActivities: GenericExercise[] = [
    {
      id: 'act_b1_short',
      skill: 'Reading',
      cefrLevel: 'B1',
      difficulty: 4,
      taskType: 'short_message',
      title: 'B1 Short Message',
      instructions: 'Inst',
      conceptTags: ['detail'],
      estimatedDurationSec: 60,
      questions: [],
    },
    {
      id: 'act_b1_cloze',
      skill: 'Reading',
      cefrLevel: 'B1',
      difficulty: 5,
      taskType: 'multiple_choice_cloze',
      title: 'B1 Cloze',
      instructions: 'Inst',
      conceptTags: ['vocabulary'],
      estimatedDurationSec: 120,
      questions: [],
    },
    {
      id: 'act_b2_passage',
      skill: 'Reading',
      cefrLevel: 'B2',
      difficulty: 8,
      taskType: 'long_passage',
      title: 'B2 Passage',
      instructions: 'Inst',
      conceptTags: ['inference'],
      estimatedDurationSec: 240,
      questions: [],
    },
  ];

  it('maps CEFR levels to appropriate numerical difficulty ranges', () => {
    expect(getCefrDifficultyRange('A2').default).toBe(2);
    expect(getCefrDifficultyRange('B1').default).toBe(5);
    expect(getCefrDifficultyRange('B2').default).toBe(8);
  });

  it('prioritizes unseen activities over already mastered activities', () => {
    const progressMap = new Map<string, ReadingProgressRecord>([
      [
        'act_b1_short',
        {
          id: 'act_b1_short',
          exerciseId: 'act_b1_short',
          cefrLevel: 'B1',
          difficulty: 4,
          status: 'completed',
          bestFirstAttemptAccuracy: 100, // Mastered
          lastAttemptAccuracy: 100,
          lastAttemptAt: new Date().toISOString(),
          attemptsCount: 2,
        },
      ],
    ]);

    const scored = selectReadingActivities(mockActivities, progressMap, [], undefined, {
      targetCefr: 'B1',
    });

    // act_b1_cloze is unseen, so it should rank higher than act_b1_short
    expect(scored[0].activity.id).toBe('act_b1_cloze');
  });

  it('boosts priority for task types where learner had weak performance', () => {
    const recentResults: ExerciseSessionResult[] = [
      {
        id: 'res1',
        exerciseId: 'some_old_cloze',
        skill: 'Reading',
        taskType: 'multiple_choice_cloze',
        cefrLevel: 'B1',
        difficulty: 5,
        mode: 'training',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        totalTimeMs: 30000,
        questionAttempts: {},
        totalQuestions: 4,
        firstAttemptScore: 1, // 25% accuracy -> Weak task type!
        finalScore: 3,
        firstAttemptAccuracy: 25,
        finalAccuracy: 75,
        inferredErrors: [],
      },
    ];

    const progressMap = new Map<string, ReadingProgressRecord>();
    const top = selectTopReadingRecommendation(
      mockActivities,
      progressMap,
      recentResults,
      undefined,
      { targetCefr: 'B1' }
    );

    expect(top).not.toBeNull();
    expect(top?.activity.taskType).toBe('multiple_choice_cloze');
    expect(top?.reason).toContain('Refuerzo específico');
  });

  it('graduates difficulty (+1) when recent accuracy is 80% or higher', () => {
    const userProfile: UserProfile = {
      id: 'default_user',
      estimatedGlobalLevel: 'B1',
      skills: {
        Reading: { skill: 'Reading', level: 'B1', confidence: 0.8 },
        Listening: { skill: 'Listening', level: 'B1', confidence: 0.1 },
        Writing: { skill: 'Writing', level: 'B1', confidence: 0.1 },
        Speaking: { skill: 'Speaking', level: 'B1', confidence: 0.1 },
        Grammar: { skill: 'Grammar', level: 'B1', confidence: 0.1 },
        Vocabulary: { skill: 'Vocabulary', level: 'B1', confidence: 0.1 },
      },
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    const excellingResults: ExerciseSessionResult[] = [
      {
        id: 'r1',
        exerciseId: 'ex1',
        skill: 'Reading',
        taskType: 'short_message',
        cefrLevel: 'B1',
        difficulty: 5,
        mode: 'training',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        totalTimeMs: 20000,
        questionAttempts: {},
        totalQuestions: 2,
        firstAttemptScore: 2,
        finalScore: 2,
        firstAttemptAccuracy: 100,
        finalAccuracy: 100,
        inferredErrors: [],
      },
      {
        id: 'r2',
        exerciseId: 'ex2',
        skill: 'Reading',
        taskType: 'short_message',
        cefrLevel: 'B1',
        difficulty: 5,
        mode: 'training',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        totalTimeMs: 20000,
        questionAttempts: {},
        totalQuestions: 2,
        firstAttemptScore: 2,
        finalScore: 2,
        firstAttemptAccuracy: 100,
        finalAccuracy: 100,
        inferredErrors: [],
      },
    ];

    const scored = selectReadingActivities(
      mockActivities,
      new Map(),
      excellingResults,
      userProfile,
      { targetCefr: 'B1' }
    );

    // Difficulty baseline for B1 is 5; with +1 modifier it targets 6. act_b1_cloze has difficulty 5 (distance 1),
    // whereas act_b1_short has difficulty 4 (distance 2). So cloze gets lower difficulty penalty.
    expect(scored[0].activity.difficulty).toBeGreaterThanOrEqual(5);
  });
});
