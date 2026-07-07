import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import TypeCard from './TypeCard';
import { INCIDENT_CATEGORIES } from '../../data/constants';

interface StepIncidentTypeProps {
    selected?: string;
    onSelect: (categoryId: string, type: string) => void;
    /** Category ids to hide from the selection grid (e.g. ['security']). */
    excludeCategoryIds?: string[];
}

const StepIncidentType: React.FC<StepIncidentTypeProps> = ({ selected, onSelect, excludeCategoryIds = [] }) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState(selected);
    const categories = INCIDENT_CATEGORIES.filter((c) => !excludeCategoryIds.includes(c.id));
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const handleTypeSelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        // Do not auto-advance; wait for Next button click
    };

    const handleBackToDashboard = () => {
        if (!user) {
            navigate('/');
            return;
        }
        const roleName = user.role?.name?.toLowerCase().replace(/\s+/g, '_');

        if (roleName === 'employee') {
            navigate('/employee/dashboard');
        } else if (roleName === 'supervisor') {
            navigate('/supervisor/dashboard');
        } else if (roleName === 'ohs_practitioner') {
            navigate('/ohs/dashboard');
        } else if (roleName === 'first_aider') {
            navigate('/first-aider/dashboard');
        } else if (roleName === 'finance_official') {
            navigate('/finance/dashboard');
        } else if (roleName === 'system_administrator' || roleName === 'manager') {
            navigate('/admin/dashboard');
        } else {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col gap-3 items-start mb-5">
                <button
                    onClick={handleBackToDashboard}
                    className="p-1.5 -mt-2 -ml-1 text-gray-500 hover:text-[#884616] bg-white hover:bg-light-gold border border-gray-150 rounded-xl transition-all shrink-0 shadow-sm flex items-center justify-center"
                    title="Back to Dashboard"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 leading-none">Incident Type</h3>
                    <p className="text-xs text-gray-400 mt-1.5 font-medium">Select category</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {categories.map((category) => (
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
            <div className="flex items-center justify-between mt-6 pt-3 border-t border-gray-100">
                <div className="flex gap-4">
                    <button className="text-gray-600 font-bold hover:text-gray-900 transition-colors text-xs">
                        Save as Draft
                    </button>
                    <button className="text-gray-600 font-bold hover:text-gray-900 transition-colors text-xs">
                        Discard
                    </button>
                </div>
                <div className="flex gap-3">
                    <button
                        className="px-5 py-1.5 bg-light-gold rounded-lg font-bold cursor-not-allowed text-xs"
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
                        className="px-6 py-1.5 bg-gold text-white rounded-lg font-bold shadow-sm hover:bg-[#A1743E] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepIncidentType;
