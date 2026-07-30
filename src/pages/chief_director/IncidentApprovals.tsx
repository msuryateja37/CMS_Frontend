import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useIncidents } from '../../hooks/useIncidents';
import { formatCategory } from '../../utils/formatters';
import {
    CheckCircle,
    Eye,
    Search,
    Clock,
    CheckSquare,
    FolderCheck
} from 'lucide-react';

const PROVINCES = [
    { slug: 'All', label: 'All' },
    { slug: 'GP', label: 'GP', name: 'Gauteng' },
    { slug: 'WC', label: 'WC', name: 'Western Cape' },
    { slug: 'KZN', label: 'KZN', name: 'KwaZulu-Natal' },
    { slug: 'FS', label: 'FS', name: 'Free State' },
    { slug: 'LMP', label: 'LMP', name: 'Limpopo' },
    { slug: 'MP', label: 'MP', name: 'Mpumalanga' },
    { slug: 'EC', label: 'EC', name: 'Eastern Cape' },
    { slug: 'NC', label: 'NC', name: 'Northern Cape' },
    { slug: 'NW', label: 'NW', name: 'North West' },
    { slug: 'National', label: 'National', name: 'National Office' },
];

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
    critical: { bg: 'bg-subtle-red', text: 'text-brand-red', dot: 'bg-brand-red' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    medium: { bg: 'bg-light-yellow', text: 'text-yellow-800', dot: 'bg-brand-yellow' },
    low: { bg: 'bg-light-gold', text: 'text-brown', dot: 'bg-[#21FC95]' },
};

