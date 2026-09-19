import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Headphones, Play, Square } from 'lucide-react';
import { seedListeningExercises } from '../data/seedListening';
import { ExerciseRunner } from '../components/exercise/ExerciseRunner';
import { browserSpeechPlayback } from '../lib/audio/speech';
import { db, recordListeningAttempt } from '../lib/db';
import type { CEFRLevel, ListeningAttempt } from '../types';
import type { ExerciseSessionResult, GenericExercise } from '../types/exercise';
import { PageHeader, SegmentedControl } from '../components/ui';

export default function Listening() {
  const [level, setLevel] = useState<CEFRLevel | 'all'>('all');
  const [selected, setSelected] = useState<GenericExercise | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const available = browserSpeechPlayback.isAvailable();

  useEffect(() => {
    db.listeningAttempts.toArray().then((items) => setCompletedIds(new Set(items.map((item) => item.exerciseId))));
    return () => browserSpeechPlayback.stop();
  }, []);

  const exercises = useMemo(() => seedListeningExercises.filter((item) => level === 'all' || item.cefrLevel === level), [level]);
  const complete = async (result: ExerciseSessionResult) => {
    const attempt: ListeningAttempt = { id: result.id, exerciseId: result.exerciseId, cefrLevel: result.cefrLevel, startedAt: result.startedAt, completedAt: result.completedAt, firstAttemptAccuracy: result.firstAttemptAccuracy, finalAccuracy: result.finalAccuracy, totalQuestions: result.totalQuestions, totalTimeMs: result.totalTimeMs };
    await recordListeningAttempt(attempt);
    setCompletedIds((previous) => new Set(previous).add(result.exerciseId));
    setTranscriptVisible(true);
  };

  if (selected) {
    const script = selected.content?.audioScript ?? '';
    return (
      <div className="space-y-5">
        <button onClick={() => { browserSpeechPlayback.stop(); setSelected(null); }} className="btn-ghost -ml-3">← Volver a Listening</button>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(300px,0.75fr)_minmax(0,1.25fr)]">
          <section className="panel-section space-y-5 lg:sticky lg:top-20">
            <div><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600">{selected.cefrLevel} · Audio sintético local</span><h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-slate-950">{selected.title}</h1></div>
            <p className="text-sm leading-6 text-slate-500">{selected.instructions}</p>
            <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-medium text-primary-700"><Headphones className="size-4" />Audio de la actividad</div>
              <div className="flex flex-wrap gap-2">
                <button disabled={!available} onClick={() => browserSpeechPlayback.play(script)} className="btn-primary"><Play className="size-4" /> Reproducir</button>
                <button onClick={() => browserSpeechPlayback.stop()} className="btn-secondary"><Square className="size-4" /> Detener</button>
              </div>
            </div>
            {!available && <p className="rounded-lg border border-accent-200 bg-accent-50 p-3 text-sm text-accent-800">Este navegador no admite síntesis de voz. Puedes completar otras habilidades.</p>}
            {transcriptVisible ? <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Transcripción</p><p className="text-sm leading-6 text-slate-700">{script}</p></div> : <p className="text-xs leading-5 text-slate-400">La transcripción se mostrará al terminar la actividad.</p>}
          </section>
          <ExerciseRunner exercise={selected} onComplete={complete} onReturnToHub={() => setSelected(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader title="Listening" subtitle="12 actividades A2–B2 con voz del navegador, pistas bajo petición e historial local." icon={<Headphones className="size-5" />} />
      <SegmentedControl items={['all', 'A2', 'B1', 'B2'] as const} value={level} onChange={setLevel} getLabel={(item) => item === 'all' ? 'Todos' : item} />
      <section className="panel overflow-hidden">
        <div className="hidden grid-cols-[90px_minmax(0,1fr)_140px_110px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 sm:grid">
          <span>Nivel</span><span>Actividad</span><span>Estado</span><span />
        </div>
        <div className="divide-y divide-slate-100">
          {exercises.map((item) => {
            const completed = completedIds.has(item.id);
            return <article key={item.id} className="grid gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:grid-cols-[90px_minmax(0,1fr)_140px_110px] sm:items-center sm:gap-4 sm:px-5">
              <div><span className="status-pill">{item.cefrLevel} · {item.difficulty}/10</span></div>
              <div className="min-w-0"><h2 className="text-sm font-semibold text-slate-950">{item.title}</h2><p className="mt-1 truncate text-xs text-slate-500">{item.instructions}</p></div>
              <div>{completed ? <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700"><CheckCircle2 className="size-4" />Completada</span> : <span className="text-xs text-slate-400">No iniciada</span>}</div>
              <button onClick={() => { setTranscriptVisible(false); setSelected(item); }} className="btn-secondary w-full sm:w-auto">{completed ? 'Repetir' : 'Comenzar'}</button>
            </article>;
          })}
        </div>
      </section>
    </div>
  );
}
