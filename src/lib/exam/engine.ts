import { db } from '../db';
import type {
  ExamDefinition,
  ExamAttemptState,
  ExamResponse,
  ExamSectionDefinition,
  ExamQuestionDefinition,
} from '../../types';
import { calculateNextDifficulty, selectNextItem, shouldEndAdaptiveSection, type AdaptiveEstimate } from './adaptive';
import { evaluateSection, calculateGlobalEstimate } from './scoring';


export class ExamEngine {
  /**
   * Initializes a new exam attempt and persists it to Dexie.
   */
  static async startExam(examDef: ExamDefinition, userId: string = 'default_user'): Promise<ExamAttemptState> {
    const initialState: ExamAttemptState = {
      id: crypto.randomUUID(),
      examId: examDef.id,
      userId,
      startedAt: new Date().toISOString(),
      currentSectionIndex: 0,
      currentTaskIndex: 0,
      isCompleted: false,
      responses: [],
      sectionScores: {},
      adaptiveDifficultyEstimate: 50, // Starting at B1
    };

    // If first section is adaptive, initialize the first question
    const firstSection = examDef.sections[0];
    if (firstSection && firstSection.isAdaptive) {
      const allQuestions = firstSection.tasks.flatMap(t => t.questions);
      const firstItem = selectNextItem(allQuestions, [], initialState.adaptiveDifficultyEstimate!);
      initialState.currentQuestionId = firstItem?.id;
    }

    await db.examState.put(initialState);
    return initialState;
  }

  /**
   * Submits an answer for the current question/task and advances the state.
   */
  static async submitAnswer(
    stateId: string,
    examDef: ExamDefinition,
    questionId: string,
    selectedAnswer: string,
    timeSpentMs: number,
    isCorrect?: boolean
  ): Promise<ExamAttemptState> {
    return await db.transaction('rw', [db.examState, db.examAttempts], async () => {
      const state = await db.examState.get(stateId);
      if (!state || state.isCompleted) {
        throw new Error('Invalid or completed exam state.');
      }

      const currentSection = examDef.sections[state.currentSectionIndex];

      const response: ExamResponse = {
        questionId,
        selectedAnswer,
        timeSpentMs,
        isCorrect
      };
      state.responses.push(response);

      if (currentSection.isAdaptive) {
        // Find the question to get its difficulty
        let qDef: ExamQuestionDefinition | undefined;
        for (const t of currentSection.tasks) {
          qDef = t.questions.find(q => q.id === questionId);
          if (qDef) break;
        }

        if (qDef && isCorrect !== undefined) {
          const currentEstimate: AdaptiveEstimate = {
             difficultyEstimate: state.adaptiveDifficultyEstimate || 50,
             // Approximation: decreasing standard error based on number of questions answered
             standardError: Math.max(5, 20 - (state.responses.length * 0.5))
          };

          const nextEstimate = calculateNextDifficulty(currentEstimate, qDef, isCorrect);
          state.adaptiveDifficultyEstimate = nextEstimate.difficultyEstimate;

          const allQuestions = currentSection.tasks.flatMap(t => t.questions);
          
          if (shouldEndAdaptiveSection(nextEstimate, state.responses.length, 30)) {
            // Finish section
            await this.internalFinishSection(state, currentSection);
          } else {
            // Select next item
            const nextItem = selectNextItem(allQuestions, state.responses, nextEstimate.difficultyEstimate);
            if (nextItem) {
               state.currentQuestionId = nextItem.id;
            } else {
               // No more items available, force finish section
               await this.internalFinishSection(state, currentSection);
            }
          }
        }
      } else {
        // Non-adaptive linear progression
        // Assuming we submit a whole task or move to next task
        // For simplicity, we just advance task index here. A real implementation
        // might submit answers for multiple questions in a task at once.
        state.currentTaskIndex++;
        if (state.currentTaskIndex >= currentSection.tasks.length) {
          await this.internalFinishSection(state, currentSection);
        }
      }

      // Check if exam is fully complete after section finishes
      if (state.currentSectionIndex >= examDef.sections.length) {
         await this.internalFinishExam(state, examDef);
      } else if (state.isCompleted) {
         await this.internalFinishExam(state, examDef);
      }

      await db.examState.put(state);
      return state;
    });
  }

  /**
   * Internal helper to finish a section and calculate its score.
   */
  private static async internalFinishSection(state: ExamAttemptState, sectionDef: ExamSectionDefinition) {
    const score = evaluateSection(sectionDef, state);
    state.sectionScores[sectionDef.id] = score;
    state.currentSectionIndex++;
    state.currentTaskIndex = 0;
    state.currentQuestionId = undefined;
  }

  /**
   * Internal helper to finish the exam, calculate global score, and move to examAttempts.
   */
  private static async internalFinishExam(state: ExamAttemptState, examDef: ExamDefinition) {
    state.isCompleted = true;
    state.completedAt = new Date().toISOString();
    state.overallEstimatedLevel = calculateGlobalEstimate(state.sectionScores);
    
    // Move to historical attempts
    await db.examAttempts.put({
      id: state.id,
      examId: state.examId,
      userId: state.userId,
      startedAt: state.startedAt,
      completedAt: state.completedAt,
      sectionScores: state.sectionScores,
      overallEstimatedLevel: state.overallEstimatedLevel,
      responses: state.responses,
      examVersion: examDef.version
    });
  }
}
