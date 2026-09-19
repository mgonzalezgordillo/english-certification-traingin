import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Circle, PenTool, Save } from 'lucide-react';
import { seedWritingPrompts, type WritingPrompt } from '../data/seedWriting';
import { analyzeWriting, countWords } from '../lib/learning/writingAnalysis';
import { db, recordWritingAttempt } from '../lib/db';
import type { CEFRLevel, WritingAttempt } from '../types';
import { PageHeader, SectionHeader, SegmentedControl } from '../components/ui';

export default function Writing() {
  const [level, setLevel] = useState<CEFRLevel | 'all'>('all');
  const [selected, setSelected] = useState<WritingPrompt | null>(null);
  const [text, setText] = useState('');
  const [history, setHistory] = useState<WritingAttempt[]>([]);
  const [saved, setSaved] = useState<WritingAttempt | null>(null);
  const startRef = useRef<number | null>(null);
  const loadHistory = () => db.writingAttempts.orderBy('completedAt').reverse().toArray().then(setHistory);

  useEffect(() => { void loadHistory(); }, []);
  const prompts = useMemo(() => seedWritingPrompts.filter((item) => level === 'all' || item.cefrLevel === level), [level]);
  const words = countWords(text);
  const choose = (prompt: WritingPrompt) => { setSelected(prompt); setText(''); setSaved(null); startRef.current = new Date().getTime(); };
  const save = async () => {
    if (!selected || !text.trim()) return;
    const now = new Date();
    const startTime = startRef.current ?? now.getTime();
    const attempt: WritingAttempt = { id: crypto.randomUUID(), promptId: selected.id, cefrLevel: selected.cefrLevel, startedAt: new Date(startTime).toISOString(), completedAt: now.toISOString(), text: text.trim(), wordCount: words, durationSec: Math.round((now.getTime() - startTime) / 1000), rubric: analyzeWriting(text, selected.minWords, selected.maxWords) };
    await recordWritingAttempt(attempt);
    setSaved(attempt);
    await loadHistory();
  };

  if (selected) {
    const rubric = saved?.rubric;
    const inRange = words >= selected.minWords && words <= selected.maxWords;
    return (
      <div className="space-y-5">
        <button onClick={() => setSelected(null)} className="btn-ghost -ml-3">← Volver a Writing</button>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="panel overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600">{selected.cefrLevel} · {selected.taskType}</span>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-slate-950">{selected.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{selected.prompt}</p>
            </div>
            <div className="p-3 sm:p-5">
              <textarea value={text} onChange={(event) => { setText(event.target.value); setSaved(null); }} rows={18} placeholder="Write your response in English…" className="min-h-[440px] w-full resize-y rounded-lg border-0 bg-white p-3 text-[15px] leading-7 text-slate-900 outline-none placeholder:text-slate-300 focus:ring-0 sm:min-h-[520px]" />
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-xs font-medium ${inRange ? 'text-primary-700' : 'text-slate-500'}`}>{words} palabras · objetivo {selected.minWords}–{selected.maxWords}</p>
              <button disabled={!text.trim()} onClick={save} className="btn-primary"><Save className="size-4" /> Guardar intento</button>
            </div>
          </section>
          <aside className="panel-section lg:sticky lg:top-20">
            <SectionHeader title="Revisión determinista" description="Indicadores formales; no es una calificación lingüística ni de IA." />
            {rubric ? <ul className="space-y-3 text-sm"><Rubric ok={rubric.taskCompletion} label="Desarrollo mínimo de la tarea"/><Rubric ok={rubric.approximateLength} label="Extensión aproximada"/><Rubric ok={rubric.paragraphing} label="Uso de párrafos"/><li className="flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-slate-500">Conectores detectados</span><strong>{rubric.connectorCount}</strong></li><li className="flex items-center justify-between"><span className="text-slate-500">Variedad léxica aproximada</span><strong>{rubric.lexicalVariety}%</strong></li></ul> : <p className="py-6 text-center text-sm text-slate-500">Guarda el intento para ver la lista.</p>}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader title="Writing" subtitle="Redacción A2–B2 con guardado local y revisión formal transparente." icon={<PenTool className="size-5" />} />
      <SegmentedControl items={['all','A2','B1','B2'] as const} value={level} onChange={setLevel} getLabel={(item) => item === 'all' ? 'Todos' : item} />
      <section className="panel overflow-hidden">
        <div className="divide-y divide-slate-100">
          {prompts.map((prompt) => <article key={prompt.id} className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:px-5"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="status-pill">{prompt.cefrLevel} · {prompt.taskType}</span><span className="text-xs text-slate-400">{prompt.minWords}–{prompt.maxWords} palabras</span></div><h2 className="mt-2 text-sm font-semibold text-slate-950">{prompt.title}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{prompt.prompt}</p></div><button onClick={() => choose(prompt)} className="btn-secondary shrink-0">Escribir</button></article>)}
        </div>
      </section>
      <section className="panel-section">
        <SectionHeader title="Historial" />
        {history.length ? <div className="divide-y divide-slate-100">{history.slice(0,5).map((item) => <div key={item.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="font-medium text-slate-900">{seedWritingPrompts.find((prompt) => prompt.id === item.promptId)?.title ?? item.promptId}</span><span className="text-xs text-slate-500">{item.wordCount} palabras · {new Date(item.completedAt).toLocaleDateString('es-ES')}</span></div>)}</div> : <p className="py-6 text-center text-sm text-slate-500">Sin datos suficientes.</p>}
      </section>
    </div>
  );
}

function Rubric({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? CheckCircle2 : Circle;
  return <li className="flex gap-2.5"><Icon className={`mt-0.5 size-4 shrink-0 ${ok ? 'text-primary-600' : 'text-slate-300'}`}/><span className="text-slate-700">{label}</span></li>;
}
