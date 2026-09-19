import React from 'react';
import type { QuestionItem } from '../../types/exercise';
import { CheckCircle2, XCircle } from 'lucide-react';

interface SingleChoiceQuestionProps {
  question: QuestionItem;
  value: string | undefined;
  onChange: (val: string) => void;
  disabled?: boolean;
  showFeedback?: boolean; // Only true in training mode after evaluation or in exam review
  isCorrect?: boolean;
}

export const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  showFeedback = false,
}) => {
  const options = question.options || [];

  return (
    <div className="space-y-3">
      {options.map((option, idx) => {
        const isSelected = value === option;
        const isAnswerTarget = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.includes(option)
          : question.correctAnswer === option;

        let optionStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700';

        if (isSelected) {
          optionStyle = 'border-primary-500 bg-primary-50/50 text-primary-900 font-medium ring-1 ring-primary-500';
        }

        if (showFeedback) {
          if (isAnswerTarget) {
            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium ring-1 ring-emerald-500';
          } else if (isSelected && !isAnswerTarget) {
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
            onClick={() => onChange(option)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer disabled:cursor-not-allowed ${optionStyle}`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 transition-colors ${
                isSelected
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              } ${
                showFeedback && isAnswerTarget
                  ? '!bg-emerald-600 !text-white !border-emerald-600'
                  : ''
              } ${
                showFeedback && isSelected && !isAnswerTarget
                  ? '!bg-rose-500 !text-white !border-rose-500'
                  : ''
              }`}
            >
              {String.fromCharCode(65 + idx)}
            </span>

            <span className="flex-1 text-sm md:text-base leading-relaxed">{option}</span>

            {showFeedback && isAnswerTarget && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {showFeedback && isSelected && !isAnswerTarget && (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
