import Dexie, { type Table } from 'dexie';
import type {
  UserProfile,
  MasteryState,
  ReviewState,
  ExerciseAttempt,
  ExamAttempt,
  StudySession,
  VocabularyWithProgress,
  MasteryStatus,
  ReadingProgressRecord,
  ExerciseSessionResult,
  ExamAttemptState,
  GrammarWithProgress,
  ListeningAttempt,
  SpeakingAttempt,
  WritingAttempt,
} from '../types';
import { seedVocabulary } from '../data/seedVocabulary';
import { seedGrammar } from '../data/seedGrammar';
import { seedGrammarExercises } from '../data/seedGrammarExercises';
import { calculateNextReview, DEFAULT_EASE_FACTOR, type SRSEvaluationInput } from './learning/srs';
import { calculateMastery, type MasteryEvaluationInput } from './learning/mastery';
import {
  calculateGrammarMastery,
  calculateGrammarStrength,
  type GrammarMasteryEvaluationInput,
} from './learning/grammarMastery';

export class LinguaSkillDatabase extends Dexie {
  userProfile!: Table<UserProfile, string>;
  vocabularyMastery!: Table<MasteryState, string>;
  grammarMastery!: Table<MasteryState, string>;
  reviewStates!: Table<ReviewState, string>;
  exerciseAttempts!: Table<ExerciseAttempt, string>;
  examAttempts!: Table<ExamAttempt, string>;
  studySessions!: Table<StudySession, string>;
  readingProgress!: Table<ReadingProgressRecord, string>;
  exerciseSessionResults!: Table<ExerciseSessionResult, string>;
  examState!: Table<ExamAttemptState, string>;
  listeningAttempts!: Table<ListeningAttempt, string>;
  speakingAttempts!: Table<SpeakingAttempt, string>;
  writingAttempts!: Table<WritingAttempt, string>;

  constructor() {
    super('LinguaSkillDatabase');

    // Version 1 (Baseline)
    this.version(1).stores({
      userProfile: 'id',
      vocabularyMastery: 'id, status, score, nextReviewDate',
      grammarMastery: 'id, status, score',
      reviewStates: 'id, nextReviewDate',
      exerciseAttempts: 'id, exerciseId, startedAt',
      examAttempts: 'id, examId, startedAt',
      studySessions: 'id, startedAt',
    });

    // Version 2 (Extended SRS & Mastery indexes)
    this.version(2).stores({
      vocabularyMastery: 'id, status, score, lastReviewedAt',
      reviewStates: 'id, nextReviewDate, interval, lapses, repetitions',
      studySessions: 'id, startedAt, endedAt',
    });

    // Version 3 (Reading progress and structured exercise session results)
    this.version(3).stores({
      readingProgress: 'id, exerciseId, cefrLevel, status, lastAttemptAt',
      exerciseSessionResults: 'id, exerciseId, skill, mode, startedAt',
    });

    // Version 4 (Exam state tracking)
    this.version(4).stores({
      examState: 'id, examId, userId, startedAt',
      examAttempts: 'id, examId, userId, startedAt',
    });

    // Version 5 (productive skills and listening history)
    this.version(5).stores({
      listeningAttempts: 'id, exerciseId, cefrLevel, completedAt',
      speakingAttempts: 'id, promptId, cefrLevel, completedAt',
      writingAttempts: 'id, promptId, cefrLevel, completedAt',
    });
  }
}

export const db = new LinguaSkillDatabase();

/**
 * Ensures user profile and initial vocabulary progress entries exist in Dexie.
 */
