import React, { useState, useEffect } from 'react';
import { QuestionItem } from '../../components/forms/QuestionItem';
import type { FormTemplate } from '../../types/forms';
import { getDisabilityForm, submitFormResponse } from '../../services/formsService';
import { useAuthStore } from '../../store/auth.store';
import DashboardLayout from '../../layouts/DashboardLayout';

export const OHSDisabilityForm: React.FC = () => {
  const { user } = useAuthStore();
  const [form, setForm] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      setError(null);
      try {
        const fullForm = await getDisabilityForm();
        setForm(fullForm);
      } catch (err: any) {
        setError('Failed to load the form. Please try again later.');
        console.error('Form fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, []);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCommentChange = (questionId: string, val: string) => {
    setComments(prev => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = async () => {
    if (!form) return;
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([questionId, answerText]) => ({
        questionId,
        answerText: String(answerText),
      }));
      await submitFormResponse(form.id, user?.id ?? 'anonymous', answersPayload);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit the form. Please try again.');
      console.error('Form submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const officeName = user?.department?.building?.name ?? user?.department?.name ?? 'N/A';
  const provinceName = user?.department?.building?.province?.name ?? user?.province?.name ?? 'N/A';

  return (
    <DashboardLayout
      title="OHS Inspector – Disability Assessment Checklist"
      description="Check accessibility compliance for people with disabilities."
      breadcrumbs={[
        { label: 'OHS Forms', path: '/ohs/forms/disability' },
        { label: 'Disability Assessment Checklist' }
      ]}
    >
      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
          <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading form from database...</span>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="flex items-center justify-center py-16">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 max-w-md text-center">
            <p className="font-semibold mb-1">Could not load form</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {!loading && submitted && (
        <div className="flex items-center justify-center py-16">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-8 max-w-md text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-bold mb-1">Assessment Submitted!</p>
            <p className="text-sm">Your OHS assessment has been recorded successfully.</p>
          </div>
        </div>
      )}

      {/* ── Form ── */}
      {!loading && !error && !submitted && form && (
        <div className="flex flex-col gap-4">

          {/* Inspection badge row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-base text-gray-800">INP-2025-022</span>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-200 font-medium">
                  in progress
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{officeName} • {provinceName}</div>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 pt-6 w-full">
            <h2 className="text-base font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
              {form.title}
            </h2>

            {form.sections.map((section, index) => (
              <div key={section.id} className="mb-10 last:mb-0">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {index + 1}
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">{section.title}</h3>
                </div>

                {/* Questions grid */}
                <div
                  className={`grid gap-5 ${section.questions.some(q => q.inputType === 'radio_with_comments')
                      ? 'grid-cols-1'
                      : 'grid-cols-2'
                    }`}
                >
                  {section.questions.map(q => (
                    <QuestionItem
                      key={q.id}
                      question={q}
                      value={answers[q.id]}
                      onChange={val => handleAnswerChange(q.id, val)}
                      commentValue={comments[q.id]}
                      onCommentChange={val => handleCommentChange(q.id, val)}
                    />
                  ))}
                </div>

                {index < form.sections.length - 1 && (
                  <hr className="mt-8 border-gray-100" />
                )}
              </div>
            ))}

            {/* Submit row */}
            <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                {submitting && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {submitting ? 'Submitting...' : 'Next Step'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OHSDisabilityForm;
