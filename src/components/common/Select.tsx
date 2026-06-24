import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes safely
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string; // Additional classes for the container
    error?: string;
    required?: boolean;
    bgColor?: string;
    position?: 'top' | 'bottom';
}

export const Select: React.FC<SelectProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder = 'Select option',
    disabled = false,
    className,
    error,
    required,
    bgColor = 'bg-gray-50',
    position = 'bottom'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        if (disabled) return;
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
            {label && (
                <label className="text-xs font-bold text-gray-900">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    className={cn(
                        "relative w-full text-left border border-gray-200 rounded-xl py-2.5 px-3.5 flex items-center justify-between transition-all duration-200",
                        bgColor,
                        "hover:bg-gray-100 hover:border-gray-300",
                        "focus:outline-none focus:ring-2 focus:ring-gold-700/20 focus:border-gold-700",
                        isOpen && "border-gold-700 ring-2 ring-gold-700/20 bg-white",
                        disabled && "opacity-60 cursor-not-allowed hover:bg-gray-50",
                        error && "border-red-300 focus:border-red-500 focus:ring-red-200",
                        !selectedOption && "text-gray-500"
                    )}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className="block truncate text-xs font-medium">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-gray-500 transition-transform duration-200",
                            isOpen && "transform rotate-180"
                        )}
                    />
                </button>

                {isOpen && (
                    <div className={cn(
                        "absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100",
                        position === 'top' ? "bottom-full mb-2" : "mt-2"
                    )}>
                        <ul className="max-h-60 overflow-auto py-1 custom-scrollbar" role="listbox">
                            {options.map((option) => (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={option.value === value}
                                    className={cn(
                                        "relative px-3.5 py-2 text-xs cursor-pointer transition-colors duration-150 flex items-center justify-between",
                                        option.value === value
                                            ? "bg-gold-50 text-gold-800 font-medium"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <span className="block truncate">{option.label}</span>
                                    {option.value === value && (
                                        <Check className="w-4 h-4 text-gold-700" />
                                    )}
                                </li>
                            ))}
                            {options.length === 0 && (
                                <li className="px-4 py-3 text-sm text-gray-500 text-center">
                                    No options available
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500 animate-in slide-in-from-top-1 duration-200">
                    {error}
                </p>
            )}
        </div>
    );
};
