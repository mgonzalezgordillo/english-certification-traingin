import React, { useEffect, useMemo } from 'react';
import type { QuestionItem } from '../../types/exercise';
import { ArrowUp, ArrowDown, CheckCircle2, XCircle } from 'lucide-react';

interface OrderedItemsQuestionProps {
  question: QuestionItem;
  value: string[] | undefined;
  onChange: (val: string[]) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export const OrderedItemsQuestion: React.FC<OrderedItemsQuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  showFeedback = false,
}) => {
  const defaultItems = useMemo(() => question.options || [], [question.options]);

  // Initialize with shuffled or default if not set
  useEffect(() => {
    if (!value || value.length === 0) {
      // Shuffle default items once initially so they don't start already in correct order
      const shuffled = [...defaultItems].sort(() => Math.random() - 0.5);
      onChange(shuffled);
    }
  }, [defaultItems, value, onChange]);

  const items = value && value.length > 0 ? value : defaultItems;
  const correctOrder = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (disabled) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Usa las flechas para ordenar los elementos en la secuencia correcta (1º a último):
      </p>

      {items.map((item, index) => {
        const isCorrectPosition = correctOrder[index] === item;

        let cardStyle = 'border-slate-200 bg-white hover:border-slate-300';
        if (showFeedback) {
          cardStyle = isCorrectPosition
            ? 'border-emerald-400 bg-emerald-50/50'
            : 'border-rose-300 bg-rose-50/50';
        }

        return (
          <div
            key={item}
            className={`p-3.5 md:p-4 rounded-xl border transition-all flex items-start gap-3 ${cardStyle}`}
          >
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                showFeedback
                  ? isCorrectPosition
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-500 text-white'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {index + 1}
            </span>

            <span className="flex-1 text-sm md:text-base text-slate-800 leading-relaxed">
              {item}
            </span>

            {!disabled && !showFeedback && (
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, 'up')}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Mover hacia arriba"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 'down')}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Mover hacia abajo"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {showFeedback && (
              <div className="shrink-0 mt-1">
                {isCorrectPosition ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
