import type { ExamQuestionDefinition, ExamResponse } from '../../types';

export interface AdaptiveEstimate {
  difficultyEstimate: number; // 0 to 100
  standardError: number;      // Confidence. Lower is better.
}

const CONSTANTS = {
  START_DIFFICULTY: 50, // Starts at middle (B1 level)
  MIN_DIFFICULTY: 0,
  MAX_DIFFICULTY: 100,
  // The amount we adjust the estimate based on a right/wrong answer
  // (In a true IRT, this depends on item discrimination and current standard error)
  ADJUST_STEP_CORRECT: 10,
  ADJUST_STEP_INCORRECT: 12, // slightly harsher penalty
  MIN_STANDARD_ERROR: 5,     // Stop condition threshold
};

/**
 * Very basic approximation of an adaptive algorithm (IRT-lite).
 * Adjusts difficulty up if correct, down if incorrect.
 */
export function calculateNextDifficulty(
  currentEstimate: AdaptiveEstimate,
  lastQuestion: ExamQuestionDefinition,
  isCorrect: boolean
): AdaptiveEstimate {
  let newDifficulty = currentEstimate.difficultyEstimate;

  // Decrease error as we get more data points.
  // In a real system, error drops based on how close the item difficulty was to the user's ability.
  const distance = Math.abs(currentEstimate.difficultyEstimate - lastQuestion.difficultyEstimate);
  
  // If the item was close to their estimated level, confidence increases (error drops) more
  const errorDrop = Math.max(1, 5 - (distance / 10));
  const newError = Math.max(CONSTANTS.MIN_STANDARD_ERROR, currentEstimate.standardError - errorDrop);

  if (isCorrect) {
    // If they got it right, increase difficulty estimate
    newDifficulty += CONSTANTS.ADJUST_STEP_CORRECT * (newError / 20);
  } else {
    // If wrong, decrease difficulty estimate
    newDifficulty -= CONSTANTS.ADJUST_STEP_INCORRECT * (newError / 20);
  }

  // Bound it
  newDifficulty = Math.max(CONSTANTS.MIN_DIFFICULTY, Math.min(CONSTANTS.MAX_DIFFICULTY, newDifficulty));

  return {
    difficultyEstimate: newDifficulty,
    standardError: newError,
  };
}

/**
 * Select the most appropriate next item from a pool, given the target difficulty.
 * Avoids items already answered.
 */
export function selectNextItem(
  pool: ExamQuestionDefinition[],
  history: ExamResponse[],
  targetDifficulty: number
): ExamQuestionDefinition | null {
  const answeredIds = new Set(history.map(h => h.questionId));
  
  const availableItems = pool.filter(item => !answeredIds.has(item.id));
  if (availableItems.length === 0) return null;

  // Find the item with difficulty closest to target
  let bestItem = availableItems[0];
  let minDiff = Math.abs(bestItem.difficultyEstimate - targetDifficulty);

  for (let i = 1; i < availableItems.length; i++) {
    const diff = Math.abs(availableItems[i].difficultyEstimate - targetDifficulty);
    if (diff < minDiff) {
      minDiff = diff;
      bestItem = availableItems[i];
    }
  }

  return bestItem;
}

/**
 * Decides whether the adaptive section should end based on current standard error and max questions.
 */
export function shouldEndAdaptiveSection(
  currentEstimate: AdaptiveEstimate,
  questionCount: number,
  maxQuestions: number,
  minQuestions: number = 10
): boolean {
  if (questionCount >= maxQuestions) return true;
  if (questionCount >= minQuestions && currentEstimate.standardError <= CONSTANTS.MIN_STANDARD_ERROR) {
    return true;
  }
  return false;
}
