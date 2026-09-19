import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { getDashboardData } from '../lib/dashboard';
import { LoadingState, MetricCard, PageHeader, SectionHeader } from '../components/ui';

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function Progress() {
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => { getDashboardData().then(setData); }, []);
  if (!data) return <LoadingState label="Cargando datos locales…" />;

  const practicedGrammar = data.grammar.filter((item) => (item.mastery.attemptsCount ?? 0) > 0);
  const skillRows = [
    { skill: 'Vocabulary', value: data.vocabulary.totalAttempts ? data.vocabulary.firstAttemptAccuracyRate : null, attempts: data.vocabulary.totalAttempts },
    { skill: 'Grammar', value: practicedGrammar.length ? Math.round(practicedGrammar.reduce((sum, item) => sum + item.mastery.score, 0) / practicedGrammar.length) : null, attempts: practicedGrammar.reduce((sum, item) => sum + (item.mastery.attemptsCount ?? 0), 0) },
    { skill: 'Reading', value: data.reading.totalAttempts ? data.reading.averageFirstAttemptAccuracy : null, attempts: data.reading.totalAttempts },
    { skill: 'Listening', value: data.listening.length ? Math.round(data.listening.reduce((sum, item) => sum + item.firstAttemptAccuracy, 0) / data.listening.length) : null, attempts: data.listening.length },
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Progreso" subtitle="Resultados almacenados en este navegador. Las habilidades sin intentos no reciben una puntuación." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {skillRows.map((row) => <MetricCard key={row.skill} label={row.skill} value={row.value === null ? 'Sin datos suficientes' : `${row.value}%`} detail={`${row.attempts} intentos registrados`} />)}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <section className="panel-section min-w-0">
          <SectionHeader title="Distribución de vocabulario" description="Estados de maestría registrados en el motor local." />
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.vocabulary.masteryDistribution} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#717178', fontSize: 11 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#a1a1a6', fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(39,66,245,0.04)' }} contentStyle={{ border: '1px solid #e7e7e9', borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,.06)', fontSize: 12 }} />
                <Bar dataKey="count" fill="#2742F5" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel-section">
          <SectionHeader title="Conceptos de gramática" />
          {data.weakGrammar.length ? (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-600">Más débiles</p>
              {data.weakGrammar.map((item) => <MetricRow key={item.concept.id} label={item.concept.title} value={item.mastery.score} attention />)}
              <p className="mb-1 mt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-600">Más fuertes</p>
              {data.strongGrammar.map((item) => <MetricRow key={item.concept.id} label={item.concept.title} value={item.mastery.score} />)}
            </div>
          ) : <p className="py-8 text-center text-sm text-slate-500">Sin datos suficientes.</p>}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel-section">
          <SectionHeader title="Habilidades productivas" />
          <dl className="divide-y divide-slate-100">
            <DataRow label="Speaking" value={data.speaking.length ? `${data.speaking.length} intentos` : 'Sin datos suficientes'} />
            <DataRow label="Writing" value={data.writing.length ? `${data.writing.length} intentos` : 'Sin datos suficientes'} />
            <DataRow label="Mini mock" value={data.exams.length ? `${data.exams.length} intentos` : 'Sin datos suficientes'} />
          </dl>
        </section>
        <section className="panel-section">
          <SectionHeader title="Actividad reciente" />
          {data.activities.length ? <div className="divide-y divide-slate-100">{data.activities.map((item) => <div key={`${item.label}-${item.id}`} className="flex items-start justify-between gap-4 py-3 text-sm"><div><p className="font-medium text-slate-900">{item.label}</p><p className="mt-0.5 text-xs text-slate-500">{item.detail}</p></div><time className="shrink-0 text-xs text-slate-400">{new Date(item.date).toLocaleDateString('es-ES')}</time></div>)}</div> : <p className="py-8 text-center text-sm text-slate-500">Sin datos suficientes.</p>}
        </section>
      </div>
    </div>
  );
}

function MetricRow({ label, value, attention = false }: { label: string; value: number; attention?: boolean }) {
  return <div className="py-2.5"><div className="flex justify-between gap-3 text-xs"><span className="truncate text-slate-600">{label}</span><strong className="text-slate-900">{value}/100</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${attention ? 'bg-accent-500' : 'bg-primary-600'}`} style={{ width: `${value}%` }}/></div></div>;
}

function DataRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-3"><dt className="text-sm text-slate-500">{label}</dt><dd className="text-sm font-medium text-slate-900">{value}</dd></div>;
}
