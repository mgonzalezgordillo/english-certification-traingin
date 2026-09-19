import { describe, it, expect } from 'vitest';
import {
  normalizeAnswer,
  evaluateAnswer,
  processQuestionAttempt,
  calculateExerciseSessionResult,
} from '../exerciseEngine';
import type { QuestionItem, GenericExercise } from '../../../types/exercise';

describe('Exercise Engine - Normalization and Evaluation', () => {
  it('normalizes answers properly by removing extra whitespace, lowercasing, and stripping outer punctuation', () => {
    expect(normalizeAnswer('  Hello World! ')).toBe('hello world');
    expect(normalizeAnswer('“Sustainable”')).toBe('sustainable');
    expect(normalizeAnswer("It's fine.")).toBe("it's fine");
    expect(normalizeAnswer('¿Qué tal?')).toBe('qué tal');
  });

  it('evaluates single choice questions accurately', () => {
    const q: QuestionItem = {
      id: 'q1',
      mode: 'single_choice',
      prompt: 'What is the capital of the UK?',
      correctAnswer: 'London',
      options: ['London', 'Paris', 'Madrid', 'Berlin'],
    };

    expect(evaluateAnswer(q, 'London')).toBe(true);
    expect(evaluateAnswer(q, 'london')).toBe(true);
    expect(evaluateAnswer(q, 'Paris')).toBe(false);
  });

  it('evaluates multiple choice questions regardless of selection order', () => {
    const q: QuestionItem = {
      id: 'q2',
      mode: 'multiple_choice',
      prompt: 'Select all renewable energy sources:',
      correctAnswer: ['Solar', 'Wind'],
      options: ['Coal', 'Solar', 'Wind', 'Gas'],
    };

    expect(evaluateAnswer(q, ['Wind', 'Solar'])).toBe(true);
    expect(evaluateAnswer(q, ['solar', 'wind'])).toBe(true);
    expect(evaluateAnswer(q, ['Solar'])).toBe(false); // incomplete
    expect(evaluateAnswer(q, ['Solar', 'Wind', 'Coal'])).toBe(false); // contains distractor
  });

  it('evaluates text input questions with acceptable answers', () => {
    const q: QuestionItem = {
      id: 'q3',
      mode: 'text_input',
      prompt: 'Type the missing preposition:',
      correctAnswer: 'for',
      acceptableAnswers: ['to'],
    };

    expect(evaluateAnswer(q, 'for')).toBe(true);
    expect(evaluateAnswer(q, 'FOR ')).toBe(true);
    expect(evaluateAnswer(q, 'to')).toBe(true);
    expect(evaluateAnswer(q, 'about')).toBe(false);
  });

  it('evaluates ordered items in strict sequential order', () => {
    const q: QuestionItem = {
      id: 'q4',
      mode: 'ordered_items',
      prompt: 'Order the steps:',
      correctAnswer: ['Step 1', 'Step 2', 'Step 3'],
      options: ['Step 2', 'Step 1', 'Step 3'],
    };

    expect(evaluateAnswer(q, ['Step 1', 'Step 2', 'Step 3'])).toBe(true);
    expect(evaluateAnswer(q, ['Step 2', 'Step 1', 'Step 3'])).toBe(false);
  });

  it('evaluates matching pairs correctly', () => {
    const q: QuestionItem = {
      id: 'q5',
      mode: 'matching',
      prompt: 'Match students to courses',
      correctAnswer: '',
      matchingPairs: [
        { id: 'p1', prompt: 'Student 1', target: 'Course A' },
        { id: 'p2', prompt: 'Student 2', target: 'Course B' },
      ],
    };

    expect(evaluateAnswer(q, { p1: 'Course A', p2: 'Course B' })).toBe(true);
    expect(evaluateAnswer(q, { p1: 'Course B', p2: 'Course A' })).toBe(false);
  });
});

