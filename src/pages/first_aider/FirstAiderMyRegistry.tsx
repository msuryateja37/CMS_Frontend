import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';
import { DataTable, type Column } from '../../components/common/DataTable';
import { type Case } from '../../services/cases.service';
import { Eye, Loader2, ArrowUpRight, CheckCircle, Folder } from 'lucide-react';
import { STATUS_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS, getStatusLabel } from '../../data/constants';
import { formatCategory } from '../../utils/formatters';
import { useIncidents } from '../../hooks/useIncidents';
import { useAuthStore } from '../../store/auth.store';

const hrStatusLabel: Record<string, string> = {
    HR_UNASSIGNED: 'HR Unassigned',
    HR_ASSIGNED: 'HR Assigned',
    HR_UNDER_REVIEW: 'HR Under Review',
    HR_APPROVED: 'HR Approved',
};

const hrStatusColor: Record<string, string> = {
    HR_UNASSIGNED: 'bg-gray-100 text-gray-600',
    HR_ASSIGNED: 'bg-blue-100 text-blue-700',
    HR_UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    HR_APPROVED: 'bg-green-100 text-green-700',
};

const FirstAiderMyRegistry: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch ALL incidents ever assigned to this first aider (no status filter by default)
    // assignedToId covers historical assignments via IncidentAssignment records
    const {
        data: casesData,
        isLoading: loading,
        error: casesError
    } = useIncidents({
        assignedToId: user?.id,
        take: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        categoryId: categoryFilter || undefined,
        priorityLevel: priorityFilter || undefined,
    });

    const cases = casesData?.data || [];
    const totalItems = casesData?.total || 0;
    const error = casesError ? (casesError as any).message || 'Failed to load registry' : null;

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };

    const handleCategoryFilterChange = (val: string) => {
        setCategoryFilter(val);
        setCurrentPage(1);
    };

    const handlePriorityFilterChange = (val: string) => {
        setPriorityFilter(val);
        setCurrentPage(1);
    };

    const getStatusBadgeIcon = (status: string) => {
        if (status === 'FORWARDED_TO_OHS_AND_HR') return <ArrowUpRight size={12} className="text-purple-600" />;
        if (status === 'CLOSED' || status === 'RESOLVED') return <CheckCircle size={12} className="text-green-600" />;
        return <Folder size={12} className="text-gray-500" />;
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
            cell: (item) => (
                <div className="flex items-center gap-1.5">
                    {getStatusBadgeIcon(item.status)}
                    <Pill label={getStatusLabel(item.status)} variant={item.status.toLowerCase().replace(/_/g, ' ')} />
                </div>
            )
        },
        {
            header: 'HR Track',
            cell: (item) => {
                const hrStatus = (item as any).hrStatus as string | undefined;
                if (!hrStatus) return <span className="text-gray-300 text-xs">—</span>;
                return (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hrStatusColor[hrStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                        {hrStatusLabel[hrStatus] ?? hrStatus}
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
                    {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: (item) => (
                <button
                    onClick={() => navigate(`/first-aider/cases/${item.id}`)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-light-gold text-brown text-xs font-bold rounded-lg hover:bg-gold/10 transition-colors whitespace-nowrap"
                >
                    <Eye size={14} />
                    View
                </button>
            )
        }
    ];

    const filteredCases = cases.filter(c => {
        const matchesSearch = (
            c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchesSearch;
    });

    // Stats for the summary bar
    const forwardedCount = cases.filter(c => c.status === 'FORWARDED_TO_OHS_AND_HR').length;
    const closedCount = cases.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED').length;
    const activeCount = cases.filter(c => c.status !== 'CLOSED' && c.status !== 'RESOLVED' && c.status !== 'FORWARDED_TO_OHS_AND_HR').length;

    return (
        <DashboardLayout
            title="My Registry"
            description="All incidents you have ever handled — including those forwarded to OHS & HR and closed ones"
            breadcrumbs={[{ label: "Dashboard", path: "/first-aider/dashboard" }, { label: "My Registry" }]}
        >
            <div className="flex flex-col gap-6">

                {/* Summary Stats */}
                {!loading && !error && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                                <Folder size={18} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active</p>
                                <p className="text-xl font-bold text-gray-900">{activeCount}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                                <ArrowUpRight size={18} className="text-purple-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Forwarded to OHS & HR</p>
                                <p className="text-xl font-bold text-gray-900">{forwardedCount}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                                <CheckCircle size={18} className="text-green-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Closed</p>
                                <p className="text-xl font-bold text-gray-900">{closedCount}</p>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-gold animate-spin" />
                        <span className="ml-3 text-gray-600">Loading registry...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
                )}

                {!loading && !error && (
                    <DataTable
                        data={filteredCases}
                        columns={columns}
                        keyField="id"
                        selectable={false}
                        selectedIds={[]}
                        onSelectionChange={() => { }}
                        searchable={true}
                        onSearch={setSearchTerm}
                        searchPlaceholder="Search registry by ID, category or description..."
                        filterable={true}
                        totalItems={totalItems}
                        paginatable={true}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                        totalPages={Math.ceil(totalItems / itemsPerPage)}
                        emptyMessage={searchTerm || statusFilter !== 'all' || categoryFilter || priorityFilter
                            ? 'No incidents found matching your criteria.'
                            : 'No incidents in your registry yet.'}
                        filterOptions={
                            <div className="flex gap-2">
                                <Select
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    options={STATUS_FILTER_OPTIONS}
                                    placeholder="Status"
                                />
                                <Select
                                    value={categoryFilter}
                                    onChange={handleCategoryFilterChange}
                                    options={CATEGORY_FILTER_OPTIONS}
                                    placeholder="Category"
                                />
                                <Select
                                    value={priorityFilter}
                                    onChange={handlePriorityFilterChange}
                                    options={PRIORITY_FILTER_OPTIONS}
                                    placeholder="Priority"
                                />
                            </div>
                        }
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default FirstAiderMyRegistry;
