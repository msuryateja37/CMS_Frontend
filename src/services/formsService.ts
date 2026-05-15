import api from './api';
import type {
  FormSummary,
  FormDetail,
  FormVersionDetail,
  FormVersionMeta,
  FormSchema,
  FormTemplate,
  SubmitResponsePayload,
  FormResponseRecord,
} from '../types/forms';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a FormVersionDetail canvas row to the legacy FormTemplate shape */
function versionToTemplate(v: FormVersionDetail): FormTemplate {
  return {
    id: v.id,
    formId: v.formId,
    title: v.title,
    description: v.description,
    sections: v.sections,
  };
}

// ─── Form CRUD ────────────────────────────────────────────────────────────────

/** List all forms with their active-version metadata */
export async function getForms(): Promise<FormSummary[]> {
  const res = await api.get('/forms');
  return res.data;
}

/** Create a new form + first draft version */
export async function createForm(payload: {
  title: string;
  description?: string;
  slug?: string;
  createdBy?: string;
  sections?: any[];
}): Promise<FormDetail> {
  const res = await api.post('/forms', payload);
  return res.data;
}

/** Get a form with its active version (canvas rows) */
export async function getFormById(formId: string): Promise<FormDetail> {
  const res = await api.get(`/forms/${formId}`);
  return res.data;
}

/** Get the frozen schema of the active published version (fast path) */
export async function getActiveSchema(formId: string): Promise<FormSchema> {
  const res = await api.get(`/forms/${formId}/schema`);
  return res.data;
}

/** Get the active schema by slug */
export async function getSchemaBySlug(slug: string): Promise<FormSchema> {
  const res = await api.get(`/forms/by-slug/${slug}`);
  return res.data;
}

// ─── Version management ───────────────────────────────────────────────────────

/** List all versions for a form */
export async function getVersions(formId: string): Promise<FormVersionMeta[]> {
  const res = await api.get(`/forms/${formId}/versions`);
  return res.data;
}

/** Create a new draft version for an existing form */
export async function createVersion(
  formId: string,
  payload: { title: string; description?: string; sections?: any[] },
): Promise<FormVersionDetail> {
  const res = await api.post(`/forms/${formId}/versions`, payload);
  return res.data;
}

/** Publish a draft version (freezes schema, activates it) */
export async function publishVersion(versionId: string): Promise<FormVersionMeta> {
  const res = await api.patch(`/forms/versions/${versionId}/publish`);
  return res.data;
}

/** Archive a published version */
export async function archiveVersion(versionId: string): Promise<FormVersionMeta> {
  const res = await api.patch(`/forms/versions/${versionId}/archive`);
  return res.data;
}

// ─── Responses ────────────────────────────────────────────────────────────────

/** Submit answers — auto-pins to the active published version */
export async function submitFormResponse(
  formId: string,
  payload: SubmitResponsePayload,
): Promise<any> {
  const res = await api.post(`/forms/${formId}/responses`, payload);
  return res.data;
}

/** List paginated responses for a form */
export async function getResponses(
  formId: string,
  page = 1,
  limit = 20,
): Promise<{ total: number; page: number; limit: number; data: FormResponseRecord[] }> {
  const res = await api.get(`/forms/${formId}/responses`, { params: { page, limit } });
  return res.data;
}

/** Get a single response with schema context */
export async function getResponse(responseId: string): Promise<FormResponseRecord> {
  const res = await api.get(`/forms/responses/${responseId}`);
  return res.data;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getQuestionAnalytics(questionId: string) {
  const res = await api.get(`/forms/analytics/question/${questionId}`);
  return res.data;
}

// ─── Legacy helpers (preserve backward compatibility) ─────────────────────────
// These keep the existing OHS form pages working without immediate changes.

async function _getVersionByKeyword(keyword: string): Promise<FormVersionDetail> {
  const res = await api.get('/forms/search/by-title', { params: { q: keyword } });
  return res.data;
}

/** @deprecated use getActiveSchema(formId) instead */
export async function getFormByTitleKeyword(keyword: string): Promise<FormTemplate> {
  const version = await _getVersionByKeyword(keyword);
  return versionToTemplate(version);
}

/** @deprecated use getFormByTitleKeyword('disability') or getActiveSchema() */
export async function getDisabilityForm(): Promise<FormTemplate> {
  return getFormByTitleKeyword('disability');
}

/** @deprecated use getFormByTitleKeyword('audit checklist') or getActiveSchema() */
export async function getOhsAuditForm(): Promise<FormTemplate> {
  return getFormByTitleKeyword('compliance audit checklist');
}

/** @deprecated use getFormByTitleKeyword('inspection checklist') or getActiveSchema() */
export async function getOhsInspectionForm(): Promise<FormTemplate> {
  return getFormByTitleKeyword('inspection checklist');
}

/** @deprecated use getFormByTitleKeyword('building assessment') or getActiveSchema() */
export async function getNewBuildingForm(): Promise<FormTemplate> {
  return getFormByTitleKeyword('building assessment');
}

/** @deprecated use submitFormResponse(formId, { submittedBy, answers }) */
export async function submitFormResponseLegacy(
  formId: string,
  submittedBy: string,
  answers: { questionId: string; answerText?: string; selectedOptionId?: string }[],
): Promise<any> {
  return submitFormResponse(formId, { submittedBy, answers });
}
