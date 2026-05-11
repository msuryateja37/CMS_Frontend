import React from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

interface Step {
    label: string;
    number: number;
}

interface InvoiceStepperProps {
    currentStep: number;
    steps?: Step[];
}

const DEFAULT_STEPS: Step[] = [
    { label: 'Identification', number: 1 },
    { label: 'Utilities', number: 2 },
    { label: 'BAS Allocation', number: 3 },
    { label: 'Sign-off', number: 4 },
];

const InvoiceStepper: React.FC<InvoiceStepperProps> = ({ currentStep, steps = DEFAULT_STEPS }) => {
    return (
        <div className="flex items-center justify-center w-full mb-8">
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                const isUpcoming = currentStep < step.number;

                return (
                    <React.Fragment key={step.number}>
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={clsx(
                                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                                    isCompleted && 'bg-dark-green text-white',
                                    isCurrent && 'bg-dark-green text-white ring-4 ring-dark-green/20',
                                    isUpcoming && 'bg-gray-200 text-gray-500'
                                )}
                            >
                                {isCompleted ? <Check size={18} strokeWidth={3} /> : step.number}
                            </div>
                            <span
                                className={clsx(
                                    'text-xs font-semibold whitespace-nowrap',
                                    (isCompleted || isCurrent) ? 'text-dark-green' : 'text-gray-400'
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-3 mt-[-1.5rem]">
                                <div className="h-[3px] rounded-full bg-gray-200 overflow-hidden">
                                    <div
                                        className={clsx(
                                            'h-full rounded-full transition-all duration-500',
                                            isCompleted ? 'bg-dark-green w-full' : 'w-0'
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default InvoiceStepper;
