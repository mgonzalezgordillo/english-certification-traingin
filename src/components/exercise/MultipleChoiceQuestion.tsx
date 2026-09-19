import React from 'react';
import type { QuestionItem } from '../../types/exercise';
import { Check, CheckCircle2, XCircle } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  question: QuestionItem;
  value: string[] | undefined;
  onChange: (val: string[]) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  value = [],
  onChange,
  disabled = false,
  showFeedback = false,
}) => {
  const options = question.options || [];
  const correctTargets = Array.isArray(question.correctAnswer)
    ? question.correctAnswer
    : [question.correctAnswer];

  const toggleOption = (option: string) => {
    if (disabled) return;
    if (value.includes(option)) {
      onChange(value.filter((o) => o !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Selecciona todas las opciones aplicables
      </p>

      {options.map((option, idx) => {
        const isChecked = value.includes(option);
        const isAnswerTarget = correctTargets.includes(option);

        let optionStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700';

        if (isChecked) {
          optionStyle = 'border-primary-500 bg-primary-50/50 text-primary-900 font-medium ring-1 ring-primary-500';
        }

        if (showFeedback) {
          if (isAnswerTarget) {
            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium ring-1 ring-emerald-500';
          } else if (isChecked && !isAnswerTarget) {
            optionStyle = 'border-rose-400 bg-rose-50 text-rose-900 ring-1 ring-rose-400';
          } else {
            optionStyle = 'border-slate-200 opacity-60 text-slate-500';
          }
        }

        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => toggleOption(option)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer disabled:cursor-not-allowed ${optionStyle}`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                isChecked
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-slate-300 text-transparent'
              } ${
                showFeedback && isAnswerTarget
                  ? '!bg-emerald-600 !border-emerald-600 !text-white'
                  : ''
              } ${
                showFeedback && isChecked && !isAnswerTarget
                  ? '!bg-rose-500 !border-rose-500 !text-white'
                  : ''
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>

            <span className="flex-1 text-sm md:text-base leading-relaxed">{option}</span>

            {showFeedback && isAnswerTarget && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {showFeedback && isChecked && !isAnswerTarget && (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
