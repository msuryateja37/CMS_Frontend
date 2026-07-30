import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Zap, Droplets, Building2, MapPin, Info, ChevronRight, Clock } from 'lucide-react';

const STATS = [
    { label: 'Power Outages (Active)', value: 2, icon: Zap, tint: 'text-yellow', bg: 'bg-light-yellow' },
    { label: 'Water Outages (Active)', value: 1, icon: Droplets, tint: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Facility Issues', value: 4, icon: Building2, tint: 'text-brown', bg: 'bg-light-gold' },
    { label: 'Offices Affected', value: 7, icon: MapPin, tint: 'text-gray-500', bg: 'bg-subtle-grey' },
];

interface InfraIncident {
    id: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    auto: boolean;
    category: string;
    title: string;
    description: string;
    status: 'Open' | 'Under Review' | 'Resolved';
    date: string;
    active: string;
    icon: React.ElementType;
}

const INCIDENTS: InfraIncident[] = [
    {
        id: 'INF-2026-0041', severity: 'Critical', auto: true, category: 'Power Outage',
        title: 'Limpopo — Polokwane District Office',
        description: 'Complete power outage affecting entire building. Backup generator failed after 4 hours. 87 employees displaced.',
        status: 'Open', date: '2026-07-07 08:14', active: '26h active', icon: Zap,
    },
    {
        id: 'INF-2026-0039', severity: 'High', auto: true, category: 'Power Outage',
        title: 'Mpumalanga — Mbombela Regional Office',
        description: 'Intermittent power supply disrupting operations. Eskom advised 48h restoration window.',
        status: 'Open', date: '2026-07-07 14:32', active: '10h active', icon: Zap,
    },
    {
        id: 'INF-2026-0037', severity: 'High', auto: true, category: 'Water Outage',
        title: 'North West — Mahikeng Provincial Office',
        description: 'No potable water supply. Municipality scheduled repairs. Portable water supplied.',
        status: 'Open', date: '2026-07-06 10:00', active: '36h active', icon: Droplets,
    },
    {
        id: 'INF-2026-0035', severity: 'Medium', auto: false, category: 'Facility Issue',
        title: 'Free State — Bloemfontein Head Office',
        description: 'Roof leak in records archive area. Risk of document damage. FMS engaged.',
        status: 'Under Review', date: '2026-07-05 09:22', active: '3d active', icon: Building2,
    },
    {
        id: 'INF-2026-0033', severity: 'Low', auto: false, category: 'Facility Issue',
        title: 'KwaZulu-Natal — Durban District Office',
        description: 'Lift out of service. Maintenance completed. Certificate renewed.',
        status: 'Resolved', date: '2026-07-03 13:45', active: 'Resolved', icon: Building2,
    },
];

const severityStyle = (s: string) => {
    switch (s) {
        case 'Critical': return 'bg-subtle-red text-red';
        case 'High': return 'bg-orange-50 text-orange-600';
        case 'Medium': return 'bg-light-yellow text-yellow';
        default: return 'bg-gray-100 text-gray-500';
    }
};

const statusStyle = (s: string) => {
    switch (s) {
        case 'Open': return 'text-red';
        case 'Under Review': return 'text-orange-500';
        case 'Resolved': return 'text-green-600';
        default: return 'text-gray-500';
    }
};

const ChiefDirectorInfrastructure: React.FC = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout
            title="Infrastructure Incidents"
            description="DDG / Executive Management"
            breadcrumbs={[{ label: 'Dashboard', path: '/chief-director/dashboard' }, { label: 'Infrastructure Incidents' }]}
        >
            <div className="space-y-5">
                {/* Auto-report banner */}
                <div className="flex items-start gap-2.5 bg-subtle-red/60 border border-red/15 rounded-xl px-4 py-3">
                    <Info className="w-4 h-4 text-red shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                        <span className="font-bold text-gray-800">BRS 4.3 Auto-Report Active:</span> Infrastructure incidents (power, water)
                        are automatically reported to DDG per notification matrix. Items marked <span className="font-bold">AUTO</span> were system-generated.
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {STATS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center ${s.tint} shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-gray-800 block leading-none">{s.value}</span>
                                    <span className="text-[11px] font-bold text-gray-400 mt-1.5 block">{s.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Incident list */}
                <div className="space-y-3">
                    {INCIDENTS.map((inc) => {
                        const Icon = inc.icon;
                        return (
                            <div key={inc.id} className="bg-white rounded-2xl border border-gray-150 shadow-sm p-5 flex gap-4 hover:border-gold transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-light-gold flex items-center justify-center text-brown shrink-0">
                                    <Icon className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-[10px] font-mono font-bold text-gray-400">{inc.id}</span>
                                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${severityStyle(inc.severity)}`}>{inc.severity}</span>
                                        {inc.auto && (
                                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">AUTO</span>
                                        )}
                                        <span className="text-[10px] font-semibold text-gray-400">{inc.category}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-800">{inc.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{inc.description}</p>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end justify-between">
                                    <span className={`text-xs font-extrabold ${statusStyle(inc.status)}`}>{inc.status}</span>
                                    <div className="mt-2">
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
                                            <Clock className="w-3 h-3" /> {inc.date}
                                        </span>
                                        <span className={`text-[10px] font-bold mt-0.5 block ${statusStyle(inc.status)}`}>{inc.active}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer action */}
                <div className="flex justify-end">
                    <button
                        onClick={() => navigate('/chief-director/escalations')}
                        className="flex items-center gap-1.5 bg-brown text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 transition shadow-md"
                    >
                        Review Escalation Reports <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChiefDirectorInfrastructure;
