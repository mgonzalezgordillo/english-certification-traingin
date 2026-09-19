import { describe, it, expect } from 'vitest';
import { classifyGrammarError } from '../grammarErrors';
import type { GrammarExercise } from '../../../types';

describe('Grammar Error Classification', () => {
  const sampleConditionalExercise: GrammarExercise = {
    id: 'test_cond_1',
    conceptId: 'g_cond_third',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Choose the correct form.',
    options: ['had known', 'would know', 'know'],
    correctAnswer: 'had known',
    hints: ['Past perfect', 'Third conditional'],
    explanation: 'Third conditional requires past perfect in if clause.',
    tags: ['conditional_structure', 'third conditional'],
  };

  const sampleAuxiliaryExercise: GrammarExercise = {
    id: 'test_aux_1',
    conceptId: 'g_pres_simple',
    type: 'fill_in_the_blank',
    cefrLevel: 'A2',
    prompt: 'Complete with negative.',
    sentenceContext: 'She _____ (not like) tea.',
    correctAnswer: "doesn't like",
    hints: ['Auxiliary does not'],
    explanation: '3rd person singular takes does not.',
    tags: ['auxiliary_error', 'present simple'],
  };

  it('classifies rushed answers under 1.8 seconds', () => {
    const error = classifyGrammarError(
      sampleConditionalExercise,
      'would know',
      1200 // 1.2 seconds
    );
    expect(error.category).toBe('rushed_answer');
    expect(error.grammarConceptId).toBe('g_cond_third');
  });

  it('classifies conditional structure errors properly', () => {
    const error = classifyGrammarError(
      sampleConditionalExercise,
      'would know',
      6000
    );
    expect(error.category).toBe('conditional_structure');
    expect(error.grammarConceptId).toBe('g_cond_third');
  });

  it('classifies auxiliary errors properly', () => {
    const error = classifyGrammarError(
      sampleAuxiliaryExercise,
      "don't like",
      5000
    );
    expect(error.category).toBe('auxiliary_error');
    expect(error.grammarConceptId).toBe('g_pres_simple');
  });

  it('detects minor spelling slips in typed exercises', () => {
    const typingExercise: GrammarExercise = {
      id: 'test_type_1',
      conceptId: 'g_passive_basic',
      type: 'fill_in_the_blank',
      cefrLevel: 'B1',
      prompt: 'Type the participle',
      correctAnswer: 'written',
      hints: [],
      explanation: 'Past participle of write',
      tags: ['passive_voice'],
    };

    const error = classifyGrammarError(
      typingExercise,
      'writen', // 1 typo (missing double t)
      4000
    );
    expect(error.category).toBe('spelling');
    expect(error.grammarConceptId).toBe('g_passive_basic');
  });

  it('flags repeated misconceptions for chronic struggling concepts', () => {
    const error = classifyGrammarError(
      sampleConditionalExercise,
      'would know',
      4000,
      {
        attemptsCount: 4,
        firstAttemptSuccessCount: 1, // 25% accuracy
      }
    );
    expect(error.category).toBe('repeated_misconception');
    expect(error.grammarConceptId).toBe('g_cond_third');
  });
});
