import type { CEFRLevel, Skill } from './index';

export type ExamSectionType = 'reading_listening' | 'writing' | 'speaking';

export type ExamTaskType =
  | 'multiple_choice'
  | 'gap_fill'
  | 'reading_comprehension'
  | 'extended_writing'
  | 'short_email'
  | 'interview'
  | 'reading_aloud'
  | 'long_turn';

export interface ExamQuestionDefinition {
  id: string;
  taskType: ExamTaskType;
  prompt: string;
  context?: string;
  options?: string[]; // For multiple choice
  correctAnswer?: string; // May be omitted for writing/speaking
  difficultyEstimate: number; // For adaptive engine (e.g. 0 to 100, where 50 is B1)
  cefrLevel: CEFRLevel;
  skill: Skill;
  audioScript?: string;
}

export interface ExamTaskDefinition {
  id: string;
  type: ExamTaskType;
  instructions: string;
  questions: ExamQuestionDefinition[];
}

export interface ExamSectionDefinition {
  id: string;
  type: ExamSectionType;
  title: string;
  skill: Skill | 'Integrated';
  timeLimitMs?: number;
  isAdaptive: boolean;
  tasks: ExamTaskDefinition[]; // Pool of tasks/questions
}

export interface ExamDefinition {
  id: string;
  title: string;
  version: string;
  sections: ExamSectionDefinition[];
}

export interface ExamResponse {
  questionId: string;
  selectedAnswer: string;
  timeSpentMs: number;
  isCorrect?: boolean;
}

export interface ExamAttemptState {
  id: string; // The attempt ID
  examId: string;
  userId: string;
  startedAt: string; // ISO date
  currentSectionIndex: number;
  currentTaskIndex: number; // Specifically for non-adaptive where tasks are linear
  currentQuestionId?: string; // For adaptive tracking
  isCompleted: boolean;
  completedAt?: string; // ISO date
  responses: ExamResponse[];
  sectionScores: Record<string, number>; // sectionId -> score
  overallEstimatedLevel?: CEFRLevel;
  // Adaptive specific tracking
  adaptiveDifficultyEstimate?: number;
}

// Re-defining ExamAttempt for completed exams in history
export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string; // Add userId to match consistency
  startedAt: string; // ISO date
  completedAt?: string; // ISO date
  sectionScores: Record<string, number>; // Section ID -> Score
  overallEstimatedLevel?: CEFRLevel;
  responses: ExamResponse[];
  examVersion: string;
}
