import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import { DataTable, type Column } from '../../components/common/DataTable';
import { type Case } from '../../services/cases.service';
import { useIncidents } from '../../hooks/useIncidents';
import { useAuthStore } from '../../store/auth.store';
import {
    Folder,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FilePlus,
    ChevronRight,
    Loader2,
    Eye,
    TrendingUp
} from 'lucide-react';
import { formatCategory } from '../../utils/formatters';

const SupervisorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const provinceId = user?.province?.id || user?.department?.building?.province?.id;

    // Use the custom hook with a large limit for the overview, filtered by supervisor's province
    const { data: result, isLoading: loading, error: queryError } = useIncidents({ provinceId, take: 200 });
    const allCases = result?.data || [];
    const error = queryError ? 'Failed to load dashboard data.' : null;

    // Compute real stats
    const totalCases = allCases.length;
    const openUnassigned = allCases.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
    const assignedCases = allCases.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
    const underReview = allCases.filter(c => c.status === 'UNDER_REVIEW').length;
    const closedCases = allCases.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED').length;
    const escalated = allCases.filter(c => c.isEscalated).length;
    const criticalHigh = allCases.filter(c => c.severity?.toLowerCase() === 'critical' || c.severity?.toLowerCase() === 'high').length;

    // Recent cases for the table (most recent first, limit 10)
    const recentCases = allCases.slice(0, 10);

    // Filter cases that have not yet been accepted by a first aider or practitioner
    const attentionCases = allCases.filter(c => 
        (c.status === 'SUBMITTED' || c.status === 'ESCALATED' || c.status === 'OPEN') && !c.assignedTo
    );

    const getOpenFor = (createdAt: string) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs < 24) {
            return `${diffHrs}h`;
        }
        const diffDays = Math.floor(diffHrs / 24);
        return `${diffDays}d`;
    };

    const columns: Column<Case>[] = [
        {
            header: 'Incident ID',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => (
                <span className="font-mono text-sm font-medium text-gray-600">{item.incidentNumber}</span>
            )
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-gray-700 font-medium">{formatCategory(item.category || item.type || 'N/A')}</span>
        },
        {
            header: 'Severity',
            accessorKey: 'severity',
            sortable: true,
            cell: (item) => {
                const sev = item.severity || 'medium';
                return <Pill label={sev.charAt(0).toUpperCase() + sev.slice(1)} variant={sev.toLowerCase()} />;
            }
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => {
                const statusLabel = getStatusLabel(item.status);
                const cleanStatusLabel = statusLabel.toUpperCase();
                return <Pill label={cleanStatusLabel} variant={item.status.toLowerCase().replace(/_/g, ' ')} />;
            }
        },
        {
            header: 'Assigned To',
            cell: (item) => (
                <span className="text-gray-500 text-sm">
                    {item.assignedTo?.name || <span className="text-gray-400 italic">Unassigned</span>}
                </span>
            )
        },
        {
            header: 'Date',
            accessorKey: 'createdAt',
            sortable: true,
            cell: (item) => (
                <span className="text-gray-500 text-sm">
                    {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
            )
        },
        {
            header: '',
            cell: (item) => (
                <button
                    onClick={() => navigate(`/supervisor/cases/${item.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-light-gold text-brown text-xs font-bold rounded-lg hover:bg-gold/10 transition-colors"
                >
                    <Eye size={14} />
                    View
                </button>
            )
        }
    ];

    return (
        <DashboardLayout
            title="Supervisor Dashboard"
            description="Overview of all incidents"
            breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "Overview" }]}
        >
            <div className="flex flex-col gap-4">

                {/* Top Actions */}
                <div className="flex justify-end gap-3 mb-1">
                    <button
                        onClick={() => navigate('/supervisor/submit-case')}
                        className="flex items-center gap-2 px-4 py-2 bg-brown text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm text-sm"
                    >
                        <FilePlus size={16} />
                        Report New Incident
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white py-3 px-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                            <Folder size={15} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Incidents</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? '...' : totalCases}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">All incidents in system</p>
                    </div>

                    <div className="bg-white py-3 px-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-500 mb-1.5">
                            <Clock size={15} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Open</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? '...' : openUnassigned}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">Awaiting assignment</p>
                    </div>

                    <div className="bg-white py-3 px-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-purple-500 mb-1.5">
                            <TrendingUp size={15} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Assigned</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? '...' : assignedCases}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">With practitioners</p>
                    </div>

                    <div className="bg-white py-3 px-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-gold mb-1.5">
                            <CheckCircle2 size={15} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Closed</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? '...' : closedCases}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">Resolved incidents</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white py-2.5 px-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                            <Clock size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Under Review</p>
                            <p className="text-base font-bold text-gray-900 leading-none">{loading ? '...' : underReview}</p>
                        </div>
                    </div>

                    <div className="bg-white py-2.5 px-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red/40 flex items-center justify-center shrink-0">
                            <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Escalated</p>
                            <p className="text-base font-bold text-gray-900 leading-none">{loading ? '...' : escalated}</p>
                        </div>
                    </div>

                    <div className="bg-white py-2.5 px-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                            <AlertTriangle size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Critical / High</p>
                            <p className="text-base font-bold text-gray-900 leading-none">{loading ? '...' : criticalHigh}</p>
                        </div>
                    </div>
                </div>

                {/* Requires Attention Alert Section */}
                {!loading && !error && attentionCases.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4 mb-2">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Requires attention</h3>
                                <p className="text-xs text-gray-500 mt-0.5">These incidents have not yet been accepted by a first aider or practitioner.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="py-3 px-4">Ref #</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Employee</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Office</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Open for</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {attentionCases.map((item) => {
                                        const isEscalated = item.status === 'ESCALATED' || item.isEscalated;
                                        return (
                                            <tr 
                                                key={item.id} 
                                                className={isEscalated ? "bg-red-50/30 hover:bg-red-50/50 transition-colors animate-pulse-slow" : "hover:bg-gray-50/50 transition-colors"}
                                            >
                                                <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-700">{item.incidentNumber}</td>
                                                <td className="py-3 px-4 text-xs text-gray-600">
                                                    {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="py-3 px-4 text-xs font-semibold text-gray-800">{item.reportedBy?.fullName || item.reportedBy?.name || 'Unknown'}</td>
                                                <td className="py-3 px-4 text-xs text-gray-600">{formatCategory(item.category || item.type || 'N/A')}</td>
                                                <td className="py-3 px-4 text-xs text-gray-600">{item.building?.name || 'Unknown'}</td>
                                                <td className="py-3 px-4 text-xs">
                                                    <Pill 
                                                        label={getStatusLabel(item.status).toUpperCase()} 
                                                        variant={item.status.toLowerCase().replace(/_/g, ' ')} 
                                                    />
                                                </td>
                                                <td className="py-3 px-4 text-xs font-semibold text-gray-700">{getOpenFor(item.createdAt)}</td>
                                                <td className="py-3 px-4 text-xs text-right">
                                                    <button
                                                        onClick={() => navigate(`/supervisor/cases/${item.id}`)}
                                                        className="text-brown hover:underline font-bold"
                                                        title={`View case ${item.incidentNumber}`}
                                                        aria-label={`View case ${item.incidentNumber}`}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* All Incidents Table */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">All Incidents</h3>
                        <button
                            onClick={() => navigate('/supervisor/logged-incidents')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-light-gold hover:bg-gold/20 text-brown text-xs font-bold rounded-lg transition-all shadow-sm active:scale-[0.98]"
                        >
                            <span>View All</span>
                            <ChevronRight size={13} strokeWidth={2.5} className="shrink-0" />
                        </button>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-gold animate-spin" />
                            <span className="ml-3 text-gray-600">Loading incidents...</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
                    )}

                    {!loading && !error && recentCases.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <Folder className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-400 font-medium">No incidents found.</p>
                        </div>
                    )}

                    {!loading && !error && recentCases.length > 0 && (
                        <DataTable
                            data={recentCases}
                            columns={columns}
                            keyField="id"
                            selectable={false}
                            selectedIds={[]}
                            onSelectionChange={() => { }}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SupervisorDashboard;
