import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import { DataTable, type Column } from '../../components/common/DataTable';
import { type Case } from '../../services/cases.service';
import { useIncidents } from '../../hooks/useIncidents';
import {
    Folder,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FilePlus,
    ChevronRight,
    Loader2,
    Eye,
    UserPlus,
    TrendingUp
} from 'lucide-react';
import { formatCategory } from '../../utils/formatters';

const SupervisorDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Use the custom hook with a large limit for the overview
    const { data: result, isLoading: loading, error: queryError } = useIncidents({ take: 200 });
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

    const columns: Column<Case>[] = [
        {
            header: 'Case ID',
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
                return <Pill label={statusLabel} variant={item.status.toLowerCase().replace(/_/g, ' ')} />;
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-light-green text-dark-green text-xs font-bold rounded-lg hover:bg-green/10 transition-colors"
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
            description="Overview of all cases"
            breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "Overview" }]}
        >
            <div className="flex flex-col gap-6">

                {/* Top Actions */}
                <div className="flex justify-end gap-3 -mt-4 mb-2">
                    <button
                        onClick={() => navigate('/supervisor/cases-review')}
                        className="flex items-center gap-2 px-4 py-2 bg-green text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
                    >
                        <UserPlus size={18} />
                        Review & Assign
                    </button>
                    <button
                        onClick={() => navigate('/supervisor/submit-case')}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-green text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
                    >
                        <FilePlus size={18} />
                        Submit New Case
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                            <Folder size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Total Cases</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : totalCases}</h3>
                        <p className="text-xs text-gray-400 mt-1">All cases in system</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-500 mb-3">
                            <Clock size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Open</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : openUnassigned}</h3>
                        <p className="text-xs text-gray-400 mt-1">Awaiting assignment</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-purple-500 mb-3">
                            <TrendingUp size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Assigned</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : assignedCases}</h3>
                        <p className="text-xs text-gray-400 mt-1">With practitioners</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-green mb-3">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Closed</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : closedCases}</h3>
                        <p className="text-xs text-gray-400 mt-1">Resolved cases</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Clock size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold">Under Review</p>
                            <p className="text-lg font-bold text-gray-900">{loading ? '...' : underReview}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red/40 flex items-center justify-center">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold">Escalated</p>
                            <p className="text-lg font-bold text-gray-900">{loading ? '...' : escalated}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <AlertTriangle size={18} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold">Critical / High</p>
                            <p className="text-lg font-bold text-gray-900">{loading ? '...' : criticalHigh}</p>
                        </div>
                    </div>
                </div>

                {/* All Cases Table */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">All Cases</h3>
                        <button
                            onClick={() => navigate('/supervisor/cases-review')}
                            className="flex items-center gap-1 text-sm font-bold text-dark-green hover:underline"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-green animate-spin" />
                            <span className="ml-3 text-gray-600">Loading cases...</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
                    )}

                    {!loading && !error && recentCases.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <Folder className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-400 font-medium">No cases found.</p>
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
