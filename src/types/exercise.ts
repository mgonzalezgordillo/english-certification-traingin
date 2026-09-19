import type { CEFRLevel, Skill } from './index';

export type ExerciseAnswerMode =
  | 'single_choice'
  | 'multiple_choice'
  | 'text_input'
  | 'fill_gap'
  | 'matching'
  | 'ordered_items'
  | 'sentence_completion';

export interface MatchingPair {
  id: string;
  prompt: string; // e.g. "Reader 1: Sarah wants a course with evening classes..."
  target: string; // e.g. "Course C: Digital Marketing Evening Intensive"
}

export interface QuestionItem {
  id: string; // e.g. "q1", "gap1"
  prompt: string;
  mode: ExerciseAnswerMode;
  options?: string[]; // Multiple choice options, dropdown choices, or matching options
  correctAnswer: string | string[]; // Single string, or array of strings for multiple choice / ordered items
  acceptableAnswers?: string[]; // Alternative valid answers (e.g. spelling variants, synonyms, punctuation variants)
  distractors?: string[]; // Distractor choices if relevant
  matchingPairs?: MatchingPair[]; // For matching task types
  hints?: string[]; // Progressive hints for this question
  explanation?: string; // Specific rationale/explanation for this question
  conceptTags?: string[]; // e.g. ['detail', 'inference', 'connectors', 'vocabulary', 'main_idea']
}

export interface ExerciseContent {
  text?: string; // Main reading text / article / passage
  formattedText?: string; // Preformatted or structured text
  context?: string; // Short background or scenario
  author?: string;
  source?: string;
  paragraphs?: { id: string; text: string }[]; // For paragraph ordering or gapped text
  texts?: { id: string; title: string; body: string }[]; // For multi-text matching (e.g. Text A, B, C, D)
  audioScript?: string; // Speech-synthesis fallback for listening activities
  speakerLabel?: string;
}

export interface GenericExercise {
  id: string;
  skill: Skill; // 'Reading', 'Grammar', 'Vocabulary', 'Listening', etc.
  cefrLevel: CEFRLevel;
  difficulty: number; // 1 to 10 deterministic scale (separate from CEFR)
  taskType: string; // e.g. 'short_message', 'multiple_choice_cloze', 'open_cloze', 'matching', 'sentence_insertion', 'ordered_items', 'long_passage'
  title: string;
  instructions: string; // Spanish or English directions
  content?: ExerciseContent;
  questions: QuestionItem[];
  hints?: string[]; // Exercise-level hints
  explanation?: string; // Global explanation/translation
  conceptTags: string[]; // High-level tags
  estimatedDurationSec: number; // e.g. 180 (3 min)
  sourceMetadata?: {
    author?: string;
    source?: string;
    notes?: string;
  };
}

export type ReadingErrorCategory =
  | 'vocabulary_comprehension'
  | 'missed_detail'
  | 'main_idea'
  | 'inference'
  | 'reference_pronoun'
  | 'connector_logical_relation'
  | 'distractor_confusion'
  | 'rushed_answer'
  | 'text_structure'
  | 'other';

export interface ReadingErrorClassification {
  category: ReadingErrorCategory;
  confidence: number; // 0 to 1
  detectedTrigger?: string;
}

export interface QuestionAttempt {
  questionId: string;
  firstAnswer: string | string[];
  subsequentAnswers: (string | string[])[];
  isCorrect: boolean; // Eventual correctness
  firstAttemptCorrect: boolean; // CRITICAL: Was it answered correctly on the very first attempt?
  eventualCorrectness: boolean; // Synonym for isCorrect
  responseTimeMs: number;
  attemptsCount: number;
  hintsUsed: number;
  errorClassification?: ReadingErrorClassification;
  answeredAt: string; // ISO date
}

export interface ExerciseSessionResult {
  id: string; // UUID
  exerciseId: string;
  skill: Skill;
  taskType: string;
  cefrLevel: CEFRLevel;
  difficulty: number;
  mode: 'training' | 'exam';
  startedAt: string; // ISO date
  completedAt: string; // ISO date
  totalTimeMs: number;
  questionAttempts: Record<string, QuestionAttempt>;
  totalQuestions: number;
  firstAttemptScore: number; // Number of questions correct on attempt #1
  finalScore: number; // Number of questions eventually correct
  firstAttemptAccuracy: number; // 0 to 100 percentage
  finalAccuracy: number; // 0 to 100 percentage
  inferredErrors: ReadingErrorClassification[];
}

export interface ReadingProgressRecord {
  id: string; // Matches exerciseId
  exerciseId: string;
  cefrLevel: CEFRLevel;
  difficulty: number;
  status: 'completed' | 'in_progress';
  bestFirstAttemptAccuracy: number; // 0 to 100 percentage
  lastAttemptAccuracy: number;
  lastAttemptAt: string; // ISO date
  attemptsCount: number;
}