const ChiefDirectorIncidentApprovals: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'pending' | 'closed'>('pending');
    const [selectedProvSlug, setSelectedProvSlug] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: casesData, isLoading } = useIncidents({ take: 1000 });
    const allCases = casesData?.data || [];

    // Pending Approvals cases
    const pendingCases = useMemo(() => {
        return allCases.filter(c => {
            const status = (c.status || '').toUpperCase();
            return (
                status === 'DIRECTOR_APPROVAL' ||
                status === 'UNDER_DIRECTOR' ||
                status === 'UNDER_DIRECTOR_RECOMMENDATION' ||
                status === 'UNDER_DEP_DIRECTOR_RECOMMENDATION'
            );
        });
    }, [allCases]);

    // Closed Approvals cases (Approved or Closed by Chief Director)
    const closedCases = useMemo(() => {
        return allCases.filter(c => {
            const status = (c.status || '').toUpperCase();
            const hasChiefApproval = c.approvals?.some(ap =>
                ap.roleName?.toLowerCase()?.includes('chief director') ||
                ap.roleName?.toLowerCase()?.includes('director')
            );
            return status === 'APPROVED' || status === 'CLOSED' || hasChiefApproval;
        });
    }, [allCases]);

    // Current cases set based on tab
    const currentTabCases = useMemo(() => {
        return activeTab === 'pending' ? pendingCases : closedCases;
    }, [activeTab, pendingCases, closedCases]);

    // Filter by province pill selection & search query
    const filteredCases = useMemo(() => {
        let result = currentTabCases;

        if (selectedProvSlug !== 'All') {
            const targetProv = PROVINCES.find(p => p.slug === selectedProvSlug);
            if (targetProv?.name) {
                result = result.filter(c => {
                    const provName = (c.building?.province?.name || (c as any).province?.name || '').toLowerCase();
                    const targetName = targetProv.name.toLowerCase();
                    const targetSlug = targetProv.slug.toLowerCase();
                    return provName.includes(targetName) || provName.includes(targetSlug);
                });
            }
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.incidentNumber?.toLowerCase().includes(term) ||
                c.description?.toLowerCase().includes(term) ||
                c.reportedBy?.name?.toLowerCase().includes(term) ||
                c.category?.toLowerCase().includes(term)
            );
        }

        return result;
    }, [currentTabCases, selectedProvSlug, searchTerm]);

    const getSeverityStyle = (severity?: string) => {
        if (!severity) return severityConfig.medium;
        return severityConfig[severity.toLowerCase()] || severityConfig.medium;
    };

    return (
        <DashboardLayout
            title="Incident Approvals"
            description="Review and manage executive incident approvals across all provinces"
            breadcrumbs={[{ label: 'Dashboard' }, { label: 'Incident Approvals' }]}
        >
            <div className="space-y-6">
                {/* Filter by Province Bar */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4">
                    <div className="text-xs font-semibold text-gray-600">Filter by Province</div>
                    <div className="flex flex-wrap items-center gap-2">
                        {PROVINCES.map((prov) => {
                            const isActive = selectedProvSlug === prov.slug;
                            return (
                                <button
                                    key={prov.slug}
                                    onClick={() => setSelectedProvSlug(prov.slug)}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                        isActive
                                            ? 'bg-[#5c2c16] text-white shadow-sm'
                                            : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                                    }`}
                                >
                                    {prov.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section Tabs: Pending Approvals vs Closed Approvals */}
                <div className="flex items-center gap-3 border-b border-gray-200 pb-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'pending'
                                ? 'bg-[#5c2c16] text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <Clock size={16} />
                        Pending Approvals
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                            {pendingCases.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('closed')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'closed'
                                ? 'bg-[#5c2c16] text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <FolderCheck size={16} />
                        Closed Approvals
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            activeTab === 'closed' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                            {closedCases.length}
                        </span>
                    </button>
                </div>

                {/* Search Bar & Header Stats */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${activeTab === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                            {activeTab === 'pending' ? <CheckCircle size={20} /> : <FolderCheck size={20} />}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                {activeTab === 'pending' ? 'Pending Approval' : 'Closed Approvals'} ({filteredCases.length})
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {activeTab === 'pending'
                                    ? 'Incidents awaiting final executive approval'
                                    : 'Incidents approved and finalized by the Chief Director'}
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by ID, reporter..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#5c2c16] transition"
                        />
                    </div>
                </div>

                {/* Cases List Table */}
                {isLoading ? (
                    <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-500 font-medium text-xs">
                        Loading incident approvals...
                    </div>
                ) : filteredCases.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-800">
                            {activeTab === 'pending' ? 'No Incidents Pending Approval' : 'No Closed Approvals Found'}
                        </h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto font-medium">
                            {selectedProvSlug !== 'All'
                                ? `There are currently no ${activeTab === 'pending' ? 'pending approvals' : 'closed approvals'} in ${PROVINCES.find(p => p.slug === selectedProvSlug)?.name || selectedProvSlug}.`
                                : `All ${activeTab === 'pending' ? 'pending incident approvals' : 'closed approvals'} will appear here.`}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-150 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3.5 px-4">Incident ID</th>
                                        <th className="py-3.5 px-4">Category</th>
                                        <th className="py-3.5 px-4">Province</th>
                                        <th className="py-3.5 px-4">Severity</th>
                                        <th className="py-3.5 px-4">Reported By</th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                    {filteredCases.map((incident) => {
                                        const sevStyle = getSeverityStyle(incident.severity);
                                        const isApproved = incident.status === 'APPROVED';
                                        const isClosed = incident.status === 'CLOSED';

                                        return (
                                            <tr
                                                key={incident.id}
                                                className="hover:bg-gray-50/60 transition cursor-pointer"
                                                onClick={() => navigate(`/chief-director/incidents/${incident.id}`)}
                                            >
                                                <td className="py-4 px-4 font-bold text-gray-900">
                                                    {incident.incidentNumber}
                                                </td>
                                                <td className="py-4 px-4 font-semibold text-gray-800">
                                                    {formatCategory(incident.category)}
                                                </td>
                                                <td className="py-4 px-4 font-semibold text-gray-700">
                                                    {incident.building?.province?.name || 'Gauteng'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sevStyle.bg} ${sevStyle.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${sevStyle.dot}`}></span>
                                                        {incident.severity?.toUpperCase() || 'MEDIUM'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-semibold text-gray-700">
                                                    {incident.reportedBy?.name || '—'}
                                                </td>
                                                <td className="py-4 px-4 text-gray-500 font-semibold">
                                                    {incident.occurredAt ? new Date(incident.occurredAt).toLocaleDateString('en-GB') : '—'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {isApproved ? (
                                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            APPROVED
                                                        </span>
                                                    ) : isClosed ? (
                                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-250">
                                                            CLOSED
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-150">
                                                            DIRECTOR APPROVAL
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    {activeTab === 'pending' ? (
                                                        <button
                                                            onClick={() => navigate(`/chief-director/incidents/${incident.id}`)}
                                                            className="px-3.5 py-1.5 bg-[#5c2c16] hover:bg-[#472211] text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                                                        >
                                                            <Eye size={14} /> Review &amp; Action
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => navigate(`/chief-director/incidents/${incident.id}`)}
                                                            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 border border-gray-250 cursor-pointer"
                                                        >
                                                            <Eye size={14} /> View Only
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ChiefDirectorIncidentApprovals;
