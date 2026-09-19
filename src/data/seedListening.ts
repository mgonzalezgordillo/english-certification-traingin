import type { GenericExercise } from '../types/exercise';

type ListeningSeed = {
  id: string;
  level: 'A2' | 'B1' | 'B2';
  difficulty: number;
  title: string;
  script: string;
  prompt: string;
  options: string[];
  answer: string;
  hint: string;
};

const seeds: ListeningSeed[] = [
  { id: 'listen_a2_01', level: 'A2', difficulty: 1, title: 'Cambio de andén', script: 'Attention passengers. The train to Brighton will now leave from platform six, not platform four. Departure time remains ten fifteen.', prompt: '¿Qué ha cambiado?', options: ['El andén', 'La hora', 'El destino'], answer: 'El andén', hint: 'Escucha el número que se corrige.' },
  { id: 'listen_a2_02', level: 'A2', difficulty: 2, title: 'Mensaje de la clínica', script: 'Hello, this is Green Street Clinic. Your appointment with Doctor Patel is on Tuesday at three thirty. Please arrive ten minutes early.', prompt: '¿A qué hora es la cita?', options: ['3:20', '3:30', '3:40'], answer: '3:30', hint: 'La hora de llegada es distinta de la hora de la cita.' },
  { id: 'listen_a2_03', level: 'A2', difficulty: 2, title: 'Pedido para llevar', script: 'Could I have the vegetable soup and a cheese sandwich, please? No drink, thank you. I will take it away.', prompt: '¿Qué pide la persona?', options: ['Sopa y sándwich', 'Ensalada y bebida', 'Sándwich y café'], answer: 'Sopa y sándwich', hint: 'Identifica los dos alimentos.' },
  { id: 'listen_a2_04', level: 'A2', difficulty: 3, title: 'Plan para el sábado', script: 'The museum is closed on Saturday morning, so let us meet outside the cinema at half past two instead. The film starts at three.', prompt: '¿Dónde van a encontrarse?', options: ['En el museo', 'Fuera del cine', 'En la estación'], answer: 'Fuera del cine', hint: 'La primera opción queda descartada.' },
  { id: 'listen_b1_01', level: 'B1', difficulty: 4, title: 'Actualización de proyecto', script: 'We finished the design stage on time, but the supplier has delayed the materials. Production will begin next Wednesday, four days later than planned.', prompt: '¿Por qué se retrasa la producción?', options: ['Faltan materiales', 'El diseño no está listo', 'Ha cambiado el equipo'], answer: 'Faltan materiales', hint: 'Busca la causa introducida por “but”.' },
  { id: 'listen_b1_02', level: 'B1', difficulty: 4, title: 'Curso nocturno', script: 'The photography course used to run on Mondays, but from next month it will be on Thursday evenings. The tutor and the fee stay the same.', prompt: '¿Qué cambiará el próximo mes?', options: ['El día de clase', 'El profesor', 'El precio'], answer: 'El día de clase', hint: 'Dos elementos permanecen iguales.' },
  { id: 'listen_b1_03', level: 'B1', difficulty: 5, title: 'Opinión sobre teletrabajo', script: 'Working from home saves me nearly an hour of travel each day. I sometimes miss speaking to colleagues, though, so I go into the office every Wednesday.', prompt: '¿Cuál es la principal ventaja mencionada?', options: ['Ahorra tiempo de viaje', 'Mejora las reuniones', 'Reduce la carga de trabajo'], answer: 'Ahorra tiempo de viaje', hint: 'La ventaja aparece en la primera frase.' },
  { id: 'listen_b1_04', level: 'B1', difficulty: 5, title: 'Anuncio del aeropuerto', script: 'Flight BA two eight four to Madrid is boarding at gate twelve. Passengers in rows twenty to thirty should board first. All other passengers, please remain seated.', prompt: '¿Quién debe embarcar ahora?', options: ['Filas 20 a 30', 'Todos los pasajeros', 'Solo familias'], answer: 'Filas 20 a 30', hint: 'Escucha el intervalo de filas.' },
  { id: 'listen_b2_01', level: 'B2', difficulty: 7, title: 'Entrevista sobre formación', script: 'The online course was demanding, particularly while I was working full time. What kept me going was the weekly feedback, which was specific enough to show me exactly what to revise.', prompt: '¿Qué ayudó a la hablante a continuar?', options: ['Comentarios semanales concretos', 'Un horario más corto', 'La ayuda de sus compañeros'], answer: 'Comentarios semanales concretos', hint: 'Identifica qué explica “what kept me going”.' },
  { id: 'listen_b2_02', level: 'B2', difficulty: 7, title: 'Propuesta urbana', script: 'The council initially proposed removing all parking spaces from the square. After consulting local shops, it retained six short-stay spaces while making the rest of the area pedestrian.', prompt: '¿Qué concesión hizo el ayuntamiento?', options: ['Mantuvo seis plazas breves', 'Canceló la zona peatonal', 'Añadió aparcamiento permanente'], answer: 'Mantuvo seis plazas breves', hint: 'La decisión final combina dos medidas.' },
  { id: 'listen_b2_03', level: 'B2', difficulty: 8, title: 'Resultados de una encuesta', script: 'Although most respondents supported flexible hours, fewer than half wanted a fully remote role. The strongest preference was for choosing two office days each week.', prompt: '¿Qué opción tuvo mayor preferencia?', options: ['Elegir dos días de oficina', 'Trabajo remoto completo', 'Horario fijo'], answer: 'Elegir dos días de oficina', hint: 'Distingue apoyo a flexibilidad de trabajo totalmente remoto.' },
  { id: 'listen_b2_04', level: 'B2', difficulty: 8, title: 'Reseña de una exposición', script: 'The exhibition is visually restrained rather than spectacular. Its strength lies in the recorded interviews, which connect ordinary household objects to the memories of their owners.', prompt: '¿Qué valora más la crítica?', options: ['Las entrevistas grabadas', 'Los efectos visuales', 'El tamaño de los objetos'], answer: 'Las entrevistas grabadas', hint: 'La expresión “its strength lies in” introduce la valoración.' },
];

export const seedListeningExercises: GenericExercise[] = seeds.map((seed) => ({
  id: seed.id,
  skill: 'Listening',
  cefrLevel: seed.level,
  difficulty: seed.difficulty,
  taskType: 'audio_multiple_choice',
  title: seed.title,
  instructions: 'Escucha el audio y elige la respuesta. Puedes repetirlo.',
  content: { audioScript: seed.script, speakerLabel: 'English (UK)' },
  questions: [{
    id: 'q1',
    prompt: seed.prompt,
    mode: 'single_choice',
    options: seed.options,
    correctAnswer: seed.answer,
    hints: [seed.hint],
    explanation: `Respuesta: ${seed.answer}.`,
    conceptTags: ['listening_comprehension'],
  }],
  conceptTags: ['listening', seed.level.toLowerCase()],
  estimatedDurationSec: 90,
}));
