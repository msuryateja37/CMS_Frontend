import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    FileText,
    AlertCircle,
    Home,
    CheckCircle,
    ArrowRight
} from 'lucide-react';

const OHSInspections: React.FC = () => {
    const navigate = useNavigate();

    const forms = [
        {
            title: 'Disability Assessment Checklist',
            description: 'Evaluate workplace accommodations, structural accessibility, and specialized support for employees with physical or mental disabilities.',
            path: '/ohs/forms/disability',
            icon: FileText,
            color: 'border-l-blue-500 text-blue-500',
            bg: 'hover:border-blue-200'
        },
        {
            title: 'OHS Inspection Checklist',
            description: 'Conduct standard, recurring safety walk-throughs to verify fire safety, electrical hazard containment, ventilation, and emergency exits.',
            path: '/ohs/forms/inspection',
            icon: AlertCircle,
            color: 'border-l-amber-500 text-amber-500',
            bg: 'hover:border-amber-200'
        },
        {
            title: 'New Building Assessment Checklist',
            description: 'Perform a comprehensive hazard assessment on newly leased or purchased offices prior to occupation and staff deployment.',
            path: '/ohs/forms/building',
            icon: Home,
            color: 'border-l-purple-500 text-purple-500',
            bg: 'hover:border-purple-200'
        },
        {
            title: 'OHS Compliance Audit',
            description: 'Execute deep-dive regulatory compliance audits aligned with the national Occupational Health and Safety Act requirements.',
            path: '/ohs/forms/audit',
            icon: CheckCircle,
            color: 'border-l-gold text-gold',
            bg: 'hover:border-gold-200'
        }
    ];

    return (
        <DashboardLayout
            title="Inspections & Assessments"
            description="Select an OHS checklist or audit form to perform a safety inspection."
            breadcrumbs={[
                { label: 'OHS Dashboard', path: '/ohs/dashboard' },
                { label: 'Inspections' }
            ]}
        >
            <div className="max-w-6xl mx-auto py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {forms.map((form) => {
                        const Icon = form.icon;
                        return (
                            <div
                                key={form.path}
                                className={`bg-white rounded-2xl border-l-4 border border-gray-150 p-6 shadow-sm flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md ${form.color} ${form.bg}`}
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 rounded-xl bg-gray-50 shrink-0">
                                            <Icon size={22} />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 leading-snug">{form.title}</h3>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium mb-6">
                                        {form.description}
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => navigate(form.path)}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-brown hover:bg-opacity-95 text-white rounded-xl font-bold text-xs shadow-sm transition active:scale-[0.98] mt-auto"
                                >
                                    <span>Begin Assessment</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OHSInspections;
