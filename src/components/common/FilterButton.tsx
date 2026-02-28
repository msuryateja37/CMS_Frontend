import React from 'react';

interface FilterButtonProps {
    label: string;
    icon: React.ReactNode;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, icon }) => (
    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap">
        {label} <span className="text-xs">{icon}</span>
    </button>
);

export default FilterButton;
