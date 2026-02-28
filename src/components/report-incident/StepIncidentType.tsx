import React, { useState } from 'react';
import TypeCard from './TypeCard';
import { INCIDENT_CATEGORIES } from '../../data/constants';

interface StepIncidentTypeProps {
    selected?: string;
    onSelect: (categoryId: string, type: string) => void;
}

const StepIncidentType: React.FC<StepIncidentTypeProps> = ({ selected, onSelect }) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState(selected);

    const handleTypeSelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        // Do not auto-advance; wait for Next button click
    };

    return (
        <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-800 mb-1">Incident Type</h3>
            <p className="text-lg text-gray-500 mb-8 font-medium">Select category</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {INCIDENT_CATEGORIES.map((category) => (
                    <TypeCard
                        key={category.id}
                        title={category.name}
                        description={category.description || ''}
                        isSelected={selectedCategoryId === category.id}
                        onClick={() => handleTypeSelect(category.id)}
                    />
                ))}
            </div>

            {/* Footer buttons matching the image */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                <div className="flex gap-8">
                    <button className="text-gray-600 font-bold hover:text-gray-900 transition-colors">
                        Save as Draft
                    </button>
                    <button className="text-gray-600 font-bold hover:text-gray-900 transition-colors">
                        Discard
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        className="px-8 py-2.5 bg-light-green rounded-lg font-bold cursor-not-allowed"
                        disabled
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => {
                            if (selectedCategoryId) {
                                const cat = INCIDENT_CATEGORIES.find(c => c.id === selectedCategoryId);
                                if (cat) {
                                    onSelect(cat.id, cat.caseType || 'INCIDENT');
                                }
                            }
                        }}
                        disabled={!selectedCategoryId}
                        className="px-10 py-2.5 bg-green text-white rounded-lg font-bold shadow-sm hover:bg-[#0f766e] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepIncidentType;
