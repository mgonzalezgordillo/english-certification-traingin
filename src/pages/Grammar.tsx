import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  X,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { getGrammarWithProgress, getGrammarMetrics } from '../lib/db';
import type {
  GrammarWithProgress,
  GrammarStrengthState,
  CEFRLevel,
  GrammarCommonMistake,
} from '../types';
import { EmptyState, LoadingState, MetricCard, PageHeader } from '../components/ui';

function formatLastPracticed(iso?: string): string {
  if (!iso) return 'No practicado';
  const diffHours = Math.round((new Date().getTime() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Hace un momento';
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const days = Math.round(diffHours / 24);
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

export default function Grammar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [grammarList, setGrammarList] = useState<GrammarWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    totalConcepts: number;
    practicedConcepts: number;
    strongCount: number;
    weakCount: number;
    averageMasteryScore: number;
    firstAttemptAccuracyRate: number;
    totalAttempts: number;
  }>({
    totalConcepts: 0,
    practicedConcepts: 0,
    strongCount: 0,
    weakCount: 0,
    averageMasteryScore: 0,
    firstAttemptAccuracyRate: 0,
    totalAttempts: 0,
  });

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCefr, setSelectedCefr] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStrength, setSelectedStrength] = useState<string>(
    searchParams.get('filter') === 'weak' ? 'weak' : 'all'
  );
  const [sortBy, setSortBy] = useState<'weakest' | 'cefr' | 'alphabetical' | 'score'>('weakest');

  // Active drawer for detailed concept study
  const [activeConcept, setActiveConcept] = useState<GrammarWithProgress | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getGrammarWithProgress(), getGrammarMetrics()])
      .then(([list, m]) => {
        if (!active) return;
        setGrammarList(list);
        setMetrics(m);

        const conceptIdParam = searchParams.get('conceptId');
        if (conceptIdParam) {
          const found = list.find((c) => c.concept.id === conceptIdParam);
          if (found) {
            setActiveConcept(found);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error loading grammar data:', err);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchParams]);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    grammarList.forEach((g) => set.add(g.concept.category));
    return Array.from(set).sort();
  }, [grammarList]);

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    let list = [...grammarList];

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.concept.title.toLowerCase().includes(q) ||
          (g.concept.shortDescription && g.concept.shortDescription.toLowerCase().includes(q)) ||
          g.concept.explanation.toLowerCase().includes(q) ||
          (g.concept.formStructure && g.concept.formStructure.toLowerCase().includes(q)) ||
          g.concept.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // CEFR filter
    if (selectedCefr !== 'all') {
      list = list.filter((g) => g.concept.cefrLevel === selectedCefr);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((g) => g.concept.category === selectedCategory);
    }

    // Strength state filter
    if (selectedStrength !== 'all') {
      list = list.filter((g) => g.strengthState === selectedStrength);
    }

    // Sorting
    if (sortBy === 'weakest') {
      list.sort((a, b) => {
        const stateWeight: Record<GrammarStrengthState, number> = {
          weak: 0,
          medium: 1,
          untested: 2,
          strong: 3,
        };
        if (stateWeight[a.strengthState] !== stateWeight[b.strengthState]) {
          return stateWeight[a.strengthState] - stateWeight[b.strengthState];
        }
        return a.mastery.score - b.mastery.score;
      });
    } else if (sortBy === 'cefr') {
      const cefrOrder: Record<CEFRLevel, number> = {
        A2: 0,
        'A2+': 1,
        B1: 2,
        'B1+': 3,
        B2: 4,
      };
      list.sort((a, b) => (cefrOrder[a.concept.cefrLevel] ?? 0) - (cefrOrder[b.concept.cefrLevel] ?? 0));
    } else if (sortBy === 'score') {
      list.sort((a, b) => b.mastery.score - a.mastery.score);
    } else if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.concept.title.localeCompare(b.concept.title));
    }

    return list;
  }, [grammarList, searchTerm, selectedCefr, selectedCategory, selectedStrength, sortBy]);

  const getCefrBadge = (cefr: CEFRLevel) => {
    switch (cefr) {
      case 'A2':
      case 'A2+':
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
            {cefr}
          </span>
        );
      case 'B1':
      case 'B1+':
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200/60">
            {cefr}
          </span>
        );
      case 'B2':
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200/60">
            {cefr}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
            {cefr}
          </span>
        );
    }
  };

  const getStrengthBadge = (strength: GrammarStrengthState, score: number) => {
    switch (strength) {
      case 'strong':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Fuerte ({score}%)
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-3.5 h-3.5" /> En progreso ({score}%)
          </span>
        );
      case 'weak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Débil ({score}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Sin practicar
          </span>
        );
    }
  };

  if (loading) {
    return <LoadingState label="Cargando biblioteca de gramática…" />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Librería de Gramática"
        subtitle={`Currículo estructural de ${metrics.totalConcepts} conceptos clave de A2 a B2. Aprende fórmulas precisas, contrasta estructuras afines y entrena con evaluación estricta sin trampas.`}
        action={<div className="flex flex-wrap items-center gap-2">
          {metrics.weakCount > 0 && (
            <button
              onClick={() => navigate('/gramatica/practica?mode=weak')}
              className="btn-accent"
            >
              <RotateCcw className="w-4 h-4" />
              Practicar Débiles ({metrics.weakCount})
            </button>
          )}
          <button
            onClick={() => navigate('/gramatica/practica')}
            className="btn-primary"
          >
            <Play className="w-4 h-4" />
            Entrenar Gramática
          </button>
        </div>}
      />

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Conceptos" value={metrics.totalConcepts} detail="A2, B1 y B2" />
        <MetricCard label="En estudio" value={metrics.practicedConcepts} detail="Iniciados" />
        <MetricCard label="Fuertes" value={metrics.strongCount} detail="Dominio fiable" />
        <MetricCard label="Débiles" value={metrics.weakCount} detail="Atención prioritaria" attention={metrics.weakCount > 0} />
        <MetricCard label="Media maestría" value={metrics.practicedConcepts > 0 ? `${metrics.averageMasteryScore}%` : '—'} detail="Sobre iniciados" />
        <MetricCard label="Acierto 1er intento" value={metrics.totalAttempts > 0 ? `${metrics.firstAttemptAccuracyRate}%` : '—'} detail={`${metrics.totalAttempts} intentos`} />
      </div>

      {/* Search and Filters Bar */}
      <div className="panel space-y-4 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por concepto, regla, fórmula o etiqueta (ej. conditionals, used to, passive)..."
              className="control w-full pl-10 pr-9"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick CEFR Segment */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['all', 'A2', 'B1', 'B2'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedCefr(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCefr === lvl
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'all' ? 'Todos CEFR' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Extended Filter Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-600">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="all">Todas las categorías ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Strength Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Estado:</span>
              <select
                value={selectedStrength}
                onChange={(e) => setSelectedStrength(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="all">Todos los estados</option>
                <option value="weak">Débiles (Prioritarios)</option>
                <option value="medium">En progreso</option>
                <option value="strong">Fuertes</option>
                <option value="untested">Sin practicar</option>
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'weakest' | 'cefr' | 'alphabetical' | 'score')}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 text-xs font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="weakest">Más débiles primero</option>
              <option value="cefr">Nivel CEFR (A2 → B2)</option>
              <option value="score">Mayor maestría</option>
              <option value="alphabetical">Alfabético</option>
            </select>
          </div>
        </div>
      </div>

      {/* Concepts list */}
      <div className="panel divide-y divide-slate-100 overflow-hidden">
        {filteredList.map((item) => {
          return (
            <div
              key={item.concept.id}
              onClick={() => setActiveConcept(item)}
              className="group grid min-w-0 grid-cols-[minmax(0,1fr)] cursor-pointer gap-4 p-4 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    {getCefrBadge(item.concept.cefrLevel)}
                    <span className="text-xs font-semibold text-slate-500">
                      {item.concept.category}
                    </span>
                  </div>
                  {getStrengthBadge(item.strengthState, item.mastery.score)}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                  {item.concept.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.concept.shortDescription || item.concept.explanation}
                </p>

                {item.concept.formStructure && (
                  <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 font-mono text-[11px] text-slate-700 truncate">
                    {item.concept.formStructure}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-5 text-xs text-slate-500 sm:justify-end">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatLastPracticed(item.lastPracticedAt)}</span>
                  {item.errorCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[10px]">
                      {item.errorCount} error{item.errorCount > 1 ? 'es' : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 font-semibold text-primary-600 group-hover:translate-x-0.5 transition-transform">
                  <span className="sr-only sm:not-sr-only">Ver ficha</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <EmptyState><p className="font-semibold text-slate-900">No se encontraron conceptos gramaticales</p><p className="mt-1">Prueba a restablecer los filtros de búsqueda o seleccionar otro nivel CEFR.</p><button
            onClick={() => {
              setSearchTerm('');
              setSelectedCefr('all');
              setSelectedCategory('all');
              setSelectedStrength('all');
            }}
            className="btn-secondary"
          >
            Limpiar filtros
          </button></EmptyState>
      )}

      {/* Slide-over Detailed Concept Drawer */}
      {activeConcept && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveConcept(null)}
          />

          <div role="dialog" aria-modal="true" aria-label={`Detalle de ${activeConcept.concept.title}`} className="fixed inset-y-0 right-0 z-10 flex w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-md animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getCefrBadge(activeConcept.concept.cefrLevel)}
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {activeConcept.concept.category}
                  </span>
                  {getStrengthBadge(activeConcept.strengthState, activeConcept.mastery.score)}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {activeConcept.concept.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveConcept(null)}
                aria-label="Cerrar detalle"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Formula Structure Box */}
              {activeConcept.concept.formStructure && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Estructura / Fórmula Gramatical
                  </p>
                  <p className="font-mono text-sm font-semibold text-indigo-950 leading-relaxed">
                    {activeConcept.concept.formStructure}
                  </p>
                </div>
              )}

              {/* Detailed Explanation */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Explicación Pedagógica
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeConcept.concept.explanation}
                </p>
              </div>

              {/* Real contextual examples */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Ejemplos Reales Contextualizados
                </h4>
                <div className="space-y-2">
                  {activeConcept.concept.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-800 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              {activeConcept.concept.commonMistakes && activeConcept.concept.commonMistakes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Errores Frecuentes en Examen
                  </h4>
                  <div className="space-y-3">
                    {activeConcept.concept.commonMistakes.map((mistake, idx) => {
                      if (typeof mistake === 'string') {
                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-rose-900"
                          >
                            {mistake}
                          </div>
                        );
                      }
                      const m = mistake as GrammarCommonMistake;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 space-y-2"
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-rose-700 shrink-0">❌ Incorrecto:</span>
                            <span className="line-through text-slate-600 font-mono">{m.incorrect}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-emerald-700 shrink-0">✅ Correcto:</span>
                            <span className="font-bold text-slate-900 font-mono">{m.correct}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 pt-1 border-t border-rose-100/60 leading-relaxed">
                            {m.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contrast with Related Concept */}
              {activeConcept.concept.contrast && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-3">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    Contraste Clave: {activeConcept.concept.title} vs {activeConcept.concept.contrast.conceptTitle}
                  </p>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    {activeConcept.concept.contrast.distinction}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200/50 text-slate-800">
                      <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                        {activeConcept.concept.title}
                      </span>
                      {activeConcept.concept.contrast.exampleA}
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200/50 text-slate-800">
                      <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                        {activeConcept.concept.contrast.conceptTitle}
                      </span>
                      {activeConcept.concept.contrast.exampleB}
                    </div>
                  </div>
                </div>
              )}

              {/* Practice Statistics */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-slate-400">Intentos</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">
                    {activeConcept.mastery.attemptsCount ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Racha actual</p>
                  <p className="text-lg font-bold text-emerald-600 mt-0.5">
                    {activeConcept.mastery.consecutiveCorrect ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Errores</p>
                  <p className="text-lg font-bold text-rose-600 mt-0.5">
                    {activeConcept.errorCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveConcept(null)}
                className="btn-secondary"
              >
                Cerrar
              </button>

              <button
                onClick={() => navigate(`/gramatica/practica?conceptId=${activeConcept.concept.id}`)}
                className="btn-primary flex-1"
              >
                <Play className="w-4 h-4" />
                Practicar Este Concepto ({activeConcept.exerciseCount} ejercicios)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
