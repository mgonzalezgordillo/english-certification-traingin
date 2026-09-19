import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Award,
  AlertTriangle,
  ChevronLeft,
  Lightbulb,
} from 'lucide-react';
import {
  getGrammarWithProgress,
  recordGrammarAttemptAndProgress,
  saveStudySession,
} from '../lib/db';
import { seedGrammarExercises } from '../data/seedGrammarExercises';
import { classifyGrammarError } from '../lib/learning/grammarErrors';
import type {
  GrammarExercise,
  GrammarWithProgress,
  ExerciseAttempt,
  AnswerAttempt,
  StudySession,
} from '../types';

const getNow = (): number => Date.now();

export default function GrammarPractice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [allGrammar, setAllGrammar] = useState<GrammarWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Practice session state
  const [sessionExercises, setSessionExercises] = useState<GrammarExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionAttempts, setSessionAttempts] = useState<ExerciseAttempt[]>([]);
  const sessionStartTimeRef = useRef<number>(0);

  // Current question attempt state
  const [userTypedAnswer, setUserTypedAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState<1 | 2>(1);
  const [currentAttemptsHistory, setCurrentAttemptsHistory] = useState<AnswerAttempt[]>([]);
  const [isResolved, setIsResolved] = useState(false);
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState<boolean | null>(null);
  const [finalCorrect, setFinalCorrect] = useState<boolean | null>(null);
  const [hintsRequested, setHintsRequested] = useState<number>(0);
  const exerciseStartTimeRef = useRef<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize and select exercises based on query params
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const list = await getGrammarWithProgress();
        if (!active) return;
        setAllGrammar(list);

        const conceptId = searchParams.get('conceptId');
        const mode = searchParams.get('mode');
        const cefr = searchParams.get('cefr');

        let pool: GrammarExercise[] = [...seedGrammarExercises];

        if (conceptId) {
          pool = pool.filter((e) => e.conceptId === conceptId);
        } else if (mode === 'weak') {
          const weakConceptIds = new Set(
            list.filter((g) => g.strengthState === 'weak').map((g) => g.concept.id)
          );
          const weakPool = pool.filter((e) => weakConceptIds.has(e.conceptId));
          pool = weakPool.length > 0 ? weakPool : pool;
        } else if (cefr) {
          pool = pool.filter((e) => e.cefrLevel === cefr);
        }

        // Shuffle exercises
        const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
        setSessionExercises(shuffled);
        setCurrentIndex(0);
        sessionStartTimeRef.current = getNow();
        exerciseStartTimeRef.current = getNow();
      } catch (err) {
        console.error('Error loading practice session:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [searchParams]);

  const currentExercise: GrammarExercise | undefined = sessionExercises[currentIndex];

  const currentConceptMeta = useMemo(() => {
    if (!currentExercise) return null;
    return allGrammar.find((g) => g.concept.id === currentExercise.conceptId);
  }, [currentExercise, allGrammar]);

  // Focus input on mount or exercise change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, attemptNumber]);

  // Normalize string for fair comparison
  const normalize = (str: string): string => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/^[¿¡?!.,;:_\s]+|[¿¡?!.,;:_\s]+$/g, '')
      .replace(/\s+/g, ' ');
  };

  // Evaluate candidate answer against correct and accepted variations
  const isAnswerMatch = (input: string, exercise: GrammarExercise): boolean => {
    const normInput = normalize(input);
    const normCorrect = normalize(exercise.correctAnswer);
    if (normInput === normCorrect) return true;

    if (exercise.acceptedAnswers) {
      return exercise.acceptedAnswers.some((acc) => normalize(acc) === normInput);
    }
    return false;
  };

  const handleRequestHint = () => {
    if (!currentExercise || hintsRequested >= currentExercise.hints.length) return;
    setHintsRequested((prev) => prev + 1);
  };

  const handleSubmitAnswer = async () => {
    if (!currentExercise || isResolved) return;

    const candidate =
      currentExercise.type === 'multiple_choice' ||
      currentExercise.type === 'choose_form' ||
      currentExercise.type === 'contrast_choice'
        ? selectedOption || ''
        : userTypedAnswer.trim();

    if (!candidate) return;

    const timeSpent = Math.max(500, getNow() - (exerciseStartTimeRef.current || getNow()));
    const isCorrect = isAnswerMatch(candidate, currentExercise);

    const thisAttempt: AnswerAttempt = {
      timestamp: new Date().toISOString(),
      selectedAnswer: candidate,
      isCorrect,
      timeSpentMs: timeSpent,
      hintsRequested,
    };

    const updatedAttemptsHistory = [...currentAttemptsHistory, thisAttempt];
    setCurrentAttemptsHistory(updatedAttemptsHistory);

    if (attemptNumber === 1) {
      setFirstAttemptCorrect(isCorrect);
      if (isCorrect) {
        // Immediate success on attempt 1!
        setFinalCorrect(true);
        setIsResolved(true);
        await recordAttempt(true, true, 1, updatedAttemptsHistory, candidate, timeSpent);
      } else {
        // Failed attempt 1 -> prompt for attempt 2
        setAttemptNumber(2);
        // Clear selection for retry
        setSelectedOption(null);
      }
    } else {
      // Attempt 2 submission (final)
      setFinalCorrect(isCorrect);
      setIsResolved(true);
      await recordAttempt(
        firstAttemptCorrect ?? false,
        isCorrect,
        2,
        updatedAttemptsHistory,
        candidate,
        timeSpent
      );
    }
  };

  const recordAttempt = async (
    firstCorrect: boolean,
    eventualCorrect: boolean,
    attemptsCount: number,
    history: AnswerAttempt[],
    lastAnswer: string,
    timeSpentMs: number
  ) => {
    if (!currentExercise) return;

    // Error classification if any mistake occurred
    let errorClass = undefined;
    if (!firstCorrect) {
      errorClass = classifyGrammarError(
        currentExercise,
        lastAnswer,
        timeSpentMs,
        currentConceptMeta?.mastery
      );
    }

    const exerciseAttempt: ExerciseAttempt = {
      id: `ea_gram_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      exerciseId: currentExercise.id,
      userId: 'default_user',
      startedAt: new Date(exerciseStartTimeRef.current || getNow()).toISOString(),
      completedAt: new Date().toISOString(),
      attempts: history,
      finalCorrect: eventualCorrect,
      errorClassification: errorClass,
    };

    setSessionAttempts((prev) => [...prev, exerciseAttempt]);

    try {
      await recordGrammarAttemptAndProgress({
        attempt: exerciseAttempt,
        conceptId: currentExercise.conceptId,
        input: {
          exerciseType: currentExercise.type,
          firstAttemptCorrect: firstCorrect,
          eventualCorrect,
          attemptsCount,
          hintsUsed: hintsRequested,
          timeSpentMs,
        },
      });
    } catch (err) {
      console.error('Error persisting grammar attempt:', err);
    }
  };

  const handleNextExercise = () => {
    if (currentIndex + 1 < sessionExercises.length) {
      setCurrentIndex((prev) => prev + 1);
      setAttemptNumber(1);
      setUserTypedAnswer('');
      setSelectedOption(null);
      setCurrentAttemptsHistory([]);
      setIsResolved(false);
      setFirstAttemptCorrect(null);
      setFinalCorrect(null);
      setHintsRequested(0);
      exerciseStartTimeRef.current = getNow();
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    setSessionFinished(true);
    const session: StudySession = {
      id: `ss_gram_${getNow()}`,
      startedAt: new Date(sessionStartTimeRef.current || getNow()).toISOString(),
      endedAt: new Date().toISOString(),
      durationMs: getNow() - (sessionStartTimeRef.current || getNow()),
      exercisesAttempted: sessionAttempts.map((a) => a.id),
    };
    try {
      await saveStudySession(session);
    } catch (err) {
      console.error('Error saving grammar session:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium text-slate-500">Cargando sesión de entrenamiento...</p>
      </div>
    );
  }

  if (sessionExercises.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No hay ejercicios disponibles para este filtro</h2>
        <p className="text-sm text-slate-600">
          No se encontraron ejercicios activos para los parámetros seleccionados.
        </p>
        <button
          onClick={() => navigate('/gramatica')}
          className="btn-primary"
        >
          Volver a la Librería
        </button>
      </div>
    );
  }

  // Summary Screen when session finishes
  if (sessionFinished) {
    const total = sessionAttempts.length;
    const firstAccurate = sessionAttempts.filter(
      (a) => a.attempts.length > 0 && a.attempts[0].isCorrect
    ).length;
    const eventualAccurate = sessionAttempts.filter((a) => a.finalCorrect).length;
    const firstAccRate = total > 0 ? Math.round((firstAccurate / total) * 100) : 0;
    const eventualAccRate = total > 0 ? Math.round((eventualAccurate / total) * 100) : 0;

    return (
      <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
        <div className="panel-section space-y-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              ¡Entrenamiento Gramatical Completado!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Has completado {total} ejercicios con evaluación rigurosa de 1er intento.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Acierto 1er Intento
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{firstAccRate}%</p>
              <span className="text-xs text-slate-500">{firstAccurate} de {total}</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Resolución Final
              </p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{eventualAccRate}%</p>
              <span className="text-xs text-slate-500">{eventualAccurate} de {total}</span>
            </div>
          </div>

          {/* Mistakes analysis */}
          {sessionAttempts.some((a) => a.errorClassification) && (
            <div className="text-left pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Diagnóstico de Errores Detectados
              </p>
              <div className="space-y-2">
                {sessionAttempts
                  .filter((a) => a.errorClassification)
                  .map((a, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-rose-900">
                        {a.errorClassification?.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        Concepto: {a.errorClassification?.grammarConceptId}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/gramatica')}
              className="btn-secondary w-full sm:w-auto"
            >
              Volver a la Librería
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Otra Ronda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Session Progress Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/gramatica')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Salir a la librería</span>
        </button>

        {/* Progress pills */}
        <div className="flex items-center gap-1.5 flex-1 max-w-xs">
          {sessionExercises.map((_, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  isDone
                    ? 'bg-primary-600'
                    : isCurrent
                    ? 'bg-primary-400'
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        <span className="text-xs font-bold text-slate-600">
          {currentIndex + 1} / {sessionExercises.length}
        </span>
      </div>

      {/* Main Exercise Card */}
      <div className="panel space-y-6 p-5 md:p-8">
        {/* Concept Badge & CEFR */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary-100 text-primary-800">
              {currentExercise.cefrLevel}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {currentConceptMeta?.concept.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {attemptNumber === 2 && !isResolved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" /> 2º Intento (Última oportunidad)
              </span>
            )}
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              {currentExercise.type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-2">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
            {currentExercise.prompt}
          </h2>

          {/* Original Sentence context if transformation */}
          {currentExercise.originalSentence && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-sm text-slate-800">
              <span className="font-semibold text-slate-500 block text-xs uppercase mb-1">
                Frase original:
              </span>
              "{currentExercise.originalSentence}"
            </div>
          )}

          {/* Keyword badge if Cambridge style */}
          {currentExercise.keyWord && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Palabra clave:</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-mono text-xs font-extrabold">
                {currentExercise.keyWord}
              </span>
            </div>
          )}

          {/* Sentence Context with blank */}
          {currentExercise.sentenceContext && (
            <p className="text-base font-medium text-slate-800 pt-2 leading-relaxed">
              {currentExercise.sentenceContext}
            </p>
          )}
        </div>

        {/* Interactive Answer Input Area */}
        {/* Type 1: Multiple Choice / Choose Form / Contrast Choice */}
        {(currentExercise.type === 'multiple_choice' ||
          currentExercise.type === 'choose_form' ||
          currentExercise.type === 'contrast_choice') &&
          currentExercise.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentExercise.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                let cardStyle =
                  'border-slate-200/90 hover:border-primary-400 hover:bg-slate-50 text-slate-800';

                if (isSelected) {
                  cardStyle =
                    'border-primary-600 bg-primary-50/50 text-primary-900 ring-2 ring-primary-500/20';
                }

                if (isResolved) {
                  const isCorrect = isAnswerMatch(option, currentExercise);
                  if (isCorrect) {
                    cardStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'border-rose-500 bg-rose-50/80 text-rose-900';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isResolved}
                    onClick={() => setSelectedOption(option)}
                    className={`flex items-center justify-between rounded-lg border p-4 text-left text-sm font-semibold transition-all ${cardStyle}`}
                  >
                    <span>{option}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                        isSelected
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        {/* Type 2: Typing Inputs (Fill in blank / Sentence Transformation / Error Correction) */}
        {(currentExercise.type === 'fill_in_the_blank' ||
          currentExercise.type === 'sentence_transformation' ||
          currentExercise.type === 'error_correction') && (
          <div className="pt-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                disabled={isResolved}
                value={userTypedAnswer}
                onChange={(e) => setUserTypedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (isResolved) handleNextExercise();
                    else handleSubmitAnswer();
                  }
                }}
                placeholder="Escribe tu respuesta aquí..."
                className={`w-full rounded-lg border px-4 py-3 text-base font-semibold transition-all focus:outline-hidden ${
                  isResolved
                    ? finalCorrect
                      ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950'
                      : 'border-rose-500 bg-rose-50/30 text-rose-950'
                    : 'border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15'
                }`}
              />
            </div>
          </div>
        )}

        {/* Hint System */}
        {!isResolved && currentExercise.hints && currentExercise.hints.length > 0 && (
          <div className="pt-2 flex flex-col items-start gap-2">
            {hintsRequested === 0 ? (
              <button
                type="button"
                onClick={handleRequestHint}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Solicitar pista (-4 pts en progreso)</span>
              </button>
            ) : (
              <div className="w-full space-y-2">
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-800">
                    <Lightbulb className="w-3.5 h-3.5" /> Pista 1 (Puntero estructural):
                  </div>
                  <p>{currentExercise.hints[0]}</p>
                </div>

                {hintsRequested >= 2 && currentExercise.hints[1] && (
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-amber-800">
                      <Lightbulb className="w-3.5 h-3.5" /> Pista 2 (Regla gramatical):
                    </div>
                    <p>{currentExercise.hints[1]}</p>
                  </div>
                )}

                {hintsRequested < currentExercise.hints.length && (
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    className="text-xs font-semibold text-amber-700 hover:underline"
                  >
                    Ver pista adicional
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resolution Banner */}
        {isResolved && (
          <div
            className={`space-y-3 rounded-lg border p-5 animate-in fade-in ${
              finalCorrect
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {finalCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>
                    {firstAttemptCorrect
                      ? '¡Correcto al primer intento! (+14 pts)'
                      : '¡Resuelto en el segundo intento! (+2 pts de consolidación)'}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Respuesta incorrecta</span>
                </>
              )}
            </div>

            {!finalCorrect && (
              <div className="text-xs space-y-1 pt-1 border-t border-rose-200/60">
                <span className="font-semibold text-slate-600">Respuesta canónica correcta:</span>
                <p className="font-mono font-bold text-slate-900 text-sm">
                  {currentExercise.correctAnswer}
                </p>
              </div>
            )}

            {currentExercise.explanation && (
              <div className="text-xs pt-2 border-t border-slate-200/50 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Por qué es así:</span>
                {currentExercise.explanation}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isResolved ? 'Pulsa "Siguiente" o Enter' : 'Responde con atención'}
          </div>

          <div>
            {!isResolved ? (
              <button
                onClick={handleSubmitAnswer}
                className="btn-primary"
              >
                <span>Comprobar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNextExercise}
                className="btn-primary"
              >
                <span>
                  {currentIndex + 1 < sessionExercises.length ? 'Siguiente ejercicio' : 'Ver resumen'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
