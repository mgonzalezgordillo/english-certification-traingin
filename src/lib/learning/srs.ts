import type { ReviewState } from '../../types';

export interface SRSEvaluationInput {
  firstAttemptCorrect: boolean;
  eventualCorrect: boolean;
  hintsUsed: number;
  timeSpentMs: number;
  attemptsCount: number;
}

export interface NextSRSResult {
  nextReviewDate: string;
  interval: number; // in days
  easeFactor: number;
  repetitions: number;
  lapses: number;
  consecutiveCorrect: number;
  lastReviewDate: string;
}

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Pure deterministic calculation of the next Spaced Repetition state.
 * Conservative scheduling: prioritizes retention and avoids prematurely declaring mastery.
 */
export function calculateNextReview(
  currentState: Partial<ReviewState> & { id: string },
  input: SRSEvaluationInput,
  now: Date = new Date()
): NextSRSResult {
  const easeFactor = currentState.easeFactor ?? DEFAULT_EASE_FACTOR;
  const repetitions = currentState.repetitions ?? 0;
  const lapses = currentState.lapses ?? 0;
  const consecutiveCorrect = currentState.consecutiveCorrect ?? 0;
  const currentInterval = currentState.interval ?? 0;

  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newLapses = lapses;
  let newConsecutiveCorrect = consecutiveCorrect;
  let newIntervalDays: number;

  const isFastResponse = input.timeSpentMs > 0 && input.timeSpentMs < 6000;

  if (!input.eventualCorrect) {
    // 1. FAILED AFTER MAXIMUM ATTEMPTS
    newLapses += 1;
    newRepetitions = 0;
    newConsecutiveCorrect = 0;
    // Ease factor drops
    newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
    // Interval resets conservatively to 1 day
    newIntervalDays = 1;
  } else if (!input.firstAttemptCorrect || input.hintsUsed > 0) {
    // 2. EVENTUALLY CORRECT, BUT FAILED ON 1ST ATTEMPT OR USED HINTS
    // Retain first-error signal! Conservative progression.
    newConsecutiveCorrect = 0;
    newRepetitions = Math.min(1, repetitions);
    // Small ease penalty for needing hints or a retry
    const penalty = input.hintsUsed > 1 ? 0.15 : 0.08;
    newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - penalty);
    // Keep review very close: 1 day if previous was 0 or 1, max 2 days
    newIntervalDays = currentInterval > 3 ? 2 : 1;
  } else {
    // 3. CLEAN FIRST ATTEMPT SUCCESS (No hints, 1st attempt correct)
    newRepetitions += 1;
    newConsecutiveCorrect += 1;

    // Small bonus for fast and confident recall
    if (isFastResponse && input.timeSpentMs > 1000) {
      newEaseFactor = Math.min(3.0, easeFactor + 0.1);
    }

    if (newRepetitions === 1) {
      newIntervalDays = isFastResponse ? 2 : 1;
    } else if (newRepetitions === 2) {
      newIntervalDays = isFastResponse ? 4 : 3;
    } else if (newRepetitions === 3) {
      newIntervalDays = 7;
    } else {
      // Repetition 4+
      const baseInterval = currentInterval > 0 ? currentInterval : 7;
      newIntervalDays = Math.round(baseInterval * newEaseFactor);
      // Hard cap to avoid excessive runaway intervals early on
      newIntervalDays = Math.min(60, newIntervalDays);
    }
  }

  // Calculate future date in UTC ISO format
  const nextDate = new Date(now.getTime() + newIntervalDays * 24 * 60 * 60 * 1000);

  return {
    nextReviewDate: nextDate.toISOString(),
    interval: newIntervalDays,
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    repetitions: newRepetitions,
    lapses: newLapses,
    consecutiveCorrect: newConsecutiveCorrect,
    lastReviewDate: now.toISOString(),
  };
}
