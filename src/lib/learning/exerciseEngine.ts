import type {
  GenericExercise,
  QuestionItem,
  QuestionAttempt,
  ExerciseSessionResult,
  ReadingErrorClassification,
} from '../../types/exercise';
import { classifyReadingError } from './readingErrors';

/**
 * Normalizes learner typed input for robust and fair answer comparison.
 * Trims whitespace, lowercases, normalizes quotes/apostrophes, and strips redundant punctuation.
 */
export function normalizeAnswer(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[’‘`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/^[¿¡?!.,;:_\s"']+|[¿¡?!.,;:_\s"']+$/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Checks if two string arrays contain the exact same items regardless of order.
 */
function arraysMatchUnordered(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].map(normalizeAnswer).sort();
  const sortedB = [...b].map(normalizeAnswer).sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

/**
 * Checks if two string arrays match strictly in order.
 */
function arraysMatchOrdered(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => normalizeAnswer(val) === normalizeAnswer(b[idx]));
}

/**
 * Evaluates whether a user's submitted answer is correct for a given QuestionItem.
 * Robustly handles all answer modes: single_choice, multiple_choice, text_input,
 * fill_gap, matching, ordered_items, and sentence_completion.
 */
export function evaluateAnswer(question: QuestionItem, userAnswer: unknown): boolean {
  if (userAnswer === undefined || userAnswer === null) return false;

  switch (question.mode) {
    case 'single_choice':
    case 'sentence_completion': {
      if (typeof userAnswer !== 'string') return false;
      const normUser = normalizeAnswer(userAnswer);
      const targets = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const allAcceptable = [...targets, ...(question.acceptableAnswers || [])].map(normalizeAnswer);
      return allAcceptable.includes(normUser);
    }

    case 'text_input': {
      if (typeof userAnswer !== 'string') return false;
      const normUser = normalizeAnswer(userAnswer);
      const targets = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const allAcceptable = [...targets, ...(question.acceptableAnswers || [])].map(normalizeAnswer);
      return allAcceptable.includes(normUser);
    }

    case 'multiple_choice': {
      if (!Array.isArray(userAnswer)) return false;
      const expected = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      return arraysMatchUnordered(userAnswer as string[], expected);
    }

    case 'fill_gap': {
      if (typeof userAnswer === 'string') {
        const normUser = normalizeAnswer(userAnswer);
        const targets = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : [question.correctAnswer];
        const allAcceptable = [...targets, ...(question.acceptableAnswers || [])].map(normalizeAnswer);
        return allAcceptable.includes(normUser);
      }
      if (typeof userAnswer === 'object' && userAnswer !== null) {
        // Multi-gap fill map: { [gapId: string]: string }
        const userMap = userAnswer as Record<string, string>;
        if (Array.isArray(question.correctAnswer)) {
          // If correctAnswer is an array of strings corresponding to gap index
          const userValues = Object.keys(userMap)
            .sort()
            .map((k) => userMap[k]);
          return arraysMatchOrdered(userValues, question.correctAnswer);
        }
        return false;
      }
      return false;
    }

    case 'matching': {
      // User answer can be a Record<string, string> where promptId -> target or prompt -> target
      if (typeof userAnswer !== 'object' || userAnswer === null) return false;
      const userMatches = userAnswer as Record<string, string>;

      if (question.matchingPairs && question.matchingPairs.length > 0) {
        for (const pair of question.matchingPairs) {
          const userSelected = userMatches[pair.id] ?? userMatches[pair.prompt];
          if (normalizeAnswer(userSelected || '') !== normalizeAnswer(pair.target)) {
            return false;
          }
        }
        return true;
      }

      // If matching is defined via correctAnswer as an object or key-value format
      if (typeof question.correctAnswer === 'object' && !Array.isArray(question.correctAnswer)) {
        const targetMap = question.correctAnswer as Record<string, string>;
        for (const key of Object.keys(targetMap)) {
          if (normalizeAnswer(userMatches[key] || '') !== normalizeAnswer(targetMap[key])) {
            return false;
          }
        }
        return true;
      }

      return false;
    }

    case 'ordered_items': {
      if (!Array.isArray(userAnswer)) return false;
      if (!Array.isArray(question.correctAnswer)) return false;
      return arraysMatchOrdered(userAnswer as string[], question.correctAnswer);
    }

    default:
      return false;
  }
}

/**
 * Processes a question attempt with strict assessment rules.
 * CRITICAL: The first attempt correctness is permanently recorded on the first check.
 * Subsequent correct answers improve eventualCorrectness, but do NOT overwrite firstAttemptCorrect.
 */
export function processQuestionAttempt(params: {
  question: QuestionItem;
  userAnswer: string | string[];
  timeSpentMs: number;
  hintsUsed: number;
  previousAttempt?: QuestionAttempt;
  now?: Date;
}): QuestionAttempt {
  const { question, userAnswer, timeSpentMs, hintsUsed, previousAttempt, now = new Date() } = params;
  const isCorrect = evaluateAnswer(question, userAnswer);

  if (!previousAttempt) {
    // Attempt #1
    const firstAttemptCorrect = isCorrect;
    const errorClassification = isCorrect
      ? undefined
      : classifyReadingError(question, userAnswer, timeSpentMs);

    return {
      questionId: question.id,
      firstAnswer: userAnswer,
      subsequentAnswers: [],
      isCorrect,
      firstAttemptCorrect,
      eventualCorrectness: isCorrect,
      responseTimeMs: timeSpentMs,
      attemptsCount: 1,
      hintsUsed,
      errorClassification,
      answeredAt: now.toISOString(),
    };
  }

  // Attempt #2 or subsequent
  const attemptsCount = previousAttempt.attemptsCount + 1;
  const subsequentAnswers = [...previousAttempt.subsequentAnswers, userAnswer];
  const totalTimeSpentMs = previousAttempt.responseTimeMs + timeSpentMs;
  const totalHintsUsed = Math.max(previousAttempt.hintsUsed, hintsUsed);

  // If now correct, clear or retain original errorClassification
  const errorClassification = isCorrect
    ? undefined
    : classifyReadingError(question, userAnswer, totalTimeSpentMs, attemptsCount);

  return {
    questionId: question.id,
    firstAnswer: previousAttempt.firstAnswer,
    subsequentAnswers,
    isCorrect,
    firstAttemptCorrect: previousAttempt.firstAttemptCorrect, // PRESERVE STRICT FIRST ERROR
    eventualCorrectness: isCorrect,
    responseTimeMs: totalTimeSpentMs,
    attemptsCount,
    hintsUsed: totalHintsUsed,
    errorClassification,
    answeredAt: now.toISOString(),
  };
}

/**
 * Summarizes an entire exercise session into an ExerciseSessionResult.
 */
export function calculateExerciseSessionResult(params: {
  exercise: GenericExercise;
  questionAttempts: Record<string, QuestionAttempt>;
  mode: 'training' | 'exam';
  startedAt: string;
  completedAt?: string;
  now?: Date;
}): ExerciseSessionResult {
  const { exercise, questionAttempts, mode, startedAt, completedAt, now = new Date() } = params;
  const effectiveCompletedAt = completedAt || now.toISOString();

  const totalQuestions = exercise.questions.length;
  let firstAttemptScore = 0;
  let finalScore = 0;
  let totalTimeMs = 0;
  const inferredErrors: ReadingErrorClassification[] = [];

  for (const q of exercise.questions) {
    const attempt = questionAttempts[q.id];
    if (attempt) {
      if (attempt.firstAttemptCorrect) {
        firstAttemptScore++;
      }
      if (attempt.eventualCorrectness) {
        finalScore++;
      }
      totalTimeMs += attempt.responseTimeMs;
      if (attempt.errorClassification) {
        inferredErrors.push(attempt.errorClassification);
      }
    }
  }

  const firstAttemptAccuracy =
    totalQuestions > 0 ? Math.round((firstAttemptScore / totalQuestions) * 100) : 0;
  const finalAccuracy =
    totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;

  return {
    id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    exerciseId: exercise.id,
    skill: exercise.skill,
    taskType: exercise.taskType,
    cefrLevel: exercise.cefrLevel,
    difficulty: exercise.difficulty,
    mode,
    startedAt,
    completedAt: effectiveCompletedAt,
    totalTimeMs,
    questionAttempts,
    totalQuestions,
    firstAttemptScore,
    finalScore,
    firstAttemptAccuracy,
    finalAccuracy,
    inferredErrors,
  };
}
