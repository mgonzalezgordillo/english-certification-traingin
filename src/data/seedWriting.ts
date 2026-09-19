import type { CEFRLevel } from '../types';

export interface WritingPrompt {
  id: string;
  cefrLevel: CEFRLevel;
  taskType: string;
  title: string;
  prompt: string;
  minWords: number;
  maxWords: number;
}

export const seedWritingPrompts: WritingPrompt[] = [
  { id: 'write_a2_01', cefrLevel: 'A2', taskType: 'message', title: 'Cambio de cita', prompt: 'Escribe a un amigo para cambiar la hora de una cita. Explica por qué y propone otra hora.', minWords: 45, maxWords: 70 },
  { id: 'write_a2_02', cefrLevel: 'A2', taskType: 'email', title: 'Visita de fin de semana', prompt: 'Responde a una amiga que visitará tu ciudad. Indica dónde puede alojarse y dos actividades.', minWords: 55, maxWords: 80 },
  { id: 'write_a2_03', cefrLevel: 'A2', taskType: 'description', title: 'Mi curso', prompt: 'Describe un curso que haces: horario, contenido y qué te gusta de él.', minWords: 60, maxWords: 90 },
  { id: 'write_b1_01', cefrLevel: 'B1', taskType: 'email', title: 'Queja sobre un pedido', prompt: 'Escribe a una tienda sobre un pedido que llegó tarde y dañado. Solicita una solución concreta.', minWords: 100, maxWords: 140 },
  { id: 'write_b1_02', cefrLevel: 'B1', taskType: 'article', title: 'Una habilidad útil', prompt: 'Escribe un artículo sobre una habilidad práctica que toda persona joven debería aprender.', minWords: 120, maxWords: 160 },
  { id: 'write_b1_03', cefrLevel: 'B1', taskType: 'review', title: 'Reseña de una aplicación', prompt: 'Escribe una reseña de una aplicación que uses para estudiar u organizarte. Incluye una limitación.', minWords: 110, maxWords: 150 },
  { id: 'write_b1_04', cefrLevel: 'B1', taskType: 'proposal', title: 'Actividad para estudiantes', prompt: 'Propón una actividad mensual para estudiantes de idiomas. Explica cómo funcionaría.', minWords: 120, maxWords: 170 },
  { id: 'write_b2_01', cefrLevel: 'B2', taskType: 'essay', title: 'Centros urbanos sin coches', prompt: 'Analiza si los centros urbanos deberían limitar más el tráfico privado. Presenta argumentos y una conclusión.', minWords: 180, maxWords: 240 },
  { id: 'write_b2_02', cefrLevel: 'B2', taskType: 'report', title: 'Mejoras en formación', prompt: 'Redacta un informe sobre un programa de formación laboral y recomienda dos mejoras viables.', minWords: 180, maxWords: 240 },
  { id: 'write_b2_03', cefrLevel: 'B2', taskType: 'essay', title: 'Información personalizada', prompt: 'Evalúa las ventajas y los riesgos de que las plataformas personalicen las noticias que ve cada usuario.', minWords: 190, maxWords: 250 },
];
