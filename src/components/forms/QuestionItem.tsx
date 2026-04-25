import React from 'react';
import type { QuestionInput } from '../../types/forms';

interface QuestionItemProps {
  question: QuestionInput;
  value: any;
  onChange: (value: any) => void;
  commentValue?: string;
  onCommentChange?: (val: string) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ question, value, onChange, commentValue, onCommentChange }) => {
  if (question.inputType === 'text' || question.inputType === 'date') {
    return (
      <div className="flex flex-col mb-4">
        <label className="text-sm font-medium text-gray-700 mb-1">{question.label}</label>
        <input
          type={question.inputType}
          className="border border-gray-300 bg-gray-100 rounded-md p-2 w-full text-sm outline-none"
          placeholder={question.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (question.inputType === 'radio_with_comments') {
    return (
      <div className="flex flex-col mb-6">
        <label className="text-sm font-medium text-gray-800 mb-2">{question.label}</label>
        <div className="flex space-x-4 mb-2">
          {question.options?.map((opt) => (
            <label key={opt.id} className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name={`question_${question.id}`}
                value={opt.optionValue}
                checked={value === opt.optionValue}
                onChange={(e) => onChange(e.target.value)}
                className="mr-2 text-teal-600 focus:ring-teal-500"
              />
              {opt.optionLabel}
            </label>
          ))}
        </div>
        <div className="mt-1">
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Comments</label>
          <input
            type="text"
            className="border border-gray-200 bg-gray-100 rounded-md p-2 w-full text-sm outline-none"
            placeholder="Enter comments ..."
            value={commentValue || ''}
            onChange={(e) => onCommentChange && onCommentChange(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-500 mb-4">Unsupported question type: {question.inputType}</div>
  );
};
