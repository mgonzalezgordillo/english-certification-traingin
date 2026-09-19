import type {
  GenericExercise,
  ReadingProgressRecord,
  ExerciseSessionResult,
} from '../../types/exercise';
import type { CEFRLevel, UserProfile } from '../../types';

export interface ReadingSelectionOptions {
  targetCefr?: CEFRLevel | 'all';
  targetTaskType?: string | 'all';
  limit?: number;
}

export interface ScoredReadingActivity {
  activity: GenericExercise;
  priorityScore: number;
  reason: string;
}

/**
 * Maps CEFR level to a baseline numerical difficulty range (1–10).
 */
export function getCefrDifficultyRange(level: CEFRLevel): { min: number; max: number; default: number } {
  switch (level) {
    case 'A2':
      return { min: 1, max: 3, default: 2 };
    case 'A2+':
      return { min: 2, max: 4, default: 3 };
    case 'B1':
      return { min: 4, max: 6, default: 5 };
    case 'B1+':
      return { min: 5, max: 7, default: 6 };
    case 'B2':
      return { min: 7, max: 10, default: 8 };
    default:
      return { min: 4, max: 6, default: 5 };
  }
}

/**
 * Pure selection helper that scores and recommends Reading activities.
 * Prioritizes:
 * 1. Unseen activities matching the learner's estimated or targeted CEFR level.
 * 2. Remedial practice for task types where the learner historically had low first-attempt accuracy.
 * 3. Difficulty adjustment: increases target difficulty if recent accuracy >= 80%, decreases if < 50%.
 * 4. Variety: alternates task types.
 */
export function selectReadingActivities(
  activities: GenericExercise[],
  progressMap: Map<string, ReadingProgressRecord>,
  recentResults: ExerciseSessionResult[],
  userProfile?: UserProfile,
  options: ReadingSelectionOptions = {}
): ScoredReadingActivity[] {
  const { targetCefr = 'all', targetTaskType = 'all', limit = 5 } = options;

  // 1. Determine learner's effective CEFR level
  const effectiveLevel: CEFRLevel =
    targetCefr !== 'all'
      ? targetCefr
      : userProfile?.skills?.Reading?.level || userProfile?.estimatedGlobalLevel || 'B1';

  // 2. Calculate historical accuracy per task type from recent results
  const taskTypeStats: Record<string, { total: number; correctFirst: number }> = {};
  for (const res of recentResults) {
    if (!taskTypeStats[res.taskType]) {
      taskTypeStats[res.taskType] = { total: 0, correctFirst: 0 };
    }
    taskTypeStats[res.taskType].total += res.totalQuestions;
    taskTypeStats[res.taskType].correctFirst += res.firstAttemptScore;
  }

  const weakTaskTypes = new Set<string>();
  for (const [taskType, stats] of Object.entries(taskTypeStats)) {
    if (stats.total >= 3 && stats.correctFirst / stats.total < 0.6) {
      weakTaskTypes.add(taskType);
    }
  }

  // 3. Determine recent overall reading trend for difficulty graduation
  const recentThree = recentResults.slice(-3);
  let difficultyModifier = 0;
  if (recentThree.length >= 2) {
    const avgRecentAcc =
      recentThree.reduce((sum, r) => sum + r.firstAttemptAccuracy, 0) / recentThree.length;
    if (avgRecentAcc >= 80) {
      difficultyModifier = +1; // Student is excelling, promote slightly harder challenge
    } else if (avgRecentAcc < 50) {
      difficultyModifier = -1; // Student is struggling, provide accessible reinforcement
    }
  }

  const baselineDiff = getCefrDifficultyRange(effectiveLevel).default + difficultyModifier;

  // 4. Score each activity
  const scored: ScoredReadingActivity[] = [];

  for (const act of activities) {
    // Basic filtering
    if (targetCefr !== 'all' && act.cefrLevel !== targetCefr) continue;
    if (targetTaskType !== 'all' && act.taskType !== targetTaskType) continue;

    let score = 50; // Base score
    let reason: string;

    const progress = progressMap.get(act.id);
    const isUnseen = !progress || progress.attemptsCount === 0;

    // A. Unseen content bonus
    if (isUnseen) {
      score += 40;
      reason = 'Actividad nueva recomendada';
    } else {
      // Prioritize activities where previous first-attempt accuracy was low
      if (progress.bestFirstAttemptAccuracy < 70) {
        score += 25;
        reason = `Refuerzo de lectura previa (${progress.bestFirstAttemptAccuracy}% en 1º intento)`;
      } else {
        // Already mastered, lower priority
        score -= 20;
        reason = 'Completado con buena puntuación';
      }
    }

    // B. Weak task type bonus
    if (weakTaskTypes.has(act.taskType)) {
      score += 20;
      reason = `Refuerzo específico para tu punto débil: ${act.taskType}`;
    }

    // C. Proximity to ideal difficulty
    const diffDistance = Math.abs(act.difficulty - baselineDiff);
    score -= diffDistance * 5;

    // D. CEFR level match bonus
    if (act.cefrLevel === effectiveLevel) {
      score += 15;
    }

    scored.push({
      activity: act,
      priorityScore: score,
      reason,
    });
  }

  // Sort descending by priority score
  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  return scored.slice(0, limit);
}

/**
 * Returns the top single recommended Reading activity.
 */
export function selectTopReadingRecommendation(
  activities: GenericExercise[],
  progressMap: Map<string, ReadingProgressRecord>,
  recentResults: ExerciseSessionResult[],
  userProfile?: UserProfile,
  options?: ReadingSelectionOptions
): ScoredReadingActivity | null {
  const recommendations = selectReadingActivities(
    activities,
    progressMap,
    recentResults,
    userProfile,
    { ...options, limit: 1 }
  );
  return recommendations[0] || null;
}
