// ─── Enums (mirror Prisma schema) ──────────────────────────────────────────────

export type InputType =
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'TEXTAREA'
  | 'RADIO'
  | 'CHECKBOX'
  | 'SELECT';

export type FormVersionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// ─── Canvas / snapshot shapes ──────────────────────────────────────────────────

export interface QuestionOption {
  id: string;
  optionLabel: string;
  optionValue: string;
  orderIndex: number;
}

export interface QuestionInput {
  id: string;
  label: string;
  inputType: InputType;
  placeholder?: string | null;
  isRequired: boolean;
  orderIndex: number;
  validationRules?: Record<string, unknown> | null;
  options: QuestionOption[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  questions: QuestionInput[];
}

// ─── Schema snapshot (frozen JSONB returned from FormVersion.schema) ───────────

export interface FormSchema {
  sections: FormSection[];
}

// ─── FormVersion ───────────────────────────────────────────────────────────────

export interface FormVersionMeta {
  id: string;
  versionNumber: number;
  title: string;
  description?: string | null;
  status: FormVersionStatus;
  isActive: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

export interface FormVersionDetail extends FormVersionMeta {
  sections: FormSection[]; // canvas rows
  schema?: FormSchema | null; // present after publish
}

// ─── Form ──────────────────────────────────────────────────────────────────────

export interface FormSummary {
  id: string;
  slug?: string | null;
  createdAt: string;
  activeVersion: FormVersionMeta | null;
}

export interface FormDetail {
  id: string;
  slug?: string | null;
  createdAt: string;
  versions: FormVersionDetail[];
}

// ─── Responses ─────────────────────────────────────────────────────────────────

export interface AnswerPayload {
  questionId: string;
  answerText?: string;
  selectedOptionId?: string;
}

export interface SubmitResponsePayload {
  submittedBy?: string;
  answers: AnswerPayload[];
}

export interface QuestionResponse {
  id: string;
  questionId: string;
  answerText?: string | null;
  selectedOptionId?: string | null;
}

export interface FormResponseRecord {
  id: string;
  formId: string;
  formVersionId: string;
  submittedAt: string;
  formVersion: {
    versionNumber: number;
    schema: FormSchema | null;
  };
  answers: QuestionResponse[];
}

// ─── Legacy / backward-compat alias ───────────────────────────────────────────
// Some existing components still reference FormTemplate.
// Map FormVersionDetail to it so we don't break them immediately.

export interface FormTemplate {
  id: string;
  title: string;
  description?: string | null;
  sections: FormSection[];
}
