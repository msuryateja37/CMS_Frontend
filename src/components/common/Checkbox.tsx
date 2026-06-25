import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, checked, ...props }, ref) => {
    return (
      <label 
        className={cn(
          "inline-flex items-start gap-3 cursor-pointer group select-none", 
          props.disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            checked={checked}
            {...props}
          />
          <div
            className={cn(
              "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
              checked 
                ? "bg-[#BB8F53] border-[#BB8F53]" 
                : "bg-white border-gray-300 group-hover:border-[#BB8F53]",
              "peer-focus:ring-2 peer-focus:ring-[#BB8F53]/20"
            )}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={cn(
                "transition-all duration-200 transform scale-100",
                checked ? "opacity-100" : "opacity-0 scale-75"
              )}
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        
        <div className="flex flex-col">
          {label && (
            <span className={cn(
              "text-sm font-medium transition-colors",
              checked ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"
            )}>
              {label}
            </span>
          )}
          {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
