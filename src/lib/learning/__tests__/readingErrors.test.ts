import { describe, it, expect } from 'vitest';
import { classifyReadingError } from '../readingErrors';
import type { QuestionItem } from '../../../types/exercise';

describe('Reading Error Classification', () => {
  it('detects rushed answers when time spent is under 4 seconds', () => {
    const q: QuestionItem = {
      id: 'q_rush',
      mode: 'single_choice',
      prompt: 'What did the manager imply?',
      correctAnswer: 'Option A',
      conceptTags: ['inference'],
    };

    const classification = classifyReadingError(q, 'Option B', 2500);
    expect(classification.category).toBe('rushed_answer');
    expect(classification.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('detects distractor confusion when selected answer matches known distractor', () => {
    const q: QuestionItem = {
      id: 'q_dist',
      mode: 'single_choice',
      prompt: 'Comprehension question',
      correctAnswer: 'Correct Option',
      distractors: ['Trap Option A', 'Trap Option B'],
      conceptTags: ['detail'],
    };

    const classification = classifyReadingError(q, 'Trap Option A', 6000);
    expect(classification.category).toBe('distractor_confusion');
  });

  it('classifies inference and attitude questions correctly', () => {
    const q: QuestionItem = {
      id: 'q_inf',
      mode: 'single_choice',
      prompt: 'What is the author’s tone in paragraph 3?',
      correctAnswer: 'Sceptical',
      conceptTags: ['inference', 'attitude'],
    };

    const classification = classifyReadingError(q, 'Enthusiastic', 7000);
    expect(classification.category).toBe('inference');
  });

  it('classifies pronoun and reference errors', () => {
    const q: QuestionItem = {
      id: 'q_ref',
      mode: 'single_choice',
      prompt: 'What does "this" in line 12 refer to?',
      correctAnswer: 'The previous policy',
      conceptTags: ['reference_pronoun'],
    };

    const classification = classifyReadingError(q, 'The office premises', 8000);
    expect(classification.category).toBe('reference_pronoun');
  });

  it('classifies connector and logical relation errors', () => {
    const q: QuestionItem = {
      id: 'q_conn',
      mode: 'single_choice',
      prompt: 'Choose the appropriate connector',
      correctAnswer: 'Consequently',
      conceptTags: ['connector_logical_relation'],
    };

    const classification = classifyReadingError(q, 'Nevertheless', 9000);
    expect(classification.category).toBe('connector_logical_relation');
  });
});
