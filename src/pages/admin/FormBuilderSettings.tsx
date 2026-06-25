import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import type {
  FormSummary,
  FormVersionMeta,
  FormVersionDetail,
  FormSection,
  QuestionInput,
  InputType,
} from '../../types/forms';
import {
  getForms,
  createForm,
  getVersions,
  createVersion,
  publishVersion,
  archiveVersion,
} from '../../services/formsService';
import api from '../../services/api';

// ─── Input type options ───────────────────────────────────────────────────────

const INPUT_TYPES: { value: InputType; label: string }[] = [
  { value: 'TEXT', label: 'Short Text' },
  { value: 'TEXTAREA', label: 'Long Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'DATE', label: 'Date' },
  { value: 'RADIO', label: 'Radio (single choice)' },
  { value: 'CHECKBOX', label: 'Checkboxes (multi)' },
  { value: 'SELECT', label: 'Dropdown' },
];

const needsOptions = (t: InputType) => ['RADIO', 'CHECKBOX', 'SELECT'].includes(t);

// ─── Tiny badge ───────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cls =
    status === 'PUBLISHED'
      ? 'bg-gold-100 text-gold-700 border-gold-200'
      : status === 'DRAFT'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-gray-100 text-gray-500 border-gray-200';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>{status}</span>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => `_${Math.random().toString(36).slice(2, 9)}`;

function emptyQuestion(): QuestionInput {
  return {
    id: uid(),
    label: '',
    inputType: 'TEXT',
    placeholder: '',
    isRequired: false,
    orderIndex: 0,
    options: [],
  };
}

function emptySection(): FormSection {
  return {
    id: uid(),
    title: 'New Section',
    description: '',
    orderIndex: 0,
    questions: [emptyQuestion()],
  };
}

// ─── Main page ────────────────────────────────────────────────────────────────

const FormBuilderSettings: React.FC = () => {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [versions, setVersions] = useState<FormVersionMeta[]>([]);
  const [draftVersion, setDraftVersion] = useState<FormVersionDetail | null>(null);
  const [canvas, setCanvas] = useState<FormSection[]>([]);
  const [versionTitle, setVersionTitle] = useState('');
  const [versionDesc, setVersionDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormSlug, setNewFormSlug] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  // ── Load form list ────────────────────────────────────────────────────────

  const refreshForms = useCallback(async () => {
    setLoading(true);
    try {
      setForms(await getForms());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshForms(); }, [refreshForms]);

  // ── Select a form → load its versions ────────────────────────────────────

  const selectForm = async (formId: string) => {
    setSelectedFormId(formId);
    setDraftVersion(null);
    setCanvas([]);
    setVersions([]);
    const vers = await getVersions(formId);
    setVersions(vers);
    // Auto-open the latest draft
    const draft = vers.find(v => v.status === 'DRAFT');
    if (draft) await loadDraft(formId, draft.id);
  };

  const loadDraft = async (formId: string, versionId: string) => {
    const res = await api.get(`/forms/${formId}`);
    const v: FormVersionDetail | undefined = (res.data.versions ?? []).find(
      (x: any) => x.id === versionId,
    );
    if (v) {
      setDraftVersion(v);
      setVersionTitle(v.title);
      setVersionDesc(v.description ?? '');
      setCanvas(v.sections ?? []);
    }
  };

  // ── Create new form ───────────────────────────────────────────────────────

  const handleCreateForm = async () => {
    if (!newFormTitle.trim()) return;
    try {
      const f = await createForm({ title: newFormTitle.trim(), slug: newFormSlug.trim() || undefined });
      setFeedback({ type: 'ok', msg: 'Form created!' });
      setShowNewForm(false);
      setNewFormTitle('');
      setNewFormSlug('');
      await refreshForms();
      await selectForm(f.id);
    } catch {
      setFeedback({ type: 'err', msg: 'Failed to create form.' });
    }
  };

  // ── Create new draft version ──────────────────────────────────────────────

  const handleNewVersion = async () => {
    if (!selectedFormId || !versionTitle.trim()) return;
    const v = await createVersion(selectedFormId, {
      title: versionTitle,
      description: versionDesc,
      sections: canvas,
    });
    setDraftVersion(v);
    setVersions(await getVersions(selectedFormId));
    setFeedback({ type: 'ok', msg: `Version ${v.versionNumber} draft created.` });
  };

  // ── Save draft to API (PUT canvas) ────────────────────────────────────────

  const handleSaveDraft = async () => {
    if (!draftVersion || !selectedFormId) return;
    setSaving(true);
    try {
      await api.patch(`/forms/versions/${draftVersion.id}/canvas`, {
        title: versionTitle,
        description: versionDesc,
        sections: canvas,
      });
      setFeedback({ type: 'ok', msg: 'Draft saved.' });
    } catch {
      setFeedback({ type: 'err', msg: 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Publish ───────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!draftVersion || !selectedFormId) return;
    setPublishing(true);
    try {
      await publishVersion(draftVersion.id);
      setVersions(await getVersions(selectedFormId));
      setFeedback({ type: 'ok', msg: 'Version published and active!' });
      setDraftVersion(null);
    } catch (e: any) {
      setFeedback({ type: 'err', msg: e?.response?.data?.message ?? 'Publish failed.' });
    } finally {
      setPublishing(false);
    }
  };

  // ── Archive ───────────────────────────────────────────────────────────────

  const handleArchive = async (versionId: string) => {
    if (!selectedFormId) return;
    await archiveVersion(versionId);
    setVersions(await getVersions(selectedFormId));
  };

  // ── Canvas mutations ──────────────────────────────────────────────────────

  const addSection = () => setCanvas(c => [...c, { ...emptySection(), orderIndex: c.length }]);

  const updateSection = (sIdx: number, patch: Partial<FormSection>) =>
    setCanvas(c => c.map((s, i) => (i === sIdx ? { ...s, ...patch } : s)));

  const removeSection = (sIdx: number) => setCanvas(c => c.filter((_, i) => i !== sIdx));

  const addQuestion = (sIdx: number) =>
    setCanvas(c =>
      c.map((s, i) =>
        i === sIdx
          ? { ...s, questions: [...s.questions, { ...emptyQuestion(), orderIndex: s.questions.length }] }
          : s,
      ),
    );

  const updateQuestion = (sIdx: number, qIdx: number, patch: Partial<QuestionInput>) =>
    setCanvas(c =>
      c.map((s, i) =>
        i === sIdx
          ? { ...s, questions: s.questions.map((q, j) => (j === qIdx ? { ...q, ...patch } : q)) }
          : s,
      ),
    );

  const removeQuestion = (sIdx: number, qIdx: number) =>
    setCanvas(c =>
      c.map((s, i) =>
        i === sIdx ? { ...s, questions: s.questions.filter((_, j) => j !== qIdx) } : s,
      ),
    );

  const addOption = (sIdx: number, qIdx: number) =>
    updateQuestion(sIdx, qIdx, {
      options: [
        ...(canvas[sIdx].questions[qIdx].options ?? []),
        { id: uid(), optionLabel: '', optionValue: '', orderIndex: canvas[sIdx].questions[qIdx].options?.length ?? 0 },
      ],
    });

  const updateOption = (sIdx: number, qIdx: number, oIdx: number, label: string) => {
    const opts = [...(canvas[sIdx].questions[qIdx].options ?? [])];
    opts[oIdx] = { ...opts[oIdx], optionLabel: label, optionValue: label.toLowerCase().replace(/\s+/g, '_') };
    updateQuestion(sIdx, qIdx, { options: opts });
  };

  const removeOption = (sIdx: number, qIdx: number, oIdx: number) => {
    const opts = (canvas[sIdx].questions[qIdx].options ?? []).filter((_, i) => i !== oIdx);
    updateQuestion(sIdx, qIdx, { options: opts });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout
      title="Form Builder"
      description="Create and manage versioned dynamic forms."
      breadcrumbs={[{ label: 'Admin', path: '/admin/administration' }, { label: 'Form Builder' }]}
    >
      <div className="flex gap-5 h-[calc(100vh-160px)] overflow-hidden">

        {/* ── Left panel: form list ─────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 overflow-hidden">
          <button
            onClick={() => setShowNewForm(v => !v)}
            className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-lg transition shadow-sm"
          >
            + New Form
          </button>

          {showNewForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <input
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full"
                placeholder="Form title *"
                value={newFormTitle}
                onChange={e => setNewFormTitle(e.target.value)}
              />
              <input
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full"
                placeholder="Slug (optional)"
                value={newFormSlug}
                onChange={e => setNewFormSlug(e.target.value)}
              />
              <button
                onClick={handleCreateForm}
                className="bg-gold-500 hover:bg-gold-600 text-white text-sm py-1.5 rounded-md font-medium"
              >
                Create
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-sm">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading…</p>
            ) : forms.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No forms yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {forms.map(f => (
                  <li
                    key={f.id}
                    onClick={() => selectForm(f.id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
                      selectedFormId === f.id ? 'bg-gold-50 border-l-2 border-gold-500' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {f.activeVersion?.title ?? 'Untitled Form'}
                    </p>
                    {f.activeVersion && (
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={f.activeVersion.status} />
                        <span className="text-xs text-gray-400">v{f.activeVersion.versionNumber}</span>
                      </div>
                    )}
                    {f.slug && <p className="text-xs text-gray-400 mt-0.5">/{f.slug}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right panel ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">

          {!selectedFormId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a form or create a new one.
            </div>
          ) : (
            <>
              {/* ── Version list ─────────────────────────────────────── */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700">Versions</h2>
                  <button
                    onClick={handleNewVersion}
                    className="text-xs text-gold-600 border border-gold-300 hover:bg-gold-50 px-3 py-1 rounded-md font-medium"
                  >
                    + New Draft Version
                  </button>
                </div>
                {versions.length === 0 ? (
                  <p className="text-xs text-gray-400">No versions yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {versions.map(v => (
                      <div
                        key={v.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition ${
                          draftVersion?.id === v.id
                            ? 'bg-gold-50 border-gold-400'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => v.status === 'DRAFT' && selectedFormId && loadDraft(selectedFormId, v.id)}
                      >
                        <span className="font-semibold">v{v.versionNumber}</span>
                        <StatusBadge status={v.status} />
                        {v.status === 'PUBLISHED' && (
                          <button
                            onClick={e => { e.stopPropagation(); handleArchive(v.id); }}
                            className="text-gray-400 hover:text-red-400 ml-1"
                            title="Archive"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Canvas editor ────────────────────────────────────── */}
              {draftVersion ? (
                <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-5">
                  {/* Version meta */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Version Title</label>
                      <input
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full"
                        value={versionTitle}
                        onChange={e => setVersionTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                      <input
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full"
                        value={versionDesc}
                        onChange={e => setVersionDesc(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Feedback */}
                  {feedback && (
                    <div
                      className={`text-sm px-4 py-2 rounded-lg ${
                        feedback.type === 'ok'
                          ? 'bg-gold-50 text-gold-700 border border-gold-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {feedback.msg}
                    </div>
                  )}

                  {/* Sections */}
                  {canvas.map((section, sIdx) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      sIdx={sIdx}
                      onUpdateSection={p => updateSection(sIdx, p)}
                      onRemoveSection={() => removeSection(sIdx)}
                      onAddQuestion={() => addQuestion(sIdx)}
                      onUpdateQuestion={(qIdx, p) => updateQuestion(sIdx, qIdx, p)}
                      onRemoveQuestion={qIdx => removeQuestion(sIdx, qIdx)}
                      onAddOption={(qIdx) => addOption(sIdx, qIdx)}
                      onUpdateOption={(qIdx, oIdx, label) => updateOption(sIdx, qIdx, oIdx, label)}
                      onRemoveOption={(qIdx, oIdx) => removeOption(sIdx, qIdx, oIdx)}
                    />
                  ))}

                  <button
                    onClick={addSection}
                    className="self-start text-sm text-gray-500 border border-dashed border-gray-300 hover:border-gold-400 hover:text-gold-600 px-4 py-2 rounded-lg transition"
                  >
                    + Add Section
                  </button>

                  {/* Action bar */}
                  <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-2">
                    <button
                      onClick={handleSaveDraft}
                      disabled={saving}
                      className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save Draft'}
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={publishing}
                      className="px-6 py-2 text-sm bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50 transition"
                    >
                      {publishing ? 'Publishing…' : '🚀 Publish Version'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                  Click a DRAFT version to edit its canvas, or create a new draft version above.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// ─── Section editor ───────────────────────────────────────────────────────────

interface SectionEditorProps {
  section: FormSection;
  sIdx: number;
  onUpdateSection: (p: Partial<FormSection>) => void;
  onRemoveSection: () => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (qIdx: number, p: Partial<QuestionInput>) => void;
  onRemoveQuestion: (qIdx: number) => void;
  onAddOption: (qIdx: number) => void;
  onUpdateOption: (qIdx: number, oIdx: number, label: string) => void;
  onRemoveOption: (qIdx: number, oIdx: number) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section, sIdx, onUpdateSection, onRemoveSection,
  onAddQuestion, onUpdateQuestion, onRemoveQuestion,
  onAddOption, onUpdateOption, onRemoveOption,
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    {/* Section header */}
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {sIdx + 1}
      </div>
      <input
        className="flex-1 text-sm font-semibold bg-transparent border-none outline-none text-gray-800"
        value={section.title}
        onChange={e => onUpdateSection({ title: e.target.value })}
        placeholder="Section title"
      />
      <button onClick={onRemoveSection} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
    </div>

    {/* Questions */}
    <div className="p-4 flex flex-col gap-4">
      {section.questions.map((q, qIdx) => (
        <QuestionEditor
          key={q.id}
          question={q}
          qIdx={qIdx}
          onUpdate={p => onUpdateQuestion(qIdx, p)}
          onRemove={() => onRemoveQuestion(qIdx)}
          onAddOption={() => onAddOption(qIdx)}
          onUpdateOption={(oIdx, label) => onUpdateOption(qIdx, oIdx, label)}
          onRemoveOption={oIdx => onRemoveOption(qIdx, oIdx)}
        />
      ))}
      <button
        onClick={onAddQuestion}
        className="self-start text-xs text-gray-400 hover:text-gold-600 border border-dashed border-gray-200 hover:border-gold-300 px-3 py-1.5 rounded-md transition"
      >
        + Add Question
      </button>
    </div>
  </div>
);

// ─── Question editor ──────────────────────────────────────────────────────────

interface QuestionEditorProps {
  question: QuestionInput;
  qIdx: number;
  onUpdate: (p: Partial<QuestionInput>) => void;
  onRemove: () => void;
  onAddOption: () => void;
  onUpdateOption: (oIdx: number, label: string) => void;
  onRemoveOption: (oIdx: number) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question, qIdx, onUpdate, onRemove, onAddOption, onUpdateOption, onRemoveOption,
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-400 w-5 text-right mt-2">{qIdx + 1}.</span>
      <div className="flex-1 flex flex-col gap-2">
        <input
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full bg-white"
          placeholder="Question label *"
          value={question.label}
          onChange={e => onUpdate({ label: e.target.value })}
        />
        <div className="flex gap-2 flex-wrap">
          <select
            className="border border-gray-300 rounded-md px-2 py-1.5 text-xs bg-white"
            value={question.inputType}
            onChange={e => onUpdate({ inputType: e.target.value as InputType, options: [] })}
          >
            {INPUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={question.isRequired}
              onChange={e => onUpdate({ isRequired: e.target.checked })}
              className="accent-gold-600"
            />
            Required
          </label>
          {!needsOptions(question.inputType) && (
            <input
              className="border border-gray-300 rounded-md px-2 py-1.5 text-xs bg-white flex-1"
              placeholder="Placeholder"
              value={question.placeholder ?? ''}
              onChange={e => onUpdate({ placeholder: e.target.value })}
            />
          )}
        </div>

        {/* Options (RADIO / CHECKBOX / SELECT) */}
        {needsOptions(question.inputType) && (
          <div className="flex flex-col gap-1.5 mt-1">
            {(question.options ?? []).map((opt, oIdx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-400">•</span>
                <input
                  className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white flex-1"
                  placeholder={`Option ${oIdx + 1}`}
                  value={opt.optionLabel}
                  onChange={e => onUpdateOption(oIdx, e.target.value)}
                />
                <button onClick={() => onRemoveOption(oIdx)} className="text-gray-300 hover:text-red-400 text-sm">×</button>
              </div>
            ))}
            <button
              onClick={onAddOption}
              className="self-start text-xs text-gray-400 hover:text-gold-600"
            >
              + option
            </button>
          </div>
        )}
      </div>
      <button onClick={onRemove} className="text-gray-300 hover:text-red-400 text-lg leading-none mt-1">×</button>
    </div>
  </div>
);

export default FormBuilderSettings;
