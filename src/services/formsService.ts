import api from './api';
import type { FormTemplate } from '../types/forms';

// Map the raw Prisma response shape to the frontend FormTemplate type
function mapApiResponse(data: any): FormTemplate {
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? '',
    sections: (data.sections ?? []).map((section: any) => ({
      id: section.id,
      title: section.title,
      questions: (section.questions ?? []).map((q: any) => ({
        id: q.id,
        label: q.label,
        inputType: q.inputType,
        placeholder: q.placeholder ?? '',
        options: (q.options ?? []).map((opt: any) => ({
          id: opt.id,
          optionLabel: opt.optionLabel,
          optionValue: opt.optionValue,
        })),
      })),
    })),
  };
}

// Get list of all active forms (returns id + title only)
export async function getForms(): Promise<{ id: string; title: string; description?: string }[]> {
  const response = await api.get('/forms');
  return response.data;
}

// Get a single form with all sections and questions by ID
export async function getFormById(id: string): Promise<FormTemplate> {
  const response = await api.get(`/forms/${id}`);
  return mapApiResponse(response.data);
}

// Get the seeded OHS Disability Assessment form specifically
export async function getDisabilityForm(): Promise<FormTemplate> {
  const formList = await getForms();
  // Find the disability form by title keyword (case-insensitive)
  const match = formList.find(f =>
    f.title.toLowerCase().includes('disability')
  );
  const id = match?.id ?? formList[0]?.id;
  if (!id) throw new Error('No forms found in the database.');
  return getFormById(id);
}

// Get the seeded OHS Audit Checklist form specifically
export async function getOhsAuditForm(): Promise<FormTemplate> {
  const formList = await getForms();
  // Find the OHS audit form by title keyword (case-insensitive)
  const match = formList.find(f =>
    f.title.toLowerCase().includes('audit checklist')
  );
  const id = match?.id ?? formList[0]?.id;
  if (!id) throw new Error('No forms found in the database.');
  return getFormById(id);
}

// Get the seeded New Building Assessment Checklist form specifically
export async function getNewBuildingForm(): Promise<FormTemplate> {
  const formList = await getForms();
  // Find the new building form by title keyword (case-insensitive)
  const match = formList.find(f =>
    f.title.toLowerCase().includes('building assessment')
  );
  const id = match?.id ?? formList[0]?.id;
  if (!id) throw new Error('No forms found in the database.');
  return getFormById(id);
}

// Submit a filled form response
export async function submitFormResponse(
  formId: string,
  submittedBy: string,
  answers: { questionId: string; answerText?: string; selectedOptionId?: string }[]
): Promise<any> {
  const response = await api.post(`/forms/${formId}/responses`, { submittedBy, answers });
  return response.data;
}
