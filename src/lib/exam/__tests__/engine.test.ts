import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { ExamEngine } from '../engine';
import { db } from '../../db';
import { mockMiniExam } from '../../../data/mockExam';

// Mock crypto.randomUUID if not available in testing env
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random()
    }
  });
}

describe('Exam Engine State Machine', () => {
  beforeEach(async () => {
    // Clear relevant tables before each test
    await db.examState.clear();
    await db.examAttempts.clear();
  });

  it('starts an exam and creates initial state in db', async () => {
    const state = await ExamEngine.startExam(mockMiniExam);
    
    expect(state.examId).toBe(mockMiniExam.id);
    expect(state.isCompleted).toBe(false);
    expect(state.currentSectionIndex).toBe(0);
    expect(state.adaptiveDifficultyEstimate).toBe(50);
    
    // Check it's in Dexie
    const dbState = await db.examState.get(state.id);
    expect(dbState).toBeDefined();
    expect(dbState?.id).toBe(state.id);
  });

  it('progresses adaptive state on correct answer', async () => {
    const state = await ExamEngine.startExam(mockMiniExam);
    
    // The first question should be q-r-2 (difficulty 60 is closest to 50 among remaining?)
    // Actually q-r-3 is 80, q-r-2 is 60, q-r-1 is 20, q-r-4 is 10.
    // So target 50 -> q-r-2 (distance 10) is closest.
    expect(state.currentQuestionId).toBe('q-r-2');

    // Submit correct answer
    const newState = await ExamEngine.submitAnswer(
      state.id,
      mockMiniExam,
      'q-r-2',
      'Attendees should keep their post-meeting schedule clear.',
      15000,
      true
    );

    // Difficulty should increase
    expect(newState.adaptiveDifficultyEstimate).toBeGreaterThan(50);
    expect(newState.responses).toHaveLength(1);
    expect(newState.responses[0].isCorrect).toBe(true);
  });

  it('finishes exam when all questions in mini mock are exhausted', async () => {
    let state = await ExamEngine.startExam(mockMiniExam);
    
    // We have 4 questions in mockMiniExam.
    // We submit answers 4 times to exhaust them.
    for (let i = 0; i < 4; i++) {
       if (state.currentQuestionId) {
          state = await ExamEngine.submitAnswer(
            state.id,
            mockMiniExam,
            state.currentQuestionId,
            'dummy answer',
            1000,
            true
          );
       }
    }

    // After exhausting all 4 items, the section should finish, and since it's the only section, the exam finishes.
    expect(state.isCompleted).toBe(true);
    expect(state.overallEstimatedLevel).toBeDefined();

    // Verify it moved to examAttempts
    const attemptInDb = await db.examAttempts.get(state.id);
    expect(attemptInDb).toBeDefined();
    expect(attemptInDb && 'isCompleted' in attemptInDb).toBe(false); // examAttempts doesn't have isCompleted
    expect(attemptInDb?.examVersion).toBe(mockMiniExam.version);
  });
});
