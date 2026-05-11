import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill } from '../common/Pill';
import { ArrowLeft, FileText, Building2, Landmark, ShieldCheck } from 'lucide-react';
import InvoiceStepper from './InvoiceStepper';
import StepIdentification from './StepIdentification';
import StepUtilities from './StepUtilities';
import StepBASAllocation from './StepBASAllocation';
import StepSignOff from './StepSignOff';
import type { InvoiceRecord } from '../../data/invoiceMockData';

interface InvoiceDetailProps {
    invoice: InvoiceRecord;
    basePath: string;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, basePath }) => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(invoice.currentStep || 1);

    const renderStep = () => {
        switch (activeStep) {
            case 1: return <StepIdentification invoice={invoice} />;
            case 2: return <StepUtilities invoice={invoice} />;
            case 3: return <StepBASAllocation invoice={invoice} />;
            case 4: return <StepSignOff invoice={invoice} onSubmit={() => navigate(basePath)} onBack={() => setActiveStep(3)} />;
            default: return <StepIdentification invoice={invoice} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(basePath)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-dark-green transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Invoices
                </button>
                <Pill label={invoice.status} variant={invoice.status.toLowerCase()} />
            </div>

            {/* Invoice summary card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-light-green rounded-xl flex items-center justify-center">
                            <FileText size={22} className="text-dark-green" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h2>
                            <p className="text-sm text-gray-500">{invoice.landlordName} • {invoice.billingMonth}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-2xl font-bold text-dark-green">
                            R {invoice.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <InvoiceStepper currentStep={activeStep} />

            {/* Step content */}
            <div>{renderStep()}</div>

            {/* Step navigation */}
            {activeStep < 4 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                        disabled={activeStep === 1}
                        className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ← Back
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                            Save Draft
                        </button>
                        <button
                            onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
                            className="flex items-center gap-2 px-6 py-3 bg-dark-green text-white text-sm font-bold rounded-xl hover:bg-dark-green/90 transition-all shadow-sm"
                        >
                            {activeStep === 3 ? 'Next: Sign-Offs' : activeStep === 2 ? 'Next: BAS Allocation' : 'Next: Utilities'}
                            <span>→</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetail;
