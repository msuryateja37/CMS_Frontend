import React from 'react';

interface SeverityOptionProps {
    label: string;
    isSelected?: boolean;
    onClick?: () => void;
    activeColor: string;
}

const SeverityOption: React.FC<SeverityOptionProps> = ({ label, isSelected, onClick, activeColor }) => {
    const colorClasses: Record<string, { bg: string, border: string, dotBg: string, dotBorder: string }> = {
        red: {
            bg: 'bg-subtle-red',
            border: 'border-red/20',
            dotBg: 'bg-red',
            dotBorder: 'border-red/30'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            dotBg: 'bg-orange-500',
            dotBorder: 'border-orange-300'
        },
        yellow: {
            bg: 'bg-light-yellow',
            border: 'border-yellow/20',
            dotBg: 'bg-yellow',
            dotBorder: 'border-yellow/30'
        },
        gold: {
            bg: 'bg-subtle-gold',
            border: 'border-gold/20',
            dotBg: 'bg-gold',
            dotBorder: 'border-gold/30'
        }
    };

    const activeClasses = colorClasses[activeColor] || colorClasses.gold;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-between px-5 py-2 rounded-xl border transition-all duration-200 w-full hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isSelected
                ? `${activeClasses.bg} ${activeClasses.border}`
                : 'bg-[#F8F9FA] border-transparent hover:bg-gray-100'
                }`}
        >
            <span className={` text-[12px] ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
                ? `${activeClasses.dotBorder} ${activeColor === 'red' ? 'bg-red/20' : activeColor === 'orange' ? 'bg-orange-200' : activeColor === 'yellow' ? 'bg-yellow/20' : 'bg-gold/20'}`
                : 'border-gray-200 '
                }`}>
                {isSelected && <div className={`w-3 h-3 rounded-full ${activeClasses.dotBg}`} />}
            </div>
        </button>
    );
};

export default SeverityOption;
