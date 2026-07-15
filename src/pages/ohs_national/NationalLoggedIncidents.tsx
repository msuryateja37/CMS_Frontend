import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useIncidents } from '../../hooks/useIncidents';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Loader2 } from 'lucide-react';
import { formatCategory } from '../../utils/formatters';

const STATUS_PILL_STYLES: Record<string, string> = {
    CLOSED: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-green-100 text-green-700',
    RAISED: 'bg-orange-100 text-orange-700',
    POOL: 'bg-amber-100 text-amber-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    INVESTIGATION_IN_PROGRESS: 'bg-blue-100 text-blue-700',
    TASK_IN_PROGRESS: 'bg-amber-100 text-amber-700',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700',
    FORWARDED_TO_OHS_AND_HR: 'bg-blue-100 text-blue-700',
    ESCALATED_TO_ADMIN: 'bg-red-100 text-red-700',
    FA_ASSIGNED: 'bg-teal-100 text-teal-700',
    WAITING_APPROVAL: 'bg-amber-100 text-amber-700',
    REJECTED: 'bg-red-100 text-red-700',
    REOPENED: 'bg-orange-100 text-orange-700',
};

const STATUS_LABELS: Record<string, string> = {
    RAISED: 'Submitted',
    POOL: 'Unassigned',
    FA_ASSIGNED: 'First Aider Assigned',
    FORWARDED_TO_OHS_AND_HR: 'Referred — Awaiting HR',
    UNDER_REVIEW: 'Under Review',
    REJECTED: 'Rejected',
    ASSIGNED: 'Assigned',
    INVESTIGATION_IN_PROGRESS: 'In Progress',
    TASK_IN_PROGRESS: 'In Progress',
    WAITING_APPROVAL: 'Awaiting Approval',
    ESCALATED_TO_ADMIN: 'Escalated',
    COMPLETED: 'Closed',
    REOPENED: 'Reopened',
    CLOSED: 'Closed',
};

const NationalLoggedIncidents: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const { data: incidentData, isLoading } = useIncidents({ take: 500 });
    const allIncidents = incidentData?.data || [];

    // Filter incidents
    const filtered = useMemo(() => {
        return allIncidents.filter(c => {
            // Search filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const matchRef = c.incidentNumber?.toLowerCase().includes(term);
                const matchEmployee = c.reportedBy?.name?.toLowerCase().includes(term);
                const matchProvince = c.building?.province?.name?.toLowerCase().includes(term);
                const matchOffice = c.building?.name?.toLowerCase().includes(term);
                if (!matchRef && !matchEmployee && !matchProvince && !matchOffice) return false;
            }
            // Status filter
            if (statusFilter && c.status !== statusFilter) return false;
            // Category filter
            if (categoryFilter && c.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
            return true;
        });
    }, [allIncidents, searchTerm, statusFilter, categoryFilter]);

    // Format date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <DashboardLayout
            title="Logged Incidents"
            description="DLRRD Facilities Management Services"
        >
            <div className="bg-white rounded-xl border border-gray-100 p-5">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-3 mb-5">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search ref, employee, office..."
                            className="w-full pl-10 pr-4 py-2.5 bg-subtle-grey border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        className="px-3 py-2.5 bg-subtle-grey border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/30 min-w-[150px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        <option value="RAISED">Submitted</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="INVESTIGATION_IN_PROGRESS">In Progress</option>
                        <option value="TASK_IN_PROGRESS">In Progress (Task)</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="FORWARDED_TO_OHS_AND_HR">Referred to HR</option>
                        <option value="CLOSED">Closed</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                    {/* Category Filter */}
                    <select
                        className="px-3 py-2.5 bg-subtle-grey border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/30 min-w-[150px]"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All categories</option>
                        <option value="safety">Safety</option>
                        <option value="health">Health</option>
                        <option value="environmental">Environmental</option>
                        <option value="equipment">Equipment</option>
                        <option value="security">Security</option>
                        <option value="others">Other</option>
                    </select>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-7 h-7 text-gold animate-spin" />
                        <span className="ml-3 text-gray-500 text-sm">Loading incidents...</span>
                    </div>
                )}

                {/* Table */}
                {!isLoading && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Ref #</th>
                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Province / Office</th>
                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-right py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                            No incidents found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((incident) => (
                                        <tr
                                            key={incident.id}
                                            className="border-b border-gray-50 hover:bg-subtle-gold/30 transition-colors"
                                        >
                                            <td className="py-3.5 px-3">
                                                <span className="font-mono text-xs font-semibold text-gray-600">{incident.incidentNumber}</span>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className="text-xs text-gray-600">{formatDate(incident.occurredAt || incident.createdAt)}</span>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className="text-xs font-medium text-gray-700">{incident.reportedBy?.name || '—'}</span>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className="text-xs font-semibold text-gray-700">{formatCategory(incident.category || '—')}</span>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className="text-xs text-gray-600">
                                                    {incident.building?.province?.name || '—'}
                                                    {incident.building?.name ? ` · ${incident.building.name}` : ''}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_PILL_STYLES[incident.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {STATUS_LABELS[incident.status] || incident.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-right">
                                                <button
                                                    onClick={() => navigate(`/ohs/cases/${incident.id}`)}
                                                    className="text-xs font-semibold text-brown hover:text-gold transition-colors inline-flex items-center gap-1"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default NationalLoggedIncidents;
