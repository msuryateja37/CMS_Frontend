import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import InvoiceList from '../../components/invoice/InvoiceList';
import InvoiceDetail from '../../components/invoice/InvoiceDetail';
import InvoiceUpload from '../../components/invoice/InvoiceUpload';
import InvoiceStepper from '../../components/invoice/InvoiceStepper';
import StepIdentification from '../../components/invoice/StepIdentification';
import StepUtilities from '../../components/invoice/StepUtilities';
import StepBASAllocation from '../../components/invoice/StepBASAllocation';
import StepSignOff from '../../components/invoice/StepSignOff';
import { MOCK_INVOICES } from '../../data/invoiceMockData';

const SupervisorInvoiceList: React.FC = () => {
    return (
        <DashboardLayout
            title="Invoice Management"
            description="Manage utility invoices and dossier submissions"
            breadcrumbs={[
                { label: 'Dashboard', path: '/supervisor/dashboard' },
                { label: 'Invoice Management' },
            ]}
        >
            <InvoiceList role="supervisor" />
        </DashboardLayout>
    );
};

const SupervisorInvoiceNew: React.FC = () => {
    const navigate = useNavigate();
    const [uploaded, setUploaded] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    // Use first mock invoice as the "extracted" data after upload
    const sampleInvoice = MOCK_INVOICES[0];

    const stepLabels: Record<number, string> = {
        1: 'Next: Utilities',
        2: 'Next: BAS Allocation',
        3: 'Next: Sign-Offs',
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <InvoiceUpload onUploadComplete={() => setUploaded(true)} />
                        {uploaded && <StepIdentification invoice={sampleInvoice} />}
                    </>
                );
            case 2:
                return <StepUtilities invoice={sampleInvoice} />;
            case 3:
                return <StepBASAllocation invoice={sampleInvoice} />;
            case 4:
                return <StepSignOff invoice={sampleInvoice} onSubmit={() => navigate('/supervisor/invoices')} onBack={() => setCurrentStep(3)} />;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout
            title="New Invoice"
            description="Upload and process a new utility invoice"
            breadcrumbs={[
                { label: 'Dashboard', path: '/supervisor/dashboard' },
                { label: 'Invoice Management', path: '/supervisor/invoices' },
                { label: 'New Invoice' },
            ]}
        >
            <div className="space-y-6">
                <InvoiceStepper currentStep={currentStep} />

                {renderStepContent()}

                {/* Step navigation — show for steps 1-3 (step 4 has its own submit button) */}
                {currentStep < 4 && (uploaded || currentStep > 1) && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            ← Back
                        </button>
                        <div className="flex items-center gap-3">
                            <button className="px-5 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                Save Draft
                            </button>
                            <button
                                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                                className="flex items-center gap-2 px-6 py-3 bg-brown text-white text-sm font-bold rounded-xl hover:bg-brown/90 transition-all shadow-sm"
                            >
                                {stepLabels[currentStep] || 'Next'} →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

const SupervisorInvoiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const invoice = MOCK_INVOICES.find(inv => inv.id === id) || MOCK_INVOICES[0];

    return (
        <DashboardLayout
            title={`Invoice #${invoice.invoiceNumber}`}
            description={invoice.landlordName}
            breadcrumbs={[
                { label: 'Dashboard', path: '/supervisor/dashboard' },
                { label: 'Invoice Management', path: '/supervisor/invoices' },
                { label: `Invoice #${invoice.invoiceNumber}` },
            ]}
        >
            <InvoiceDetail invoice={invoice} basePath="/supervisor/invoices" />
        </DashboardLayout>
    );
};

export { SupervisorInvoiceList, SupervisorInvoiceNew, SupervisorInvoiceDetail };
