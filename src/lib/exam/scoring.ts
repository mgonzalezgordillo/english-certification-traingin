import type { CEFRLevel, ExamResponse, ExamSectionDefinition, ExamAttemptState } from '../../types';

/**
 * Maps an internal 0-100 difficulty/ability scale to a CEFR estimate.
 * This is a CONSERVATIVE internal approximation, NOT an official Cambridge score.
 */
export function mapEstimateToCEFR(estimate: number): CEFRLevel {
  if (estimate < 20) return 'A2';
  if (estimate < 40) return 'A2+';
  if (estimate < 60) return 'B1';
  if (estimate < 80) return 'B1+';
  return 'B2';
}

/**
 * Calculates a standard percentage-based score for non-adaptive sections (e.g. static tests).
 * Returns a 0-100 score.
 */
export function calculateStaticSectionScore(
  sectionDef: ExamSectionDefinition,
  responses: ExamResponse[]
): number {
  let correctCount = 0;
  let totalQuestions = 0;

  for (const task of sectionDef.tasks) {
    for (const q of task.questions) {
      // If it's a type with a correct answer
      if (q.correctAnswer) {
        totalQuestions++;
        const response = responses.find(r => r.questionId === q.id);
        if (response && response.selectedAnswer === q.correctAnswer) {
          correctCount++;
        }
      }
    }
  }

  if (totalQuestions === 0) return 0;
  return Math.round((correctCount / totalQuestions) * 100);
}

/**
 * Evaluates a section. If adaptive, uses the adaptive estimate. If static, uses percentage.
 */
export function evaluateSection(
  sectionDef: ExamSectionDefinition,
  attemptState: ExamAttemptState
): number {
  if (sectionDef.isAdaptive) {
    // For adaptive, the score is directly represented by the final difficulty estimate (0-100)
    return Math.round(attemptState.adaptiveDifficultyEstimate ?? 0);
  } else {
    // Filter responses to only this section
    // (This requires knowing which questions belong to this section)
    const sectionQuestionIds = new Set(
      sectionDef.tasks.flatMap(t => t.questions.map(q => q.id))
    );
    const sectionResponses = attemptState.responses.filter(r => sectionQuestionIds.has(r.questionId));
    
    return calculateStaticSectionScore(sectionDef, sectionResponses);
  }
}

/**
 * Averages section scores to create a global CEFR estimate.
 * Only averages sections that actually have a score > 0 (to avoid penalizing unattempted modules if partial test).
 */
export function calculateGlobalEstimate(sectionScores: Record<string, number>): CEFRLevel {
  const scores = Object.values(sectionScores).filter(s => s > 0);
  if (scores.length === 0) return 'A2'; // Default fallback

  const avgScore = scores.reduce((acc, curr) => acc + curr, 0) / scores.length;
  return mapEstimateToCEFR(avgScore);
}
