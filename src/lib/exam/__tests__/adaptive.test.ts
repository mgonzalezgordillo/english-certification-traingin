import { describe, it, expect } from 'vitest';
import { calculateNextDifficulty, selectNextItem, shouldEndAdaptiveSection, type AdaptiveEstimate } from '../adaptive';
import type { ExamQuestionDefinition } from '../../../types';

describe('Adaptive Exam Engine', () => {
  it('increases difficulty when answer is correct', () => {
    const currentEstimate: AdaptiveEstimate = { difficultyEstimate: 50, standardError: 20 };
    const question: ExamQuestionDefinition = {
      id: 'q1', taskType: 'multiple_choice', prompt: '', cefrLevel: 'B1', skill: 'Reading', difficultyEstimate: 50
    };
    
    const next = calculateNextDifficulty(currentEstimate, question, true);
    
    // Expect difficulty to go up from 50
    expect(next.difficultyEstimate).toBeGreaterThan(50);
    // Expect error to drop since distance is 0 (50 - 50)
    expect(next.standardError).toBeLessThan(20);
  });

  it('decreases difficulty when answer is incorrect', () => {
    const currentEstimate: AdaptiveEstimate = { difficultyEstimate: 50, standardError: 20 };
    const question: ExamQuestionDefinition = {
      id: 'q1', taskType: 'multiple_choice', prompt: '', cefrLevel: 'B1', skill: 'Reading', difficultyEstimate: 50
    };
    
    const next = calculateNextDifficulty(currentEstimate, question, false);
    
    expect(next.difficultyEstimate).toBeLessThan(50);
    expect(next.standardError).toBeLessThan(20);
  });

  it('selects the item closest to the target difficulty', () => {
    const pool: ExamQuestionDefinition[] = [
      { id: 'q1', difficultyEstimate: 20, taskType: 'multiple_choice', prompt: '', cefrLevel: 'A2', skill: 'Reading' },
      { id: 'q2', difficultyEstimate: 80, taskType: 'multiple_choice', prompt: '', cefrLevel: 'B2', skill: 'Reading' },
      { id: 'q3', difficultyEstimate: 48, taskType: 'multiple_choice', prompt: '', cefrLevel: 'B1', skill: 'Reading' },
    ];
    
    const target = 50;
    const selected = selectNextItem(pool, [], target);
    
    expect(selected?.id).toBe('q3');
  });

  it('ignores already answered items', () => {
    const pool: ExamQuestionDefinition[] = [
      { id: 'q1', difficultyEstimate: 49, taskType: 'multiple_choice', prompt: '', cefrLevel: 'B1', skill: 'Reading' },
      { id: 'q2', difficultyEstimate: 51, taskType: 'multiple_choice', prompt: '', cefrLevel: 'B1', skill: 'Reading' },
    ];
    
    // Assume q1 was answered
    const history = [{ questionId: 'q1', selectedAnswer: 'A', timeSpentMs: 1000 }];
    const selected = selectNextItem(pool, history, 50);
    
    expect(selected?.id).toBe('q2');
  });

  it('stops if max questions reached', () => {
    const estimate = { difficultyEstimate: 50, standardError: 10 };
    expect(shouldEndAdaptiveSection(estimate, 30, 30, 10)).toBe(true);
  });

  it('stops if error is low enough and min questions reached', () => {
    const estimate = { difficultyEstimate: 50, standardError: 4 }; // below min of 5
    expect(shouldEndAdaptiveSection(estimate, 15, 30, 10)).toBe(true);
  });
});
