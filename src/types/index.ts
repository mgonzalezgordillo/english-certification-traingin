export type CEFRLevel = 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2';

export type Skill = 'Reading' | 'Listening' | 'Writing' | 'Speaking' | 'Grammar' | 'Vocabulary';

export type MasteryStatus = 'unseen' | 'seen' | 'recognised' | 'recalled' | 'used_correctly' | 'reliable';

export interface MasteryState {
  id: string; // References a VocabularyItem or GrammarConcept
  status: MasteryStatus;
  score: number; // 0 to 100
  firstSeenAt: string; // ISO date
  lastReviewedAt?: string; // ISO date
  attemptsCount?: number;
  firstAttemptSuccessCount?: number;
  consecutiveCorrect?: number;
}

export interface ReviewState {
  id: string;
  nextReviewDate: string; // ISO date
  interval: number; // Days (or fractional days)
  easeFactor: number; // Default 2.5, min 1.3
  repetitions: number;
  lapses: number;
  lastReviewDate?: string; // ISO date
  consecutiveCorrect: number;
}

export interface VocabularyItem {
  id: string;
  word: string;
  lemma: string;
  pos: string; // part of speech e.g., 'noun', 'verb', 'phrasal verb', 'connector', 'adjective', 'adverb'
  cefrLevel: CEFRLevel;
  priorityScore: number; // 1 to 100
  meaning: string;
  meaningEs?: string; // Spanish meaning / translation for Type B recall
  examples: string[];
  collocations: string[];
  audioRef?: string;
  synonyms: string[];
  antonyms: string[];
  tags: string[];
  usageNote?: string;
  relatedPhrasals?: string[];
}

export interface GrammarCommonMistake {
  incorrect: string;
  correct: string;
  explanation: string;
}

export interface GrammarContrast {
  conceptId: string;
  conceptTitle: string;
  distinction: string;
  exampleA: string;
  exampleB: string;
}

export interface GrammarConcept {
  id: string;
  title: string;
  cefrLevel: CEFRLevel;
  category: string;
  shortDescription?: string;
  formStructure?: string;
  explanation: string;
  examples: string[];
  commonMistakes: (string | GrammarCommonMistake)[];
  contrast?: GrammarContrast;
  prerequisites?: string[];
  tags: string[];
}

export interface ErrorClassification {
  category:
    | 'vocabulary_gap'
    | 'grammar_gap'
    | 'misunderstood_instruction'
    | 'distractor_confusion'
    | 'repeated_misconception'
    | 'rushed_answer'
    | 'uncertain_guess'
    | 'comprehension_gap'
    | 'spelling'
    | 'tense_misuse'
    | 'auxiliary_error'
    | 'word_order'
    | 'modal_misuse'
    | 'conditional_structure'
    | 'relative_clause'
    | 'passive_voice'
    | 'verb_pattern'
    | 'quantifier'
    | 'article'
    | 'preposition'
    | 'connector'
    | 'collocation_misuse'
    | 'other';
  confidence: number; // 0 to 1
  grammarConceptId?: string;
}

export interface AnswerAttempt {
  timestamp: string; // ISO date
  selectedAnswer?: string;
  isCorrect: boolean;
  timeSpentMs: number;
  hintsRequested: number;
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  userId: string;
  startedAt: string; // ISO date
  completedAt?: string; // ISO date
  attempts: AnswerAttempt[];
  finalCorrect: boolean;
  errorClassification?: ErrorClassification;
}

export interface Exercise {
  id: string;
  type: 'multiple_choice' | 'fill_in_the_blank' | 'reading_comprehension' | 'listening_comprehension' | 'speaking' | 'writing';
  cefrLevel: CEFRLevel;
  skill: Skill;
  content: string | Record<string, unknown>; // Depends on the type
  options?: string[]; // For multiple choice
  correctAnswer?: string;
  tags: string[];
}

export interface StudySession {
  id: string;
  startedAt: string; // ISO date
  endedAt?: string; // ISO date
  durationMs?: number;
  exercisesAttempted: string[]; // ExerciseAttempt IDs
}

export interface ListeningAttempt {
  id: string;
  exerciseId: string;
  cefrLevel: CEFRLevel;
  startedAt: string;
  completedAt: string;
  firstAttemptAccuracy: number;
  finalAccuracy: number;
  totalQuestions: number;
  totalTimeMs: number;
}