export async function initializeDatabase(): Promise<void> {
  // 1. User Profile
  const profileCount = await db.userProfile.count();
  if (profileCount === 0) {
    await db.userProfile.put({
      id: 'default_user',
      estimatedGlobalLevel: 'A2',
      skills: {
        Reading: { skill: 'Reading', level: 'A2', confidence: 0.1 },
        Listening: { skill: 'Listening', level: 'A2', confidence: 0.1 },
        Writing: { skill: 'Writing', level: 'A2', confidence: 0.1 },
        Speaking: { skill: 'Speaking', level: 'A2', confidence: 0.1 },
        Grammar: { skill: 'Grammar', level: 'A2', confidence: 0.1 },
        Vocabulary: { skill: 'Vocabulary', level: 'A2', confidence: 0.1 },
      },
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    });
  }

  // 2. Initialize any missing seed vocabulary items in Dexie
  const now = new Date().toISOString();
  const existingMasteryIds = new Set(await db.vocabularyMastery.toCollection().primaryKeys());

  const newMasteryEntries: MasteryState[] = [];
  const newReviewEntries: ReviewState[] = [];

  for (const item of seedVocabulary) {
    if (!existingMasteryIds.has(item.id)) {
      newMasteryEntries.push({
        id: item.id,
        status: 'unseen',
        score: 0,
        firstSeenAt: now,
        attemptsCount: 0,
        firstAttemptSuccessCount: 0,
        consecutiveCorrect: 0,
      });
      newReviewEntries.push({
        id: item.id,
        nextReviewDate: now,
        interval: 0,
        easeFactor: DEFAULT_EASE_FACTOR,
        repetitions: 0,
        lapses: 0,
        consecutiveCorrect: 0,
      });
    }
  }

  if (newMasteryEntries.length > 0) {
    // bulkPut keeps initialization idempotent when multiple tabs start simultaneously.
    await db.vocabularyMastery.bulkPut(newMasteryEntries);
    await db.reviewStates.bulkPut(newReviewEntries);
  }

  // 3. Initialize any missing seed grammar items in Dexie
  const existingGrammarMasteryIds = new Set(await db.grammarMastery.toCollection().primaryKeys());
  const newGrammarMasteryEntries: MasteryState[] = [];

  for (const concept of seedGrammar) {
    if (!existingGrammarMasteryIds.has(concept.id)) {
      newGrammarMasteryEntries.push({
        id: concept.id,
        status: 'unseen',
        score: 0,
        firstSeenAt: now,
        attemptsCount: 0,
        firstAttemptSuccessCount: 0,
        consecutiveCorrect: 0,
      });
    }
  }

  if (newGrammarMasteryEntries.length > 0) {
    await db.grammarMastery.bulkPut(newGrammarMasteryEntries);
  }
}

/**
 * Returns all vocabulary items joined with their Dexie mastery and SRS review state.
 */
export async function getVocabularyWithProgress(): Promise<VocabularyWithProgress[]> {
  const [masteryList, reviewList] = await Promise.all([
    db.vocabularyMastery.toArray(),
    db.reviewStates.toArray(),
  ]);

  const masteryMap = new Map(masteryList.map((m) => [m.id, m]));
  const reviewMap = new Map(reviewList.map((r) => [r.id, r]));
  const now = new Date().toISOString();

  return seedVocabulary.map((item) => {
    const mastery: MasteryState = masteryMap.get(item.id) || {
      id: item.id,
      status: 'unseen',
      score: 0,
      firstSeenAt: now,
      attemptsCount: 0,
      firstAttemptSuccessCount: 0,
      consecutiveCorrect: 0,
    };

    const review: ReviewState = reviewMap.get(item.id) || {
      id: item.id,
      nextReviewDate: now,
      interval: 0,
      easeFactor: DEFAULT_EASE_FACTOR,
      repetitions: 0,
      lapses: 0,
      consecutiveCorrect: 0,
    };

    return { item, mastery, review };
  });
}

/**
 * Returns review queue breakdown counts for UI headers.
 */
export async function getReviewQueueSummary(): Promise<{
  dueNow: number;
  dueToday: number;
  weakCount: number;
  unseenCount: number;
  totalCount: number;
  recalledOrBetterCount: number;
}> {
  const all = await getVocabularyWithProgress();
  const now = new Date();
  const nowTime = now.getTime();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const endOfDayTime = endOfDay.getTime();

  let dueNow = 0;
  let dueToday = 0;
  let weakCount = 0;
  let unseenCount = 0;
  let recalledOrBetterCount = 0;

  for (const v of all) {
    if (v.mastery.status === 'unseen') {
      unseenCount++;
    } else {
      const reviewTime = new Date(v.review.nextReviewDate).getTime();
      if (reviewTime <= nowTime) {
        dueNow++;
      }
      if (reviewTime <= endOfDayTime) {
        dueToday++;
      }
      if (v.review.lapses > 0 || (v.review.easeFactor < 2.0 && v.mastery.score < 40)) {
        weakCount++;
      }
      if (
        v.mastery.status === 'recalled' ||
        v.mastery.status === 'used_correctly' ||
        v.mastery.status === 'reliable'
      ) {
        recalledOrBetterCount++;
      }
    }
  }

  return {
    dueNow,
    dueToday,
    weakCount,
    unseenCount,
    totalCount: all.length,
    recalledOrBetterCount,
  };
}

