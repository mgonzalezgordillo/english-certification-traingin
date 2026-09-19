import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getDashboardData } from '../lib/dashboard';
import { LoadingState, MetricCard, PageHeader, SectionHeader } from '../components/ui';

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => { getDashboardData().then(setData); }, []);
  if (!data) return <LoadingState label="Cargando panel…" />;

  const latestReading = data.readingHistory.slice().sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  const links = [
    ['Vocabulario SRS', '/entrenar?mode=due_only'],
    ['Práctica de gramática', '/gramatica/practica'],
    ['Reading', '/reading'],
    ['Listening', '/listening'],
    ['Speaking', '/speaking'],
    ['Writing', '/writing'],
    ['Mini mock', '/linguaskill'],
    ['Ver progreso', '/progreso'],
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Inicio" subtitle="Tu siguiente sesión se decide con el historial guardado en este navegador." />

      <section className="panel relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary-600" aria-hidden="true" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 pl-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600">Siguiente actividad</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">{data.recommendation.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{data.recommendation.reason}</p>
          </div>
          <button onClick={() => navigate(data.recommendation.route)} className="btn-primary shrink-0">
            Empezar <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Repasos vencidos" value={data.review.dueNow} detail={`${data.review.dueToday} previstos hoy`} attention={data.review.dueNow > 0} />
        <MetricCard label="Gramática débil" value={data.weakGrammar[0]?.concept.title ?? 'Sin datos suficientes'} detail={data.weakGrammar[0] ? `${data.weakGrammar[0].mastery.score}/100` : 'Practica para generar métricas'} />
        <MetricCard label="Reading reciente" value={latestReading ? `${latestReading.firstAttemptAccuracy}%` : 'Sin datos suficientes'} detail={latestReading ? new Date(latestReading.completedAt).toLocaleDateString('es-ES') : 'Sin intentos'} />
        <MetricCard label="Actividad registrada" value={data.activities.length} detail="Últimos eventos disponibles" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <section className="panel-section">
          <SectionHeader title="Accesos de estudio" description="Continúa directamente en cualquiera de los módulos disponibles." />
          <div className="grid gap-x-6 sm:grid-cols-2">
            {links.map(([label, route]) => (
              <button key={route} onClick={() => navigate(route)} className="group flex min-h-12 items-center justify-between border-b border-slate-100 text-left text-sm font-medium text-slate-700 transition-colors hover:text-primary-700">
                {label}<ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600" />
              </button>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <SectionHeader title="Actividad reciente" />
          {data.activities.length ? (
            <div className="divide-y divide-slate-100">
              {data.activities.slice(0, 6).map((item) => (
                <button key={`${item.label}-${item.id}`} onClick={() => navigate(item.route)} className="w-full py-3 text-left transition-colors hover:text-primary-700">
                  <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{item.label}</p><time className="shrink-0 text-[11px] text-slate-400">{new Date(item.date).toLocaleDateString('es-ES')}</time></div>
                  <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                </button>
              ))}
            </div>
          ) : <p className="py-8 text-center text-sm text-slate-500">Sin datos suficientes.</p>}
        </section>
      </div>
    </div>
  );
}
