import type { ExerciseSessionResult, ReadingErrorCategory } from '../../types/exercise';
import type { CEFRLevel } from '../../types';

export interface AccuracyDataPoint {
  date: string; // YYYY-MM-DD or readable label
  firstAttemptAccuracy: number;
  finalAccuracy: number;
  exerciseTitle?: string;
}

export interface TaskTypePerformance {
  taskType: string;
  totalAttempts: number;
  totalQuestions: number;
  firstAttemptAccuracy: number;
  finalAccuracy: number;
}

export interface CefrPerformance {
  cefrLevel: CEFRLevel;
  totalAttempts: number;
  firstAttemptAccuracy: number;
  finalAccuracy: number;
}

export interface WeakErrorAnalysis {
  category: ReadingErrorCategory;
  label: string;
  count: number;
  percentage: number;
}

const ERROR_CATEGORY_LABELS: Record<ReadingErrorCategory, string> = {
  vocabulary_comprehension: 'Vocabulario y colocaciones',
  missed_detail: 'Detalle omitido / lectura superficial',
  main_idea: 'Idea principal vs detalle secundario',
  inference: 'Inferencia y postura del autor',
  reference_pronoun: 'Referentes y pronombres',
  connector_logical_relation: 'Conectores y relaciones lógicas',
  distractor_confusion: 'Confusión por distractor habitual',
  rushed_answer: 'Respuesta apresurada (< 4s)',
  text_structure: 'Estructura textual y orden discursivo',
  other: 'Otros errores generales',
};

/**
 * Calculates historical reading accuracy chronologically over time.
 */
export function calculateReadingAccuracyOverTime(
  results: ExerciseSessionResult[]
): AccuracyDataPoint[] {
  const sorted = [...results].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  return sorted.map((res) => ({
    date: new Date(res.startedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    firstAttemptAccuracy: res.firstAttemptAccuracy,
    finalAccuracy: res.finalAccuracy,
  }));
}

/**
 * Calculates overall first-attempt accuracy across all attempted reading questions.
 */
export function calculateFirstAttemptAccuracy(results: ExerciseSessionResult[]): number {
  if (results.length === 0) return 0;
  let totalQuestions = 0;
  let firstAttemptCorrect = 0;

  for (const r of results) {
    totalQuestions += r.totalQuestions;
    firstAttemptCorrect += r.firstAttemptScore;
  }

  return totalQuestions > 0 ? Math.round((firstAttemptCorrect / totalQuestions) * 100) : 0;
}

/**
 * Calculates performance broken down by task type (e.g. short_message, multiple_choice_cloze, matching).
 */
export function calculatePerformanceByTaskType(
  results: ExerciseSessionResult[]
): TaskTypePerformance[] {
  const grouped: Record<
    string,
    { attempts: number; totalQ: number; firstCorrect: number; finalCorrect: number }
  > = {};

  for (const r of results) {
    if (!grouped[r.taskType]) {
      grouped[r.taskType] = { attempts: 0, totalQ: 0, firstCorrect: 0, finalCorrect: 0 };
    }
    grouped[r.taskType].attempts += 1;
    grouped[r.taskType].totalQ += r.totalQuestions;
    grouped[r.taskType].firstCorrect += r.firstAttemptScore;
    grouped[r.taskType].finalCorrect += r.finalScore;
  }

  return Object.entries(grouped).map(([taskType, data]) => ({
    taskType,
    totalAttempts: data.attempts,
    totalQuestions: data.totalQ,
    firstAttemptAccuracy:
      data.totalQ > 0 ? Math.round((data.firstCorrect / data.totalQ) * 100) : 0,
    finalAccuracy:
      data.totalQ > 0 ? Math.round((data.finalCorrect / data.totalQ) * 100) : 0,
  }));
}

/**
 * Calculates performance grouped by CEFR level.
 */
export function calculatePerformanceByCEFR(
  results: ExerciseSessionResult[]
): CefrPerformance[] {
  const levels: CEFRLevel[] = ['A2', 'B1', 'B2'];
  const grouped: Record<
    string,
    { attempts: number; totalQ: number; firstCorrect: number; finalCorrect: number }
  > = {};

  for (const r of results) {
    const lvl = r.cefrLevel.replace('+', '') as CEFRLevel;
    if (!grouped[lvl]) {
      grouped[lvl] = { attempts: 0, totalQ: 0, firstCorrect: 0, finalCorrect: 0 };
    }
    grouped[lvl].attempts += 1;
    grouped[lvl].totalQ += r.totalQuestions;
    grouped[lvl].firstCorrect += r.firstAttemptScore;
    grouped[lvl].finalCorrect += r.finalScore;
  }

  return levels.map((lvl) => {
    const data = grouped[lvl] || { attempts: 0, totalQ: 0, firstCorrect: 0, finalCorrect: 0 };
    return {
      cefrLevel: lvl,
      totalAttempts: data.attempts,
      firstAttemptAccuracy:
        data.totalQ > 0 ? Math.round((data.firstCorrect / data.totalQ) * 100) : 0,
      finalAccuracy:
        data.totalQ > 0 ? Math.round((data.finalCorrect / data.totalQ) * 100) : 0,
    };
  });
}

/**
 * Calculates average response time in seconds per question.
 */
export function calculateAverageResponseTime(results: ExerciseSessionResult[]): number {
  if (results.length === 0) return 0;
  let totalTimeMs = 0;
  let totalQuestions = 0;

  for (const r of results) {
    totalTimeMs += r.totalTimeMs;
    totalQuestions += r.totalQuestions;
  }

  if (totalQuestions === 0) return 0;
  return Math.round(totalTimeMs / totalQuestions / 1000);
}

/**
 * Aggregates all error classifications and ranks weak error categories.
 */
export function identifyWeakErrorCategories(
  results: ExerciseSessionResult[]
): WeakErrorAnalysis[] {
  const counts: Partial<Record<ReadingErrorCategory, number>> = {};
  let totalErrors = 0;

  for (const r of results) {
    for (const err of r.inferredErrors) {
      counts[err.category] = (counts[err.category] || 0) + 1;
      totalErrors++;
    }
  }

  const analysis: WeakErrorAnalysis[] = Object.entries(counts).map(([cat, count]) => {
    const category = cat as ReadingErrorCategory;
    return {
      category,
      label: ERROR_CATEGORY_LABELS[category] || category,
      count: count || 0,
      percentage: totalErrors > 0 ? Math.round(((count || 0) / totalErrors) * 100) : 0,
    };
  });

  return analysis.sort((a, b) => b.count - a.count);
}