export interface SpeakingAttempt {
  id: string;
  promptId: string;
  cefrLevel: CEFRLevel;
  startedAt: string;
  completedAt: string;
  durationSec: number;
  preparationSec: number;
  checklist: string[];
  audioBlob?: Blob;
}

export interface WritingRubricResult {
  taskCompletion: boolean;
  approximateLength: boolean;
  paragraphing: boolean;
  connectorCount: number;
  lexicalVariety: number;
}

export interface WritingAttempt {
  id: string;
  promptId: string;
  cefrLevel: CEFRLevel;
  startedAt: string;
  completedAt: string;
  text: string;
  wordCount: number;
  durationSec: number;
  rubric: WritingRubricResult;
}

export interface SkillEstimate {
  skill: Skill;
  level: CEFRLevel;
  confidence: number; // 0 to 1
}

export interface UserProfile {
  id: string;
  estimatedGlobalLevel: CEFRLevel;
  skills: Record<Skill, SkillEstimate>;
  createdAt: string; // ISO date
  lastActiveAt: string; // ISO date
}

export * from './exam';

export interface AIProvider {
  name: string;
  initialize: (apiKey?: string) => Promise<void>;
  getExplanation: (conceptId: string, context?: string) => Promise<string>;
  classifyError: (attempt: ExerciseAttempt, exercise: Exercise) => Promise<ErrorClassification>;
  generateExercise: (conceptId: string) => Promise<Exercise | null>;
  isAvailable: () => boolean;
}

export type VocabularyExerciseType =
  | 'en_to_meaning'   // Type A: English word -> Spanish meaning / definition (Multiple Choice)
  | 'meaning_to_en'   // Type B: Spanish meaning -> English word (Typing recall)
  | 'context_blank'   // Type C: Sentence context with gap (Typing or Multiple Choice)
  | 'collocation'     // Type D: Collocation completion (Multiple Choice)
  | 'flashcard';      // Flashcard prompt & self-assessment

export interface VocabularyExercise {
  id: string;
  vocabularyId: string;
  type: VocabularyExerciseType;
  prompt: string;
  contextSentence?: string; // Example sentence with blank e.g. "She worked hard to _____ her goal."
  blankTarget?: string; // The blank word
  options?: string[]; // Multiple choice options
  correctAnswer: string;
  acceptedAnswers?: string[]; // Synonyms or alternative forms
  hints: string[]; // 1: first letter & length, 2: grammatical/collocation hint, 3: detailed clue
  explanation: string;
}

export type TrainingSessionMode = 'smart_mix' | 'due_only' | 'weak_only' | 'new_only' | 'cefr';

export interface TrainingSessionConfig {
  itemCount: number; // 10, 20, 40
  mode: TrainingSessionMode;
  targetCefr?: CEFRLevel;
  preferredType?: VocabularyExerciseType | 'mixed';
}

export interface VocabularyWithProgress {
  item: VocabularyItem;
  mastery: MasteryState;
  review: ReviewState;
}

export type GrammarExerciseType =
  | 'multiple_choice'
  | 'fill_in_the_blank'
  | 'sentence_transformation'
  | 'choose_form'
  | 'error_correction'
  | 'contrast_choice';

export interface GrammarExercise {
  id: string;
  conceptId: string;
  type: GrammarExerciseType;
  cefrLevel: CEFRLevel;
  prompt: string;
  sentenceContext?: string; // Sentence with blank e.g. "If she _____ (know) the answer, she would tell you."
  options?: string[]; // Multiple choice / form choices
  correctAnswer: string;
  acceptedAnswers?: string[]; // Allowed variations (e.g. contractions)
  originalSentence?: string; // For transformations / error correction
  keyWord?: string; // For Cambridge-style sentence transformation (e.g. "HAVE")
  errorTarget?: string; // For error correction (the wrong word/segment)
  hints: string[]; // [Hint 1 structural clue, Hint 2 grammatical rule]
  explanation: string;
  tags: string[];
}

export type GrammarStrengthState = 'untested' | 'weak' | 'medium' | 'strong';

export interface GrammarWithProgress {
  concept: GrammarConcept;
  mastery: MasteryState;
  exerciseCount: number;
  strengthState: GrammarStrengthState;
  lastPracticedAt?: string;
  errorCount: number;
}

export * from './exercise';
export * from './exam';
