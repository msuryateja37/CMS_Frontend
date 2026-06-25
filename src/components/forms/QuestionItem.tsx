import React from 'react';
import type { QuestionInput } from '../../types/forms';

interface QuestionItemProps {
  question: QuestionInput;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  commentValue?: string;
  onCommentChange?: (val: string) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  value,
  onChange,
  commentValue,
  onCommentChange,
}) => {
  const baseInput =
    'border border-gray-300 bg-gray-50 rounded-md py-1.5 px-2.5 w-full text-[13px] outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition';

  // ── TEXT ──────────────────────────────────────────────────────────────────
  if (question.inputType === 'TEXT') {
    return (
      <div className="flex flex-col mb-3">
        <Label question={question} />
        <input
          type="text"
          className={baseInput}
          placeholder={question.placeholder ?? ''}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // ── NUMBER ────────────────────────────────────────────────────────────────
  if (question.inputType === 'NUMBER') {
    return (
      <div className="flex flex-col mb-3">
        <Label question={question} />
        <input
          type="number"
          className={baseInput}
          placeholder={question.placeholder ?? ''}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // ── DATE ──────────────────────────────────────────────────────────────────
  if (question.inputType === 'DATE') {
    return (
      <div className="flex flex-col mb-3">
        <Label question={question} />
        <input
          type="date"
          className={baseInput}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // ── TEXTAREA ──────────────────────────────────────────────────────────────
  if (question.inputType === 'TEXTAREA') {
    return (
      <div className="flex flex-col mb-3">
        <Label question={question} />
        <textarea
          rows={3}
          className={baseInput}
          placeholder={question.placeholder ?? ''}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // ── RADIO ─────────────────────────────────────────────────────────────────
  if (question.inputType === 'RADIO') {
    return (
      <div className="flex flex-col mb-4">
        <Label question={question} />
        <div className="flex flex-wrap gap-4 mt-1">
          {question.options?.map((opt) => (
            <label key={opt.id} className="flex items-center text-sm text-gray-600 cursor-pointer gap-2">
              <input
                type="radio"
                name={`question_${question.id}`}
                value={opt.optionValue}
                checked={value === opt.optionValue}
                onChange={(e) => onChange(e.target.value)}
                className="accent-gold-600"
              />
              {opt.optionLabel}
            </label>
          ))}
        </div>
        {/* Optional comment slot */}
        {onCommentChange && (
          <div className="mt-2">
            <span className="text-xs font-semibold text-gray-500 mb-1 block">Comments</span>
            <input
              type="text"
              className={baseInput}
              placeholder="Enter comments…"
              value={commentValue || ''}
              onChange={(e) => onCommentChange(e.target.value)}
            />
          </div>
        )}
      </div>
    );
  }

  // ── CHECKBOX ──────────────────────────────────────────────────────────────
  if (question.inputType === 'CHECKBOX') {
    const selected: string[] = Array.isArray(value) ? value : [];
    const toggle = (val: string) => {
      const next = selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
      onChange(next);
    };
    return (
      <div className="flex flex-col mb-4">
        <Label question={question} />
        <div className="flex flex-col gap-2 mt-1">
          {question.options?.map((opt) => (
            <label key={opt.id} className="flex items-center text-sm text-gray-600 cursor-pointer gap-2">
              <input
                type="checkbox"
                value={opt.optionValue}
                checked={selected.includes(opt.optionValue)}
                onChange={() => toggle(opt.optionValue)}
                className="accent-gold-600 w-4 h-4"
              />
              {opt.optionLabel}
            </label>
          ))}
        </div>
      </div>
    );
  }

  // ── SELECT ────────────────────────────────────────────────────────────────
  if (question.inputType === 'SELECT') {
    return (
      <div className="flex flex-col mb-3">
        <Label question={question} />
        <select
          className={baseInput}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— select —</option>
          {question.options?.map((opt) => (
            <option key={opt.id} value={opt.optionValue}>
              {opt.optionLabel}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // ── Legacy: radio_with_comments (old seeded data) ─────────────────────────
  if ((question.inputType as string) === 'radio_with_comments') {
    return (
      <div className="flex flex-col mb-4">
        <Label question={question} />
        <div className="flex flex-wrap gap-4 mt-1">
          {question.options?.map((opt) => (
            <label key={opt.id} className="flex items-center text-sm text-gray-600 cursor-pointer gap-2">
              <input
                type="radio"
                name={`question_${question.id}`}
                value={opt.optionValue}
                checked={value === opt.optionValue}
                onChange={(e) => onChange(e.target.value)}
                className="accent-gold-600"
              />
              {opt.optionLabel}
            </label>
          ))}
        </div>
        <div className="mt-2">
          <span className="text-xs font-semibold text-gray-500 mb-1 block">Comments</span>
          <input
            type="text"
            className={baseInput}
            placeholder="Enter comments…"
            value={commentValue || ''}
            onChange={(e) => onCommentChange && onCommentChange(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-400 italic mb-4">
      Unsupported question type: {question.inputType}
    </div>
  );
};

// ─── Label helper ─────────────────────────────────────────────────────────────

const Label: React.FC<{ question: QuestionInput }> = ({ question }) => (
  <label className="text-sm font-medium text-gray-700 mb-1">
    {question.label}
    {question.isRequired && <span className="text-red-500 ml-1">*</span>}
  </label>
);
