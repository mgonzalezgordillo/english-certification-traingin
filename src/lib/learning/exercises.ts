import type { VocabularyItem, VocabularyExercise, VocabularyExerciseType } from '../../types';

/**
 * Normalizes learner typed input for robust and fair answer comparison.
 * Trims extra spaces, converts to lower case, removes edge punctuation, and normalizes smart quotes.
 */
export function normalizeAnswer(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[’‘`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/^[¿¡?!.,\s]+|[¿¡?!.,\s]+$/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Creates progressive hints for a vocabulary exercise.
 */
export function generateHints(item: VocabularyItem, type: VocabularyExerciseType): string[] {
  const word = item.word;
  const firstLetter = word[0].toUpperCase();
  const length = word.length;
  const masked = `${word[0]}${' _'.repeat(Math.max(1, length - 2))} ${word[length - 1]}`;

  // Hint 1: Structural clue
  let hint1 = `Empieza por "${firstLetter}" (${length} letras): ${masked}`;
  if (word.includes(' ')) {
    hint1 = `Expresión de ${word.split(' ').length} palabras que empieza por "${firstLetter}".`;
  }

  // Hint 2: Grammatical / Collocation clue
  let hint2 = `Categoría gramatical: ${item.pos.toUpperCase()}.`;
  if (item.collocations && item.collocations.length > 0) {
    hint2 += ` Se usa comúnmente en: "${item.collocations[0]}".`;
  } else if (item.tags && item.tags.length > 0) {
    hint2 += ` Tema / contexto: ${item.tags.join(', ')}.`;
  }

  // Hint 3: Definitional or context clue
  let hint3 = item.meaningEs
    ? `Traducción / Significado: "${item.meaningEs}"`
    : `Definición en inglés: "${item.meaning}"`;
  if (type === 'meaning_to_en' && item.synonyms && item.synonyms.length > 0) {
    hint3 += ` (Sinónimo en inglés: ${item.synonyms[0]})`;
  }

  return [hint1, hint2, hint3];
}

/**
 * Selects n distractors from a vocabulary pool, preferring items of similar POS or CEFR level.
 */
function getDistractors(
  target: VocabularyItem,
  pool: VocabularyItem[],
  field: 'meaningEs' | 'word',
  count = 3
): string[] {
  const others = pool.filter((v) => v.id !== target.id);

  // First try same POS
  const samePos = others.filter((v) => v.pos === target.pos);
  const candidates = samePos.length >= count ? samePos : others;

  // Shuffle and extract distinct values
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const results: string[] = [];

  for (const item of shuffled) {
    const val = field === 'meaningEs' ? item.meaningEs || item.meaning : item.word;
    if (val && !results.includes(val) && val !== (field === 'meaningEs' ? target.meaningEs : target.word)) {
      results.push(val);
      if (results.length >= count) break;
    }
  }

  return results;
}

/**
 * Pure generator to create a structured exercise from a vocabulary item.
 */
export function generateExercise(
  target: VocabularyItem,
  pool: VocabularyItem[],
  forcedType?: VocabularyExerciseType | 'mixed'
): VocabularyExercise {
  // Determine suitable exercise types
  const candidateTypes: VocabularyExerciseType[] = ['en_to_meaning', 'meaning_to_en'];

  const hasGoodExample =
    target.examples &&
    target.examples.length > 0 &&
    target.examples.some((ex) => new RegExp(`\\b${target.word}\\b`, 'i').test(ex));

  if (hasGoodExample) {
    candidateTypes.push('context_blank');
  }

  const hasCollocation =
    target.collocations &&
    target.collocations.length > 0 &&
    target.collocations.some((c) => c.toLowerCase().includes(target.word.toLowerCase()));

  if (hasCollocation) {
    candidateTypes.push('collocation');
  }

  let selectedType: VocabularyExerciseType;

  if (forcedType && forcedType !== 'mixed') {
    selectedType = forcedType;
  } else {
    // Pick randomly among candidate types
    selectedType = candidateTypes[Math.floor(Math.random() * candidateTypes.length)];
  }

  const hints = generateHints(target, selectedType);

  // 1. TYPE A: ENGLISH -> MEANING (Multiple Choice)
  if (selectedType === 'en_to_meaning') {
    const correctMeaning = target.meaningEs || target.meaning;
    const distractors = getDistractors(target, pool, 'meaningEs', 3);
    const options = [correctMeaning, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: `ex_${target.id}_mc`,
      vocabularyId: target.id,
      type: 'en_to_meaning',
      prompt: `¿Cuál es el significado correcto de "${target.word}"?`,
      correctAnswer: correctMeaning,
      options,
      hints,
      explanation: `"${target.word}" (${target.pos}) significa "${correctMeaning}". Definición: ${target.meaning}.`,
    };
  }

  // 2. TYPE B: MEANING -> ENGLISH (Typing recall)
  if (selectedType === 'meaning_to_en') {
    const promptMeaning = target.meaningEs || target.meaning;

    return {
      id: `ex_${target.id}_type`,
      vocabularyId: target.id,
      type: 'meaning_to_en',
      prompt: `Escribe en inglés el término para:`,
      contextSentence: `"${promptMeaning}"`,
      correctAnswer: target.word,
      acceptedAnswers: target.synonyms,
      hints,
      explanation: `El término en inglés es "${target.word}". Ejemplo: "${target.examples[0] || ''}".`,
    };
  }

  // 3. TYPE C: CONTEXT BLANK (Fill in the blank)
  if (selectedType === 'context_blank') {
    const matchingExample =
      target.examples.find((ex) => new RegExp(`\\b${target.word}\\b`, 'i').test(ex)) ||
      target.examples[0];

    const blankedSentence = matchingExample.replace(
      new RegExp(`\\b${target.word}\\b`, 'gi'),
      '_______'
    );

    const distractors = getDistractors(target, pool, 'word', 3);
    const options = [target.word, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: `ex_${target.id}_blank`,
      vocabularyId: target.id,
      type: 'context_blank',
      prompt: `Completa la frase con la palabra adecuada:`,
      contextSentence: blankedSentence,
      blankTarget: target.word,
      correctAnswer: target.word,
      options,
      hints,
      explanation: `Correcto: "${target.word}". Frase completa: "${matchingExample}".`,
    };
  }

  // 4. TYPE D: COLLOCATION
  if (selectedType === 'collocation') {
    const chosenCollocation =
      target.collocations.find((c) => c.toLowerCase().includes(target.word.toLowerCase())) ||
      target.collocations[0];

    // Blank out the target word from the collocation
    const blankedCollocation = chosenCollocation.replace(
      new RegExp(`\\b${target.word}\\b`, 'gi'),
      '_______'
    );

    const distractors = getDistractors(target, pool, 'word', 3);
    const options = [target.word, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: `ex_${target.id}_colloc`,
      vocabularyId: target.id,
      type: 'collocation',
      prompt: `¿Qué término completa esta colocación habitual?`,
      contextSentence: blankedCollocation,
      blankTarget: target.word,
      correctAnswer: target.word,
      options,
      hints,
      explanation: `Colocación habitual: "${chosenCollocation}".`,
    };
  }

  // 5. FLASHCARD (Direct review)
  return {
    id: `ex_${target.id}_fc`,
    vocabularyId: target.id,
    type: 'flashcard',
    prompt: target.word,
    correctAnswer: target.meaningEs || target.meaning,
    hints,
    explanation: `"${target.word}": ${target.meaningEs || target.meaning}. Ejemplo: ${target.examples[0] || ''}`,
  };
}