/**
 * Atomically records an exercise attempt, recalculates SRS interval & Mastery state,
 * and persists the changes into Dexie.
 */
export async function recordVocabularyAttemptAndProgress(params: {
  attempt: ExerciseAttempt;
  vocabularyId: string;
  srsInput: SRSEvaluationInput;
  masteryInput: MasteryEvaluationInput;
}): Promise<{ nextMastery: MasteryState; nextReview: ReviewState }> {
  return await db.transaction(
    'rw',
    [db.vocabularyMastery, db.reviewStates, db.exerciseAttempts, db.userProfile],
    async () => {
      const now = new Date();
      const currentMastery = (await db.vocabularyMastery.get(params.vocabularyId)) || {
        id: params.vocabularyId,
        status: 'unseen',
        score: 0,
        firstSeenAt: now.toISOString(),
      };

      const currentReview = (await db.reviewStates.get(params.vocabularyId)) || {
        id: params.vocabularyId,
        nextReviewDate: now.toISOString(),
        interval: 0,
        easeFactor: DEFAULT_EASE_FACTOR,
        repetitions: 0,
        lapses: 0,
        consecutiveCorrect: 0,
      };

      // 1. Calculate next states using pure deterministic engines
      const nextReviewCalc = calculateNextReview(currentReview, params.srsInput, now);
      const nextMasteryCalc = calculateMastery(currentMastery, params.masteryInput, now);

      const nextMastery: MasteryState = {
        id: params.vocabularyId,
        status: nextMasteryCalc.status,
        score: nextMasteryCalc.score,
        firstSeenAt: nextMasteryCalc.firstSeenAt,
        lastReviewedAt: nextMasteryCalc.lastReviewedAt,
        attemptsCount: nextMasteryCalc.attemptsCount,
        firstAttemptSuccessCount: nextMasteryCalc.firstAttemptSuccessCount,
        consecutiveCorrect: nextMasteryCalc.consecutiveCorrect,
      };

      const nextReview: ReviewState = {
        id: params.vocabularyId,
        nextReviewDate: nextReviewCalc.nextReviewDate,
        interval: nextReviewCalc.interval,
        easeFactor: nextReviewCalc.easeFactor,
        repetitions: nextReviewCalc.repetitions,
        lapses: nextReviewCalc.lapses,
        lastReviewDate: nextReviewCalc.lastReviewDate,
        consecutiveCorrect: nextReviewCalc.consecutiveCorrect,
      };

      // 2. Persist in Dexie
      await db.vocabularyMastery.put(nextMastery);
      await db.reviewStates.put(nextReview);
      await db.exerciseAttempts.put(params.attempt);

      // Update user last active
      await db.userProfile.update('default_user', {
        lastActiveAt: now.toISOString(),
      });

      return { nextMastery, nextReview };
    }
  );
}

/**
 * Saves a completed study session in Dexie.
 */
export async function saveStudySession(session: StudySession): Promise<void> {
  await db.studySessions.put(session);
  await db.userProfile.update('default_user', {
    lastActiveAt: new Date().toISOString(),
  });
}

/**
 * Queries dashboard analytics based on real Dexie data.
 */
