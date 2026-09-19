import React, { useRef, useEffect } from 'react';
import type { QuestionItem } from '../../types/exercise';

interface TextInputQuestionProps {
  question: QuestionItem;
  value: string | undefined;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

export const TextInputQuestion: React.FC<TextInputQuestionProps> = ({
  question,
  value = '',
  onChange,
  onSubmit,
  disabled = false,
  showFeedback = false,
  isCorrect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled && onSubmit && value.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  const expectedAnswer = Array.isArray(question.correctAnswer)
    ? question.correctAnswer.join(' / ')
    : question.correctAnswer;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Tu respuesta en inglés:
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe aquí tu respuesta..."
            autoComplete="off"
            spellCheck={false}
            className={`w-full px-4 py-3.5 rounded-xl border text-base font-medium transition-all outline-none ${
              showFeedback
                ? isCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                  : 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400/20'
                : 'border-slate-300 bg-white text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            } disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed`}
          />
        </div>
      </div>

      {showFeedback && !isCorrect && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 flex items-start gap-2">
          <span className="font-semibold shrink-0">Respuesta correcta:</span>
          <span className="font-mono font-medium text-rose-950">{expectedAnswer}</span>
        </div>
      )}
    </div>
  );
};
