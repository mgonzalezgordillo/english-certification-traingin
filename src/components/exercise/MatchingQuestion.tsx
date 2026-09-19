import React from 'react';
import type { QuestionItem } from '../../types/exercise';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface MatchingQuestionProps {
  question: QuestionItem;
  value: unknown;
  onChange: (val: unknown) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  showFeedback = false,
  isCorrect,
}) => {
  // If defined with options for a single target, use SingleChoiceQuestion
  if (question.options && question.options.length > 0 && !question.matchingPairs) {
    return (
      <SingleChoiceQuestion
        question={question}
        value={value as string}
        onChange={(val) => onChange(val)}
        disabled={disabled}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
      />
    );
  }

  // If question has matchingPairs: prompt -> target
  const pairs = question.matchingPairs || [];
  const userMap = (value as Record<string, string>) || {};
  const allTargets = Array.from(new Set(pairs.map((p) => p.target)));

  const handleSelect = (pairId: string, target: string) => {
    if (disabled) return;
    onChange({
      ...userMap,
      [pairId]: target,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Empareja cada elemento con su correspondiente opción:
      </p>

      {pairs.map((pair) => {
        const selected = userMap[pair.id] || '';
        const isPairCorrect = selected === pair.target;

        return (
          <div
            key={pair.id}
            className={`p-4 rounded-xl border transition-all ${
              showFeedback
                ? isPairCorrect
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-rose-300 bg-rose-50/50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <p className="text-sm font-medium text-slate-800 mb-3">{pair.prompt}</p>

            <div className="flex flex-wrap gap-2">
              {allTargets.map((target) => {
                const isSelected = selected === target;
                const isTargetCorrect = target === pair.target;

                let btnStyle = 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100';
                if (isSelected) {
                  btnStyle = 'border-primary-500 bg-primary-600 text-white font-medium shadow-xs';
                }

                if (showFeedback) {
                  if (isTargetCorrect) {
                    btnStyle = '!border-emerald-600 !bg-emerald-600 !text-white font-medium';
                  } else if (isSelected && !isTargetCorrect) {
                    btnStyle = '!border-rose-500 !bg-rose-500 !text-white';
                  } else {
                    btnStyle = 'opacity-40 border-slate-200 bg-slate-50 text-slate-400';
                  }
                }

                return (
                  <button
                    key={target}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect(pair.id, target)}
                    className={`px-3 py-1.5 rounded-lg text-xs md:text-sm border transition-all cursor-pointer disabled:cursor-not-allowed ${btnStyle}`}
                  >
                    {target}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs">
                {isPairCorrect ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correcto
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1 font-medium">
                    <XCircle className="w-3.5 h-3.5" /> Correcto: {pair.target}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