export async function getVocabularyMetrics(): Promise<{
  totalWords: number;
  encounteredWords: number;
  dueNow: number;
  recalledPlus: number;
  reliableWords: number;
  weakWords: number;
  firstAttemptAccuracyRate: number; // 0 to 100
  totalAttempts: number;
  masteryDistribution: { status: MasteryStatus; label: string; count: number }[];
  recentSessions: StudySession[];
}> {
  const [allVocab, attempts, recentSessions] = await Promise.all([
    getVocabularyWithProgress(),
    db.exerciseAttempts.toArray(),
    db.studySessions.orderBy('startedAt').reverse().limit(5).toArray(),
  ]);

  const nowTime = Date.now();
  let encounteredWords = 0;
  let dueNow = 0;
  let recalledPlus = 0;
  let reliableWords = 0;
  let weakWords = 0;

  const distributionCounts: Record<MasteryStatus, number> = {
    unseen: 0,
    seen: 0,
    recognised: 0,
    recalled: 0,
    used_correctly: 0,
    reliable: 0,
  };

  for (const v of allVocab) {
    distributionCounts[v.mastery.status] = (distributionCounts[v.mastery.status] || 0) + 1;

    if (v.mastery.status !== 'unseen') {
      encounteredWords++;
      const reviewTime = new Date(v.review.nextReviewDate).getTime();
      if (reviewTime <= nowTime) dueNow++;
      if (v.review.lapses > 0 || (v.review.easeFactor < 2.0 && v.mastery.score < 40)) weakWords++;
      if (['recalled', 'used_correctly', 'reliable'].includes(v.mastery.status)) {
        recalledPlus++;
      }
      if (v.mastery.status === 'reliable') {
        reliableWords++;
      }
    }
  }

  // Calculate first attempt accuracy from all exercise attempts
  let firstAttemptSuccesses = 0;
  for (const a of attempts) {
    if (a.attempts.length > 0 && a.attempts[0].isCorrect) {
      firstAttemptSuccesses++;
    }
  }

  const firstAttemptAccuracyRate =
    attempts.length > 0 ? Math.round((firstAttemptSuccesses / attempts.length) * 100) : 0;

  const masteryDistribution: { status: MasteryStatus; label: string; count: number }[] = [
    { status: 'unseen', label: 'Sin ver', count: distributionCounts.unseen },
    { status: 'seen', label: 'Vistas', count: distributionCounts.seen },
    { status: 'recognised', label: 'Reconocidas', count: distributionCounts.recognised },
    { status: 'recalled', label: 'Recordadas', count: distributionCounts.recalled },
    { status: 'used_correctly', label: 'Uso correcto', count: distributionCounts.used_correctly },
    { status: 'reliable', label: 'Dominadas', count: distributionCounts.reliable },
  ];

  return {
    totalWords: allVocab.length,
    encounteredWords,
    dueNow,
    recalledPlus,
    reliableWords,
    weakWords,
    firstAttemptAccuracyRate,
    totalAttempts: attempts.length,
    masteryDistribution,
    recentSessions,
  };
}

/**
 * Safe development reset mechanism. Clears all learning history upon explicit confirmation.
 */
export async function resetLearningData(confirmed: boolean): Promise<boolean> {
  if (!confirmed) return false;

  await db.transaction(
    'rw',
    [
      db.vocabularyMastery,
      db.reviewStates,
      db.exerciseAttempts,
      db.studySessions,
      db.readingProgress,
      db.exerciseSessionResults,
      db.grammarMastery,
      db.listeningAttempts,
      db.speakingAttempts,
      db.writingAttempts,
    ],
    async () => {
      await db.vocabularyMastery.clear();
      await db.reviewStates.clear();
      await db.exerciseAttempts.clear();
      await db.studySessions.clear();
      await db.readingProgress.clear();
      await db.exerciseSessionResults.clear();
      await db.grammarMastery.clear();
      await db.listeningAttempts.clear();
      await db.speakingAttempts.clear();
      await db.writingAttempts.clear();
    }
  );

  // Re-seed default entries
  await initializeDatabase();
  return true;
}

/**
 * Persists an exercise session result and updates cumulative reading progress.
 */
export async function recordReadingSessionResult(
  result: ExerciseSessionResult
): Promise<ReadingProgressRecord> {
  return await db.transaction(
    'rw',
    [db.exerciseSessionResults, db.readingProgress, db.userProfile],
    async () => {
      // 1. Store the full session result
      await db.exerciseSessionResults.put(result);

      // 2. Fetch or initialize reading progress record for this exercise
      const existing = await db.readingProgress.get(result.exerciseId);
      const attemptsCount = (existing?.attemptsCount || 0) + 1;
      const bestFirstAttemptAccuracy = Math.max(
        existing?.bestFirstAttemptAccuracy || 0,
        result.firstAttemptAccuracy
      );

      const progressRecord: ReadingProgressRecord = {
        id: result.exerciseId,
        exerciseId: result.exerciseId,
        cefrLevel: result.cefrLevel,
        difficulty: result.difficulty,
        status: 'completed',
        bestFirstAttemptAccuracy,
        lastAttemptAccuracy: result.finalAccuracy,
        lastAttemptAt: result.completedAt,
        attemptsCount,
      };

      await db.readingProgress.put(progressRecord);

      // 3. Update user profile last active timestamp
      await db.userProfile.update('default_user', {
        lastActiveAt: result.completedAt,
      });

      return progressRecord;
    }
  );
}

/**
 * Returns a Map of exerciseId -> ReadingProgressRecord for fast lookup in UI lists.
 */
export async function getReadingProgressMap(): Promise<Map<string, ReadingProgressRecord>> {
  const records = await db.readingProgress.toArray();
  return new Map(records.map((r) => [r.exerciseId, r]));
}

