import type { ErrorClassification, VocabularyExercise, ReviewState } from '../../types';

/**
 * Standard Levenshtein distance to detect minor typos and spelling slips.
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= an; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bn; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[an][bn];
}

/**
 * Deterministically infers the likely reason for a mistake using signals such as:
 * - exercise type;
 * - typed string edit distance;
 * - prior lapses on this specific item;
 * - response speed (rushed answers);
 * - distractor properties.
 */
export function classifyVocabularyError(
  exercise: VocabularyExercise,
  userAnswer: string | undefined,
  timeSpentMs: number,
  reviewState?: Partial<ReviewState>
): ErrorClassification {
  const normUser = (userAnswer || '').trim().toLowerCase();
  const normCorrect = exercise.correctAnswer.trim().toLowerCase();

  // 1. Rushed answer: learner answered in under 2 seconds
  if (timeSpentMs > 0 && timeSpentMs < 2000) {
    return {
      category: 'rushed_answer',
      confidence: 0.85,
    };
  }

  // 2. Collocation misuse: error in collocation exercise
  if (exercise.type === 'collocation') {
    return {
      category: 'collocation_misuse',
      confidence: 0.9,
    };
  }

  // 3. Minor spelling / typo detection for typed exercises
  if (exercise.type === 'meaning_to_en' || exercise.type === 'context_blank') {
    const dist = levenshteinDistance(normUser, normCorrect);
    // If length is >= 4 and edit distance is 1 or 2, it's very likely a spelling slip
    if (dist > 0 && dist <= 2 && normCorrect.length >= 4) {
      return {
        category: 'spelling',
        confidence: 0.92,
      };
    }
  }

  // 4. Repeated misconception: word was already failed 2+ times previously
  if (reviewState && (reviewState.lapses ?? 0) >= 2) {
    return {
      category: 'repeated_misconception',
      confidence: 0.8,
    };
  }

  // 5. Distractor confusion in multiple choice
  if (exercise.options && exercise.options.includes(userAnswer || '')) {
    return {
      category: 'distractor_confusion',
      confidence: 0.75,
    };
  }

  // 6. Default fallback: vocabulary gap
  return {
    category: 'vocabulary_gap',
    confidence: 0.7,
  };
}
