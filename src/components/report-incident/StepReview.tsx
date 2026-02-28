import React from 'react';
import { FileText, AlertTriangle, Users } from 'lucide-react';
import { INCIDENT_CATEGORIES } from '../../data/constants';

interface StepProps {
    data: any;
    onBack: () => void;
    onSubmit: () => void;
    submitting: boolean;
    onSaveDraft?: () => void;
    onDiscard?: () => void;
}

const StepReview: React.FC<StepProps> = ({ data, onBack, onSubmit, submitting, onSaveDraft, onDiscard }) => {
    const category = INCIDENT_CATEGORIES.find(c => c.id === data.categoryId);

    const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center gap-2 mb-4 text-[#0D9488]">
            <Icon size={20} />
            <h4 className="text-lg font-bold">{title}</h4>
        </div>
    );

    const DetailItem = ({ label, value, fullWidth = false }: { label: string, value: React.ReactNode, fullWidth?: boolean }) => (
        <div className={`${fullWidth ? 'col-span-2 md:col-span-3' : 'col-span-1'}`}>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
            <div className="text-gray-900 font-medium mt-1">{value || 'N/A'}</div>
        </div>
    );

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <span className="text-sm font-bold text-gray-400 mb-1 block">Step 5/5</span>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Review & Submit</h3>
                <p className="text-gray-500">Please review all details carefully before submitting.</p>
            </div>

            <div className="bg-white border boundary-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Step 1: Incident Type */}
                <div className="p-8">
                    <SectionHeader icon={AlertTriangle} title="Incident Type" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DetailItem label="Selected Category" value={category?.name} />
                    </div>
                </div>
                <div className="h-[1px] bg-gray-100 w-full" />

                {/* Step 2: Basic Info */}
                <div className="p-8">
                    <SectionHeader icon={FileText} title="Basic Information" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DetailItem label="Severity Level" value={
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                ${data.severityLevel?.toLowerCase() === 'critical' ? 'bg-subtle-red text-red' :
                                    data.severityLevel?.toLowerCase() === 'high' ? 'bg-orange-50 text-orange-700' :
                                        data.severityLevel?.toLowerCase() === 'medium' ? 'bg-light-yellow text-[#854D0E]' :
                                            'bg-light-green text-dark-green'}`}>
                                {data.severityLevel || 'medium'}
                            </span>
                        } />
                        <DetailItem label="Date & Time" value={data.occurredAt ? new Date(data.occurredAt).toLocaleString() : 'N/A'} />
                        <DetailItem label="Province" value={data.provinceName || data.provinceId || 'N/A'} />
                        <DetailItem label="Building" value={data.buildingName || data.buildingId || 'N/A'} />
                        <DetailItem label="Location Description" value={data.location} fullWidth />

                        {data.immediateActions && data.immediateActions.length > 0 && (
                            <DetailItem label="Immediate Actions Taken" value={
                                <ul className="list-disc list-inside">
                                    {data.immediateActions.map((action: string, idx: number) => (
                                        <li key={idx}>{action}</li>
                                    ))}
                                </ul>
                            } fullWidth />
                        )}

                        {data.otherActions && (
                            <DetailItem label="Other Actions" value={data.otherActions} fullWidth />
                        )}
                    </div>
                </div>
                <div className="h-[1px] bg-gray-100 w-full" />

                {/* Step 3: People & Impact */}
                <div className="p-8">
                    <SectionHeader icon={Users} title="People & Impact" />
                    <div className="space-y-6">
                        <DetailItem label="Impact Description" value={data.description} fullWidth />

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Impacted People</label>
                            {data.impactedPeople && data.impactedPeople.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.impactedPeople.map((person: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                                            <p className="font-bold text-gray-800">{person.name}</p>
                                            <p className="text-gray-500">{person.email}</p>
                                            <p className="text-gray-500">{person.phone}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No people added.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="h-[1px] bg-gray-100 w-full" />

                {/* Step 4: Attachments */}
                <div className="p-8 bg-gray-50">
                    <SectionHeader icon={FileText} title="Attachments" />
                    {data.attachments && data.attachments.length > 0 ? (
                        <ul className="space-y-2">
                            {data.attachments.map((file: File, idx: number) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                                    <span className="w-2 h-2 rounded-full bg-green flex-shrink-0"></span>
                                    {file.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic">No attachments uploaded.</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                <div className="flex gap-8">
                    <button
                        onClick={() => onSaveDraft && onSaveDraft()}
                        className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={onDiscard}
                        className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                        Discard
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        disabled={submitting}
                        className="px-8 py-2.5 bg-light-green rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={submitting}
                        className="px-8 py-2.5 bg-[#0D9488] text-white rounded-lg font-bold shadow-sm hover:bg-[#0f766e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Incident Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepReview;
