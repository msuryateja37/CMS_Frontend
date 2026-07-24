import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StepIncidentType from '../../components/report-incident/StepIncidentType';
import StepBasicInfo from '../../components/report-incident/StepBasicInfo';
import StepPeopleImpact from '../../components/report-incident/StepPeopleImpact';
import StepAttachment from '../../components/report-incident/StepAttachment';
import StepReview from '../../components/report-incident/StepReview';
import casesService from '../../services/cases.service';
import { useAuthStore } from '../../store/auth.store';
import { Check } from 'lucide-react';
import { INCIDENT_CATEGORIES } from '../../data/constants';

const steps = [
    { id: 1, label: 'Incident type' },
    { id: 2, label: 'Basic Info' },
    { id: 3, label: 'Attachments' },
    { id: 4, label: 'Review' }
];

interface Person {
    id: string;
    name: string;
    phone: string;
    email: string;
}

interface FormData {
    type: string;
    categoryId?: string;
    categoryName?: string;
    severity?: string;
    severityLevel?: string;
    priorityLevel?: string;
    description?: string;
    occurredAt?: string;
    location?: string;
    buildingId?: string;
    buildingName?: string;
    departmentId?: string;
    provinceId?: string;
    provinceName?: string;
    peopleImpacted?: number;
    impactedPeople?: Person[];
    attachments?: File[];
    media?: Array<{ url: string; type: string; name: string }>;
    immediateActions?: string[];
    otherActions?: string;
    latitude?: string;
    longitude?: string;
    id: string;
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const SubmitCase: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        id: generateId(),
        type: 'INCIDENT',
        impactedPeople: []
    });
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const mainContent = document.getElementById('dashboard-main-content');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo(0, 0); // Fallback
    }, [step]);

    const updateFormData = (data: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Prepare the case data
            const caseData: any = {
                id: formData.id,
                type: formData.type,
                categoryId: formData.categoryId,
                severity: formData.severity,
                severityLevel: formData.severityLevel,
                priorityLevel: formData.priorityLevel,
                description: formData.description,
                occurredAt: formData.occurredAt,
                location: formData.location,
                buildingId: formData.buildingId || user?.department?.building?.id,
                departmentId: formData.departmentId || user?.department?.id,
                provinceId: formData.provinceId || user?.department?.building?.province?.id,
                peopleImpacted: formData.impactedPeople?.length || 0,
                impactedPeople: formData.impactedPeople,
                immediateActions: formData.immediateActions,
                otherActions: formData.otherActions,
                latitude: formData.latitude,
                longitude: formData.longitude,
                media: formData.media,
            };

            // Create case via API
            const newCase = await casesService.createCase(caseData);

            navigate('/supervisor/submit-case/success', {
                state: {
                    caseId: newCase.id,
                    caseNumber: newCase.incidentNumber
                }
            });
        } catch (error: any) {
            console.error('Error submitting incident:', error);
            alert(error.response?.data?.message || 'Failed to submit incident. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="Submit New Incident" description="Submit New Incident" breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "Submit Incident" }]}>
            <div className="max-w-[1400px] mx-auto px-4 py-8 relative">
                {/* Stepper Section with Centered Navigation */}
                <div className="flex items-center justify-center mb-12 ">
                    <div className="flex items-center">
                        {steps.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <div className="flex flex-col items-center relative group">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 z-10 ${step === s.id
                                            ? 'bg-[#1F2937] text-white ring-4 ring-gray-100'
                                            : step > s.id
                                                ? 'bg-[#BB8F53] text-white'
                                                : 'bg-[#E5E7EB] text-white'
                                            }`}
                                    >
                                        {step > s.id ? (
                                            <Check size={20} strokeWidth={3} />
                                        ) : s.id}
                                    </div>
                                    <span className={`absolute -bottom-8 whitespace-nowrap text-xs font-semibold tracking-tight ${step === s.id ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="w-16 lg:w-20 h-[2px] bg-[#E5E7EB] mx-0 mt-[-2px] z-0">
                                        <div
                                            className="h-full bg-[#BB8F53] transition-all duration-500"
                                            style={{ width: step > s.id ? '100%' : '0%' }}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-12 mt-4 min-h-[600px] overflow-hidden">
                    {step === 1 && (
                        <StepIncidentType
                            excludeCategoryIds={['security']}
                            selected={formData.categoryId}
                            onSelect={(categoryId, type) => {
                                const cat = INCIDENT_CATEGORIES.find(c => c.id === categoryId);

                                // Only reset if category is different
                                if (formData.categoryId && formData.categoryId !== categoryId) {
                                    setFormData({
                                        id: generateId(),
                                        type: type,
                                        categoryId,
                                        categoryName: cat?.name,
                                        severity: undefined,
                                        severityLevel: undefined,
                                        priorityLevel: undefined,
                                        description: '',
                                        occurredAt: '',
                                        location: '',
                                        buildingId: undefined,
                                        departmentId: undefined,
                                        provinceId: undefined,
                                        peopleImpacted: undefined,
                                        impactedPeople: [],
                                        attachments: [],
                                        media: [],
                                        immediateActions: [],
                                        otherActions: ''
                                    });
                                } else {
                                    updateFormData({ categoryId, type, categoryName: cat?.name });
                                }
                                setStep(2);
                            }}
                        />
                    )}
                    {step === 2 && (
                        <StepBasicInfo
                            key={formData.categoryId}
                            data={formData}
                            onChange={updateFormData}
                            onBack={() => setStep(1)}
                            onNext={() => setStep(3)}
                            categoryName={formData.categoryName}
                        />
                    )}
                    {step === 3 && (
                        <StepAttachment
                            data={formData}
                            onChange={updateFormData}
                            onBack={() => setStep(2)}
                            onNext={() => setStep(4)}
                            categoryName={formData.categoryName}
                        />
                    )}
                    {step === 4 && (
                        <StepReview
                            data={formData}
                            onBack={() => setStep(3)}
                            onSubmit={handleSubmit}
                            submitting={submitting}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SubmitCase;
