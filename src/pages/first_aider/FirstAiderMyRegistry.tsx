import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';
import { DataTable, type Column } from '../../components/common/DataTable';
import { type Case } from '../../services/cases.service';
import { Eye, Loader2, ArrowUpRight, CheckCircle, Folder, X, User, Calendar, Clock, Building2, Activity, Stethoscope, UserCheck } from 'lucide-react';
import { STATUS_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS, getStatusLabel } from '../../data/constants';
import { formatCategory } from '../../utils/formatters';
import { useIncidents } from '../../hooks/useIncidents';
import { useAuthStore } from '../../store/auth.store';
import { getStatusLabel as getLabel } from '../../data/constants';

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
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);

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

    const forwardedCount = cases.filter(c => c.status === 'FORWARDED_TO_OHS_AND_HR').length;
    const closedCount = cases.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED').length;
    const activeCount = cases.filter(c => c.status !== 'CLOSED' && c.status !== 'RESOLVED' && c.status !== 'FORWARDED_TO_OHS_AND_HR').length;

    const getStatusBadgeIcon = (status: string) => {
        if (status === 'FORWARDED_TO_OHS_AND_HR') return <ArrowUpRight size={12} className="text-purple-600" />;
        if (status === 'CLOSED' || status === 'RESOLVED') return <CheckCircle size={12} className="text-green-600" />;
        return <Folder size={12} className="text-gray-500" />;
    };

    const filteredCases = cases.filter(c => {
        const matchesSearch = (
            c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchesSearch;
    });

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
                    onClick={() => setSelectedCase(item)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-light-gold text-brown text-xs font-bold rounded-lg hover:bg-gold/10 transition-colors whitespace-nowrap"
                >
                    <Eye size={14} />
                    View
                </button>
            )
        }
    ];

    return (
        <DashboardLayout
            title="My Registry"
            description="All incidents you have ever handled"
            breadcrumbs={[{ label: 'Dashboard', path: '/first-aider/dashboard' }, { label: 'My Registry' }]}
        >
            <div className="flex flex-col gap-6">

                {/* Page title */}
                <div>
                    <h1 className="text-lg font-bold text-gray-900">OHS My Registry</h1>
                    <p className="text-xs text-gray-500">Inspection Register</p>
                </div>

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
                                    onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                                    options={STATUS_FILTER_OPTIONS}
                                    placeholder="All Status"
                                />
                                <Select
                                    value={categoryFilter}
                                    onChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
                                    options={CATEGORY_FILTER_OPTIONS}
                                    placeholder="All Categories"
                                />
                                <Select
                                    value={priorityFilter}
                                    onChange={(val) => { setPriorityFilter(val); setCurrentPage(1); }}
                                    options={PRIORITY_FILTER_OPTIONS}
                                    placeholder="All Priority"
                                />
                            </div>
                        }
                    />
                )}
            </div>

            {/* ===== View Registry Modal (Screen 17) ===== */}
            {selectedCase && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-gray-900">My Registry – {selectedCase.incidentNumber}</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    {selectedCase.severity && (
                                        <Pill label={selectedCase.severity.charAt(0).toUpperCase() + selectedCase.severity.slice(1).toLowerCase()} variant={selectedCase.severity.toLowerCase()} />
                                    )}
                                    <Pill label={getStatusLabel(selectedCase.status)} variant={selectedCase.status.toLowerCase().replace(/_/g, ' ')} />
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-3">
                            {[
                                { icon: User, label: 'Full Name', value: selectedCase.reportedBy?.name || selectedCase.assignedTo?.name || '—' },
                                { icon: Calendar, label: 'Start Date', value: selectedCase.occurredAt ? new Date(selectedCase.occurredAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date(selectedCase.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
                                { icon: Clock, label: 'Time', value: selectedCase.occurredAt ? new Date(selectedCase.occurredAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—' },
                                { icon: Building2, label: 'Office Name', value: selectedCase.building?.name || '—' },
                                { icon: Activity, label: 'Nature of Injury', value: selectedCase.category ? formatCategory(selectedCase.category) : '—' },
                                { icon: Stethoscope, label: 'Treatment Rendered', value: selectedCase.description ? selectedCase.description.slice(0, 40) + (selectedCase.description.length > 40 ? '...' : '') : '—' },
                                { icon: UserCheck, label: 'Treated By', value: selectedCase.assignedTo?.name || '—' },
                                { icon: Calendar, label: 'Date Resumed Work', value: selectedCase.updatedAt ? new Date(selectedCase.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-2 text-gray-500 shrink-0">
                                        <Icon size={14} className="text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-500">{label}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-800 text-right max-w-[55%] break-words">{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="px-6 py-2 bg-brown hover:bg-opacity-90 text-white rounded-xl text-xs font-bold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default FirstAiderMyRegistry;
