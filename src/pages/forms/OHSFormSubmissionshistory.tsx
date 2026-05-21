import React, { useState, useEffect } from 'react';
import { getForms, getResponses } from '../../services/formsService';
import type { FormSummary, FormResponseRecord } from '../../types/forms';
import DashboardLayout from '../../layouts/DashboardLayout';

export const OHSFormSubmissions: React.FC = () => {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | 'all'>('all');
  const [submissions, setSubmissions] = useState<FormResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormResponseRecord | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const allForms = await getForms();
        // Filter only OHS related forms for this view
        const ohsForms = allForms.filter(f => 
          f.slug?.includes('ohs') || 
          f.activeVersion?.title.toLowerCase().includes('ohs')
        );
        setForms(ohsForms);
        
        // Fetch submissions for all filtered forms
        const allSubmissions: FormResponseRecord[] = [];
        for (const form of ohsForms) {
          const res = await getResponses(form.id, 1, 50);
          allSubmissions.push(...res.data);
        }
        
        // Sort by date desc
        allSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubmissions(allSubmissions);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const filteredSubmissions = selectedFormId === 'all' 
    ? submissions 
    : submissions.filter(s => s.formId === selectedFormId);

  return (
    <DashboardLayout
      title="OHS Practitioner – Submissions History"
      description="Review and track all submitted OHS assessments and audits."
      breadcrumbs={[
        { label: 'OHS Dashboard', path: '/ohs/dashboard' },
        { label: 'Submissions History' }
      ]}
    >
      <div className="flex flex-col gap-6 relative">
        
        {/* Filters Row */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter by Form:</span>
            <select 
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All OHS Forms</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.activeVersion?.title || f.slug}</option>
              ))}
            </select>
          </div>
          
          <div className="text-xs text-gray-400 font-medium">
            Showing {filteredSubmissions.length} recent submissions
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Form Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Submitted At</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading submissions...
                    </div>
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No submissions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 text-sm">
                        {forms.find(f => f.id === sub.formId)?.activeVersion?.title || 'Unknown Form'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">ID: {sub.id.slice(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(sub.submittedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 font-bold uppercase tracking-tight">
                        Recorded
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedSubmission(sub)}
                        className="text-xs font-bold text-white bg-emerald-700 hover:bg-green-300 px-4 py-2 rounded-lg border border-green-200 transition-all shadow-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Submission Details Modal ── */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {forms.find(f => f.id === selectedSubmission.formId)?.activeVersion?.title || 'Form Submission Details'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    Submitted on {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                {selectedSubmission.formVersion.schema?.sections.map((section, sIdx) => (
                  <div key={section.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100">
                        {sIdx + 1}
                      </div>
                      <h4 className="text-base font-bold text-gray-800">{section.title}</h4>
                    </div>

                    <div className="space-y-6">
                      {section.questions.map(q => {
                        const response = selectedSubmission.answers.find(a => a.questionId === q.id);
                        const answerText = response?.answerText || 'No answer provided';
                        
                        return (
                          <div key={q.id} className="pl-11 border-l-2 border-gray-50 ml-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                              {q.label}
                            </label>
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                              <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">
                                {answerText}
                              </p>
                              {response?.selectedOptionId && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Selected Option Verified</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/30 flex justify-end sticky bottom-0">
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
                >
                  Close View
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default OHSFormSubmissions;
