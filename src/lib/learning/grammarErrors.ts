import type { ErrorClassification, GrammarExercise, MasteryState } from '../../types';

/**
 * Computes Levenshtein distance for minor typo detection.
 */
function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= an; i++) matrix[i] = [i];
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;

  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

/**
 * Classifies grammar errors into actionable pedagogical categories
 * and links the diagnostic to the target grammar concept ID.
 */
export function classifyGrammarError(
  exercise: GrammarExercise,
  userAnswer: string | undefined,
  timeSpentMs: number,
  masteryState?: Partial<MasteryState>
): ErrorClassification {
  const normUser = (userAnswer || '').trim().toLowerCase();
  const normCorrect = exercise.correctAnswer.trim().toLowerCase();

  // 1. Rushed answer: answered too fast without careful reading (< 1.8 seconds)
  if (timeSpentMs > 0 && timeSpentMs < 1800) {
    return {
      category: 'rushed_answer',
      confidence: 0.85,
      grammarConceptId: exercise.conceptId,
    };
  }

  // 2. Repeated misconception: concept already failed multiple times in history
  if (
    masteryState &&
    (masteryState.attemptsCount ?? 0) >= 3 &&
    (masteryState.firstAttemptSuccessCount ?? 0) / (masteryState.attemptsCount ?? 1) < 0.4
  ) {
    return {
      category: 'repeated_misconception',
      confidence: 0.82,
      grammarConceptId: exercise.conceptId,
    };
  }

  // 3. Known auxiliary grammatical contrast (e.g., don't vs doesn't, didn't, was vs were)
  if (
    exercise.tags?.includes('auxiliary_error') &&
    (normUser.includes("don't") ||
      normUser.includes("doesn't") ||
      normUser.includes("didn't") ||
      normUser.includes('was') ||
      normUser.includes('were'))
  ) {
    return {
      category: 'auxiliary_error',
      confidence: 0.94,
      grammarConceptId: exercise.conceptId,
    };
  }

  // 4. Minor spelling slip in typed exercises (non-auxiliary)
  if (exercise.type === 'fill_in_the_blank' || exercise.type === 'sentence_transformation') {
    const dist = levenshteinDistance(normUser, normCorrect);
    if (dist > 0 && dist <= 2 && normCorrect.length >= 5) {
      return {
        category: 'spelling',
        confidence: 0.9,
        grammarConceptId: exercise.conceptId,
      };
    }
  }

  // 4. Exercise tag-driven classification
  const tags = exercise.tags || [];

  if (tags.includes('conditional_structure') || normUser.includes('would') || normUser.includes('had')) {
    if (tags.includes('conditional_structure')) {
      return {
        category: 'conditional_structure',
        confidence: 0.92,
        grammarConceptId: exercise.conceptId,
      };
    }
  }

  if (tags.includes('passive_voice')) {
    return {
      category: 'passive_voice',
      confidence: 0.92,
      grammarConceptId: exercise.conceptId,
    };
  }

  if (tags.includes('auxiliary_error')) {
    return {
      category: 'auxiliary_error',
      confidence: 0.9,
      grammarConceptId: exercise.conceptId,
    };
  }

  if (tags.includes('word_order') || tags.includes('inversion')) {
    return {
      category: 'word_order',
      confidence: 0.9,
      grammarConceptId: exercise.conceptId,
    };
  }

  if (tags.includes('modal_misuse') || tags.includes('modals')) {
    return {
      category: 'modal_misuse',
      confidence: 0.9,
      grammarConceptId: exercise.conceptId,
    };
  }

  if (tags.includes('relative_clause')) {
    return {
      category: 'relative_clause',
      confidence: 0.9,
      grammarConceptId: exercise.conceptId,
    };
  }

  if (tags.includes('verb_pattern') || tags.includes('gerund') || tags.includes('infinitive')) {
    return {
      category: 'verb_pattern',
      confidence: 0.9,
      grammarConceptId: exercise.conceptId,
    };
  }

  if (tags.includes('quantifier') || tags.includes('uncountable nouns') || tags.includes('comparatives') || tags.includes('superlatives')) {
    return {
      category: 'quantifier',
      confidence: 0.88,
      grammarConceptId: exercise.conceptId,
    };
  }

  if (tags.includes('connector') || tags.includes('concession')) {
    return {
      category: 'connector',
      confidence: 0.88,
      grammarConceptId: exercise.conceptId,
    };
  }

  if (tags.includes('preposition')) {
    return {
      category: 'preposition',
      confidence: 0.88,
      grammarConceptId: exercise.conceptId,
    };
  }

  if (tags.includes('tense_misuse') || tags.includes('present perfect') || tags.includes('past simple')) {
    return {
      category: 'tense_misuse',
      confidence: 0.85,
      grammarConceptId: exercise.conceptId,
    };
  }

  // 5. Multiple choice distractor confusion
  if (exercise.options && exercise.options.includes(userAnswer || '')) {
    return {
      category: 'distractor_confusion',
      confidence: 0.78,
      grammarConceptId: exercise.conceptId,
    };
  }

  // 6. Generic grammar gap fallback
  return {
    category: 'grammar_gap',
    confidence: 0.7,
    grammarConceptId: exercise.conceptId,
  };
}
