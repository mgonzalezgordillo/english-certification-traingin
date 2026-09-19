import type { QuestionItem, ReadingErrorClassification } from '../../types/exercise';

/**
 * Deterministically infers the likely reading error category based on signals:
 * - Response speed (rushed answers < 4 seconds)
 * - Question concept tags (e.g. inference, main idea, detail, connector, pronoun, structure)
 * - Distractor confusion if the answer matches a designated distractor
 * - Answer mode (cloze vocabulary vs structural gap)
 * - Repeated attempts
 */
export function classifyReadingError(
  question: QuestionItem,
  userAnswer: string | string[],
  timeSpentMs: number,
  attemptsCount: number = 1
): ReadingErrorClassification {
  const normUser = Array.isArray(userAnswer)
    ? userAnswer.map((a) => a.toLowerCase().trim())
    : [userAnswer.toLowerCase().trim()];

  // 1. Rushed answer: learner answered in under 4 seconds on a reading task
  if (timeSpentMs > 0 && timeSpentMs < 4000) {
    return {
      category: 'rushed_answer',
      confidence: 0.9,
      detectedTrigger: 'Respuesta completada en menos de 4 segundos sin lectura atenta.',
    };
  }

  // 2. Distractor confusion: User picked a known distractor
  if (question.distractors && question.distractors.length > 0) {
    const normDistractors = question.distractors.map((d) => d.toLowerCase().trim());
    const matchedDistractor = normUser.find((ans) => normDistractors.includes(ans));
    if (matchedDistractor) {
      return {
        category: 'distractor_confusion',
        confidence: 0.85,
        detectedTrigger: `Seleccionó el distractor intencional: "${matchedDistractor}".`,
      };
    }
  }

  // 3. Question concept tags
  const tags = (question.conceptTags || []).map((t) => t.toLowerCase());

  if (tags.some((t) => t.includes('inference') || t.includes('attitude') || t.includes('tone'))) {
    return {
      category: 'inference',
      confidence: 0.85,
      detectedTrigger: 'Dificultad para deducir el significado implícito o la postura del autor.',
    };
  }

  if (tags.some((t) => t.includes('main_idea') || t.includes('gist') || t.includes('purpose'))) {
    return {
      category: 'main_idea',
      confidence: 0.85,
      detectedTrigger: 'Confusión entre un detalle secundario y la idea principal del texto.',
    };
  }

  if (tags.some((t) => t.includes('connector') || t.includes('link') || t.includes('cohesion'))) {
    return {
      category: 'connector_logical_relation',
      confidence: 0.88,
      detectedTrigger: 'Error en la identificación de conectores o relaciones lógicas.',
    };
  }

  if (tags.some((t) => t.includes('reference') || t.includes('pronoun'))) {
    return {
      category: 'reference_pronoun',
      confidence: 0.88,
      detectedTrigger: 'Identificación errónea del referente de un pronombre demostrativo o relativo.',
    };
  }

  if (tags.some((t) => t.includes('structure') || t.includes('insertion') || t.includes('coherence'))) {
    return {
      category: 'text_structure',
      confidence: 0.85,
      detectedTrigger: 'Dificultad para percibir la progresión temática o estructura del texto.',
    };
  }

  if (tags.some((t) => t.includes('detail') || t.includes('fact') || t.includes('specific'))) {
    return {
      category: 'missed_detail',
      confidence: 0.8,
      detectedTrigger: 'Omisión de un detalle fáctico específico presente en el texto.',
    };
  }

  if (tags.some((t) => t.includes('vocabulary') || t.includes('collocation') || t.includes('phrasal'))) {
    return {
      category: 'vocabulary_comprehension',
      confidence: 0.8,
      detectedTrigger: 'Brecha léxica en vocabulario clave o frase hecha.',
    };
  }

  // 4. Task mode heuristics
  if (question.mode === 'ordered_items') {
    return {
      category: 'text_structure',
      confidence: 0.82,
      detectedTrigger: 'Secuenciación de elementos discursivos incorrecta.',
    };
  }

  if (question.mode === 'fill_gap') {
    return {
      category: 'vocabulary_comprehension',
      confidence: 0.75,
      detectedTrigger: 'Error en la elección léxica o gramatical del hueco.',
    };
  }

  // 5. Fallback
  return {
    category: attemptsCount > 1 ? 'missed_detail' : 'other',
    confidence: 0.6,
    detectedTrigger: 'Error de comprensión general.',
  };
}
