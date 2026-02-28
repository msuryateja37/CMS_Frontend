import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { DataTable, type Column } from '../../components/common/DataTable';
import { type Case } from '../../services/cases.service';
import { useIncidents } from '../../hooks/useIncidents';
import { useAuthStore } from '../../store/auth.store';
import {
    Folder,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Eye,
    Loader2,
    ChevronRight,
    TrendingUp,
    FileText
} from 'lucide-react';
import { formatCategory } from '../../utils/formatters';

const SecurityDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Fetch cases created by practitioner
    const {
        data: reportedData,
        isLoading: loadingReported,
        error: errorReported
    } = useIncidents({
        reported_by: user?.id,
        take: 100,
    });

    // Fetch cases assigned to practitioner
    const {
        data: assignedData,
        isLoading: loadingAssigned,
        error: errorAssigned
    } = useIncidents({
        assignedToId: user?.id,
        take: 100,
    });

    const myCases = reportedData?.data || [];
    const assignedCases = assignedData?.data || [];
    const loading = loadingReported || loadingAssigned;
    const error = (errorReported || errorAssigned) ? 'Failed to load dashboard data.' : null;

    const totalAssigned = assignedCases.length;
    const pendingCases = assignedCases.filter(c => c.status === 'ASSIGNED' || c.status === 'OPEN').length;
    const solvedCases = assignedCases.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED').length;
    const underReviewCases = assignedCases.filter(c => c.status === 'UNDER_REVIEW').length;

    const avgResolutionDays = (() => {
        const solved = assignedCases.filter(c => (c.status === 'CLOSED' || c.status === 'RESOLVED') && c.createdAt && c.updatedAt);
        if (solved.length === 0) return 0;
        const totalDays = solved.reduce((sum, c) => {
            const created = new Date(c.createdAt).getTime();
            const updated = new Date(c.updatedAt).getTime();
            return sum + (updated - created) / (1000 * 60 * 60 * 24);
        }, 0);
        return totalDays / solved.length;
    })();

    const criticalCount = assignedCases.filter(c => c.severity?.toLowerCase() === 'critical' || c.severity?.toLowerCase() === 'high').length;

    const myCasesColumns: Column<Case>[] = [
        {
            header: 'Case ID',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => <span className="font-mono text-sm font-medium text-gray-600">{item.incidentNumber}</span>
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-gray-700 font-medium">{formatCategory(item.category || 'N/A')}</span>
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => {
                const statusColors: Record<string, string> = {
                    ASSIGNED: 'bg-purple-50 text-purple-700',
                    IN_PROGRESS: 'bg-cyan-50 text-cyan-700',
                    UNDER_REVIEW: 'bg-amber-50 text-amber-700',
                    OPEN: 'bg-blue-50 text-blue-700',
                    CLOSED: 'bg-gray-100 text-gray-600',
                    RESOLVED: 'bg-green-50 text-green-700',
                };
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[item.status] || 'bg-gray-100 text-gray-600'}`}>
                        {item.status.replace('_', ' ')}
                    </span>
                );
            }
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
                    onClick={() => navigate(`/security/cases/${item.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-light-green text-dark-green text-xs font-bold rounded-lg hover:bg-green/10 transition-colors"
                >
                    <Eye size={14} /> View
                </button>
            )
        }
    ];

    const assignedColumns: Column<Case>[] = [
        {
            header: 'Case ID',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => <span className="font-mono text-sm font-medium text-gray-600">{item.incidentNumber}</span>
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-gray-700 font-medium">{formatCategory(item.category || 'N/A')}</span>
        },
        {
            header: 'Severity',
            accessorKey: 'severity',
            sortable: true,
            cell: (item) => {
                const sev = item.severity || 'medium';
                return <Pill label={sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase()} variant={sev.toLowerCase()} />;
            }
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => {
                const statusColors: Record<string, string> = {
                    ASSIGNED: 'bg-purple-50 text-purple-700',
                    IN_PROGRESS: 'bg-cyan-50 text-cyan-700',
                    UNDER_REVIEW: 'bg-amber-50 text-amber-700',
                    OPEN: 'bg-blue-50 text-blue-700',
                    CLOSED: 'bg-gray-100 text-gray-600',
                    RESOLVED: 'bg-green-50 text-green-700',
                };
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[item.status] || 'bg-gray-100 text-gray-600'}`}>
                        {item.status.replace('_', ' ')}
                    </span>
                );
            }
        },
        {
            header: '',
            cell: (item) => (
                <button
                    onClick={() => navigate(`/security/cases/${item.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-light-green text-dark-green text-xs font-bold rounded-lg hover:bg-green/10 transition-colors"
                >
                    <Eye size={14} /> View
                </button>
            )
        }
    ];

    return (
        <DashboardLayout title="Security Dashboard" description="Dashboard" breadcrumbs={[{ label: "Dashboard", path: "/security/dashboard" }, { label: "Overview" }]}>
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                            <Folder size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Assigned</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : totalAssigned}</h3>
                        <p className="text-xs text-gray-400 mt-1">Total cases assigned to you</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-500 mb-3">
                            <Clock size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Pending</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : pendingCases}</h3>
                        <p className="text-xs text-gray-400 mt-1">Awaiting your action</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-green mb-3">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Solved</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : solvedCases}</h3>
                        <p className="text-xs text-gray-400 mt-1">Closed & resolved</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-500 mb-3">
                            <TrendingUp size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Avg. Time</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : avgResolutionDays.toFixed(1)}</h3>
                        <p className="text-xs text-gray-400 mt-1">Days to resolve</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Clock size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold">Under Review</p>
                            <p className="text-lg font-bold text-gray-900">{loading ? '...' : underReviewCases}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold">Critical / High</p>
                            <p className="text-lg font-bold text-gray-900">{loading ? '...' : criticalCount}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <FileText size={18} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold">My Reported</p>
                            <p className="text-lg font-bold text-gray-900">{loading ? '...' : myCases.length}</p>
                        </div>
                    </div>
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

                {!loading && !error && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">My Cases</h3>
                            <button onClick={() => navigate('/security/my-cases')} className="flex items-center gap-1 text-sm font-bold text-dark-green hover:underline">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        {myCases.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                                <FileText className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-400 font-medium">No cases reported by you yet.</p>
                            </div>
                        ) : (
                            <DataTable data={myCases.slice(0, 5)} columns={myCasesColumns} keyField="id" selectable={false} selectedIds={[]} onSelectionChange={() => { }} />
                        )}
                    </div>
                )}

                {!loading && !error && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Assigned Cases</h3>
                            <button onClick={() => navigate('/security/cases-review')} className="flex items-center gap-1 text-sm font-bold text-dark-green hover:underline">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        {assignedCases.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                                <Folder className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-400 font-medium">No cases assigned to you yet.</p>
                            </div>
                        ) : (
                            <DataTable data={assignedCases.filter(c => c.status !== 'CLOSED' && c.status !== 'RESOLVED').slice(0, 5)} columns={assignedColumns} keyField="id" selectable={false} selectedIds={[]} onSelectionChange={() => { }} />
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SecurityDashboard;
