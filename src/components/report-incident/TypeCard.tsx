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
        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col h-32 ${
            isSelected 
                ? 'border-[#BB8F53] shadow-sm ring-1 ring-[#BB8F53]' 
                : 'border-gray-100 hover:border-gold-200 bg-white'
        }`}
    >
        <div className="p-3.5 flex-1">
            <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-gold-600' : 'text-gray-400'}`}>
                    {title}
                </span>
                <button className="text-gray-300 hover:text-gray-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                </button>
            </div>
            <h4 className={`text-lg font-bold tracking-tight ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {title}
            </h4>
        </div>
        
        <div className={`px-3.5 py-1.5 transition-colors bg-light-gold ${isSelected ? 'bg-[#FBF7F2]' : 'bg-[#F9FAFB]'}`}>
            <p className={`text-xs ${isSelected ? 'text-gold-700' : 'text-gray-500'} line-clamp-1`}>
                {description}
            </p>
        </div>
    </div>
);

export default TypeCard;
