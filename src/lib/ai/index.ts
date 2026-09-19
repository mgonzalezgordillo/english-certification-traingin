import type { AIProvider, Exercise, ErrorClassification } from '../../types';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private apiKey?: string;

  async initialize(apiKey?: string): Promise<void> {
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (this.apiKey) {
      console.log('GeminiProvider initialized with API key.');
    } else {
      console.warn('GeminiProvider initialized without an API key. AI features will degrade gracefully.');
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async getExplanation(conceptId: string, context?: string): Promise<string> {
    if (!this.isAvailable()) {
      return 'Explicación no disponible. Por favor configura tu API key en las opciones.';
    }
    // TODO: Implement actual API call to Gemini
    console.log(`Fetching explanation for ${conceptId} with context: ${context}`);
    return `Esta es una explicación simulada generada por IA para el concepto: ${conceptId}.`;
  }

  async classifyError(): Promise<ErrorClassification> {
    if (!this.isAvailable()) {
      return { category: 'other', confidence: 0 };
    }
    // TODO: Implement actual API call to Gemini
    return { category: 'grammar_gap', confidence: 0.8 };
  }

  async generateExercise(): Promise<Exercise | null> {
    if (!this.isAvailable()) {
      return null;
    }
    // TODO: Implement actual API call to Gemini
    return null;
  }
}

// Singleton instance
export const aiService = new GeminiProvider();
