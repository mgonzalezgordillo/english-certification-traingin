import React from 'react';
import type { QuestionItem } from '../../types/exercise';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { TextInputQuestion } from './TextInputQuestion';
import { FillGapQuestion } from './FillGapQuestion';
import { MatchingQuestion } from './MatchingQuestion';
import { OrderedItemsQuestion } from './OrderedItemsQuestion';
import { SentenceCompletionQuestion } from './SentenceCompletionQuestion';

interface QuestionRendererProps {
  question: QuestionItem;
  userAnswer: unknown;
  onChange: (val: unknown) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  userAnswer,
  onChange,
  onSubmit,
  disabled = false,
  showFeedback = false,
  isCorrect,
}) => {
  switch (question.mode) {
    case 'single_choice':
      return (
        <SingleChoiceQuestion
          question={question}
          value={userAnswer as string}
          onChange={onChange}
          disabled={disabled}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
        />
      );

    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          value={userAnswer as string[]}
          onChange={onChange}
          disabled={disabled}
          showFeedback={showFeedback}
        />
      );

    case 'text_input':
      return (
        <TextInputQuestion
          question={question}
          value={userAnswer as string}
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={disabled}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
        />
      );

    case 'fill_gap':
      return (
        <FillGapQuestion
          question={question}
          value={userAnswer as string}
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={disabled}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
        />
      );

    case 'matching':
      return (
        <MatchingQuestion
          question={question}
          value={userAnswer}
          onChange={onChange}
          disabled={disabled}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
        />
      );

    case 'ordered_items':
      return (
        <OrderedItemsQuestion
          question={question}
          value={userAnswer as string[]}
          onChange={onChange}
          disabled={disabled}
          showFeedback={showFeedback}
        />
      );

    case 'sentence_completion':
      return (
        <SentenceCompletionQuestion
          question={question}
          value={userAnswer as string}
          onChange={onChange}
          disabled={disabled}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
        />
      );

    default:
      return (
        <p className="text-rose-600 text-sm">
          Tipo de pregunta no soportado: {(question as { mode: string }).mode}
        </p>
      );
  }
};
