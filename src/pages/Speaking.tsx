import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Mic, Play, Save, Square } from 'lucide-react';
import { seedSpeakingPrompts, type SpeakingPrompt } from '../data/seedSpeaking';
import { db, recordSpeakingAttempt } from '../lib/db';
import type { CEFRLevel, SpeakingAttempt } from '../types';
import { PageHeader, SectionHeader, SegmentedControl } from '../components/ui';

type Phase = 'idle' | 'preparing' | 'recording' | 'review';

export default function Speaking() {
  const [level, setLevel] = useState<CEFRLevel | 'all'>('all');
  const [selected, setSelected] = useState<SpeakingPrompt | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<SpeakingAttempt[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef('');

  const loadHistory = () => db.speakingAttempts.orderBy('completedAt').reverse().toArray().then(setHistory);
  useEffect(() => { void loadHistory(); return () => { streamRef.current?.getTracks().forEach((track) => track.stop()); if (audioUrl) URL.revokeObjectURL(audioUrl); }; }, [audioUrl]);
  const prompts = useMemo(() => seedSpeakingPrompts.filter((item) => level === 'all' || item.cefrLevel === level), [level]);
  const choose = (prompt: SpeakingPrompt) => { setSelected(prompt); setPhase('idle'); setAudioBlob(null); setChecked([]); setError(''); };

  const prepare = async () => {
    if (!selected || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setError('La grabación no está disponible en este navegador. Puedes leer y practicar el prompt sin guardar audio.'); return; }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      startedAtRef.current = new Date().toISOString();
      setSeconds(selected.preparationSec);
      setPhase('preparing');
      setError('');
    } catch { setError('No se ha concedido acceso al micrófono. Revisa el permiso del navegador para grabar.'); }
  };

  const beginRecording = useCallback(() => {
    if (!selected || !streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      setAudioBlob(blob);
      setAudioUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setPhase('review');
    };
    recorderRef.current = recorder;
    recorder.start();
    setSeconds(selected.responseSec);
    setPhase('recording');
  }, [selected]);
  const stopRecording = useCallback(() => { if (recorderRef.current?.state === 'recording') recorderRef.current.stop(); }, []);

  useEffect(() => {
    if (!selected || (phase !== 'preparing' && phase !== 'recording')) return;
    if (seconds <= 0) { if (phase === 'preparing') beginRecording(); else stopRecording(); return; }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds, phase, selected, beginRecording, stopRecording]);

  const save = async () => {
    if (!selected || !audioBlob) return;
    const attempt: SpeakingAttempt = { id: crypto.randomUUID(), promptId: selected.id, cefrLevel: selected.cefrLevel, startedAt: startedAtRef.current, completedAt: new Date().toISOString(), durationSec: selected.responseSec - seconds, preparationSec: selected.preparationSec, checklist: checked, audioBlob };
    await recordSpeakingAttempt(attempt);
    await loadHistory();
    setSelected(null);
  };

  if (selected) {
    return (
      <div className="space-y-5">
        <button onClick={() => { stopRecording(); setSelected(null); }} className="btn-ghost -ml-3">← Volver a Speaking</button>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="panel overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-7 sm:py-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600">{selected.cefrLevel} · {selected.taskType}</span>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-slate-950">{selected.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-800">{selected.prompt}</p>
            </div>
            <div className="p-5 sm:p-7">
              {phase === 'idle' && <div className="flex min-h-52 flex-col items-center justify-center text-center"><div className="mb-5 grid size-14 place-items-center rounded-full bg-primary-50 text-primary-600"><Mic className="size-6"/></div><button onClick={prepare} className="btn-primary"><Mic className="size-4"/> Preparar y solicitar micrófono</button></div>}
              {phase === 'preparing' && <Timer label="Preparación" seconds={seconds} />}
              {phase === 'recording' && <div className="space-y-5"><Timer label="Grabando" seconds={seconds} recording /><div className="flex justify-center"><button onClick={stopRecording} className="btn-accent"><Square className="size-4"/> Terminar respuesta</button></div></div>}
              {phase === 'review' && audioUrl && <div className="mx-auto max-w-2xl space-y-5 py-6"><p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Play className="size-4 text-primary-600"/> Reproduce tu respuesta</p><audio controls src={audioUrl} className="w-full"/><button onClick={save} className="btn-primary"><Save className="size-4"/> Guardar intento</button></div>}
              {error && <div className="mt-5 flex gap-3 rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm leading-6 text-accent-900"><AlertCircle className="mt-0.5 size-5 shrink-0"/>{error}</div>}
            </div>
          </section>
          <aside className="panel-section lg:sticky lg:top-20">
            <SectionHeader title="Autoevaluación" description="Marca solo lo que escuches en tu grabación." />
            <div className="space-y-3">{selected.checklist.map((item) => <label key={item} className="flex min-h-10 items-start gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={checked.includes(item)} onChange={(event) => setChecked((current) => event.target.checked ? [...current, item] : current.filter((value) => value !== item))} className="mt-0.5 size-4 accent-primary-600"/><span>{item}</span></label>)}</div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader title="Speaking" subtitle="10 tareas originales con preparación, grabación local, reproducción y autoevaluación." icon={<Mic className="size-5"/>} />
      <SegmentedControl items={['all','A2','B1','B2'] as const} value={level} onChange={setLevel} getLabel={(item) => item === 'all' ? 'Todos' : item} />
      <section className="panel overflow-hidden">
        <div className="divide-y divide-slate-100">{prompts.map((prompt) => <article key={prompt.id} className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:px-5"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="status-pill">{prompt.cefrLevel} · {prompt.taskType}</span><span className="text-xs text-slate-400">Preparación {prompt.preparationSec}s · Respuesta {prompt.responseSec}s</span></div><h2 className="mt-2 text-sm font-semibold text-slate-950">{prompt.title}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{prompt.prompt}</p></div><button onClick={() => choose(prompt)} className="btn-secondary shrink-0">Practicar</button></article>)}</div>
      </section>
      <section className="panel-section"><SectionHeader title="Historial"/>{history.length ? <div className="divide-y divide-slate-100">{history.slice(0,5).map((item) => <div key={item.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="font-medium text-slate-900">{seedSpeakingPrompts.find((prompt) => prompt.id === item.promptId)?.title}</span><span className="text-xs text-slate-500">{item.durationSec}s · {item.checklist.length} criterios</span></div>)}</div> : <p className="py-6 text-center text-sm text-slate-500">Sin datos suficientes.</p>}</section>
    </div>
  );
}

function Timer({ label, seconds, recording = false }: { label: string; seconds: number; recording?: boolean }) {
  return <div className="mx-auto flex min-h-52 max-w-xl flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-center"><p className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${recording ? 'text-accent-600' : 'text-primary-600'}`}>{recording && <span className="size-2 rounded-full bg-accent-500"/>}{label}</p><p className="mt-4 font-mono text-5xl font-semibold tracking-[-0.05em] text-slate-950">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p></div>;
}
