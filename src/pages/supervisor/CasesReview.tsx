import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';
import { DataTable, type Column } from '../../components/common/DataTable';
import { type Case } from '../../services/cases.service';
import {
    Eye,
    FilePlus,
    Loader2
} from 'lucide-react';
import { STATUS_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS, getStatusLabel } from '../../data/constants';
import { formatCategory } from '../../utils/formatters';
import { useIncidents } from '../../hooks/useIncidents';

const CasesReview: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const {
        data: casesData,
        isLoading: loading,
        error: casesError
    } = useIncidents({
        take: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        categoryId: categoryFilter || undefined,
        priorityLevel: priorityFilter || undefined,
    });

    const cases = casesData?.data || [];
    const totalItems = casesData?.total || 0;
    const error = casesError ? (casesError as any).message || 'Failed to load cases' : null;

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
            cell: (item) => <span className="text-gray-700 font-medium">{formatCategory(item.category || 'N/A')}</span>
        },
        {
            header: 'Priority',
            accessorKey: 'severity',
            sortable: true,
            cell: (item) => {
                const priority = item.severity || 'medium';
                return <Pill label={priority.charAt(0).toUpperCase() + priority.slice(1)} variant={priority.toLowerCase()} />;
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
            header: 'Assigned To',
            cell: (item) => (
                <span className="text-gray-500 text-sm">
                    {item.assignedTo?.name || <span className="text-gray-400 italic">Unassigned</span>}
                </span>
            )
        },
        {
            header: 'Submitted',
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
                    onClick={() => navigate(`/supervisor/cases/${item.id}`)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-light-green text-dark-green text-xs font-bold rounded-lg hover:bg-green/10 transition-colors whitespace-nowrap"
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

    return (
        <DashboardLayout
            title="Cases for Review"
            description="Review and assign cases to practitioners"
            breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "Cases Review" }]}
        >
            <div className="flex flex-col gap-6">
                {/* Top Actions */}
                <div className="flex justify-end">
                    <button
                        onClick={() => navigate('/supervisor/submit-case')}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-green text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm text-sm"
                    >
                        <FilePlus size={16} />
                        Submit New Case
                    </button>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-green animate-spin" />
                        <span className="ml-3 text-gray-600">Loading cases...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <DataTable
                        data={filteredCases}
                        columns={columns}
                        keyField="id"
                        emptyMessage={(searchTerm || statusFilter !== 'all' || categoryFilter || priorityFilter)
                            ? "No cases found matching your criteria."
                            : "No cases found."}
                        selectable={true}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        searchable={true}
                        onSearch={setSearchTerm}
                        searchPlaceholder="Search Cases..."
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
                        filterOptions={
                            <div className="flex gap-2">
                                <Select
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    options={STATUS_FILTER_OPTIONS.filter(o => o.value !== 'RESOLVED')}
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

export default CasesReview;
