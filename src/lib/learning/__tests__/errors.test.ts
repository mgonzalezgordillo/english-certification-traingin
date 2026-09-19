import { describe, it, expect } from 'vitest';
import { classifyVocabularyError, levenshteinDistance } from '../errors';
import type { VocabularyExercise } from '../../../types';

describe('Error Classification Engine', () => {
  const baseExercise: VocabularyExercise = {
    id: 'ex_1',
    vocabularyId: 'v_1',
    type: 'meaning_to_en',
    prompt: 'Escribe en inglés:',
    correctAnswer: 'achieve',
    hints: ['Empieza por A'],
    explanation: 'achieve significa conseguir',
  };

  it('calculates levenshtein distance correctly', () => {
    expect(levenshteinDistance('achieve', 'acheive')).toBe(2); // Transposition / substitution
    expect(levenshteinDistance('achieve', 'achieve')).toBe(0);
    expect(levenshteinDistance('achieve', 'achiev')).toBe(1);
    expect(levenshteinDistance('achieve', 'completelydifferent')).toBe(16);
  });

  it('classifies small edit distance as spelling', () => {
    const error = classifyVocabularyError(baseExercise, 'acheive', 5000);
    expect(error.category).toBe('spelling');
    expect(error.confidence).toBeGreaterThan(0.8);
  });

  it('classifies fast response under 2000ms as rushed answer', () => {
    const error = classifyVocabularyError(baseExercise, 'wrong', 1200);
    expect(error.category).toBe('rushed_answer');
  });

  it('classifies collocation errors as collocation_misuse', () => {
    const collocEx: VocabularyExercise = {
      ...baseExercise,
      type: 'collocation',
      correctAnswer: 'progress',
    };

    const error = classifyVocabularyError(collocEx, 'decision', 6000);
    expect(error.category).toBe('collocation_misuse');
  });

  it('classifies repeated failures as repeated_misconception', () => {
    const error = classifyVocabularyError(baseExercise, 'random', 8000, {
      lapses: 3,
    });
    expect(error.category).toBe('repeated_misconception');
  });

  it('classifies completely wrong answer as vocabulary_gap', () => {
    const error = classifyVocabularyError(baseExercise, 'destroy', 7000, {
      lapses: 0,
    });
    expect(error.category).toBe('vocabulary_gap');
  });
});
