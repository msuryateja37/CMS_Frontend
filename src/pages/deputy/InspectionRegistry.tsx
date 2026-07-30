import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/auth.store';
import { useIncidents } from '../../hooks/useIncidents';
import { ClipboardList, Eye } from 'lucide-react';
import { Pill } from '../../components/common/Pill';

interface InspectionData {
    id: string;
    inspectionId: string;
    type: string;
    location: string;
    province: string;
    inspector: string;
    date: string;
    period: 'Monthly' | 'Quarterly';
    status: 'Completed' | 'Pending Review';
    score: string;
}

const getProvinceSlug = (name: string): string => {
    switch (name) {
        case 'Eastern Cape': return 'EC';
        case 'Free State': return 'FS';
        case 'Gauteng': return 'GP';
        case 'KwaZulu-Natal': return 'KZN';
        case 'Limpopo': return 'LMP';
        case 'Mpumalanga': return 'MP';
        case 'Northern Cape': return 'NC';
        case 'North West': return 'NW';
        case 'Western Cape': return 'WC';
        case 'National Office': return 'National';
        default: return 'All';
    }
};



const InspectionRegistry: React.FC = () => {
    const { user } = useAuthStore();
    const [periodFilter, setPeriodFilter] = useState<'All' | 'Monthly' | 'Quarterly'>('All');
    const { data: casesData } = useIncidents({ take: 1000 });
    const cases = casesData?.data || [];

    const userProvince = user?.province?.name || '';
    const isNationalOffice = userProvince === 'National Office';
    const userSlug = getProvinceSlug(userProvince);

    // Filter inspections based on user's province and period toggle (generates dynamically from cases if exist)
    const filteredInspections = React.useMemo<InspectionData[]>(() => {
        const filledCases = cases.filter(c => Boolean(c.annexureOne));
        if (filledCases.length === 0) return [];

        const list = filledCases.map((c, idx) => {
            const pSlug = getProvinceSlug(c.building?.province?.name || '');
            const locName = c.building?.name || 'Main Office';
            const periodVal = (idx % 2 === 0) ? 'Monthly' : 'Quarterly';
            const scoreVal = (c.status === 'CLOSED') ? '92%' : '—';
            const statusVal = (c.status === 'CLOSED') ? 'Completed' : 'Pending Review';

            return {
                id: c.id,
                inspectionId: `INS-2026-${String(idx + 1).padStart(3, '0')}`,
                type: `${c.category ? (c.category.charAt(0).toUpperCase() + c.category.slice(1).toLowerCase()) : 'Safety'} Inspection`,
                location: locName,
                province: pSlug,
                inspector: c.reportedBy?.name || 'O. Practitioner',
                date: new Date(c.occurredAt || c.createdAt).toISOString().split('T')[0],
                period: periodVal as 'Monthly' | 'Quarterly',
                status: statusVal as 'Completed' | 'Pending Review',
                score: scoreVal
            };
        });

        let resultList = isNationalOffice 
            ? list 
            : list.filter(ins => ins.province === userSlug);

        if (periodFilter !== 'All') {
            resultList = resultList.filter(ins => ins.period === periodFilter);
        }

        return resultList;
    }, [cases, userSlug, isNationalOffice, periodFilter]);

    return (
        <DashboardLayout
            title="Inspection Registry"
            description="Track building safety and compliance inspections"
            breadcrumbs={[{ label: 'Inspection Registry', path: '/inspection-registry' }, { label: 'Overview' }]}
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
                <div className="py-4 px-5 border-b border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-brown flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-gold" />
                        Inspection Registry
                    </h3>

                    {/* Period Filters */}
                    <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                        {(['All', 'Monthly', 'Quarterly'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setPeriodFilter(filter)}
                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                                    periodFilter === filter
                                        ? 'bg-[#884616] text-white shadow'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-150">
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Inspection ID</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Inspector</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Period</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-400 text-center uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInspections.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-5 py-12 text-center text-gray-400 font-semibold text-sm">
                                        No inspections found
                                    </td>
                                </tr>
                            ) : (
                                filteredInspections.map((ins) => (
                                    <tr key={ins.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-xs font-mono font-bold text-gray-500">
                                            {ins.inspectionId}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">
                                            {ins.type}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-650">
                                            {ins.province} — {ins.location}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600">
                                            {ins.inspector}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500">
                                            {ins.date}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                ins.period === 'Monthly' 
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                                    : 'bg-purple-50 text-purple-700 border border-purple-100'
                                            }`}>
                                                {ins.period}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Pill
                                                label={ins.status}
                                                variant={ins.status === 'Completed' ? 'closed' : 'assigned'}
                                            />
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-gray-800">
                                            {ins.score}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-750 text-xs font-bold rounded-lg hover:bg-orange-100 transition">
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InspectionRegistry;
