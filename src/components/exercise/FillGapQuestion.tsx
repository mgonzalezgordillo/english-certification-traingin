import React from 'react';
import type { QuestionItem } from '../../types/exercise';
import { TextInputQuestion } from './TextInputQuestion';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';

interface FillGapQuestionProps {
  question: QuestionItem;
  value: string | undefined;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

export const FillGapQuestion: React.FC<FillGapQuestionProps> = (props) => {
  // If the fill_gap question provides multiple choice options (Multiple Choice Cloze)
  if (props.question.options && props.question.options.length > 0) {
    return <SingleChoiceQuestion {...props} />;
  }

  // Otherwise, it's an Open Cloze requiring typed text
  return <TextInputQuestion {...props} />;
};
