import type { CEFRLevel } from '../types';

export interface SpeakingPrompt {
  id: string;
  cefrLevel: CEFRLevel;
  taskType: string;
  title: string;
  prompt: string;
  preparationSec: number;
  responseSec: number;
  checklist: string[];
}

export const seedSpeakingPrompts: SpeakingPrompt[] = [
  { id: 'speak_a2_01', cefrLevel: 'A2', taskType: 'personal_questions', title: 'Tu rutina', prompt: 'Describe un día normal de estudio o trabajo. Incluye horarios y dos actividades.', preparationSec: 20, responseSec: 60, checklist: ['He usado presente simple', 'He incluido horarios', 'He conectado al menos dos ideas'] },
  { id: 'speak_a2_02', cefrLevel: 'A2', taskType: 'description', title: 'Un lugar conocido', prompt: 'Describe un lugar de tu ciudad que visitas con frecuencia y explica qué haces allí.', preparationSec: 20, responseSec: 60, checklist: ['He descrito el lugar', 'He explicado cuándo voy', 'He dado una razón'] },
  { id: 'speak_a2_03', cefrLevel: 'A2', taskType: 'past_event', title: 'El fin de semana', prompt: 'Cuenta qué hiciste el último fin de semana y qué actividad te gustó más.', preparationSec: 25, responseSec: 75, checklist: ['He usado pasado', 'He ordenado los hechos', 'He expresado una preferencia'] },
  { id: 'speak_b1_01', cefrLevel: 'B1', taskType: 'long_turn', title: 'Aprender en grupo', prompt: '¿Es mejor estudiar solo o en grupo? Expón tu preferencia y dos razones.', preparationSec: 30, responseSec: 90, checklist: ['He expresado una postura', 'He dado dos razones', 'He incluido un ejemplo'] },
  { id: 'speak_b1_02', cefrLevel: 'B1', taskType: 'recommendation', title: 'Recomendar una actividad', prompt: 'Recomienda una actividad para un visitante que pasa un día en tu ciudad. Justifica el plan.', preparationSec: 30, responseSec: 90, checklist: ['He formulado una recomendación', 'He explicado logística', 'He justificado la elección'] },
  { id: 'speak_b1_03', cefrLevel: 'B1', taskType: 'comparison', title: 'Dos formas de viajar', prompt: 'Compara viajar en tren y viajar en coche para una escapada de fin de semana.', preparationSec: 30, responseSec: 90, checklist: ['He comparado ambas opciones', 'He mencionado ventajas y límites', 'He elegido una opción'] },
  { id: 'speak_b1_04', cefrLevel: 'B1', taskType: 'problem_solving', title: 'Cambio de planes', prompt: 'Tu actividad al aire libre se cancela por lluvia. Propón una alternativa para el grupo.', preparationSec: 25, responseSec: 75, checklist: ['He explicado el problema', 'He propuesto una alternativa', 'He indicado cómo organizarla'] },
  { id: 'speak_b2_01', cefrLevel: 'B2', taskType: 'argument', title: 'Trabajo híbrido', prompt: 'Evalúa las ventajas y los límites del trabajo híbrido para empleados y empresas.', preparationSec: 40, responseSec: 120, checklist: ['He considerado dos perspectivas', 'He organizado el argumento', 'He matizado la conclusión'] },
  { id: 'speak_b2_02', cefrLevel: 'B2', taskType: 'proposal', title: 'Mejorar el transporte', prompt: 'Propón una medida concreta para reducir el tráfico urbano. Explica su aplicación y posibles objeciones.', preparationSec: 40, responseSec: 120, checklist: ['He definido una medida', 'He explicado su aplicación', 'He respondido a una objeción'] },
  { id: 'speak_b2_03', cefrLevel: 'B2', taskType: 'abstract_discussion', title: 'Decisiones automatizadas', prompt: '¿En qué decisiones debería intervenir la inteligencia artificial y en cuáles no? Razona tus límites.', preparationSec: 45, responseSec: 120, checklist: ['He establecido criterios', 'He usado ejemplos', 'He distinguido niveles de riesgo'] },
];
