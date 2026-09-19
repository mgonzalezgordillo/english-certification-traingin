import type {
  MasteryState,
  MasteryStatus,
  GrammarStrengthState,
  GrammarExerciseType,
} from '../../types';

export interface GrammarMasteryEvaluationInput {
  exerciseType: GrammarExerciseType;
  firstAttemptCorrect: boolean;
  eventualCorrect: boolean;
  attemptsCount: number; // 1 or 2
  hintsUsed: number; // 0, 1, or 2
  timeSpentMs: number;
}

export interface NextGrammarMasteryResult {
  score: number; // 0 to 100
  status: MasteryStatus;
  strengthState: GrammarStrengthState;
  firstSeenAt: string;
  lastReviewedAt: string;
  attemptsCount: number;
  firstAttemptSuccessCount: number;
  consecutiveCorrect: number;
}

/**
 * Maps numeric score and consecutive successes to qualitative CEFR mastery status.
 * Requires consistent retention before advancing to 'used_correctly' or 'reliable'.
 */
export function scoreToGrammarStatus(
  score: number,
  consecutiveCorrect: number
): MasteryStatus {
  if (score <= 0) return 'unseen';
  if (score < 25) return 'seen';
  if (score < 50 || consecutiveCorrect < 2) return 'recognised';
  if (score < 75 || consecutiveCorrect < 3) return 'recalled';
  if (score < 90 || consecutiveCorrect < 5) return 'used_correctly';
  return 'reliable';
}

/**
 * Determines qualitative strength state (untested, weak, medium, strong)
 * based on conservative criteria (prevents single-try mastery).
 */
export function calculateGrammarStrength(
  score: number,
  attemptsCount: number,
  firstAttemptSuccessCount: number,
  consecutiveCorrect: number = 0
): GrammarStrengthState {
  if (attemptsCount === 0 || score === 0) {
    return 'untested';
  }

  const accuracy = attemptsCount > 0 ? firstAttemptSuccessCount / attemptsCount : 0;

  // Weak: low accuracy (< 50%) or multiple attempts with failure or very low score with errors
  if (consecutiveCorrect === 0 || (attemptsCount >= 2 && accuracy < 0.5) || (score < 30 && accuracy < 0.6)) {
    return 'weak';
  }

  // Strong requires both high mastery score and proven consecutive success
  if (score >= 80 && consecutiveCorrect >= 3 && accuracy >= 0.75) {
    return 'strong';
  }

  return 'medium';
}

/**
 * Pure calculation of grammar concept mastery.
 * Follows conservative grading rules:
 * - A single success NEVER causes an item to jump directly to strong/reliable.
 * - Succeeded on retry still preserves the first-attempt error signal.
 * - Sentence transformations and fill-in-the-blank reward more than recognition.
 * - Hints penalize mastery progression.
 * - Complete failure significantly penalizes the score and resets consecutive successes.
 */
export function calculateGrammarMastery(
  currentState: Partial<MasteryState> & { id: string },
  input: GrammarMasteryEvaluationInput,
  now: Date = new Date()
): NextGrammarMasteryResult {
  const currentScore = currentState.score ?? 0;
  const currentAttempts = currentState.attemptsCount ?? 0;
  const currentFirstSuccesses = currentState.firstAttemptSuccessCount ?? 0;
  const currentConsecutive = currentState.consecutiveCorrect ?? 0;
  const firstSeenAt = currentState.firstSeenAt ?? now.toISOString();

  let delta: number;
  let newConsecutive = currentConsecutive;
  let newFirstSuccesses = currentFirstSuccesses;

  // Active production (typing / transformation / error correction) vs recognition (multiple choice / choose form)
  const isProduction =
    input.exerciseType === 'sentence_transformation' ||
    input.exerciseType === 'fill_in_the_blank' ||
    input.exerciseType === 'error_correction';

  if (!input.eventualCorrect) {
    // Complete failure after maximum attempts
    newConsecutive = 0;
    // Penalty is higher if user was previously confident, preventing false mastery
    delta = currentScore > 60 ? -18 : -12;
  } else if (!input.firstAttemptCorrect) {
    // Corrected on attempt 2: preserve the first error signal!
    // Very minor consolidation credit only
    newConsecutive = 0; // Broken streak because of first error
    delta = isProduction ? 3 : 2;
    if (input.hintsUsed > 0) {
      delta = 1; // Minimal consolidation if hints were also required
    }
  } else {
    // Clean first-attempt correct!
    newConsecutive += 1;
    newFirstSuccesses += 1;

    // Base gain based on cognitive load
    const baseGain = isProduction ? 14 : 10;
    delta = baseGain;

    // Hint penalty: -4 per hint used
    if (input.hintsUsed > 0) {
      delta -= input.hintsUsed * 4;
      delta = Math.max(2, delta);
    }

    // Fast accurate response bonus (between 2s and 12s)
    if (input.timeSpentMs >= 2000 && input.timeSpentMs <= 12000 && input.hintsUsed === 0) {
      delta += 2;
    }
  }

  // Recency decay check: if last review was > 14 days ago, slight natural forgetting curve penalty
  if (currentState.lastReviewedAt) {
    const daysSinceReview =
      (now.getTime() - new Date(currentState.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReview > 14 && currentScore > 30) {
      const decay = Math.min(10, Math.floor((daysSinceReview - 14) / 7) * 2);
      delta -= decay;
    }
  }

  // Bound score strictly between 0 and 100
  const nextScore = Math.max(0, Math.min(100, Math.round(currentScore + delta)));
  const nextStatus = scoreToGrammarStatus(nextScore, newConsecutive);
  const nextAttemptsCount = currentAttempts + 1;
  const strengthState = calculateGrammarStrength(
    nextScore,
    nextAttemptsCount,
    newFirstSuccesses,
    newConsecutive
  );

  return {
    score: nextScore,
    status: nextStatus,
    strengthState,
    firstSeenAt,
    lastReviewedAt: now.toISOString(),
    attemptsCount: nextAttemptsCount,
    firstAttemptSuccessCount: newFirstSuccesses,
    consecutiveCorrect: newConsecutive,
  };
}
