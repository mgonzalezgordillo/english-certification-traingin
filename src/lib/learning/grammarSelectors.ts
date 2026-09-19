import type {
  GrammarWithProgress,
  ExerciseAttempt,
  CEFRLevel,
  ErrorClassification,
} from '../../types';

export interface CefrGrammarMetrics {
  level: CEFRLevel;
  totalConcepts: number;
  averageScore: number;
  strongCount: number;
  weakCount: number;
  untestedCount: number;
}

export interface GrammarErrorCategoryStat {
  category: ErrorClassification['category'];
  label: string;
  count: number;
  percentage: number;
}

/**
 * Returns the weakest grammar concepts prioritized for remedial review.
 * Prioritizes items with errors, low scores, and low first-attempt accuracy.
 */
export function getWeakestGrammarConcepts(
  concepts: GrammarWithProgress[],
  limit: number = 5
): GrammarWithProgress[] {
  return [...concepts]
    .filter((c) => c.mastery.attemptsCount && c.mastery.attemptsCount > 0)
    .sort((a, b) => {
      // 1. Weak strength state comes first
      const stateWeight = (s: GrammarWithProgress['strengthState']) => {
        if (s === 'weak') return 0;
        if (s === 'medium') return 1;
        if (s === 'strong') return 2;
        return 3;
      };
      if (stateWeight(a.strengthState) !== stateWeight(b.strengthState)) {
        return stateWeight(a.strengthState) - stateWeight(b.strengthState);
      }

      // 2. Lowest mastery score
      if (a.mastery.score !== b.mastery.score) {
        return a.mastery.score - b.mastery.score;
      }

      // 3. Lowest first-attempt accuracy
      const accA =
        (a.mastery.firstAttemptSuccessCount ?? 0) / (a.mastery.attemptsCount || 1);
      const accB =
        (b.mastery.firstAttemptSuccessCount ?? 0) / (b.mastery.attemptsCount || 1);
      return accA - accB;
    })
    .slice(0, limit);
}

/**
 * Returns the top strongest grammar concepts with proven mastery.
 */
export function getStrongestGrammarConcepts(
  concepts: GrammarWithProgress[],
  limit: number = 5
): GrammarWithProgress[] {
  return [...concepts]
    .filter((c) => c.strengthState === 'strong' || (c.mastery.score >= 70 && (c.mastery.attemptsCount ?? 0) >= 2))
    .sort((a, b) => {
      if (b.mastery.score !== a.mastery.score) {
        return b.mastery.score - a.mastery.score;
      }
      return (b.mastery.consecutiveCorrect ?? 0) - (a.mastery.consecutiveCorrect ?? 0);
    })
    .slice(0, limit);
}

/**
 * Aggregates grammar mastery metrics segmented by CEFR level.
 */
export function getGrammarMasteryByCefr(
  concepts: GrammarWithProgress[]
): CefrGrammarMetrics[] {
  const levels: CEFRLevel[] = ['A2', 'B1', 'B2'];

  return levels.map((lvl) => {
    const matching = concepts.filter((c) => c.concept.cefrLevel === lvl);
    if (matching.length === 0) {
      return {
        level: lvl,
        totalConcepts: 0,
        averageScore: 0,
        strongCount: 0,
        weakCount: 0,
        untestedCount: 0,
      };
    }

    const tested = matching.filter((c) => (c.mastery.attemptsCount ?? 0) > 0);
    const totalScore = tested.reduce((acc, c) => acc + c.mastery.score, 0);
    const averageScore = tested.length > 0 ? Math.round(totalScore / tested.length) : 0;

    const strongCount = matching.filter((c) => c.strengthState === 'strong').length;
    const weakCount = matching.filter((c) => c.strengthState === 'weak').length;
    const untestedCount = matching.filter((c) => c.strengthState === 'untested').length;

    return {
      level: lvl,
      totalConcepts: matching.length,
      averageScore,
      strongCount,
      weakCount,
      untestedCount,
    };
  });
}

/**
 * Maps error classification categories to user-friendly Spanish labels.
 */
export const GRAMMAR_ERROR_LABELS: Record<string, string> = {
  tense_misuse: 'Uso incorrecto de tiempos verbales',
  auxiliary_error: 'Error de verbo auxiliar',
  conditional_structure: 'Estructura condicional',
  word_order: 'Orden de palabras / Inversión',
  modal_misuse: 'Uso de verbos modales',
  relative_clause: 'Oraciones de relativo',
  passive_voice: 'Voz pasiva',
  verb_pattern: 'Patrones verbales (Gerundio / Infinitivo)',
  quantifier: 'Cuantificadores y comparación',
  connector: 'Conectores y subordinadas',
  preposition: 'Preposiciones',
  distractor_confusion: 'Confusión con distractores',
  spelling: 'Despiste ortográfico',
  repeated_misconception: 'Concepto erróneo recurrente',
  rushed_answer: 'Respuesta precipitada',
  grammar_gap: 'Laguna gramatical general',
  other: 'Otro error gramatical',
};

/**
 * Calculates distribution of error categories across grammar attempts.
 */
export function getGrammarErrorDistribution(
  attempts: ExerciseAttempt[]
): GrammarErrorCategoryStat[] {
  const counts: Record<string, number> = {};
  let totalErrors = 0;

  for (const attempt of attempts) {
    if (attempt.errorClassification) {
      const cat = attempt.errorClassification.category;
      counts[cat] = (counts[cat] || 0) + 1;
      totalErrors++;
    }
  }

  return Object.entries(counts)
    .map(([cat, count]) => ({
      category: cat as ErrorClassification['category'],
      label: GRAMMAR_ERROR_LABELS[cat] || cat,
      count,
      percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculates recent grammar accuracy rate (first attempt and eventual).
 */
export function getRecentGrammarAccuracy(
  attempts: ExerciseAttempt[],
  count: number = 25
): {
  firstAttemptAccuracy: number; // 0 to 100
  eventualAccuracy: number; // 0 to 100
  totalEvaluated: number;
} {
  const recent = attempts.slice(-count);
  if (recent.length === 0) {
    return { firstAttemptAccuracy: 0, eventualAccuracy: 0, totalEvaluated: 0 };
  }

  let firstSuccesses = 0;
  let eventualSuccesses = 0;

  for (const att of recent) {
    if (att.attempts.length > 0 && att.attempts[0].isCorrect) {
      firstSuccesses++;
    }
    if (att.finalCorrect) {
      eventualSuccesses++;
    }
  }

  return {
    firstAttemptAccuracy: Math.round((firstSuccesses / recent.length) * 100),
    eventualAccuracy: Math.round((eventualSuccesses / recent.length) * 100),
    totalEvaluated: recent.length,
  };
}
