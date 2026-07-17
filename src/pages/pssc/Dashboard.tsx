import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/auth.store';
import { useIncidents } from '../../hooks/useIncidents';
import {
    Folder, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Users, 
    Eye 
} from 'lucide-react';

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

// Status Label formatting helper
const getCustomStatusStyle = (status: string) => {
    switch (status) {
        case 'UNDER_PSSC_RECOMMENDATION':
        case 'UNDER_DEP_DIRECTOR_RECOMMENDATION':
        case 'UNDER_DIRECTOR_RECOMMENDATION':
        case 'DIRECTOR_APPROVAL':
            return 'bg-blue-50 text-blue-700 border border-blue-150';
        case 'CLOSED':
        case 'RESOLVED':
            return 'bg-green-50 text-green-700 border border-green-150';
        case 'OPEN':
        case 'SUBMITTED':
            return 'bg-amber-50 text-amber-700 border border-amber-150';
        case 'ASSIGNED':
        case 'IN_PROGRESS':
            return 'bg-indigo-50 text-indigo-700 border border-indigo-150';
        default:
            return 'bg-gray-50 text-gray-700 border border-gray-150';
    }
};

const getCustomStatusLabel = (status: string) => {
    switch (status) {
        case 'UNDER_PSSC_RECOMMENDATION':
            return 'UNDER PSSC RECOMMENDATION';
        case 'UNDER_DEP_DIRECTOR_RECOMMENDATION':
            return 'UNDER DEP DIRECTOR RECOMMENDATION';
        case 'UNDER_DIRECTOR_RECOMMENDATION':
            return 'UNDER DIRECTOR RECOMMENDATION';
        case 'DIRECTOR_APPROVAL':
            return 'DIRECTOR APPROVAL';
        case 'CLOSED':
            return 'Closed';
        case 'RESOLVED':
            return 'Resolved';
        case 'NEW':
        case 'UNASSIGNED':
        case 'OPEN':
        case 'SUBMITTED':
            return 'Open';
        case 'ASSIGNED':
            return 'Assigned';
        case 'IN_PROGRESS':
            return 'In Progress';
        default:
            return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }
};

const PROVINCE_MAP: Record<string, string> = {
    'GP': 'Gauteng',
    'WC': 'Western Cape',
    'KZN': 'KwaZulu-Natal',
    'FS': 'Free State',
    'LMP': 'Limpopo',
    'MP': 'Mpumalanga',
    'EC': 'Eastern Cape',
    'NC': 'Northern Cape',
    'NW': 'North West',
    'National': 'National Office'
};

const PssCDeputyDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [selectedProvSlug, setSelectedProvSlug] = useState('All');

    const userProvince = user?.province?.name || '';
    const isNationalOffice = userProvince === 'National Office';
    const userRole = user?.role?.name?.toLowerCase().replace(/\s+/g, '_');

    const { data: casesData, isLoading: loading } = useIncidents({ take: 1000 });
    const cases = casesData?.data || [];

    // Filter cases based on logged-in user province constraints
    const provinceFilteredCases = useMemo(() => {
        if (isNationalOffice) {
            return cases;
        }
        return cases.filter(c => c.building?.province?.name === userProvince);
    }, [cases, userProvince, isNationalOffice]);

    // Apply button filter for National Office users
    const filteredCases = useMemo(() => {
        if (!isNationalOffice || selectedProvSlug === 'All') {
            return provinceFilteredCases;
        }
        const targetProvName = PROVINCE_MAP[selectedProvSlug];
        return provinceFilteredCases.filter(c => c.building?.province?.name === targetProvName);
    }, [provinceFilteredCases, selectedProvSlug, isNationalOffice]);

    // Calculate metrics
    const stats = useMemo(() => {
        const total = filteredCases.length;
        const open = filteredCases.filter(c => c.status !== 'CLOSED' && c.status !== 'RESOLVED').length;
        const pendingRec = filteredCases.filter(c => {
            if (userRole === 'pssc_coordinator') return c.status === 'UNDER_PSSC_RECOMMENDATION';
            if (userRole === 'deputy_director') return c.status === 'UNDER_DEP_DIRECTOR_RECOMMENDATION';
            return c.status?.includes('RECOMMENDATION');
        }).length;
        const closed = filteredCases.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED').length;
        const inProgress = filteredCases.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
        const highPriority = filteredCases.filter(c => c.severity?.toLowerCase() === 'critical' || c.severity?.toLowerCase() === 'high').length;
        const awaitingAssignment = filteredCases.filter(c => !c.assignedTo && (c.status === 'OPEN' || c.status === 'SUBMITTED')).length;

        return {
            total,
            open,
            pendingRec,
            closed,
            inProgress,
            highPriority,
            awaitingAssignment
        };
    }, [filteredCases, userRole]);

    // Get 8 most recent incidents
    const recentIncidents = useMemo(() => {
        return [...filteredCases]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8);
    }, [filteredCases]);

    return (
        <DashboardLayout
            title="Dashboard"
            description="Overview of OHS incident statuses"
            breadcrumbs={[{ label: 'Dashboard', path: '/admin/dashboard' }, { label: 'Overview' }]}
        >
            <div className="space-y-6">
                {/* Metric Cards Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Total Incidents */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Total Incidents</span>
                            <span className="text-3xl font-black text-gray-800 mt-2 block">{stats.total}</span>
                            <span className="text-[11px] font-bold text-gray-400 mt-1 block">Total incidents recorded</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                            <Folder className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Open Cases */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest block">Open Cases</span>
                            <span className="text-3xl font-black text-gray-800 mt-2 block">{stats.open}</span>
                            <span className="text-[11px] font-bold text-gray-400 mt-1 block">Cases currently open</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Pending Recommendations */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest block">Pending Recommendations</span>
                            <span className="text-3xl font-black text-gray-800 mt-2 block">{stats.pendingRec}</span>
                            <span className="text-[11px] font-bold text-gray-400 mt-1 block">Awaiting action</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50/50 flex items-center justify-center text-amber-500">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Closed Cases */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold text-green-500 uppercase tracking-widest block">Closed Cases</span>
                            <span className="text-3xl font-black text-gray-800 mt-2 block">{stats.closed}</span>
                            <span className="text-[11px] font-bold text-gray-400 mt-1 block">Cases closed & resolved</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Metric Cards Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* In Progress */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold text-yellow-500 uppercase tracking-widest block">In Progress</span>
                            <span className="text-3xl font-black text-gray-800 mt-2 block">{stats.inProgress}</span>
                            <span className="text-[11px] font-bold text-gray-400 mt-1 block">Cases in progress</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500">
                            <Clock className="w-5 h-5 animate-pulse" />
                        </div>
                    </div>

                    {/* High Priority */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest block">High Priority</span>
                            <span className="text-3xl font-black text-gray-800 mt-2 block">{stats.highPriority}</span>
                            <span className="text-[11px] font-bold text-gray-400 mt-1 block">High priority cases</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Awaiting Assignment */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest block">Awaiting Assignment</span>
                            <span className="text-3xl font-black text-gray-800 mt-2 block">{stats.awaitingAssignment}</span>
                            <span className="text-[11px] font-bold text-gray-400 mt-1 block">Cases awaiting assignment</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-450">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Province Filters (Only for National Office users) */}
                {isNationalOffice && (
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Filter by Province</span>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'GP', 'WC', 'KZN', 'FS', 'LMP', 'MP', 'EC', 'NC', 'NW', 'National'].map((prov) => (
                                <button
                                    key={prov}
                                    onClick={() => setSelectedProvSlug(prov)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                        selectedProvSlug === prov
                                            ? 'bg-[#884616] text-white border-[#884616] shadow-sm'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    {prov}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Incidents Table */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                    <div className="py-4 px-5 border-b border-gray-150 flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Recent Incidents</h3>
                        <button 
                            onClick={() => navigate('/pssc/incidents')} 
                            className="text-xs text-[#884616] hover:underline font-bold"
                        >
                            View All &rarr;
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-150">
                                    <th className="px-5 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Incident ID</th>
                                    <th className="px-5 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-5 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Province</th>
                                    <th className="px-5 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-5 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-5 py-3 text-[10px] font-extrabold text-gray-400 text-center uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                                            Loading incidents...
                                        </td>
                                    </tr>
                                ) : recentIncidents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-gray-400 font-semibold text-sm">
                                            No incidents found
                                        </td>
                                    </tr>
                                ) : (
                                    recentIncidents.map((incident) => {
                                        const provName = incident.building?.province?.name || '';
                                        const provSlug = getProvinceSlug(provName);

                                        return (
                                            <tr key={incident.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-3.5 text-xs font-mono font-bold text-gray-500">
                                                    {incident.incidentNumber}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">
                                                    {incident.category ? (incident.category.charAt(0).toUpperCase() + incident.category.slice(1).toLowerCase()) : incident.type}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs">
                                                    <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px]">
                                                        {provSlug}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getCustomStatusStyle(incident.status)}`}>
                                                        {getCustomStatusLabel(incident.status)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-600 font-medium">
                                                    {incident.assignedTo ? (incident.assignedTo.name || 'Assigned') : <span className="text-gray-400 italic">Unassigned</span>}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-500 font-medium">
                                                    {new Date(incident.occurredAt || incident.createdAt).toISOString().split('T')[0]}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <button 
                                                        onClick={() => navigate(`/pssc/incidents/${incident.id}`)}
                                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-750 text-xs font-bold rounded-lg hover:bg-orange-100 transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PssCDeputyDashboard;