/**
 * Returns chronological history of reading exercise sessions.
 */
export async function getReadingHistory(): Promise<ExerciseSessionResult[]> {
  const results = await db.exerciseSessionResults
    .where('skill')
    .equals('Reading')
    .sortBy('startedAt');
  return results.reverse();
}

/**
 * Computes high-level aggregated metrics for the Reading dashboard.
 */
export async function getReadingMetrics(): Promise<{
  totalCompleted: number;
  totalAttempts: number;
  averageFirstAttemptAccuracy: number;
  averageFinalAccuracy: number;
  totalTimeSpentSec: number;
}> {
  const [records, history] = await Promise.all([
    db.readingProgress.toArray(),
    db.exerciseSessionResults.where('skill').equals('Reading').toArray(),
  ]);

  if (history.length === 0) {
    return {
      totalCompleted: records.length,
      totalAttempts: 0,
      averageFirstAttemptAccuracy: 0,
      averageFinalAccuracy: 0,
      totalTimeSpentSec: 0,
    };
  }

  let sumFirstAcc = 0;
  let sumFinalAcc = 0;
  let totalTimeMs = 0;

  for (const h of history) {
    sumFirstAcc += h.firstAttemptAccuracy;
    sumFinalAcc += h.finalAccuracy;
    totalTimeMs += h.totalTimeMs;
  }

  return {
    totalCompleted: records.length,
    totalAttempts: history.length,
    averageFirstAttemptAccuracy: Math.round(sumFirstAcc / history.length),
    averageFinalAccuracy: Math.round(sumFinalAcc / history.length),
    totalTimeSpentSec: Math.round(totalTimeMs / 1000),
  };
}

/**
 * Returns all grammar concepts joined with their Dexie mastery progress and error history.
 */
export async function getGrammarWithProgress(): Promise<GrammarWithProgress[]> {
  const [masteryList, attempts] = await Promise.all([
    db.grammarMastery.toArray(),
    db.exerciseAttempts.toArray(),
  ]);

  const masteryMap = new Map(masteryList.map((m) => [m.id, m]));

  const errorCountMap = new Map<string, number>();
  const lastPracticedMap = new Map<string, string>();

  for (const att of attempts) {
    if (att.errorClassification?.grammarConceptId) {
      const cid = att.errorClassification.grammarConceptId;
      errorCountMap.set(cid, (errorCountMap.get(cid) || 0) + 1);
    }
    const cid = att.errorClassification?.grammarConceptId || att.exerciseId.split('_')[1];
    if (cid && att.completedAt) {
      const prev = lastPracticedMap.get(cid);
      if (!prev || att.completedAt > prev) {
        lastPracticedMap.set(cid, att.completedAt);
      }
    }
  }

  const now = new Date().toISOString();

  return seedGrammar.map((concept) => {
    const mastery: MasteryState = masteryMap.get(concept.id) || {
      id: concept.id,
      status: 'unseen',
      score: 0,
      firstSeenAt: now,
      attemptsCount: 0,
      firstAttemptSuccessCount: 0,
      consecutiveCorrect: 0,
    };

    const exerciseCount = seedGrammarExercises.filter((e) => e.conceptId === concept.id).length;
    const strengthState = calculateGrammarStrength(
      mastery.score,
      mastery.attemptsCount ?? 0,
      mastery.firstAttemptSuccessCount ?? 0,
      mastery.consecutiveCorrect ?? 0
    );

    return {
      concept,
      mastery,
      exerciseCount,
      strengthState,
      lastPracticedAt: mastery.lastReviewedAt || lastPracticedMap.get(concept.id),
      errorCount: errorCountMap.get(concept.id) || 0,
    };
  });
}

/**
 * Retrieves a single grammar concept joined with its progress.
 */
export async function getGrammarConceptWithProgress(
  id: string
): Promise<GrammarWithProgress | null> {
  const all = await getGrammarWithProgress();
  return all.find((c) => c.concept.id === id) || null;
}

/**
 * Atomically records an exercise attempt for a grammar concept,
 * recalculates conservative mastery score and qualitative status,
 * and persists changes to Dexie.
 */
