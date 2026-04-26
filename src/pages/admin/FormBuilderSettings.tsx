import React, { useState, useEffect } from 'react';
import type { FormTemplate } from '../../types/forms';

export const FormBuilderSettings: React.FC = () => {
    const [forms, setForms] = useState<FormTemplate[]>([{
        id: 'mock_1',
        title: 'OHS Inspector – Disability Assessment Checklist',
        description: 'Mock Form',
        sections: []
    }]);

    const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);

    const handleSelectForm = (form: FormTemplate) => {
        setSelectedForm(form);
    };

    const handleSave = () => {
        alert('Form structure saved!');
    };

    return (
        <div className="p-8 h-full overflow-hidden flex flex-col bg-gray-50">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Form Builder Settings (Admin)</h1>
            
            <div className="flex gap-6 flex-1 overflow-hidden">
                <div className="w-1/3 bg-white border border-gray-200 rounded-lg shadow-sm p-4 overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Available Forms</h2>
                    <ul className="space-y-2">
                        {forms.map(f => (
                            <li 
                                key={f.id} 
                                onClick={() => handleSelectForm(f)}
                                className={`p-3 rounded-md cursor-pointer border hover:border-emerald-500 transition-colors ${selectedForm?.id === f.id ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'border-gray-200 bg-gray-50'}`}
                            >
                                {f.title}
                            </li>
                        ))}
                    </ul>
                    <button className="mt-4 w-full py-2 bg-emerald-100 text-emerald-700 font-medium rounded-md hover:bg-emerald-200">
                        + Create New Form
                    </button>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 overflow-y-auto flex flex-col">
                    {selectedForm ? (
                        <>
                            <h2 className="text-xl font-semibold mb-2">Edit Form: {selectedForm.title}</h2>
                            <p className="text-gray-500 text-sm mb-6 border-b pb-4">Define sections and questions dynamically.</p>
                            
                            <div className="flex-1">
                                {selectedForm.sections.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                        No sections defined yet.
                                    </div>
                                ) : (
                                    <div>
                                        {selectedForm.sections.map(section => (
                                            <div key={section.id} className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                                                <h3 className="font-medium text-gray-700">{section.title}</h3>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 border-t pt-4 flex justify-between">
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200">
                                    + Add Section
                                </button>
                                <button onClick={handleSave} className="px-6 py-2 bg-emerald-500 text-white font-medium rounded-md hover:bg-emerald-600 shadow-sm">
                                    Save Schema
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Select a form from the left to edit its schema.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormBuilderSettings;
