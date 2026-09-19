import { db, getGrammarWithProgress, getReadingMetrics, getReviewQueueSummary, getVocabularyMetrics } from './db';

export interface RecentActivity { id: string; label: string; detail: string; date: string; route: string; }

export async function getDashboardData() {
  const [review, vocabulary, grammar, reading, readingHistory, listening, speaking, writing, exams] = await Promise.all([
    getReviewQueueSummary(), getVocabularyMetrics(), getGrammarWithProgress(), getReadingMetrics(),
    db.exerciseSessionResults.where('skill').equals('Reading').toArray(), db.listeningAttempts.toArray(),
    db.speakingAttempts.toArray(), db.writingAttempts.toArray(), db.examAttempts.toArray(),
  ]);
  const practicedGrammar = grammar.filter((item) => (item.mastery.attemptsCount ?? 0) > 0);
  const weakGrammar = practicedGrammar.slice().sort((a, b) => a.mastery.score - b.mastery.score).slice(0, 3);
  const strongGrammar = practicedGrammar.slice().sort((a, b) => b.mastery.score - a.mastery.score).slice(0, 3);
  const activities: RecentActivity[] = [
    ...readingHistory.map((item) => ({ id: item.id, label: 'Reading', detail: `${item.firstAttemptAccuracy}% al primer intento`, date: item.completedAt, route: '/reading' })),
    ...listening.map((item) => ({ id: item.id, label: 'Listening', detail: `${item.firstAttemptAccuracy}% al primer intento`, date: item.completedAt, route: '/listening' })),
    ...speaking.map((item) => ({ id: item.id, label: 'Speaking', detail: `${item.durationSec}s grabados`, date: item.completedAt, route: '/speaking' })),
    ...writing.map((item) => ({ id: item.id, label: 'Writing', detail: `${item.wordCount} palabras`, date: item.completedAt, route: '/writing' })),
    ...exams.map((item) => ({ id: item.id, label: 'Mini mock', detail: item.overallEstimatedLevel ? `Estimación interna ${item.overallEstimatedLevel}` : 'Completado', date: item.completedAt ?? item.startedAt, route: '/linguaskill' })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  let recommendation = { label: 'Comenzar entrenamiento de vocabulario', route: '/entrenar?mode=smart_mix', reason: 'Aún no hay suficiente historial para personalizar más.' };
  if (review.dueNow > 0) recommendation = { label: 'Repasar vocabulario pendiente', route: '/entrenar?mode=due_only', reason: `${review.dueNow} elementos están vencidos.` };
  else if (weakGrammar.length > 0) recommendation = { label: 'Practicar gramática débil', route: `/gramatica/practica?concept=${weakGrammar[0].concept.id}`, reason: `${weakGrammar[0].concept.title}: ${weakGrammar[0].mastery.score}/100.` };
  else if (reading.totalAttempts === 0) recommendation = { label: 'Realizar una actividad de Reading', route: '/reading', reason: 'No hay intentos de Reading registrados.' };
  else if (listening.length === 0) recommendation = { label: 'Realizar una actividad de Listening', route: '/listening', reason: 'No hay intentos de Listening registrados.' };
  return { review, vocabulary, grammar, weakGrammar, strongGrammar, reading, readingHistory, listening, speaking, writing, exams, activities, recommendation };
}
