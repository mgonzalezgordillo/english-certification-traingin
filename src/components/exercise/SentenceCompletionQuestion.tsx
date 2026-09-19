import React from 'react';
import type { QuestionItem } from '../../types/exercise';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';

interface SentenceCompletionQuestionProps {
  question: QuestionItem;
  value: string | undefined;
  onChange: (val: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

export const SentenceCompletionQuestion: React.FC<SentenceCompletionQuestionProps> = (props) => {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Elige la opción que completa la oración de forma lógica y correcta:
      </p>
      <SingleChoiceQuestion {...props} />
    </div>
  );
};
