import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Trophy,
  Check,
} from 'lucide-react';
import {
  getVocabularyWithProgress,
  recordVocabularyAttemptAndProgress,
  saveStudySession,
} from '../lib/db';
import { selectSessionItems } from '../lib/learning/adaptive';
import { generateExercise, normalizeAnswer } from '../lib/learning/exercises';
import { classifyVocabularyError } from '../lib/learning/errors';
import type {
  VocabularyWithProgress,
  VocabularyExercise,
  TrainingSessionConfig,
  TrainingSessionMode,
  VocabularyExerciseType,
  ExerciseAttempt,
  AnswerAttempt,
  StudySession,
} from '../types';

export default function Training() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [allVocab, setAllVocab] = useState<VocabularyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Session configuration state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [config, setConfig] = useState<TrainingSessionConfig>({
    itemCount: 10,
    mode: (searchParams.get('mode') as TrainingSessionMode) || 'smart_mix',
    preferredType: 'mixed',
  });

  // Active session queue & current exercise
  const [sessionQueue, setSessionQueue] = useState<VocabularyWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<VocabularyExercise | null>(null);

  // Answering state
  const [userTypedInput, setUserTypedInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attemptStage, setAttemptStage] = useState<'initial' | 'first_error' | 'resolved'>('initial');
  const [attemptsHistory, setAttemptsHistory] = useState<AnswerAttempt[]>([]);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(() => Date.now());
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Session aggregates
  const [sessionAttempts, setSessionAttempts] = useState<ExerciseAttempt[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(() => Date.now());
  const [failedVocabIds, setFailedVocabIds] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);

  const loadCard = useCallback(
    (
      index: number,
      queue: VocabularyWithProgress[],
      pool: VocabularyWithProgress[]
    ) => {
      const currentItem = queue[index];
      if (!currentItem) return;

      const rawPool = pool.map((p) => p.item);
      const exercise = generateExercise(
        currentItem.item,
        rawPool,
        config.preferredType
      );

      setCurrentExercise(exercise);
      setUserTypedInput('');
      setSelectedOption(null);
      setAttemptStage('initial');
      setAttemptsHistory([]);
      setHintsRevealed(0);
      setFlashcardFlipped(false);
      setExerciseStartTime(Date.now());

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    [config.preferredType]
  );

  const startSessionWithItems = useCallback(
    (
      items: VocabularyWithProgress[],
      pool: VocabularyWithProgress[]
    ) => {
      if (items.length === 0) return;
      setSessionQueue(items);
      setCurrentIndex(0);
      setSessionAttempts([]);
      setFailedVocabIds(new Set());
      setSessionStartTime(Date.now());
      setSessionActive(true);
      setSessionFinished(false);

      loadCard(0, items, pool);
    },
    [loadCard]
  );

  useEffect(() => {
    let active = true;
    getVocabularyWithProgress()
      .then((data) => {
        if (!active) return;
        setAllVocab(data);

        // If URL contains wordId, launch immediate single practice
        const wordIdParam = searchParams.get('wordId');
        if (wordIdParam) {
          const target = data.find((v) => v.item.id === wordIdParam);
          if (target) {
            startSessionWithItems([target], data);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error loading vocabulary for training:', err);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchParams, startSessionWithItems]);

  const handleStartSession = () => {
    const selected = selectSessionItems(allVocab, config);
    if (selected.length === 0) {
      // Fallback: take first n items if filtered pool was empty
      const fallback = allVocab.slice(0, config.itemCount);
      startSessionWithItems(fallback, allVocab);
    } else {
      startSessionWithItems(selected, allVocab);
    }
  };

  // Evaluate user submission
  const evaluateAnswer = useCallback(
    async (submittedAnswer: string) => {
      if (!currentExercise || attemptStage === 'resolved') return;

      const currentVocab = sessionQueue[currentIndex];
      const timeSpent = Date.now() - exerciseStartTime;
      const isTyped =
        currentExercise.type === 'meaning_to_en' || currentExercise.type === 'context_blank';

      // Check correctness
      let isCorrect: boolean;
      if (isTyped) {
        const normUser = normalizeAnswer(submittedAnswer);
        const normTarget = normalizeAnswer(currentExercise.correctAnswer);
        const accepted = (currentExercise.acceptedAnswers || []).map(normalizeAnswer);
        isCorrect = normUser === normTarget || accepted.includes(normUser);
      } else {
        isCorrect = submittedAnswer === currentExercise.correctAnswer;
      }

      const currentAttempt: AnswerAttempt = {
        timestamp: new Date().toISOString(),
        selectedAnswer: submittedAnswer,
        isCorrect,
        timeSpentMs: timeSpent,
        hintsRequested: hintsRevealed,
      };

      const updatedHistory = [...attemptsHistory, currentAttempt];
      setAttemptsHistory(updatedHistory);

      const isFirstAttempt = updatedHistory.length === 1;

      if (isCorrect) {
        // Success (either on attempt 1 or attempt 2)
        setAttemptStage('resolved');

        const firstAttemptCorrect = updatedHistory[0].isCorrect;
        const totalHints = hintsRevealed;

        const attemptRecord: ExerciseAttempt = {
          id: `att_${Date.now()}_${currentIndex}`,
          exerciseId: currentExercise.id,
          userId: 'default_user',
          startedAt: new Date(exerciseStartTime).toISOString(),
          completedAt: new Date().toISOString(),
          attempts: updatedHistory,
          finalCorrect: true,
        };

        setSessionAttempts((prev) => [...prev, attemptRecord]);

        // Record in Dexie and calculate next SRS & Mastery state
        await recordVocabularyAttemptAndProgress({
          attempt: attemptRecord,
          vocabularyId: currentVocab.item.id,
          srsInput: {
            firstAttemptCorrect,
            eventualCorrect: true,
            hintsUsed: totalHints,
            timeSpentMs: timeSpent,
            attemptsCount: updatedHistory.length,
          },
          masteryInput: {
            exerciseType: currentExercise.type,
            firstAttemptCorrect,
            eventualCorrect: true,
            attemptsCount: updatedHistory.length,
            hintsUsed: totalHints,
            timeSpentMs: timeSpent,
          },
        });
      } else {
        // Incorrect
        if (isFirstAttempt) {
          // FIRST ERROR: strict rule -> do not reveal answer, give retry option
          setAttemptStage('first_error');
          setFailedVocabIds((prev) => new Set(prev).add(currentVocab.item.id));
        } else {
          // SECOND ATTEMPT FAILED: maximum attempts reached (2 attempts)
          setAttemptStage('resolved');
          setFailedVocabIds((prev) => new Set(prev).add(currentVocab.item.id));

          const errClass = classifyVocabularyError(
            currentExercise,
            submittedAnswer,
            timeSpent,
            currentVocab.review
          );

          const attemptRecord: ExerciseAttempt = {
            id: `att_${Date.now()}_${currentIndex}`,
            exerciseId: currentExercise.id,
            userId: 'default_user',
            startedAt: new Date(exerciseStartTime).toISOString(),
            completedAt: new Date().toISOString(),
            attempts: updatedHistory,
            finalCorrect: false,
            errorClassification: errClass,
          };

          setSessionAttempts((prev) => [...prev, attemptRecord]);

          await recordVocabularyAttemptAndProgress({
            attempt: attemptRecord,
            vocabularyId: currentVocab.item.id,
            srsInput: {
              firstAttemptCorrect: false,
              eventualCorrect: false,
              hintsUsed: hintsRevealed,
              timeSpentMs: timeSpent,
              attemptsCount: updatedHistory.length,
            },
            masteryInput: {
              exerciseType: currentExercise.type,
              firstAttemptCorrect: false,
              eventualCorrect: false,
              attemptsCount: updatedHistory.length,
              hintsUsed: hintsRevealed,
              timeSpentMs: timeSpent,
            },
          });
        }
      }
    },
    [
      currentExercise,
      attemptStage,
      sessionQueue,
      currentIndex,
      exerciseStartTime,
      hintsRevealed,
      attemptsHistory,
    ]
  );

  // Flashcard self rating handler
  const handleFlashcardRating = async (rating: 'did_not_know' | 'unsure' | 'knew_it') => {
    if (!currentExercise || attemptStage === 'resolved') return;
    const currentVocab = sessionQueue[currentIndex];
    const timeSpent = Date.now() - exerciseStartTime;

    const isCorrect = rating === 'knew_it';
    const isUnsure = rating === 'unsure';

    const currentAttempt: AnswerAttempt = {
      timestamp: new Date().toISOString(),
      selectedAnswer: rating,
      isCorrect: isCorrect || isUnsure,
      timeSpentMs: timeSpent,
      hintsRequested: hintsRevealed,
    };

    const attemptRecord: ExerciseAttempt = {
      id: `att_${Date.now()}_${currentIndex}`,
      exerciseId: currentExercise.id,
      userId: 'default_user',
      startedAt: new Date(exerciseStartTime).toISOString(),
      completedAt: new Date().toISOString(),
      attempts: [currentAttempt],
      finalCorrect: isCorrect,
    };

    setAttemptStage('resolved');
    setSessionAttempts((prev) => [...prev, attemptRecord]);
    if (!isCorrect) {
      setFailedVocabIds((prev) => new Set(prev).add(currentVocab.item.id));
    }

    await recordVocabularyAttemptAndProgress({
      attempt: attemptRecord,
      vocabularyId: currentVocab.item.id,
      srsInput: {
        firstAttemptCorrect: isCorrect,
        eventualCorrect: isCorrect || isUnsure,
        hintsUsed: isUnsure ? 1 : 0,
        timeSpentMs: timeSpent,
        attemptsCount: 1,
      },
      masteryInput: {
        exerciseType: 'flashcard',
        firstAttemptCorrect: isCorrect,
        eventualCorrect: isCorrect,
        attemptsCount: 1,
        hintsUsed: isUnsure ? 1 : 0,
        timeSpentMs: timeSpent,
      },
    });
  };

  // Next exercise in queue
  const handleNextExercise = useCallback(async () => {
    if (currentIndex + 1 < sessionQueue.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      loadCard(nextIdx, sessionQueue, allVocab);
    } else {
      // Session finished!
      setSessionFinished(true);

      const sessionRecord: StudySession = {
        id: `sess_${Date.now()}`,
        startedAt: new Date(sessionStartTime).toISOString(),
        endedAt: new Date().toISOString(),
        durationMs: Date.now() - sessionStartTime,
        exercisesAttempted: sessionAttempts.map((a) => a.id),
      };

      await saveStudySession(sessionRecord);
    }
  }, [currentIndex, sessionQueue, allVocab, sessionStartTime, sessionAttempts, loadCard]);

  // Request a hint (docks mastery)
  const handleRequestHint = useCallback(() => {
    if (!currentExercise) return;
    if (hintsRevealed < currentExercise.hints.length) {
      setHintsRevealed((prev) => prev + 1);
    }
  }, [currentExercise, hintsRevealed]);

  // Retry after first error
  const handleRetry = useCallback(() => {
    setUserTypedInput('');
    setSelectedOption(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sessionActive || sessionFinished || !currentExercise) return;

      if (e.key === 'Enter') {
        if (attemptStage === 'resolved') {
          handleNextExercise();
        } else if (
          currentExercise.type === 'meaning_to_en' ||
          currentExercise.type === 'context_blank'
        ) {
          if (userTypedInput.trim()) {
            evaluateAnswer(userTypedInput);
          }
        }
      }

      // Hotkeys for multiple choice (1-4)
      if (
        (currentExercise.type === 'en_to_meaning' ||
          currentExercise.type === 'collocation' ||
          (currentExercise.type === 'context_blank' && currentExercise.options)) &&
        attemptStage !== 'resolved'
      ) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= (currentExercise.options?.length || 0)) {
          const opt = currentExercise.options![num - 1];
          setSelectedOption(opt);
          evaluateAnswer(opt);
        }
      }

      // Hotkey for hint ('h')
      if (e.key.toLowerCase() === 'h' && attemptStage !== 'resolved') {
        handleRequestHint();
      }

      // Hotkey for retry ('r')
      if (e.key.toLowerCase() === 'r' && attemptStage === 'first_error') {
        handleRetry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    sessionActive,
    sessionFinished,
    currentExercise,
    attemptStage,
    userTypedInput,
    handleNextExercise,
    evaluateAnswer,
    handleRequestHint,
    handleRetry,
  ]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Preparando entrenamiento...</div>;
  }

  // 1. SESSION SUMMARY SCREEN (Finished)
  if (sessionFinished) {
    const totalItems = sessionQueue.length;
    const firstAttemptCorrectCount = sessionAttempts.filter(
      (a) => a.attempts.length > 0 && a.attempts[0].isCorrect
    ).length;
    const eventualCorrectCount = sessionAttempts.filter((a) => a.finalCorrect).length;
    const firstAccuracy =
      totalItems > 0 ? Math.round((firstAttemptCorrectCount / totalItems) * 100) : 0;
    const eventualAccuracy =
      totalItems > 0 ? Math.round((eventualCorrectCount / totalItems) * 100) : 0;

    const failedVocabList = sessionQueue.filter((v) => failedVocabIds.has(v.item.id));

    return (
      <div className="mx-auto max-w-3xl space-y-6 py-4">
        <div className="panel-section space-y-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">¡Sesión completada!</h1>
            <p className="text-sm text-slate-500 mt-1">
              Tu progreso ha sido registrado y el algoritmo SRS ha recalculado los próximos repasos.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Términos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalItems}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Acierto 1er intento</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">{firstAccuracy}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Acierto eventual</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{eventualAccuracy}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">A reforzar</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{failedVocabIds.size}</p>
            </div>
          </div>

          {/* Words needing review */}
          {failedVocabList.length > 0 && (
            <div className="space-y-3 rounded-lg border border-accent-200 bg-accent-50/60 p-4 text-left">
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Palabras que registraron error o necesitaron pista:
              </p>
              <div className="flex flex-wrap gap-2">
                {failedVocabList.map((v) => (
                  <span
                    key={v.item.id}
                    className="rounded-full border border-accent-200 bg-white px-3 py-1 text-xs font-semibold text-accent-900"
                  >
                    {v.item.word} ({v.item.meaningEs})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                // Continue with 10 more items
                const nextItems = selectSessionItems(allVocab, {
                  itemCount: 10,
                  mode: 'smart_mix',
                });
                startSessionWithItems(nextItems, allVocab);
              }}
              className="btn-primary w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Continuar estudiando (+10 palabras)
            </button>

            <button
              onClick={() => navigate('/vocabulario')}
              className="btn-secondary w-full sm:w-auto"
            >
              Ver en Vocabulario
            </button>

            <button
              onClick={() => navigate('/')}
              className="btn-ghost w-full sm:w-auto"
            >
              Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE TRAINING SCREEN
  if (sessionActive && currentExercise) {
    const currentVocab = sessionQueue[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / sessionQueue.length) * 100);

    const getExerciseBadgeLabel = (type: VocabularyExerciseType) => {
      switch (type) {
        case 'meaning_to_en':
          return 'Recuerdo Activo — Escribe en inglés';
        case 'context_blank':
          return 'Contexto — Completa el hueco';
        case 'collocation':
          return 'Colocación Habitual';
        case 'en_to_meaning':
          return 'Significado en Español';
        case 'flashcard':
          return 'Tarjeta de Auto-evaluación';
        default:
          return 'Práctica de Vocabulario';
      }
    };

    return (
      <div className="mx-auto max-w-[760px] space-y-5 py-2">
        {/* Session Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Palabra {currentIndex + 1} de {sessionQueue.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {currentVocab.item.cefrLevel}
            </span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('¿Deseas salir del entrenamiento actual?')) {
                setSessionActive(false);
              }
            }}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            Salir
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Exercise Card */}
        <div className="panel space-y-6 p-5 sm:p-8">
          {/* Exercise Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-lg">
              {getExerciseBadgeLabel(currentExercise.type)}
            </span>

            {/* Hint Button */}
            {hintsRevealed < currentExercise.hints.length && attemptStage !== 'resolved' && (
              <button
                onClick={handleRequestHint}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-lg transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Pista ({currentExercise.hints.length - hintsRevealed} disponible
                {currentExercise.hints.length - hintsRevealed > 1 ? 's' : ''})
              </button>
            )}
          </div>

          {/* Hints Panel */}
          {hintsRevealed > 0 && (
            <div className="space-y-2 rounded-lg border border-accent-200 bg-accent-50/70 p-4 text-xs text-accent-900">
              <p className="font-bold flex items-center gap-1 text-amber-800 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Pistas activadas (penaliza ligeramente maestría):
              </p>
              {currentExercise.hints.slice(0, hintsRevealed).map((hint, idx) => (
                <p key={idx} className="rounded-md border border-accent-100 bg-white/80 p-2.5">
                  {hint}
                </p>
              ))}
            </div>
          )}

          {/* Exercise Prompt */}
          <div className="text-center space-y-2 py-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {currentExercise.prompt}
            </h2>

            {currentExercise.contextSentence && (
              <div className="my-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-base font-medium text-slate-800 sm:text-lg">
                {currentExercise.contextSentence}
              </div>
            )}
          </div>

          {/* Exercise Input Area according to type */}
          {/* TYPE B (Typing Recall) or TYPE C (Text Input) */}
          {(currentExercise.type === 'meaning_to_en' ||
            (currentExercise.type === 'context_blank' && !currentExercise.options)) && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Escribe la palabra en inglés..."
                  value={userTypedInput}
                  disabled={attemptStage === 'resolved'}
                  onChange={(e) => setUserTypedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userTypedInput.trim()) {
                      evaluateAnswer(userTypedInput);
                    }
                  }}
                  className={`w-full rounded-lg border px-5 py-4 text-center text-lg font-medium transition-all focus:outline-none ${
                    attemptStage === 'resolved'
                      ? attemptsHistory[attemptsHistory.length - 1]?.isCorrect
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                        : 'bg-rose-50 border-rose-400 text-rose-900'
                      : attemptStage === 'first_error'
                      ? 'border-amber-400 bg-amber-50/20'
                      : 'border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                  }`}
                />
              </div>

              {attemptStage !== 'resolved' && (
                <button
                  disabled={!userTypedInput.trim()}
                  onClick={() => evaluateAnswer(userTypedInput)}
                  className="btn-primary w-full py-3.5 disabled:opacity-50"
                >
                  Comprobar respuesta (Enter)
                </button>
              )}
            </div>
          )}

          {/* TYPE A, D or C with multiple choice options */}
          {currentExercise.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentExercise.options.map((opt, idx) => {
                let btnStyle =
                  'border-slate-200 hover:border-primary-400 hover:bg-slate-50 text-slate-800';

                if (attemptStage === 'resolved') {
                  if (opt === currentExercise.correctAnswer) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                  } else if (opt === selectedOption) {
                    btnStyle = 'border-rose-400 bg-rose-50 text-rose-800 line-through';
                  } else {
                    btnStyle = 'border-slate-100 text-slate-400 opacity-60';
                  }
                } else if (attemptStage === 'first_error' && opt === selectedOption) {
                  btnStyle = 'border-amber-400 bg-amber-50 text-amber-900';
                }

                return (
                  <button
                    key={idx}
                    disabled={attemptStage === 'resolved'}
                    onClick={() => {
                      setSelectedOption(opt);
                      evaluateAnswer(opt);
                    }}
                    className={`flex items-center justify-between rounded-lg border p-4 text-left text-sm font-medium transition-all sm:text-base ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {idx + 1}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {attemptStage === 'resolved' && opt === currentExercise.correctAnswer && (
                      <Check className="w-5 h-5 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* FLASHCARD MODE */}
          {currentExercise.type === 'flashcard' && (
            <div className="text-center space-y-6">
              {!flashcardFlipped ? (
                <button
                  onClick={() => setFlashcardFlipped(true)}
                  className="btn-primary px-8 py-3"
                >
                  Mostrar respuesta
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <p className="text-2xl font-bold text-primary-800">
                      {currentVocab.item.meaningEs}
                    </p>
                    <p className="text-sm text-slate-600">{currentVocab.item.meaning}</p>
                    {currentVocab.item.examples[0] && (
                      <p className="text-xs text-slate-500 italic mt-2">
                        "{currentVocab.item.examples[0]}"
                      </p>
                    )}
                  </div>

                  {attemptStage !== 'resolved' && (
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleFlashcardRating('did_not_know')}
                        className="py-3 px-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs sm:text-sm hover:bg-rose-100"
                      >
                        No la sabía
                      </button>
                      <button
                        onClick={() => handleFlashcardRating('unsure')}
                        className="py-3 px-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs sm:text-sm hover:bg-amber-100"
                      >
                        Dudoso
                      </button>
                      <button
                        onClick={() => handleFlashcardRating('knew_it')}
                        className="py-3 px-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs sm:text-sm hover:bg-emerald-100"
                      >
                        La sabía
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STRICT FEEDBACK DISPLAY */}
          {attemptStage === 'first_error' && (
            <div className="space-y-3 rounded-lg border border-accent-200 bg-accent-50 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-800 font-bold text-sm">
                <XCircle className="w-5 h-5 text-amber-600" />
                Respuesta incorrecta en el 1er intento
              </div>
              <p className="text-xs text-amber-700">
                La respuesta no se muestra automáticamente. Tienes un segundo intento para
                consolidar la memoria de trabajo.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
                >
                  Intentar otra vez (R)
                </button>
                {hintsRevealed < currentExercise.hints.length && (
                  <button
                    onClick={handleRequestHint}
                    className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-800 font-semibold text-xs hover:bg-amber-100"
                  >
                    Ver pista (H)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* RESOLVED STATE (Success or Max Attempts Reached) */}
          {attemptStage === 'resolved' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {attemptsHistory[attemptsHistory.length - 1]?.isCorrect ? (
                <div className="space-y-1 rounded-lg border border-primary-200 bg-primary-50 p-4 text-primary-900">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    {attemptsHistory.length === 1
                      ? '¡Excelente! Correcto al primer intento.'
                      : '¡Bien! Correcto al segundo intento (se conserva el registro de error).'}
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {currentExercise.explanation}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-accent-200 bg-accent-50 p-4 text-accent-900">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    Máximo de intentos alcanzado.
                  </div>
                  <p className="text-sm font-semibold">
                    Respuesta correcta: <span className="underline">{currentExercise.correctAnswer}</span>
                  </p>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {currentExercise.explanation}
                  </p>
                  <span className="inline-block text-xs font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                    El algoritmo programará este término para un repaso próximo más frecuente.
                  </span>
                </div>
              )}

              <button
                onClick={handleNextExercise}
                className="btn-primary w-full py-3.5"
              >
                <span>Siguiente palabra</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. SESSION SETUP SCREEN (Initial entry)
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Entrenamiento Adaptativo
        </h1>
        <p className="text-slate-600 text-sm">
          Sesiones inteligentes de recuerdo activo calibradas por tu historial y curva de olvido (SRS).
        </p>
      </div>

      <div className="panel-section space-y-6">
        {/* Session Size */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Duración de la sesión
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { count: 10, label: 'Rápido', time: '~4 min' },
              { count: 20, label: 'Estándar', time: '~8 min' },
              { count: 40, label: 'Intensivo', time: '~15 min' },
            ].map((size) => (
              <button
                key={size.count}
                type="button"
                onClick={() => setConfig({ ...config, itemCount: size.count })}
                className={`rounded-lg border p-3.5 text-center transition-all ${
                  config.itemCount === size.count
                    ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-lg font-bold text-slate-900">{size.count}</p>
                <p className="text-xs font-semibold text-slate-700">{size.label}</p>
                <p className="text-2xs text-slate-400 mt-0.5">{size.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Training Mode */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Modo de enfoque
          </label>
          <div className="space-y-2">
            {[
              {
                id: 'smart_mix',
                title: 'Repaso Inteligente (Recomendado)',
                desc: 'Mezcla equilibrada: 50% repasos pendientes por SRS, 25% débiles, 25% vocabulario nuevo.',
              },
              {
                id: 'due_only',
                title: 'Solo pendientes de hoy',
                desc: 'Únicamente términos cuya fecha de revisión según el algoritmo SRS ya ha vencido.',
              },
              {
                id: 'weak_only',
                title: 'Reforzar términos difíciles',
                desc: 'Palabras con fallos previos o bajo nivel de consolidación.',
              },
              {
                id: 'new_only',
                title: 'Descubrir nuevo vocabulario',
                desc: 'Términos de alta prioridad comunicativa aún no vistos.',
              },
            ].map((mode) => (
              <label
                key={mode.id}
                onClick={() => setConfig({ ...config, mode: mode.id as TrainingSessionMode })}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                  config.mode === mode.id
                    ? 'border-primary-600 bg-primary-50/40 ring-1 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="trainingMode"
                  checked={config.mode === mode.id}
                  onChange={() => {}}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{mode.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{mode.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Exercise Style */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Estilo de ejercicios
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mixed', label: 'Mixto (Óptimo)' },
              { id: 'meaning_to_en', label: 'Escribir en inglés' },
              { id: 'flashcard', label: 'Tarjetas directas' },
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setConfig({ ...config, preferredType: style.id as VocabularyExerciseType | 'mixed' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                  config.preferredType === style.id
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartSession}
          className="btn-primary w-full py-3.5 text-base"
        >
          <Play className="w-5 h-5 fill-white" />
          Comenzar entrenamiento
        </button>
      </div>
    </div>
  );
}
