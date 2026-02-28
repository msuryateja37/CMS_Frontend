import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';

export interface SearchOption {
    value: string;
    label: string;
    secondaryLabel?: string; // Optional secondary text
    metadata?: Record<string, any>; // Additional data
}

export interface SearchInputProps {
    // Basic props
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;

    // Autocomplete/suggestions
    suggestions?: SearchOption[];
    onSuggestionSelect?: (option: SearchOption) => void;
    showSuggestions?: boolean;
    maxSuggestions?: number;

    // Filtering
    filterMode?: 'starts-with' | 'contains' | 'fuzzy';
    caseSensitive?: boolean;

    // Styling
    variant?: 'default' | 'compact' | 'bordered';
    iconPosition?: 'left' | 'right';
    clearable?: boolean;

    // Events
    onFocus?: () => void;
    onBlur?: () => void;
    onClear?: () => void;
    onEnter?: (value: string) => void;

    // Loading state
    loading?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    value = '',
    onChange,
    placeholder = 'Search...',
    className = '',
    disabled = false,
    suggestions = [],
    onSuggestionSelect,
    showSuggestions = true,
    maxSuggestions = 10,
    filterMode = 'contains',
    caseSensitive = false,
    variant = 'default',
    iconPosition = 'left',
    clearable = true,
    onFocus,
    onBlur,
    onClear,
    onEnter,
    loading = false,
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Filter suggestions based on input
    const filteredSuggestions = React.useMemo(() => {
        if (!inputValue.trim() || !showSuggestions) return [];

        const searchTerm = caseSensitive ? inputValue : inputValue.toLowerCase();

        const filtered = suggestions.filter((option) => {
            const optionLabel = caseSensitive ? option.label : option.label.toLowerCase();
            const optionValue = caseSensitive ? option.value : option.value.toLowerCase();

            switch (filterMode) {
                case 'starts-with':
                    return optionLabel.startsWith(searchTerm) || optionValue.startsWith(searchTerm);

                case 'fuzzy':
                    // Simple fuzzy matching - checks if all characters appear in order
                    let termIndex = 0;
                    for (let i = 0; i < optionLabel.length && termIndex < searchTerm.length; i++) {
                        if (optionLabel[i] === searchTerm[termIndex]) {
                            termIndex++;
                        }
                    }
                    return termIndex === searchTerm.length;

                case 'contains':
                default:
                    return optionLabel.includes(searchTerm) || optionValue.includes(searchTerm);
            }
        });

        return filtered.slice(0, maxSuggestions);
    }, [inputValue, suggestions, filterMode, caseSensitive, showSuggestions, maxSuggestions]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange?.(newValue);
        setHighlightedIndex(-1);
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (option: SearchOption) => {
        setInputValue(option.label);
        onChange?.(option.label);
        onSuggestionSelect?.(option);
        setIsFocused(false);
        setHighlightedIndex(-1);
    };

    // Handle clear
    const handleClear = () => {
        setInputValue('');
        onChange?.('');
        onClear?.();
        inputRef.current?.focus();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (filteredSuggestions.length === 0) {
            if (e.key === 'Enter') {
                onEnter?.(inputValue);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                );
                break;

            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;

            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
                } else {
                    onEnter?.(inputValue);
                }
                break;

            case 'Escape':
                setIsFocused(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle focus
    const handleFocus = () => {
        setIsFocused(true);
        onFocus?.();
    };

    // Handle blur
    const handleBlur = () => {
        // Delay to allow click on suggestion
        setTimeout(() => {
            setIsFocused(false);
            setHighlightedIndex(-1);
            onBlur?.();
        }, 200);
    };

    // Highlight matching text
    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text;

        const searchTerm = caseSensitive ? query : query.toLowerCase();
        const targetText = caseSensitive ? text : text.toLowerCase();
        const index = targetText.indexOf(searchTerm);

        if (index === -1) return text;

        return (
            <>
                {text.substring(0, index)}
                <span className="font-bold text-green bg-green/10 px-0.5 rounded">
                    {text.substring(index, index + query.length)}
                </span>
                {text.substring(index + query.length)}
            </>
        );
    };

    const showDropdown = isFocused && filteredSuggestions.length > 0;

    // Variant styles
    const variantStyles = {
        default: 'bg-subtle-grey border-none',
        compact: 'bg-white border border-semi-subtle-grey',
        bordered: 'bg-white border-2 border-gray-200 focus-within:border-green',
    };

    return (
        <div className={clsx('relative', className)}>
            <div
                className={clsx(
                    'relative flex items-center rounded-lg transition-all',
                    variantStyles[variant],
                    isFocused && variant === 'default' && 'ring-1 ring-green',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                {/* Search Icon - Left */}
                {iconPosition === 'left' && (
                    <Search
                        className={clsx(
                            'absolute left-3 text-light-grey transition-colors',
                            isFocused && 'text-green'
                        )}
                        size={16}
                    />
                )}

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={clsx(
                        'w-full py-2 text-sm bg-transparent focus:outline-none',
                        iconPosition === 'left' && 'pl-9 pr-4',
                        iconPosition === 'right' && 'pl-4 pr-9',
                        clearable && inputValue && 'pr-16'
                    )}
                />

                {/* Loading Spinner */}
                {loading && (
                    <div className="absolute right-3">
                        <div className="w-4 h-4 border-2 border-green border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Clear Button */}
                {clearable && inputValue && !loading && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 p-1 text-light-grey hover:text-dark-green transition-colors rounded-full hover:bg-semi-subtle-grey"
                        type="button"
                        tabIndex={-1}
                    >
                        <X size={14} />
                    </button>
                )}

                {/* Search Icon - Right */}
                {iconPosition === 'right' && !clearable && !loading && (
                    <Search
                        className={clsx(
                            'absolute right-3 text-light-grey transition-colors',
                            isFocused && 'text-green'
                        )}
                        size={16}
                    />
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-2 bg-white border border-semi-subtle-grey rounded-xl shadow-lg max-h-64 overflow-y-auto custom-scrollbar"
                >
                    {filteredSuggestions.map((option, index) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelectSuggestion(option)}
                            className={clsx(
                                'w-full px-4 py-3 text-left transition-colors flex flex-col',
                                index === highlightedIndex
                                    ? 'bg-green/10 text-dark-green'
                                    : 'hover:bg-subtle-grey text-dark-grey',
                                index === 0 && 'rounded-t-xl',
                                index === filteredSuggestions.length - 1 && 'rounded-b-xl'
                            )}
                            type="button"
                            tabIndex={-1}
                        >
                            <span className="text-sm font-medium">
                                {highlightMatch(option.label, inputValue)}
                            </span>
                            {option.secondaryLabel && (
                                <span className="text-xs text-light-grey mt-0.5">
                                    {option.secondaryLabel}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchInput;
