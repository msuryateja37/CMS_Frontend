import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { MapPin, TrendingUp } from 'lucide-react';
import { useExecutiveData } from './useExecutiveData';

type Status = 'Compliant' | 'At Risk' | 'Non-Compliant';

interface ProvinceCompliance {
    name: string;
    pct: number;
    target: number;
    status: Status;
    incidents: number;
    open: number;
}

const SAMPLE_PROVINCES: ProvinceCompliance[] = [
    { name: 'Gauteng', pct: 85, target: 80, status: 'Compliant', incidents: 312, open: 18 },
    { name: 'Western Cape', pct: 91, target: 85, status: 'Compliant', incidents: 198, open: 7 },
    { name: 'KwaZulu-Natal', pct: 74, target: 80, status: 'At Risk', incidents: 221, open: 21 },
    { name: 'Free State', pct: 62, target: 75, status: 'Non-Compliant', incidents: 89, open: 14 },
    { name: 'Limpopo', pct: 70, target: 75, status: 'At Risk', incidents: 143, open: 12 },
    { name: 'Mpumalanga', pct: 77, target: 80, status: 'At Risk', incidents: 112, open: 9 },
    { name: 'North West', pct: 79, target: 80, status: 'At Risk', incidents: 98, open: 8 },
    { name: 'Eastern Cape', pct: 68, target: 75, status: 'At Risk', incidents: 76, open: 11 },
    { name: 'Northern Cape', pct: 72, target: 75, status: 'At Risk', incidents: 54, open: 6 },
    { name: 'National Office', pct: 88, target: 85, status: 'Compliant', incidents: 144, open: 3 },
];

const statusBadge = (s: Status) => {
    switch (s) {
        case 'Compliant': return 'bg-green-50 text-green-600';
        case 'Non-Compliant': return 'bg-subtle-red text-red';
        default: return 'bg-orange-50 text-orange-600';
    }
};

const barColor = (s: Status) => {
    switch (s) {
        case 'Compliant': return 'bg-green-500';
        case 'Non-Compliant': return 'bg-red';
        default: return 'bg-orange-400';
    }
};

const FILTERS: Array<'All' | Status> = ['All', 'Compliant', 'At Risk', 'Non-Compliant'];

const ChiefDirectorCompliance: React.FC = () => {
    const [filter, setFilter] = useState<'All' | Status>('All');
    const [selected, setSelected] = useState<ProvinceCompliance | null>(null);
    const { hasData: live, byProvince } = useExecutiveData();

    // Live per-province compliance where the DB has incidents, else sample.
    const PROVINCES: ProvinceCompliance[] = live && byProvince.some((p) => p.incidents > 0)
        ? byProvince.map((p) => ({
            name: p.name, pct: p.pct, target: p.target, status: p.status, incidents: p.incidents, open: p.open,
        }))
        : SAMPLE_PROVINCES;

    const compliant = PROVINCES.filter((p) => p.status === 'Compliant').length;
    const atRisk = PROVINCES.filter((p) => p.status === 'At Risk').length;
    const nonCompliant = PROVINCES.filter((p) => p.status === 'Non-Compliant').length;
    const average = Math.round(PROVINCES.reduce((sum, p) => sum + p.pct, 0) / PROVINCES.length);

    const visible = filter === 'All' ? PROVINCES : PROVINCES.filter((p) => p.status === filter);

    return (
        <DashboardLayout
            title="Provincial Compliance"
            description="DDG / Executive Management"
            breadcrumbs={[{ label: 'Dashboard', path: '/chief-director/dashboard' }, { label: 'Provincial Compliance' }]}
        >
            <div className="space-y-5">
                {/* Data source indicator */}
                <div className={`flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-lg w-fit ${live ? 'bg-green-50 text-green-700' : 'bg-light-yellow text-yellow'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500' : 'bg-yellow'}`} />
                    {live ? 'Compliance derived from live incident data' : 'Showing sample data — no incidents in the database yet'}
                </div>

                {/* National average header */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">National Compliance Average</span>
                            <div className="flex items-end gap-3 mt-1">
                                <span className="text-4xl font-black text-gray-800 leading-none">{average}%</span>
                                <span className="text-[11px] font-bold text-green-600 flex items-center gap-1 pb-1">
                                    <TrendingUp className="w-3.5 h-3.5" /> +5% vs Q2 · National target 80%
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <span className="text-2xl font-black text-green-600 block">{compliant}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Compliant</span>
                            </div>
                            <div className="text-center">
                                <span className="text-2xl font-black text-orange-500 block">{atRisk}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">At Risk</span>
                            </div>
                            <div className="text-center">
                                <span className="text-2xl font-black text-red block">{nonCompliant}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Non-Compliant</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-brown to-gold" style={{ width: `${average}%` }} />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
                                filter === f
                                    ? 'bg-brown text-white border-brown shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Province grid + detail */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {visible.map((p) => (
                            <button
                                key={p.name}
                                onClick={() => setSelected(p)}
                                className={`text-left bg-white rounded-2xl border shadow-sm p-4 transition-all ${
                                    selected?.name === p.name ? 'border-brown ring-1 ring-brown/20' : 'border-gray-150 hover:border-gold'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {p.name}
                                    </span>
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${statusBadge(p.status)}`}>{p.status}</span>
                                </div>
                                <div className="flex items-end gap-2 mt-2">
                                    <span className="text-2xl font-black text-gray-800 leading-none">{p.pct}%</span>
                                    <span className="text-[10px] text-gray-400 pb-0.5">Target: {p.target}%</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${barColor(p.status)}`} style={{ width: `${p.pct}%` }} />
                                </div>
                                <div className="flex items-center justify-between mt-3 text-[10px] font-medium text-gray-400">
                                    <span>{p.incidents} incidents YTD</span>
                                    <span>{p.open} open</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Detail panel */}
                    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 min-h-[220px]">
                        {selected ? (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-lg font-black text-gray-800">{selected.name}</h3>
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${statusBadge(selected.status)}`}>{selected.status}</span>
                                </div>
                                <span className="text-[11px] text-gray-400">Compliance detail</span>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <Stat label="Compliance" value={`${selected.pct}%`} />
                                    <Stat label="Target" value={`${selected.target}%`} />
                                    <Stat label="Incidents YTD" value={`${selected.incidents}`} />
                                    <Stat label="Open Cases" value={`${selected.open}`} />
                                </div>

                                <div className="mt-4 bg-subtle-grey rounded-xl p-3">
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">Gap to Target</span>
                                    <span className={`text-sm font-black mt-0.5 block ${selected.pct >= selected.target ? 'text-green-600' : 'text-red'}`}>
                                        {selected.pct >= selected.target ? `+${selected.pct - selected.target}%` : `${selected.pct - selected.target}%`}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <div className="w-12 h-12 rounded-full bg-subtle-grey flex items-center justify-center text-gray-300 mb-3">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-semibold text-gray-500">Select a province</p>
                                <p className="text-[11px] text-gray-400 mt-1">to view detailed compliance data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-subtle-grey rounded-xl p-3">
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block">{label}</span>
        <span className="text-lg font-black text-gray-800 mt-0.5 block">{value}</span>
    </div>
);

export default ChiefDirectorCompliance;
