import type { MasteryState, MasteryStatus, VocabularyExerciseType } from '../../types';

export interface MasteryEvaluationInput {
  exerciseType: VocabularyExerciseType;
  firstAttemptCorrect: boolean;
  eventualCorrect: boolean;
  attemptsCount: number;
  hintsUsed: number;
  timeSpentMs: number;
}

export interface NextMasteryResult {
  score: number; // 0 to 100
  status: MasteryStatus;
  firstSeenAt: string;
  lastReviewedAt: string;
  attemptsCount: number;
  firstAttemptSuccessCount: number;
  consecutiveCorrect: number;
}

/**
 * Maps numeric score and consecutive successes to a qualitative CEFR-aligned mastery status.
 * Prevents premature advancement to 'reliable' or 'used_correctly' without proven retention.
 */
export function scoreToMasteryStatus(
  score: number,
  consecutiveCorrect: number,
  attemptsCount = 0
): MasteryStatus {
  if (score <= 0 && attemptsCount === 0) return 'unseen';
  if (score < 25) return 'seen';
  if (score < 50 || consecutiveCorrect < 2) return 'recognised';
  if (score < 75 || consecutiveCorrect < 3) return 'recalled';
  if (score < 90 || consecutiveCorrect < 5) return 'used_correctly';
  return 'reliable';
}

/**
 * Pure calculation of mastery score and stage updates.
 * Follows conservative grading rules:
 * - A single success NEVER causes an item to jump directly to mastered/reliable.
 * - Succeeded on retry still preserves the first-attempt error signal.
 * - Active recall (typing) rewards more than passive recognition (multiple choice).
 * - Hints penalize mastery progression.
 */
export function calculateMastery(
  currentState: Partial<MasteryState> & { id: string },
  input: MasteryEvaluationInput,
  now: Date = new Date()
): NextMasteryResult {
  const currentScore = currentState.score ?? 0;
  const currentAttempts = currentState.attemptsCount ?? 0;
  const currentFirstSuccesses = currentState.firstAttemptSuccessCount ?? 0;
  const currentConsecutive = currentState.consecutiveCorrect ?? 0;
  const firstSeenAt = currentState.firstSeenAt ?? now.toISOString();

  let delta: number;
  let newConsecutive = currentConsecutive;
  let newFirstSuccesses = currentFirstSuccesses;

  const isActiveRecall =
    input.exerciseType === 'meaning_to_en' || input.exerciseType === 'context_blank';

  if (!input.eventualCorrect) {
    // Complete failure after max attempts
    newConsecutive = 0;
    delta = currentScore > 60 ? -20 : -12;
  } else if (!input.firstAttemptCorrect) {
    // Succeeded on retry: preserve first error!
    newConsecutive = 0;
    // Tiny consolidation gain only
    delta = 3;
    if (input.hintsUsed > 0) {
      delta = 1;
    }
  } else {
    // Clean first attempt correct!
    newConsecutive += 1;
    newFirstSuccesses += 1;

    // Base gain depends on active recall vs recognition
    const baseGain = isActiveRecall ? 16 : 10;
    delta = baseGain;

    // Hint penalty
    if (input.hintsUsed > 0) {
      delta -= input.hintsUsed * 4;
      delta = Math.max(2, delta);
    }

    // Fast recall bonus (under 5s and above 1s)
    if (input.timeSpentMs > 1000 && input.timeSpentMs < 5000) {
      delta += 2;
    }
  }

  // Bound score strictly between 0 and 100
  const nextAttemptsCount = currentAttempts + 1;
  const nextScore = Math.max(0, Math.min(100, Math.round(currentScore + delta)));
  const nextStatus = scoreToMasteryStatus(nextScore, newConsecutive, nextAttemptsCount);

  return {
    score: nextScore,
    status: nextStatus,
    firstSeenAt,
    lastReviewedAt: now.toISOString(),
    attemptsCount: currentAttempts + 1,
    firstAttemptSuccessCount: newFirstSuccesses,
    consecutiveCorrect: newConsecutive,
  };
}