export async function recordGrammarAttemptAndProgress(params: {
  attempt: ExerciseAttempt;
  conceptId: string;
  input: GrammarMasteryEvaluationInput;
}): Promise<{ nextMastery: MasteryState; strengthState: string }> {
  return await db.transaction(
    'rw',
    [db.grammarMastery, db.exerciseAttempts, db.userProfile],
    async () => {
      const now = new Date();
      const currentMastery = (await db.grammarMastery.get(params.conceptId)) || {
        id: params.conceptId,
        status: 'unseen',
        score: 0,
        firstSeenAt: now.toISOString(),
      };

      const result = calculateGrammarMastery(currentMastery, params.input, now);

      const nextMastery: MasteryState = {
        id: params.conceptId,
        status: result.status,
        score: result.score,
        firstSeenAt: result.firstSeenAt,
        lastReviewedAt: result.lastReviewedAt,
        attemptsCount: result.attemptsCount,
        firstAttemptSuccessCount: result.firstAttemptSuccessCount,
        consecutiveCorrect: result.consecutiveCorrect,
      };

      await db.grammarMastery.put(nextMastery);
      await db.exerciseAttempts.put(params.attempt);

      // Update user last active and grammar skill estimate
      const profile = await db.userProfile.get('default_user');
      if (profile) {
        const allMastery = await db.grammarMastery.toArray();
        const tested = allMastery.filter((m) => (m.attemptsCount ?? 0) > 0);
        let avgScore = 0;
        if (tested.length > 0) {
          avgScore = Math.round(tested.reduce((sum, m) => sum + m.score, 0) / tested.length);
        }
        let estLevel: 'A2' | 'B1' | 'B2' = 'A2';
        if (avgScore >= 75 && tested.length >= 8) estLevel = 'B2';
        else if (avgScore >= 45 && tested.length >= 4) estLevel = 'B1';

        await db.userProfile.update('default_user', {
          lastActiveAt: now.toISOString(),
          skills: {
            ...profile.skills,
            Grammar: {
              skill: 'Grammar',
              level: estLevel,
              confidence: Math.min(0.9, 0.2 + tested.length * 0.03),
            },
          },
        });
      }

      return { nextMastery, strengthState: result.strengthState };
    }
  );
}

/**
 * Computes high-level aggregated metrics for the Grammar system.
 */
export async function getGrammarMetrics(): Promise<{
  totalConcepts: number;
  practicedConcepts: number;
  strongCount: number;
  weakCount: number;
  averageMasteryScore: number;
  firstAttemptAccuracyRate: number;
  totalAttempts: number;
}> {
  const [allGrammar, attempts] = await Promise.all([
    getGrammarWithProgress(),
    db.exerciseAttempts.toArray(),
  ]);

  const grammarAttempts = attempts.filter((a) =>
    a.exerciseId.startsWith('ge_') || a.errorClassification?.grammarConceptId
  );

  const practiced = allGrammar.filter((g) => (g.mastery.attemptsCount ?? 0) > 0);
  const strong = allGrammar.filter((g) => g.strengthState === 'strong');
  const weak = allGrammar.filter((g) => g.strengthState === 'weak');

  const totalScore = practiced.reduce((sum, g) => sum + g.mastery.score, 0);
  const averageMasteryScore = practiced.length > 0 ? Math.round(totalScore / practiced.length) : 0;

  let firstAttemptSuccesses = 0;
  for (const att of grammarAttempts) {
    if (att.attempts.length > 0 && att.attempts[0].isCorrect) {
      firstAttemptSuccesses++;
    }
  }

  const firstAttemptAccuracyRate =
    grammarAttempts.length > 0
      ? Math.round((firstAttemptSuccesses / grammarAttempts.length) * 100)
      : 0;

  return {
    totalConcepts: allGrammar.length,
    practicedConcepts: practiced.length,
    strongCount: strong.length,
    weakCount: weak.length,
    averageMasteryScore,
    firstAttemptAccuracyRate,
    totalAttempts: grammarAttempts.length,
  };
}

export async function recordListeningAttempt(attempt: ListeningAttempt): Promise<void> {
  await db.listeningAttempts.put(attempt);
  await db.userProfile.update('default_user', { lastActiveAt: attempt.completedAt });
}

export async function recordSpeakingAttempt(attempt: SpeakingAttempt): Promise<void> {
  await db.speakingAttempts.put(attempt);
  await db.userProfile.update('default_user', { lastActiveAt: attempt.completedAt });
}

export async function recordWritingAttempt(attempt: WritingAttempt): Promise<void> {
  await db.writingAttempts.put(attempt);
  await db.userProfile.update('default_user', { lastActiveAt: attempt.completedAt });
}
