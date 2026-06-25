import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import { type EmployeeCase } from '../../services/employeeService';
import { useEmployeeStats, useMyCases } from '../../hooks/useEmployee';
import {
    FileText,
    Clock,
    CheckCircle,
    FilePlus,
    Eye,
    ChevronDown,
    Loader2,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { formatCategory } from '../../utils/formatters';
import { useAuthStore } from '../../store/auth.store';

const EmployeeDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const firstName = user?.fullName?.split(' ')[0] || user?.firstName || 'User';

    // Use custom hooks for data fetching
    const { data: stats, isLoading: statsLoading, error: statsError } = useEmployeeStats();
    const { data: casesData, isLoading: casesLoading, error: casesError } = useMyCases({ take: 5 });

    // Local state for drafts (remains UI state)
    const [drafts, setDrafts] = useState<any[]>([]);

    useEffect(() => {
        const storedDrafts = JSON.parse(localStorage.getItem('incident_drafts') || '[]');
        setDrafts(storedDrafts);
    }, []);

    const loading = statsLoading || casesLoading;
    const error = statsError || casesError;
    const cases = casesData?.data || [];

    const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this draft?')) {
            const updatedDrafts = drafts.filter(d => d.id !== id);
            setDrafts(updatedDrafts);
            localStorage.setItem('incident_drafts', JSON.stringify(updatedDrafts));
        }
    };

    // Stats Configuration
    const statsConfig = stats ? [
        {
            label: 'My Active Cases',
            value: stats.activeCases.toString(),
            change: stats.activeCasesChange,
            icon: FileText,
            color: 'text-gold-600',
            bgColor: 'bg-gold-50',
            trendColor: 'bg-gold-100/50 text-gold-700'
        },
        {
            label: 'Pending Actions',
            value: stats.pendingActions.toString(),
            change: stats.pendingActionsChange,
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            trendColor: 'bg-amber-100/50 text-amber-700'
        },
        {
            label: 'Resolved Cases',
            value: stats.resolvedCases.toString(),
            change: stats.resolvedCasesChange,
            icon: CheckCircle,
            color: 'text-gold-600',
            bgColor: 'bg-gold-50',
            trendColor: 'bg-gold-100/50 text-gold-700'
        }
    ] : [];

    // Columns Definition
    const columns: Column<EmployeeCase>[] = [
        {
            header: 'Case ID',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => (
                <span className="font-mono text-sm font-medium text-gray-600 whitespace-nowrap">{item.incidentNumber}</span>
            )
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-gray-700 font-medium text-xs whitespace-nowrap">{formatCategory(item.category || item.type || 'N/A')}</span>
        },
        {
            header: 'Priority',
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
                const statusLabel = getStatusLabel(item.status);
                return <Pill label={statusLabel.toUpperCase()} variant={item.status.toLowerCase().replace(/_/g, ' ')} />;
            }
        },
        /* {
            header: 'SLA',
            cell: () => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-700">On Track</span>
                    <span className="text-[9px] text-gray-400">(12d left)</span>
                </div>
            )
        }, */
        {
            header: '',
            cell: (item) => (
                <button
                    onClick={() => navigate(`/employee/my-cases/${item.id}`)}
                    className="flex items-center gap-1 px-2 py-1 bg-[#E8F5E9] text-brown text-[10px] font-bold rounded-lg hover:bg-gold hover:text-white transition-colors border border-gold/20"
                >
                    <Eye size={12} />
                    View
                    <ChevronDown size={12} className="-rotate-90" />
                </button>
            )
        }
    ];

    if (loading) {
        return (
            <DashboardLayout
                title={`Welcome back, ${firstName}`}
                description="Dashboard"
                breadcrumbs={[{ label: "Dashboard", path: "/employee/dashboard" }, { label: "Overview" }]}
            >
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout
                title={`Welcome back, ${firstName}`}
                description="Dashboard"
                breadcrumbs={[{ label: "Dashboard", path: "/employee/dashboard" }, { label: "Overview" }]}
            >
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-700 font-medium mb-2">Failed to load dashboard</p>
                        <p className="text-gray-500 text-sm mb-4">{(error as any)?.message || 'Unknown error'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-[#A1743E] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title={`Welcome back, ${firstName}`}
            description="Dashboard"
            breadcrumbs={[{ label: "Dashboard", path: "/employee/dashboard" }, { label: "Overview" }]}
        >
            <div className="flex flex-col gap-6">
                {/* Top Actions Button */}
                <div className="flex justify-end mb-1">
                   <button
                        onClick={() => navigate('/employee/submit-case')}
                        className="flex items-center gap-2 px-4 py-2 bg-brown text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm text-sm"
                    >
                        <FilePlus size={16} />
                        Submit New Case
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {statsConfig.map((stat, index) => (
                        <div key={index} className="bg-white py-3.5 px-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor}`}>
                                <stat.icon className={stat.color} size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5 leading-none">{stat.label}</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</span>
                                    {stat.change !== '0%' && (
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold leading-none ${stat.trendColor}`}>
                                            {stat.change}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Split: Table & Drafts */}
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                    {/* Left Column: My Cases Table (Approx 3/4 width) */}
                    <div className="w-full lg:flex-[3] flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-black">My Cases</h2>
                            <button
                                onClick={() => navigate('/employee/my-cases')}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E9E9E9] text-gray-600 text-[11px] font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                View All
                                <ChevronDown size={12} />
                            </button>
                        </div>

                        <DataTable
                            data={cases}
                            columns={columns}
                            keyField="id"
                            selectable={true}
                            paginatable={false}
                            searchable={false}
                            filterable={false}
                            emptyMessage="No cases found. Submit your first case to get started."
                        />
                    </div>

                    {/* Right Column: Saved Drafts (Approx 1/4 width with border box) */}
                    <div className="w-full lg:flex-[1] flex flex-col gap-3">
                        <h2 className="text-base font-bold text-black">Saved Drafts</h2>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1 min-h-[240px] flex flex-col">
                            {drafts.length > 0 ? (
                                <div className="flex flex-col gap-3 overflow-y-auto max-h-[360px] pr-0.5 custom-scrollbar">
                                    {drafts.map((draft) => (
                                        <div
                                            key={draft.id}
                                            className="bg-subtle-grey p-3 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer relative group flex flex-col"
                                            onClick={() => navigate('/employee/submit-case', { state: { draft } })}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="font-bold text-black text-xs truncate max-w-[80%]">
                                                    {draft.categoryName || 'New Incident'}
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteDraft(draft.id, e)}
                                                    className="text-gray-400 hover:text-red transition-all p-1"
                                                    title="Delete draft"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <div className="text-[11px] text-gray-500 mb-1.5 line-clamp-2">
                                                {draft.description ? draft.description : 'No description'}
                                            </div>
                                            <div className="text-[9px] text-gray-400 flex items-center gap-1 mt-auto">
                                                <Clock size={9} />
                                                Saved {new Date(draft.lastSaved || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 my-auto">
                                    <p className="text-xs text-gray-400 font-medium">No saved drafts</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployeeDashboard;
