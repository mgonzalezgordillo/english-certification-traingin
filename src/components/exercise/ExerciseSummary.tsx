import React from 'react';
import type { ExerciseSessionResult, GenericExercise } from '../../types/exercise';
import {
  Trophy,
  Clock,
  Target,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface ExerciseSummaryProps {
  result: ExerciseSessionResult;
  exercise: GenericExercise;
  onRetry: () => void;
  onNext?: () => void;
  onReturnToHub: () => void;
}

export const ExerciseSummary: React.FC<ExerciseSummaryProps> = ({
  result,
  exercise,
  onRetry,
  onNext,
  onReturnToHub,
}) => {
  const minutes = Math.floor(result.totalTimeMs / 60000);
  const seconds = Math.floor((result.totalTimeMs % 60000) / 1000);
  const timeFormatted = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

  // Color-coded grade for first attempt accuracy
  let performanceColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let performanceBadge = 'Excelente dominio';
  if (result.firstAttemptAccuracy < 50) {
    performanceColor = 'text-rose-600 bg-rose-50 border-rose-200';
    performanceBadge = 'Necesita refuerzo';
  } else if (result.firstAttemptAccuracy < 75) {
    performanceColor = 'text-amber-600 bg-amber-50 border-amber-200';
    performanceBadge = 'Buen progreso';
  }

  return (
    <div className="panel mx-auto max-w-2xl p-6 md:p-8">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="mb-3 inline-flex rounded-xl bg-primary-50 p-3 text-primary-600">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">¡Actividad completada!</h2>
        <p className="text-sm text-slate-500">{exercise.title}</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
            {exercise.cefrLevel}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
            Dificultad {exercise.difficulty}/10
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs capitalize">
            Modo {result.mode === 'exam' ? 'Examen' : 'Entrenamiento'}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{result.firstAttemptAccuracy}%</p>
          <p className="text-xs text-slate-500 mt-0.5">1º Intento</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{result.finalAccuracy}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Precisión Final</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{timeFormatted}</p>
          <p className="text-xs text-slate-500 mt-0.5">Tiempo Total</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="flex items-center justify-center text-slate-400 mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {result.firstAttemptScore}/{result.totalQuestions}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Aciertos 1º</p>
        </div>
      </div>

      {/* Evaluation Assessment Badge */}
      <div className={`p-4 rounded-xl border mb-6 flex items-center justify-between ${performanceColor}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider">Evaluación de Desempeño</p>
          <p className="text-base font-bold mt-0.5">{performanceBadge}</p>
        </div>
        <span className="text-sm font-semibold">
          {result.firstAttemptScore === result.totalQuestions
            ? '100% Sin Fallos'
            : `${result.totalQuestions - result.firstAttemptScore} fallo(s) registrado(s)`}
        </span>
      </div>

      {/* Inferred Weakness Diagnosis */}
      {result.inferredErrors.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Diagnóstico de errores detectados:</span>
          </div>
          <ul className="space-y-1.5 text-xs md:text-sm text-amber-900">
            {result.inferredErrors.map((err, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-semibold shrink-0">•</span>
                <span>
                  <strong className="capitalize">{err.category.replace(/_/g, ' ')}:</strong>{' '}
                  {err.detectedTrigger || 'Dificultad en la comprensión'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Global Explanation / Rationale */}
      {exercise.explanation && (
        <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
          <p className="font-semibold text-slate-800 mb-1">Explicación general:</p>
          <p className="leading-relaxed text-slate-600">{exercise.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onReturnToHub}
          className="btn-secondary w-full sm:w-auto"
        >
          Volver a la Librería
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRetry}
            className="btn-secondary flex-1 sm:flex-initial"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir</span>
          </button>

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="btn-primary flex-1 sm:flex-initial"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
