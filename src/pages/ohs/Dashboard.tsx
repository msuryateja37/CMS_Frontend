import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import { DataTable, type Column } from '../../components/common/DataTable';
import { type Case } from '../../services/cases.service';
import { useIncidents } from '../../hooks/useIncidents';
import { useAuthStore } from '../../store/auth.store';
import { getRoleBasePath } from '../../utils/rolePaths';
import {
    Folder,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Eye,
    Loader2,
    ChevronRight,
    TrendingUp,
    FilePlus,
    Inbox,
    Users
} from 'lucide-react';
import { formatCategory } from '../../utils/formatters';

interface DashboardCase extends Case {
    hrStatus?: string;
    hrAssignedTo?: { name: string };
}

const OHSDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isNational = user?.role?.name?.toUpperCase()?.replace(/_/g, ' ') === 'OHS NATIONAL OFFICE';
    const base = getRoleBasePath(user?.role?.name);

    // Fetch unassigned pool cases in the same province (includes REFERRED_TO_OHS_AND_HR)
    const {
        data: poolData,
        isLoading: loadingPool,
        error: errorPool
    } = useIncidents({
        status: 'NEW,UNASSIGNED,REFERRED_TO_OHS_AND_HR',
        unassignedOnly: 'true',
        provinceId: isNational ? undefined : user?.province?.id,
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

    const poolCases = (poolData?.data || []).filter(c => {
        const cat = c.category?.toLowerCase();
        if (cat === 'health') {
            return c.status === 'REFERRED_TO_OHS_AND_HR';
        }
        // Safety, environmental, equipment, security, others go directly to OHS Pool on creation
        return c.status === 'NEW' || c.status === 'UNASSIGNED' || c.status === 'POOL';
    });
    const assignedCases = assignedData?.data || [];
    const loading = loadingPool || loadingAssigned;
    const error = (errorPool || errorAssigned) ? 'Failed to load dashboard data.' : null;

    // Stats from assigned cases
    const totalAssigned = assignedCases.length;
    const pendingCases = assignedCases.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'OPEN').length;
    const solvedCases = assignedCases.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED').length;
    const underReviewCases = assignedCases.filter(c => c.status === 'UNDER_REVIEW').length;

    // Average resolution time (days)
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

    const hrStatusLabel: Record<string, string> = {
        HR_UNASSIGNED: 'Unassigned',
        HR_ASSIGNED: 'Assigned',
        HR_UNDER_REVIEW: 'Under Review',
        HR_APPROVED: 'Approved',
    };

    // Columns for "Unassigned Incidents"
    const poolColumns: Column<DashboardCase>[] = [
        {
            header: 'Incident ID',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => (
                <div>
                    <span className="font-mono text-sm font-medium text-gray-600">{item.incidentNumber}</span>
                    {item.status === 'REFERRED_TO_OHS_AND_HR' && (
                        <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded uppercase">Health</span>
                    )}
                </div>
            )
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
            cell: (item) => (
                <Pill label={getStatusLabel(item.status)} variant={item.status.toLowerCase().replace(/_/g, ' ')} />
            )
        },
        {
            header: 'HR Status',
            cell: (item) => {
                const hrStatus = item.hrStatus;
                if (!hrStatus) return <span className="text-gray-400 text-xs">—</span>;
                const colorMap: Record<string, string> = {
                    HR_UNASSIGNED: 'bg-gray-100 text-gray-600',
                    HR_ASSIGNED: 'bg-blue-100 text-blue-700',
                    HR_UNDER_REVIEW: 'bg-amber-100 text-amber-700',
                    HR_APPROVED: 'bg-green-100 text-green-700',
                };
                return (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorMap[hrStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                        {hrStatusLabel[hrStatus] ?? hrStatus}
                    </span>
                );
            }
        },
        {
            header: 'HR Assignee',
            cell: (item) => {
                const hr = item.hrAssignedTo;
                return hr ? (
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Users size={12} /> {hr.name}
                    </span>
                ) : <span className="text-gray-400 text-xs">—</span>;
            }
        },
        {
            header: '',
            cell: (item) => (
                <button
                    onClick={() => navigate(`${base}/cases/${item.id}`, { state: { from: 'dashboard' } })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-750 text-xs font-bold rounded-lg hover:bg-orange-100 transition-colors"
                >
                    <Eye size={14} />
                    View
                </button>
            )
        }
    ];

    // Columns for "Assigned Cases"
    const assignedColumns: Column<Case>[] = [
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
            cell: (item) => <span className="text-gray-700 font-medium">{formatCategory(item.category || 'N/A')}</span>
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
                return <Pill label={statusLabel.toUpperCase()} variant={item.status.toLowerCase().replace(/_/g, ' ')} />;
            }
        },
        {
            header: '',
            cell: (item) => (
                <button
                    onClick={() => navigate(`${base}/cases/${item.id}`, { state: { from: 'dashboard' } })}
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
            title={isNational ? "OHS National Office Dashboard" : "OHS Dashboard"}
            description={isNational ? "National-level incident monitoring and escalation control" : "Dashboard"}
            breadcrumbs={[{ label: "Dashboard", path: `${base}/dashboard` }, { label: "Overview" }]}
        >

            <div className="flex flex-col gap-4">
                {/* Top Actions */}
                <div className="flex justify-end mb-1">
                    <button
                        onClick={() => navigate(`${base}/submit-case`)}
                        className="flex items-center gap-2 px-4 py-2 bg-brown text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm text-sm shrink-0"
                    >
                        <FilePlus size={16} />
                        Report New Incident
                    </button>
                </div>


                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white py-3 px-4 rounded-xl border border-gray-150 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                            <Folder size={15} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Assigned</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? '...' : totalAssigned}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">Total incidents assigned to you</p>
                    </div>

                    <div className="bg-white py-3 px-4 rounded-xl border border-gray-150 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-500 mb-1.5">
                            <Clock size={15} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? '...' : pendingCases}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">Awaiting your action</p>
                    </div>

                    <div className="bg-white py-3 px-4 rounded-xl border border-gray-150 shadow-sm">
                        <div className="flex items-center gap-2 text-gold mb-1.5">
                            <CheckCircle2 size={15} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Solved</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? '...' : solvedCases}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">Closed & resolved</p>
                    </div>

                    <div className="bg-white py-3 px-4 rounded-xl border border-gray-150 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-500 mb-1.5">
                            <TrendingUp size={15} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Time</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none">{loading ? '...' : avgResolutionDays.toFixed(1)}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">Days to resolve</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white py-2.5 px-3.5 rounded-xl border border-gray-150 shadow-sm flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                            <Clock size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Under Review</p>
                            <p className="text-base font-bold text-gray-900 leading-none">{loading ? '...' : underReviewCases}</p>
                        </div>
                    </div>

                    <div className="bg-white py-2.5 px-3.5 rounded-xl border border-gray-150 shadow-sm flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red/10 flex items-center justify-center shrink-0">
                            <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Critical / High</p>
                            <p className="text-base font-bold text-gray-900 leading-none">{loading ? '...' : criticalCount}</p>
                        </div>
                    </div>

                    <div className="bg-white py-2.5 px-3.5 rounded-xl border border-gray-150 shadow-sm flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                            <Inbox size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Unassigned Incidents</p>
                            <p className="text-base font-bold text-gray-900 leading-none">{loading ? '...' : poolCases.length}</p>
                        </div>
                    </div>
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

                {/* Unassigned Incident Pool Section */}
                {!loading && !error && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-800">Unassigned Incidents</h3>
                                {poolCases.length > 0 && (
                                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {poolCases.length} waiting
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => navigate(`${base}/pool`)}
                                className="flex items-center gap-1 text-sm font-bold text-brown hover:underline"
                            >
                                View Unassigned <ChevronRight size={14} />
                            </button>
                        </div>

                        {poolCases.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-gray-150">
                                <Inbox className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-400 font-medium">No unassigned incidents awaiting pickup.</p>
                            </div>
                        ) : (
                            <DataTable
                                data={(poolCases as DashboardCase[]).slice(0, 5)}
                                columns={poolColumns}
                                keyField="id"
                                selectable={false}
                                selectedIds={[]}
                                onSelectionChange={() => { }}
                            />
                        )}
                    </div>
                )}

                {/* Assigned Cases Section */}
                {!loading && !error && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Assigned Incidents</h3>
                            <button
                                onClick={() => navigate(`${base}/cases-review`)}
                                className="flex items-center gap-1 text-sm font-bold text-brown hover:underline"
                            >
                                View All <ChevronRight size={14} />
                            </button>
                        </div>

                        {assignedCases.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-gray-150">
                                <Folder className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-400 font-medium">No incidents assigned to you yet.</p>
                            </div>
                        ) : (
                            <DataTable
                                data={assignedCases.filter(c => c.status !== 'CLOSED' && c.status !== 'RESOLVED').slice(0, 5)}
                                columns={assignedColumns}
                                keyField="id"
                                selectable={false}
                                selectedIds={[]}
                                onSelectionChange={() => { }}
                            />
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OHSDashboard;
