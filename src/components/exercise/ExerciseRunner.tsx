import React, { useState, useEffect, useRef } from 'react';
import type {
  GenericExercise,
  QuestionAttempt,
  ExerciseSessionResult,
} from '../../types/exercise';
import { QuestionRenderer } from './QuestionRenderer';
import { ExerciseSummary } from './ExerciseSummary';
import {
  processQuestionAttempt,
  calculateExerciseSessionResult,
} from '../../lib/learning/exerciseEngine';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Send,
  Eye,
} from 'lucide-react';

interface ExerciseRunnerProps {
  exercise: GenericExercise;
  mode?: 'training' | 'exam';
  onComplete: (result: ExerciseSessionResult) => void;
  onReturnToHub: () => void;
  onNext?: () => void;
}

export const ExerciseRunner: React.FC<ExerciseRunnerProps> = ({
  exercise,
  mode = 'training',
  onComplete,
  onReturnToHub,
  onNext,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, unknown>>({});
  const [attempts, setAttempts] = useState<Record<string, QuestionAttempt>>({});
  const [attemptStages, setAttemptStages] = useState<
    Record<string, 'initial' | 'first_error' | 'resolved'>
  >({});
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  // Timers
  const [sessionStartTime] = useState<number>(() => Date.now());
  const questionStartTimeRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Completion state
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<ExerciseSessionResult | null>(null);

  const currentQuestion = exercise.questions[currentIndex];
  const totalQuestions = exercise.questions.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Global session timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentAnswer = userAnswers[currentQuestion.id];
  const currentStage = attemptStages[currentQuestion.id] || 'initial';
  const currentAttempt = attempts[currentQuestion.id];
  const currentHintsCount = hintsRevealed[currentQuestion.id] || 0;
  const isQuestionResolved = currentStage === 'resolved';

  const hasAnswer =
    currentAnswer !== undefined &&
    currentAnswer !== null &&
    (typeof currentAnswer === 'string'
      ? currentAnswer.trim().length > 0
      : Array.isArray(currentAnswer)
      ? currentAnswer.length > 0
      : Object.keys(currentAnswer as object).length > 0);

  // ==========================================
  // TRAINING MODE: Immediate evaluation & retry
  // ==========================================
  const handleCheckTrainingAnswer = () => {
    if (!hasAnswer || isQuestionResolved) return;

    const now = Date.now();
    const timeSpent = questionStartTimeRef.current
      ? Math.max(1000, now - questionStartTimeRef.current)
      : 5000;
    const updatedAttempt = processQuestionAttempt({
      question: currentQuestion,
      userAnswer: currentAnswer as string | string[],
      timeSpentMs: timeSpent,
      hintsUsed: currentHintsCount,
      previousAttempt: currentAttempt,
    });

    const isCorrect = updatedAttempt.isCorrect;

    setAttempts((prev) => ({
      ...prev,
      [currentQuestion.id]: updatedAttempt,
    }));

    if (isCorrect) {
      // Correct answer!
      setAttemptStages((prev) => ({ ...prev, [currentQuestion.id]: 'resolved' }));
    } else {
      // Incorrect answer
      if (currentStage === 'initial') {
        // First failure: give 1 more chance
        setAttemptStages((prev) => ({ ...prev, [currentQuestion.id]: 'first_error' }));
      } else {
        // Second failure: resolve and reveal correct answer
        setAttemptStages((prev) => ({ ...prev, [currentQuestion.id]: 'resolved' }));
      }
    }
  };

  // Explicit Hint Request
  const handleRequestHint = () => {
    const availableHints = currentQuestion.hints || [];
    if (currentHintsCount < availableHints.length) {
      const nextCount = currentHintsCount + 1;
      setHintsRevealed((prev) => ({
        ...prev,
        [currentQuestion.id]: nextCount,
      }));
    }
  };

  // ==========================================
  // EXAM MODE / FINALIZE
  // ==========================================
  const handleFinalizeExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const completedAttempts: Record<string, QuestionAttempt> = {};
    const avgTimePerQuestion = Math.round((Date.now() - sessionStartTime) / totalQuestions);

    for (const q of exercise.questions) {
      const answer = userAnswers[q.id];
      const attempt = attempts[q.id];

      if (attempt) {
        completedAttempts[q.id] = attempt;
      } else {
        // Process un-evaluated answer
        completedAttempts[q.id] = processQuestionAttempt({
          question: q,
          userAnswer: (answer || '') as string | string[],
          timeSpentMs: avgTimePerQuestion,
          hintsUsed: 0,
        });
      }
    }

    const sessionResult = calculateExerciseSessionResult({
      exercise,
      questionAttempts: completedAttempts,
      mode,
      startedAt: new Date(sessionStartTime).toISOString(),
      completedAt: new Date().toISOString(),
    });

    setFinalResult(sessionResult);
    setIsFinished(true);
    onComplete(sessionResult);
  };

  const handleNextQuestion = () => {
    questionStartTimeRef.current = Date.now();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      handleFinalizeExam();
    }
  };

  const handlePreviousQuestion = () => {
    questionStartTimeRef.current = Date.now();
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  };

  // If finished, show summary view
  if (isFinished && finalResult) {
    return (
      <ExerciseSummary
        result={finalResult}
        exercise={exercise}
        onRetry={() => {
          setIsFinished(false);
          setFinalResult(null);
          setCurrentIndex(0);
          setUserAnswers({});
          setAttempts({});
          setAttemptStages({});
          setHintsRevealed({});
          setShowExplanation({});
        }}
        onNext={onNext}
        onReturnToHub={onReturnToHub}
      />
    );
  }

  const availableHints = currentQuestion.hints || [];
  const hasUnrevealedHints = currentHintsCount < availableHints.length;

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      {/* Exercise Runner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary-100 text-primary-800">
            {exercise.cefrLevel}
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-wider text-slate-500 2xl:inline">
            Dificultad: {exercise.difficulty}/10
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              mode === 'exam' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {mode === 'exam' ? 'Modo Examen' : 'Entrenamiento'}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-mono font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeFormatted}</span>
          </div>

          <button
            type="button"
            onClick={onReturnToHub}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Question Navigation Track */}
      <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {exercise.questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered =
              userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
            const isResolved = attemptStages[q.id] === 'resolved';
            const wasCorrect = attempts[q.id]?.isCorrect;

            let badgeClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
            if (isCurrent) {
              badgeClass = 'bg-primary-600 text-white font-bold ring-2 ring-primary-300';
            } else if (mode === 'training' && isResolved) {
              badgeClass = wasCorrect
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300';
            } else if (isAnswered) {
              badgeClass = 'bg-slate-800 text-white';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer shrink-0 ${badgeClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-400 font-medium shrink-0">
          Pregunta {currentIndex + 1} de {totalQuestions}
        </span>
      </div>

      {/* Active Question Content Area */}
      <div className="p-5 md:p-8 flex-1 overflow-y-auto space-y-6">
        <div>
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1 block">
            Pregunta {currentIndex + 1}
          </span>
          <h3 className="text-base md:text-lg font-semibold text-slate-900 leading-snug">
            {currentQuestion.prompt}
          </h3>
        </div>

        {/* Interactive Answer Input Component */}
        <div className="pt-2">
          <QuestionRenderer
            question={currentQuestion}
            userAnswer={currentAnswer}
            onChange={(val) => {
              setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
            }}
            onSubmit={() => {
              if (mode === 'training') {
                handleCheckTrainingAnswer();
              } else {
                handleNextQuestion();
              }
            }}
            disabled={mode === 'training' && isQuestionResolved}
            showFeedback={mode === 'training' && isQuestionResolved}
            isCorrect={currentAttempt?.isCorrect}
          />
        </div>

        {/* Training Feedback & Alerts */}
        {mode === 'training' && (
          <div className="space-y-4 pt-2">
            {/* First Error Warning */}
            {currentStage === 'first_error' && (
              <div className="flex items-start gap-3 rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm text-accent-900">
                <XCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Respuesta incorrecta</p>
                  <p className="text-xs md:text-sm mt-0.5 text-amber-800">
                    Revisa atentamente el texto. Puedes solicitar una pista si lo necesitas antes de tu segundo intento.
                  </p>
                </div>
              </div>
            )}

            {/* Resolved Success Feedback */}
            {isQuestionResolved && currentAttempt?.isCorrect && (
              <div className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm text-primary-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    ¡Correcto! {currentAttempt.firstAttemptCorrect ? 'En el primer intento' : 'En el segundo intento'}
                  </p>
                  {currentQuestion.explanation && (
                    <p className="text-xs md:text-sm mt-1 text-emerald-800 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Resolved Failure Feedback */}
            {isQuestionResolved && !currentAttempt?.isCorrect && (
              <div className="space-y-2 rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm text-accent-950">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Has agotado los 2 intentos disponibles</p>
                    <p className="text-xs md:text-sm text-rose-800">
                      Respuesta correcta:{' '}
                      <strong>
                        {Array.isArray(currentQuestion.correctAnswer)
                          ? currentQuestion.correctAnswer.join(', ')
                          : currentQuestion.correctAnswer}
                      </strong>
                    </p>
                  </div>
                </div>

                {currentQuestion.explanation && (
                  <div className="pt-2 border-t border-rose-200/60">
                    <button
                      type="button"
                      onClick={() =>
                        setShowExplanation((prev) => ({
                          ...prev,
                          [currentQuestion.id]: !prev[currentQuestion.id],
                        }))
                      }
                      className="text-xs font-semibold text-rose-800 hover:text-rose-950 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>
                        {showExplanation[currentQuestion.id]
                          ? 'Ocultar explicación'
                          : 'Ver explicación detallada'}
                      </span>
                    </button>

                    {showExplanation[currentQuestion.id] && (
                      <p className="mt-2 text-xs md:text-sm text-rose-900 leading-relaxed bg-white/70 p-3 rounded-lg border border-rose-100">
                        {currentQuestion.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Revealed Progressive Hints */}
            {currentHintsCount > 0 && (
              <div className="space-y-2 rounded-lg border border-primary-200 bg-primary-50 p-4 text-xs text-primary-950 md:text-sm">
                <p className="font-semibold text-sky-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>Pista ({currentHintsCount}/{availableHints.length}):</span>
                </p>
                <ul className="space-y-1 pl-5 list-disc text-sky-900">
                  {availableHints.slice(0, currentHintsCount).map((hint, hIdx) => (
                    <li key={hIdx}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exercise Runner Bottom Control Bar */}
      <div className="p-4 md:px-8 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
        {/* Left Action: Navigation / Hint */}
        <div className="flex items-center gap-2">
          {mode === 'exam' && (
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePreviousQuestion}
              className="btn-secondary min-h-9 px-3.5 text-xs md:text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          )}

          {mode === 'training' && !isQuestionResolved && availableHints.length > 0 && (
            <button
              type="button"
              disabled={!hasUnrevealedHints}
              onClick={handleRequestHint}
              className="btn-secondary min-h-9 border-primary-200 bg-primary-50 px-3 text-xs text-primary-800 md:text-sm"
            >
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>
                Pista {currentHintsCount > 0 ? `(${currentHintsCount}/${availableHints.length})` : ''}
              </span>
            </button>
          )}
        </div>

        {/* Right Action: Check Answer / Next / Finalize */}
        <div className="flex items-center gap-2">
          {mode === 'training' && !isQuestionResolved ? (
            <button
              type="button"
              disabled={!hasAnswer}
              onClick={handleCheckTrainingAnswer}
              className="btn-primary px-5 text-xs md:text-sm"
            >
              <span>{currentStage === 'first_error' ? 'Reintentar' : 'Comprobar'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="btn-primary px-5 text-xs md:text-sm"
            >
              <span>
                {currentIndex < totalQuestions - 1
                  ? 'Siguiente'
                  : mode === 'exam'
                  ? 'Finalizar Examen'
                  : 'Ver Resultados'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
