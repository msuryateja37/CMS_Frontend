import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { ClipboardCheck, DollarSign, Users, Settings, Check, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

type DecisionState = 'Pending Approval' | 'Under Review' | 'Approved' | 'Deferred';

interface Decision {
    id: string;
    severity: 'Critical' | 'High' | 'Medium';
    tag: string;
    linked: string;
    title: string;
    requester: string;
    description: string;
    resource: string;
    deadline: string;
    state: DecisionState;
    icon: React.ElementType;
}

const INITIAL: Decision[] = [
    {
        id: 'DEC-2026-0018', severity: 'Critical', tag: 'Corrective Measure', linked: 'ESC-2026-0012',
        title: 'Emergency Equipment Audit — Gauteng', requester: 'Gauteng · Requested by OHS National Office',
        description: 'Mandatory audit of all mechanical equipment in all Gauteng district offices following serious hand injury incident. Includes replacement of non-compliant machinery.',
        resource: 'R 45,000 — Equipment Inspection Contractor', deadline: '2026-07-15', state: 'Pending Approval', icon: ClipboardCheck,
    },
    {
        id: 'DEC-2026-0017', severity: 'High', tag: 'Resource Allocation', linked: 'ESC-2026-0009',
        title: 'Asbestos Removal — Free State', requester: 'Free State · Requested by ASD OHS National Office',
        description: 'Emergency asbestos removal and building remediation at Bloemfontein Regional Office. Certified contractor required per OHS Act Regulations.',
        resource: 'R 180,000 — Certified Asbestos Abatement Contractor', deadline: '2026-07-20', state: 'Pending Approval', icon: DollarSign,
    },
    {
        id: 'DEC-2026-0016', severity: 'High', tag: 'Resource Allocation', linked: 'ESC-2026-0011',
        title: 'Defensive Driving Training — National', requester: 'All Provinces · Requested by OHS Practitioner: S. Naidoo',
        description: 'Mandatory defensive driving programme for all employees conducting official field travel. Covers 9 provinces + National Office. Linked to MVA escalation in KZN.',
        resource: 'R 62,000 — Accredited Training Provider', deadline: '2026-08-01', state: 'Under Review', icon: Users,
    },
    {
        id: 'DEC-2026-0014', severity: 'Medium', tag: 'Compliance Target', linked: 'ESC-2026-0007',
        title: 'Limpopo Provincial Compliance Target', requester: 'Limpopo · Requested by ASD OHS National Office',
        description: 'Set Q3 compliance target of 75% for Limpopo Province. Mandatory evacuation drill within 30 days. Monthly progress report to DDG until target achieved.',
        resource: 'No direct cost — Internal capacity', deadline: '2026-09-30', state: 'Approved', icon: Settings,
    },
];

const severityStyle = (s: string) => {
    switch (s) {
        case 'Critical': return 'bg-subtle-red text-red';
        case 'High': return 'bg-orange-50 text-orange-600';
        default: return 'bg-light-yellow text-yellow';
    }
};

const stateStyle = (s: DecisionState) => {
    switch (s) {
        case 'Approved': return 'text-green-600';
        case 'Deferred': return 'text-gray-500';
        case 'Under Review': return 'text-orange-500';
        default: return 'text-brown';
    }
};

const ChiefDirectorStrategicDecisions: React.FC = () => {
    const navigate = useNavigate();
    const [decisions, setDecisions] = useState<Decision[]>(INITIAL);

    const setState = (id: string, state: DecisionState) => {
        setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, state } : d)));
    };

    const pending = decisions.filter((d) => d.state === 'Pending Approval').length;
    const underReview = decisions.filter((d) => d.state === 'Under Review').length;

    const STATS = [
        { label: 'Pending Approval', value: pending, tint: 'text-brown', bg: 'bg-light-gold' },
        { label: 'Under Review', value: underReview, tint: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Approved This Quarter', value: 8, tint: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Budget Requested', value: 'R 287k', tint: 'text-brown', bg: 'bg-light-gold' },
    ];

    return (
        <DashboardLayout
            title="Strategic Decisions"
            description="DDG / Executive Management"
            breadcrumbs={[{ label: 'Dashboard', path: '/chief-director/dashboard' }, { label: 'Strategic Decisions' }]}
        >
            <div className="space-y-5">
                {/* Stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {STATS.map((s) => (
                        <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">{s.label}</span>
                            <span className={`text-3xl font-black mt-2 block ${s.label === 'Budget Requested' ? 'text-brown' : 'text-gray-800'}`}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Decision cards */}
                <div className="space-y-3">
                    {decisions.map((d) => {
                        const Icon = d.icon;
                        const isDecided = d.state === 'Approved' || d.state === 'Deferred';
                        return (
                            <div key={d.id} className="bg-white rounded-2xl border border-gray-150 shadow-sm p-5">
                                <div className="flex gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-light-gold flex items-center justify-center text-brown shrink-0">
                                        <Icon className="w-4.5 h-4.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-[10px] font-mono font-bold text-gray-400">{d.id}</span>
                                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${severityStyle(d.severity)}`}>{d.severity}</span>
                                            <span className="text-[10px] font-semibold text-gray-400">{d.tag}</span>
                                            <span className="text-[10px] text-gray-300">Linked: {d.linked}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-800">{d.title}</h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{d.requester}</p>
                                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{d.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`text-xs font-extrabold ${stateStyle(d.state)}`}>{d.state}</span>
                                        <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 justify-end">
                                            <Clock className="w-3 h-3" /> Deadline: {d.deadline}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <div className="bg-subtle-grey rounded-xl px-3 py-2">
                                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">Resources Required</span>
                                        <span className="text-xs font-bold text-gray-700 mt-0.5 block">{d.resource}</span>
                                    </div>
                                    {isDecided ? (
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${d.state === 'Approved' ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle2 className="w-4 h-4" /> {d.state}
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => setState(d.id, 'Deferred')}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition"
                                            >
                                                <Clock className="w-3.5 h-3.5" /> Defer
                                            </button>
                                            <button
                                                onClick={() => setState(d.id, 'Approved')}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brown text-white text-xs font-bold hover:bg-opacity-90 transition shadow-sm"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer action */}
                <div className="flex justify-end">
                    <button
                        onClick={() => navigate('/chief-director/compliance')}
                        className="flex items-center gap-1.5 bg-brown text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 transition shadow-md"
                    >
                        Monitor Provincial Compliance <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChiefDirectorStrategicDecisions;
