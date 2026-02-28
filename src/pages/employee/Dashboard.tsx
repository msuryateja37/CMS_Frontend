import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeLayout from './components/EmployeeLayout';
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
    AlertCircle
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
            trend: 'from last month',
            icon: FileText,
            color: 'text-green',
            bgColor: 'bg-[#E8F5E9]',
            trendColor: 'bg-[#E6FFFB] text-[#13C2C2]'
        },
        {
            label: 'Pending Actions',
            value: stats.pendingActions.toString(),
            change: stats.pendingActionsChange,
            trend: 'from last month',
            icon: Clock,
            color: 'text-green',
            bgColor: 'bg-[#E8F5E9]',
            trendColor: 'bg-[#F6FFED] text-[#52C41A]'
        },
        {
            label: 'Resolved Cases',
            value: stats.resolvedCases.toString(),
            change: stats.resolvedCasesChange,
            trend: 'from last month',
            icon: CheckCircle,
            color: 'text-green',
            bgColor: 'bg-[#E8F5E9]',
            trendColor: 'bg-[#F6FFED] text-[#52C41A]'
        }
    ] : [];

    // Columns Definition
    const columns: Column<EmployeeCase>[] = [
        {
            header: 'Case ID',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green flex-shrink-0"></div>
                    <span className="text-gray-500 font-medium text-xs">{item.incidentNumber}</span>
                </div>
            )
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-gray-700 font-medium">{formatCategory(item.category || item.type || 'N/A')}</span>
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
                return <Pill label={statusLabel} variant={item.status.toLowerCase().replace(/_/g, ' ')} />;
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
                    className="flex items-center gap-1 px-2 py-1 bg-[#E8F5E9] text-dark-green text-[10px] font-bold rounded-lg hover:bg-green hover:text-white transition-colors border border-green/20"
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
            <EmployeeLayout
                title={`Welcome back, ${firstName}`}
                description="Dashboard"
                breadcrumbs={[{ label: "Dashboard", path: "/employee/dashboard" }, { label: "Overview" }]}
            >
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-green animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading dashboard...</p>
                    </div>
                </div>
            </EmployeeLayout>
        );
    }

    if (error) {
        return (
            <EmployeeLayout
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
                            className="px-4 py-2 bg-green text-white rounded-lg hover:bg-[#2aa88f] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </EmployeeLayout>
        );
    }

    return (
        <EmployeeLayout
            title={`Welcome back, ${firstName}`}
            description="Dashboard"
            breadcrumbs={[{ label: "Dashboard", path: "/employee/dashboard" }, { label: "Overview" }]}
        >
            <div className="flex flex-col gap-8">
                {/* Top Actions Button */}
                <div className="flex justify-end -mt-4 mb-2">
                    <button
                        onClick={() => navigate('/employee/submit-case')}
                        className="flex items-center gap-2 px-4 py-2 bg-green text-white font-bold rounded-lg hover:bg-[#2aa88f] transition-colors shadow-sm text-sm"
                    >
                        <FilePlus size={16} />
                        Submit New Case
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statsConfig.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-40">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <stat.icon className={stat.color} size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-black mb-2">{stat.value}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stat.trendColor}`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-xs text-gray-400">{stat.trend}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Split: Table & Drafts */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: My Cases Table (Approx 2/3 width) */}
                    <div className="flex-1 lg:w-2/3 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-black">My Cases</h2>
                            <button
                                onClick={() => navigate('/employee/my-cases')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#E9E9E9] text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                View All
                                <ChevronDown size={14} />
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

                    {/* Right Column: Saved Drafts (Approx 1/3 width) */}
                    <div className="flex-1 lg:w-1/3 flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-black">Saved Drafts</h2>
                        {drafts.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {drafts.map((draft) => (
                                    <div
                                        key={draft.id}
                                        className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-100 hover:bg-[#F3F4F6] transition-colors cursor-pointer relative group"
                                        onClick={() => navigate('/employee/submit-case', { state: { draft } })}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-black text-sm">{draft.categoryName || 'New Incident'}</div>
                                            <button
                                                onClick={(e) => handleDeleteDraft(draft.id, e)}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                title="Delete draft"
                                            >
                                                <AlertCircle size={14} />
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-600 mb-1">
                                            {draft.description ? (draft.description.substring(0, 50) + (draft.description.length > 50 ? '...' : '')) : 'No description'}
                                        </div>
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Clock size={10} />
                                            Saved {new Date(draft.lastSaved || Date.now()).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#F8F9FA] p-6 rounded-xl border border-gray-100 text-center">
                                <p className="text-sm text-gray-500">No saved drafts</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeDashboard;
