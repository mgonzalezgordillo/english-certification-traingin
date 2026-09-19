import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Filter,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { seedReadingExercises } from '../data/seedReading';
import type {
  GenericExercise,
  ReadingProgressRecord,
  ExerciseSessionResult,
} from '../types/exercise';
import type { CEFRLevel } from '../types';
import {
  recordReadingSessionResult,
  getReadingProgressMap,
  getReadingHistory,
  getReadingMetrics,
} from '../lib/db';
import { selectTopReadingRecommendation } from '../lib/learning/readingAdaptive';
import { identifyWeakErrorCategories } from '../lib/learning/readingAnalytics';
import { ExerciseRunner } from '../components/exercise/ExerciseRunner';
import { MetricCard, PageHeader, SegmentedControl } from '../components/ui';

export default function Reading() {
  const [selectedExercise, setSelectedExercise] = useState<GenericExercise | null>(null);
  const [exerciseMode, setExerciseMode] = useState<'training' | 'exam'>('training');

  // DB progress & stats
  const [progressMap, setProgressMap] = useState<Map<string, ReadingProgressRecord>>(new Map());
  const [readingHistory, setReadingHistory] = useState<ExerciseSessionResult[]>([]);
  const [metrics, setMetrics] = useState<{
    totalCompleted: number;
    totalAttempts: number;
    averageFirstAttemptAccuracy: number;
    averageFinalAccuracy: number;
    totalTimeSpentSec: number;
  }>({
    totalCompleted: 0,
    totalAttempts: 0,
    averageFirstAttemptAccuracy: 0,
    averageFinalAccuracy: 0,
    totalTimeSpentSec: 0,
  });

  // Filters
  const [levelFilter, setLevelFilter] = useState<CEFRLevel | 'all'>('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string | 'all'>('all');

  const loadData = useCallback(async () => {
    try {
      const [pMap, hist, m] = await Promise.all([
        getReadingProgressMap(),
        getReadingHistory(),
        getReadingMetrics(),
      ]);
      setProgressMap(pMap);
      setReadingHistory(hist);
      setMetrics(m);
    } catch (err) {
      console.error('Error loading reading data from Dexie:', err);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      getReadingProgressMap(),
      getReadingHistory(),
      getReadingMetrics(),
    ])
      .then(([pMap, hist, m]) => {
        if (active) {
          setProgressMap(pMap);
          setReadingHistory(hist);
          setMetrics(m);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Error loading reading data from Dexie:', err);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Adaptive recommendation
  const recommendation = useMemo(() => {
    return selectTopReadingRecommendation(
      seedReadingExercises,
      progressMap,
      readingHistory,
      undefined,
      { targetCefr: levelFilter, targetTaskType: taskTypeFilter }
    );
  }, [progressMap, readingHistory, levelFilter, taskTypeFilter]);

  // Weak error categories across user history
  const weakErrors = useMemo(() => {
    return identifyWeakErrorCategories(readingHistory).slice(0, 3);
  }, [readingHistory]);

  // Filtered exercises list
  const filteredExercises = useMemo(() => {
    return seedReadingExercises.filter((act) => {
      if (levelFilter !== 'all' && act.cefrLevel !== levelFilter) return false;
      if (taskTypeFilter !== 'all' && act.taskType !== taskTypeFilter) return false;
      return true;
    });
  }, [levelFilter, taskTypeFilter]);

  // Save session result handler
  const handleSessionComplete = async (result: ExerciseSessionResult) => {
    try {
      await recordReadingSessionResult(result);
      await loadData();
    } catch (err) {
      console.error('Failed to save reading session result:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // ==========================================
  // VIEW: ACTIVE EXERCISE (Two-column layout)
  // ==========================================
  if (selectedExercise) {
    return (
      <div className="space-y-4">
        {/* Top Breadcrumb / Title */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedExercise(null)}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            ← Volver a la lista de Reading
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Modo actual: <strong className="capitalize">{exerciseMode}</strong>
            </span>
          </div>
        </div>

        {/* Dual-column workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Reading Passage / Context / Texts */}
          <div className="space-y-4 lg:col-span-7 xl:col-span-8">
            <div className="panel p-5 md:p-8">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block">
                    Texto de Lectura
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
                    {selectedExercise.title}
                  </h2>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                  {selectedExercise.cefrLevel}
                </span>
              </div>

              {/* Instructions banner */}
              {selectedExercise.instructions && (
                <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 font-medium">
                  {selectedExercise.instructions}
                </div>
              )}

              {/* Context notes */}
              {selectedExercise.content?.context && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {selectedExercise.content.context}
                </p>
              )}

              {/* Multi-text matching view (e.g. Text A, B, C, D) */}
              {selectedExercise.content?.texts ? (
                <div className="space-y-4">
                  {selectedExercise.content.texts.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <h4 className="text-sm font-bold text-slate-900 mb-1.5">{t.title}</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{t.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                /* Standard Passage Text */
                <div className="max-w-[75ch] space-y-4 whitespace-pre-line text-base font-normal leading-7 text-slate-800 md:text-[17px]">
                  {selectedExercise.content?.text}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Exercise Engine Runner */}
          <div className="lg:sticky lg:top-20 lg:col-span-5 xl:col-span-4">
            <ExerciseRunner
              exercise={selectedExercise}
              mode={exerciseMode}
              onComplete={handleSessionComplete}
              onReturnToHub={() => setSelectedExercise(null)}
              onNext={() => {
                // Find next activity
                const currentIdx = seedReadingExercises.findIndex(
                  (a) => a.id === selectedExercise.id
                );
                if (currentIdx !== -1 && currentIdx < seedReadingExercises.length - 1) {
                  setSelectedExercise(seedReadingExercises[currentIdx + 1]);
                } else {
                  setSelectedExercise(null);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: READING HUB & ACTIVITIES DIRECTORY
  // ==========================================
  return (
    <div className="page-stack">
      <PageHeader title="Reading Trainer" subtitle="Práctica comprensiva de comprensión lectora desde A2 hasta B2 basada en formato de examen." eyebrow="Módulo de habilidades" action={<SegmentedControl items={['training', 'exam'] as const} value={exerciseMode} onChange={setExerciseMode} getLabel={(item) => item === 'training' ? 'Entrenamiento' : 'Examen'} />} />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Completadas" value={`${metrics.totalCompleted} / ${seedReadingExercises.length}`} detail={`${Math.round((metrics.totalCompleted / seedReadingExercises.length) * 100)}% del banco cubierto`} />
        <MetricCard label="1º intento" value={`${metrics.averageFirstAttemptAccuracy}%`} detail="Precisión inicial estricta" />
        <MetricCard label="Precisión final" value={`${metrics.averageFinalAccuracy}%`} detail="Tras resolución completa" />
        <MetricCard label="Tiempo total" value={formatTime(metrics.totalTimeSpentSec)} detail={`${metrics.totalAttempts} intentos totales`} />
      </div>

      {/* Recommended Practice Banner */}
      {recommendation && (
        <div className="panel relative flex flex-col items-start justify-between gap-6 overflow-hidden p-5 md:flex-row md:items-center md:p-6">
          <div className="absolute inset-y-0 left-0 w-1 bg-primary-600" aria-hidden="true" />
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="status-pill border-primary-200 bg-primary-50 text-primary-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Práctica Recomendada
              </span>
              <span className="status-pill">
                {recommendation.activity.cefrLevel}
              </span>
              <span className="text-xs text-slate-500">
                Dificultad {recommendation.activity.difficulty}/10
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold leading-tight">
              {recommendation.activity.title}
            </h3>

            <p className="line-clamp-2 text-sm text-slate-500">
              {recommendation.reason} — {recommendation.activity.instructions}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedExercise(recommendation.activity)}
            className="btn-primary shrink-0"
          >
            <span>Comenzar Ahora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Weak Areas Warning (if detected) */}
      {weakErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-amber-900">
            <p className="font-semibold">Áreas con más errores en tu historial:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {weakErrors.map((w, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white/80 border border-amber-300 rounded-md font-medium text-amber-950"
                >
                  {w.label} ({w.count} fallos)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* CEFR Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['all', 'A2', 'B1', 'B2'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                levelFilter === lvl
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {lvl === 'all' ? 'Todos los Niveles' : `Nivel ${lvl}`}
            </button>
          ))}
        </div>

        {/* Task Type Dropdown Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={taskTypeFilter}
            onChange={(e) => setTaskTypeFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-700 outline-none focus:border-primary-500 font-medium"
          >
            <option value="all">Todos los formatos de tarea</option>
            <option value="short_message">Short Messages & Notices</option>
            <option value="multiple_choice_cloze">Multiple Choice Cloze</option>
            <option value="open_cloze">Open Cloze (Grammar gaps)</option>
            <option value="matching">Matching (Profiles / Options)</option>
            <option value="sentence_insertion">Sentence Insertion</option>
            <option value="ordered_items">Ordered Items / Discourse</option>
            <option value="sentence_completion">Sentence Completion</option>
            <option value="long_passage">Long Passage Comprehension</option>
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="panel divide-y divide-slate-100 overflow-hidden">
        {filteredExercises.map((act) => {
          const progress = progressMap.get(act.id);
          const isCompleted = progress && progress.status === 'completed';

          return (
            <div
              key={act.id}
              className="grid gap-4 p-4 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
            >
              <div>
                {/* Card Top Badges */}
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                      {act.cefrLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs text-slate-500 bg-slate-50 border border-slate-200">
                      Dificultad {act.difficulty}/10
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{progress.bestFirstAttemptAccuracy}%</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No iniciado</span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5">{act.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{act.instructions}</p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between gap-5 sm:justify-end">
                <span className="text-xs font-medium text-slate-400 capitalize">
                  {act.taskType.replace(/_/g, ' ')}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedExercise(act)}
                  className="btn-secondary min-h-9 px-3 text-xs"
                >
                  <span>{isCompleted ? 'Repasar' : 'Comenzar'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
