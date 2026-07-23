import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { MapPin, Clock, ChevronRight, AlertTriangle, FileText } from 'lucide-react';
import { useExecutiveData } from './useExecutiveData';
import { getStatusLabel } from '../../data/constants';
import type { Case } from '../../services/cases.service';

interface Escalation {
    id: string;
    type: string;
    severity: 'Critical' | 'High' | 'Medium';
    province: string;
    office: string;
    stage: string;
    date: string;
    summary: string;
}

const titleCase = (s?: string) =>
    (s || '').split(/[_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

const mapSeverity = (s?: string): Escalation['severity'] => {
    const v = (s || '').toLowerCase();
    if (v === 'critical') return 'Critical';
    if (v === 'high') return 'High';
    return 'Medium';
};

const caseToEscalation = (c: Case): Escalation => ({
    id: c.incidentNumber,
    type: titleCase(c.category || c.type) || 'Escalated Incident',
    severity: mapSeverity(c.severity),
    province: c.building?.province?.name || 'National Office',
    office: c.building?.name || '—',
    stage: getStatusLabel(c.status) || 'Awaiting DDG Decision',
    date: new Date(c.occurredAt || c.createdAt).toISOString().split('T')[0],
    summary: c.description || 'Escalated for executive review. No further detail provided.',
});

const SAMPLE_ESCALATIONS: Escalation[] = [
    {
        id: 'ESC-2026-0012', type: 'IOD — Serious Injury', severity: 'Critical',
        province: 'Gauteng', office: 'Pretoria Head Office', stage: 'Awaiting DDG Decision', date: '2026-07-07',
        summary: 'Serious injury on duty involving mechanical equipment. Employee hospitalised. OHS investigation complete; corrective measures and equipment audit escalated for DDG approval.',
    },
    {
        id: 'ESC-2026-0011', type: 'IOD — MVA', severity: 'High',
        province: 'KwaZulu-Natal', office: 'Durban District Office', stage: 'Awaiting DDG Decision', date: '2026-07-06',
        summary: 'Motor vehicle accident during official field travel. Defensive driving programme recommended nationally. Awaiting executive decision on rollout.',
    },
    {
        id: 'ESC-2026-0009', type: 'Environmental Hazard', severity: 'High',
        province: 'Free State', office: 'Bloemfontein Regional Office', stage: 'Under DDG Review', date: '2026-07-05',
        summary: 'Asbestos exposure risk identified during building remediation. Certified abatement contractor required per OHS Act Regulations.',
    },
    {
        id: 'ESC-2026-0007', type: 'Non-Compliance', severity: 'Medium',
        province: 'Limpopo', office: 'Polokwane District Office', stage: 'Decision Pending', date: '2026-07-02',
        summary: 'Provincial compliance below target. Mandatory evacuation drill and monthly progress reporting proposed to bring office to standard.',
    },
];

const severityStyle = (s: string) => {
    switch (s) {
        case 'Critical': return 'bg-subtle-red text-red';
        case 'High': return 'bg-orange-50 text-orange-600';
        default: return 'bg-light-yellow text-yellow';
    }
};

const ChiefDirectorEscalations: React.FC = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<Escalation | null>(null);
    const { hasData, escalatedCases } = useExecutiveData();

    const live = hasData && escalatedCases.length > 0;
    const escalations: Escalation[] = live ? escalatedCases.map(caseToEscalation) : SAMPLE_ESCALATIONS;

    const FILTERS = [
        { label: 'Critical', count: escalations.filter((e) => e.severity === 'Critical').length, tone: 'text-red' },
        { label: 'High', count: escalations.filter((e) => e.severity === 'High').length, tone: 'text-orange-600' },
        { label: 'Medium', count: escalations.filter((e) => e.severity === 'Medium').length, tone: 'text-yellow' },
        { label: 'Awaiting Decision', count: escalations.length, tone: 'text-brown' },
    ];

    return (
        <DashboardLayout
            title="Escalation Reports"
            description="DDG / Executive Management"
            breadcrumbs={[{ label: 'Dashboard', path: '/chief-director/dashboard' }, { label: 'Escalation Reports' }]}
        >
            <div className="space-y-5">
                {/* Data source indicator */}
                <div className={`flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-lg w-fit ${live ? 'bg-green-50 text-green-700' : 'bg-light-yellow text-yellow'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500' : 'bg-yellow'}`} />
                    {live ? 'Showing live escalated incidents from the database' : 'Showing sample data — no escalated incidents in the database yet'}
                </div>

                {/* Filter chips */}
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <div key={f.label} className="flex items-center gap-1.5 bg-white border border-gray-150 rounded-full px-3.5 py-1.5 shadow-sm">
                            <span className={`text-sm font-black ${f.tone}`}>{f.count}</span>
                            <span className="text-xs font-semibold text-gray-500">{f.label}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left: list */}
                    <div className="space-y-3">
                        {escalations.map((esc) => (
                            <button
                                key={esc.id}
                                onClick={() => setSelected(esc)}
                                className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 transition-all ${
                                    selected?.id === esc.id ? 'border-brown ring-1 ring-brown/20' : 'border-gray-150 hover:border-gold'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <span className="text-[10px] font-mono font-bold text-gray-400">{esc.id}</span>
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${severityStyle(esc.severity)}`}>{esc.severity}</span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 mt-1.5">{esc.type}</h4>
                                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {esc.province} — {esc.office}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-[10px] font-bold text-brown bg-light-gold px-2 py-0.5 rounded">{esc.stage}</span>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {esc.date}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Right: detail panel */}
                    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 min-h-[300px]">
                        {selected ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[11px] font-mono font-bold text-gray-400">{selected.id}</span>
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${severityStyle(selected.severity)}`}>{selected.severity}</span>
                                </div>
                                <h3 className="text-lg font-black text-gray-800">{selected.type}</h3>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {selected.province} — {selected.office}
                                </p>

                                <div className="grid grid-cols-2 gap-3 mt-5">
                                    <div className="bg-subtle-grey rounded-xl p-3">
                                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">Stage</span>
                                        <span className="text-xs font-bold text-gray-700 mt-1 block">{selected.stage}</span>
                                    </div>
                                    <div className="bg-subtle-grey rounded-xl p-3">
                                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">Date Escalated</span>
                                        <span className="text-xs font-bold text-gray-700 mt-1 block">{selected.date}</span>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block mb-1.5">Summary</span>
                                    <p className="text-xs text-gray-600 leading-relaxed">{selected.summary}</p>
                                </div>

                                <button
                                    onClick={() => navigate('/chief-director/strategic-decisions')}
                                    className="mt-6 w-full flex items-center justify-center gap-1.5 bg-brown text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 transition shadow-md"
                                >
                                    Proceed to Strategic Decision <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <div className="w-12 h-12 rounded-full bg-subtle-grey flex items-center justify-center text-gray-300 mb-3">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-semibold text-gray-500">Select an escalation report to view details</p>
                                <p className="text-[11px] text-gray-400 mt-1">Click any item on the left</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer action */}
                <div className="flex justify-end">
                    <button
                        onClick={() => navigate('/chief-director/strategic-decisions')}
                        className="flex items-center gap-1.5 bg-brown text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 transition shadow-md"
                    >
                        <FileText className="w-4 h-4" /> Make Strategic Decisions <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChiefDirectorEscalations;
