import React, { useState, useEffect } from 'react';
import { QuestionItem } from '../../components/forms/QuestionItem';
import type { FormTemplate } from '../../types/forms';
import { getFormByTitleKeyword, submitFormResponse } from '../../services/formsService';
import { useAuthStore } from '../../store/auth.store';
import DashboardLayout from '../../layouts/DashboardLayout';

const OHSHazardForm: React.FC = () => {
  const { user } = useAuthStore();
  const [form, setForm] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      setError(null);
      try {
        const fullForm = await getFormByTitleKeyword('hazard identification risk assessment');
        setForm(fullForm);
      } catch (err: unknown) {
        setError('Failed to load the form. Please try again later.');
        console.error('Form fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, []);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCommentChange = (questionId: string, val: string) => {
    setComments(prev => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = async () => {
    if (!form) return;

    // 1. Basic Validation
    if (Object.keys(answers).length === 0) {
      alert('The form is empty. Please answer the questions before submitting.');
      return;
    }

    const missingFields: string[] = [];
    form.sections.forEach(section => {
      section.questions.forEach(q => {
        if (q.isRequired && !answers[q.id]) {
          missingFields.push(q.label);
        }
      });
    });

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: \n- ${missingFields.join('\n- ')}`);
      return;
    }

    setSubmitting(true);
    try {
      // 2. Build structured payload
      const answersPayload = Object.entries(answers).map(([questionId, value]) => {
        const question = form.sections
          .flatMap(s => s.questions)
          .find(q => q.id === questionId);

        const isChoiceType = ['RADIO', 'SELECT', 'CHECKBOX'].includes(question?.inputType || '');

        if (isChoiceType) {
          const option = question?.options.find(o => o.optionValue === value);
          return {
            questionId,
            selectedOptionId: option?.id,
            answerText: comments[questionId] || String(value),
          };
        }

        return {
          questionId,
          answerText: String(value),
        };
      });

      await submitFormResponse(form.formId || form.id, {
        submittedBy: user?.id,
        answers: answersPayload
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Check your connection and try again.';
      alert(`Failed to submit the form: ${msg}`);
      console.error('Form submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setComments({});
    setSubmitted(false);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const officeName = user?.department?.building?.name ?? user?.department?.name ?? 'N/A';
  const provinceName = user?.department?.building?.province?.name ?? user?.province?.name ?? 'N/A';

  return (
    <DashboardLayout
      title="OHS Inspector – OHS Hazard Identification Risk Assessment"
      description="Conduct Risk Assessments."
      breadcrumbs={[
        { label: 'OHS Forms', path: '/ohs/forms/hazard' },
        { label: 'Hazard Identification Risk Assessment' }
      ]}
    >
      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
          <svg className="animate-spin h-8 w-8 text-gold-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="bg-gold-50 border border-gold-200 text-gold-700 rounded-lg p-8 max-w-md text-center shadow-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-bold mb-1">Risk Assessment Submitted!</p>
            <p className="text-sm text-gold-600">Your hazard identification risk assessment has been saved successfully.</p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gold-500 text-gold-600 rounded-xl font-bold hover:bg-gold-50 transition-all shadow-md active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Conduct Another Assessment
          </button>
        </div>
      )}

      {/* ── Form ── */}
      {!loading && !error && !submitted && form && (
        <div className="flex flex-col gap-4">

          {/* Badge row */}
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
                <span className="font-semibold text-base text-gray-800">HIRA-2026-001</span>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-200 font-medium">
                  in progress
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{officeName} • {provinceName}</div>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 pt-5 w-full">
            <h2 className="text-base font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3">
              {form.title} Form
            </h2>

            {form.sections.map((section, index) => (
              <div key={section.id} className="mb-6 last:mb-0">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-7 h-7 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {index + 1}
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">{section.title}</h3>
                </div>

                {/* Questions grid */}
                <div className="grid grid-cols-1 gap-4">
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
                className="bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                {submitting && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {submitting ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OHSHazardForm;
