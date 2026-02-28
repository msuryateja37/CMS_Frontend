import React from 'react';

interface TypeCardProps {
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

const TypeCard: React.FC<TypeCardProps> = ({ title, description, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col h-48 ${
            isSelected 
                ? 'border-[#22C55E] shadow-lg shadow-green-100 ring-1 ring-[#22C55E]' 
                : 'border-gray-100 hover:border-green-200 bg-white'
        }`}
    >
        <div className="p-5 flex-1">
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-medium uppercase tracking-wider ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>
                    {title}
                </span>
                <button className="text-gray-300 hover:text-gray-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                </button>
            </div>
            <h4 className={`text-3xl font-bold tracking-tight ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {title}
            </h4>
        </div>
        
        <div className={`px-5 py-3 transition-colors bg-light-green ${isSelected ? 'bg-[#ECFDF5]' : 'bg-[#F9FAFB]'}`}>
            <p className={`text-sm ${isSelected ? 'text-green-700' : 'text-gray-500'}`}>
                {description}
            </p>
        </div>
    </div>
);

export default TypeCard;
