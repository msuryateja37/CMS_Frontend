export type QuestionOption = {
  id: string;
  optionLabel: string;
  optionValue: string;
};

export type QuestionInput = {
  id: string;
  label: string;
  inputType: 'text' | 'date' | 'radio_with_comments' | 'radio' | 'textarea' | string;
  placeholder?: string;
  options?: QuestionOption[];
};

export type FormSection = {
  id: string;
  title: string;
  questions: QuestionInput[];
};

export type FormTemplate = {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
};