describe('Exercise Engine - Strict Assessment & Attempt Tracking', () => {
  const sampleQuestion: QuestionItem = {
    id: 'q_test',
    mode: 'single_choice',
    prompt: 'Choose the correct option',
    correctAnswer: 'Option A',
    options: ['Option A', 'Option B'],
    hints: ['Hint 1: It is letter A.'],
  };

  it('records firstAttemptCorrect as true when answered correctly on attempt #1', () => {
    const attempt = processQuestionAttempt({
      question: sampleQuestion,
      userAnswer: 'Option A',
      timeSpentMs: 5000,
      hintsUsed: 0,
    });

    expect(attempt.firstAttemptCorrect).toBe(true);
    expect(attempt.isCorrect).toBe(true);
    expect(attempt.eventualCorrectness).toBe(true);
    expect(attempt.attemptsCount).toBe(1);
    expect(attempt.firstAnswer).toBe('Option A');
    expect(attempt.subsequentAnswers).toEqual([]);
    expect(attempt.errorClassification).toBeUndefined();
  });

  it('CRITICAL: Never loses the first failure even if answered correctly on attempt #2', () => {
    // Attempt #1: Failed
    const attempt1 = processQuestionAttempt({
      question: sampleQuestion,
      userAnswer: 'Option B',
      timeSpentMs: 4500,
      hintsUsed: 0,
    });

    expect(attempt1.firstAttemptCorrect).toBe(false);
    expect(attempt1.isCorrect).toBe(false);
    expect(attempt1.eventualCorrectness).toBe(false);
    expect(attempt1.attemptsCount).toBe(1);
    expect(attempt1.errorClassification).toBeDefined();

    // Attempt #2: Correct
    const attempt2 = processQuestionAttempt({
      question: sampleQuestion,
      userAnswer: 'Option A',
      timeSpentMs: 3000,
      hintsUsed: 1,
      previousAttempt: attempt1,
    });

    // The firstAttemptCorrect MUST REMAIN FALSE
    expect(attempt2.firstAttemptCorrect).toBe(false);
    // But eventual correctness is updated
    expect(attempt2.isCorrect).toBe(true);
    expect(attempt2.eventualCorrectness).toBe(true);
    expect(attempt2.attemptsCount).toBe(2);
    expect(attempt2.firstAnswer).toBe('Option B');
    expect(attempt2.subsequentAnswers).toEqual(['Option A']);
    expect(attempt2.hintsUsed).toBe(1);
    expect(attempt2.responseTimeMs).toBe(7500);
  });
});

describe('Exercise Engine - Session Summarizer', () => {
  const dummyExercise: GenericExercise = {
    id: 'ex_summary_test',
    skill: 'Reading',
    cefrLevel: 'B1',
    difficulty: 5,
    taskType: 'short_message',
    title: 'Summary Test',
    instructions: 'Test instructions',
    conceptTags: ['detail'],
    estimatedDurationSec: 120,
    questions: [
      {
        id: 'q1',
        prompt: 'Q1',
        mode: 'single_choice',
        correctAnswer: 'A',
      },
      {
        id: 'q2',
        prompt: 'Q2',
        mode: 'single_choice',
        correctAnswer: 'B',
      },
    ],
  };

  it('computes accurate first-attempt and final scores', () => {
    const attempts = {
      q1: {
        questionId: 'q1',
        firstAnswer: 'A',
        subsequentAnswers: [],
        isCorrect: true,
        firstAttemptCorrect: true,
        eventualCorrectness: true,
        responseTimeMs: 6000,
        attemptsCount: 1,
        hintsUsed: 0,
        answeredAt: new Date().toISOString(),
      },
      q2: {
        questionId: 'q2',
        firstAnswer: 'Wrong',
        subsequentAnswers: ['B'],
        isCorrect: true,
        firstAttemptCorrect: false, // Got it right only on retry
        eventualCorrectness: true,
        responseTimeMs: 8000,
        attemptsCount: 2,
        hintsUsed: 1,
        answeredAt: new Date().toISOString(),
      },
    };

    const summary = calculateExerciseSessionResult({
      exercise: dummyExercise,
      questionAttempts: attempts,
      mode: 'training',
      startedAt: new Date(Date.now() - 14000).toISOString(),
    });

    expect(summary.totalQuestions).toBe(2);
    expect(summary.firstAttemptScore).toBe(1); // Only Q1 on first attempt
    expect(summary.finalScore).toBe(2); // Both Q1 and Q2 eventually correct
    expect(summary.firstAttemptAccuracy).toBe(50);
    expect(summary.finalAccuracy).toBe(100);
    expect(summary.totalTimeMs).toBe(14000);
  });
});
