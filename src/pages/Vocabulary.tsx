import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  X,
  Clock,
} from 'lucide-react';
import { getVocabularyWithProgress, getReviewQueueSummary } from '../lib/db';
import type { VocabularyWithProgress, MasteryStatus } from '../types';
import { PageHeader } from '../components/ui';

export default function Vocabulary() {
  const navigate = useNavigate();
  const [vocabList, setVocabList] = useState<VocabularyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueSummary, setQueueSummary] = useState<{
    dueNow: number;
    dueToday: number;
    weakCount: number;
    unseenCount: number;
    totalCount: number;
    recalledOrBetterCount: number;
  }>({
    dueNow: 0,
    dueToday: 0,
    weakCount: 0,
    unseenCount: 0,
    totalCount: 0,
    recalledOrBetterCount: 0,
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCefr, setSelectedCefr] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'weakest' | 'alphabetical'>('priority');

  // Selected item for drawer
  const [activeItem, setActiveItem] = useState<VocabularyWithProgress | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());


  useEffect(() => {
    let active = true;
    Promise.all([getVocabularyWithProgress(), getReviewQueueSummary()])
      .then(([list, summary]) => {
        if (active) {
          setVocabList(list);
          setQueueSummary(summary);
          setCurrentTimestamp(Date.now());
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Error loading vocabulary data:', err);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Filtered & Sorted List
  const filteredList = useMemo(() => {
    let result = [...vocabList];

    // Search query
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.item.word.toLowerCase().includes(term) ||
          (v.item.meaningEs && v.item.meaningEs.toLowerCase().includes(term)) ||
          v.item.meaning.toLowerCase().includes(term) ||
          v.item.collocations.some((c) => c.toLowerCase().includes(term)) ||
          v.item.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    // CEFR filter
    if (selectedCefr !== 'all') {
      result = result.filter((v) => v.item.cefrLevel === selectedCefr);
    }

    // Mastery Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((v) => v.mastery.status === selectedStatus);
    }

    // Part of speech filter
    if (selectedPos !== 'all') {
      result = result.filter((v) => {
        if (selectedPos === 'phrasal verb') return v.item.pos === 'phrasal verb';
        if (selectedPos === 'collocation') return v.item.pos === 'collocation';
        if (selectedPos === 'connector') return v.item.pos === 'connector';
        return v.item.pos === selectedPos;
      });
    }

    // Sorting
    if (sortBy === 'priority') {
      result.sort((a, b) => b.item.priorityScore - a.item.priorityScore);
    } else if (sortBy === 'weakest') {
      result.sort((a, b) => {
        // First items with lapses
        if (b.review.lapses !== a.review.lapses) return b.review.lapses - a.review.lapses;
        // Then lower mastery score
        return a.mastery.score - b.mastery.score;
      });
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.item.word.localeCompare(b.item.word));
    }

    return result;
  }, [vocabList, searchTerm, selectedCefr, selectedStatus, selectedPos, sortBy]);

  const getStatusBadge = (status: MasteryStatus, score: number) => {
    switch (status) {
      case 'reliable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Dominada ({score}%)
          </span>
        );
      case 'used_correctly':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
            Uso correcto ({score}%)
          </span>
        );
      case 'recalled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Recordada ({score}%)
          </span>
        );
      case 'recognised':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            Reconocida ({score}%)
          </span>
        );
      case 'seen':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Vista ({score}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            Sin ver
          </span>
        );
    }
  };

  const getNextReviewLabel = (reviewDateIso: string, status: MasteryStatus) => {
    if (status === 'unseen') return 'Pendiente de inicio';
    const now = new Date().getTime();
    const diffMs = new Date(reviewDateIso).getTime() - now;
    if (diffMs <= 0) {
      return '¡Toca repasar hoy!';
    }
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `En ${diffHours} h`;
    const diffDays = Math.round(diffHours / 24);
    return `En ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Librería de Vocabulario"
        subtitle="Vocabulario esencial graduado de A2 a B2 clasificado por relevancia y frecuencia real."
        action={<div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/entrenar?mode=due_only')}
            className="btn-accent"
          >
            <RotateCcw className="w-4 h-4" />
            Repasar pendientes ({queueSummary.dueNow})
          </button>
          <button
            onClick={() => navigate('/entrenar?mode=smart_mix')}
            className="btn-primary"
          >
            <Play className="w-4 h-4 fill-white" />
            Practicar
          </button>
        </div>}
      />

      {/* SRS Review Queue Summary Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Palabras</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{queueSummary.totalCount}</p>
          <span className="text-xs text-slate-400">Currículo A2-B2</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Para repasar ya
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{queueSummary.dueNow}</p>
          <span className="text-xs text-amber-700">Programadas por SRS</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pendientes hoy</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{queueSummary.dueToday}</p>
          <span className="text-xs text-slate-400">Vencimiento en 24h</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-xs bg-rose-50/20">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Débiles / Fallos
          </p>
          <p className="text-2xl font-bold text-rose-900 mt-1">{queueSummary.weakCount}</p>
          <span className="text-xs text-rose-700">Requieren refuerzo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs bg-blue-50/20">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> En Recuerdo Activo
          </p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{queueSummary.recalledOrBetterCount}</p>
          <span className="text-xs text-blue-700">Nivel Recalled o superior</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sin iniciar</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{queueSummary.unseenCount}</p>
          <span className="text-xs text-slate-400">Por descubrir</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="panel p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar palabra, significado en español, colocación o etiqueta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'weakest' | 'alphabetical')}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="priority">Ordenar por Relevancia (Prioridad)</option>
              <option value="weakest">Ordenar por Más Débil</option>
              <option value="alphabetical">Ordenar Alfabéticamente (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Nivel:</span>
          </div>
          {['all', 'A2', 'A2+', 'B1', 'B1+', 'B2'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedCefr(lvl)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedCefr === lvl
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {lvl === 'all' ? 'Todos' : lvl}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-2">
            <span>Categoría:</span>
          </div>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'verb', label: 'Verbos' },
            { id: 'phrasal verb', label: 'Phrasals' },
            { id: 'collocation', label: 'Colocaciones' },
            { id: 'connector', label: 'Conectores' },
            { id: 'adjective', label: 'Adjetivos' },
            { id: 'noun', label: 'Sustantivos' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedPos(cat.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedPos === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-2">
            <span>Maestría:</span>
          </div>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'unseen', label: 'Sin ver' },
            { id: 'seen', label: 'Vistas' },
            { id: 'recognised', label: 'Reconocidas' },
            { id: 'recalled', label: 'Recordadas' },
            { id: 'reliable', label: 'Dominadas' },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedStatus === status.id
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary List / Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Cargando vocabulario...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-lg font-semibold text-slate-700">No se encontraron términos</p>
          <p className="text-sm mt-1">Prueba a ajustar la búsqueda o los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-slate-100 overflow-hidden">
          {filteredList.map((v) => {
            const isDue =
              v.mastery.status !== 'unseen' &&
              new Date(v.review.nextReviewDate).getTime() <= currentTimestamp;
            const isWeak =
              v.mastery.status !== 'unseen' && (v.review.lapses > 0 || v.mastery.score < 45);

            return (
              <div
                key={v.item.id}
                onClick={() => setActiveItem(v)}
                className={`group bg-white px-4 py-4 transition-colors cursor-pointer sm:grid sm:grid-cols-[minmax(0,1fr)_240px] sm:items-center sm:gap-6 sm:px-5 ${
                  activeItem?.item.id === v.item.id
                    ? 'bg-primary-50/60'
                    : isDue
                    ? 'bg-accent-50/50 hover:bg-accent-50'
                    : 'hover:bg-slate-50/70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {v.item.word}
                      </h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {v.item.pos}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                        {v.item.cefrLevel}
                      </span>
                      {isDue && (
                        <span
                          title="Toca repasar según el algoritmo SRS"
                          className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-800 flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" /> Repasar
                        </span>
                      )}
                      {isWeak && !isDue && (
                        <span
                          title="Palabra con fallos previos"
                          className="px-1.5 py-0.5 text-xs font-bold rounded-md bg-rose-100 text-rose-700"
                        >
                          Débil
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Spanish meaning preview */}
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {v.item.meaningEs || v.item.meaning}
                  </p>

                  {/* Example snippet */}
                  {v.item.examples && v.item.examples[0] && (
                    <p className="mt-1 line-clamp-1 text-xs italic text-slate-400">
                      "{v.item.examples[0]}"
                    </p>
                  )}
                </div>

                {/* Progress footer */}
                <div className="mt-3 border-t border-slate-100 pt-3 sm:mt-0 sm:border-0 sm:pt-0">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    {getStatusBadge(v.mastery.status, v.mastery.score)}
                    <span className="text-slate-400 font-medium">
                      {getNextReviewLabel(v.review.nextReviewDate, v.mastery.status)}
                    </span>
                  </div>

                  {/* Mastery mini progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        v.mastery.status === 'reliable'
                          ? 'bg-emerald-500'
                          : v.mastery.status === 'recalled' || v.mastery.status === 'used_correctly'
                          ? 'bg-blue-500'
                          : v.mastery.status === 'recognised'
                          ? 'bg-indigo-400'
                          : v.mastery.status === 'seen'
                          ? 'bg-amber-400'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${Math.max(4, v.mastery.score)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal / Drawer */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px] flex justify-end">
          <div role="dialog" aria-modal="true" aria-label={`Detalle de ${activeItem.item.word}`} className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-md sm:p-7 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">{activeItem.item.word}</h2>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary-100 text-primary-800">
                    {activeItem.item.cefrLevel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 uppercase">
                    {activeItem.item.pos}
                  </span>
                </div>
                <p className="text-base font-semibold text-primary-700 mt-1">
                  {activeItem.item.meaningEs}
                </p>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                aria-label="Cerrar detalle"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Definition */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Definición en Inglés
              </p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {activeItem.item.meaning}
              </p>
            </div>

            {/* Examples */}
            {activeItem.item.examples.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Ejemplos en Contexto
                </p>
                <ul className="space-y-2">
                  {activeItem.item.examples.map((ex, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-start gap-2"
                    >
                      <span className="text-primary-600 font-bold">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Collocations */}
            {activeItem.item.collocations.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Colocaciones Habituales
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeItem.item.collocations.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-lg text-xs font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Notes */}
            {activeItem.item.usageNote && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                  Nota de uso / Falso amigo
                </p>
                <p className="text-xs text-blue-800 leading-relaxed">{activeItem.item.usageNote}</p>
              </div>
            )}

            {/* SRS & Mastery History */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-500 font-medium">Nivel de Maestría</p>
                <p className="text-base font-bold text-slate-800 capitalize mt-0.5">
                  {activeItem.mastery.status}
                </p>
                <p className="text-xs text-slate-400">{activeItem.mastery.score}/100 pts</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Intervalo SRS</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">
                  {activeItem.review.interval} día{activeItem.review.interval !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-slate-400">Facilidad: {activeItem.review.easeFactor}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Fallos Registrados</p>
                <p className="text-base font-bold text-rose-600 mt-0.5">
                  {activeItem.review.lapses}
                </p>
                <p className="text-xs text-slate-400">
                  Aciertos seguidos: {activeItem.review.consecutiveCorrect}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Próximo Repaso</p>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {getNextReviewLabel(activeItem.review.nextReviewDate, activeItem.mastery.status)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  navigate(`/entrenar?wordId=${activeItem.item.id}`);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Practicar esta palabra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
